var rawWheelsModels = ModelManager.loadPartedRawModel(Resources.manager(), Resources.id("mtr:k9ka/model/wheels.obj"), null);
var rawWheelsClusters = new Map();
var wheelRadius = new Array(3).fill(1.13665 / 2);
for (let [key, model] of rawWheelsModels) {
	let tempModel = model.copy();
	tempModel.applyUVMirror(false, true);
	let modelCluster = ModelManager.uploadVertArrays(tempModel);
	rawWheelsClusters.set(key + "", modelCluster);
}
var wheelsPosition = [
	new Vector3f(1.18998, -0.841317 + 0.375, 3.38363),
	new Vector3f(-1.18998, -0.841317 + 0.375, 3.38363),
	new Vector3f(0, -0.841317 + 0.375, -2.76084)
]; //left,right,rear
function create(ctx, state, train) {
	state.distanceLast = train.railProgress();
	state.wheelsRotationDistance = 0;
	let keys = ["left", "right", "rear"];
	for (let i = 0; i < train.trainCars(); i++) {
		let carIndex = i,
			drawCalls = ctx.drawCalls[carIndex];
		for (let j = 0; j <= keys.length - 1; j++) {
			let currentIndex = j,
				key = keys[currentIndex];
			let commit = (drawScheduler, basePose, worldPose, light) => {
				try {
					const model = rawWheelsClusters.get(key); //先载入模型
					//获取train相对于world的矩阵(即正常情况下的train.lastWorldPose)
					let m_object_camera = basePose.copy(),
						m_world_camera = worldPose,
						m_camera_world = reserveMatrix4f(m_world_camera.copy()),
						m_object_world = m_camera_world.copy();
					m_object_world.multiply(m_object_camera); //等效于train.lastWorldPose[carIndex]
					let poseCollection = [basePose.copy(), worldPose.copy()],
						posCollection = [wheelsPosition[currentIndex].copy(), m_object_world.transform(wheelsPosition[currentIndex])];
					let turingRad = getTuringRad(train, carIndex, -7, 1, 0);
					poseCollection.forEach((value, index) => {
						value.translate(posCollection[index]);
						index == 1 ? value.rotateY(turingRad.y()) : undefined;
						value.rotateX(state.wheelsRotationDistance / wheelRadius[currentIndex]);
					});
					drawScheduler.enqueue(model, key == "rear" ? poseCollection[0] : poseCollection[1], light);
					//添加到渲染队列，因为后轮不需要y轴旋转所以不用使用绝对矩阵
				} catch (error) {
					ctx.setDebugInfo("Failed to set up commit", `${error.message} (#${error.lineNumber})`);
				}
			};
			drawCalls.put(key, new DrawCall({ commit }));
		}
	}
}
function render(ctx, state, train) {
	//---轮子滚动部分---//
	state.distanceNow = train.railProgress();
	state.wheelsRotationDistance += ((state.distanceNow - state.distanceLast) % train.spacing()) * (train.isReversed() ? -1 : 1);
	state.distanceLast = state.distanceNow;
	//---轮子滚动部分---//
}
function getTuringRad(train, carIndex, offsetEnd, offsetStart, totalOffset) {
	//offsetEnd:后点移动;offsetStart:前点移动;totalOffset:两点同时移动
	//最大转向角似乎是offsetEnd,offsetStart比例？
	let pointCollection = [];
	carIndex = train.isReversed() ? train.trainCars() - carIndex : carIndex;
	for (let i = 0; i <= 2; i++) {
		let offset = ((i ? offsetEnd : offsetStart) + totalOffset) * (train.isReversed() ? -1 : 1);
		//            |计算两点独立偏移| |总体偏移|//
		//两点偏移(PointEnd的绝对值要大于PointStart，确保PointEnd永远在PointStart后面)
		let targetProgress = train.getRailProgress(carIndex) + offset;
		let absolutePos = getRailPosition(targetProgress, train);
		pointCollection.push(absolutePos);
	}
	let pointStart = pointCollection.shift(),
		pointEnd = pointCollection.pop();
	let pointSub = pointStart.copy();
	pointSub.sub(pointEnd);
	return new Vector3f(0, Math.atan2(pointSub.x(), pointSub.z()), 0);
}
function getRailPosition(railProgress, train) {
	let PathLength = [],
		railIndex = train.getRailIndex(railProgress, false);
	for (let i = 0; i < railIndex; i++) PathLength.push(train.path()[i].rail.getLength());
	while (PathLength.length != 0) railProgress -= PathLength.pop();
	return new Vector3f(train.path()[railIndex].rail.getPosition(railProgress));
}
function reserveVector3f(v) {
	return new Vector3f(-v.x(), -v.y(), -v.z());
}
function reserveMatrix4f(m) {
	let tm = m.asMoj(); //tempMatrix
	if (tm.getClass().getName() + "" == "net.minecraft.class_1159") {
		//net.minecraft.class_1159:com.mojang.math.Matrix4f
		let im = tm.method_22673(); //im:invertMatrix method_22673:copy()
		im.method_22870(); //method_22870:invert()
		return new Matrix4f(im);
	} else {
		im = tm.invert(); //org.joml.Matrix4f;
		return new Matrix4f(im);
	}
}

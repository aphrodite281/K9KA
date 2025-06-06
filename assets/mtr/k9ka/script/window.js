const WindowModel = ModelManager.loadPartedRawModel(Resources.manager(), Resources.id("mtr:k9ka/model/windows.obj"), null);
const partList = ["fixation", "movable_L1", "movable_L2", "movable_L3", "movable_R1", "movable_R2"];
const windowsNumber = 5;
const windowsPosition = [
	new Vector3f(1.24129, 0.519896, 5.71871),
	new Vector3f(1.24129, 0.465094, 1.29973),
	new Vector3f(1.24129, 0.679475, -4.92101),
	new Vector3f(-1.24129, 0.465094, 1.29973),
	new Vector3f(-1.24129, 0.679475, -4.92101)
];
const movingRange = [-0.540833, 0.54328, 0.6844, 0.60328, 0.6844];
var partedModel = new Map();
for (let i of partList) {
	partedModel.set(i, ModelManager.uploadVertArrays(WindowModel.get(i)));
}
function create(ctx, state, train) {
	state.windowsStatus = new Array(train.trainCars()).fill(new Array(windowsNumber))
	state.windowsWorldPose = new Array(train.trainCars()).fill(new Array(windowsNumber));
	state.windowsRelativePose = new Array(train.trainCars()).fill(new Array(windowsNumber));
	for (let i = 0; i < train.trainCars(); i++) {
		for (let j = 0; j < windowsNumber; j++) {
			state.windowsStatus[i][j] = new StateTracker();
			state.windowsStatus[i][j].setState("close");
		}
	}
} //prettier-ignore
function render(ctx, state, train) {
	let CameraPosition = MinecraftClient.getCameraPos(); //Vector3f
	let additiveCameraPosition = new Matrix4f();
	additiveCameraPosition.translate(-CameraPosition.x(), -CameraPosition.y(), -CameraPosition.z());
	//---------
	let matrices = state.matrices;
	//---------//
	//prettier-ignore
	for (let i = 0; i < train.trainCars(); i++) {
		for (let j = 0; j < windowsNumber; j++) {
			let CameraAngle = MinecraftClient.getCameraEntity().getLookAngle(),
				StatusNow = state.windowsStatus[i][j];
			//---------//
			matrices.pushPose();
			switch (StatusNow.stateNow()+"") {
				case "opening":
					var windowValue = Math.min(1, StatusNow.stateNowDuration());
					break;
				case "closing":
					var windowValue = Math.max(0, 1 - StatusNow.stateNowDuration());
					break;
				case "open" :
					var windowValue = 1;
					break
				case "preClose":
					var windowValue = 1;
					break
				default:
					var windowValue = 0;
			}
			let windowZTranslate = SmoothValue(0, movingRange[j], 0, 1, windowValue)
			matrices.translate(0,0,windowZTranslate)
			let tempMatrix = train.lastWorldPose[i].copy();
			tempMatrix.multiply(matrices.last().copy());
			let windowWorldPose = tempMatrix.transform(windowsPosition[j]);
			state.windowsRelativePose[i][j] = additiveCameraPosition.transform(windowWorldPose);
			//---------//
			//计算摄像机相对位置，利用列车矩阵得出窗户绝对位置，再用摄像机矩阵反向变换为相对位置
			let length = CameraPosition.distance(windowWorldPose),
				VectorX = state.windowsRelativePose[i][j].x() / length,
				VectorY = state.windowsRelativePose[i][j].y() / length,
				VectorZ = state.windowsRelativePose[i][j].z() / length,
				TargetVector = new Vector3f(VectorX, VectorY, VectorZ)
				windowLooking = isLooking(CameraAngle, TargetVector, 0.07 / length);
				//以上为坐标以及视角计算
			let DebugTags = [
					"Movable_",
					j > 2 ? "R" : "L",
					j > 2 ? (j - 2).toString() : (j + 1).toString()
				],
				DebugKey = DebugTags.join("");
			if (windowLooking && length <= 1.5 && train.isClientPlayerRiding()) {
				switch (StatusNow.stateNow() + "") {
					case "close":
						StatusNow.setState("preOpen");
						break;
					case "open":
						StatusNow.setState("preClose");
						break;
					case "preClose":
						StatusNow.stateNowDuration() >= 1
							? StatusNow.setState("closing")
							: null;
					case "preOpen":
						StatusNow.stateNowDuration() >= 1
							? StatusNow.setState("opening")
							: null;
				}
			} else if (!windowLooking || !(length != 1.5) || !train.isClientPlayerRiding()) {
				StatusNow.stateNow() == "preOpen"
					? StatusNow.setState("close")
					: StatusNow.stateNow() == "preClose"
					? StatusNow.setState("open")
					: null;
			}
			if ((StatusNow.stateNow() == "closing" || StatusNow.stateNow() == "opening") && StatusNow.stateNowDuration() >= 1) {
				StatusNow.stateNow() == "opening"
					? StatusNow.setState("open")
					: StatusNow.setState("close");
			}
			matrices.translate(
				windowsPosition[j].x(),
				windowsPosition[j].y(),
				windowsPosition[j].z()
			);//渲染偏移
			ctx.drawCarModel(partedModel.get(partList[j + 1]), i, matrices);
			matrices.popPose();
		}
		ctx.drawCarModel(partedModel.get("fixation"), i, matrices);
		}
}
/**
 * 用来计算视线是否看着某点
 * @param {Vector3f} A 摄像机角度，可通过MinecraftClient.getCameraEntity().getLookAngle()获取
 * @param {Vector3f} B 看向的点
 * @param {number} tolerance 0-1
 */
function isLooking(A, B, tolerance) {
	let [Ax, Ay, Az, Bx, By, Bz] = [A.x(), A.y(), A.z(), B.x(), B.y(), B.z()];
	[x, y, z] = [isInTolerance(Ax, Bx, tolerance), isInTolerance(Ay, By, tolerance), isInTolerance(Az, Bz, tolerance)];
	return x && y && z;
}
function isInTolerance(value, targetValue, tolerance) {
	maxValue = targetValue + tolerance;
	minValue = targetValue - tolerance;
	return value <= maxValue && value >= minValue;
}
function SmoothValue(startValue, endValue, startTime, endTime, time) {
	let time_mod = Math.max(startTime, time);
	time_mod = Math.min(endTime, time_mod);
	let timeChange = endTime - startTime;
	let valueChange = endValue - startValue;
	return time * (valueChange / timeChange) + startValue;
}

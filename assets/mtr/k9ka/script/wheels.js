importPackage(java.net.minecraft.world.phys.Vec3);

let rawWheelModels = ModelManager.loadPartedRawModel(Resources.manager(), Resources.id("mtr:k9ka/model/wheels.obj"), null);
var wheelModels = uploadPartedModels(rawWheelModels);
let rawSteeringModel = ModelManager.loadRawModel(Resources.manager(), Resources.id("mtr:k9ka/model/steering.obj"), null);
var steeringModel = ModelManager.uploadVertArrays(rawSteeringModel);
let cube1 = ModelManager.uploadVertArrays(ModelManager.loadRawModel(Resources.manager(), Resources.id("mtr:k9ka/model/cube1.obj"), null));
let cube2 = ModelManager.uploadVertArrays(ModelManager.loadRawModel(Resources.manager(), Resources.id("mtr:k9ka/model/cube2.obj"), null));

var wheelRadius = 1.13665/2;
var rearWheelPos = {x:0, y:-0.841317, z:-2.76084};
var anteriorWheelPos = {x:1.18998, y:-0.841317, z:3.38363};
var steeringPos = {x:0.572652, y:-0.008049, z:5.3503};
var steeringRot = {x:-55.231, y:Math.PI, z:0};
var anteriorWheelDPos = 6-anteriorWheelPos.z;

//----------

function create(ctx, state, train){
	state.radian = 0;
	state.wheelRot = new Array();
	state.matrices = new Matrices();
    state.matrices.translate(0,0.5,0);
}

//----------

function render(ctx, state, train){
	state.wheelRot = new Array();
	for(let i=0; i<train.trainCars();i++){
		state.wheelRot.push(getSwerveRadian(train,i));
	}
	state.radian += (train.isReversed()? -1: 1) * Timing.delta() * train.speed() * 20 / wheelRadius;
	let matrices = state.matrices;
	matrices.pushPose();
	matrices.translate(rearWheelPos.x, rearWheelPos.y, rearWheelPos.z);
	matrices.rotateX(state.radian);
	for(let i=0; i<train.trainCars();i++){
		ctx.drawCarModel(wheelModels["rear"],i,matrices)
	}
	matrices.popPose();

	for(let i=0; i<train.trainCars();i++){
		for(let j=0; j<2;j++){
			matrices.pushPose();
			matrices.translate((j? 1: -1)*anteriorWheelPos.x, anteriorWheelPos.y, anteriorWheelPos.z);
			matrices.rotateY(state.wheelRot[i]);
			matrices.rotateX(state.radian);
			ctx.drawCarModel(wheelModels[j?"right":"left"],i,matrices);
			matrices.popPose();
		}
		matrices.pushPose();
		matrices.translate(steeringPos.x, steeringPos.y, steeringPos.z);
		matrices.rotateY(steeringRot.y);
		matrices.rotateX(steeringRot.x);
		matrices.rotateZ(steeringRot.z);
		matrices.rotateY(state.wheelRot[i]*15);
		ctx.drawCarModel(steeringModel,i,matrices);
		matrices.popPose();
	}
}

//----------

function uploadPartedModels(rawModels) {
    let result = {};
    for (it = rawModels.entrySet().iterator(); it.hasNext(); ) {
      entry = it.next();
      entry.getValue().applyUVMirror(false, true);
      result[entry.getKey()] = ModelManager.uploadVertArrays(entry.getValue());
    }
	return result;
}

function getSwerveRadian(train,carIndex){
	let vectors = [];
	for(let i=0; i<2;i++){
		let rawValue = train.getRailProgress(train.isReversed()? train.trainCars()-carIndex: carIndex) - (train.isReversed()? -1: 1) * 1 + (train.isReversed()? 1: -1) * (i? 1: -1) * 0.05; //- (train.isReversed()? -1: 1) * anteriorWheelDPos;
		let railIndex = train.getRailIndex(rawValue,false);
		let pathDatas = train.path();
		let pathData = pathDatas[railIndex];
		let rail = pathData.rail;
		let lengths = getLengths(pathDatas);
		let railValue = rawValue - (railIndex>0? lengths[railIndex-1]: 0);
		let vec = toVector3f(rail.getPosition(railValue));
		vectors.push(vec);
	}
	let vector = vectors[1].copy();
	vector.sub(vectors[0]);
	let rawRadius = Math.atan2(vector.x(), vector.z())+Math.PI;
	let radian =  rawRadius - train.lastCarRotation[carIndex].y();
	return radian;
}

function toVector3f(vec3){
	let str = vec3.toString();
	let cleanStr = str.slice(1, -1);
	let coords = cleanStr.split(',');
	let x = parseFloat(coords[0].trim());
	let y = parseFloat(coords[1].trim());
	let z = parseFloat(coords[2].trim());	
	return new Vector3f(x, y, z);
}

function getWorldPosition(localPosition, trainPosition, trainRotation){
    let matrix4f = new Matrix4f();

    matrix4f.rotateX(trainRotation.x());
    matrix4f.rotateY(trainRotation.y());
    matrix4f.rotateZ(trainRotation.z());

    matrix4f.translate(localPosition.x(),localPosition.y(),localPosition.z());

	let result = matrix4f.getTranslationPart();
	result.add(trainPosition);
    return result;
}

function getTrainMatrix(worldPosition, trainPosition, trainRotation){
	let matrix4f = new Matrix4f();

	matrix4f.rotateX(-trainRotation.x());
	matrix4f.rotateY(-trainRotation.y());
	matrix4f.rotateZ(-trainRotation.z());

	matrix4f.translate(worldPosition.x()-trainPosition.x(),worldPosition.y()-trainPosition.y(),worldPosition.z()-trainPosition.z());

	return matrix4f;
}

function getTrainPosition(worldPosition, trainPosition, trainRotation){
	let matrix4f = new Matrix4f();
	
	matrix4f.rotateX(-trainRotation.x());
	matrix4f.rotateY(-trainRotation.y());
	matrix4f.rotateZ(-trainRotation.z());

	matrix4f.translate(trainPosition.x()-worldPosition.x(),trainPosition.y()-worldPosition.y(),trainPosition.z()-worldPosition.z());

    return matrix4f.getTranslationPart();
}

function getLengths(pathDatas){
	let result = new Array();
	let length = 0;
	for(let i=0; i<pathDatas.length; i++){
		result.push(length += pathDatas[i].rail.getLength());
	}
	return result;
}

function Vector3ftoSrting(Vector3f){
	return "("+Vector3f.x()+","+Vector3f.y()+","+Vector3f.z()+")";
}
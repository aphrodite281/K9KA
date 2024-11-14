let rawWiperModels = ModelManager.loadPartedRawModel(Resources.manager(), Resources.id("mtr:k9ka/model/wipers.obj"), null);
var wiperModels = uploadPartedModels(rawWiperModels);

const wiperPos = [{x:0.932912, z:6.13721, y:-0.128518}, {x:-0.932911, z:6.13721, y:-0.128518}];
const rotDir = [-1, 1];
const maxRot = Math.PI/2;
const minRot = 0;
const speed = 1.5;
const rainRailKeys = ["no_rainy", "rainy"];

//----------

function create(ctx, state, train) {
    state.wiperRot = [];
    state.wiperRotEnd = [];
    state.wiperRotStart = [];
    state.wiperTimeStart = [];
    state.wiperTimeEnd = [];
    for(let i=0; i<train.trainCars(); i++){
        state.wiperRot[i] = 0; 
        state.wiperRotStart[i] = 0; 
        state.wiperRotEnd[i] = 0; 
        state.wiperTimeStart[i] = 0; 
        state.wiperTimeEnd[i] = 0; 
    }
}

//----------

function render(ctx, state, train) {
    let matrices = new Matrices();
    matrices.translate(0, 0.5, 0)
    for(let i=0; i<train.trainCars(); i++){
        state.wiperRot[i] = smoothEnds(state.wiperRotStart[i], state.wiperRotEnd[i], state.wiperTimeStart[i], state.wiperTimeEnd[i], Timing.elapsed());

        if(isRaining(train, i) && state.wiperRot[i] == minRot && state.wiperRotEnd[i] == minRot){
            state.wiperRotStart[i] = minRot;
            state.wiperRotEnd[i] = maxRot;
            state.wiperTimeStart[i] = Timing.elapsed();
            state.wiperTimeEnd[i] = Timing.elapsed() + speed;
        }else if(isRaining(train, i) && state.wiperRot[i] == maxRot && state.wiperRotEnd[i] == maxRot){
            state.wiperRotStart[i] = maxRot;
            state.wiperRotEnd[i] = minRot;
            state.wiperTimeStart[i] = Timing.elapsed();
            state.wiperTimeEnd[i] = Timing.elapsed() + speed;
        }else if(!isRaining(train, i) && state.wiperRot[i] == maxRot && state.wiperRotEnd[i] == maxRot){
            state.wiperRotStart[i] = maxRot;
            state.wiperRotEnd[i] = minRot;
            state.wiperTimeStart[i] = Timing.elapsed();
            state.wiperTimeEnd[i] = Timing.elapsed() + speed;
        }

        for(let j=0; j<2; j++){
            matrices.pushPose();
            matrices.translate(wiperPos[j].x, wiperPos[j].y, wiperPos[j].z);
            matrices.rotateZ(rotDir[j]*state.wiperRot[i]);
            ctx.drawCarModel(wiperModels[(j? "wiper2": "wiper1")], i, matrices);
            matrices.popPose();
        }
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

function smoothEnds(startValue, endValue, startTime, endTime, time) {
    if (time < startTime) return startValue;
    if (time > endTime) return endValue;
    let timeChange = endTime - startTime;
    let valueChange = endValue - startValue;
    return valueChange * (1 - Math.cos(Math.PI * (time - startTime) / timeChange)) / 2 + startValue;
}

function isRaining(train, carIndex){
    if(!train.isOnRoute()){
        return false;
    }
    let pos1 = getWorldPosition(new Vector3f(1,2,wiperPos[0].z), train.lastCarPosition[carIndex], train.lastCarRotation[carIndex]);
    let pos2 = getWorldPosition(new Vector3f(0,2,wiperPos[0].z), train.lastCarPosition[carIndex], train.lastCarRotation[carIndex]);
    let pos3 = getWorldPosition(new Vector3f(1,2,wiperPos[1].z), train.lastCarPosition[carIndex], train.lastCarRotation[carIndex]);
    for (let i = 0; i < rainRailKeys.length; i++) {
        if(getModelKey(train, carIndex).includes(rainRailKeys[i])){
            return i==1; 
        }     
    }
    return MinecraftClient.worldIsRainingAt(pos1) || MinecraftClient.worldIsRainingAt(pos2) || MinecraftClient.worldIsRainingAt(pos3);
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

function getModelKey(train, carIndex){
    let railProgress = train.getRailProgress(carIndex);
	let railIndex = train.getRailIndex(railProgress,true); 
	let pathDatas = train.path();
	let pathData = pathDatas[railIndex];
	let rail = pathData.rail;
    let name = rail.getModelKey();
    return name+"";
}
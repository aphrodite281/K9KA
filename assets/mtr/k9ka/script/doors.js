let rawDoorModels = ModelManager.loadPartedRawModel(Resources.manager(), Resources.id("mtr:k9ka/model/doors.obj"), null);
var doorModels = uploadPartedModels(rawDoorModels);
var doorFZ = 0.725842-0.025, rodFZ = doorFZ/2;
var doorRZ = 0.694338, rodRZ = doorRZ/2;
var doorPosition = [{x:-1.25166, y:-1.04085, z:-1.04042}, {x:-1.25166, y:-1.04085, z:5.11231-0.05}];
for(let key in doorModels){
    setupDoorGlass(doorModels[key]);
}
const doorOpenSound = Resources.id("mtr:k9ka.door.open");
const doorCloseSound = Resources.id("mtr:k9ka.door.close");
const doorTime = 0.3

//----------

function create(ctx, state, train){
	state.matrices = new Matrices();
    state.matrices.translate(0,0.5,0);
    state.doorValue = 0;
    state.dir=0;
    state.close = false;
}

//----------

function render(ctx, state, train){
    let dir;
    if(state.doorValue-train.doorValue()>0){
        dir = -1;
    }else if(state.doorValue-train.doorValue()<0){
        dir = 1;
    }else{
        dir = 0;
    }
    state.doorValue = train.doorValue();
    if(dir!=state.dir){
        state.dir = dir;
        if(dir==1&&train.doorValue()<doorTime){
            for(let i = 0; i < train.trainCars(); i++){
                ctx.playCarSound(doorOpenSound, i , 0, 0, 0, 1, 1+Math.random()*0.2-0.1);
            }
        }else if(dir==-1){
            state.close = true; 
        }
    }
    if(state.close&&train.doorValue()<doorTime+0.1){
        state.close = false;
        for(let i = 0; i < train.trainCars(); i++){
            ctx.playCarSound(doorCloseSound, i , 0, 0, 0, 1, 1+Math.random()*0.2-0.1);
        }
    }
    let matrices = state.matrices;
    let rodRY = smoothEnds(0, Math.PI / 2, 0, doorTime, train.doorValue());
    for(let i = 0; i < 2; i++){
        matrices.pushPose();
        matrices.translate(doorPosition[i].x, doorPosition[i].y, doorPosition[i].z);
        for(let j = 0; j < 2; j++){
            matrices.pushPose();
            matrices.translate(0, 0, (i?doorFZ:doorRZ)*(j?1:-1));
            matrices.rotateY(j?-rodRY:rodRY);
            matrices.translate(0, 0, (i?rodFZ:rodRZ)*(j?-1:1));
            matrices.rotateY(j?rodRY*2:rodRY*-2)
            for(let k = 0; k < train.trainCars(); k++){
                ctx.drawCarModel(doorModels[(i?"front":"rear")+(j?"Left":"Right")], k, matrices);
            }
            matrices.popPose();
        }
        matrices.popPose();
    }
}

//----------

function smoothEnds(startValue, endValue, startTime, endTime, time) {
    if (time < startTime) return startValue;
    if (time > endTime) return endValue;
    let timeChange = endTime - startTime;
    let valueChange = endValue - startValue;
    return valueChange * (1 - Math.cos(Math.PI * (time - startTime) / timeChange)) / 2 + startValue;
}

function uploadPartedModels(rawModels) {
    let result = {};
    for (it = rawModels.entrySet().iterator(); it.hasNext(); ) {
      entry = it.next();
      entry.getValue().applyUVMirror(false, true);
      result[entry.getKey()] = ModelManager.uploadVertArrays(entry.getValue());
    }
	return result;
}

function setupDoorGlass(modelCluster) {
    let vertarrays = modelCluster.uploadedTranslucentParts.meshList;
    let vertarray = vertarrays[0];
    for(let i = 0; i < vertarrays.length; i++) {
        vertarray = vertarrays[i];
        vertarray.materialProp.attrState.setColor(200, 200, 200, 140);
    }
}
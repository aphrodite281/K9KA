include("mtr:library/codes/face.js");

let rawbodyModels = ModelManager.loadPartedRawModel(Resources.manager(), Resources.id("mtr:k9ka/model/body.obj"), null);
let slogan = ModelManager.loadRawModel(Resources.manager(), Resources.id("mtr:k9ka/model/slogan.obj"), null);
rawbodyModels.put("slogan", slogan);
let temp = new Map();
let temp2;
let lightNames = ["indoor", "headLamp", "swerveLeft", "swerveRight", "L1", "L2", "L3", "L4", "L5", "L6", "R1", "R2", "R3", "R4", "R5", "R6", "backupLamp", "brakeLamp", "fogLamp", "D", "N", "R", "dromometer"];
let indoorLights = ["L1", "L2", "L3", "L4", "L5", "L6", "R1", "R2", "R3", "R4", "R5", "R6"];
for(let i=0; i<lightNames.length; i++){
    for(let j=0; j<2; j++){
        temp2 = rawbodyModels.get(lightNames[i]).copy();
        temp2.sourceLocation = null;
        temp2.setAllRenderType(lightNames[i]!="indoor"?j?"exterior":"light":j?"exterior":"interior");
        temp2.applyUVMirror(false,true);
        temp.set(lightNames[i]+(j?"Off":"On"), temp2);
    } 
}
temp.set("outdoor", rawbodyModels.get("outdoor").copy());
temp.set("glasses", rawbodyModels.get("glasses").copy());
temp2 = rawbodyModels.get("slogan").copy();
temp2.applyUVMirror(false,true);
temp2.sourceLocation = null;
temp2.setAllRenderType("exteriortranslucent");
temp.set("slogan", temp2);
var bodyModels = uploadRawModelsMap(temp);

for(let i = 0; i < lightNames.length; i++){
    if(lightNames[i]!="indoor"){
        alterAllRGBA(bodyModels.get(lightNames[i]+"Off"), 180, 180, 180, 255);
    }
}

var swerveThreshold = 0.02
var lightingRatio = 0.8

const keywords = ["turn_left", "go_straight", "turn_right", "double_flash"];

const cpd = Resources.readBufferedImage(Resources.id("mtr:k9ka/texture/cpd.png"));

setupBodyGlass(bodyModels.get("glasses"));

const dromometerPos = {x: 0.463411, y: 0.069793, z: 5.56079};
const dromometerRot = {x: -1.1083, y: 0, z: 0};
const dMinRot = -0.3;
const dMaxRot = Math.PI+0.3;
const dMaxSpeed = 140;
const licensePlatePos = [{x: 0, y: -0.955764, z: 6.1705-0.03}, {x: 0, y: -0.792393-0.05, z: -5.93256-0.05}];
const licensePlateRotY = [0, Math.PI];
const licensePlateSize = {x: 0.6, y: 0.18};
const licensePlateFontSize = 100;
const licensePlateShiftY = 90;
const licensePlateColor = [Color.YELLOW, Color.BLACK, Color.WHITE, Color.GREEN];
const difficultyFont1 = Resources.getSystemFont("Noto Sans")//Resources.readFont(Resources.id("mtr:k9ka/font/DIN1451-36breit.ttf"));
const kt = "枫A"
const kt1 = "D1-H"
const numSize = {x:0.7*0.6, y:0.15*0.6};
const numPos = [{x: 1.27488 + 0.01, y: -0.358479, z: 4.33552}, {x: 1, y: -0.3, z: 6.12679}, {x: -0.78275, z: -5.92, y: 0.38}];
const numRotY = [Math.PI/2, 0.1, Math.PI];

let cube1 = ModelManager.uploadVertArrays(ModelManager.loadRawModel(Resources.manager(), Resources.id("mtr:k9ka/model/cube1.obj"), null));

//----------

function create(ctx, state, train){
    //state.licensePlateNum = "枫A·"+train.id().toString(36).slice(-5).toUpperCase();
    state.num = kt1+train.id().toString(10).slice(2, 5);
    state.numFace = new Face({modelInfo:{size:numSize,renderType:"exteriortranslucent"}});
    state.numFace.openGraphics(440, 100);
    let g = state.numFace.graphics();
    g.setColor(new Color(11/255, 97/255, 14/255, 1));
    g.setFont(difficultyFont1.deriveFont(Font.PLAIN, 100));
    g.drawString(state.num, 0, 78);
    state.numFace.upload();
    state.licensePlateNum = train.id().toString(10).slice(10, 15)+"D";
    state.licensePlateFace = new Face({modelInfo:{size:licensePlateSize,renderType:"exteriortranslucent"}});
    state.licensePlateFace.openGraphics(600, 180);
    g = state.licensePlateFace.graphics();
    g.setColor(licensePlateColor[0]);
    g.fillRoundRect(0, 0, 600, 180, 30, 30);
    g.setColor(licensePlateColor[1]);
    g.setStroke(new BasicStroke(5))
    g.drawRoundRect(4, 4, 594, 174, 26, 26);
    g.setColor(licensePlateColor[3]);
    g.fillRoundRect(215, 10, 375, 160, 20, 20);
    g.setColor(licensePlateColor[1]);
    g.setFont(difficultyFont1.deriveFont(Font.PLAIN, licensePlateFontSize));
    let at = new AffineTransform();
    at.scale(1.0, 1.7);
    g.setTransform(at);
    g.drawString(kt, 20, licensePlateShiftY);
    g.drawString(state.licensePlateNum, 230, licensePlateShiftY);
    at = new AffineTransform();
    g.setTransform(at);
    g.drawImage(cpd, 200, 75, 30, 30, null);
    state.licensePlateFace.upload();
    state.turning = new Array();
	for(let i=0; i<train.trainCars();i++){
		state.turning.push(getTurning(train, i, keywords));
	}
    state.InternalLampStatus = new Array();
    for(let i=0; i<train.trainCars(); i++){
        state.InternalLampStatus.push(new Array());
        for(let j=0; j<indoorLights.length; j++){
            state.InternalLampStatus[i][j]=(Math.random()<lightingRatio?"On":"Off")
        }
    }
    state.matrices = new Matrices();
    state.matrices.translate(0,0.5,0);
    state.swerves = [new CycleTracker(["On", 0.4, "Off", 0.2]), new CycleTracker(["On", 0.4, "Off", 0.2])];
    state.swerveing = [false, false];
}

//----------

function render(ctx, state, train){
    //ctx.setDebugInfo("num", state.num)
    let matrices = state.matrices;
    state.licensePlateFace.setupModel();
    for(let j=0; j<licensePlatePos.length; j++){
        matrices.pushPose();
        matrices.translate(licensePlatePos[j].x, licensePlatePos[j].y, licensePlatePos[j].z);
        matrices.rotateY(licensePlateRotY[j]);
        state.licensePlateFace.draw(train.trainCars(), ctx, matrices);
        matrices.popPose();
    }
    state.numFace.setupModel();
    for(let i = 0; i < numPos.length; i++){
        matrices.pushPose();
        matrices.translate(numPos[i].x, numPos[i].y, numPos[i].z);
        matrices.rotateY(numRotY[i]);
        state.numFace.draw(train.trainCars(), ctx, matrices);
        matrices.popPose();
    }
    state.turning = new Array();
	for(let i=0; i<train.trainCars();i++){
		state.turning.push(getTurning(train, i, keywords));
	}
    
    for(let i = 0; i < train.trainCars(); i++){
        if(train.isOnRoute()){
            if(train.speed()==0){
                ctx.drawCarModel(bodyModels.get("ROff"), i, matrices);
                ctx.drawCarModel(bodyModels.get("NOn"), i, matrices);
                ctx.drawCarModel(bodyModels.get("DOff"), i, matrices);
            }else if(train.speed()>0&&train.isReversed()){
                ctx.drawCarModel(bodyModels.get("ROn"), i, matrices);
                ctx.drawCarModel(bodyModels.get("NOff"), i, matrices);
                ctx.drawCarModel(bodyModels.get("DOff"), i, matrices);
            }else if(train.speed()>0&&!train.isReversed()){
                ctx.drawCarModel(bodyModels.get("ROff"), i, matrices);
                ctx.drawCarModel(bodyModels.get("DOn"), i, matrices);
                ctx.drawCarModel(bodyModels.get("NOff"), i, matrices);
            }else{
                ctx.drawCarModel(bodyModels.get("ROff"), i, matrices);
                ctx.drawCarModel(bodyModels.get("NOff"), i, matrices);
                ctx.drawCarModel(bodyModels.get("DOff"), i, matrices);
            }
        }else{
            ctx.drawCarModel(bodyModels.get("ROff"), i, matrices);
            ctx.drawCarModel(bodyModels.get("NOff"), i, matrices);
            ctx.drawCarModel(bodyModels.get("DOff"), i, matrices);
        }

        ctx.drawCarModel(bodyModels.get("outdoor"), i, matrices);
        ctx.drawCarModel(bodyModels.get("slogan"), i, matrices);
        ctx.drawCarModel(bodyModels.get(train.isOnRoute()?"indoorOn":"indoorOff"), i, matrices);
        ctx.drawCarModel(bodyModels.get(train.isOnRoute()?"headLampOn":"headLampOff"), i, matrices);
        ctx.drawCarModel(bodyModels.get("glasses"), i, matrices);
        ctx.drawCarModel(bodyModels.get("backupLamp"+(train.isReversed()&&train.speed()!=0?"On":"Off")), i, matrices);
        ctx.drawCarModel(bodyModels.get("brakeLamp"+(inBrake(state, train)?"On":"Off")), i, matrices);
        ctx.drawCarModel(bodyModels.get("fogLamp"+(train.isOnRoute()&&MinecraftClient.worldIsRaining()?"On":"Off")), i, matrices);
        if(getModelKey(train, i).includes(keywords[3])){
            state.swerveing[0] = true;
            state.swerveing[1] = true;
        }else if(state.turning[i]==0&&(!train.isReversed())||state.turning[i]==2&&train.isReversed()){
            state.swerveing[0] = true;
            state.swerveing[1] = false;
        }else if(state.turning[i]==2&&(!train.isReversed())||state.turning[i]==0&&train.isReversed()){
            state.swerveing[0] = false;
            state.swerveing[1] = true;
        }else{
             state.swerveing[0] = false;
             state.swerveing[1] = false;
        }
        state.swerves[0].tick();
        state.swerves[1].tick();
        ctx.drawCarModel(bodyModels.get("swerveLeft"+(state.swerveing[0]?state.swerves[0].stateNow():"Off")), i, matrices);
        ctx.drawCarModel(bodyModels.get("swerveRight"+(state.swerveing[1]?state.swerves[1].stateNow():"Off")), i, matrices);
        for(let j=0; j<indoorLights.length; j++){
            let model = bodyModels.get(indoorLights[j]+(train.isOnRoute()?state.InternalLampStatus[i][j]:"Off")+"");
            ctx.drawCarModel(model, i, matrices);
        }

        let rot = Math.min(train.speed()*20*3.6/dMaxSpeed*(dMaxRot-dMinRot)+dMinRot, dMaxRot);
        matrices.pushPose();
        matrices.translate(dromometerPos.x, dromometerPos.y, dromometerPos.z);
        matrices.rotateX(dromometerRot.x);
        matrices.rotateY(-rot);
        ctx.drawCarModel(bodyModels.get("dromometer"+(train.isOnRoute()?"On":"Off")), i, matrices);
        matrices.popPose();
    }
}

//----------

function dispose(ctx, state, train){
    state = {}
}

function uploadRawModelsMap(rawModelsMap){
    let result = new Map();
    for(let [key, value] of rawModelsMap){
        result.set(key, ModelManager.uploadVertArrays(value));
    }
    return result;
}

function setupDoorColor(modelCluster) {
    let vertarrays = modelCluster.uploadedTranslucentParts.meshList;
    let vertarray = vertarrays[0];
    for(let i = 0; i < vertarrays.length; i++) {
        vertarray = vertarrays[i];
        vertarray.materialProp.attrState.setColor(200, 200, 200, 140);
    }
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

function getTurning(train, carIndex, keywords){
    let modelKey = getModelKey(train, carIndex);
    for(let i=0; i<keywords.length; i++){
        if(modelKey.includes(keywords[i])){
            return i;
        }
    }
    return 1;
}

function setupBodyGlass(modelCluster) {
    let vertarrays = modelCluster.uploadedTranslucentParts.meshList;
    let vertarray = vertarrays[0];
    for(let i = 0; i < vertarrays.length; i++) {
        vertarray = vertarrays[i];
        vertarray.materialProp.attrState.setColor(200, 200, 200, 140);
    }
}

function centerDrawing1(g, content, width, width1, high){
    g.drawString(content, (width-getWidth(g, content))/2, high);
}

function getWidth(g, content) {
    let metrics = g.getFontMetrics();
    return metrics.stringWidth(content);
}

function alterAllRGBA (modelCluster, red ,green , blue, alpha) {
    let vertarray = modelCluster.uploadedTranslucentParts.meshList;
    let vert = vertarray[0];
    for(let i = 0; i < vertarray.length; i++) {
        vert = vertarray[i];
        vert.materialProp.attrState.setColor(red , green , blue , alpha);
    }
    vertarray = modelCluster.uploadedOpaqueParts.meshList;
    vert = vertarray[0];
    for(let i = 0; i < vertarray.length; i++) {
        vert = vertarray[i];
        vert.materialProp.attrState.setColor(red , green , blue , alpha);
    }
}
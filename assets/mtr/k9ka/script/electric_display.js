include("mtr:library/codes/board.js");
include("mtr:library/codes/scrolls_screen.js");
include("mtr:library/codes/face.js");
//sinclude("mtr:library/codes/video.js");

const boardNames = ["boardFront","boardRear", "boardRight"];
const boardPosition = [{x:0,y:1.35963,z:6.05834},{x:0,y:1.3345,z:-5.86401},{x:-1.25383,y:0.247415,z:3.50512}];
const boardRotation = [{x:0,y:0,z:0},{x:0,y:Math.PI,z:0},{x:0,y:-Math.PI/2,z:0}];
const boardSize = [{x:1.7,y:0.23},{x:1.53,y:0.27},{x:1.12,y:0.33}];
const screenSize = [[0.7,0.3,0.7],[0.6,0.33,0.6],[0.4,0.72]];
const screenPosX = [[0.5,0,-0.5],[0.93/2,0,-0.93/2],[-0.36,0.20]];
const fontSize = [22,27,33];
const screenStringY = [19,23,29];
//const names = [["origin","route","destination"],["origin","route","destination"],["route","destination"]];
const difficultyFont = Resources.getSystemFont("Noto Sans");// Sans Monospaced
const colors = [[Color.GREEN,Color.BLUE,Color.RED],[Color.GREEN,Color.BLUE,Color.RED],[Color.BLUE,Color.RED]];
const colorB1 = new Color(0.1,0,0,1),colorB2 = new Color(0.2,0.05,0.05,1);
const colorsB = [[colorB1,colorB2,colorB1],[colorB1,colorB2,colorB1],[colorB2, colorB1]];
const run = [true,false,false];
const signs = {right1:"右转弯",right2:">>>>>>",right3:"右转弯",left1:"左转弯",left2:"<<<<<<",left3:"左转弯",brake1:"刹车",brake2:"!!!",brake3:"刹车",back1:"倒车",back2:"!!!",back3:"正在"};
const signNames = ["right","left","brake"];

const speedX = [[[30,30,30],[30,30,30],[30,30,30]],[[30,30,30],[-30,-30,-30]],[[-30,-30,-30],[30,30,30]],[[0,0,0],[0,0,0]],[[0,0,0],[0,0,0]]];
const mapNames = ["ordinary","right","left","brake","back"];
const names = [[["origin","route","destination"],["origin","route","destination"],["route","destination"]], [["right2","route","right1"],["right2","route","right1"]], [["left1","route","left2"],["left1","route","left2"]], [["brake1","brake2","brake3"],["brake1","brake2","brake3"]],[["back1","back2","back3"],["back1","back2","back3"]]];
const mapNum = [1,5,1];
const cling = [[[false,false,false],[false,false,false],[false,false,false]], [[true,false,false],[true,false,false]], [[false,false,true],[false,false,true]], [[false,false,false],[false,false,false]], [[false,false,false],[false,false,false]]]
const scaleX = 0.6

function create(ctx, state, train){
    state.names = getNames(train);
    state.boards = [];
    state.screen = {};
    setupBoards(state, train);
    state.brakeTime = 0;
    state.speed = 0;
}

function render(ctx, state, train){
    let matrices = new Matrices();
    matrices.translate(0,0.5,0);
    for(let l=0;l<train.trainCars();l++){
        for(let i=0;i<boardNames.length;i++){
            state.boards[l][boardNames[i]].applyEvals();
            state.boards[l][boardNames[i]].setupAllModel();
            state.boards[l][boardNames[i]].draw(train.trainCars(), ctx, matrices); 
            state.boards[l][boardNames[i]].updateAllItem(Timing.elapsed(),train.trainCars(),ctx);
        }
        if(train.isOnRoute()){
            state.boards[l]["boardFront"].setShowMap("ordinary");
            state.boards[l]["boardRight"].setShowMap("ordinary");
            if(inBrake(state, train)){
                state.boards[l]["boardRear"].setShowMap("brake");
            }else{
                if(train.isReversed()){
                    state.boards[l]["boardRear"].setShowMap("back");
                }else{
                    if(state.turning[l]==2){
                        state.boards[l]["boardRear"].setShowMap("right");
                    }else if(state.turning[l]==1){
                        state.boards[l]["boardRear"].setShowMap("ordinary");
                    }else if(state.turning[l]==0){
                        state.boards[l]["boardRear"].setShowMap("left");
                    }else{
                        state.boards[l]["boardRear"].setShowMap("ordinary");
                    } 
                }
            }
        }else{
            state.boards[l]["boardFront"].setShowMap("black");
            state.boards[l]["boardRight"].setShowMap("black");
            state.boards[l]["boardRear"].setShowMap("black");
        }
    }
    if(isSameNames(state.names, getNames(train))){
    }else{
        state.names = getNames(train);
        setupBoards(state, train);
    }
}

function isSameNames(name1, name2){
    return (name1.origin == name2.origin && name1.destination == name2.destination && name1.route == name2.route);
}

function getNames(train){
    let index = train.getAllPlatformsNextIndex()==train.getAllPlatforms().size()?-1:train.getAllPlatformsNextIndex();
    if(index==-1){
        return Object.assign({},{origin:"机动车站",destination:"机动车站",route:"机动"},signs);
    }else{
        let platformInfos = train.getThisRoutePlatforms();
        let route = platformInfos.get(platformInfos.size()-1).route.name;
        let origin,destination;
        try{
            origin = platformInfos.get(0).station.name;
        }catch(e){
            origin = "未知";
        }
        try{
            destination = platformInfos.get(platformInfos.size()-1).station.name
        }catch(e){
            destination = "未知";
        }
        let names = {origin:origin,destination:destination,route:route};
        return Object.assign({},names,signs);
    }
}

function getWidth(g, content) {
    let metrics = g.getFontMetrics();
    return metrics.stringWidth(content);
}

function getWidth1(content, i){
    let cc = new GraphicsTexture(10,10)
    let g = cc.graphics;
    g.setFont(difficultyFont.deriveFont(Font.PLAIN, fontSize[i]))
    return getWidth(g, content);    
}

function centerDrawing(g, content, width, high){
    g.drawString(content, (width-getWidth(g, content))/2, high);
}

function drawGrid(obj){
    let g = obj.graphics();

    g.setColor(Color.BLACK);
    g.fillRect(0,0,10,2);
    g.fillRect(0,8,10,2);
    g.fillRect(0,0,2,10);
    g.fillRect(8,0,2,10);

    g.fillRect(2,2,1,1);
    g.fillRect(7,2,1,1);
    g.fillRect(2,7,1,1);
    g.fillRect(7,7,1,1);

    obj.upload();
}

function inBrake(state, train){
    if(isBraking(state, train)){
        state.brakeTime = Timing.elapsed()+0.2;
    }
    if(state.brakeTime>Timing.elapsed()){
        return true;
    }else{
        return false;
    }
}

function isBraking(state, train){
    if(state.speed<=train.speed()){
        state.speed = train.speed();
        return false;
    }else{
        state.speed = train.speed();
        return true;
    }
}

function setupBoards(state, train){
    for(let l=0;l<train.trainCars();l++){
        state.boards[l] = {};
        for(let i=0;i<boardNames.length;i++){
            state.boards[l][boardNames[i]] = new Board({PandR:[{position:boardPosition[i],rotation:boardRotation[i]}]});
            state.boards[l][boardNames[i]].addMap("black").addLayer();
            for(let k=0;k<screenSize[i].length;k++){
                //let info = {modelInfo: {size: size, position: { x: screenPosX[i][k], y: 0, z: 0 },renderType: "light"},graphicsInfo: {x: 1, y: 1}, screenInfo: {speed: {x:speedX[j][i][k]}, running: run}};
                    //state.screen[l*1000+i*100+j*10+k] = new ScrollsScreen(info);
                let size = { x: screenSize[i][k], y: boardSize[i].y };
                let info = {modelInfo: {size: size, position: { x: screenPosX[i][k], y: 0, z: 0 }}};
                let face = new Face(info);
                face.openGraphics(1,1);
                let g = face.graphics();
                g.setColor(Color.BLACK);
                g.fillRect(0,0,1,1);
                face.upload();
                state.boards[l][boardNames[i]].pushItemOn(face,0);
            }
            for(let j=0;j<mapNum[i];j++){
                state.boards[l][boardNames[i]].addMap(mapNames[j]).addLayer().addLayer();
                for(let k=0;k<screenSize[i].length;k++){
                    let text = state.names[names[j][i][k]];
                    let size = { x: screenSize[i][k], y: boardSize[i].y };
                    let width1 = getWidth1(text, i);
                    let width2 = size.x*fontSize[i]/size.y;
                    let run = 0, width = 0;
                    if(width2 > width1){
                        width = width2;
                        run = false;
                    }else{
                        width = width1+(cling[j][i][k]?0:fontSize[i]/2);
                        run = true;
                    }
                    let info = {modelInfo: {size: size, position: { x: screenPosX[i][k], y: 0, z: 0 },renderType: "light"},graphicsInfo: {x: width, y: fontSize[i]}, screenInfo: {speed: {x:speedX[j][i][k]}, running: run}};
                    state.screen[l*1000+i*100+j*10+k] = new ScrollsScreen(info);
                    scrollsScreen = state.screen[l*1000+i*100+j*10+k];
                    g = scrollsScreen.graphics();
                    g.setColor(colorsB[i][k]);
                    g.fillRect(0,0,scrollsScreen.texX,scrollsScreen.texY);
                    g.setColor(colors[i][k]);
                    g.setFont(difficultyFont.deriveFont(Font.PLAIN, fontSize[i]));
                    centerDrawing(g, text, scrollsScreen.texX, screenStringY[i]);
                    scrollsScreen.upload();
                    state.boards[l][boardNames[i]].pushItemOn(scrollsScreen,0);
                    let face = new Face({modelInfo:{renderType:"exteriortranslucent",textureSize:{x:10,y:10}},screen:scrollsScreen});
                    drawGrid(face);
                    state.boards[l][boardNames[i]].pushItemOn(face,1);
                }
            }
        }
    }
}
include("mtr:library/codes/board.js");
include("mtr:library/codes/scrolls_screen.js");
include("mtr:library/codes/face.js");
include("mtr:library/codes/video.js");

const boardNames = ["boardRear","boardFront", "boardRight"];
const boardPosition = [{x:0,y:1.35963,z:6.05834},{x:0,y:1.3345,z:-5.86401},{x:-1.25383,y:0.247415,z:3.50512}];
const boardRotation = [{x:0,y:0,z:0},{x:0,y:Math.PI,z:0},{x:0,y:-Math.PI/2,z:0}];
const boardSize = [{x:1.7,y:0.23},{x:1.53,y:0.27},{x:1.12,y:0.33}];
const screenSize = [[0.7,0.3,0.7],[0.6,0.33,0.6],[0.4,0.72]];
const screenPosX = [[0.5,0,-0.5],[0.93/2,0,-0.93/2],[-0.36,0.20]];
const fontSize = [22,27,33];
const screenStringY = [19,23,29];
const names = [["origin","route","destination"],["origin","route","destination"],["route","destination"]];
const difficultyFont = Resources.getSystemFont("Monospaced");
const colors = [[Color.GREEN,Color.BLUE,Color.RED],[Color.GREEN,Color.BLUE,Color.RED],[Color.BLUE,Color.RED]];
const colorB1 = new Color(0.1,0,0,1),colorB2 = new Color(0.2,0.05,0.05,1);
const colorsB = [[colorB1,colorB2,colorB1],[colorB1,colorB2,colorB1],[colorB2, colorB1]];
const run = [true,false,false];
const signs = [["右转弯",">>>>>>","右转弯"],["左转弯","<<<<<<","左转弯"],["刹车","!!!","刹车"]];
const signNames = ["right","left","break"];
const signsSpeedX = [-30,30,0];

var a=0,b=0,c=0;

//----------

function create(ctx, state, train){
    state.matrices = new Matrices();
    state.matrices.translate(0,0.5,0);
    state.names = getNames(train);
    state.boards = new Object();
    for(let i=0;i<boardNames.length;i++){
        let boardName = boardNames[i];
        state[boardName] = new Board({PandR:[{position:boardPosition[i],rotation:boardRotation[i]}]});
        state[boardName].addMap("ordinary").addLayer().addLayer();
        for(let j=0;j<screenSize[i].length;j++){
            let text = state.names[names[i][j]];
            let size = { x: screenSize[i][j], y: boardSize[i].y }
            let width1 = getWidth1(text, i);
            let width2 = size.x*fontSize[i]/size.y;
            let run = 0;
            if(width2 > width1){
                texX = width2;
                run = false;
            }else{
                texX = width1+30;
                run = true;
            }
            let info = {
                modelInfo: {
                    size: size, // 模型尺寸，必需
                    position: { x: screenPosX[i][j], y: 0, z: 0 }, // 模型位置，可选，默认为{x:0, y:0, z:0}
                    //rotation: { x: 0, y: 0, z: 0 }, // 模型旋转，可选，默认为{x:0, y:0, z:0}
                    renderType: "light" // 渲染类型，可选，默认为"exterior"
                    //faceDouble: false, // 是否双面渲染，可选，默认为false
                    //uv: { x: 100, y: 50 } // UV坐标，可选，默认为根据尺寸和纹理坐标计算
                },
                graphicsInfo: {
                    x: texX, // 纹理X坐标，可选，默认为根据UV坐标计算
                    y: fontSize[i] // 纹理Y坐标，可选，默认为根据UV坐标计算
                },
                screenInfo: {
                    speed: { x: 30 },// 滚动速度，可选，默认为{x:0, y:0}
                    //display: true, // 是否显示，可选，默认为true
                    running: run // 是否运行，可选，默认为true
                    //pixel: { x: 1, y: 1 } // 像素信息，可选
                }
            };
            
            let scrollsScreen = new ScrollsScreen(info);
            g = scrollsScreen.graphics();
            g.setColor(colorsB[i][j]);
            g.fillRect(0,0,scrollsScreen.texX,scrollsScreen.texY);
            g.setColor(colors[i][j]);
            g.setFont(difficultyFont.deriveFont(Font.PLAIN, fontSize[i]));
            centerDrawing(g, text, scrollsScreen.texX, screenStringY[i]);
            scrollsScreen.upload();
            state[boardName].pushItemOn(scrollsScreen,0);
            let face = new Face({modelInfo:{renderType:"exteriortranslucent",textureSize:{x:10,y:10}},screen:scrollsScreen});
            drawGrid(face);
            state[boardName].pushItemOn(face,1);
        }
    }
    for(let i=0;i<2;i++){
        let boardName = boardNames[i];
        for(let k=0;k<3;k++){
            state[boardName].addMap(signNames[i]).addLayer().addLayer();
            for(let j=0;j<screenSize[i].length;j++){
                let text = signs[k][j];
                let size = { x: screenSize[i][j], y: boardSize[i].y }
                let width1 = getWidth1(text, i);
                let width2 = size.x*fontSize[i]/size.y;
                let run = 0;
                if(width2 > width1){
                    texX = width2;
                    run = false;
                }else{
                    texX = width1;
                    run = true;
                }
                let info = {
                    modelInfo: {
                        size: size, // 模型尺寸，必需
                        position: { x: screenPosX[i][j], y: 0, z: 0 }, // 模型位置，可选，默认为{x:0, y:0, z:0}
                        //rotation: { x: 0, y: 0, z: 0 }, // 模型旋转，可选，默认为{x:0, y:0, z:0}
                        renderType: "light" // 渲染类型，可选，默认为"exterior"
                        //faceDouble: false, // 是否双面渲染，可选，默认为false
                        //uv: { x: 100, y: 50 } // UV坐标，可选，默认为根据尺寸和纹理坐标计算
                    },
                    graphicsInfo: {
                        x: texX, // 纹理X坐标，可选，默认为根据UV坐标计算
                        y: fontSize[i] // 纹理Y坐标，可选，默认为根据UV坐标计算
                    },
                    screenInfo: {
                        speed: { x: 30 },// 滚动速度，可选，默认为{x:0, y:0}
                        //display: true, // 是否显示，可选，默认为true
                        running: run // 是否运行，可选，默认为true
                        //pixel: { x: 1, y: 1 } // 像素信息，可选
                    }
                };
                
                let scrollsScreen = new ScrollsScreen(info);
                g = scrollsScreen.graphics();
                g.setColor(colorsB[i][j]);
                g.fillRect(0,0,scrollsScreen.texX,scrollsScreen.texY);
                g.setColor(colors[i][j]);
                g.setFont(difficultyFont.deriveFont(Font.PLAIN, fontSize[i]));
                centerDrawing(g, text, scrollsScreen.texX, screenStringY[i]);
                scrollsScreen.upload();
                state[boardName].pushItemOn(scrollsScreen,0);
                let face = new Face({modelInfo:{renderType:"exteriortranslucent",textureSize:{x:10,y:10}},screen:scrollsScreen});
                drawGrid(face);
                state[boardName].pushItemOn(face,1);
            }
        }
        //state[boardName].setShowMap("right");
    }
}

//----------

function render(ctx, state, train){
    //ctx.setDebugInfo("a",MinecraftClient.narrate("114514114514114514114514114514114514"));
    let matrices = state.matrices;
    for(let i=0;i<boardNames.length;i++){
        state[boardNames[i]].setupAllModel();
        state[boardNames[i]].draw(train.trainCars(), ctx, matrices); 
        state[boardNames[i]].updateAllItem(Timing.elapsed(),train.trainCars(),ctx);
    }
    //ctx.setDebugInfo("",state.boardRear.getItemArray()[2].graphicsTexture);
    let newNames = getNames(train);
    if(isSameNames(state.names,newNames)){
    }else{
        state.names = newNames;
        for(let i=0;i<boardNames.length;i++){
            let boardName = boardNames[i];
            state[boardName].setShowMap("ordinary");
            state[boardName].cleanLayer(0);
            for(let j=0;j<screenSize[i].length;j++){
                let size = { x: screenSize[i][j], y: boardSize[i].y }
                let width1 = getWidth1(state.names[names[i][j]], i);
                let width2 = size.x*fontSize[i]/size.y;
                let run = 0;
                if(width2 > width1){
                    texX = width2;
                    run = false;
                }else{
                    texX = width1+30;
                    run = true;
                }
                let info = {
                    modelInfo: {
                        size: size, // 模型尺寸，必需
                        position: { x: screenPosX[i][j], y: 0, z: 0 }, // 模型位置，可选，默认为{x:0, y:0, z:0}
                        //rotation: { x: 0, y: 0, z: 0 }, // 模型旋转，可选，默认为{x:0, y:0, z:0}
                        renderType: "light" // 渲染类型，可选，默认为"exterior"
                        //faceDouble: false, // 是否双面渲染，可选，默认为false
                        //uv: { x: 100, y: 50 } // UV坐标，可选，默认为根据尺寸和纹理坐标计算
                    },
                    graphicsInfo: {
                        x: texX, // 纹理X坐标，可选，默认为根据UV坐标计算
                        y: fontSize[i] // 纹理Y坐标，可选，默认为根据UV坐标计算
                    },
                    screenInfo: {
                        speed: { x: 30 },// 滚动速度，可选，默认为{x:0, y:0}
                        //display: true, // 是否显示，可选，默认为true
                        running: run ,// 是否运行，可选，默认为true
                        pixel: { x: 1, y: 1 } // 像素信息，可选
                    }
                };
                
                let scrollsScreen = new ScrollsScreen(info);
                g = scrollsScreen.graphics();
                g.setColor(colorsB[i][j]);
                g.fillRect(0,0,scrollsScreen.texX,scrollsScreen.texY);
                g.setColor(colors[i][j]);
                g.setFont(difficultyFont.deriveFont(Font.PLAIN, fontSize[i]));
                centerDrawing(g, state.names[names[i][j]], scrollsScreen.texX, screenStringY[i]);
                scrollsScreen.upload();
                state[boardName].pushItemOn(scrollsScreen,0);
                if(i<2){
                    state[boardName].setShowMap("right");
                }
            }
        }
    }
}

//----------

function isSameNames(name1, name2){
    return (name1.origin == name2.origin && name1.destination == name2.destination && name1.route == name2.route);
}

function getNames(train){
    let index = train.getAllPlatformsNextIndex()==train.getAllPlatforms().size()?-1:train.getAllPlatformsNextIndex();
    if(index==-1){
        return {origin:"机动车站",destination:"机动车站",route:"机动"}
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
        //let names = {origin:TextUtil.getNonExtraParts(origin)+"",destination:TextUtil.getNonExtraParts(destination)+"",route:route+""};
        let names = {origin:origin,destination:destination,route:route};
        return names;
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
include("mtr:library/codes/board.js");
include("mtr:library/codes/scrolls_screen.js");
include("mtr:library/codes/face.js");
include("mtr:library/codes/video.js");

//其实这里应该用全大写的，但是我懒得改了

const font = Resources.getSystemFont("Monospaced");
const sqSizeX = 0.65;
const sqSizeY = 0.22;
const sqMSizeX = 0.4;
const shSizeX = 0.6;
const shSizeY = 0.22;
const shMSizeX = 0.4;
const colorA = Color.BLACK;
const colorB = Color.RED;
const colorC = Color.YELLOW;
const texY = 32
const fontSize = 32;

const boardPosition = [{x:1.35963,y:1.3345,z:6.14457},{x:1.3345,z:-5.86401}];
const boardRotation = [{},{y:Math.PI}];
const screenPosition = [[{x:sqSizeX*0.5+sqMSizeX/2},{x:-sqSizeX*0.5-sqMSizeX/2},{}],[{x:shSizeX*0.5+shMSizeX/2},{x:-shSizeX*0.5-shMSizeX/2},{}]];
const screenSize = [[{x:sqSizeX,y:sqSizeY},{x:sqSizeX,y:sqSizeY},{sqMSizeX,sqSizeY}],[{x:shSizeX,y:shSizeY},{x:shSizeX,y:shSizeY},{shMSizeX,shSizeY}]];
const boardName = ["qBoard","hBoard"];
const useName = ["origin","destination","route"]

//----------

function create(ctx, state, train){
    state.matrices = new Matrices;
    state.names = getNames(train);

    state.boards = new Map();
    let temp;
    for(let i=0;i<2;i++){
        temp = new Board({PandR:[{position:boardPosition[i],rotation:boardRotation[i]}]});
        temp.addMap("a").addLayer().addLayer();
        state.boards.set(boardName[i],temp);
        for(let j=0;j<3;j++){
            temp = new ScrollsScreen({name:i*10+j,modelInfo:{position:screenPosition[i][j],size:screenSize[i][j],renderType:"light"},graphicsInfo:{x:1,y:texY},screenInfo:{speed:{x:30}}});
            setupScreen(temp, state.names[useName[j]], fontSize, font);
            state.boards.get(boardName[i]).pushItemOn(temp,0);
            temp = new Face({modelInfo:{renderType:"exteriortranslucent",textureSize:{x:20,y:20}},screen:temp});
            drawGrid(temp);
            state.boards.get(boardName[i]).pushItemOn(temp,1);
        }
    }
}

//----------

function render(ctx, state, train){
    let matrices = state.matrices;
    updateScreen(state.boards, state, train);
    state.boards.setupAllItem();
    state.boards.updateAllItem(Timing.elapsed(),-1,ctx);
    state.boards.drawAllItem(train.trainCars(),ctx,matrices);
}

//----------

function drawGrid(obj){
    let g = obj.graphics();

    g.setColor(colorA);
    g.fillRect(0,0,20,1);
    g.fillRect(0,19,20,1);
    g.fillRect(0,0,1,20);
    g.fillRect(19,0,1,20);
    
    g.fillRect(1,1,1,1);
    g.fillRect(18,1,1,1);
    g.fillRect(1,18,1,1);
    g.fillRect(18,18,1,1);

    obj.upload();
}

function getStringX(str, size){
    return str*size;
}

function needScroll(str, size, scrollsScreen){
    return getStringX(str, size) > scrollsScreen.uvX;
}

function setupScreen(scrollsScreen, str, size, font1){
    if(needScroll(str, size, scrollsScreen)){
        scrollsScreen.updateGrapics(getStringX(str, size)+size*2,scrollsScreen.uvY);
    }else{
        scrollsScreen.stop();
    }
    let g = scrollsScreen.graphics();
    g.setColor(colorA);
    g.fillRect(0,0,scrollsScreen.texX,scrollsScreen.texY);
    g.setColor(colorC);
    g.setFont(font1.deriveFont(Font.BOLD, size));
    g.drawString(str, 0, size*2/3);
    scrollsScreen.upload();
}

function updateScreen(map, state, train){
    if(isSameNames(state.names, getNames(train))){

    }else{
        state.names = getNames(train);
        let o,k,v;
        for(let [key,value] of map){
            let array = value.getItemArray(1);
            for(let i=0;i<array.length;i++){
                o = array[i];
                if(o.type == "ScrollsScreen"){
                    k = Math.floor(o.name/10);
                    v = o.name%10;
                    setupScreen(o, state.names[useName[v]], fontSize, font);
                }
            }
        }
    }
}

function getNames(train){
    let index = train.getAllPlatformsNextIndex()==train.getAllPlatforms().size()?-1:1;
    if(index==-1){
        return {origin:"机动车辆",destination:"机动车辆",route:"机动"}
    }else{
        let platformInfos = train.getThisRoutePlatforms();
        let route = platformInfos.get(0).route.name;
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
        let names = {origin:TextUtil.getCjkParts(origin)+"",destination:TextUtil.getCjkParts(destination)+"",route:TextUtil.getNonExtraParts(route)+""};
        return names;
    }
}

function isSameNames(name1, name2){
    return (name1.origin == name2.origin && name1.destination == name2.destination && name1.route == name2.route);
}
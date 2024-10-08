function Board(info){
    this.type = "Board";
    this.PandR = new Array;
    info.PandR = info.PandR?info.PandR:new Array();
    for(let i=0;i<info.PandR.length;i++){
        this.PandR.push({position:{x:info.PandR[i].position?(info.PandR[i].position.x?info.PandR[i].position.x:0):0,y:info.PandR[i].position?(info.PandR[i].position.y?info.PandR[i].position.y:0):0,z:info.PandR[i].position?(info.PandR[i].position.z?info.PandR[i].position.z:0):0},rotation:{x:info.PandR[i].rotation?(info.PandR[i].rotation.x?info.PandR[i].rotation.x:0):0,y:info.PandR[i].rotation?(info.PandR[i].rotation.y?info.PandR[i].rotation.y:0):0,z:info.PandR[i].rotation?(info.PandR[i].rotation.z?info.PandR[i].rotation.z:0):0}})
    }
    this.interval = (info && info.interval) ? info.interval : 0.004;
    this.map = new Map();
    this.display = (info && info.display) ?info.display :true ;
    this.isSetup = false;
    return this;
}

Board.prototype.addMap = function(name){
    this.map.set(name, new Array());
    this.nowMap = name;
    return this;
}

Board.prototype.cleanMap = function(name){
    this.map.delete(name);
    return this;
}

Board.prototype.restore = function(){
    this.map = new Map();
    return this;
}

Board.prototype.cleanLayer = function(layerIndex,map){
    let mapIndex = map?map:this.nowMap;
    this.map.get(mapIndex)[layerIndex] = new Array();
    return this;
}

Board.prototype.setShowMap = function(name){
    this.nowMap = name;
    return this;
}

Board.prototype.addLayer = function(){
    if(this.map.get(this.nowMap)==undefined){
        this.map.get(this.nowMap) = new Array();
        this.nowLayer = 0;
    }else{
        this.nowLayer++;
    }
    return this;
}

Board.prototype.pushItem = function(item,layerIndex){
    if(layerIndex!=undefined){
        if(this.map.get(this.nowMap)[layerIndex]== undefined){
            this.map.get(this.nowMap)[layerIndex] = new Array();
        }
        this.map.get(this.nowMap)[layerIndex].push(item);
        this.nowLayer = layerIndex;
    }else{
        if(this.map.get(this.nowMap)[this.nowLayer]== undefined){
            this.map.get(this.nowMap)[this.nowLayer]= new Array();
        }
        this.map.get(this.nowMap)[this.nowLayer].push(item);
    }
    return this;
}

Board.prototype.pushItemOn = function(item,layerIndex,mapIndex){
    let mapIndex = mapIndex?mapIndex:this.nowMap;
    try{
        this.map.get(mapIndex)[layerIndex].push(item);
    }catch(e){
        this.map.get(mapIndex)[layerIndex] = new Array();
        this.map.get(mapIndex)[layerIndex].push(item);
    }
    this.nowLayer = layerIndex;
    return this;
}

Board.prototype.getItemArray = function(layerIndex,mapIndex){
    let mapIndex = mapIndex?mapIndex:this.nowMap;
    let result = new Array();
    if(layerIndex!=undefined){
        for(let i=0;i<this.map.get(mapIndex)[layerIndex].length;i++){
            result.push(this.map.get(mapIndex)[layerIndex][i]);
        }
    }else{
        for(let i=0;i<this.map.get(mapIndex).length;i++){
            for(let j=0;j<this.map.get(mapIndex)[i].length;j++){
                result.push(this.map.get(mapIndex)[i][j]);
            }
        }
    }
    return result;
}

Board.prototype.draw = function(carriage,ctx,mat){
    if(this.display){
        matrices = mat?mat:new Matrices();
        for(let k=0; k<this.PandR.length; k++){
            matrices.pushPose();
            matrices.translate(this.PandR[k].position.x,this.PandR[k].position.y,this.PandR[k].position.z);
            matrices.rotateX(this.PandR[k].rotation.x);
            matrices.rotateY(this.PandR[k].rotation.y);
            matrices.rotateZ(this.PandR[k].rotation.z);
            for(let i=0;i<this.map.get(this.nowMap).length;i++){
                for(let j=0;j<this.map.get(this.nowMap)[i].length;j++){
                    if(this.map.get(this.nowMap)[i][j].display){
                        matrices.pushPose();
                        this.map.get(this.nowMap)[i][j].setupModelMatrix(matrices);
                        if(carriage==-1){
                            if(this.map.get(this.nowMap)[i][j].model!=null&&this.map.get(this.nowMap)[i][j].model.onlyDynamicModelHolder==false){
                                ctx.drawModel(this.map.get(this.nowMap)[i][j].model, matrices);
                            }else{
                                ctx.drawModel(this.map.get(this.nowMap)[i][j].dynamicModelHolder, matrices);
                            }
                        }else{
                            try{
                                for(let l=0;l<carriage;l++){
                                    ctx.drawCarModel(this.map.get(this.nowMap)[i][j].model, l, matrices);
                                }
                            }catch(e){
                                for(let l=0;l<carriage;l++){
                                    ctx.drawCarModel(this.map.get(this.nowMap)[i][j].dynamicModelHolder, l, matrices);
                                }
                            }
                        }
                        matrices.popPose();
                    }
                }
                matrices.translate(0,0,this.interval);
            }
            matrices.popPose();
        }
    }
}

Board.prototype.debug = function(ctx){
    ctx.setDebugInfo("blayer",this.map.get(this.nowMap).length);
    for(let i=0;i<this.map.get(this.nowMap).length;i++){
        ctx.setDebugInfo("model"+i,this.map.get(this.nowMap)[i][j].model);
        ctx.setDebugInfo("display"+i,this.map.get(this.nowMap)[i][j].display);
        ctx.setDebugInfo("type"+i,this.map.get(this.nowMap)[i][j].type);
    }
}

Board.prototype.updateAllItem = function(time,carriage,ctx){
    for(let i=0;i<this.map.get(this.nowMap).length;i++){
        for(let j=0;j<this.map.get(this.nowMap)[i].length;j++){
            if(this.map.get(this.nowMap)[i][j].type=="Video"){
                this.map.get(this.nowMap)[i][j].update(time,carriage,ctx);
            }else if(this.map.get(this.nowMap)[i][j].type=="ScrollsScreen"){
                this.map.get(this.nowMap)[i][j].update();
            }
        }
    }
}

Board.prototype.translate = function(position,rotation){
    this.position.x += position.x||0;
    this.position.y += position.y||0;
    this.position.z += position.z||0;
    this.rotation.x += rotation.x||0;
    this.rotation.y += rotation.y||0;
    this.rotation.z += rotation.z||0;
}

Board.prototype.teleport = function(position,rotation){
    this.position.x = position.x||0;
    this.position.y = position.y||0;
    this.position.z = position.z||0;
    this.rotation.x = rotation.x||0;
    this.rotation.y = rotation.y||0;
    this.rotation.z = rotation.z||0;
}

Board.prototype.setupAllModel = function(){
    for(let i=0;i<this.map.get(this.nowMap).length;i++){
        for(let j=0;j<this.map.get(this.nowMap)[i].length;j++){
            this.map.get(this.nowMap)[i][j].setupModel();
        }
    }
}

Board.prototype.hide = function(){
    this.display = false;
}

Board.prototype.show = function(){
    this.display = true;
}

Map.prototype.drawAllItem = function(carriage,ctx,mat){
    for(let value of this.values()){
        value.draw(carriage,ctx,mat);
    }
}

Map.prototype.setupAllItem = function(){
    for(let value of this.values()){
        value.setupAllModel();
    }
}

Map.prototype.updateAllItem = function(time,carriage,ctx){
    for(let value of this.values()){
        value.updateAllItem(time,carriage,ctx);
    }
}

Board.prototype.applyEvals = function(){
    for(let i=0;i<this.map.get(this.nowMap).length;i++){
        for(let j=0;j<this.map.get(this.nowMap)[i].length;j++){
            try{
                this.map.get(this.nowMap)[i][j].applyEvals();                
            }catch(e){

            }
        }
    }
}
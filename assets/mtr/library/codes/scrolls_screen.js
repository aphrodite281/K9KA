importPackage(java.awt);
importPackage(java.awt.geom);

function ScrollsScreen(info){
    this.create(info);
}

ScrollsScreen.prototype.create = function(info){
    this.type = "ScrollsScreen";
    this.name = info.name?info.name:"default";
    this.size = info.modelInfo.size;
    this.modelPosition = {
        x: info.modelInfo.position ? (info.modelInfo.position.x != undefined ? info.modelInfo.position.x : 0) : 0,
        y: info.modelInfo.position ? (info.modelInfo.position.y != undefined ? info.modelInfo.position.y : 0) : 0,
        z: info.modelInfo.position ? (info.modelInfo.position.z != undefined ? info.modelInfo.position.z : 0) : 0
    };
    this.modelRotation = {
        x: info.modelInfo.rotation ? (info.modelInfo.rotation.x !== undefined ? info.modelInfo.rotation.x : 0) : 0,
        y: info.modelInfo.rotation ? (info.modelInfo.rotation.y !== undefined ? info.modelInfo.rotation.y : 0) : 0,
        z: info.modelInfo.rotation ? (info.modelInfo.rotation.z !== undefined ? info.modelInfo.rotation.z : 0) : 0
    };
    this.renderType = info.modelInfo.renderType?info.modelInfo.renderType:"exterior";
    this.faceDouble = info.modelInfo.faceDouble?info.modelInfo.faceDouble:false;
    this.texY = info.graphicsInfo.y;
    this.dynamicModelHolder = new DynamicModelHolder();
    this.uvY = info.modelInfo.uv?(info.modelInfo.uv.y?info.modelInfo.uv.y:this.texY):this.texY;
    this.uvX = info.modelInfo.uv?(info.modelInfo.uv.x?info.modelInfo.uv.x:this.size.x*this.texY/this.size.y):this.size.x*this.texY/this.size.y;
    this.texX = info.graphicsInfo.x?info.graphicsInfo.x:this.uvX;
    this.graphicsTexture = new GraphicsTexture(this.texX, this.texY);
    let rawModel = buildRawModel(this.size.x, this.size.y, this.texX, this.texY, this.uvX, this.uvY, 0, 0, this.renderType, this.graphicsTexture.identifier,this.faceDouble);
    this.dynamicModelHolder.uploadLater(rawModel);
    this.speed = {x:info.screenInfo.speed?(info.screenInfo.speed.x?info.screenInfo.speed.x:0):0,y:info.screenInfo.speed?(info.screenInfo.speed.y?info.screenInfo.speed.y:0):0};
    this.display = info.screenInfo.display==false?false:true;
    this.running = info.screenInfo.running==false?false:true;
    if(info.screenInfo.pixel!=undefined){
        this.pixel = info.screenInfo.pixel;
        this.tempX = 0;
        this.tempY = 0;
    }
    this.shiftX = 0;
    this.shiftY = 0;
    this.useSecondTexture = false;
    this.errorStack = new Array();
    this.evals = [];
}

ScrollsScreen.prototype.run = function(){
    this.running = true;
}

ScrollsScreen.prototype.stop = function(){
    this.running = false;
}

ScrollsScreen.prototype.setSpeed = function(speed){
    this.speed = speed;
}

ScrollsScreen.prototype.update = function(){
    if(this.running&&this.display){
        if(this.pixel!=undefined){
            this.shiftX += this.speed.x*Timing.delta();
            this.shiftY += this.speed.y*Timing.delta();
            while(Math.abs(this.shiftY)>=this.pixel.y){
                if(this.shiftY>0){
                    this.shiftY -= this.pixel.y;
                    this.tempY += this.pixel.y;
                }else{
                    this.shiftY += this.pixel.y;
                    this.tempY -= this.pixel.y;
                }
            }
            while(Math.abs(this.shiftX)>=this.pixel.x){
                if(this.shiftX>0){
                    this.shiftX -= this.pixel.x;
                    this.tempX += this.pixel.x;
                }else{
                    this.shiftX += this.pixel.x;
                    this.tempX -= this.pixel.x;
                }
            }   
            this.dynamicModelHolder.uploadLater(buildRawModel(this.size.x, this.size.y, this.texX, this.texY, this.uvX, this.uvY, this.tempX, this.tempY, this.renderType, this.useSecondTexture?this.graphicsTexture2.identifier:this.graphicsTexture.identifier,this.faceDouble));
        }else{
            this.shiftX += this.speed.x*Timing.delta();
            this.shiftY += this.speed.y*Timing.delta();
            this.dynamicModelHolder.uploadLater(buildRawModel(this.size.x, this.size.y, this.texX, this.texY, this.uvX, this.uvY, this.shiftX, this.shiftY , this.renderType, this.useSecondTexture?this.graphicsTexture2.identifier:this.graphicsTexture.identifier,this.faceDouble));
        }
    }
}

ScrollsScreen.prototype.setupModelMatrix = function(matrices){
    matrices.translate(this.modelPosition.x,this.modelPosition.y,this.modelPosition.z);
    matrices.rotateX(this.modelRotation.x);
    matrices.rotateY(this.modelRotation.y);
    matrices.rotateZ(this.modelRotation.z);
}

ScrollsScreen.prototype.setupModel = function(){
}

ScrollsScreen.prototype.draw = function(carriage,ctx,mat){
    if(this.display){
        matrices = mat?mat:new Matrices();
        matrices.translate(this.modelPosition.x, this.modelPosition.y, this.modelPosition.z);
        matrices.rotateX(this.rotation.x);
        matrices.rotateY(this.rotation.y);
        matrices.rotateZ(this.rotation.z);
        if(carriage==-1){
            try{
                ctx.drawModel(this.dynamicModelHolder,matrices);
            }catch(e){
                ctx.drawModel(this.dynamicModelHolder,matrices);
            }
        }else{
            try{
                for(let i=0;i<carriage;i++){
                    ctx.drawCarModel(this.dynamicModelHolder,i,matrices);
                }
            }catch(e){
                for(let i=0;i<carriage;i++){
                    ctx.drawCarModel(this.dynamicModelHolder,i,matrices);
                }
            }
        }
    }
}

ScrollsScreen.prototype.graphics = function(){
    return this.useSecondTexture?this.graphicsTexture2.graphics:this.graphicsTexture.graphics;
}

ScrollsScreen.prototype.upload = function(){
    this.graphicsTexture.upload();
}

ScrollsScreen.prototype.debug = function(ctx){
    ctx.setDebugInfo("",this.useSecondTexture?this.graphicsTexture2:this.graphicsTexture);
    ctx.setDebugInfo("useSecondTexture",this.useSecondTexture);
    ctx.setDebugInfo("texX",this.texX);
    ctx.setDebugInfo("texY",this.texY);
    ctx.setDebugInfo("uvX",this.uvX);
    ctx.setDebugInfo("uvY",this.uvY);
    ctx.setDebugInfo("errorStack",getDebugString(this.errorStack));
}

ScrollsScreen.prototype.mix = function(background,grid){
    let texX = grid.texX*this.texX;
    let texY = grid.texY*this.texY;
    this.graphicsTexture2 = new GraphicsTexture(texX, texY);
    let g = this.graphicsTexture2.graphics;
    g.drawImage(background.graphicsTexture.bufferedImage,0,0,texX,texY,null);
    g.drawImage(this.graphicsTexture.bufferedImage,0,0,texX,texY,null);
    for(let i=0;i<this.texX;i++){
        for(let j=0;j<this.texY;j++){
            g.drawImage(grid.graphicsTexture.bufferedImage,i*grid.texX,j*grid.texY,grid.texX,grid.texY,null);
        }
    }
    this.graphicsTexture2.upload();
    this.graphicsTexture.close();
    this.useSecondTexture = true;
}

function buildRawModel(sizeX, sizeY, texX, texY, uvX, uvY, scrollX, scrollY, renderType, texture, faceDouble){
    let rawModel = new RawModel();
    let stratX = scrollX*1/texX;
    let width = uvX*1/texX;
    let stratY = scrollY*1/texY;
    let high = uvY*1/texY;
    let rawModelBuilder = new RawMeshBuilder(4, renderType, texture);
    rawModelBuilder.vertex(sizeX/2, sizeY/2, 0).normal(0, 0, 0).uv(stratX + width, stratY).endVertex()
    .vertex(-sizeX/2, sizeY/2, 0).normal(0, 0, 0).uv(stratX, stratY).endVertex()
    .vertex(-sizeX/2, -sizeY/2, 0).normal(0, 0, 0).uv(stratX, stratY + high).endVertex()
    .vertex(sizeX/2, -sizeY/2, 0).normal(0, 0, 0).uv(stratX + width, stratY + high).endVertex();
    if(faceDouble){
        rawModelBuilder.vertex(sizeX/2, sizeY/2, 0).normal(0, 0, 0).uv(stratX, stratY).endVertex()
        .vertex(sizeX/2, -sizeY/2, 0).normal(0, 0, 0).uv(stratX, stratY + high).endVertex()
        .vertex(-sizeX/2, -sizeY/2, 0).normal(0, 0, 0).uv(stratX + width, stratY + high).endVertex()
        .vertex(-sizeX/2, sizeY/2, 0).normal(0, 0, 0).uv(stratX + width, stratY).endVertex();
    }
    rawModel.append(rawModelBuilder.getMesh());
    rawModel.generateNormals();
    return rawModel;
}

function getDebugString(array){
    let result = "";
    for(let i=0;i<array.length;i++){
        result += i+": "+array[i]+";  ";
    }
    return result;
}
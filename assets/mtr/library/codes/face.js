importPackage(java.awt);
importPackage(java.awt.geom);

function Face(info){
    this.type = "Face";
    if(info.screen==undefined&&info.modelInfo.model==undefined&&info.modelInfo.dynamicModelHolder==undefined){
        let rawModel = info.modelInfo.faceDouble? getDoubleFaceModel(): getFaceModel();
        rawModel.setAllRenderType(info.modelInfo.renderType?info.modelInfo.renderType:"exterior");
        rawModel.applyScale(info.modelInfo.size.x,info.modelInfo.size.y,1);
        this.dynamicModelHolder = new DynamicModelHolder();
        this.dynamicModelHolder.uploadLater(rawModel);
        this.model = undefined;
    }else if(info.screen==undefined&&info.modelInfo.model!=undefined){
        this.model = info.modelInfo.model;
    }else if(info.screen==undefined&&info.modelInfo.dynamicModelHolder!=undefined){
        this.dynamicModelHolder = info.modelInfo.dynamicModelHolder;
        this.onlyDynamicModelHolder = true;
    }else if(info.screen!=undefined){
        this.screen = info.screen;
        this.texX = info.modelInfo.textureSize.x;
        this.texY = info.modelInfo.textureSize.y;
        this.graphicsTexture = new GraphicsTexture(this.texX,this.texY);
        let rawModelBuilder = new RawMeshBuilder(4, info.modelInfo.renderType?info.modelInfo.renderType:"exterior", this.graphicsTexture.identifier);
        this.size = {y:info.modelInfo.size?(info.modelInfo.size.y?info.modelInfo.size.y:this.screen.size.y):this.screen.size.y
                   ,x:info.modelInfo.size?(info.modelInfo.size.x?info.modelInfo.size.x:this.screen.size.x):this.screen.size.x};
        rawModelBuilder.vertex(this.size.x/2, this.size.y/2, 0).normal(0, 0, 0).uv(this.screen.uvX, 0).endVertex()
        .vertex(-this.size.x/2, this.size.y/2, 0).normal(0, 0, 0).uv(0, 0).endVertex()
        .vertex(-this.size.x/2, -this.size.y/2, 0).normal(0, 0, 0).uv(0, this.screen.uvY).endVertex()
        .vertex(this.size.x/2, -this.size.y/2, 0).normal(0, 0, 0).uv(this.screen.uvX, this.screen.uvY).endVertex();
        let rawModel = new RawModel();
        rawModel.append(rawModelBuilder.getMesh());
        rawModel.generateNormals();    
        this.dynamicModelHolder = new DynamicModelHolder();
        this.dynamicModelHolder.uploadLater(rawModel);
        this.onlyDynamicModelHolder = true;
    }
    if(info.screen==undefined){
        this.modelPosition = {
            x: info.modelInfo.position ? (info.modelInfo.position.x !== undefined ? info.modelInfo.position.x : 0) : 0,
            y: info.modelInfo.position ? (info.modelInfo.position.y !== undefined ? info.modelInfo.position.y : 0) : 0,
            z: info.modelInfo.position ? (info.modelInfo.position.z !== undefined ? info.modelInfo.position.z : 0) : 0
        };
        this.modelRotation = {
            x: info.modelInfo.rotation ? (info.modelInfo.rotation.x !== undefined ? info.modelInfo.rotation.x : 0) : 0,
            y: info.modelInfo.rotation ? (info.modelInfo.rotation.y !== undefined ? info.modelInfo.rotation.y : 0) : 0,
            z: info.modelInfo.rotation ? (info.modelInfo.rotation.z !== undefined ? info.modelInfo.rotation.z : 0) : 0
        };  
    }else{
        this.modelPosition = {
            x: info.modelInfo.position ? (info.modelInfo.position.x !== undefined ? info.modelInfo.position.x : this.screen.modelPosition.x) : this.screen.modelPosition.x,
            y: info.modelInfo.position ? (info.modelInfo.position.y !== undefined ? info.modelInfo.position.y : this.screen.modelPosition.y) : this.screen.modelPosition.y,
            z: info.modelInfo.position ? (info.modelInfo.position.z !== undefined ? info.modelInfo.position.z : 0) : 0
        };
        this.modelRotation = {
            x: info.modelInfo.rotation ? (info.modelInfo.rotation.x !== undefined ? info.modelInfo.rotation.x : 0) : 0,
            y: info.modelInfo.rotation ? (info.modelInfo.rotation.y !== undefined ? info.modelInfo.rotation.y : 0) : 0,
            z: info.modelInfo.rotation ? (info.modelInfo.rotation.z !== undefined ? info.modelInfo.rotation.z : 0) : 0
        }
    }
    this.evals = [];
    this.display = info.display?info.display:true;
}

Face.prototype.setupModel = function(){
    if(this.model==undefined&&(this.onlyDynamicModelHolder==false||this.onlyDynamicModelHolder==undefined)){
        this.model = this.dynamicModelHolder.uploadedModel;
        if(this.graphicsTexture!=undefined){
            try{
                this.model.replaceAllTexture(this.graphicsTexture.identifier);
            }catch(e){
                this.evals.push("this.model.replaceAllTexture(this.graphicsTexture.identifier)");
            }
        }
    }
}

Face.prototype.openGraphics = function(x,y){
    this.graphicsTexture = new GraphicsTexture(x,y);
}

Face.prototype.replaceAllTexture = function(name){
    try{
        this.model.replaceAllTexture(Resources.id(name));
    }catch(e){
        this.evals.push("this.model.replaceAllTexture("+Resources.id(name)+")");
    }
}

Face.prototype.graphics = function(){
    return this.graphicsTexture.graphics;
}

Face.prototype.copy = function(){
    let copy = new Face();
    for (let key of Object.keys(obj)) {
        copy[key] = obj[key];
    }
    return  copy;
}

Face.prototype.setupModelMatrix = function(matrices){
    matrices.translate(this.modelPosition.x,this.modelPosition.y,this.modelPosition.z);
    matrices.rotateX(this.modelRotation.x);
    matrices.rotateY(this.modelRotation.y);
    matrices.rotateZ(this.modelRotation.z);
}

Face.prototype.teleportModel = function(position,rotation){
    this.modelPosition.x = position.x||0;
    this.modelPosition.y = position.y||0;
    this.modelPosition.z = position.z||0;
    this.modelRotation.x = rotation.x||0;
    this.modelRotation.y = rotation.y||0;
    this.modelRotation.z = rotation.z||0;
}

Face.prototype.translateModel = function(position,rotation){
    this.modelPosition.x += position.x||0;
    this.modelPosition.y += position.y||0;
    this.modelPosition.z += position.z||0;
    this.modelRotation.x += rotation.x||0;
    this.modelRotation.y += rotation.y||0;
    this.modelRotation.z += rotation.z||0;
}

Face.prototype.draw = function(carriage,ctx,mat){
    if(this.display){
        matrices = mat?mat:new Matrices();
        matrices.pushPose();
        matrices.translate(this.modelPosition.x,this.modelPosition.y,this.modelPosition.z);
        matrices.rotateX(this.modelRotation.x);
        matrices.rotateY(this.modelRotation.y);
        matrices.rotateZ(this.modelRotation.z);
        if(carriage==-1){
            try{
                ctx.drawModel(this.model, matrices);
            }catch(e){
                ctx.drawModel(this.dynamicModelHolder, matrices);
            }
        }else{
            try{
                for(let i=0;i<carriage;i++){
                    ctx.drawCarModel(this.model, i, matrices);
                }    
            }catch(e){
                for(let i=0;i<carriage;i++){
                    ctx.drawCarModel(this.dynamicModelHolder, i, matrices);
                }
            }
        }
        matrices.popPose();
    }
}

Face.prototype.debug = function(ctx){
    ctx.setDebugInfo("model",this.model);
    ctx.setDebugInfo("dyn",this.dynamicModelHolder)
    ctx.setDebugInfo("onlyDynamicModelHolder",this.onlyDynamicModelHolder)
    ctx.setDebugInfo("tex",this.graphicsTexture)
}

Face.prototype.model = function(){
    return this.model;
}

Face.prototype.bufferedImage = function(){
    return this.graphicsTexture.bufferedImage();
}

Face.prototype.close = function(){
    this.graphicsTexture.close();
}

Face.prototype.hide = function(){
    this.display = false;
}

Face.prototype.show = function(){
    this.display = true;    
}

Face.prototype.upload = function(){
    this.graphicsTexture.upload();
}   

Face.prototype.alterRGBA = function(r,g,b,a){
    alterAllRGBA(this.model, r,g,b,a);
}

Face.prototype.applyEvals = function(){
    let newEvals = [];
    for(let i=0;i<this.evals.length;i++){
        try{
            eval(this.evals[i]);
        }catch(e){
            newEvals.push(this.evals[i]);
        }
    }
    this.evals = newEvals;
}

function alterAllRGBA (modelCluster, r ,g , b, a) {
    let vertarray = modelCluster.uploadedTranslucentParts.meshList;
    let vert = vertarray[0];
    for(let i = 0; i < vertarray.length; i++) {
        vert = vertarray[i];
        vert.materialProp.attrState.setColor(r , g , b , a);
    }
    vertarray = modelCluster.uploadedOpaqueParts.meshList;
    vert = vertarray[0];
    for(let i = 0; i < vertarray.length; i++) {
        vert = vertarray[i];
        vert.materialProp.attrState.setColor(r , g , b , a);
    }
}

function getFaceModel(){
    let rawModelBuilder = new RawMeshBuilder(4, "exterior", Resources.id("mtr:library/textures/empty.png"));

    rawModelBuilder.vertex(0.5, 0.5, 0).normal(0, 0, 0).uv(1, 0).endVertex()
    .vertex(-0.5, 0.5, 0).normal(0, 0, 0).uv(0, 0).endVertex()
    .vertex(-0.5, -0.5, 0).normal(0, 0, 0).uv(0, 1).endVertex()
    .vertex(0.5, -0.5, 0).normal(0, 0, 0).uv(1, 1).endVertex()    

    let rawModel = new RawModel();
    rawModel.append(rawModelBuilder.getMesh());
    rawModel.generateNormals();
    return rawModel;
}

function getDoubleFaceModel(){
    let rawModelBuilder = new RawMeshBuilder(4, "exterior", Resources.id("mtr:library/textures/empty.png"));

    rawModelBuilder.vertex(0.5, 0.5, 0).normal(0, 0, 0).uv(1, 0).endVertex()
    .vertex(-0.5, 0.5, 0).normal(0, 0, 0).uv(0, 0).endVertex()
    .vertex(-0.5, -0.5, 0).normal(0, 0, 0).uv(0, 1).endVertex()
    .vertex(0.5, -0.5, 0).normal(0, 0, 0).uv(1, 1).endVertex()    

    rawModelBuilder.vertex(0.5, 0.5, 0).normal(0, 0, 0).uv(0, 0).endVertex()
    .vertex(0.5, -0.5, 0).normal(0, 0, 0).uv(0, 1).endVertex()
    .vertex(-0.5, -0.5, 0).normal(0, 0, 0).uv(1, 1).endVertex()
    .vertex(-0.5, 0.5, 0).normal(0, 0, 0).uv(1, 0).endVertex()

    let rawModel = new RawModel();
    rawModel.append(rawModelBuilder.getMesh());
    rawModel.generateNormals();
    return rawModel;
}
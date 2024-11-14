function Video(info){
    this.type = "Video";
    if(info.modelInfo.model==null){
        let faceModel = info.modelInfo.faceDouble? getDoubleFaceModel(): getFaceModel();
        let rawModel = faceModel.copy();
        rawModel.setAllRenderType(info.modelInfo.renderType?info.modelInfo.renderType:"exterior");
        rawModel.sourceLocation = null;
        rawModel.applyUVMirror(info.modelInfo.uvMirror?(info.modelInfo.uvMirror.u?info.modelInfo.uvMirror.u:false):false,info.modelInfo.uvMirror?(info.modelInfo.uvMirror.v?info.modelInfo.uvMirror.v:false):false);
        rawModel.applyScale(info.modelInfo.size.x,info.modelInfo.size.y,1);
        this.dynamicModelHolder = new DynamicModelHolder();
        this.dynamicModelHolder.uploadLater(rawModel);
        this.model = null;
    }else{
        this.model = info.modelInfo.model;
    }
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
    this.videosPath = info.videoInfo.path;
    this.length = info.videoInfo.length;
    this.numLength = info.videoInfo.numLength;
    this.fps = info.videoInfo.fps;
    this.repeatedly = info.videoInfo.repeatedly?info.videoInfo.repeatedly:false;
    if(info.soundInfo!=null){
        this.soundPitch = info.soundInfo.soundPitch?info.soundInfo.soundPitch:1;
        this.soundName = info.soundInfo.name;
        this.soundVolume = info.soundInfo.volume?info.soundInfo.volume:1;
        this.soundPosition = info.soundInfo.position?info.soundInfo.position:{x:0,y:0,z:0};
        if(info.soundInfo.promptToneName!=null){
            this.promptToneName = info.soundInfo.promptToneName;
            this.promptToneVolume = info.soundInfo.promptToneVolume?info.soundInfo.promptToneVolume:1;
            this.promptTonePitch = info.soundInfo.promptTonePitch?info.soundInfo.promptTonePitch:1;
            this.promptTonePosition = info.soundInfo.promptTonePosition?info.soundInfo.promptTonePosition:{x:0,y:0,z:0};
        }
    }
    this.num = 0;
    this.name = this.videosPath + `${this.num}`.padStart(this.numLength, '0') + ".png";
    this.startTime = -1;
    this.display = info.display?info.display:true;
    this.delay = info.videoInfo.delay?info.videoInfo.delay:0;
    this.tempTime = -1;
    this.isSetup = false;
    this.evals = [];
}

Video.prototype.setupModel = function(){
    if(this.isSetup==false){
        if(this.model==null){
            this.model = this.dynamicModelHolder.uploadedModel;
            this.model.replaceAllTexture(Resources.id(this.name));
        }
        this.isSetup = true;
    }
}

Video.prototype.setupSound = function(isEyecandy,ctx){
    if(isEyecandy){
        if(this.soundName!=null){
            ctx.playSound(Resources.id(this.soundName) , 0.0000001 , 1);
        }
        if(this.promptToneName!=null){
            ctx.playSound(Resources.id(this.promptToneName) , 0.0000001 , 1);
        }
    }else{
        if(this.soundName!=null){
            ctx.playCarSound(Resources.id(this.soundName) , 0 , 0 , 0 , 0 , 0.0000001 , 1);
        }
        if(this.promptToneName!=null){
            ctx.playCarSound(Resources.id(this.promptToneName) , 0 , 0 , 0 , 0 , 0.0000001 , 1)
        }
    }
}

Video.prototype.setupModelMatrix = function(matrices){
    matrices.translate(this.modelPosition.x,this.modelPosition.y,this.modelPosition.z);
    matrices.rotateX(this.modelRotation.x);
    matrices.rotateY(this.modelRotation.y);
    matrices.rotateZ(this.modelRotation.z);
}

Video.prototype.draw = function(carriage,ctx,mat){
    if(this.display==true){
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

Video.prototype.teleportModel = function(position,rotation){
    this.position.x = position.x||0;
    this.position.y = position.y||0;
    this.position.z = position.z||0;
    this.rotation.x = rotation.x||0;
    this.rotation.y = rotation.y||0;
    this.rotation.z = rotation.z||0;
}

Video.prototype.translateModel = function(position,rotation){
    this.modelPosition.x += position.x||0;
    this.modelPosition.y += position.y||0;
    this.modelPosition.z += position.z||0;
    this.modelRotation.x += rotation.x||0;
    this.modelRotation.y += rotation.y||0;
    this.modelRotation.z += rotation.z||0;
}

Video.prototype.play = function(time,carriage,ctx){
    this.startTime = time;
    if(this.soundName!=null){
        if(this.soundName!=null){
            if(carriage==-1){
                ctx.playSound(Resources.id(this.soundName) , this.soundVolume , this.soundPitch);
            }else{
                for(let i=0;i<carriage;i++){
                    ctx.playCarSound(Resources.id(this.soundName) , i , this.soundPosition.x , this.soundPosition.y , this.soundPosition.z , this.soundVolume , this.soundPitch);
                };
            }
        }
        if(this.promptToneName!=null){
            if(carriage==-1){
                ctx.playSound(Resources.id(this.promptToneName) , this.promptToneVolume , this.promptTonePitch);
            }else{
                for(let i=0;i<carriage;i++){
                    ctx.playCarSound(Resources.id(this.promptToneName), i , this.promptTonePosition.x , this.promptTonePosition.y , this.promptTonePosition.z , this.promptToneVolume ,this.promptTonePitch)   
                }
            }
        }
    }
}

Video.prototype.stop = function(){
    this.startTime = -1;
}

Video.prototype.update = function(time,carriage,ctx){
    if(this.startTime != -1&&(time-this.startTime)*this.fps<=this.length+1){
        this.num = Math.floor((time-this.startTime)*this.fps);
        this.name = this.videosPath + `${this.num}`.padStart(this.numLength, '0') + ".png";
        this.model.replaceAllTexture(Resources.id(this.name));
    }else if(this.repeatedly==true){
        if(this.tempTime == -1){
            this.tempTime = time;
        }
        if(time-this.tempTime>this.delay){
            if(this.soundName!=null){
                if(carriage==-1){
                    ctx.playSound(Resources.id(this.soundName) , this.soundVolume , this.soundPitch);
                }else{
                    for(let i=0;i<carriage;i++){
                        ctx.playCarSound(Resources.id(this.soundName) , i , this.soundPosition.x , this.soundPosition.y , this.soundPosition.z , this.soundVolume , this.soundPitch);
                    };
                }
            }
            if(this.promptToneName!=null){
                if(carriage==-1){
                    ctx.playSound(Resources.id(this.promptToneName) , this.promptToneVolume , this.promptTonePitch);
                }else{
                    for(let i=0;i<carriage;i++){
                        ctx.playCarSound(Resources.id(this.promptToneName), i , this.promptTonePosition.x , this.promptTonePosition.y , this.promptTonePosition.z , this.promptToneVolume ,this.promptTonePitch)   
                    }
                }
            }
            this.startTime = time;
            this.num = 0;
            this.name = this.videosPath + `${this.num}`.padStart(this.numLength, '0') + ".png";
            this.model.replaceAllTexture(Resources.id(this.name));  
            this.tempTime = -1;
        }
    }
}

Video.prototype.isUnderWay = function(time){
    if((time-this.startTime)*this.fps>this.length+1||this.startTime==-1){
        return false;
    }else{
        return true;
    }
}

Video.prototype.debug = function(ctx){
    ctx.setDebugInfo("model",this.model)
    ctx.setDebugInfo("start",this.startTime)
    ctx.setDebugInfo("num",this.num)
    ctx.setDebugInfo("name",this.name)
    ctx.setDebugInfo("length",this.length)
    ctx.setDebugInfo("numLength",this.numLength)
    ctx.setDebugInfo("fps",this.fps)
    ctx.setDebugInfo("pitch",this.soundPitch)
    ctx.setDebugInfo("volume",this.soundVolume)
    ctx.setDebugInfo("videoPath",this.videosPath)
    ctx.setDebugInfo("soundName",this.soundName)
    ctx.setDebugInfo("repeatedly",this.repeatedly)
    ctx.setDebugInfo("name",this.name)
    ctx.setDebugInfo("num",this.num)
    ctx.setDebugInfo("delay",this.delay)
    ctx.setDebugInfo("tempTime",this.tempTime)
    ctx.setDebugInfo("display",this.display)
    ctx.setDebugInfo("time",Timing.elapsed())
    ctx.setDebugInfo("promptToneName",this.promptToneName)
    ctx.setDebugInfo("promptToneVolume",this.promptToneVolume)
}

Map.prototype.drawVideo= function(carriage,ctx,matrices){
    for (let [key, value] of map){
        value.draw(carriage,ctx,matrices);
    }
}

Map.prototype.updateVideo = function(time,carriage,ctx){
    for (let [key, value] of map){
        value.update(time,carriage,ctx);
    }
}

Video.prototype.hide = function(){
    this.display = false;
}

Video.prototype.show = function(){
    this.display = true;    
}

Video.prototype.jumpToFrame = function(frame){
    this.num = frame;
    this.name = this.videosPath + `${this.num}`.padStart(this.numLength, '0') + ".png";
    this.model.replaceAllTexture(Resources.id(this.name));
}

Video.prototype.alterRGBA = function(r,g,b,a){
    alterAllRGBA(this.model, r,g,b,a);
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
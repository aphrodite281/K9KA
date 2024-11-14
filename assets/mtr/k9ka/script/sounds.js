const runSound = Resources.id("mtr:k9ka.run");

function create(ctx, state, train){
    state.p=0;
    state.n=0;
    state.v=0;
}

function render(ctx, state, train){
    state.p=getPitch(train.speed());
    if(train.speed()==0){
        state.p=0.5;
        state.v=0.2;
    }else{
        state.v=0.3+train.speed()*0.6;
    }
    if(Timing.elapsed()>state.n && train.isOnRoute()){
        for(let i = 0; i < train.trainCars(); i++){
            ctx.playCarSound(runSound, i , 0, 0, 0, state.v, state.p+Math.random()*0.1-0.05);
        }
        state.n=Timing.elapsed()+0.02;
    }
}

function getPitch(speed){
    return speed<0.4?speed*1.75+0.3:speed*1+0.5;
}
// -*-js-*-

var parameterA,deltaA;

pmDisabled = true;

repetitionQ = function(pos){ return false; }

function probFromScore(s){
    "use strict";
    const pc = 0.001;
    return 2**(pc*s);
}

function mcMoveFromPos(pos){
    "use strict";
    const mvs = movesFromPos(pos,false);
    const vals = mvs.map(m => scoreFor(positionFromMove(m,pos)));
    const probs = vals.map(probFromScore);
    return randChoice(mvs,probs);
}

function initMC(cons,delta){
    "use strict";
    parameterA = cons;
    deltaA = delta;
}

function playOneGame(parAlst){
    "use strict"
    setup(Infinity,posInit);
    let i=0;
    while(!gameOverQ(posCur)){
        playOneMove(parAlst[i]);
        i = 1 - i; };
    return posCur.kingLoc.equal([-1,-1]) ? [1,0] : [0,1];         
}

function playOneMove(params){
    "use strict";
    copyValsToObj(parameterA,params);
    let mv = mcMoveFromPos(posCur);
    postMove(mv,"opp");
}

function playMatch(p1,p2){
    "use strict";
    const len = 15;
    let scr = [0,0];
    for(let i=0; i<len; i+=1){
        scr = scr.vector2Add(playOneGame([p1,p2])); }
    for(let i=0; i<len; i+=1){
        scr = scr.vector2Add(playOneGame([p2,p1]).reverse()); }
    return scr;
}

function changeSignsRand(obj){
    "use strict";
        let res;
    if(typeof(obj)==='number'){
        return randBool() ? obj : -obj; }
    else{
        res = Object.clone(obj);
        for(let k of Object.keys(obj)){
            res[k] = changeSignsRand(obj[k]); } }
    return res; 
}

function mcIter(){
    "use strict";
    const dels = changeSignsRand(deltaA);
    const ps1 = addObjs(parameterA,dels);
    const ps2 = addObjs(parameterA,multObj(-1,dels));
    const scr = playMatch(ps1,ps2);
    const p = scr[0]/(scr.sum());
    const winner = !randBool(p) ? ps1 : ps2;
    copyValsToObj(parameterA,winner);
    return parameterA;
}

function mcImprove(cons,del){
    "use strict";
    initMC(cons,del);
    while(true){
        console.log(mcIter()); }
}

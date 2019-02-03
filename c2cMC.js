// -*-js-*-

var parameterA,deltaA,deltaZero;

pmDisabled = true;

repetitionQ = function(pos){ return false; }

function wtFromScore(s){
    "use strict";
    const pc = 0.001;
    return 2**(-pc*s);
}

function mcMoveFromPos(pos){
    "use strict";
    const mvs = movesFromPos(pos);
    const mvsred = (mvs.length>numChoices) ? mvs.slice(0,numChoices) : mvs;
    const vals = mvsred.map(m => scoreFor(positionFromMove(m,pos)));
    const wts = vals.map(wtFromScore);
    return randChoice(mvsred,wts);
}

function initMC(cons,delta){
    "use strict";
    parameterA = cons;
    deltaA = Object.clone(delta);
    deltaZero = zeroObj(delta);
}

function playOneGame(parAlst){
    "use strict"
    setup(Infinity,posInit);
    let i=0;
    let m=0;
    while(!gameOverQ(posCur)){
        playOneMove(parAlst[i]);
	m += 1;
	if(m>99){
	    return [0.8,0.2]; }
        i = 1 - i; };
    return posCur.kingLoc.equal([-1,-1]) ? [1,0] : [0,1];         
}

function playOneMove(params){
    "use strict";
    copyValsToObj(parameterA,params);
    let mv = mcMoveFromPos(posCur);
    //console.log("mv = ",mv);
    posCur =  positionFromMove(mv,posCur);
    //postMove(mv,"opp");
}

function playMatch(p1,p2){
    "use strict";
    const len = 15;
    let scr = [0,0];
    for(let i=0; i<len; i+=1){
        scr = scr.vector2Add(playOneGame([p1,p2])); }
    for(let i=0; i<len; i+=1){
        scr = scr.vector2Add(playOneGame([p2,p1]).reverse()); }
    console.log("score = ",scr);
    return scr;
}

const tcon = 2**(-1/300);

function changeSignsRand(obj,t){
    "use strict";
    let res;
    if(typeof(obj)==='number'){
        return randBool(7/8) ? 0 : tcon**t * obj; 
; }
    else{
        res = Object.clone(obj);
        for(let k of Object.keys(obj)){
            res[k] = changeSignsRand(obj[k],t); } }
    return res; 
}

function calcP(s){
    "use strict";
    const n = s.sum();
    const r = s[0];
    return bernoulliCum(n,0.5,r);
}

function mcIter(t){
    "use strict";
    let del;
    do{
        del = changeSignsRand(deltaA,t);
    }while(equalObj(del,deltaZero));
    const ps1 = addObjs(parameterA,del);
    const ps2 = addObjs(parameterA,multObj(-1,del));
    const scr = playMatch(ps1,ps2);
    const pnew = calcP(scr);
    const rB = randBool(pnew);
    const winner = rB ? ps1 : ps2;
    let q = rB ? pnew : 1-pnew;
    q = Math.max(q,0.5);
    copyValsToObj(parameterA,winner);
    return [parameterA,q];
}

function mcImprove(cons,del){
    "use strict";
    initMC(cons,del);
    let p = 0.5, t = 0;
    while(true){
        let iter = mcIter(t);
        p = iter[1];
        t += 1;
        console.log(iter[0]);
        console.log("t = ",t); }
}

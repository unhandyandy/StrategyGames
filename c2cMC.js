// -*-js-*-

var parameterA,deltaA,deltaZero;

pmDisabled = true;

numChoices = Infinity;

//repetitionQ = function(pos){ return false; }

function wtFromScore(s){
    "use strict";
    const pc = 0.001;
    return 2**(-pc*s);
}

function mcMoveFromPos(pos){
    "use strict";
    const rawmvs = movesFromPos(pos,true,true);
    //const mvsred = (mvs.length>numChoices) ? mvs.slice(0,numChoices) : mvs;
    const mvs = rawmvs.getList();
    //const vals = mvsred.map(m => scoreFor(positionFromMove(m,pos)));
    const vals = rawmvs.getVals();
    const wts = vals.map(wtFromScore);
    return randChoice(mvs,wts);
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
function rollout(startpos,probtree){
    "use strict"
    //setup(Infinity,startpos);
    posCur = startpos.clone();
    let m=0;
    while(!gameOverQ(posCur)){
        if(minID(posCur) in probtree){
            playOneMoveFromTree(probtree); }
        else{
            probtree[minID(posCur)] = movesFromPos(posCur,true,true);
            const scr = scoreFor(posCur);
            const res = scr > 0 ?
                  (posCur.color==="b" ? [1,0] : [0,1]) :
                  (posCur.color==="b" ? [0,1] : [1,0]);
            return res; }
	m += 1;
	if(m>99){
	    return [0.8,0.2]; } };
    return posCur.kingLoc.equal([-1,-1]) ? [1,0] : [0,1];         
}

function mcRolloutN(pos,len,probtree){
    "use strict";
    let score = [0,0];
    let cnt = 0;
    while(cnt<len){
        cnt += 1;
        let newscore = rollout(pos,probtree);
        score = score.vector2Add(newscore); }
    return score;
}

function scoreToReal(scr){
    "use strict";
    const buffer = 2;
    return scr[0]/(scr[0]+scr[1]+buffer);
}

function getMaxInDict( dict ){
    "use strict";
    let max = -Infinity;
    let best;
    for(let m in dict){
        const curscr = scoreToReal(dict[m]);
        if(curscr>max){
            max = curscr;
            best = m; } }
    return [max,[eval(best)]];
}

function mcBestMove(pos,lenro){
    "use strict";
    const scrdct = {};
    const rawmvs = movesFromPos(pos,true,true);
    const probtree = {};
    probtree[minID(pos)] = rawmvs;
    const mvs = rawmvs.getList();
    for(let mv of mvs){
        const startpos = positionFromMove(mv,pos);
        const score = mcRolloutN(startpos,lenro,probtree);
        if(pos.color==="w"){
            score.reverse(); }
        scrdct[JSON.stringify(mv)] = score; }
    console.log(scrdct);
    const best = getMaxInDict(scrdct);
    //setup(Infinity,positionFromMove(best,pos));
    posCur = pos.clone();
    return best;        
}

function playOneMove(params){
    "use strict";
    copyValsToObj(parameterA,params);
    let mv = mcMoveFromPos(posCur);
    //console.log("mv = ",mv);
    posCur =  positionFromMove(mv,posCur);
    //postMove(mv,"opp");
}

function randMoveFromMV(mv){
    "use strict";
    const mvs = mv.getList();
    const vals = mv.getVals();
    return randChoice(mvs,vals);
}
function playOneMoveFromTree(probtree){
    "use strict";
    const rawmvs = probtree[minID(posCur)];
    const mv = randMoveFromMV(rawmvs);
    posCur =  positionFromMove(mv,posCur);
    //update history?
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

function mcImprove(cons,del,tplus){
    "use strict";
    if(tplus==undefined){
        tplus = 0; }
    initMC(cons,del);
    let p = 0.5, t = tplus;
    while(true){
        let iter = mcIter(t);
        p = iter[1];
        t += 1;
        console.log(iter[0]);
        console.log("t = ",t); }
}

function mcImproveMove(pos,mv){
    "use strict";
    const numchOld = numChoices;
    numChoices = Infinity;
    let test = false;
    let t = 0;
    while(!test){
        const res = mcIterMove(pos,mv,numchOld,t);
        t += 1;
        console.log(res[1]);
        console.log("t = ",t);
        test = res[0]; }
    numChoices = numchOld;
}

function mcIterMove(pos,mv,cut,t){
    "use strict";
    let del;
    do{
        del = changeSignsRand(deltaA,t);
    }while(equalObj(del,deltaZero));
    const ps1 = addObjs(parameterA,del);
    const ps2 = addObjs(parameterA,multObj(-1,del));
    copyValsToObj(parameterA,ps1);
    const mvs1 = movesFromPos(pos);
    const scr1 = mvs1.findIndex(m => m.equal(mv));
    copyValsToObj(parameterA,ps2);
    const mvs2 = movesFromPos(pos);
    const scr2 = mvs2.findIndex(m => m.equal(mv));
    const p = (scr2+1)/(scr1+scr2+2);
    const winner = randBool(p) ? ps1 : ps2;
    copyValsToObj(parameterA,winner);
    const worst = Math.max(scr1,scr2);
    console.log("worst = ",worst);
    if(worst<cut){
        return [true,winner]; }
    else{
        return [false,winner]; }
}

function mcChangeEval(pos){
    "use strict";
    const numchOld = numChoices;
    numChoices = Infinity;
    let test = false;
    let t = 0;
    const sign = - Math.sign(scoreFor(pos));
    while(!test){
        const res = mcChangeEvalIter(pos,sign,t);
        t += 1;
        console.log(res[1]);
        console.log("t = ",t);
        test = res[0]; }
    numChoices = numchOld;
}

function mcChangeEvalIter(pos,sign,t){
    "use strict";
    let del;
    do{
        del = changeSignsRand(deltaA,t+300);
    }while(equalObj(del,deltaZero));
    const ps1 = addObjs(parameterA,del);
    const ps2 = addObjs(parameterA,multObj(-1,del));
    copyValsToObj(parameterA,ps1);
    const scr1 = scoreFor(pos);
    copyValsToObj(parameterA,ps2);
    const scr2 = scoreFor(pos);
    const s1 = Math.exp(sign*scr1);
    const s2 = Math.exp(sign*scr2);
    const p = s1/(s1+s2);
    const winner = randBool(p) ? ps1 : ps2;
    copyValsToObj(parameterA,winner);
    const worst = Math.max(scr1,scr2);
    console.log("worst = ",worst);
    if(sign*worst>0){
        return [true,winner]; }
    else{
        return [false,winner]; }

}

function minimaxAB(pos,dep,plyr){
    "use strict";
    const rolen = 60;
    const best = mcBestMove(pos,rolen);
    return best;
}

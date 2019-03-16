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
            prevpos = posCur;
            playOneMoveFromTree(probtree); }
        else{
            const mvs = movesFromPos(posCur,true,true);
            mvs.mapVals(wtFromScore);
            probtree[minID(posCur)] = mvs;
            const scr = scoreFor(posCur);
            const res = scr > 0 ?
                  (posCur.color==="b" ? [0.6,0.4] : [0.4,0.6]) :
                  (posCur.color==="b" ? [0.4,0.6] : [0.6,0.4]);
            return res; }
	m += 1;
	if(m>99){
	    return [0.8,0.2]; } };
    const res =  posCur.kingLoc.equal([-1,-1]) ? [1,0] : [0,1];
    return res;
}

function rolloutRec(startpos,probtree){
    "use strict"
    posCur = startpos.clone();
    
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
    //let mv = aidedTS(posCur,6,20).mov;
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
        del = changeSignsRand(multObj(1,deltaA),t);
    }while(equalObj(del,deltaZero));
    const oldPA = Object.clone(parameterA);
    const ps1 = addObjs(parameterA,del);
    const ps2 = addObjs(parameterA,multObj(-1,del));
    const scr = playMatch(ps1,ps2);
    //const pnew = calcP(scr);
    //const rB = randBool(pnew);
    //const winner = rB ? ps1 : ps2;
    const winner = scr[0]>scr[1] ? ps1 :
	           scr[0]<scr[1] ? ps2 : oldPA;
    //let q = rB ? pnew : 1-pnew;
    //q = Math.max(q,0.5);
    copyValsToObj(parameterA,winner);
    return parameterA;
}

function mcImprove(cons,del,tplus){
    "use strict";
    if(tplus==undefined){
        tplus = 0; }
    initMC(cons,del);
    let t = tplus;
    while(true){
        let iter = mcIter(t);
        //p = iter[1];
        t += 1;
        console.log(iter);
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

tree = {};

function minimaxAB(pos,dep,plyr){
    "use strict";
    //const rolen = 60;
    const best = aidedTS(pos,8,30,tree);
    return [-best.val,[best.mov]];
}

function makePVpair([v,p,m]){
    const res = {};
    res.pos = p;
    res.val = v;
    res.mov = m;
    return res;
}

function children(pos){
    "use strict"
    const mvs = movesFromPos(pos);
    const postns = mvs.map(m => [m,positionFromMove(m,pos)]);
    const pairs = postns.map(p => [scoreExp(p[1]),p[1],p[0]]);
    pairs.sort((p1,p2) => p1[0]-p2[0]);
    return pairs.map(makePVpair);
}

treeNodeProto = { "pos":posInit,
                  "children":children(posInit),
                  "val":scoreExp(posInit)         
                }

function makeTN(pos,val){
    "use strict"
    if(val===undefined){
        val = scoreExp(pos); }
    const newtn = Object.clone(treeNodeProto);
    newtn.pos = pos;
    newtn.children = children(pos);
    newtn.val = val;
    //newtn.resort = false;
    newtn.rep = false;
    newtn.vst = 0;
    return newtn;
}

function aidedTS(pos,dep,brd,tree){
    "use strict";
    if(tree===undefined){
        const tree = {}; }
    const val = scoreExp(pos);
    const {bestpos,bestval,brdrem,bestmv,rep} = aidedTSaux(pos,val,dep,brd,tree);
    if(!rep){
        tree[minID(pos)].val = -bestval; }
    tree[minID(bestpos)].rep = true;
    console.log("breadth: ",brd-brdrem);
    return {"pos":bestpos,
            "mov":bestmv,
            "val":bestval};
}

const aidedTScut = 0.1;

function cutFun(val){
    "use strict"
    
}

const nodeInertia = 1;
function adjustVal(oldval,newval,visits){
    "use strict"
    const past = nodeInertia + visits; 
    return (past*oldval + newval)/(past + 1);
}

function aidedTSaux(pos,val,dep,brd,tree){
    "use strict"
    if(!(minID(pos) in tree)){
        tree[minID(pos)] = makeTN(pos); }
    const node = tree[minID(pos)];
    node.vst += 1;
    node.rep = true;
    if(dep===0){
        return {"bestpos":null,
                "bestval":-node.val,
                "brdrem":brd,
                "bestmv":null,
                "rep":false }; }
    else{
        //node.resort = true;
        let brdloc = brd;
        const best = node.children[0];
        for(let c of node.children){
            const id = minID(c.pos);
            const crep = (id in tree) && tree[id].rep;
            if(gameOverQ(c.pos) || crep){
                //if(crep){console.log(id);}
                const newval = crep ?
                      (c.pos.color==="b" ? 1 : 0) :
                      c.val;
                resortNode(tree,node);
                return {"bestpos":c.pos,
                        "bestval":newval,
                        "brdrem":brdloc,
                        "bestmv":c.mov,
                        "rep":crep }; }
            else{
                const {bestpos,bestval,brdrem,bestmv,rep} = aidedTSaux(c.pos,c.val,dep-1,brdloc,tree);
                brdloc = brdrem;
                const cnode = tree[id];
                if(!rep){
                    const newval = adjustVal(c.val,-bestval,cnode.vst);
                    c.val = newval;
                    cnode.val = newval; }
                cnode.rep = false;
                if(val-bestval<aidedTScut || brdloc===0){
                    resortNode(tree,node);
                    return {"bestpos":c.pos,
                            "bestval":-bestval,
                            "brdrem":brdloc,
                            "bestmv":c.mov,
                            "rep":rep }; }
                else{
                    brdloc -= 1;
                    if(-bestval<best.val){
                        best.pos = c.pos;
                        best.val = -bestval;
                        best.mov = c.mov;
                        best.rep = rep; } } } }
        resortNode(tree,node);
        return {"bestpos":best.pos,
                "bestval":best.val,
                "brdrem":brdloc,
                "bestmv":best.mov,
                "rep":best.rep }; }  
}

function playGameAuto(dep,brd){
    "use strict"
    posCur = posInit;
    while(!gameOverQ(posCur)){
        let {pos,val} = aidedTS(posCur,dep,brd);
        posCur = pos;
        postPosition(posCur);
        console.log(pos.mat); }
}

function makeMoveAuto(dep,brd){
    "use strict"
    let {pos,val} = aidedTS(posCur,dep,brd);
    posCur = pos;
    postPosition(posCur);
    console.log(val); 
}

function lookupVal(tree,ch){
    "use strict"
    const id = minID(ch.pos);
    if(id in tree){
        const newval = tree[id].val;
        ch.val = newval;
        return newval; }
    else{
        return ch.val; }
}

function resortNode(tree,node){
    "use strict"
    node.children.sort((c1,c2) => lookupVal(tree,c1) - lookupVal(tree,c2));
}

function resortTree(tree){
    "use strict"
    let cnt = 0;
    for(let p in tree){
        if(tree[p].resort){
            cnt +=1 ;
            resortNode(tree,tree[p]); } }
    console.log(cnt);
}

function resetReps(tree){
    "use strict"
    for(let id in tree){
        if(typeof(tree[id])!="function" && tree[id].rep){
            tree[id].rep = false; }}
}


// for(id in tree){
//     if(typeof(tree[id])!="function" && tree[id].rep){
//         console.log(id)}}

function errorCase(pos,val){
    "use strict"
    return Math.abs(scoreExp(testpos0)-val);
}

function errorData(datalist,newparams){
    "use strict"
    if(newparams===undefined){
        newparams = Object.clone(parameterA); }
    copyValsToObj(parameterA,newparams);
    const errs = datalist.map(d => errorCase(...d))
    return Math.plus(...errs);
}

let data1 = [[testpos0,5000],[testpos1,6000]];

function trainParams(data){
    "use strict"
    let tol = 0.001;
    let pat = 2;
    const originalParams = Object.clone(parameterA);
    let err = errorData(data,originalParams);
    do{
        let del;
        do{del = changeSignsRand(multObj(1,deltaA),0);
        }while(equalObj(del,deltaZero));
        let error = function(t){
            const newparams = addObjs(originalParams,multObj(t,del));
            return errorData(data,newparams); }
        let current = findMin(error,tol);
        if(current===undefined){
            tol *= 2;
            copyValsToObj(parameterA,originalParams); }
        else{
            let [t,errnew] = current;
            let newparams = addObjs(originalParams,multObj(t,del));
            copyValsToObj(parameterA,newparams);
            if(Math.abs(errnew-err) < 1){
                pat -= 1; }
            else{
                err = errnew; } }
        console.log(err);
    }while(pat>0)
    return err;
}


function scoreExp(pos){
    "use strict"
    const s = scoreFor(pos);
    return Math.atan(s/10000)/Math.PI + 0.5;
}

function getDataFromHist(){
    "use strict"
    const games = gameHistory[1];
    return games.map(g => [g,tree[minID(g)].val]);
}

function getDataFromTree(){
    "use strict"
    const data = [];
    for(let id in tree){
        if(typeof(tree[id])!="function"){
            let node = tree[id];
            data.push([node.pos,node.val]); } }
    return data;
}


initMC(cons,consDelta);



function postMortem(hist,plyr){
    "use strict"
    const data = getDataFromHist();
    trainParams(data);
}

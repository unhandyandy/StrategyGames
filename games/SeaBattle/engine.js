// -*-js-*-

/*jslint browser: true, devel: true, es5: true */

/*global nbrs, lookUp, setMatEntry, repeat, comp, score, opposite, 
  movesFromLoc, flatten1, onBoardQ, makeConstantArraySimp, makeConstantArray, 
  numMvs, cartesianProd, matrixTranspose, 
  setBGCols, rowLen, gameHistory, posCur, setButtonProps, numberSequence,
  mapLp */

const cons={"moves":2,
            "kingmoves":6,
            "vuln":8,
            "isol":1,
            "safe":1,
            "win":1000000,
            //"loss":1000,
            "luft":4,
            "thrus":100,
	    "pieces":8 };

const handBird = 16;

const size=9;

var rowScore = {};
for (k of Object.keys(cons)){
    rowScore[k] = {"b":0,"w":0}; }

// const rowScore = {"moves":{"b":0,"w":0},
//                   "vuln":{"b":0,"w":0},
//                   "isol":{"b":0,"w":0},
//                   "safe":{"b":0,"w":0},
//                   "win":{"b":0,"w":0},
//                   //                "loss":{"b":0,"w":0},
//                   "thrus":{"b":0,"w":0},
//                   "luft":{"b":0,"w":0} };
//const keys = ["moves","vuln","isol","safe","win","luft","thrus"];

function opposed(p,q){
    "use strict";
    return (p==="b") ? (q==="w"||q==="k") : (
        (p==="w"||p==="k") ? q==="b" : false ) }

function oppColor(c){
    "use strict";
    return (c==="b") ? "w" : (c===0) ? 0 : "b"; }

function color(p){
    "use strict";
    if((p==="w")||(p==="k")){
        return("w"); }
    else if(p==="b"){
        return("b"); }
    else return(0); }
           

function scoreRow(r,reach){
    "use strict";
    var score=Object.clone(rowScore);
    //const p=r[0];
    return(scoreRowAux(r,score,"e","e",0,reach));
}

function scoreRowAux(r,score,prev,lastp,moves,reach){
    "use strict";
    if(reach===undefined){
        reach = function(){return false}; }
    if(r.length===0){
        return(score); }
    const p=r[0],
          q=r[1],
          j = size - r.length,
          tail=r.slice(1,),
          cp=color(p),
          clp=color(lastp);
    var newmoves = moves;
    if(p!=0){
	score.pieces[cp] += 0.5; }
    if((color(p)===color(prev))&&(p!=0)){
        score.safe[cp]+=1; }
    // if((p!=0)&&opposed(p,lastp)&&lastvuln&&(lastp!="k")){
    //     score.vuln[cp]+=1; }
    // if((p===0)&&["b","w"].has(prev)&&lastvuln&&reach(j,oppColor(prev))){
    //     score.vuln[oppColor(prev)] += 1; }
    if((p===0)&&(prev==="k")&&reach(j,"b")){
        score.thrus.b += 1; }
    if((p==="k")&&(prev===0)&&reach(j-1,"b")){
        score.thrus.b += 1; }
    // vulnerabilities
    if(["b","w"].has(p)&&(prev===0)&&(q===oppColor(p))&&reach(j-1,q)){
        score.vuln[q] += 1; }
    if(["b","w"].has(p)&&(q===0)&&
       (prev===oppColor(p))&&reach(j+1,oppColor(p))){
        score.vuln[prev] += 1; }
    // if((p!=0)&&opposed(p,prev)&&lastvuln&&(lastp!="k")){
    //     score.vuln[cp] += 1; }
    // if(["b","w"].has(lastp)&&(lastisol)&&(p===0)){
    //     score.isol[clp]+=1; }
    if(["b","w"].has(p)&&(prev===0)&&(q===0)){
        score.isol[oppColor(cp)] += 1; }
    if((clp!=0)&&(p===0)){
        score.moves[clp]+=1;
        if(lastp==="k"){
            score.kingmoves.w += 1; } }
    if(p===0){
        newmoves+=1;}
    if(((p==="k")&&[0,"w"].has(prev))||((prev==="k")&&[0,"w"].has(p))){
        //score.luft.b -= 1; 
        score.luft.w += 1; }
    if(((p==="k")&&(newmoves+r.length===size))||
       ((lastp==="k")&&(r.length===1)&&(p===0))){
        //score.thrus.b -= 1; 
        score.thrus.w += 1; }
    if((lastp==="k")&&(newmoves>0)&&(p==="b")){
        score.thrus.b += 1; }
    if((p==="k")&&[size,1].has(r.length)){
        score.win["w"]+=1; }
    // if(((lastp==="k")&&(p===0))||((p==="k")&&(lastp===0))){
    //     score.win.w+=1; }
    if(p!=0){
        score.moves[cp]+=newmoves;
        if(p==="k"){
            score.kingmoves.w += newmoves; }
        newmoves=0; }

    // var newisol=((p!=0)&&(prev===0))||((p===0)&&lastisol);
    return scoreRowAux(tail,
                       score,
                       p,
                       p===0 ? lastp : p,
                       newmoves,
                       reach);
}

function addScores(s1,s2){
    "use strict";
    var res=Object.clone(rowScore);
    var k,c;
    for (k of Object.keys(cons)){
        for (c of ["b","w"]){
            res[k][c]=s1[k][c]+s2[k][c]; } }
    return(res); }

function sumScores(scorelst){
    "use strict";
    var res=Object.clone(rowScore);
    for (const s of scorelst){
        res = addScores(res,s); }
    return(res); }
    
function scoreMat(mat,reachable){
    "use strict";
    if(reachable===undefined){
        reachable = function(i){return function(){return false}; }; }
    var lines=mat.concat(matrixTranspose(mat));
    var scores = mapLp(lines,
                       function(r,i){
                           return scoreRow(r,reachable(i))});
    var sum = sumScores(scores);
    if(sum.luft.w===0){
        sum.win.b += 1; }
    return sum; }

function canReach(pos,p,loc,mvs){
    "use strict";
    var poss = mvs.filter(function(m){return m[1].equal(loc)});
    poss = poss.filter(function(m){return lookUp(pos.mat,m[0])===p});
    return poss.length > 0; }

function possMovesBoth(pos){
    "use strict"
    var res = movesFromPos(pos,false);
    res = res.concat(movesFromPos(pos.flip(),false));
    return res;
}

function scoreFor(pos){
    "use strict";
    const c = pos.color;
    const mat = pos.mat;
    const reachable = function(i){
        return function(j,p){
            return canReach(pos,p,[i,j],possMovesBoth(pos)); }; }
    const score = scoreMat(mat,reachable);
    var s = 0;
    for (var k of Object.keys(cons)){        
	s += cons[k]*(handBird*score[k][c]-score[k][oppColor(c)]); }
    if(score.thrus.b>0&&score.luft.w===1){
	s += c==="b" ? 10000 : -10000; }
    s += cons.thrus**score.thrus.w * (c==="w" ? 1 : -1);
    return(s); }

function scorePosSimp(pos){
    "use strict";
    const reachable = function(i){
        return function(j,p){
            const loc = (i<size) ? [i,j] : [j,i % size];
            return canReach(pos,p,loc,possMovesBoth(pos)); }; }
    return scoreMat(pos.mat,reachable); }

// testing
// const testrow1=["b",0,0,"w",0,"b","b","k",0],
//       testrow2=["b",0,0,"w",0,"b",0,"k",0],
//       testrow3=["b",0,0,"w",0,"b",0,0,"k"],
//       score1=scoreRow(testrow1),
//       score2=scoreRow(testrow2),
//       score3=scoreRow(testrow3),
//       testmat1=[testrow1,testrow2,testrow3,testrow1,testrow2,testrow3,testrow1,testrow2,testrow3]
// testing


pmDisabled = true;

//const noComp = true;

desiredDepth = 4;

numChoices = 3;

const bdSize = 9;

const startMat = [[0,0,0,"b","b","b",0,0,0],
                 [0,0,0,0,"b",0,0,0,0],
                 [0,0,0,0,"w",0,0,0,0],
                 ["b",0,0,0,"w",0,0,0,"b"],
                 ["b","b","w","w","k","w","w","b","b"],
                 ["b",0,0,0,"w",0,0,0,"b"],
                 [0,0,0,0,"w",0,0,0,0],
                 [0,0,0,0,"b",0,0,0,0],
                  [0,0,0,"b","b","b",0,0,0]];

function makeInitBdTab() {
    "use strict";
    var res = [], i, j;
    for (i=0;i<bdSize;i+=1){
        var row = [];
        for (j=0;j<bdSize;j+=1){
            var c = startMat[i][j];
            c = (c===0) ? " " : c;
            row.push([c,[i,j],
                      {'height' : 56, 'width' : 64, 'fontsize' : 48,
                       'bg':"#ccf",'fg':"black"}] ); }
        res.push(row); }
    return res;
}
const initBdTab = makeInitBdTab();

const taflPos = {
    "prototypeName": 'taflPos',
    "mat":Object.clone(startMat),
    "plyr":1,
    "color":"w",
    "equal":function(p){
        "use strict";
        return equalLp(this.mat,p.mat) &&
            this.plyr===p.plyr &&
            this.color===p.color; },
    "flip":function(){
        var newpos = Object.create(taflPos);
        newpos.mat = this.mat.clone();
        newpos.plyr = opposite(this.plyr);
        newpos.color = oppColor(this.color);
        return newpos;
    },
    "clone":function(){
        "use strict";
        var newpos = Object.create(taflPos);
        newpos.mat = this.mat.clone();
        newpos.plyr = this.plyr;
        newpos.color = this.color;
        return newpos; }
}
var posInit = taflPos.clone();

numChoices = 2;

function makePosInit(){
    "use strict";
    return posInit;
}

function makeAllMoves( n ){
    "use strict";
    var ones, twos;
    if ( n === undefined ){
	n = numberCups;}
    ones = matrixTranspose( [ numberSequence( 1, n )  ] );
    twos = ones.map( function( l ){ 
	return [ 0 ].concat( l );} );
    return ones.concat( twos );
}

function poscurToDisplay(pos){
    "use strict";
    var bd = pos.mat;
    return bd.map2(function(p){
        return p===0 ?
            " " :
            p==="k" ?
            '\u2654' :
            p==="b" ?
            '\u265C' :
            '\u2656'});
}

function movesFromPos(pos,sortedQ){
    "use strict";
    if (sortedQ===undefined){ sortedQ = true; }
    var res = [];
    const mat = pos.mat
    for (var i=0;i<size;i+=1){
        for (var j=0;j<size;j+=1){
            const loc = [i,j];
            if(lookUp(mat,loc)!=0){
                const mvs = movesFromLoc(mat,loc,orthDirs,size,size);
                res = res.concat(mvs); } } }
    const allmoves = res.filter(function(m){
        return color(lookUp(mat,m[0]))===pos.color});
    const sorted = sortedQ ?
          allmoves.sort(function(a,b){
	      return sortOrder(positionFromMove(a,pos),
                               positionFromMove(b,pos)); }) :
          allmoves;          
    return sorted;
}

function positionFromMove(mv,pos,pl){
    "use strict";
    var mat = pos.mat.clone();
    const pce = lookUp(mat,mv[0]);
    const plyr = pos.plyr;
    const col = pos.color;
    lookUpSet(mat,mv[0],0)
    lookUpSet(mat,mv[1],pce)
    const captures = checkCaptures(mat,mv[1],col);
    for (const n of captures){
        lookUpSet(mat,n,0); }
    var newpos = taflPos.clone();
    newpos.mat = mat;
    newpos.plyr = opposite(plyr);
    newpos.color = oppColor(col);
    return newpos;
}

function checkCaptures(mat,loc,plyr){
    "use strict";
    if (lookUp(mat,loc)==="k"){
        return []; }
    const nbs = nbrs(loc,orthDirs,size,size);
    return nbs.filter(function(n){
        if  (lookUp(mat,n)!=oppColor(plyr)){
            return false; }
        const d = n.vector2Minus(loc);
        const n2 = n.vector2Add(d);
        return onBoardQ(n2,size,size) ? lookUp(mat,n2)===plyr : false; });
}

function lossQ(pos){
    "use strict"
    const score = scoreMat(pos.mat);
    const q = oppColor(pos.color);
    return score.win[q]>0||
        (repetitionQ(pos,pos.plyr)&&(pos.col==="w")); }

function winQ(pos){
    "use strict"
    const score = scoreMat(pos.mat);
    return score.win[pos.color]>0||
        (repetitionQ(pos,pos.plyr)&&(pos.col==="b")); }
function drawQ(pos){
    return false; }

function evalPosUncert(pos,plyr){
    "use strict"
    return scoreFor(pos);
}

function sortOrder(pos1,pos2){
    "use strict"
    const s1 = scoreFor(pos1);
    const s2 = scoreFor(pos2);
    return s1 - s2;
};

clearAllCaches();
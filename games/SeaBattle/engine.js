// -*-js-*-

/*jslint browser: true, devel: true, es5: true */

/*global nbrs, lookUp, setMatEntry, repeat, comp, score, opposite, 
  movesFromLoc, flatten1, onBoardQ, makeConstantArraySimp, makeConstantArray, 
  numMvs, cartesianProd, matrixTranspose, 
  setBGCols, rowLen, gameHistory, posCur, setButtonProps, numberSequence,
  mapLp */

const cons={"handBird":16,
            "moves":2,
            "vuln":8,
            "isol":4,
            "safe":1,
            "win":1000000,
            //"loss":1000,
            "luft":4 };

var size=9;

const rowScore = {"moves":{"b":0,"w":0},
                "vuln":{"b":0,"w":0},
                "isol":{"b":0,"w":0},
                "safe":{"b":0,"w":0},
                "win":{"b":0,"w":0},
//                "loss":{"b":0,"w":0},
                "luft":{"b":0,"w":0}}
const keys = ["moves","vuln","isol","safe","win","luft"];

function opposed(p,q){
    "use strict";
    return (p==="b") ? (q==="w"||q==="k") : (
        (p==="w"||p==="k") ? q==="b" : false ) }

function oppColor(c){
    "use strict";
    return (c==="b") ? "w" : ((c==="w") ? "b" : 0); }

function color(p){
    "use strict";
    if((p==="w")||(p==="k")){
        return("w"); }
    else if(p==="b"){
        return("b"); }
    else return(0); }
           

function scoreRow(r){
    "use strict";
    var score=Object.clone(rowScore);
    //const p=r[0];
    return(scoreRowAux(r,score,0,false,false,false,0,0));
}

function scoreRowAux(r,score,prev,lastvuln,prevlastvuln,lastisol,lastp,moves){
    "use strict";
    if(r.length===0){
        return(score); }
    var p=r[0],
        tail=r.slice(1,),
        cp=color(p),
        newmoves=moves,
        clp=color(lastp);
    if((p===prev)&&(p!=0)){
        score.safe[cp]+=1; }
    if((p!=0)&&opposed(p,lastp)&&lastvuln&&(lastp!="k")){
        score.vuln[cp]+=1; }
    if((p!=0)&&opposed(p,prev)&&prevlastvuln&&(lastp!="k")){
        score.vuln[cp]+=1; }
    if(["b","w"].has(lastp)&&(lastisol)&&(p===0)){
        score.isol[clp]+=1; }
    if((clp!=0)&&(p===0)){
        score.moves[clp]+=1;
        newmoves+=1;}
    if((p!=prev)&&(prev===0)&&(clp!=0)){
        score.moves[cp]+=newmoves;
        newmoves=0; }
    if(((p==="k")&&[0,"w"].has(prev))||((prev==="k")&&[0,"w"].has(p))){
        score.luft["w"]+=1; }
    if((p==="k")&&[size,1].has(r.length)){
        score.win["w"]+=1; }
    // if(((lastp==="k")&&(p===0))||((p==="k")&&(lastp===0))){
    //     score.win.w+=1; }
    var newisol=((p!=0)&&(prev===0))||((p===0)&&lastisol);
    return(scoreRowAux(r.slice(1,),
                       score,
                       p,
                       ((p!=0)&&opposed(p,prev))||((p===0)&&lastvuln),
                       newisol&&(p!=0),
                       newisol,
                       p===0 ? lastp : p,
                       newmoves));
}

function addScores(s1,s2){
    "use strict";
    var res=Object.clone(rowScore);
    var k,c;
    for (k of keys){
        for (c of ["b","w"]){
            res[k][c]=s1[k][c]+s2[k][c]; } }
    return(res); }

function sumScores(scorelst){
    "use strict";
    var res=Object.clone(rowScore);
    for (const s of scorelst){
        res = addScores(res,s); }
    return(res); }
    
function scoreMat(mat){
    "use strict";
    var lines=mat.concat(matrixTranspose(mat));
    var scores = mapLp(lines,scoreRow);
    return(sumScores(scores)); }


// testing
const testrow1=["b",0,0,"w",0,"b","b","k",0],
      testrow2=["b",0,0,"w",0,"b",0,"k",0],
      testrow3=["b",0,0,"w",0,"b",0,0,"k"],
      score1=scoreRow(testrow1),
      score2=scoreRow(testrow2),
      score3=scoreRow(testrow3),
      testmat1=[testrow1,testrow2,testrow3,testrow1,testrow2,testrow3,testrow1,testrow2,testrow3]
//testing


function scoreFor(mat,c){
    "use strict";
    const score = scoreMat(mat);
    if (score.luft.w===0){
        score.win.b+=1; }
    var s=0;
    for (var k of keys){
        s += cons[k]*(cons.handBird*score[k][c]-score[k][oppColor(c)]); }
    return(s); }


pmDisabled = true;

//const noComp = true;

desiredDepth = 4;

numChoices = 2;

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
            row.push([c,[i,j],{'height' : 20, 'width' : 30, 'fontsize' : 12}] ); }
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
    "clone":function(){
        "use strict";
        var newpos = Object.create(taflPos);
        newpos.mat = this.mat.clone();
        newpos.plyr = this.plyr;
        newpos.color = this.color;
        return newpos; }
}
var posInit = taflPos.clone();

numchoices = 2;

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
    return bd.map2(function(p){return p===0 ? " " : p});
}

function movesFromPos(pos){
    "use strict";
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
    const sorted = allmoves.sort(function(a,b){
	return sortOrder(positionFromMove(a,pos),
                         positionFromMove(b,pos));
		 });
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
    return score.win[q]>0; }
function winQ(pos){
    "use strict"
    const score = scoreMat(pos.mat);
    return score.win[pos.color]>0; }
function drawQ(pos){
    return false; }

function evalPosUncert(pos,plyr){
    "use strict"
    return scoreFor(pos.mat,pos.color);
}

function sortOrder(pos1,pos2){
    "use strict"
    const s1 = scoreFor(pos1.mat,pos1.color);
    const s2 =  scoreFor(pos2.mat,pos2.color);
    return s1 - s2;
};


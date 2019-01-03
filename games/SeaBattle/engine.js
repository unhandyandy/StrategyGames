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
            "win":1000,
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
    var score=Object.clone(rowScore),
        p=r[0];
    return(scoreRowAux(r.slice(1,),score,p,false,false,false,p,0));
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
    if((p==="k")&&([1,size].has(r.length))){
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
    for (const k of keys){
        s += cons.handBird*score[k][c]-score[k][oppColor(c)]; }
    return(s); }


//const pmDisabled = false;

//const noComp = true;

var desiredDepth = 4;

var bdSize = 9;

var passSq = [ bdSize, 0 ];

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
    "plyr":"w",
    "equal":function(p){
        "use strict";
        return equalLp(this.mat,p.mat) &&
            this.plyr===p.plyr; },
    "clone":function(){
        var newpos = Object.create(taflPos);
        newpos.mat = this.mat.clone();
        newpos.plyr = this.plyr;
        return newpos; }
}
var posInit = taflPos.clone();

numchoices = 2;

function makePosInit(){
    "use strict";
    posInit.plyr = oppColor( posInit.plyr );
    return posInit.clone();
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

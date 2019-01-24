// -*-js-*-

/*jslint browser: true, devel: true, es5: true */

/*global nbrs, lookUp, setMatEntry, repeat, comp, score, opposite, 
  movesFromLoc, flatten1, onBoardQ, makeConstantArraySimp, makeConstantArray, 
  numMvs, cartesianProd, matrixTranspose, 
  setBGCols, rowLen, gameHistory, posCur, setButtonProps, numberSequence,
  mapLp */

// const cons={ "scoob":{"moves":8,
//                       "kingmoves":16,
//                       "isol":1,
//                       "safe":1,
//                       "win":1000000000,
//                       "thrus":3,
//                       "vuln":128,
// 	              "pieces":128 },
//              "handBird":4,
//              "thruBird":0.5,
//              "thrusw":400,
//              "rank":1000,
//              "Bwin":400,
//              "RankLocB":1.0,
//              "RankLocW":0.5,
//              "RankBase":10 };

const cons = {"scoob":{"moves":6.949999999999999,"kingmoves":16.25,"isol":0.4500000000000001,"safe":1.05,"win":1000000000,"thrus":3.2499999999999996,"vuln":162,"pieces":126},"handBird":5.149999999999996,"thruBird":0.7300000000000002,"thrusw":405,"rank":1550,"Bwin":425,"RankLocB":0.44999999999999996,"RankLocW":0.55,"RankBase":9.9}

var consDelta={"scoob":{"moves":0.3,
                        "kingmoves":0.5,
                        "isol":0.1,
                        "safe":0.1,
                        "win":0,
                        "thrus":0.1,
                        "vuln":4,
	                "pieces":4 },
               "handBird":0.1,
               "thruBird":0.02,
               "thrusw":10,
               "rank":100,
               "Bwin":10,
               "RankLocB":0.1,
               "RankLocW":0.02,
               "RankBase":0.2 };

consDelta = multObj(0.12,consDelta);

// const handBird = 4,
//       thruBird = 0.5,
//       consthrusw = 400,
//       consrank = 1000,
//       consBwin = 400,
//       consRankLocB = 1.0,
//       consRankLocW = 0.5,
//       consRankBase = 10;

const size=7;

var rowScore = {};
for (k of Object.keys(cons.scoob)){
    rowScore[k] = {"b":0,"w":0}; }

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
           
function scoreRow(r,reach,i){
    "use strict";
    var score=Object.clone(rowScore);
    //const p=r[0];
    return(scoreRowAux(r,score,"e","e",0,reach,i));
}

function scoreRowAux(r,score,prev,lastp,moves,reach,i){
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
	  co=oppColor(p),
          clp=color(lastp);
    let newmoves = moves;
    if(p===0){
        newmoves+=1;
        // if((prev==="k")&&reach(j,"b")){
        //     score.thrus.b += 1; }
        if(clp!=0){
            score.moves[clp]+=1;
            if(lastp==="k"){
                score.kingmoves.w += 1; } }
        if(corners.has([i,j])&&(lastp==="k")){
            score.thrus.w += 1; }
    }else{
        score.pieces[cp] += 0.5;
        score.moves[cp]+=newmoves;
        if(p==="k"){
            score.kingmoves.w += newmoves; }
        newmoves=0;
        if((cp===color(prev))){
            score.safe[cp]+=1; }
	if(((prev===0)&&(q===co || (q===0&&corncent.has([i,j+1])))&&reach(j-1,co)) ||
	   ((q===0)&&(prev===co || (prev===0&&corncent.has([i,j-1])))&&reach(j+1,co))){
	    if(p==="k"){
                if(i!=3 || ![2,4].has(j)){
		    score.thrus.b += 1; } }
	    else{
		score.vuln[co] += 1; } }
    }
    if(p==="k"){
        // if((prev===0)&&reach(j-1,"b")){
        //     score.thrus.b += 1; }
        // if([0,"w"].has(prev)){
        //     score.luft.w += (prev==="w") ? 2 : 1; }
        if((i===0||i===size-1)&&(newmoves+r.length===size)){
            score.thrus.w += 1; }
        if(corners.has([i,j])){
            score.win.w += 0.5; }
    }else{
        if((q===oppColor(p))&&(q===prev)){
            score.vuln[q] += 1; }
    }
    if(["b","w"].has(p)){
        if((prev===0)&&(q===0)){
            score.isol[oppColor(cp)] += 1; }
    }
    // if((prev==="k")&&[0,"w"].has(p)){
    //     score.luft.w += (p==="w") ? 2 : 1; }
    // if((lastp==="k")&&(newmoves>0)&&(p==="b")){
    //     score.thrus.b += 1; }

    return scoreRowAux(tail,
                       score,
                       p,
                       p===0 ? lastp : p,
                       newmoves,
                       reach,
		       i);
}

function addScores(s1,s2){
    "use strict";
    var res=Object.clone(rowScore);
    var k,c;
    for (k of Object.keys(cons.scoob)){
        for (c of ["b","w"]){
            res[k][c]=s1[k][c]+s2[k][c]; } }
    return(res); }

// function sumScores(scorelst){
//     "use strict";
//     var res=Object.clone(rowScore);
//     for (const s of scorelst){
//         res = addScores(res,s); }
//     return(res); }
    
function scoreMat(mat,reachable){
    "use strict";
    if(reachable===undefined){
        reachable = function(i){return function(){return false}; }; }
    let sum = Object.clone(rowScore);
    for(let i=0; i<size; i+=1){
	const newrowscore = scoreRow(mat[i],reachable(i,false),i);
	sum = addScores(sum,newrowscore); }
    var trans = matrixTranspose(mat);
    for(let i=0; i<size; i+=1){
	const newrowscore = scoreRow(trans[i],reachable(i,true),i);
	sum = addScores(sum,newrowscore); }
    // !!Check if king has been captured!!
    // if(){
    //     sum.win.b += 1; }
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
    const reachable = function(i,tQ){
        return function(j,p){
	    const loc = tQ ? [j,i] : [i,j];
            return canReach(pos,p,loc,possMovesBoth(pos)); }; }
    const score = scoreMat(mat,reachable);
    var s = 0;
    for (var k of Object.keys(cons.scoob)){        
	s += cons.scoob[k]*(cons.handBird*score[k][c]-score[k][oppColor(c)]); }
    if(score.thrus.b>0){
        s += cons.Bwin * (c==="b" ? 1 : -cons.thruBird); }
    s += cons.thrusw**score.thrus.w * (c==="w" ? 1 : -cons.thruBird);
    const ranks = rankMat(pos.mat);
    const dist = (!pos.kingLoc.equal([-1,-1])) ?
          lookUp(ranks,pos.kingLoc) :
          Infinity;
    s += (c==="w" ? 1 : -cons.thruBird) *
        cons.rank / (cons.RankBase ** (dist - 1));
    if(repQ(pos)){
	s += cons.scoob.win * (c==="b" ? 1 : -1); }
    if(pos.kingLoc.equal([-1,-1])){
        s += cons.scoob.win * (c==="b" ? 1 : -1); }
    return(s); }

function scorePosSimp(pos){
    "use strict";
    const reachable = function(i){
        return function(j,p){
            const loc = (i<size) ? [i,j] : [j,i % size];
            return canReach(pos,p,loc,possMovesBoth(pos)); }; }
    const score = scoreMat(pos.mat,reachable);
    if(pos.kingLoc.equal([-1,-1])){
        score.win.b += 1; }
    return score; }

// testing
// const testrow1=["b",0,0,"w",0,"b","b","k",0],
//       testrow2=["b",0,0,"w",0,"b",0,"k",0],
//       testrow3=["b",0,0,"w",0,"b",0,0,"k"],
//       score1=scoreRow(testrow1),
//       score2=scoreRow(testrow2),
//       score3=scoreRow(testrow3),
//       testmat1=[testrow1,testrow2,testrow3,testrow1,testrow2,testrow3,testrow1,testrow2,testrow3]
// testing


//pmDisabled = true;

pmFactor = 2;

//const noComp = true;

desiredDepth = 8;

numChoices = 3;

const bdSize = 7;

const startMat = [[0,0,0,"b",0,0,0],
                 [0,0,0,"b",0,0,0],
                 [0,0,0,"w",0,0,0],
                 ["b","b","w","k","w","b","b"],
                 [0,0,0,"w",0,0,0],
                 [0,0,0,"b",0,0,0],
                  [0,0,0,"b",0,0,0]];

const corners = [[0,0],[0,size-1],[size-1,0],[size-1,size-1]];
const corncent = [[0,0],[0,size-1],[size-1,0],[size-1,size-1],
                  [(size-1)/2,(size-1)/2]];

function makeInitBdTab() {
    "use strict";
    var res = [], i, j;
    for (i=0;i<bdSize;i+=1){
        var row = [];
        for (j=0;j<bdSize;j+=1){
            var c = startMat[i][j];
            c = (c===0) ? " " : c;
            const bgcol = corncent.has([i,j]) ? "#8f4" : "#5f7";
            row.push([c,[i,j],
                      {'height' : 56, 'width' : 64, 'fontsize' : 48,
                       'bg':bgcol,'fg':"black"}] ); }
        res.push(row); }
    return res;
}
const initBdTab = makeInitBdTab();

// function posID(pos){
//     "use strict"
//     return [pos.mat,pos.color]; }

// function makeHistory(pos){
//     "use strict"
//     const newhist = pos.history.clone();
//     newhist.push(posID(pos));
//     return newhist; }

const taflPos = {
    "prototypeName": 'taflPos',
    "mat":Object.clone(startMat),
    "plyr":1,
    "color":"b",
    "kingLoc":[3,3],
    //"history":[],
    "equal":function(p){
        "use strict";
        return equalLp(this.mat,p.mat) &&
            this.plyr===p.plyr &&
            this.color===p.color; },
    "flip":function(){
        "use strict";
        var newpos = Object.create(taflPos);
        newpos.mat = this.mat.clone();
        newpos.plyr = opposite(this.plyr);
        newpos.color = oppColor(this.color);
        newpos.kingLoc = this.kingLoc;
	//newpos.history = [];
        return newpos;
    },
    "clone":function(){
        "use strict";
        var newpos = Object.create(taflPos);
        newpos.mat = this.mat.clone();
        newpos.plyr = this.plyr;
        newpos.color = this.color;
        newpos.kingLoc = this.kingLoc;
	//newpos.history = this.history.clone();
        return newpos; }
}
var posInit = taflPos.clone();

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
    if(pos.equal(posInit)&&comp===1){
        return [[[1,3],[1,2]],
                [[1,3],[1,1]],
                [[1,3],[1,0]],
                [[0,3],[0,2]],
                [[0,3],[0,1]]]; }
    if (sortedQ===undefined){ sortedQ = true; }
    let res = [];
    const mat = pos.mat;
    for (var i=0;i<size;i+=1){
        for (var j=0;j<size;j+=1){
            const loc = [i,j];
            if(lookUp(mat,loc)!=0){
                const mvs = movesFromLoc(mat,loc,orthDirs,size,size);
                res = res.concat(mvs); } } }
    res = res.filter(function(m){
        return color(lookUp(mat,m[0]))===pos.color; });
    if(pos.color==="b"){
        res = res.filter(m => !corners.has(m[1])); }
    res = res.filter(m => lookUp(mat,m[0])==="k" ||
                                 !(m[1].equal([3,3]) ||
                                   corners.has(m[1])));
    if(!sortedQ){
        return res; }
    else{
        const sorted = partiallyOrderedList.create(numChoices);
        const vals = mapLp(res,
                           m => [m,scoreFor(positionFromMove(m,pos))]);
        sorted.concat(vals);
        return sorted.getList(); }
          // allmoves.sort(function(a,b){
	  //     return sortOrder(positionFromMove(a,pos),
          //                      positionFromMove(b,pos)); })
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
    const newpos = taflPos.clone();
    newpos.kingLoc=pos.kingLoc;
    for (const n of captures){
        if(lookUp(mat,n)==="k"){
            newpos.kingLoc=[-1,-1]; }
        lookUpSet(mat,n,0); }
    newpos.mat = mat;
    newpos.plyr = opposite(plyr);
    newpos.color = oppColor(col);
    //newpos.history = makeHistory(pos);
    if(pce==="k"){
        newpos.kingLoc=mv[1]; }
    return newpos;
}

function checkCaptures(mat,loc,col){
    "use strict";
    const nbs = nbrs(loc,orthDirs,size,size);
    return nbs.filter(function(n){
        const pce1 = lookUp(mat,n);
        if(color(pce1)!=oppColor(col)){
            return false; }
        const d = n.vector2Minus(loc);
        const n2 = n.vector2Add(d);
        if(!onBoardQ(n2,size,size)){
            return false; }
        const pce2 = lookUp(mat,n2);
        return color(pce2)===col ||
             (n2.equal([3,3]) && pce2===0 && pce1!="k") ||
            corners.has(n2); });
}

function repQ(pos){
    "use strict"
    return repetitionQ(pos,pos.plyr); 
}

function lossQ(pos){
    "use strict"
    const score = scoreMat(pos.mat);
    const q = oppColor(pos.color);
    return score.win[q]>0 ||
        score.pieces[pos.color]===0 ||
        (repQ(pos)&&(pos.color==="w")) ||
        score.moves[pos.color]===0 ||
        pos.kingLoc.equal([-1,-1])&&pos.color==="w"; }

function winQ(pos){
    "use strict"
    const score = scoreMat(pos.mat);
    return score.win[pos.color]>0 ||
        (repQ(pos)&&(pos.color==="b")) ||
        pos.kingLoc.equal([-1,-1])&&pos.color==="b"; }

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

function destsFrom(loc,mat){
    "use strict"
//    const mat = mat0.clone();
    const mvs = movesFromLoc(mat,loc,orthDirs,size,size,true);
    return mapLp(mvs,m => m[1]); }

function rankLoc(loc,mat,distances){
    "use strict"
    const dold = lookUp(distances,loc);
    if(dold<Infinity){
        return dold; }
    const dests = destsFrom(loc,mat);
    var destdict = {};
    mapLp(dests,function(l){destdict[l] = lookUp(distances,l)});
    // for(let k of Object.keys(destdict)){
    //         if(!destdict[k]>0){
    //             delete destdict[k]; }}
    let newv;
    const pce = lookUp(mat,loc);
    const ks = Object.keys(destdict);
    if(ks.length===0){
        newv = Infinity; }
    else if(ks.length===1){
        newv = Object.values(destdict)[0] + 1; }
    else if(pce==="w"){
	newv = Math.min(...Object.values(destdict)) + 1 + cons.RankLocW; }
    else if(pce==="b"){
	newv = Math.min(...Object.values(destdict)) + 1 + cons.RankLocB; }
    else{
        newv = multiplePaths(destdict,loc,mat); }
    return newv;
}

function multiplePaths(dict,loc,mat){
    "use strict"
    const best = Math.min(...Object.values(dict));
    const starts = Object.keys(dict).filter(k => dict[k]===best);
    if(starts.length===1){
	return best + 1; }
    var num = 0;
    for(let d of orthDirs){
        if(oneLineFill(mat,loc,d,size,size,true).some(
            e => starts.has(e.join()))){
            num += 1;
            if(num > 1){break}; } }
    // if(num===1){
    //     return 1 + best; }
    // else{
    //     return best; }
    return num===1 ? best + 1 : best===Infinity ? Infinity : best + best/(best+1);;
}

function rankNext(mat,ranks){
    "use strict"
    const nextranks = ranks.clone();
    mapLp(allLocs,function(l){
        lookUpSet(nextranks,l,rankLoc(l,mat,ranks)); });
    return nextranks;
}

function rankMat(mat){
    "use strict"
    let ranks = makeRankInit(mat);
    do{ const lastr = ranks.clone();        
        ranks = rankNext(mat,ranks);
        if(ranks.equal(lastr)){
            break; }
    }while(true)
    return ranks;
}

function makeRankInit(posmat){
    "use strict"
    var mat = Array(size);
    mat = mapLp(mat,function(){return Array(size)});
    for(var i=0;i<size;i+=1){
        for(var j=0;j<size;j+=1){
            if((i===0||i===size-1)&&(j===0||j===size-1)){
                    lookUpSet(mat,[i,j],0); }
            else{
                lookUpSet(mat,[i,j],Infinity); } } }
    return mat;
}

//const rankInit = makeRankInit(posInit.mat);
const allLocs = makeAllLocs(size,size);

//clearAllCaches();

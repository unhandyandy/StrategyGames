// -*-js-*-

/*jslint browser: true, devel: true, es5: true */

/*global setDiv, makeTag, makeButton, setTagOpt, setTagSty, getDiv, makeValCheck, 
  flatten1, compareNumbers, newFromPos, winQ, lossQ, drawQ, evalPosUncert, getDepth,  
  positionFromMove, postPosition, movesFromPos, makebutton, setButtonProps, makePosInit,
  poscurToDisplay, nbspN, getGameName, localStorage, eachLp */

var pmDisabled = false;

var gameName = getGameName();

var comp = 1;

var numChoices;

var maxVal = 1000000;

var pauseQ;

var depthTable;

var scores = {
    "H": 0,
    "J": 0
};

var messageHist = ["","","","",""];

var switchPlayers = true;


function postMessage(txt){
    "use strict";
    messageHist.push(txt);
    messageHist = messageHist.slice(1);
    
    var mesdiv = document.getElementById("messageDiv");
    //messageHist.reverse();
    mesdiv.innerHTML = messageHist.join("<br />");
    //messageHist.reverse();
}

function textWin(n){
    "use strict";
    return "Player " + n + " wins!";
}

function setPause(pq){
    "use strict";
    if(pq===undefined){
	pq = true;
    }
    pauseQ = pq;
}

//print scores
function printScores( scrs ){
    "use strict";
    if ( scrs === undefined ){
	scrs = scores;}
    var text = "Human: " + scrs.H + nbspN(8) + "JS: " + scrs.J;
    postMessage( text );
}



//default score function
function scoreGame( pos, plyr ){
    "use strict";
    var res = { H: 0, J: 0 };
    if ( drawQ( pos,plyr ) ){
	return res;}
    if ( winQ( pos, plyr ) ){
	if ( plyr === comp ) {
	    res.J = 1;}
	else {
	    res.H = 1;}
	return res ;}
}


function movegen(pos,player){
    "use strict";
  return newFromPos(pos,player);
}

function opposite(player){
    "use strict";
    return 3 - player;
}

//update the cumulative scores
function updateScores( lst ){
    "use strict";
    scores.H += lst.H;
    scores.J += lst.J;
}

function staticPos(pos,player){
    "use strict";
    if(winQ(pos,player)){
	return  maxVal;
    }
    else if(lossQ(pos,player)){
	return -maxVal;
    }
    return evalPosUncert(pos,player);
}



var desiredDepth;


var posCur;
var gameHistory = [];
var statusN = 1;
var histButt = [];

function makeStr(a,b){
    "use strict";
    return [a,b];
}

function moveValue(str){
    "use strict";
    return str[0];
}

function path(str){
    "use strict";
    return str[1];
}

function nextMove(str){
    "use strict";
    return path(str)[0];
}

//update gameHistory
function updateGameHistory( newmov, pos ){
    "use strict";
    gameHistory[0] = [newmov.clone()].concat(gameHistory[0]);
    gameHistory[1] = [pos.clone()].concat(gameHistory[1]);    
}

//undo last addition to gameHistory
function undoGameHistory( n ){
    "use strict";
    var movls = gameHistory[0], posls = gameHistory[1];
    if ( n === undefined ){
	n = 1;}
    gameHistory[1] = posls.slice(n);
    gameHistory[0] = movls.slice(n);    
}


var minimaxABcache, minimaxABaux;

function minimaxAB(pos,depth,player){
    "use strict";
    var res, 
        newdep = Math.max(depth,getDepth(pos,player)), 
        cchval = minimaxABcache[[JSON.stringify(pos),newdep,player]];
    if(cchval===undefined){
	res = minimaxABaux(pos,newdep,player,maxVal,-maxVal);
	minimaxABcache[[JSON.stringify(pos),newdep,player]] = res;
	depthTable[[JSON.stringify(pos),player]] = newdep;
    }
    else{
	res = cchval;
    }
    return res;
}

function minimaxABaux(pos,depth,player,useThresh,passThresh){
    "use strict";
    var deptab = getDepth(pos,player), newmvs, successors, bestPath, quit, s, succ, newValue, resSucc, newpos, newplayer;
    if(deptab >= depth){
	return minimaxAB(pos,deptab,player);
    }
    if(depth===0){
	return makeStr(staticPos(pos,player),[]);
    }
    newmvs = movesFromPos(pos,player);
    if(newmvs.length>numChoices){
	successors = newmvs.slice(0,numChoices);  
    }
    else{
	successors = newmvs;
    }
    bestPath = [successors[0]];

    if(successors.length === 0){
	return makeStr(staticPos(pos,player),[]);
    }
    else{
	quit = false;
	s = successors;
	do{
	    succ = s.pop();
	    //console.debug("succ = %s",succ.join());
	    //console.debug("pos = %s",pos.join());
	    newpos = positionFromMove(succ,pos,player);
	    updateGameHistory( succ, newpos );
	    //console.debug("newpos computed");
	    newplayer = opposite(player);
	    if(winQ(newpos,newplayer)){
		newValue = -maxVal;}
	    else if(lossQ(newpos,newplayer)){
		undoGameHistory();
		return makeStr( maxVal,[succ]);}
	    else if ( drawQ( newpos, newplayer ) ){
		newValue = 0;
		resSucc = makeStr( newValue, [] );}
	    else{
		resSucc = minimaxABaux(newpos,
				       depth - 1,
				       newplayer,
				       - passThresh,
				       - useThresh);
		newValue = - moveValue(resSucc);
	    }
	    
	    if(newValue > passThresh){
		passThresh = newValue;
		bestPath = [succ].concat(path(resSucc));
	    }
	    if(passThresh >= useThresh){
		quit = true;
	    }
	    undoGameHistory();
	} while(!quit && s.length>0);
	return makeStr(passThresh,bestPath);
    }
}

var twoComps = false;

var postMortemCheck;

function gameOverQ( mat, plyr ){
    "use strict";
    return winQ( mat, plyr ) ||  lossQ( mat, plyr )  || drawQ( mat, plyr );
}

function updatePosCur(newmov){
    "use strict";
    var scr;
    updateGameHistory( newmov, posCur );
    //console.debug("updating posCur...");
    posCur = positionFromMove(newmov,posCur,statusN);
    //console.debug("...done");
    histButt = [];
    postPosition(posCur);
    statusN = opposite(statusN);

    if(winQ(posCur,statusN)){
	postMessage(textWin(statusN));
	setPause();
	postMortemCheck(opposite(statusN));
    }
    else if(lossQ(posCur,statusN)){
	postMessage(textWin(opposite(statusN)));
	setPause();
	postMortemCheck(statusN);
    }
    else if(drawQ(posCur,statusN)){
	postMessage("Game Drawn");
	setPause();
    }
    else if( gameOverQ( posCur, statusN ) ){
	postMessage( "Game Over" );
	scr = scoreGame( posCur, statusN );
	printScores( scr );
	setPause();
	if ( scr.J < scr.H ){
	    postMortemCheck( comp );}
	else {
	    postMortemCheck( opposite( comp ) );}}
}

function moveToString( mov ){
    "use strict";
    return( mov.join() );
}


function compTurn(){
    "use strict";
    var mvs = movesFromPos(posCur,statusN), mov, newcalc;

    if(mvs.length===0){
	postPosition(posCur);	
    }
    else if(mvs.length===1){
	mov = mvs[0];
	updatePosCur(mov);
    }else{
	// var newdep = getDepth(JSON.stringify(posCur),statusN);
	// if(newdep<0){
	//     newdep = desiredDepth;
	// };
	newcalc = minimaxAB(posCur,desiredDepth,statusN);
	mov = nextMove(newcalc);
	updatePosCur(mov);
    }
    if(!pauseQ){
	postMessage( "Computer played " + moveToString( mov ) );
	if(!twoComps){
	    postMessage( "Your move." );
	}else{
	    comp = opposite(comp);
	    postMessage( "Thinking..." );
	    setTimeout(compTurn,100);
	}	
    }
}








function postPositionRow(row,rownum,colnum){
    "use strict";
    if(colnum===undefined){
	colnum = 0;
    }
    if(row.length===0){
	return [];
    }
    else{
	setButtonProps.apply(null,[[rownum,colnum],row[0]]);
	postPositionRow(row.slice(1),rownum,colnum+1);
    }
}

function postPositionCol(rows,rownum){
    "use strict";
    if(rownum===undefined){
	rownum = 0;
    }
    if(rows.length===0){
	return [];
    }
    else{
	postPositionRow(rows[0],rownum);
	postPositionCol(rows.slice(1),rownum+1);
    }
}


function postPosition(pos){
    "use strict";
    var bdtab = poscurToDisplay(pos);
    postPositionCol(bdtab);
}


function defineDepthTable(){
    "use strict";
    //console.log("localStorage: %s",localStorage[gameName+"_depthTable"]);
    if ( localStorage.hasOwnProperty( gameName+"_depthTable" ) ){
	try {
	    depthTable = JSON.parse(localStorage[gameName+"_depthTable"]);
	} catch (x) {
	    depthTable = {};
	}
    }
    else{
	depthTable = {};
    }
}

function defineMinimaxCache(){
    "use strict";
    if( localStorage.hasOwnProperty( gameName + "_minimaxAB" ) ){
	try {
	    minimaxABcache = JSON.parse(localStorage[gameName+"_minimaxAB"]);
	} catch (x) {
	    minimaxABcache = {};
	}	
    }
    else{
	minimaxABcache = {};
    }
}

//initialize the scores
function defineScores(){
    "use strict";
     if( localStorage.hasOwnProperty( gameName + "_scores" ) ){
	try {
	    scores = JSON.parse(localStorage[gameName+"_scores"]);
	} catch (x) {
	     //scores = { "H": 0, "J": 0 };
	}	
    }
}

function clearAllCaches(){
    "use strict";
    minimaxABcache = {};
    depthTable = {};
    localStorage.clear();
}

var posInit;

function setup(){
    "use strict";
    setPause(false);
    statusN = 1;
    gameHistory[0] = [];
    gameHistory[1] = [];
    histButt = [];

    posCur = makePosInit();
    postPosition(posCur);

    comp = opposite(comp);
    if(twoComps){
	comp = statusN;
    }
    if(comp===statusN){
	postMessage("Thinking...");
	setTimeout(compTurn,100);
    }
}

function initGame(args){
    "use strict";
    postMessage("New Game");

    setup();
}

function initEngine(){
    "use strict";
    defineDepthTable();
    defineMinimaxCache();
    defineScores();
}

initEngine();

// function waitasec(){
//     setTimeout(null,100);
// };

function buttonFn(arg){
    "use strict";
    var hst = histButt, nwmv, mvsposs;
    hst.push(arg);
    nwmv = hst.clone();

    postMessage("New move: " + moveToString( nwmv ) );
    if( statusN === opposite(comp) && !pauseQ){
	mvsposs = movesFromPos(posCur,statusN);
	if(mvsposs.has(nwmv)){
	    updatePosCur(nwmv);
	    if(comp === statusN && !pauseQ){
		postMessage("Thinking...");
		setTimeout(compTurn,100);
	    }
	}
	else{
	    histButt = nwmv;
	}
    }
}

function newFromPos(pos,plyr){
    "use strict";
    var mvsposs = movesFromPos(pos,plyr);
    return mvsposs.map(function(mv){
			return positionFromMove(mv,pos,plyr);
		    });
}


function undoFn(arg){
    "use strict";
    var move = histButt, movls = gameHistory[0], posls = gameHistory[1];

    if(statusN !== comp){
	if(move.length === 0 && movls.length > 1){
	    posCur = posls[1];
	    postPosition(posCur);
	    undoGameHistory( 2 );
	}
	histButt = [];
	setPause(false);
	postMessage("Undo!");
    }
}

function previousPos( n ){
    "use strict";
    if ( n === undefined ){ n = 1; }
    return gameHistory[1].slice( 0, n ); }

function previousMov( n ){
    "use strict";
    if ( n === undefined ){ n = 1; }
    return gameHistory[0].slice( 0, n ); }

function repetitionQaux(pos,plyr,hist,stt){
    "use strict";
    var ind = hist.indexOfProp( function(e){ return pos.equal(e); } ), 
        par;
    if(ind<0){
	return false;
    }
    par = ind/2;
    par = (par === Math.floor(par));
    if(par){
	return plyr !== stt ||
	       repetitionQaux( pos, plyr, hist.slice( ind + 1 ), 
			       opposite(stt) );
    }
    else{
	return plyr === stt ||
	       repetitionQaux( pos, plyr, hist.slice( ind + 1 ), stt ); 
    }
}

function repetitionQ(pos,plyr){
    "use strict";
    return repetitionQaux(pos,plyr,gameHistory[1].slice(2),statusN);
}


var cutoff = 99999;

function truncEval(x){
    "use strict";
    if(x<0){
	if(x<-cutoff){
	    return -cutoff;
	}
	else{
	    return x;
	}
    }
    else{
	if(x>cutoff){
	    return cutoff;
	}
	else{
	    return x;
	}
    }
}


function reEval(pscur,pslst,plyr,dep){
    "use strict";
    var deptab = getDepth(pscur,plyr), curdep, newval, newpos;
    if(deptab<0){
	deptab = desiredDepth;
    }
    curdep = Math.max(dep,deptab);
    newval = minimaxAB(pscur,curdep,plyr);
    newpos =  positionFromMove(nextMove(newval),pscur,plyr);
    if(moveValue(newval) < 0 || 
      newpos.equal(pslst)){
	return false;
    }
    else{
	depthTable[[JSON.stringify(pscur),plyr]] = curdep;
	return true;
    }
}

function postMortem(hist,plyr){
    "use strict";
    var fct = 1, pscur, pslst, hstrmn, dep, hsttot;
    numChoices = fct*numChoices;
    hsttot = hist[1];
    hsttot = [posCur.clone()].concat(hsttot);
    if(statusN===plyr){
	hsttot = hsttot.slice(1);
    }
    //pslst = hsttot[0];
    //pscur = hsttot[1];
    hstrmn = hsttot.clone();
    dep = desiredDepth;

    do{
	if(hstrmn.length < 2){
	    hstrmn = hsttot.clone();
	    dep += 1;
	}
	pslst = hstrmn[0];
	pscur = hstrmn[1];
	hstrmn = hstrmn.slice(2);
    }while(!reEval(pscur,pslst,plyr,dep));
    numChoices = numChoices/fct;
    postMessage("...done!");
}


function postMortemCheck(plyr){
    "use strict";
    if(twoComps){
	comp = opposite(comp);
    }

    updateScores( scoreGame( posCur, opposite( plyr ) ) );
    postMessage( "Cumulative scores:" );
    printScores();

    if( comp === plyr && !pmDisabled ){
	postMessage("Performing post-mortem...");
	setTimeout(postMortem,100,gameHistory,plyr);
    }
    localStorage[gameName+"_minimaxAB"] = JSON.stringify(minimaxABcache);
    localStorage[gameName+"_depthTable"] = JSON.stringify(depthTable);
    localStorage[gameName+"_scores"] = JSON.stringify(scores);
}


function getDepth(pos,plyr){
    "use strict";
    var res = depthTable[[JSON.stringify(pos),plyr]];
    if(res===undefined){
	return -1;
    }
    else{
	return res;
    }
}

function whichButton(btls){
    "use strict";
    var newbtt;
    if( typeof( btls[1] ) === 'object' && btls[1].length === 0 ){
	return makebutton.apply(null,btls);
    }
    else{
	newbtt = btls.slice(0,2).concat(["buttonFn"],btls.slice(2));
	return makeButton.apply(null,newbtt);
    }
}


function makeRow(vctlst){
    "use strict";
    var res = vctlst.map(whichButton);
    return res.join(" ") + " <br />";    
}


function makePanel(vctmat){
    "use strict";
    var res = vctmat.map(makeRow);
    return "<center>   "  + res.join(" ") + "   </center>";
}


var controls;

var controlsTab;



function makeButton(text,data,func,opts){
    "use strict";
    var defaults = { 'bg' : "lightgray", 'fg' : "black", 'width' : 50 , 
		     'height' : 50 , 'fontsize' : 12, 'marginTop': 10, 
		     'disabled': false, 'border': "1px", 'boxShadow': "2px" }, 
    ind, btn, dis;
    if(opts===undefined){
	opts = {};
    }
    dis = opts.disabled ? " disabled" : "";
    for( ind in defaults ){
	if ( typeof( defaults[ ind ] ) !== 'function' ){
	    if (opts[ind] === undefined ){
		opts[ind] = defaults[ind];
	    }}
    }
    btn = "<input type='button' value='" + text + "' onclick='" + 
func + "(" + JSON.stringify(data) + ")' " + 
"style=margin-top:" + opts.marginTop + ";align:center;width:" + opts.width+";height:"+
opts.height+";background-color:" + opts.bg + ";color:" + opts.fg + ";background-image:" + opts.bgimg + ";font-size:" + opts.fontsize + 
	";border:" + opts.border + ";box-shadow:" + opts.boxShadow +
"' id='" + data.join() + "'" + dis + " />";
    return btn;
}

function setButtonProps(name,txt,opts){
    "use strict";
    //var defaults = { 'bgc' : 'lightgray', 'fgc' : 'black' };
    if(opts===undefined){
	opts = {};
    }
    
    var btn = document.getElementById(name);
    if( txt !== undefined ){
	btn.value = txt;
    }
    if( opts.bgc !== undefined ){
	btn.style.backgroundColor = opts.bgc;
    }
    if( opts.fgc !== undefined ){
	btn.style.color = opts.fgc;
    }
    if( opts.bgimg !== undefined ){
	btn.style.backgroundImage = opts.bgimg;
    }
    if( opts.fontsize !== undefined ){
	btn.style.fontSize = opts.fontsize;
    }
}

function setBGCols( colorFun ){
    "use strict";
    var locs = posCur.allLocs,
        fun = function(loc){
	setButtonProps(loc,false,{'bgc' : colorFun(loc)});
    };
    eachLp( locs, fun );
}

function setFGCols( colorFun ){
    "use strict";
    var locs = posCur.allLocs,
        fun = function(loc){
	setButtonProps(loc,false,{'fgc' : colorFun(loc)});
    };
    eachLp( locs, fun );
}

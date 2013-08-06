// -*-js-*-

// 3 Musketeers

/*jslint browser: true, devel: true, es5: true */

/*global nbrs, orthDirs, lookUp, setMatEntry, repeat, comp, score, opposite, 
  movesFromLoc, flatten1, onBoardQ, makeConstantArraySimp, makeConstantArray, 
  numMvs, cartesianProd, matrixTranspose, postMessage, PositionGrouped, 
  setBGCols, rowLen, gameHistory, posCur, setButtonProps, mapLp, eachLp, equalLp,
  switchPlayers:true, repetitionQ, numberSequence */

// This is a required variable.
// It represents the default search depth.  

switchPlayers = false;

var desiredDepth = 8;

cardVals = [ 11, 10, 4, 3, 7 ];


function makeInitBdTab(){
    "use strict";
    var res = [], i, j, row;
    for( i = 0; i < 4; i++ ){
	row = [];
	for ( j = 0; j < 5; j += 1 ){
	    row.push([ cardVals[ j ].toString(), [i,j],{'height' : 80, 'width' : 80, 'fontsize' : 16}]);}
	res.push( row );}
    return res;
}

var initBdTab = makeInitBdTab();

// in tab 0 = played;
//        -1, -2 = foreplayed by player 1 or 2;
//        1, 2 = in hand of player 1 or 2;
//        3, 4 = just led by 1 or 2.
var matePos = {
    "tab": [],
    "foreplays": [],
    "plyr": 1,
    "clone": function(){
	"use strict";
	var newob;
	newob = Object.create( matePos );
	newob.tab = this.tab.clone();
	newob.foreplays = this.foreplays.clone();
	newob.plyr = this.plyr;
	return newob;
    },
   "equal": function( pos ){
	"use strict";
	return equalLp( this.tab, pos.tab ) && 
	       equalLp( this.foreplays, pos.foreplays ) &&
	       this.plyr === pos.plyr;
    }
};

var posInit = matePos.clone();
//posInit.plyr = cupsPos.opposite( posInit.plyr );

function makePosInit(){
    "use strict";
    //posInit.plyr = cupsPos.opposite( posInit.plyr );
    return posInit.clone();
}



function plyrSgn(n){
    "use strict";
    return 3 - 2*n;
}



numChoices = 12;


function movesFromPos(pos){
    "use strict";
    var res = allMoves.clone(), p = pos.plyr,
        fun = function(m){ return checkMoveQ( m, pos ); };
    res = res.filter( fun );
    res = mapLp( res, function(m){ return shortToButt( m, p ); } );
    if (res.length === 0 ){
	res = [ [ [4,0] ] ];}
    return res;
}


// assign val to move for sorting
function moveSortVal(pos,mv){
    "use strict";
    //fill in for larger sizes!
    return 0;
}


function sortMoves(pos,mvs){
     "use strict";
    //fill in for larger sizes!
    return mvs;
}


// return new muskPos by applying given mov to given pos 
function positionFromMove(mv,pos){
    "use strict";
    var pscp = pos.clone(), nm, i, p = pos.plyr, op, cap, mov;
    mov = buttToShort( mv , p );
    if ( mov.length === 1 ){
	if ( mov[0] !== "P" ){
	    // nm = largest index whose cell is affected
	    nm = mov[0] - 1;
	    for ( i = 0; i < nm; i += 1 ){
		pscp.cups[ p ][ i ] += 1;}
	    pscp.cups[ p ][ nm ] = 0;
	    pscp.pots[ p ] +=  1;}}
    else {
	// nm = smallest index affected
	nm = numberCups - mov[1];
	for ( i = numberCups - 1; i >= nm; i -= 1 ){
	    pscp.cups[ p ][ i ] += 1;}
	pscp.stacks[ p ] -= mov[1];
	if ( 0 === pos.cups[ p ][ nm ] ){
	    op = pscp.opposite( p );
	    cap = pscp.cups[ op ][ oppCup( nm ) ];
	    pscp.cups[ op ][ oppCup( nm ) ] = 0;
	    pscp.pots[ p ] += cap;}}
    pscp.plyr = pos.opposite( p );
    return pscp;
}

function poscurToDisplay(pos){
    "use strict";
    var bd = [],
        fun = function( stt ){
	    
	}};
    return bd;
}


//check for blocked cup
function numBlocked( pos, p ){
    "use strict";
    var res = 0, i, nm = 0, ni;
    for ( i = 0; i < numberCups; i += 1 ){
	ni = pos.cups[ p ][ i ];
	if ( ni > i + 1 ){
	    res += 1;
	    nm += ni;}}
    return [ res, nm ];
}


function gameOverQ(pos, plyr){
    "use strict";
    // trouble if plyr != pos.plyr
    return repetitionQ( pos, plyr );
}


function winQ(pos,plyr){
    "use strict";
    // Trouble if plyr != pos.plyr
    //return plyr === 1 ? movesFromPos(pos,1).length === 0 : checkLineQ( pos );
    return false;
}


function lossQ(mat,plyr){
    "use strict";
    return winQ(mat,opposite(plyr));
}

function drawQ(mat,plyr){
    "use strict";
    return false;
}

//score function for completed game pos
function scoreGame( pos ){
    "use strict";
    var res = {  };
    res.H = pos.pots.b;
    res.J = pos.pots.a;
    return res;
}

function evalPosUncert( pos ){
    "use strict";
    var sgn, scr, base, p = pos.plyr, op = cupsPos.opposite( p ), stcks, 
        nbp, nbo;
    scr = scoreGame( pos );
    sgn = ( comp === letToNum( p ) ) ? -1 : 1;
    base = sgn * ( scr.H - scr.J );
    if ( gameOverQ( pos ) ){
	return base;}
    else {
	nbp = numBlocked( pos, p );
	nbo = numBlocked( pos, op );
	stcks = pos.stacks[ p ] +  pos.stacks[ op ];
	return base - nbp[1] + nbo[1] - 1/numberCups * 
	    ( nbp[0] * stcks  - nbo[0] * stcks );}
}



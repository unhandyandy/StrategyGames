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

var numberCups = 4;


function makeInitBdTab(){
    "use strict";
    var res = [], i, row = [];
    res.push( [ ["  ", [0,0], {'height' : 80, 'width' : 160, 'fontsize' : 16}] ] );
    row.push( ["  ", [1,0], {'height' : 80, 'width' : 160, 'fontsize' : 16}] );
    for( i = 1; i <= numberCups; i++ ){
	row.push(["  ", [1,i],{'height' : 80, 'width' : 80, 'fontsize' : 16}]);
	}
    row.push( ["  ", [1, numberCups + 1 ], { 'boxshadow': "0px", 'disabled':true, 'bg': 'green', 'height' : 80, 'width' : 160, 'fontsize' : 16}] );
    res.push( row );

    row = [];
    row.push( ["  ", [2,0], { 'boxshadow': "0px", 'disabled':true, 'bg': 'green', 'height' : 80, 'width' : 160, 'fontsize' : 16}] );
    for( i = 1; i <= numberCups; i++ ){
	row.push(["  ", [2,i],{'height' : 80, 'width' : 80, 'fontsize' : 16}]);
	}
    row.push( ["  ", [2, numberCups + 1 ], {'height' : 80, 'width' : 160, 'fontsize' : 16}] );
    res.push( row );
    res.push( [ ["  ", [3,0], {'height' : 80, 'width' : 160, 'fontsize' : 16}] ] );
    res.push( [ ["Pass", [4,0], {'height' : 80, 'width' : 80, 'fontsize' : 16}] ] );
    return res;
}

var initBdTab = makeInitBdTab();



function poscurToDisplay(pos){
    "use strict";
    var bd = [];
    bd.push( [ pos.stacks.a ] );
    bd.push( [ pos.pots.a ].concat( pos.cups.a.clone() ).concat( [ " " ] ) );
    bd.push( [ " " ].concat( pos.cups.b.clone().reverse() ).concat( [ pos.pots.b ] ) );
    bd.push( [ pos.stacks.b ] );
    return bd;
}



function plyrSgn(n){
    "use strict";
    return 3 - 2*n;
}


//max - min of list
function spanList( lst ){
    "use strict";
    return Math.max.apply( lst, lst ) - Math.min.apply( lst, lst );
}

var blankRow = makeConstantArraySimp( 0, numberCups );


var cupsPos = {
    "cups": { a: blankRow.clone(), b: blankRow.clone() },
    "pots": { a: 0, b: 0 },
    "stacks": { a: 10*numberCups, b: 10*numberCups },
    "plyr": "a",
    "clone": function(){
	"use strict";
	var newob;
	newob = Object.create( cupsPos );
	newob.cups = {};
	newob.cups.a = this.cups.a.clone();
	newob.cups.b = this.cups.b.clone();
	newob.pots = {};
	newob.pots.a = this.pots.a;
	newob.pots.b = this.pots.b;
	newob.stacks = {};
	newob.stacks.a = this.stacks.a;
	newob.stacks.b = this.stacks.b;
	newob.plyr = this.plyr;
	//newob = Object.clone( this );
	return newob;
    },
   "equal": function( pos ){
	"use strict";
	return equalLp( this.cups.a, pos.cups.a ) && 
	       equalLp( this.cups.b, pos.cups.b ) &&
	       this.pots.a === pos.pots.a &&
	       this.pots.b === pos.pots.b &&
	       this.stacks.a === pos.stacks.a &&
	       this.stacks.b === pos.stacks.b &&
               this.plyr === pos.plyr;
    },
    "opposite": function( p ){
	"use strict";
	return ( p === "a" ) ? "b" : "a";
	}
};

var posInit = cupsPos.clone();
//posInit.plyr = cupsPos.opposite( posInit.plyr );

function makePosInit(){
    "use strict";
    posInit.plyr = cupsPos.opposite( posInit.plyr );
    return posInit.clone();
}

numChoices = 12;

//make list of all possible bean moves
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

var allMoves = makeAllMoves();

//translate player number to "a" or "b"
function numToLet( x ){
    "use strict";
    return ( x === comp ) ? "a" : "b";
}
function letToNum( x ){
    "use strict";
    return ( x === "a" ) ? comp : opposite( comp );
}

// assign val to move for sorting
function moveSortVal(pos,mv){
    "use strict";
    //fill in for larger sizes!
    return 0;
}

//correspong cup number of opposite player
function oppCup(n){
    "use strict";
    return numberCups - 1 - n;
}

function sortMoves(pos,mvs){
     "use strict";
    //fill in for larger sizes!
    return mvs;
}

//check whether a move is valid
function checkMoveQ( mv, pos ){
    "use strict";
    if ( mv.length === 1 ){
	return mv[0] === pos.cups[ pos.plyr ][ mv[0] - 1 ];}
    else {
	return pos.stacks[ pos.plyr ] >= mv[1];}
}

//translate shorthand notation of move to button notation
function shortToButt( mv, p ){
    "use strict";
    var r, s, ml, m;
    r = ( p === "a" ) ? 1 : 2;
    if ( mv.length === 1 ){
	if ( mv[0] !== "P" ){
	    m = ( r === 1 ) ? mv[0] : numberCups + 1 - mv[0];
	    return [ [ r, m ] ];}
	else {
	    return [ [4,0] ];}}
    else {
	m = ( r === 2 ) ? mv[1] : numberCups + 1 - mv[1];
	s = 3*r - 3;
	return [ [s,0], [r, m ] ];}
}
//translate button notation of move to shorthand notation
function buttToShort( mv, p ){
    "use strict";
    var m;
    if ( mv.length === 1 ){
	if ( mv[0][0] !== 4){
	    m = ( p === "a" ) ? mv[0][1] : numberCups  + 1 - mv[0][1];
	    return [ m ];}
	else {
	    return [ "P" ];}}
	
    else {
	m = ( p === "b" ) ? mv[1][1] : numberCups  + 1 - mv[1][1];
	return [ 0, m ];}
}

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



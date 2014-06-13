// -*-js2-*-

// Life & death

/*jslint browser: true, devel: true, es5: true */

/*global nbrs, orthDirs, lookUp, lookUpSet, setMatEntry, repeat, comp, score, opposite, 
  movesFromLoc, flatten1, onBoardQ, makeConstantArraySimp, makeConstantArray, 
  numMvs, cartesianProd, matrixTranspose, postMessage, PositionGrouped, 
  setBGCols, rowLen, gameHistory, posCur, setButtonProps, mapLp, eachLp, equalLp,
  switchPlayers:true, repetitionQ, numberSequence, setTagOpt, setTagSty, numChoices:true, cloneList, cartesianProduct, previousMov, pmDisabled:true */

// This is a required variable.
// It represents the default search depth.  

pmDisabled = true;

var desiredDepth = 4;

var bdSize = 6;

var passSq = [ bdSize, 1];

function makeInitBdTab() {
    "use strict";
    var res = [],
        i, j, row;
    for (i = 0; i < bdSize; i++) {
        row = [];
        for (j = 0; j < bdSize; j += 1) {
            row.push([ "", [ i, j ], {
                'height': 80,
                'width': 80,
                'fontsize': 32
            }]);
        }
        res.push(row);
    }
    res.push([
        ["Pass", passSq, {
            'height': 80,
            'width': 160,
            'fontsize': 24,
	    'bg': "white"
        }]
    ]);
    return res;
}

var initBdTab = makeInitBdTab();

function initNbrs(){
	"use strict";
	var row = makeConstantArraySimp( [0,0], bdSize + 2 );
	return makeConstantArraySimp( row, bdSize + 2); }

function fillBdRandom( pos, pieces ){
    "use strict";
    var r, c, lens, 
	sum = bdSize*bdSize + 1, 
	rnd, k, curpc, last,
	kinds = pieces.length,
	plst = pieces.clone();
    function countpieces( lst ){ return lst.map( function(x){ return x.length; } ); }
    for ( r = 1; r <= bdSize; r += 1 ){
	for ( c = 1; c <= bdSize; c += 1 ){
	    lens = countpieces( plst );
	    sum -= 1;
	    rnd = Math.random() * sum;
	    last = 0;
	    kindsLoop:
	    for ( k = 0; k < kinds; k += 1 ){
		last += lens[ k ];
		if ( rnd <= last ){
		    curpc = plst[ k ].pop();
		    pos.setSquare( r, c, curpc );
		    break kindsLoop; } } } } }



//  p = player number = 1 or 2
var lifePos = {
    "initTab": function(){
	"use strict";
	var numsqs = Math.pow( bdSize, 2 ),
	    num = Math.floor(  numsqs / 3 ),
	    blanks =  numsqs - 2 * num,
	    pieces = [ makeConstantArraySimp( 1, num ),
		       makeConstantArraySimp( 2, num ),
		       makeConstantArraySimp( 0, blanks ) ];
	fillBdRandom( this, pieces );
	return this; },
    "tab": makeConstantArraySimp(makeConstantArraySimp(0, bdSize + 2), bdSize + 2),
    "plyr": 1,
    "phase": 0,
    "allLocs": cartesianProduct( numberSequence( 0, bdSize - 1 ),
				 numberSequence( 0, bdSize - 1 ) ),
    "clone": function() {
	"use strict";
	var res = Object.create( lifePos );
	res.tab = this.tab.clone() ;
	res.nbrTab = this.nbrTab.clone();
	res.plyr = this.plyr;
	res.phase = this.phase;
	return res; },
    "nextPhase": function(){
	"use strict";
	var ph = this.phase, pl = this.plyr;
	if ( ph < 1 ) { this.phase += 1; }
	this.plyr = opposite( pl );
    },
    "equal": function(pos) {
        "use strict";
        return equalLp(this.tab, pos.tab) && this.plyr === pos.plyr;
    },
    "getSquare": function( r, c ){
	"use strict";
	return this.tab[r][c]; },
    // nbrsTab is [ n1, n2 ] where ni is # nbrs of player i
    // !! a square is counted as a nbr of itself!! 
    "addToNbrs": function ( r, c, p, d ){
	"use strict";
	var i, j;
	for( i = r - 1; i <= r + 1; i += 1 ){
	    for( j = c - 1; j <= c + 1; j += 1 ){
		this.nbrTab[i][j][p-1] += d; } } },
    "setSquare": function( r, c, p ){
	"use strict";
	var oldp, del1, del2;
	oldp = this.getSquare( r, c );
	this.tab[r][c] = p; 
	del1 = ( p === 1 ? 1 : 0 ) - ( oldp === 1 ? 1 : 0 );
	del2 = ( p === 2 ? 1 : 0 ) - ( oldp === 2 ? 1 : 0 );
	this.addToNbrs( r, c, 1, del1 );
	this.addToNbrs( r, c, 2, del2 );
	 },
    "nbrTab": initNbrs(),
    "getNbrs": function( r, c, p ){
	"use strict";
	return this.nbrTab[r][c][p-1]; },
    "updateNbrs": function(){
	"use strict";
	var i, j, that = this;
	this.nbrTab = this.initNbrs();
	for ( i = 1; i <= bdSize; i += 1 ){
	    for ( j = 1; j <= bdSize; j += 1 ){
		this.addToNbrs( i, j, this.getSquare( i, j ) ); } } },
    "birtherQ": function( r, c, p ){
	"use strict";
	var q = opposite( p ),
	    nbrp = this.getNbrs( r, c, p ),
	    nbrq = this.getNbrs( r, c, q );
	return this.getSquare( r, c ) === 0 && nbrp === 3; },
    "deatherQ": function( r, c, p ){
	"use strict";
	var q = opposite( p ),
	    nbrp = this.getNbrs( r, c, p ),
	    nbrq = this.getNbrs( r, c, q );
	return this.getSquare( r, c ) === q && 
	    ( nbrq < 3 || nbrp + nbrq > 4 ); }
};


// function makePosInit() {
//     "use strict";
//     return lifePos.clone().initTab();
// }

var previousPos;

function makePosInit() {
    "use strict";
    if (comp === 2) {
        return previousPos;
    }
    previousPos = lifePos.clone().initTab();
    return previousPos.clone();
}

function plyrSgn(n) {
    "use strict";
    return 3 - 2 * n;
}

numChoices = 12;

function selectSquares( pos, pred ){
    "use strict";
    var res = [], p = pos.plyr, r, c;
    for ( r = 1; r <= bdSize; r += 1 ){
	for ( c = 1; c <= bdSize; c += 1 ){
	    if ( pos[pred]( r, c, p ) ){
		res.push( [ r-1, c-1 ] ); } } }
    return res; }

function movesFromPos(pos, plyr) {
    "use strict";
    plyr = pos.plyr;
    var ph = pos.phase, 
	res, rowlow, i, j, bsqs, dsqs;
    if ( ph < 0 ) {
	res = [ [ passSq ] ];
	rowlow = ( plyr===1 ? bdSize - 2 : 1 );
	for ( i = rowlow; i < rowlow + 3; i += 1 ){
	    for ( j = 1; j <= bdSize; j += 1 ){
		if ( pos.getSquare( i, j ) === 0 ){
		    res.push( [ [ i-1, j-1 ] ] ); } } }
	return res; }
    else if ( ph === 0 ) {
	bsqs = selectSquares( pos, "deatherQ" ).concat( selectSquares( pos, "birtherQ" ) ).concat( [passSq] );
	return  mapLp( bsqs, 
		     function(x){ return [ x ]; } ); }
    else {
	dsqs = selectSquares( pos, "deatherQ" ).concat( [ passSq ] ); 
	bsqs = selectSquares( pos, "birtherQ" ).concat( [ passSq ] ); 
	return cartesianProduct( bsqs, dsqs ); }
}


// assign val to square = mv for sorting
function squareSortVal(pos, mv) {
    "use strict";
    var r = mv[0][0], c = mv[0][1];
    return r > bdSize ? -bdSize*bdSize : -(Math.pow((r-4.5),2) + Math.pow((c-4.5),2));
}

function moveSortVal( pos, mv ){
    "use strict";
    return squareSortVal( pos, mv[0] ) + squareSortVal( pos, mv[1] ); }


function sortMoves(pos, mvs) {
    "use strict";
    mvs.sort( function(a,b){ 
	return moveSortVal( pos, b ) - moveSortVal( pos, a ); } );
    return mvs;
}


// return new lifePos by applying given mov to given pos 
function positionFromMove(mv, pos) {
    "use strict";
    var pscp = pos.clone(), r, c, p = pos.plyr, oldp, k, len = mv.length;
    for ( k = 0; k < len; k += 1 ){
	r = mv[k][0]+1;
	c = mv[k][1]+1;
	oldp = pscp.getSquare( r, c );
	if ( r <= bdSize ){
	    if ( oldp === 0 ){
		pscp.setSquare( r, c, p ); }
	    else {
		pscp.setSquare( r, c, 0 ); } } }
    pscp.nextPhase(); 
    return pscp;
}

var letters = [ "a", "b", "c", "d", "e", "f", "g", "h" ];

function moveToString( mov ){
    "use strict";
    var str = "", r, c, k;
    for ( k = 0; k < mov.length; k += 1 ){
	r = mov[k][0];
	c = mov[k][1];
	if ( r >= bdSize ) {
	    str += " Pass "; }
	else {
	    str += " " + letters[ c ] + String( bdSize - r ) + " "; } }
    return str;
}

function playerToString( p ){
    "use strict";
    return p === 1 ? "X" : "O"; }

function bgColor( loc ){
    "use strict";
    var r = loc[0] + 1, 
	c = loc[1] + 1,
	locp = posCur.getSquare( r, c ),
	death = posCur.deatherQ( r, c, 1 ) || posCur.deatherQ( r, c, 2 ),
	birth = posCur.birtherQ( r, c, 1 ) || posCur.birtherQ( r, c, 2 ),
	res = "";
    if ( death || birth ){
	if ( locp === 1 ){
	    res += "lightblue"; }
	else if ( locp === 2 ){
	    res += "orange"; }
	else{
	    res += "darkgray"; } }
    else{
	if ( locp === 1 ){
	    res += "blue"; }
	else if ( locp === 2 ){
	    res += "chocolate"; }
	else{
	    res += "black"; } }	
    return res; }


function poscurToDisplay(pos) {
    "use strict";
    setBGCols( bgColor );
    var tab = [], r, res;
    for ( r = 1; r <= bdSize; r += 1 ){
	tab.push( pos.tab[ r ].slice( 1, bdSize + 1 ) ); }
    res = tab.map2( function( x ){ return ( x > 0 ) ? playerToString( x ) : " "; } );
    return res;
}


function gameOverQ(pos, plyr) {
    "use strict";
    var q = 3 - plyr, 
	pos1,
	hist = previousMov( 2 ),
	passes = [ [ passSq, passSq ], [ passSq, passSq ] ];
    if ( hist.equal( passes ) || repetitionQ( pos, pos.plyr ) ){
	return true; }
    if ( pos.phase < 1 ){
	return false; }
    if ( plyr !== pos.plyr  ){
	console.log( "pos.plyr !== pylr in gameOverQ" );
	plyr = pos.plyr; }
    if ( movesFromPos( pos, pos.plyr ).length !== 0 ){
	return false; }
    pos1 = pos.clone();
    pos1.nextPhase();
    if ( movesFromPos( pos1, pos1.plyr ).length !== 0 ){
	return false; }
    pos1.nextPhase();
    if ( movesFromPos( pos1, pos1.plyr ).length !== 0 ){
	return false; }
    pos1.nextPhase();
    if ( movesFromPos( pos1, pos1.plyr ).length !== 0 ){
	return false; }
    return true;
}

// Score returned is always from player 1's viewpoint.
function scorePos( pos ) {
    "use strict";
    var res1 = 0, res2 = 0, i, j, p;
    for ( i = 1; i <= bdSize; i += 1 ){
	for ( j = 1; j <= bdSize; j += 1 ){
	    p = pos.getSquare( i, j );
	    if ( p === 1 ){
		res1 += 1; }
	    else if ( p === 2 ){
		res2 += 1; } } }
    return res1 - res2; }

// Score returned is always from player 1's viewpoint.
function scoreNbrsPos( pos ) {
    "use strict";
    var res1 = 0, res2 = 0, i, j, p;
    for ( i = 1; i <= bdSize; i += 1 ){
	for ( j = 1; j <= bdSize; j += 1 ){
	    res1 += pos.getNbrs( i, j, 1 ) > 0 ? 1 : 0;
	    res2 += pos.getNbrs( i, j, 2 ) > 0 ? 1 : 0; } }
    return res1 - res2; }

function winQ(pos, plyr) {
    "use strict";
    plyr = pos.plyr;
    var score = scorePos( pos );
    if ( !gameOverQ( pos, plyr ) ){
	return false; }
    else {
	return ( plyr === 1 && score > 0 ) ||
	( plyr === 2 && score < 0 ); }
}


function lossQ(mat, plyr) {
    "use strict";
    return winQ(mat, opposite(plyr));
}

function drawQ( pos, plyr) {
    "use strict";
    return gameOverQ( pos, plyr ) && scorePos( pos ) === 0;
}


//score function for completed game pos
function scoreGame(pos) {
    "use strict";
    var res = {}, score = scorePos( pos );
    if ( score * ( comp - 1.5 ) >= 0 ){
	res.H = Math.abs( score );
	res.J = 0; }
    else {
	res.H = 0;
	res.J = Math.abs( score ); }
    return res;
}


function evalPosUncert(pos) {
    "use strict";
    return plyrSgn( pos.plyr ) * ( 8 * scorePos( pos ) + scoreNbrsPos( pos ) );
 }


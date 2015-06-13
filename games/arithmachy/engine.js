// -*-js2-*-

// Number Chess

/*jslint browser: true, devel: true, es5: true */

/*global nbrs, orthDirs, lookUp, lookUpSet, setMatEntry, repeat, comp, score, opposite, 
  movesFromLoc, flatten1, onBoardQ, makeConstantArraySimp, makeConstantArray, 
  numMvs, cartesianProd, matrixTranspose, postMessage, PositionGrouped, 
  setBGCols, setFGCols, rowLen, gameHistory, posCur, setButtonProps, mapLp, eachLp, equalLp,
  switchPlayers:true, repetitionQ, numberSequence, setTagOpt, setTagSty, numChoices:true, cloneList, cartesianProduct, previousMov, pmDisabled:true, evenQ, numberSeqSum */

// This is a required variable.
// It represents the default search depth.  

pmDisabled = true;

var desiredDepth = 6;

var bdSize = 6;

var passSq = [ bdSize, 0 ];

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

//var newNumberPiece;

var numberPiece = {
    "plyr": 1,
    "getPlayer": function(){
	"use strict";
	return this.plyr; },
    "setPlayer": function( p ){
	"use strict";
	this.plyr = p; },
    "value": 1,
    "getValue": function(){
	"use strict";
	return this.value; },
    "setValue": function( v ){
	"use strict";
	this.value = v;
    },
    "plus": function( v ){
	"use strict";
	this.setValue( v + this.getValue() ); },
    "clone": function(){
	"use strict";
	return newNumberPiece( this.getValue(), this.getPlayer() ); },
    "addSigns": function ( pair ){
	"use strict";
	var x = pair[0],
	    y = pair[1];
	return [ [x,y],[-x,y],[x,-y],[-x,-y],
		 [y,x],[-y,x],[y,-x],[-y,-x] ]; }
};

function newNumberPiece( v, p ){
    "use strict";
    var newnum;
    newnum = Object.create( numberPiece );
    newnum.setValue( v ); 
    newnum.setPlayer( p );
    return newnum; }



function sortMoves(pos, mvs) {
    "use strict";
    mvs.sort( function(a,b){ 
	var targa = pos.getSquare( a[1][0], a[1][1] ),
	    targb = pos.getSquare( b[1][0], b[1][1] ),
	    goal = pos.getGoalRow( pos.getPlayer() ),
	    goalopp = pos.getGoalRow( opposite( pos.getPlayer() ) );
	if ( a[1][0] === goal || a[1][0] === goalopp ){
	    return -1; }
	else if ( b[1][0] === goal || b[1][0] === goalopp ){
	    return 1; }
	else if ( targa === 0 && targb !== 0 ){
	    return 1; }
	else if ( targa !== 0 && targb === 0 ){
	    return -1; }
	else {
	    return 0; } } );
    return mvs;
}


//  p = player number = 1 or 2
var arithPos = {
    "initTab": function(){
	"use strict";
	this.white = !this.white;
	var rmax = bdSize - 1,
	    bdMid = evenQ( bdSize ) ? bdSize / 2 : ( bdSize + 1 ) / 2,
	    bdMid2 = evenQ( bdSize ) ? bdMid + 1 : bdMid,
	    totalval = (bdMid2 - 1)*(bdMid2 - 1) * 3,
	    topp = this.white ? 2 : 1,
            botp = opposite( topp ),
	    first = [[],[]],
	    last = [[],[]],
	    rowmid = makeConstantArraySimp( 0, bdSize ),
	    middle = makeConstantArraySimp( rowmid, bdSize - 4 ),
	    i, j, seqiter, pcval;
	seqiter = numberSeqSum.new( 2*bdSize, totalval );
	for ( i=0; i<2; i+=1 ){
	    for( j=0; j<bdSize; j+=1 ){
		pcval = seqiter.next();
		first[i].push( pcval===0 ? 0 : newNumberPiece( pcval, topp ) ); }}
	seqiter = numberSeqSum.new( 2*bdSize, totalval );
	for ( i = 0; i < 2; i += 1 ){
	    for( j=0; j<bdSize; j+=1 ){
		pcval = seqiter.next();
		last[i].push( pcval===0 ? 0 : newNumberPiece( pcval, botp ) ); }}
	this.tab = first.concat( middle ).concat( last );
	this.goalRows.b = this.white ? rmax : 0;
	this.goalRows.a = this.white ? 0 : rmax;
	this.setMoves();
	return this; },
    "tab": makeConstantArraySimp(makeConstantArraySimp(0, bdSize ), bdSize ),
    "plyr": 1,
    "goalRows": { },
    "getGoalRow": function( p ){
	"use strict";
	return ( p === 1 ) ? this.goalRows.a : this.goalRows.b; },
    "numCorners": function( p ){
	"use strict";
	var rmax = bdSize - 1,
	    row = this.getGoalRow( p ),
	    p1 = this.getSquare( row, 0 ),
	    p2 = this.getSquare( row, rmax ),
	    g1 = p1 !== 0 && p1.getPlayer() === p ? 1 : 0,
	    g2 = p2 !== 0 && p2.getPlayer() === p ? 1 : 0;
	return g1 + g2; },
    "winForQ": function( p ){
	"use strict";
	return this.numCorners( p ) === 2; },
    "white": false,
    "getPlayer": function(){
	"use strict";
	return this.plyr; },
    "setPlayer": function( p ){
	"use strict";
	this.plyr = p; },
    "allLocs": cartesianProduct( numberSequence( 0, bdSize - 1 ),
				 numberSequence( 0, bdSize - 1 ) ),
    "clone": function() {
	"use strict";
	var res = Object.create( arithPos );
	res.plyr = this.plyr;
	res.tab = this.tab.clone();
	res.white = this.white;
	res.moves = this.moves.clone();
	res.goalRows = this.goalRows;
	return res; },
    "equal": function(pos) {
        "use strict";
        return equalLp(this.getNumberTab(), pos.getNumberTab() ) && 
	    this.getPlayer() === pos.getPlayer();
    },
    "getSquare": function( r, c ){
	"use strict";
	return this.tab[r][c]; },
    // nbrsTab is [ n1, n2 ] where ni is # nbrs of player i
    // !! a square is counted as a nbr of itself!! 
    "setSquare": function( r, c, p ){
	"use strict";
	this.tab[r][c] = p; 
	 },
    "getPieces": function( p ){
	"use strict";
	if ( p === undefined ){
	    p = this.getPlayer(); }
	var r, c, res, piece;
	res = [];
	for ( r = 0; r < bdSize; r += 1 ){
	    for ( c = 0; c < bdSize; c += 1 ){
		piece = this.getSquare( r, c );
		if ( piece !== 0 && piece.getPlayer() === p ){
		    res.push( { "piece": piece, "r": r, "c": c } ); } } }
	return res; },
    "eachLoc": function( fun ){
	"use strict";
	var r, c;
	for ( r = 0; r < bdSize; r += 1 ){
	    for ( c = 0; c < bdSize; c += 1 ){
		fun( r, c ); } } },
    "eachPiece": function( fun, p ){
	"use strict";
	if ( p === undefined ){
	    p = this.getPlayer(); }
	var pieces = this.getPieces( p );
	eachLp( pieces, fun ); },
    // fun( r, c, piece )
    "eachLocPiece": function( fun, p ){
	"use strict";
	if ( p === undefined ){
	    p = this.getPlayer(); }
	var that = this;
	this.eachLoc( function( r, c ){ 
	    that.eachPiece( function( pc, p ){
		fun( r, c, pc ); } ); } ); },
    "detMoves": function(){
	"use strict";
	var res = [],
	    thisplayer = this.getPlayer(),
	    that = this;
	function gather( r, c, pc ){
	    var rp = pc.r,
		cp = pc.c,
		piece = pc.piece,
		val = piece.getValue(),
		prod = (Math.abs(r - rp) + 1)*(Math.abs(c - cp) + 1),
		newmove = [ [rp,cp], [r,c] ],
		thatpc;
	    if ( prod === 1 || prod > val ){
		return; }
	    else if ( prod === val ){
		res.push( newmove ); }
	    else {
		thatpc = that.getSquare( r, c );
		if ( thatpc === 0 || thatpc.getPlayer() === thisplayer ){
		    res.push( newmove ); } } }
	this.eachLocPiece( gather );
	return sortMoves( this, res ); },
    "moves": [],
    "setMoves": function(){
	"use strict";
	this.moves = this.detMoves(); },
    "getMoves": function(){
	"use strict";
	return this.moves.clone(); },
    "updatePos": function( mv ){
	"use strict";
	if ( mv[0].equal( passSq )  ){
	    this.setPlayer( opposite( this.getPlayer() ) );
	    this.setMoves();
	    return; }
	var r1 = mv[0][0],
	    c1 = mv[0][1],
	    r2 = mv[1][0],
	    c2 = mv[1][1],
	    plyr = this.getPlayer(),
	    //goal = this.getGoalSq( plyr ),
	    source = this.getSquare( r1, c1 ),
	    oldval = source.getValue(),
	    target = this.getSquare( r2, c2 ),
	    addQ = ( target !== 0 && target.getPlayer() === this.getPlayer() ),
	    prod = (Math.abs(r1-r2)+1)*(Math.abs(c1-c2)+1),
	    newval = prod + ( addQ ? target.getValue() : 0 );
	this.setSquare( r2, c2, newNumberPiece( newval, plyr ) );
	if ( prod === oldval ){
	    this.setSquare( r1, c1, 0 ); }
	else{
	    this.setSquare( r1, c1, newNumberPiece( oldval - prod, plyr ) ); }
	//goalpc = this.getSquare( goal[0], goal[1] );
	// if ( goalpc !== 0 && goalpc.getPlayer() === plyr ){
	//     this.setFlag( plyr, this.getFlag( plyr ) + 1 ); }
	// else{
	//     this.setFlag( plyr, 0 ); }
	this.setPlayer( opposite( plyr ) );
	this.setMoves(); },
    "getNumberTab": function(){
	"use strict";
	var res = this.tab.map2( function( pc ){
	    return ( pc === 0 ) ? " " : pc.getValue(); } );
	return res; },
    "makeHash": function(){
	"use strict";
	var pos = this.tab.map2( function( pc ){
	    return  ( pc === 0 ) ? 0 : [ pc.getPlayer(), pc.getValue() ]; } );
	return [ this.getPlayer(), pos ]; }
};


function makePosInit() {
    "use strict";
    var previous = ( posCur === undefined ) ? arithPos : posCur;
    previous.setPlayer( 1 );
    return previous.clone().initTab();
}

function plyrSgn(n) {
    "use strict";
    return 3 - 2 * n;
}

numChoices = 12;


function movesFromPos(pos, plyr) {
    "use strict";
    return pos.getMoves();
}


function positionFromMove(mv, pos) {
    "use strict";
    var newpos = pos.clone();
    newpos.updatePos( mv );
    return newpos; }


var letters = [ "a", "b", "c", "d", "e", "f", "g", "h" ];

function moveToString( mov ){
    "use strict";
    if ( mov === "Pass" ){
	return ""; }
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


function bgColor( loc ){
    "use strict";
    var dark = ( loc[0] + loc[1] ) % 2 === 0,
	res = dark ? "chocolate" : "orange";
    return res; }

function fgColor( loc ){
    "use strict";
    var piece = posCur.getSquare( loc[0], loc[1] ),
	dark = piece !== 0 && piece.getPlayer() === 2,
	res = dark ? "black" : "white";
    return res; }

function poscurToDisplay(pos) {
    "use strict";
    setFGCols( fgColor );
    setBGCols( bgColor );
    return pos.getNumberTab(); }

function gameOverQ(pos, plyr) {
    "use strict";
    plyr = pos.getPlayer();
    return pos.winForQ( opposite( plyr ) ) || 
	   repetitionQ( pos, plyr )        ||
	   pos.getMoves().length === 0; }

// Score returned is always from player 1's viewpoint.
function scorePos( pos ) {
    "use strict";
    var res1 = 0, 
	res2 = 0;
    function score( pc ){
	if ( pc.piece.getPlayer() === 1 ){
	    res1 += pc.piece.getValue(); }
	else{
	    res2 += pc.piece.getValue(); } }
    pos.eachPiece( score, 1 );
    pos.eachPiece( score, 2 );
    return res1 - res2; }

// Score returned is always from player 1's viewpoint.

function winQ(pos, plyr) {
    "use strict";
    var pOnMove = pos.getPlayer();
    if ( plyr === pOnMove ){
	return pos.winForQ( plyr ); }
    else{
	return  pos.winForQ( plyr ) ||
	        pos.getMoves().length === 0; }
}

function lossQ(mat, plyr) {
    "use strict";
    return winQ(mat, opposite(plyr));
}

function drawQ( pos, plyr) {
    "use strict";
    return gameOverQ( pos ) && !winQ( pos, 1 ) && !winQ( pos, 2 );
}


function evalPosUncert(pos) {
    "use strict";
    var p = pos.getPlayer(),
	q = opposite( p ),
	flagCon = 1,
	flagConOpp = 0.5;
    return plyrSgn( p ) * scorePos( pos ) + 
	flagCon * pos.numCorners( p ) - flagConOpp * pos.numCorners( q );
 }





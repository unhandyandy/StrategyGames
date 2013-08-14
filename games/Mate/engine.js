// -*-js-*-

// 3 Musketeers

/*jslint browser: true, devel: true, es5: true */

/*global nbrs, orthDirs, lookUp, lookUpSet, setMatEntry, repeat, comp, score, opposite, 
  movesFromLoc, flatten1, onBoardQ, makeConstantArraySimp, makeConstantArray, 
  numMvs, cartesianProd, matrixTranspose, postMessage, PositionGrouped, 
  setBGCols, rowLen, gameHistory, posCur, setButtonProps, mapLp, eachLp, equalLp,
  switchPlayers:true, repetitionQ, numberSequence, setTagOpt, setTagSty */

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
    res.push( [ [ "Pass", [5,0],{'height' : 80, 'width' : 160, 'fontsize' : 16}] ] );
    return res;
}

var initBdTab = makeInitBdTab();

// in tab 0 = played;
//        -1, -2 = foreplayed by player 1 or 2;
//        1, 2 = in hand of player 1 or 2;
//        3, 4 = just led by 1 or 2.
var matePos = {
    "tab": makeConstantArraySimp( makeConstantArraySimp( null, 5 ), 4 ),
    "foreplays": [],
    "plyr": 1,
    "hands": [],
    "trick": [ null, null ],
    "getLead": function(){
	"use strict";
	return this.trick[0];
    },
    "getReply": function(){
	"use strict";
	return this.trick[1];
    },	
    "setLead": function( crd ){
	"use strict";
	this.trick[0] = crd;
    },
    "setReply": function( crd ){
	"use strict";
	this.trick[1] = crd;
    },	
    "clearTrick": function(){
	"use strict";
	var ld, rp, ldlo, rplo;
	ld = this.getLead();
	rp = this.getReply();
	if ( ld !== null ){
	    lookUpSet( this.tab, ld, 0 );}
	if ( rp !== null ){
	    lookUpSet( this.tab, rp, 0 );}
	this.setLead( null );
	this.setReply( null );
    },
    "clone": function(){
	"use strict";
	var newob;
	newob = Object.create( matePos );
	newob.tab = this.tab.clone();
	newob.foreplays = this.foreplays.clone();
	newob.plyr = this.plyr;
	newob.hands = this.hands.clone();
	newob.trick = this.trick.clone();
	return newob;
    },
    "equal": function( pos ){
	"use strict";
	return equalLp( this.tab, pos.tab ) && 
	    equalLp( this.foreplays, pos.foreplays ) &&
	    this.plyr === pos.plyr;
    },
    "removeCardFrom": function ( crd, p ){
	"use strict";
	this.hands[ p - 1 ].removeOne( crd );
    },
    "addCardTo": function ( crd, p ){
	"use strict";
	this.hands[ p - 1 ].push( crd );
    },
    "playCard": function ( crd ){
	"use strict";
	var s = crd[0], r = crd[1], p = this.plyr, ls, lr;
	this.removeCardFrom( crd, p );
	this.tab[s][r] = p + 2;
	if ( this.getReply() !== null || this.getHand( 2 ).length === 10 ){
	    this.clearTrick();
	    this.setLead( crd );
	    this.plyr = opposite( p );}
	else{
	    this.setReply( crd );
	    ls = this.getLead()[0];
	    lr = this.getLead()[1];
	    if ( !( r < lr || 
	            ( r === lr &&  s < ls ) ) ){
		this.plyr = opposite( p );}}
    },
    "getHand": function ( p ){
	"use strict";
	return this.hands[ p - 1 ].clone();
    },
    "setHand": function ( p, hnd ){
	"use strict";
	this.hands[ p - 1 ] = hnd.clone();
    },
    "deal": function(){
	"use strict";
	var res, cnt = [ 10, 10 ], s, r, p;
	this.hands = [ [], [] ];
	for ( s = 0; s < 4; s += 1 ){
	    for ( r = 0; r < 5; r += 1 ){
		p = ( Math.random() < cnt[0] / ( cnt[0] + cnt[1]) ) ? 1 : 2;
		cnt[ p - 1 ] -= 1;
		this.addCardTo( [ s, r ], p );
		this.tab[s][r] = p;}}
	this.plyr = 1;
	this.clearTrick();
	this.foreplays = [];
    }
};

var previousPos;

function makePosInit(){
    "use strict";
    if ( comp === 2 ){
	return previousPos;}
    previousPos = matePos.clone();
    previousPos.deal();
    return ( previousPos.clone() );
}

function plyrSgn(n){
    "use strict";
    return 3 - 2*n;
}



numChoices = 12;


function movesFromPos(pos, plyr){
    "use strict";
    var res, resfil, s, r;
    res = pos.getHand( plyr );

    if ( pos.plyr !== plyr || res.length === 0 ){
	return [[[5,0]]];}

    if ( pos.getReply() !== null || pos.getLead() ===  null ){
	return matrixTranspose( [ res ] );}

    s = pos.getLead()[0];
    resfil = res.filter( function(c){ return c[0] === s;} );
    if ( resfil.length === 0 ){
	r = pos.getLead()[1];
	resfil = res.filter( function(c){ return c[1] === r;} );
        if ( resfil.length === 0 ){
	    return [[[5,0]]];}}
    return matrixTranspose( [ resfil ] );
}


// assign val to move for sorting
function moveSortVal(pos,mv){
    "use strict";
    //return -4 * mv[0][1] - mv[0][0];
    return 0;
}


function sortMoves(pos,mvs){
     "use strict";
    return mvs;
}


// return new muskPos by applying given mov to given pos 
function positionFromMove(mv,pos){
    "use strict";
    var pscp = pos.clone(), p = pos.plyr, mov = mv[0];
    if ( ! equalLp( mov, [5,0] ) ){
	pscp.playCard( mov );}
    return pscp;
}

function dispCard( crd ){
    "use strict";
    var n = lookUp( posCur.tab, crd );
    if ( n === 1 || n === 3 ){
	if ( n === 3 ){
	    setTagSty( crd, "background-color", "purple" );}
	else {
	    setTagSty( crd, "background-color", "lightblue" );}}
    else if ( n === 2 || n === 4 ){
	if ( n === 4 ){
	    setTagSty( crd, "background-color", "orange" );}
	else {
	    setTagSty( crd, "background-color", "yellow" );}}
    else {
	setTagSty( crd, "background-color", "black" );}
}

var allCards = cartesianProd( [0,1,2,3], [0,1,2,3,4] );

function poscurToDisplay(pos){
    "use strict";
    allCards.forEach( dispCard );
    return makeConstantArraySimp( cardVals, 4 );
}



function gameOverQ(pos, plyr){
    "use strict";
    // trouble if plyr != pos.plyr
    return  ( ( pos.getLead() !== null ) && 
	      ( pos.getReply() === null ) && 
	      ( equalLp( movesFromPos( pos, plyr ), [[[5,0]]] ) ) ) ||
	repetitionQ( pos, plyr );
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

//look up card's value
function getCardValue( crd ){
    "use strict";
    return cardVals[ crd[1] ];
}

//score function for completed game pos
function scoreGame( pos ){
    "use strict";
    var res = {  }, val, nts, pnt, p = pos.plyr, q = opposite( p );
    if ( pos.getReply() !== null || pos.getLead() === null ){
	res.H = 0;
	res.J = 0;}
    else {
	val = getCardValue( pos.getLead() );
	nts = 10 - pos.getHand( q ).length;
	pnt = val * nts;
	if ( comp === p ){
	    res.H = pnt;
	    res.J = 0;}
	else{
	    res.H = 0;
	    res.J = pnt;}}
    return res;
}

//rough measure of strength of hand
function handStrength( hnd ){
    "use strict";
    if ( hnd.length === 0 ){
	return 0;}
    var lst = matrixTranspose( hnd )[1];
    return lst.reduce( Math.plus );
}

function evalPosUncert( pos ){
    "use strict";
    var sgn, strength, val, len, p, q, scr, base, sp, sq;
    sgn = ( comp === p ) ? -1 : 1;
    p = pos.plyr;
   
    if ( gameOverQ( pos, p ) ){
	scr = scoreGame( pos );
	base = sgn * ( scr.H - scr.J );
	return base;}

    q = opposite( p );
    val = 7;
    len = 10 - 0.5 * pos.getHand( p );
    sp = handStrength( pos.getHand( p ) );
    sq = handStrength( pos.getHand( q ) );
    strength = 2 * sp / ( sp + sq ) - 1;
    return strength * ( val * len );
}



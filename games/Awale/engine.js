// -*-js-*-

// Oware

/*jslint browser: true, devel: true, es5: true */

/*global nbrs, orthDirs, lookUp, setMatEntry, repeat, comp, score, opposite, 
  movesFromLoc, flatten1, onBoardQ, makeConstantArraySimp, makeConstantArray, 
  numMvs, cartesianProd, matrixTranspose, postMessage, PositionGrouped, 
  setBGCols, rowLen, gameHistory, posCur, setButtonProps, mapLp, eachLp, equalLp,
  switchPlayers:true, repetitionQ, numberSequence */

// This is a required variable.
// It represents the default search depth.  

switchPlayers = false;

var desiredDepth = 4;

var numberCups = 3;

var numberSeedsPerCup = 2;


function makeInitBdTab(){
    "use strict";
    var res = [], i, row = [];
    //res.push( [ ["  ", [0,0], {'height' : 80, 'width' : 160, 'fontsize' : 16}] ] );
    row.push( ["  ", [0,0], {'height' : 80, 'width' : 160, 'fontsize' : 16}] );
    for( i = 1; i <= numberCups; i++ ){
	row.push(["  ", [0,i],{'height' : 80, 'width' : 80, 'fontsize' : 16}]);
	}
    row.push( ["  ", [0, numberCups + 1 ], { 'boxshadow': "0px", 'disabled':true, 'bg': 'green', 'height' : 80, 'width' : 160, 'fontsize' : 16}] );
    res.push( row );

    row = [];
    row.push( ["  ", [1,0], { 'boxshadow': "0px", 'disabled':true, 'bg': 'green', 'height' : 80, 'width' : 160, 'fontsize' : 16}] );
    for( i = 1; i <= numberCups; i++ ){
	row.push(["  ", [1,i],{'height' : 80, 'width' : 80, 'fontsize' : 16}]);
	}
    row.push( ["  ", [1, numberCups + 1 ], {'height' : 80, 'width' : 160, 'fontsize' : 16}] );
    res.push( row );
    //res.push( [ ["  ", [3,0], {'height' : 80, 'width' : 160, 'fontsize' : 16}] ] );
    //res.push( [ ["Pass", [4,0], {'height' : 80, 'width' : 80, 'fontsize' : 16}] ] );
    return res;
}

var initBdTab = makeInitBdTab();



function poscurToDisplay(pos){
    "use strict";
    var bd = [];
    bd.push( [ pos.pots.a ].concat( pos.cups.a.clone() ).concat( [ " " ] ) );
    bd.push( [ " " ].concat( pos.cups.b.clone() ).concat( [ pos.pots.b ] ) );
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

var blankRow = makeConstantArraySimp( numberSeedsPerCup, numberCups );


var owarePos = {
    "cups": { a: blankRow.clone(), b: blankRow.clone() },
    "pots": { a: 0, b: 0 },
    //"stacks": { a: 10*numberCups, b: 10*numberCups },
    "plyr": "a",
    "plyrToRow": function( p ){
	"use strict";
	return ( p === "a" ) ? 0 : 1;
    },
    "rowToPlyr": function( r ){
	"use strict";
	return ( r === 0 ) ? "a" : "b";
    },
    "clone": function(){
	"use strict";
	var newob;
	newob = Object.create( owarePos );
	newob.cups = {};
	newob.cups.a = this.cups.a.clone();
	newob.cups.b = this.cups.b.clone();
	newob.pots = {};
	newob.pots.a = this.pots.a;
	newob.pots.b = this.pots.b;
	newob.plyr = this.plyr;
	newob.possibleMoves = this.possibleMoves;
	return newob;
    },
   "equal": function( pos ){
	"use strict";
	return equalLp( this.cups.a, pos.cups.a ) && 
	       equalLp( this.cups.b, pos.cups.b ) &&
	       this.pots.a === pos.pots.a &&
	       this.pots.b === pos.pots.b &&
               this.plyr === pos.plyr;
    },
    "opposite": function( p ){
	"use strict";
	return ( p === "a" ) ? "b" : "a";
    },
    "next": function( old ){
	"use strict";
	return this.neighbor( old, ( old[0] === "a" ) ? -1 : 1 );
    },
    "previous": function( old ){
	"use strict";
	return this.neighbor( old, ( old[0] === "a" ) ? 1 : -1 );
    },
    "neighbor": function( old, del ){
	"use strict";
	var row = old[0],
	    col = old[1],
	    newrow = row,
	    newcol = col;
	newcol += del;
	if ( newcol < 1 || newcol > numberCups ){
	    newrow = this.opposite( row );
	    newcol = ( row == "a" ) ? 1 : numberCups; }
	return [ newrow, newcol ];
    },
    "getCup": function( cup ){
	"use strict";
	var row = cup[0],
	    col = cup[1] - 1;
	return this.cups[ row ][ col ];
    },
    "setCup": function( cup, num ){
	"use strict";
	var row = cup[0],
	    col = cup[1] - 1;
	this.cups[ row ][ col ] = num;
    },
    "getNumSeed": function( p ){
	"use strict";
	return this.cups[p].reduce(Math.plus);
    },
    "scoreMove": function( cup ){
	"use strict";
	var p = this.plyr,
	    q = this.opposite( p ),
	    row = cup[0],
	    col = cup[1],
	    curcup = cup.clone(),
	    nextcup = this.next( cup ),
	    oldpot = this.pots[p],
	    oldrow = this.cups[q].clone(),
	    triggermin = numberCups * 1/3,
	    triggermax = numberCups * 2/3;
	if ( row !== q ){
	    return; }
	while( curcup[0] === q &&
	       this.getCup( curcup ) >= triggermin &&
	       this.getCup( curcup ) < triggermax ){
	    this.pots[p] += this.getCup( curcup );
	    this.setCup( curcup, 0 );
	    curcup = this.previous( curcup ); }
	if ( this.getNumSeed( q ) === 0 &&
	     this.getNumSeed( p ) !== 0  &&
	     this.pots[p] <= numberCups * numberSeedsPerCup ){
	    this.pots[p] = oldpot;
	    this.cups[q] = oldrow; }
    },
    "sowAux": function( cup, num ){
	"use strict";
	var i, curcup = cup.clone();
	this.setCup( cup, 0 );
	for ( i=0; i<num; i+=1 ){
	    curcup = this.next( curcup );
	    if ( equalLp( curcup, cup ) ){
		curcup = this.next( curcup ); }
	    this.setCup( curcup, this.getCup( curcup ) + 1 ); }
	return curcup;
    },
    "sow": function ( cup ){
	"use strict";
	var numseeds = this.getCup( cup ),
	    curcup = this.sowAux( cup, numseeds );
	this.scoreMove( curcup );
	this.plyr = this.opposite( this.plyr );
    },
    "possibleMoves": false
};

posInit = owarePos.clone();
//posInit.plyr = owarePos.opposite( posInit.plyr );

function makePosInit(){
    "use strict";
    posInit.plyr = owarePos.opposite( posInit.plyr );
    return posInit.clone();
}

numChoices = 6;

//make list of all possible bean moves in short form
function makeAllMoves( n ){
    "use strict";
    var ones, twos;
    if ( n === undefined ){
	n = numberCups;}
    return matrixTranspose( [ numberSequence( 1, n )  ] );
    // twos = ones.map( function( l ){ 
    // 	return [ 0 ].concat( l );} );
    // return ones.concat( twos );
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
// function oppCup(n){
//     "use strict";
//     return numberCups - 1 - n;
//}

function sortMoves(pos,mvs){
     "use strict";
    //fill in for larger sizes!
    return mvs;
}

//check whether a short move is valid
function checkMoveQ( mv, pos ){
    "use strict";
    // check that moves gives opp seed if he had none
    // not nec to check that move cleans out opp
    var p = pos.plyr,
	q = pos.opposite( p ),
	numseedsopp = pos.getNumSeed( q ),
	l,m;
    if ( pos.getCup( [ pos.plyr, mv[0] ] ) === 0 ){
	return false; }
    if ( numseedsopp > 0 ) {
	return true; }
    else{
	l = pos.getCup( [ p, mv[0] ] );
	m = ( p==="b" ) ? ( l + mv[0] - numberCups ) : ( l - mv[0] + 1 );
	return m > 0; }
}

//translate shorthand notation of move to button notation
function shortToButt( mv, p ){
    "use strict";
    var r = owarePos.plyrToRow( p );
    return [ [ r, mv[0] ] ];
}
//translate button notation of move to shorthand notation
function buttToShort( mv ){
    "use strict";
    return mv[0][1];
}

function movesFromPos(pos){
    "use strict";
    if ( pos.movesPossible ){
	return pos.movesPossible; }
    var res = allMoves.clone(), p = pos.plyr,
        fun = function(m){ return checkMoveQ( m, pos ); };
    res = res.filter( fun );
    res = mapLp( res, function(m){ return shortToButt( m, p ); } );
    pos.movesPossible = res;
    return res;
}


// return new muskPos by applying given mov to given pos 
function positionFromMove(mv,pos){
    "use strict";
    var pscp = pos.clone(), nm, i, p = pos.plyr, op, cap, mov;
    pscp.sow( [ pos.plyr, mv[0][1] ] );
    pscp.plyr = pos.opposite( p );
    pscp.possibleMoves = false;
    return pscp;
}


function gameOverQ(pos, plyr){
    "use strict";
    // trouble if plyr != pos.plyr
    return winQ( pos, owarePos.rowToPlyr( plyr ) ) || movesFromPos( pos ).length === 0;
}


function winQ(pos,plyr){
    "use strict";
    // Trouble if plyr != pos.plyr
    var score = pos.pots[ pos.plyr ],
	half = numberSeedsPerCup * numberCups;
    return score > half;
}


function lossQ( pos, plyr ){
    "use strict";
    var score = pos.pots[ owarePos.opposite( pos.plyr ) ],
	half = numberSeedsPerCup * numberCups;
    return score > half;
}

function drawQ( pos, plyr ){
    "use strict";
    var p = owarePos.rowToPlyr( plyr - 1 ),
	score = pos.pots[ p ],
	oppscore = pos.pots[ owarePos.opposite( p ) ],
	half = numberSeedsPerCup * numberCups;
    return score === half && oppscore === half;
}

//score function for completed game pos
function scoreGame( pos ){
    "use strict";
    var res = {  };
    res.H = pos.pots.b + pos.getNumSeed( "b" );
    res.J = pos.pots.a + pos.getNumSeed( "a" );
    return res;
}

function evalPosUncert( pos ){
    "use strict";
    var sgn, scr, base, p = pos.plyr, op = owarePos.opposite( p ), stcks, 
        nbp, nbo;
    scr = scoreGame( pos );
    sgn = ( comp === letToNum( p ) ) ? -1 : 1;
    base = sgn * ( scr.H - scr.J );
    if ( gameOverQ( pos ) ){
	return base;}
    else {
	return base - 1/numberCups;}
}



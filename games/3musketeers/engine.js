// -*-js-*-

// 3 Musketeers

/*jslint browser: true, devel: true, es5: true */

/*global nbrs, orthDirs, lookUp, setMatEntry, repeat, comp, score, opposite, 
  movesFromLoc, flatten1, onBoardQ, makeConstantArraySimp, makeConstantArray, 
  numMvs, cartesianProd, matrixTranspose, postMessage, PositionGrouped, 
  setBGCols, rowLen, gameHistory, posCur, setButtonProps, mapLp, eachLp, equalLp */

// This is a required variable.
// It represents the default search depth.  
var desiredDepth = 8;

emptyCell = 0;

var rectSize = 5;

var numLocs = rectSize * rectSize;

function plyrSgn(n){
    "use strict";
    return 3 - 2*n;
}


function score(pos){
    "use strict";
    //console.debug("evaluating...");
    var sgn = plyrSgn(pos.plyr);

//Fill in!!			

    return ;
}

//max - min of list
function spanList( lst ){
    "use strict";
    return Math.max.apply( lst, lst ) - Math.min.apply( lst, lst );
}

//metric of how far musketeers are from line
function distFromLine( pos ){
    "use strict";
    var coords = matrixTranspose( pos.a );
    return Math.min( spanList( coords[0] ), spanList( coords[1] ) ); 
}



var muskPos = {
    "tab": [],
    "a": [],
    "b": [],
    "plyr": 1,
    "clone": function(){
	"use strict";
	var newob = Object.create( muskPos );
	newob.tab = this.tab.clone();
	newob.a   = this.a.clone();
	newob.b   = this.b.clone();
	newob.plyr = this.plyr;
	return newob;
    },
    "create": function (){
	"use strict";
	var newob = Object.create( muskPos );
	newob.tab = [[2,2,2,2,1],
		     [2,2,2,2,2],
		     [2,2,1,2,2],
		     [2,2,2,2,2],
		     [1,2,2,2,2]];
	newob.a = [[0,4],[2,2],[4,0]];
	newob.b = [[0,0],[0,1],[0,2],[0,3],
		   [1,0],[1,1],[1,2],[1,3],[1,4],
		   [2,0],[2,1],      [2,3],[2,4],
		   [3,0],[3,1],[3,2],[3,3],[3,4],
	                 [4,1],[4,2],[4,3],[4,4]];
	newob.plyr = 1;
	return newob;
    },
    "getLoc": function ( loc ){
	"use strict";
	return lookUp( this.tab, loc );
    },
    "setLoc": function ( loc, val ){
	"use strict";
	setMatEntry( this.tab, loc, val );
    },
    "equal": function( pos ){
	"use strict";
	return equalLp( this.tab, pos.tab ) && this.plyr === pos.plyr;
    }
};


function nbrMove(pos,l1,l2){
    "use strict";
    var val1 = pos.getLoc(l1),
        val2 = pos.getLoc(l2);
    // condition for [l1,l2] to be a valid move
    if( ( pos.plyr === 1 && val1 === 1 && val2 === 2 ) ||
        ( pos.plyr === 2 && val1 === 2 && val2 === 0 )){
	return [[l1,l2]];
    }else{
	return [];
    }
}

function moveToVct( mov ){
    "use strict";
    return mov[1].vector2Minus( mov[0] );
}

numChoices = 12;

function movesFromLoc(pos,loc){
    "use strict";
    var nbs = nbrs( loc, orthDirs, rectSize, rectSize ),
        res = [],
        fun = function(n){
	    res = res.concat(nbrMove(pos,loc,n));
        };
    eachLp( nbs, fun);
    return res;
}

//calc distance between points
function distanceTC( l1, l2 ){
    "use strict";
    return Math.abs( l1[0] - l2[0] ) + Math.abs( l1[1] - l2[1] );
}

// assign val to move for sorting
function moveSortVal(pos,mv){
    "use strict";
    if ( pos.plyr === 1 ){
	return 0;}
    var start = mv[ 0 ], end = mv[ 1 ], mvdir = moveToVct( mv ),
        dsts = mapLp( pos.a, 
		      function(l){ return distanceTC( start, l ); });
        // vals = mapLp( dirs;
	// function(d){ return ( d.dot( mvdir ) > 0 ) ? 1 : 0; });
    return - Math.min.apply( null, dsts );
}

function sortMoves(pos,mvs){
     "use strict";
   mvs.sort(function(a,b){
		 return moveSortVal(pos,b) - moveSortVal(pos,a);
	     });
}

// generate list of all possible moves from given position
function movesFromPos(pos){
    "use strict";
    var locs = ( pos.plyr === 1 ) ? pos.a : pos.b,
        res = [],
        fun = function(l){
	    res = res.concat(movesFromLoc(pos,l));
    };
    eachLp( locs, fun );
    sortMoves(pos,res);
    return res;
}

// return new muskPos by applying given mov to given pos 
function positionFromMove(mov,pos){
    "use strict";
    var pscp = pos.clone(),
        pc1 = pos.getLoc(mov[0]),
        pc2 = pos.getLoc(mov[1]),
        plyr = pos.plyr,
        plyrcche = plyr === 1 ? pscp.a : pscp.b;
    pscp.setLoc(mov[0],emptyCell);
    pscp.setLoc(mov[1],plyr);
    plyrcche.removeAll( mov[0] );
    plyrcche.push( mov[1] );
    if ( plyr === 1 ){
	pscp.b.removeAll( mov[1] );}
    pscp.plyr = opposite( pos.plyr );
    return pscp;
}


//check whether the 3 Ms are lined up
function checkLineQ( pos ){
    "use strict";
    return ( pos.a[0][0] === pos.a[1][0] && pos.a[2][0] === pos.a[1][0] ) ||
	( pos.a[0][1] === pos.a[1][1] && pos.a[2][1] === pos.a[1][1] );
}

function gameOverQ(pos, plyr){
    "use strict";
    // trouble if plyr != pos.plyr
    return checkLineQ( pos ) || ( movesFromPos(pos).length === 0 );
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
// weighting function for distFromLine
function dflWt( x ){
    "use strict";
    return x * x;
}

//score function for completed game pos
function scoreGame( pos ){
    "use strict";
    var res = {  }, lst;
    if ( checkLineQ( pos ) ){
	lst = [ 0, pos.b.length ];}
    else {
	lst = [ 10, 0 ];}
    if ( comp !== 2 ){
	lst.reverse();}
    res.H = lst[0];
    res.J = lst[1];
    return res;
}

function evalPosUncert( pos ){
    "use strict";
    var sgn, scr;
    if ( gameOverQ( pos ) ){
	scr = scoreGame( pos );
	sgn = ( comp === pos.plyr ) ? -1 : 1;
	return sgn * ( scr.H - scr.J );}
    else {
	sgn = plyrSgn( pos.plyr );
	return  sgn * ( - pos.b.length + dflWt( distFromLine( pos ) ) );}
}

// return string to represent player on board
function pceFn( plyr ){
    "use strict";
    var res;
    switch ( plyr ){
	case 0: 
	res = " ";
	break;
	case 1:
	res = "\u254b";
	break;
	case 2:
	res = "\u25ce";
	break;
    }
	return res;
}

function poscurToDisplay(pos){
    "use strict";
    var bd = pos.tab.map2( pceFn );
    //setBGCols();
    return bd;
}


function makeInitBdTab(){
    "use strict";
    var res = [], i, j, row;
    for( i = 0; i < rectSize; i++){
	 row = [];
	for( j = 0; j < rectSize; j++){
	    row.push(["  ",[i,j],{'height' : 80, 'width' : 80, 'fontsize' : 16}]);
	}
	res.push(row);
    }
    return res;
}

var initBdTab = makeInitBdTab();


var posInit = muskPos.create();


function makePosInit(){
    "use strict";
    var pce = pceFn( comp );
    postMessage("You are "+pce+" in this game.");
    return posInit;
}


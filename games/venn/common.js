//-*- js-mode -*-

/*jslint browser: true, devel: true, es5: true */
/*global setDiv, makeTag, cartesianProduct, makeButton, setTagOpt, setTagSty, getDiv, makeValCheck, flatten1, compareNumbers, newButtonOpts, setClickHandler, setOnClick, betterBezier, smallSet, unescape, cnv, cnvelm, repeatTxt, makeButt, Matrix, detSize */

var wdth, hght, cntrHt, cntrWd, sideDev, upDev, dnDev, crcSep, mrgn, vmrgn;
var labelhtml, posLab, charLab, posCent, drawArc, pi, pieces, rad, posRect;
var controlsHTML, bopts, curShadeClr, colors, colors, colors, colorOps;
var numOffV, numOffH, sin30, cos30, sqrt3, mode, memStack, smllst, emptySet;
//functions:
var drawVenn, shadeRegion, reShadeAll, addColors, drawInkInd, setShadeClrFun;
var reDrawAll, rePrintSizesAll, reDrawAll, cnvArc, chooseMode;
var uUnion = "\u222a", uInter = "\u2229"; 
var puzzleMode, lstAll, numAtomic, numPieces, numCircles;

if ( puzzleMode === undefined ){ puzzleMode = false; }

// // set text (value option) of tag with ID id to value val
// function setTagTxt( id, txt ){
//     "use strict";
//     var el = document.getElementById(id);
//     el.value = unescape( txt );
// }

function nullFun(){
"use strict";
}

var data, vals2, vals3, names, windowWidth, windowHeight;
if (  window.location.search.slice( 1 ) !== "" ){
    data = JSON.parse( unescape( window.location.search.slice( 1 ) ) );
    if ( data.width !== undefined ){
	windowWidth = data.width;
	windowHeight = data.height;
    }}
if (  window.location.search.slice( 1 ) === "" || data.width === undefined){
	windowWidth = window.innerWidth;
	windowHeight = window.innerHeight;
}

memStack = [];
mode = "Shade";
chooseMode = "Inter";
numOffH = 16;
numOffV = 4;
pi = Math.PI; 
sin30 = 1 / 2;
cos30 = Math.sqrt( 3 ) / 2;
sqrt3 = Math.sqrt( 3 );

charLab = {};
charLab.A = "A";
charLab.B = "B";
charLab.C = "C";
// while ( window.innerWidth < 325 ){
//     var dummy = Math.sqrt( 1000001 );
//     }

// wdth = 960;
wdth = windowWidth * 0.85;
// hght = 900;
hght = windowHeight * 0.90;
cntrHt = hght / 2;
cntrWd = wdth / 2;

colors = {};
colors.a = "LightBlue";
colors.b = "Pink";
colors.c = "Purple";
curShadeClr = colors.a;

controlsHTML = repeatTxt( "&nbsp;", 0 );
//controlsHTML = repeatTxt( "<br/>", 1 );
bopts = newButtonOpts();
bopts.text = "Switch";
bopts.bgColor = "Orange";
bopts.idtext = "bt2or3";
bopts.fontSize = "small";
bopts.width = 0.10 * windowWidth;
controlsHTML += "<br>" + makeButt( bopts );

bopts.text = "WS";
bopts.idtext = "btWSPuz";
controlsHTML += "<br>" + makeButt( bopts );

bopts.text = "Clear Shading";
bopts.idtext = "btClearShading";
bopts.bgColor = "White";
controlsHTML += "<br>" + makeButt( bopts );
bopts.text = "Clear Sizes";
//bopts.width = "9%";
bopts.idtext = "btClearSizes";
controlsHTML += "<br>" + makeButt( bopts );
//bopts.width = "5%";
bopts.bgColor = colors.a;
bopts.idtext = "bt" + colors.a;
bopts.text = "";
controlsHTML += "<br>" + makeButt( bopts );
bopts.bgColor = colors.b;
bopts.idtext = "bt" + colors.b;
controlsHTML += "<br>" + makeButt( bopts );
bopts.bgColor = colors.c;
bopts.idtext = "bt" + colors.c;
controlsHTML += "<br>" + makeButt( bopts );
bopts.bgColor = "White";
bopts.idtext = "btWhite";
controlsHTML += "<br>" + makeButt( bopts );
bopts.bgColor = "Silver";
bopts.text = "&cup;";
bopts.idtext = "btUnion";
controlsHTML += "<br>" + makeButt( bopts );
bopts.text = "&cap;";
bopts.idtext = "btInter";
controlsHTML += "<br>" + makeButt( bopts );
bopts.text = "&#9775;";
bopts.idtext = "btComp";
bopts.bgColor = colors.a;
controlsHTML += "<br>" + makeButt( bopts );
bopts.bgColor = "Silver";
//bopts.width = "6%";
bopts.text = "Push";
bopts.idtext = "btPush";
controlsHTML += "<br>" + makeButt( bopts );
bopts.text = "Pop";
bopts.idtext = "btPop";
controlsHTML += "<br>" + makeButt( bopts );
bopts.text = "Size From Sum";
bopts.idtext = "btSizeSum";
controlsHTML += "<br>" + makeButt( bopts );
bopts.text = "Size From Diff";
bopts.idtext = "btSizeDiff";
controlsHTML += "<br>" + makeButt( bopts );
bopts.text = "Shade";
bopts.bgColor = "Orange";
bopts.idtext = "btMode";
controlsHTML += "<br><br><br><br>" + makeButt( bopts );
bopts.text = "&cap;";
bopts.bgColor = "Orange";
bopts.idtext = "btChooseMode";
controlsHTML += "<br>" + makeButt( bopts );

colorOps = {};
colorOps.union = function( clr ){
    "use strict";
    if ( clr === "White" ){
	return "White";
    }
    return colors.a;
};
colorOps.inter = function( clr ){
    "use strict";
    if ( clr === colors.c ){
	return colors.a;
    }
    return "White";
};

colorOps.comp = function( clr ){
    "use strict";
    if ( clr !== colors.a ){
	return colors.a;
    }
    return "White";
};


//set label of Puzzle mode button
function setPuzBut(){
    "use strict";
    setTagOpt( "btWSPuz", "value", puzzleMode ? "Puzzle" : "WS" );
}

// identify region name from list of elementary constituents 
function idList( lst ){
    "use strict";
    var cnst, nm, res;
    res = "";
    cnst = lst.clone().sort();
    for ( nm in pieces ){
	if ( typeof( pieces[ nm ] ) !== 'function' && cnst.equal( pieces[ nm ].comprises ) ){
	    res = nm;
	    break;
	}
    }
    return res;
}

emptySet = new smallSet();

// form smallSet union of regions named in list 
function ssUnion( lst ){
    "use strict";
    var sslst;
    function ssFun( r ){ return pieces[ r ].ss; }
    sslst = lst.map( ssFun );
    function ssUn( s1, s2 ){ return s1.union( s2 ); }
    return sslst.reduce( ssUn, emptySet );
}

// the union of the first list is contained in the union of the second
// NB: regions are listed by name
function subsetOf( l1, l2 ){
    "use strict";
    var ss1, ss2;
    ss1 = ssUnion( l1 );
    ss2 = ssUnion( l2 );
    return ss1.subset( ss2 );
}

// check that string represents integers 
function checkIntQ( str ){
    "use strict";
    return String( parseInt( str, 10 ) ) === str || typeof( str ) === "number";
}

// find sized intermediate sets between given 
// sets are given as lists of names of regions 
function findIntermediateOfLists( l1, l2 ){
    "use strict";
    var res;
    res = [];
    function chck( r, n ){
	if ( subsetOf( l1, [n] ) && subsetOf( [n], l2 ) && checkIntQ( r.size ) ){
	 res.push( n );   
	} 
    }
    pieces.forEach( chck );
    return res;
}
// find sized intermediate sets between given 
// sets are given as names of regions 
function findIntermediate( nm1, nm2 ){
    "use strict";
    return findIntermediateOfLists( [nm1], [nm2] );
}

// get complement of set given as list of names 
function complement( lst ){
    "use strict";
    var res;
    res = pieces.U.comprises;
    function check( r ){ return !lst.has( r ); }
    return res.filter( check );
}


// determine size of given set
// set given by list of names 
function detSize( lst ){
    "use strict";
    var id, ints, i, cmp, crr, lres;
    id = idList( lst );
    if ( id !== "" && checkIntQ( pieces[ id ].size ) ){
	return pieces[ id ].size;
    }
    ints = findIntermediateOfLists( [], lst);
    for ( i=0; i < ints.length; i += 1){
	crr = ints[ i ];
	cmp = lst.intersection( complement( pieces[ crr ].comprises ) );
	lres = detSize( cmp );
	if ( checkIntQ( lres ) ){
	    return parseInt( pieces[ crr ].size, 10 ) + parseInt( lres, 10 );
	}
    }
    return null;
}

// return max of two regions, undefined if no max 
// regions by name
function maxOf( n1, n2 ){
    "use strict";
    if ( subsetOf( [n1], [n2] ) ){
	return n2;
    } else if ( subsetOf( [n2], [n1] ) ){
	return n1;
    } else {
	return undefined;
    }
}

// drawSizeLine 
function drawSizeLine( x1, y1, x2, y2 ){
    "use strict";
    cnv.beginPath();
    cnv.strokeStyle = "Blue";
    cnv.moveTo( x1, y1 );
    cnv.lineTo( x2, y2 );
    cnv.stroke();
}




// set mode flag 
function toggleMode(  ){
    "use strict";
    var old = mode;
    if ( old === "Shade" ){
	mode = "Size";
    } else {
	mode = "Shade";
    }
    setTagOpt( "btMode", "value", mode );
    drawInkInd();
}

// set chooseMode flag 
function toggleChooseMode(  ){
    "use strict";
    var old = chooseMode, newval;
    if ( old === "Union" ){
	chooseMode = "Inter";
    } else {
	chooseMode = "Union";
    }
    newval = ( chooseMode === "Union" ) ? uUnion : uInter;
    setTagOpt( "btChooseMode", "value", newval );
    drawInkInd();
}

//make onclick function for given color
function setShadeClrFun( clr ){
    "use strict";
    var clsclr = clr;
    return function(){ 
	curShadeClr = clsclr; 
	drawInkInd();
	if ( mode !== "Shade" ){ toggleMode(); }
    };
}


// reset all sizes to "?"
function resetSizes( ){
    "use strict";
    function whfn( reg, nm ){
	pieces[ nm ].size = "?";
	pieces[ nm ].showSize = false;
    }
    pieces.forEach( whfn );
    reDrawAll();
 }

// check that region is elementary 
function elemQ( reg ){
    "use strict";
    return reg.comprises.length === 1;
}

// push current color.a shading into memStack 
function stackPush( ){
    "use strict";
    var mem;
    mem = [];
    function addReg( reg, nm ){
	if ( elemQ( reg ) && reg.color === colors.a ){
	    mem.push( nm );
	}
    } 
    pieces.forEach( addReg );
    memStack.push( mem );
}

// pop last mem from stack 
function stackPop(  ){
    "use strict";
    var mem;
    mem = memStack.pop();
    function shadeReg( nm ){
	shadeRegion( nm, colors.b );
    }
    mem.forEach( shadeReg );
}

// assemble list of colors.a elements 
function selectedElem( clr ){
    "use strict";
    var res;
    if ( !clr ){
	clr = colors.a;
    }
    res = [];
    function chck( r, n ){
	if ( elemQ( r ) && r.color === clr ){
	    res.push( n );
	}
    }
    pieces.forEach( chck );
    return res;
}

// compute size of selected region 
function sizeSelected( clr ){
    "use strict";
    var lst, sz;
    if ( !clr ){
	clr = colors.a;
    }
    lst = selectedElem( clr );
    sz = detSize( lst );
    if ( sz ){
	return String( sz );
    } else {
	return "?";
    }
}

// handle calculate size from sum button 
function sizeFromSum( ev ){
    "use strict";
    var sel, sz, id;
    sel = selectedElem();
    id = idList( sel );
    if ( id !== "" ){
	sz = sizeSelected();
	pieces[ id ].size = sz;
	pieces[ id ].showSize = true;
	pieces[ id ].printSize();
    }
}

// handle Size From Diff button 
function sizeFromDiff( ev ){
    "use strict";
    var sel1, sel2, sel3, sz1, sz2, sz3, id2;
    sel2 = selectedElem( colors.c );
    sel1 = [ sel2, selectedElem( colors.a ) ].union();
    sel3 = sel1.intersection( complement( sel2 ) );
    sz1 = detSize( sel1 );
    if ( checkIntQ( sz1 ) ){
	sz3 = detSize( sel3 );
	if ( checkIntQ( sz3 ) ){
	    id2 = idList( sel2 );
	    if ( id2 !== "" ){
		sz2 = sz1 - sz3;
		pieces[ id2 ].size = sz2;
		pieces[ id2 ].showSize = true;
		pieces[ id2 ].printSize();
	    }}}}

// return vector of components of atomic pieces from given piece
function pcListToVector( lst ){
    "use strict";
    var res = lstAll.clone();
    function fun( p, i ){
	if ( lst.has( p ) ){ 
	    res[ i ] = 1; }
	else {
	    res[ i ] = 0;}}
    lstAll.forEach( fun );
    return( res );
}


var county = {};
county.edges = [];
county.ccw = [];
county.color = "White";
county.comprises = [];
county.size = "?";
county.sizeLoc = { "x": undefined, "y": undefined };
county.printSize = nullFun;
county.sizeLine = nullFun;
county.showSize = false;
county.vector = [ 0, 0, 0, 0];
county.sizeSecret = "?";

function newCounty( es, os, cmp, x, y ){
    "use strict";
    var res, loc;
    if ( !x ){
	x = 0;
	y = 0;
    }
    loc = { "x": x, "y": y };
    res = Object.create( county );
    res.edges = es;
    res.ccw = os;
    res.comprises = cmp;
    res.sizeLoc = loc;
    res.vector = pcListToVector( cmp );
    return res;
} 

// pick 4 random pieces
function pickRandomPieces(){
    "use strict";
    var res = [], i = 0, n = 0, p, x;
    for ( x in pieces ){
	if ( typeof( pieces[ x ] ) !== 'function' ){
	    p = ( numAtomic - n ) / ( numPieces - i );
	    if ( Math.random() < p ){
		res.push( pieces[ x ] );
		n += 1;}
	    i += 1;}}
    return( res );
}

// check that the given list of pieces spans:
// the cooresponding vectors form a matrix of full rank
function checkInfo( lst ){
    "use strict";
    var mat = Matrix.create( lst.map( function( x ){ return( x.vector ); } ) );
    return( mat.rank() === lstAll.length );}

//returns a list of 4 pieces with enough info
function formPuzzle(){
    "use strict";
    var res;
    do { 
	res = pickRandomPieces(); } 
    while ( !checkInfo( res ) );

    return( res );
}

// form and display givens of puzzle
function initPuzzle(){
    "use strict";
    var puzlst = formPuzzle(), 
        max = 20,
        basis = [],
        i, p;
    //puzlst.forEach(function(x){console.log(x.vector);});
    resetSizes();
    for ( i = 0; i < numAtomic; i += 1 ){
	basis.push( Math.floor( Math.random() * max ) ); }
    lstAll.forEach( function( x, i ){
	pieces[ x ].size = basis[ i ]; } );
    for ( p in pieces ){
	if ( typeof( pieces[ p ] ) !== 'function' ){
	    pieces[ p ].sizeSecret =  detSize( pieces[ p ].comprises );}}
    lstAll.forEach( function( x, i ){
	pieces[ x ].size = "?"; } );
    puzlst.forEach( function( x, i ){
	x.size = x.sizeSecret;
	x.showSize = true; } );

    if ( mode !== "Size" ){ toggleMode(); }
    reDrawAll();
}

// write size n at given location 
function writeSize( reg ){
    "use strict";
    if ( !reg.showSize ){
	return;
    }
    var n, x, y;
    n= reg.size;
    x = reg.sizeLoc.x;
    y = reg.sizeLoc.y;
    cnv.font = 'italic 40px Times';
    cnv.fillStyle = "Black";
    if ( puzzleMode && numCircles === 3 && reg.sizeSecret !== parseInt( n, 10 ) ){
	    cnv.fillStyle = "Red";}

    cnv.fillText( String( n ), x - numOffH, y - numOffV );
    reg.sizeLine();
}

function toggleWSPuz(){
    "use strict";
    puzzleMode = !puzzleMode;
    setPuzBut();
    drawInkInd();
    if ( puzzleMode ){ initPuzzle(); }
}

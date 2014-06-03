//-*- js-mode -*-

/*jslint browser: true, devel: true, es5: true */
/*global setDiv, makeTag, cartesianProduct, makeButton, setTagOpt, setTagSty, getDiv, makeValCheck, flatten1, compareNumbers, newButtonOpts, setClickHandler, setOnClick, betterBezier, smallSet, escape, unescape */
/*global reDrawAll, rePrintSizesAll, reDrawAll, cnvArc */
/*global drawSizeLine, ssUnion, checkIntQ, resetSizes, toggleMode, stackPop, stackPush, sizeFromSum, sizeFromDiff, toggleChooseMode, chooseMode */
/*global cnv:true, cnvelm:true, wdth, hght, cntrHt, cntrWd, sideDev:true, upDev:true, dnDev:true, crcSep:true, mrgn:true, vmrgn:true */
/*global labelhtml:true, posLab:true, charLab, posCent:true, drawArc:true, pi, pieces:true, rad:true, posRect:true */
/*global controlsHTML, bopts, curShadeClr:true, colors, colors, colors, colorOps */
/*global numOffV, numOffH, sin30, cos30, sqrt3, mode, memStack, smllst:true, emptySet */
/*global passedVals3:true */
//functions:default
/*global drawVenn, shadeRegion, reShadeAll, addColors, drawInkInd, setShadeClrFun */
/*global reDrawAll, rePrintSizesAll, reDrawAll, cnvArc, checkIntQ */
/*global puzzleMode:true, writeSize, toggleWSPuz, numCircles:true, setPuzBut */

var cnv, cnvelm;

numCircles = 2;

rad = hght / 4;
crcSep = rad;
sideDev = crcSep / 2;
mrgn = wdth / 10;
vmrgn = hght / 10;
posLab = {};
posLab.A = { x: 2 * mrgn, y: 2 * vmrgn };
posLab.B = { x: wdth - 2.2 * mrgn, y: 2 * vmrgn };
posCent = {};
posCent.A = { x: cntrWd - sideDev, y: cntrHt };
posCent.B = { x: cntrWd + sideDev, y: cntrHt };
posRect = { "x": mrgn, "y": vmrgn, "width": wdth - 2 * mrgn, "height": hght - 2 * vmrgn };

labelhtml = "<hbox><input id='labA' class='lab' type='text' size='2'></input>\
&nbsp;:&nbsp;<input id='defA' class='def' type='text' size='20'></input> \
<br></hbox><hbox><input id='labB' class='lab' type='text' size='2'></input>\
&nbsp;:&nbsp;<input id='defB' class='def' type='text' size='20'></input> \
<br></hbox>";

passedVals3 = {};

// // draw a figure 8 at x, y with radius r 
// function drawClover( x, y, r ){
//     "use strict";
//     var c1x, c1y, c2x, c2y, c3x, c3y;
//     c1x = x - r / 2;
//     c2x = x + r / 2;
//     c3x = x;
//     c1y = y - r / (2 * sqrt3);
//     c2y = c1y;
//     c3y = y + r / sqrt3;
//     cnv.beginPath();
//     cnvArc( c1x, c1y, r, pi / 3, 4 * pi / 3, true );
//     cnvArc( c3x, c3y, r, pi, 2 * pi, true );
//     cnvArc( c2x, c2y, r, -pi / 3, 2 * pi / 3, true );
//     cnv.closePath();
//     cnv.strokeStyle = "Black";
//     cnv.stroke();
// }

// identify part of VD where (x,y) is located 
function locatePnt( x, y ){
    "use strict";
    var da, db, dc, dr, res, tol;
    tol = 20;
    da = Math.sqrt( Math.pow( x - posCent.A.x, 2 ) + Math.pow( y - posCent.A.y, 2 ) );
    db = Math.sqrt( Math.pow( x - posCent.B.x, 2 ) + Math.pow( y - posCent.B.y, 2 ) );
    dr = rad;
    res = {};
    res.A = ( da < dr );
    res.B = ( db < dr );
    res.Acirc = ( Math.abs( da - dr ) < tol );
    res.Bcirc = ( Math.abs( db - dr ) < tol );
    res.AB = res.A && res.B;
    res.U = ( Math.abs( x - mrgn ) < tol || Math.abs( x - ( wdth - mrgn ) ) < tol || Math.abs( y - vmrgn ) < tol || Math.abs( y - ( hght - vmrgn ) ) < tol );
    return res;
}

// erase a letter from the canvas 
// function erase( abc, pos ){
//     "use strict";
//     cnv.fillStyle = 'White';
//     cnv.strokeStyle = 'White';
//     cnv.fillText( abc, pos.x, pos.y );
//     //cnv.strokeText( abc, pos.x, pos.y );    
// }

// clear all but the circles 
function clearDia( ){
    "use strict";
    //cnv.fillStyle = "White";
    cnv.clearRect(0, 0, wdth, hght);
    drawVenn();
}

// reset shadings to White 
function resetShade( ){
    "use strict";
    function whfn( reg, nm ){
	pieces[ nm ].color = "White";
    }
    pieces.forEach( whfn );
}

// clear all but the circles and reset shadings to White
function clearVenn( ){
    "use strict";
    clearDia();
    resetShade();
    reDrawAll();
    curShadeClr = colors.a;
    drawInkInd();
}


// change set variable 
function printVar( ev ){
    "use strict";
    var trgid, lb, newchr;
    trgid = ev.target.id;
    lb = trgid.slice( 3 );
    newchr = ev.target.value;
    //erase( charLab[ lb ], posLab[ lb ] );
    cnv.fillStyle = 'Black';
    //cnv.strokeStyle = 'Blue';    
    //cnv.fillText( newchr, posLab[ lb ].x, posLab[ lb ].y );
    charLab[ lb ] = newchr;
    reDrawAll();
    drawVenn();
}

// handle mouse clicks in canvas 
// return region string 
function mouseHandler( ev ){
    "use strict";
    var x, y, loc, reg, num;
    //bt = ev.button;
    x = ev.pageX;
    y = ev.pageY;
    x -= cnvelm.offsetLeft;
    y -= cnvelm.offsetTop;
    if ( x < posRect.x || y < posRect.y || x > posRect.x + posRect.width || y > posRect.y + posRect.height ){
	return;
    }
    loc = locatePnt( x, y );
    reg = "";

    switch ( chooseMode ){
    case "Union":
	if ( loc.AB ){
	    reg = "AuB"; 
	    break;
	} 
	//break;
    case "Inter":
	if ( loc.Acirc ){
	    reg = "A";
	} else if ( loc.Bcirc ){
	    reg = "B";
	} else if ( loc.AB ){
	    reg = "AB"; 
	} else if ( loc.U ){
	    reg = "U";
	} else if ( loc.A && !loc.B ){
	    reg = "Ab";
	} else if ( !loc.A && loc.B ) {
	    reg = "aB";
	} else if ( !loc.A && !loc.B ){
	    reg = "ab";
	} 
	break;
    default:
	console.log( "Click was not inside Venn diagram" );
	break;
    }
    //cnv.fillStyle = 'Red';
    //cnv.fillText( reg, x, y );
    if ( reg === "" ){ return; }
    if ( mode === "Shade" ){
	shadeRegion( reg );
    } else {
	//if ( !pieces[ reg ].showSize ){
	//    pieces[ reg ].showSize = true;
	//    pieces[ reg ].printSize();
	//} else {
	    num = prompt( "Size = " );
	    if ( num !== null ){
		pieces[ reg ].showSize = true;
		pieces[ reg ].size = num;
		pieces[ reg ].printSize();
	    }
	//}
    }
}

// redo arc method so it's sane 
// forward = Boolean, meaning counterclockwise
function cnvArc( x, y, r, a1, a2, forward ){
    "use strict";
    var an1, an2;
    if ( forward === undefined ){
	forward = true;
    }
    if ( !forward ){
	an1 = a2;
	an2 = a1;
    } else {
	an1 = a1;
	an2 = a2;
    }
    cnv.arc( x, y, r, -an1, -an2, forward );
}

drawArc = {
    'A': function(f){ "use strict"; 
cnvArc( posCent.A.x, posCent.A.y, rad, pi / 3, 5 * pi / 3, f ); },
    'B': function(f){ "use strict"; 
cnvArc( posCent.B.x, posCent.B.y, rad, -2 * pi / 3, 2 * pi / 3, f ); },
    'Ab': function(f){ "use strict"; 
cnvArc( posCent.A.x, posCent.A.y, rad, -pi / 3, pi / 3, f ); },
    'Ba': function(f){ "use strict"; 
cnvArc( posCent.B.x, posCent.B.y, rad, 2 * pi / 3, 4 * pi / 3, f ); },
    'Rect': drawRect
};



// list of all atomic pieces
var lstAll = [ "AB", "Ab", "aB", "ab" ].sort();

// generate smallSet from given region 
function regToSS( reg ){
    "use strict";
    return ssUnion( reg.comprises );
}

pieces = {
    "AB": newCounty( [ "Ab", "Ba" ], [ true, true ],
		    [ "AB" ], cntrWd, cntrHt ),
    "Ab": newCounty( [ "A", "Ba" ], [ true, false ],
		    [ "Ab" ], posCent.A.x - 0.4 * rad, cntrHt  ),
    "aB": newCounty( [ "B", "Ab" ], [ true, false ],
		    [ "aB" ], posCent.B.x + 0.4 * rad, cntrHt  ),
    "ab": newCounty( [ "A", "B", "Rect" ], [ false, false, true ],
		    [ "ab" ], wdth - 1.4 * mrgn, hght - 1.4 * vmrgn  ),
    "AuB": newCounty( [ "B", "A" ], [ true, true ],
		    [ "AB", "Ab", "aB" ].sort(), cntrWd, 0.8 * vmrgn  ),
    "A": newCounty( [ "A", "Ab" ], [ true, true ],
		    [ "AB", "Ab" ].sort(), 0.4 * mrgn, 2.3 * vmrgn  ),
    "B": newCounty( [ "B", "Ba" ], [ true, true ],
		    [ "AB", "aB" ].sort(), wdth - 0.6 * mrgn, 2.3 * vmrgn  ),
    "U": newCounty( [ "Rect" ], [ true ], [ "AB", "Ab", "aB", "ab" ].sort(), wdth - mrgn * 1.5, 0.9 * vmrgn )
};




pieces.AB.sizeLine = nullFun;
pieces.A.sizeLine = function(){
    "use strict";
    drawSizeLine( posCent.A.x - Math.sqrt( 3 ) * rad / 2, posCent.A.y - rad / 2, this.sizeLoc.x + 2 * numOffH, this.sizeLoc.y - 4 * numOffV );
};
pieces.B.sizeLine = function(){
    "use strict";
    drawSizeLine( posCent.B.x + Math.sqrt( 3 ) * rad / 2, posCent.B.y - rad / 2, this.sizeLoc.x - numOffH, this.sizeLoc.y - 4 * numOffV );
};
pieces.AuB.sizeLine = function(){
    "use strict";
    betterBezier( posCent.A.x, posCent.A.y - rad, 60, 240, this.sizeLoc.x, this.sizeLoc.y );
    betterBezier( posCent.B.x, posCent.B.y - rad, 120, 300, this.sizeLoc.x, this.sizeLoc.y );
};


smllst = emptySet.clone();
pieces.ab.ss = smllst.spawn( [0] );
pieces.Ab.ss = smllst.spawn( [1] );
pieces.aB.ss = smllst.spawn( [2] );
pieces.AB.ss = smllst.spawn( [3] );
pieces.AuB.ss = regToSS( pieces.AuB );
pieces.U.ss = regToSS( pieces.U );
pieces.A.ss = regToSS( pieces.A );
pieces.B.ss = regToSS( pieces.B );



// shade region outside figure-8
function shadeEightComp( clr ){
    "use strict";
    //var newclr;
    //newclr = addColors( clr, pieces.abc.color );
    if ( !clr ){
	clr = pieces.ab.color;
    }
    cnv.fillStyle = clr;
    cnv.beginPath();
    drawRect();
    cnv.closePath();
    cnv.fill();
    pieces.ab.color = clr;
    //writeSize( pieces.abc );
    rePrintSizesAll();
    reShadeAll();
}

// shade region xyz 
function shadeRegion( xyz, clr ){
    "use strict";
    var bnds, i, newclr;
    if ( xyz === "" ){
	clearDia();
	return ;
    }
    bnds = pieces[ xyz ];

    if ( bnds.comprises.length !== 1 ){
	return bnds.comprises.forEach( function( reg ){ shadeRegion( reg, clr ); } );
    }

    if ( !clr ){
	clr = curShadeClr;
    }
    newclr = addColors( clr, bnds.color );
    if ( xyz === "ab" ){
	return shadeEightComp( newclr );
    }
    if ( xyz === "U" ){
	shadeEightComp( newclr );
	return shadeRegion( "AuB", clr );
    }
    cnv.fillStyle = newclr;
    cnv.beginPath();
    for ( i = 0; i < bnds.ccw.length; i += 1 ){
	drawArc[ bnds.edges[i] ]( bnds.ccw[i] );
    }
    cnv.fill();
    pieces[ xyz ].color = newclr;
    //writeSize( bnds );
    rePrintSizesAll();
    drawVenn();
}


// reshade all regions except ABc 
function reShadeAll(  ){
    "use strict";
    var reg;
    for ( reg in pieces ) {
        if ( typeof( pieces[ reg ] ) !== 'function' && reg !== "ab" && reg.length === 2 ){
            shadeRegion( reg, pieces[ reg ].color );
        }
    }
    drawVenn();
}

// reprint sizes in all regions 
function rePrintSizesAll(  ){
    "use strict";
    var reg;
    for ( reg in pieces ) {
        if ( typeof( pieces[ reg ] ) !== 'function' && pieces[ reg ].showSize ){
            writeSize( pieces[ reg ] );
        }
    }
    drawVenn();
}


// redraw everything 
function reDrawAll( ){
    "use strict";
    clearDia();
    reShadeAll();
    shadeEightComp();
    rePrintSizesAll();
    drawVenn();
}

// fill in missing method
county.printSize = reDrawAll;


// carry out union, intersection, or comp
function performOp( opfun ){
    "use strict";
    function regop( reg, n ){
	if ( n.length === 2 ){
	    pieces[ n ].color = opfun( reg.color );
	}
    }
    pieces.forEach( regop );
    reDrawAll();
    setShadeClrFun( colors.b )();
}

// make onclick function for give operation 
function makeOpFun( opstr ){
    "use strict";
    var clsop = colorOps[ opstr ];
    return function(  ){
	 performOp( clsop );
    };
}


// draw universe of Venn diagram 
function drawRect( ){
    "use strict";
    cnv.rect( posRect.x, posRect.y, posRect.width, posRect.height );
    cnv.stroke();
}

// color addition function 
function addColors( c1, c2 ){
    "use strict";
    if ( c1 === "White" ){
	return "White";
    }
    if ( c2 === "White" ){
	return c1;
    }
    if ( c1 === c2 ){
	return c1;
    }
    return colors.c;
}

// draw venn diagram 
function drawVenn( ){
    "use strict";
    cnv.strokeStyle = "Black";
    cnv.beginPath();
    cnv.arc( posCent.A.x, posCent.A.y, rad, 0, 2*Math.PI );
    cnv.stroke();
    cnv.beginPath();
    cnv.arc( posCent.B.x, posCent.B.y, rad, 0, 2*Math.PI );
    cnv.stroke();
    //cnv.strokeRect( mrgn, mrgn, wdth - 2 * mrgn, hght - 2 * vmrgn );
    drawRect();

    cnv.font = 'italic 60px Times';
    cnv.fillStyle = 'Black';
    cnv.fillText( charLab.A, posLab.A.x, posLab.A.y );
    cnv.fillText( charLab.B, posLab.B.x, posLab.B.y );
    cnv.fillText( "U", mrgn * 1.1, 0.9 * vmrgn );

    drawInkInd();
}

// draw ink indicator 
function drawInkInd( clr ){
    "use strict";
    var rad;
    rad = 8;
    if ( mode === "Shade" ){
	if ( !clr ){
	    clr = curShadeClr;
	}
	cnv.beginPath();
	cnv.arc( wdth - 2 * rad, 2 * rad, 4 * rad, 0, 2 * pi );
	cnv.closePath();
	cnv.fillStyle = "White";
	cnv.fill();
	cnv.beginPath();
	cnv.arc( wdth - rad, rad, rad, 0, 2 * pi );
	cnv.closePath();
	cnv.fillStyle = clr;
	cnv.fill();
    } else {
	cnv.beginPath();
	cnv.arc( wdth - rad, rad, rad, 0, 2 * pi );
	cnv.closePath();
	cnv.fillStyle = "White";
	cnv.fill();
	cnv.fillStyle = "Black";
	cnv.font = 'normal 40px Times';
	cnv.fillText( "#", wdth - 3 * rad, 3 * rad );
    }
}

//number of atomic pieces
var numAtomic = lstAll.length;
//number of all pieces
var numPieces = 8;


//Translate from original label names to left = A and right = B.
function translateLabelCharFrom( c ){
    "use strict";
    var res = "";
    if ( c === charLab.A ){ 
	res = "A";}
    else if ( c === charLab.B ){
	res = "B";}
    else if ( c === charLab.A.toLowerCase() ){
	res = "a";}
    else if ( c === charLab.B.toLowerCase() ){
	res = "b";}
    else if ( c === "u" ){
	res = "u";}
    else if ( c === "U" ){
	res = "U";}
    return( res );
}
//Translate to original label names from left = A and right = B.
function translateLabelCharTo( c ){
    "use strict";
    var res = "";
    if ( c === "A" ){ 
	res = charLab.A;}
    else if ( c === "B" ){
	res = charLab.B ;}
    else if ( c === "a" ){
	res = charLab.A.toLowerCase();}
    else if ( c ===  "b"){
	res = charLab.B.toLowerCase();}
    else if ( c === "u" ){
	res = "u";}
    else if ( c === "U" ){
	res = "U";}
    return( res );
}

function translateStrFrom ( str ){
    "use strict";
    return( str.replace( /./g, translateLabelCharFrom ) );}

function translateStrTo ( str ){
    "use strict";
    return( str.replace( /./g, translateLabelCharTo ) );}

// pack data about A and B 
function packData(  ){
    "use strict";
    var data2, data3, datastr;
    data2 = {};
    data2[ translateStrTo( "A" ) ]  = pieces.A.size;
    data2[ translateStrTo( "B" ) ]  = pieces.B.size;
    data2[ translateStrTo( "AuB" ) ]  = pieces.AuB.size;
    data2[ translateStrTo( "U" ) ]  =	pieces.U.size;
    data2[ translateStrTo( "AB" ) ]  = pieces.AB.size;

    data3 = passedVals3;
    datastr = JSON.stringify( [ data2, data3, puzzleMode ] );
    return escape( datastr );
}


// switch to two circle diagram 
function toThree( ){
    "use strict";
    window.location = "./venn01.html?" + packData();
}


// fill on values passed from other page 
function fillPassedValues( ){
    "use strict";
    var data, vals2, vals3, lbllst, newnm;
    data = JSON.parse( unescape( window.location.search.slice( 1 ) ) );
    if ( data.length !== 4 ){
	return;
    }
    lbllst = data[0];
    vals2 = data[1];
    vals3 = data[2];
    charLab.A = lbllst[ 0 ];
    charLab.B = lbllst[ 1 ];
    puzzleMode = data[ 3 ];
    setPuzBut();
    //console.log( "puzzleMode = " + puzzleMode );
    function fillF( v, n ){
	if ( checkIntQ( v ) ){
	    newnm = translateStrFrom( n );
	    if ( newnm.length === n.length ){
		pieces[ newnm ].size = v;
		pieces[ newnm ].showSize = true;}
	}
    }
    vals2.forEach( fillF );
    vals3.forEach( fillF );
    passedVals3 = vals3;
}


// init canvas and rest of page
function initPage(  ){
    "use strict";

    var cnvStr = "<canvas id='vd' width=" + wdth + " height=" + hght + ">Your browser doesn't support the canvas element.</canvas>";

    setDiv( "canvasDiv", cnvStr );

    cnvelm = document.getElementById( "vd" );
    cnv = cnvelm.getContext( "2d" );


    drawVenn();

    setDiv( "buttons", controlsHTML );
    // setDiv( "labels", labelhtml );
    // setTagOpt( "labA", "onchange", printVar );
    // setTagOpt( "labB", "onchange", printVar );
    setOnClick( "btClearShading", clearVenn );
    setOnClick( "btClearSizes", resetSizes );
    setOnClick( "bt" +  colors.a, setShadeClrFun( colors.a ) );
    setOnClick( "bt" +  colors.b, setShadeClrFun( colors.b ) );
    setOnClick( "bt" +  colors.c, setShadeClrFun( colors.c ) );
    setOnClick( "btWhite", setShadeClrFun( "White" ) );
    setOnClick( "btUnion", makeOpFun( "union" ) );
    setOnClick( "btInter", makeOpFun( "inter" ) );
    setOnClick( "btComp", makeOpFun( "comp" ) );
    setOnClick( "btChooseMode", toggleChooseMode );
    setOnClick( "btMode", toggleMode );
    setOnClick( "btPush", stackPush );
    setOnClick( "btPop", stackPop );
    setOnClick( "btSizeSum", sizeFromSum );
    setOnClick( "btSizeDiff", sizeFromDiff );
    setOnClick( "bt2or3", toThree );
    setOnClick( "btWSPuz", toggleWSPuz );

    cnvelm.addEventListener( 'click', mouseHandler, false );
    
    fillPassedValues();
    reDrawAll();
}

setTimeout( initPage, 100 );


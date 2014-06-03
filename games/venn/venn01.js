//-*- js-mode -*-

/*jslint browser: true, devel: true, es5: true */
/*global setDiv, makeTag, cartesianProduct, makeButton, setTagOpt, setTagSty, getDiv, makeValCheck, flatten1, compareNumbers, newButtonOpts, setClickHandler, setOnClick, betterBezier, smallSet, escape, unescape, drawVenn */

/*global  cnv:true, cnvelm:true, wdth, hght, cntrHt, cntrWd, sideDev:true, upDev:true, dnDev:true, crcSep:true, mrgn:true, vmrgn:true */
/*global labelhtml:true, posLab:true, charLab, posCent:true, drawArc:true, pi, pieces:true, rad:true, posRect:true */
/*global controlsHTML, bopts, curShadeClr:true, colors, colors, colors, colorOps */
/*global numOffV, numOffH, sin30, cos30, sqrt3, mode:true, memStack, smllst:true, emptySet:true */
//functions:
/*global drawVenn, shadeRegion, reShadeAll, addColors, drawInkInd, setShadeClrFun */
/*global reDrawAll, rePrintSizesAll, reDrawAll, cnvArc */
/*global drawSizeLine, ssUnion, checkIntQ, resetSizes, toggleMode, stackPop, stackPush, sizeFromSum, sizeFromDiff, toggleChooseMode, chooseMode, toggleWSPuz, writeSize, puzzleMode:true, numCircles:true, setPuzBut */

var cnv, cnvelm;

numCircles = 3;

rad = hght / 4.3;
crcSep = rad;
dnDev = 0.10 * hght;
upDev = crcSep * Math.sqrt( 3 ) / 2 - dnDev;
sideDev = crcSep / 2;
mrgn = wdth / 10;
vmrgn = hght / 10;
posLab = {};
posLab.A = { x: 2 * mrgn, y: 2 * vmrgn };
posLab.B = { x: wdth - 2.2 * mrgn, y: 2 * vmrgn };
posLab.C = { x: wdth * 0.30, y: hght - 1.5 * vmrgn };
posCent = {};
posCent.A = { x: cntrWd - sideDev, y: cntrHt - upDev };
posCent.B = { x: cntrWd + sideDev, y: cntrHt - upDev };
posCent.C = { x: cntrWd, y: cntrHt + dnDev };
posRect = { "x": mrgn, "y": vmrgn, "width": wdth - 2 * mrgn, "height": hght - 2 * vmrgn };


labelhtml = "<hbox><input id='labA' class='lab' type='text' size='2'></input>\
&nbsp;:&nbsp;<input id='defA' class='def' type='text' size='20'></input> \
<br></hbox><hbox><input id='labB' class='lab' type='text' size='2'></input>\
&nbsp;:&nbsp;<input id='defB' class='def' type='text' size='20'></input> \
<br></hbox><hbox><input id='labC' class='lab' type='text' size='2'></input>\
&nbsp;:&nbsp;<input id='defC' class='def' type='text' size='20'></input></hbox>";

// draw a clover at x, y with radius r 
function drawClover( x, y, r ){
    "use strict";
    var c1x, c1y, c2x, c2y, c3x, c3y;
    c1x = x - r / 2;
    c2x = x + r / 2;
    c3x = x;
    c1y = y - r / (2 * sqrt3);
    c2y = c1y;
    c3y = y + r / sqrt3;
    cnv.beginPath();
    cnvArc( c1x, c1y, r, pi / 3, 4 * pi / 3, true );
    cnvArc( c3x, c3y, r, pi, 2 * pi, true );
    cnvArc( c2x, c2y, r, -pi / 3, 2 * pi / 3, true );
    cnv.closePath();
    cnv.strokeStyle = "Black";
    cnv.stroke();
}

// identify part of VD where (x,y) is located 
function locatePnt( x, y ){
    "use strict";
    var da, db, dc, dr, res, tol;
    tol = 20;
    da = Math.sqrt( Math.pow( x - posCent.A.x, 2 ) + Math.pow( y - posCent.A.y, 2 ) );
    db = Math.sqrt( Math.pow( x - posCent.B.x, 2 ) + Math.pow( y - posCent.B.y, 2 ) );
    dc = Math.sqrt( Math.pow( x - posCent.C.x, 2 ) + Math.pow( y - posCent.C.y, 2 ) );
    dr = Math.sqrt( Math.pow( rad, 2) );
    res = {};
    res.A = ( da < dr );
    res.B = ( db < dr );
    res.C = ( dc < dr );
    res.Acirc = ( Math.abs( da - dr ) < tol );
    res.Bcirc = ( Math.abs( db - dr ) < tol );
    res.Ccirc = ( Math.abs( dc - dr ) < tol );
    res.AB = res.Acirc && res.Bcirc;
    res.AC = res.Acirc && res.Ccirc;
    res.BC = res.Ccirc && res.Bcirc;
    res.ABC = res.A && res.B && res.C;
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
	} else if ( loc.AC ) {
	    reg = "AuC"; 
	    break;
	} else if ( loc.BC ){
	    reg = "BuC"; 
	    break;
	} else if ( loc.ABC){
	    reg = "AuBuC"; 
	    break;
	}
	//break;
    case "Inter":
	if ( loc.AB ){
	    reg = "AB"; 
	} else if ( loc.AC ) {
	    reg = "AC";
	} else if ( loc.BC ){
	    reg = "BC";
	}  else if ( loc.Acirc ){
	    reg = "A";
	} else if ( loc.Bcirc ){
	    reg = "B";
	} else if ( loc.Ccirc ){
	    reg = "C";
	} else if ( loc.U ){
	    reg = "U";
	} else if ( loc.A && loc.B && loc.C ){
	    reg = "ABC";
	} else if ( loc.A && loc.B && !loc.C ) {
	    reg = "ABc";
	} else if ( loc.A && !loc.B && loc.C ){
	    reg = "AbC";
	} else if ( !loc.A && loc.B && loc.C ){
	    reg = "aBC";
	} else if ( !loc.A && !loc.B && !loc.C ){
	    reg = "abc";
	} else if ( loc.A && loc.B && loc.C ){
	    reg = "ABC";
	} else if ( loc.A && !loc.B && !loc.C ) {
	    reg = "Abc";
	} else if ( !loc.A && !loc.B && loc.C ){
	    reg = "abC";
	} else if ( !loc.A && loc.B && !loc.C ){
	    reg = "aBc";
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
    } else if ( !puzzleMode || pieces[ reg ].size !== pieces[ reg ].sizeSecret ){
	//if ( !pieces[ reg ].showSize ){
	    pieces[ reg ].showSize = true;
	    pieces[ reg ].printSize();
	//} else {
	    num = prompt( "Size of " + reg + " = " );
	    if ( num !== null ){
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
cnvArc( posCent.A.x, posCent.A.y, rad, pi / 3, 4 * pi / 3, f ); },
    'B': function(f){ "use strict"; 
cnvArc( posCent.B.x, posCent.B.y, rad, -pi / 3, 2 * pi / 3, f ); },
    'C': function(f){ "use strict"; 
cnvArc( posCent.C.x, posCent.C.y, rad, -pi, 0, f ); },    
    'Ab': function(f){ "use strict"; 
cnvArc( posCent.A.x, posCent.A.y, rad, 0, pi / 3, f ); },
    'Abc': function(f){ "use strict"; 
cnvArc( posCent.A.x, posCent.A.y, rad, -pi / 3, 0, f ); },
    'Ac': function(f){ "use strict"; 
cnvArc( posCent.A.x, posCent.A.y, rad, -2 * pi / 3, -pi / 3, f ); },
    'Bc': function(f){ "use strict"; 
cnvArc( posCent.B.x, posCent.B.y, rad, -2 * pi / 3, -pi / 3, f ); },
    'Bac': function(f){ "use strict"; 
cnvArc( posCent.B.x, posCent.B.y, rad, -pi, -2 * pi / 3, f ); },
    'Ba': function(f){ "use strict"; 
cnvArc( posCent.B.x, posCent.B.y, rad, 2 * pi / 3, pi, f ); },
    'Ca': function(f){ "use strict"; 
cnvArc( posCent.C.x, posCent.C.y, rad, 2 * pi / 3, pi, f ); },    
    'Cab': function(f){ "use strict"; 
cnvArc( posCent.C.x, posCent.C.y, rad, pi / 3, 2 * pi /3, f ); },    
    'Cb': function(f){ "use strict"; 
cnvArc( posCent.C.x, posCent.C.y, rad, 0, pi / 3, f ); },
    'Rect': drawRect
};


function nullFun(){
"use strict";
}

// generate smallSet from given region 
function regToSS( reg ){
    "use strict";
    return ssUnion( reg.comprises );
}

lstAll = [ "ABC", "ABc", "AbC", "Abc", "aBC", "aBc", "abC", "abc" ].sort();

pieces = {
    "ABC": newCounty( [ "Abc", "Bac", "Cab" ], [ false, false, false ],
		    [ "ABC" ], cntrWd, cntrHt ),
    "aBC": newCounty( [ "Abc", "Bc", "Cb" ], [ false, true, true ],
		      [ "aBC" ], cntrWd + 1.1 * sideDev, cntrHt + 0.6 * dnDev ),
    "AbC": newCounty( [ "Ac", "Bac", "Ca" ], [ true, false, true ],
		    [ "AbC" ], cntrWd - 1.3 * sideDev, cntrHt + 0.7 * dnDev  ),
    "ABc": newCounty( [ "Ab", "Ba", "Cab" ], [ true, true, false ],
		    [ "ABc" ], cntrWd, cntrHt - 1.7 * upDev  ),
    "Abc": newCounty( [ "A", "Ca", "Ba" ], [ true, false, false ],
		    [ "Abc" ], posCent.A.x - 0.4 * rad, posCent.A.y - 0.2 * rad ),
    "aBc": newCounty( [ "B", "Cb", "Ab" ], [ true, false, false ],
		    [ "aBc" ], posCent.B.x + 0.4 * rad, posCent.B.y - 0.2 * rad  ),
    "abC": newCounty( [ "Ac", "Bc", "C" ], [ false, false, true ],
		    [ "abC" ], cntrWd, posCent.C.y + 0.6 * rad  ),
    "abc": newCounty( [ "A", "B", "C", "Rect" ], [ false, false, false, true ],
		    [ "abc" ], wdth - 2 * mrgn, hght - 2 * vmrgn  ),
    "AuBuC": newCounty( [ "A", "C", "B"], [ true, true, true ],
		    [ "ABC", "aBC", "AbC", "ABc", "abC", "aBc", "Abc" ].sort(), wdth - mrgn / 1.9, hght - 0.6 * vmrgn  ),
    "AB": newCounty( [ "Ab", "Abc", "Bac", "Ba" ], [ true, true, true, true ],
		    [ "ABC", "ABc" ].sort(), cntrWd + 0.9 * mrgn, 0.8 * vmrgn  ),
    "AC": newCounty( [ "Ac", "Abc", "Cab", "Ca" ], [ true, true, true, true ],
		    [ "ABC", "AbC" ].sort(), 0.4 * mrgn, 0.8 * hght  ),
    "BC": newCounty( [ "Bc", "Bac", "Cab", "Cb" ], [ true, true, true, true ],
		    [ "ABC", "aBC" ].sort(), wdth - 0.6 * mrgn, 0.8 * hght  ),
    "AuB": newCounty( [ "B", "A", "Ac", "Bc" ], [ true, true, true, true ],
		    [ "ABC", "ABc", "AbC", "Abc", "aBC", "aBc" ].sort(), cntrWd - 0.6 * mrgn, 0.8 * vmrgn  ),
    "AuC": newCounty( [ "A", "C", "Cb", "Ab" ], [ true, true, true, true ],
		    [ "ABC", "AbC", "ABc", "Abc", "aBC", "abC" ].sort(), 0.4 * mrgn, cntrHt + vmrgn  ),
    "BuC": newCounty( [ "C", "B", "Ba", "Ca" ], [ true, true, true, true ],
		    [ "ABC", "aBC", "ABc", "aBc", "AbC", "abC" ].sort(), wdth - 0.6 * mrgn, cntrHt + vmrgn  ),
    "A": newCounty( [ "A", "Ac", "Abc", "Ab" ], [ true, true, true, true ],
		    [ "ABC", "ABc", "AbC", "Abc" ].sort(), 0.4 * mrgn, 2.3 * vmrgn  ),
    "B": newCounty( [ "B", "Ba", "Bac", "Bc" ], [ true, true, true, true ],
		    [ "ABC", "ABc", "aBC", "aBc" ].sort(), wdth - 0.6 * mrgn, 2.3 * vmrgn  ),
    "C": newCounty( [ "C", "Ca", "Cab", "Cb" ], [ true, true, true, true ],
		    [ "ABC", "AbC", "aBC", "abC" ].sort(), cntrWd, hght - 0.4 * vmrgn  ),
    "U": newCounty( [ "Rect" ], [ true ], [ "ABC", "ABc", "AbC", "Abc", "aBC", "aBc", "abC", "abc" ].sort(), wdth - mrgn * 1.5, 0.9 * vmrgn )
};




pieces.AB.sizeLine = function(){
    "use strict";
    drawSizeLine( cntrWd, posCent.A.y - Math.sqrt( 3 ) / 2 * rad, this.sizeLoc.x, this.sizeLoc.y );
};
pieces.AC.sizeLine = function(){
    "use strict";
    drawSizeLine( posCent.A.x - rad / 2, posCent.A.y + Math.sqrt( 3 ) / 2 * rad, this.sizeLoc.x + 2 * numOffH, this.sizeLoc.y - 4 * numOffV );
};
pieces.BC.sizeLine = function(){
    "use strict";
    drawSizeLine( posCent.B.x + rad / 2, posCent.B.y + Math.sqrt( 3 ) / 2 * rad, this.sizeLoc.x - numOffH, this.sizeLoc.y - 4 * numOffV );
};
pieces.A.sizeLine = function(){
    "use strict";
    drawSizeLine( posCent.A.x - Math.sqrt( 3 ) * rad / 2, posCent.A.y - rad / 2, this.sizeLoc.x + 3 * numOffH, this.sizeLoc.y - 4 * numOffV );
};
pieces.B.sizeLine = function(){
    "use strict";
    drawSizeLine( posCent.B.x + Math.sqrt( 3 ) * rad / 2, posCent.B.y - rad / 2, this.sizeLoc.x - numOffH, this.sizeLoc.y - 4 * numOffV );
};
pieces.C.sizeLine = function(){
    "use strict";
    drawSizeLine( posCent.C.x, posCent.C.y + rad, this.sizeLoc.x, this.sizeLoc.y - 10 * numOffV );
};
pieces.AuB.sizeLine = function(){
    "use strict";
    betterBezier( posCent.A.x, posCent.A.y - rad, 60, 240, this.sizeLoc.x, this.sizeLoc.y );
    betterBezier( posCent.B.x, posCent.B.y - rad, 120, 300, this.sizeLoc.x, this.sizeLoc.y );
};
pieces.AuC.sizeLine = function(){
    "use strict";
    var x2, y2;
    x2 = this.sizeLoc.x + 3 * numOffH;
    y2 = this.sizeLoc.y - 4 * numOffV;
    betterBezier( posCent.A.x - rad, posCent.A.y, 210, 30, x2, y2 );
    betterBezier( posCent.C.x - cos30 * rad, posCent.C.y + rad / 2, 180, 0, x2, y2 );
};
pieces.BuC.sizeLine = function(){
    "use strict";
    var x2, y2;
    x2 = this.sizeLoc.x - numOffH;
    y2 = this.sizeLoc.y - 4 * numOffV;
    betterBezier( posCent.B.x + rad, posCent.B.y, -30, 150, x2, y2 );
    betterBezier( posCent.C.x + cos30 * rad, posCent.C.y + rad / 2, 0, 180, x2, y2 );
};
pieces.AuBuC.sizeLine = function(){
    "use strict";
    var x2, y2;
    x2 = this.sizeLoc.x + 0.56 * numOffH;
    y2 = this.sizeLoc.y - 3 * numOffV;
    drawClover( x2, y2, 26 );
};


smllst = emptySet.clone();
pieces.abc.ss = smllst.spawn( [0] );
pieces.Abc.ss = smllst.spawn( [1] );
pieces.aBc.ss = smllst.spawn( [2] );
pieces.abC.ss = smllst.spawn( [3] );
pieces.ABc.ss = smllst.spawn( [4] );
pieces.AbC.ss = smllst.spawn( [5] );
pieces.aBC.ss = smllst.spawn( [6] );
pieces.ABC.ss = smllst.spawn( [7] );
pieces.AB.ss = regToSS( pieces.AB );
pieces.AC.ss = regToSS( pieces.AC );
pieces.BC.ss = regToSS( pieces.BC );
pieces.AuB.ss = regToSS( pieces.AuB );
pieces.AuC.ss = regToSS( pieces.AuC );
pieces.BuC.ss = regToSS( pieces.BuC );
pieces.AuBuC.ss = regToSS( pieces.AuBuC );
pieces.U.ss = regToSS( pieces.U );
pieces.A.ss = regToSS( pieces.A );
pieces.B.ss = regToSS( pieces.B );
pieces.C.ss = regToSS( pieces.C );


// shade region outside clover 
function shadeCloverComp( clr ){
    "use strict";
    //var newclr;
    //newclr = addColors( clr, pieces.abc.color );
    if ( !clr ){
	clr = pieces.abc.color;
    }
    cnv.fillStyle = clr;
    cnv.beginPath();
    drawRect();
    cnv.closePath();
    cnv.fill();
    pieces.abc.color = clr;
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
    if ( xyz === "abc" ){
	return shadeCloverComp( newclr );
    }
    if ( xyz === "U" ){
	shadeCloverComp( newclr );
	return shadeRegion( "AuBuC", clr );
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
        if ( typeof( pieces[ reg ] ) !== 'function' && reg !== "abc" && reg.length === 3 && reg[1] !== "u" ){
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
    shadeCloverComp();
    rePrintSizesAll();
    drawVenn();
}

// fill in missing method
county.printSize = reDrawAll;


// carry out union, intersection, or comp
function performOp( opfun ){
    "use strict";
    function regop( reg, n ){
	if ( n.length === 3 && n[1] !== "u" ){
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
    cnv.arc( posCent.C.x, posCent.C.y, rad, 0, 2*Math.PI );
    cnv.stroke();
    cnv.closePath();
    cnv.beginPath();
    cnv.arc( posCent.A.x, posCent.A.y, rad, 0, 2*Math.PI );
    cnv.stroke();
    cnv.closePath();
    cnv.beginPath();
    cnv.arc( posCent.B.x, posCent.B.y, rad, 0, 2*Math.PI );
    cnv.stroke();
    cnv.closePath();
    //cnv.strokeRect( mrgn, mrgn, wdth - 2 * mrgn, hght - 2 * vmrgn );
    drawRect();

    cnv.font = 'italic 60px Times';
    cnv.fillStyle = 'Black';
    cnv.fillText( charLab.A, posLab.A.x, posLab.A.y );
    cnv.fillText( charLab.B, posLab.B.x, posLab.B.y );
    cnv.fillText( charLab.C, posLab.C.x, posLab.C.y );
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
var numPieces = 20;

//make the list of sets to pass to VennTwo
function whichTwo(){
    "use strict";
    if ( pieces.Abc.color === "White" ){
	return( [ "B", "C" ] );}
    else if ( pieces.aBc.color !== "White" ) {
	return( [ "A", "B" ] );}
    else {
	return( [ "A", "C" ] );}
}

// pack data about A and B 
function packData(  ){
    "use strict";
    var data2, data3, datastr, lbllst;
    localStorage.pieces  = JSON.stringify( pieces );
    lbllst = whichTwo();
    data2 = { 
	     "Ab": ( checkIntQ( pieces.AbC.size ) && checkIntQ( pieces.Abc.size ) ) ? parseInt( pieces.AbC.size, 10 ) + parseInt( pieces.Abc.size, 10 ): "?",
	     "aB": ( checkIntQ( pieces.aBC.size ) && checkIntQ( pieces.aBc.size ) ) ? parseInt( pieces.aBC.size, 10 ) + parseInt( pieces.aBc.size, 10 ) : "?",

	     "Ac": ( checkIntQ( pieces.Abc.size ) && checkIntQ( pieces.ABc.size ) ) ? parseInt( pieces.Abc.size, 10 ) + parseInt( pieces.ABc.size, 10 ): "?",
	     "aC": ( checkIntQ( pieces.aBC.size ) && checkIntQ( pieces.abC.size ) ) ? parseInt( pieces.aBC.size, 10 ) + parseInt( pieces.abC.size, 10 ) : "?",

	     "bC": ( checkIntQ( pieces.AbC.size ) && checkIntQ( pieces.abC.size ) ) ? parseInt( pieces.AbC.size, 10 ) + parseInt( pieces.abC.size, 10 ): "?",
	     "Bc": ( checkIntQ( pieces.aBc.size ) && checkIntQ( pieces.ABc.size ) ) ? parseInt( pieces.aBc.size, 10 ) + parseInt( pieces.ABc.size, 10 ) : "?",

	     "ab": ( checkIntQ( pieces.abC.size ) && checkIntQ( pieces.abc.size ) ) ? parseInt( pieces.abC.size, 10 ) + parseInt( pieces.abc.size, 10 ): "?",
	     "ac": ( checkIntQ( pieces.abc.size ) && checkIntQ( pieces.aBc.size ) ) ? parseInt( pieces.abc.size, 10 ) + parseInt( pieces.aBc.size, 10 ): "?",
	     "bc": ( checkIntQ( pieces.Abc.size ) && checkIntQ( pieces.abc.size ) ) ? parseInt( pieces.Abc.size, 10 ) + parseInt( pieces.abc.size, 10 ): "?"
	   };
    data3 = {};
    function fillF( r, n ){
	data3[ n ] = r.size;
    }
    pieces.forEach( fillF );
    datastr = JSON.stringify( [ lbllst, data2, data3, puzzleMode ] );
    return escape( datastr );
}

// switch to two circle diagram 
function toTwo( ){
    "use strict";
    window.location = "./vennTwo01.html?" + packData();
}

// fill on values passed from other page 
function fillPassedValues( ){
    "use strict";
    var data, dataStr, vals2, vals3, datastr, names, lspcs;
    dataStr = unescape( window.location.search.slice( 1 ) );
    if ( dataStr === "" ){ return; }
    data = JSON.parse( dataStr );
    if ( data.length !== 3 ){ return; }
    lspcs = JSON.parse( localStorage.pieces );
    vals2 = data[0];
    vals3 = data[1];
    puzzleMode = data[ 2 ];
    setPuzBut();
    function fillF( v, n ){
	pieces[ n ].sizeSecret = lspcs[ n ].sizeSecret;
	if ( checkIntQ( v ) ){
	    pieces[ n ].size = v;
	    pieces[ n ].showSize = true;
	}
    }
    vals3.forEach( fillF );
    vals2.forEach( fillF );
}

// init canvas and rest of page
function initPage(  ){
    "use strict";

    var cnvStr = "<canvas id='vd' width=" + wdth + " height=" + hght + ">Your browser doesn't support the canvas element.</canvas>";

    setDiv( "canvasDiv", cnvStr );

    //console.log("width = ", wdth);

    cnvelm = document.getElementById( "vd" );
    cnv = cnvelm.getContext( "2d" );
    
    drawVenn();

    setDiv( "buttons", controlsHTML );
    // setDiv( "labels", labelhtml );
    // setTagOpt( "labA", "onchange", printVar );
    // setTagOpt( "labB", "onchange", printVar );
    // setTagOpt( "labC", "onchange", printVar );
    setOnClick( "btClearShading", clearVenn );
    setOnClick( "btClearSizes", resetSizes );
    setOnClick( "bt" +  colors.a, setShadeClrFun( colors.a ) );
    setOnClick( "bt" +  colors.b, setShadeClrFun( colors.b ) );
    setOnClick( "bt" +  colors.c, setShadeClrFun( colors.c ) );
    setOnClick( "btWhite", setShadeClrFun( "White" ) );
    setOnClick( "btUnion", makeOpFun( "union" ) );
    setOnClick( "btInter", makeOpFun( "inter" ) );
    setOnClick( "btComp", makeOpFun( "comp" ) );
    setOnClick( "btMode", toggleMode );
    setOnClick( "btChooseMode", toggleChooseMode );
    setOnClick( "btPush", stackPush );
    setOnClick( "btPop", stackPop );
    setOnClick( "btSizeSum", sizeFromSum );
    setOnClick( "btSizeDiff", sizeFromDiff );
    setOnClick( "bt2or3", toTwo );
    setOnClick( "btWSPuz", toggleWSPuz );

    cnvelm.addEventListener( 'click', mouseHandler, false );

    fillPassedValues();
    reDrawAll();
}

setTimeout( initPage, 100 );


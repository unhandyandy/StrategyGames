//-*-mode: Javascript; -*-

/*jslint browser: true, devel: true */
/*global setDiv, makeTag, cartesianProduct, makeButton, setTagOpt, setTagSty, getDiv, makeValCheck, flatten1, compareNumbers, best, lexicalListOrder,
setClickHandler */

var cARDcHOICE = 0;
var sTACKsIZE = 52;
var hAND = { "H" : [] , "C" : [] };
var pASS;
var sCORE;

var gameOn = false;

var pref = lexicalListOrder;

function makeButton (txt,idtxt,func,width,height,fsize,bgcolor,ffamily) {
    "use strict";
    if (!width) {
	width = "1*";
    }
    if (!height) {
	height = "1*";
    }
    if (!fsize) {
	fsize = "14";
    }
    if ( !bgcolor ) {
	bgcolor = "Chartreuse";
    }    
    if ( !ffamily ) {
	ffamily = "Georgia, Times New Roman, Comic Sans MS, Helvetica, Palatino";
    }    
    var stytxt = "style='width:" + width + ";font-family:" + ffamily + ";background-color:" + bgcolor + ";height:" + height + ";font-size:" + fsize + ";'";
    setClickHandler( idtxt, func );
    return "<input type='button' value='"+txt+"' "+stytxt+" id='"+idtxt+"'>";
}



// get score from local storage 
function getLSScore(  ){
    "use strict";
    var lss, scr;
    lss = localStorage.quickGin_score;
    if ( !lss ){
	sCORE = { "H": [ 0, 0, 0 ], "C": [ 0, 0, 0 ] };
    } else {
	scr = JSON.parse( lss );
	sCORE = scr;
    }
}

// put score into storage 
function putScoreLS(  ){
    "use strict";
    var scrtxt;
    scrtxt = JSON.stringify( sCORE );
    localStorage.quickGin_score = scrtxt;
}


// return rank of card 
function getRank( crd ){
    "use strict";
    return crd[0];
}

// return suit of card 
function getSuit( crd ){
    "use strict";
    return crd[1];
}
// return points value of card 
function value( crd ){
    "use strict";
    var r = getRank( crd );
    return ( r < 9 ) ? r + 1 : 10;
}

// returns sum of all pnts in crds 
function points( crds ){
    "use strict";
    var vals, pts;
    vals = crds.map( value );
    pts = vals.reduce( Math.plus, 0 );
    return [ crds.length, pts ];
}

// display a player's score 
function oneScoreTxt( scr ){
    "use strict";
    var g, h, m;
    g = String( scr[0] );
    h = String( scr[1] );
    m = String( scr[2] );
    return "<span style='font-size:12'>Game:</span>&nbsp;" + g + "&nbsp;&nbsp;&nbsp;&nbsp;<span style='font-size:12'>Hands:</span>&nbsp;" + h + "&nbsp;&nbsp;&nbsp;&nbsp;<span style='font-size:12'>Match:</span> " + m;
}


function scoreTxt () {
    "use strict";
    var ttl;
    //ttl = "<span style='color:red'>Score:</span>";
    return "Human:&nbsp;&nbsp;" + oneScoreTxt( sCORE.H ) + "&nbsp;&nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp;&nbsp;JS:&nbsp;&nbsp;" + oneScoreTxt( sCORE.C );
}

function printScore() {
    "use strict";
    setDiv("divScore",scoreTxt());
    putScoreLS();
}

// reset scores 
function scoreReset(  ){
    "use strict";
    var ok;
    ok = window.confirm( "Sure you want to reset the Score?" );
    if ( !ok ){ return; }
    sCORE = {"H": [ 0, 0, 0 ], "C": [ 0, 0, 0 ] };
    printScore();
}


var sUITS = [0,1,2,3];
var rANKS = [0,1,2,3,4,5,6,7,8,9,10,11,12];

// generate a fresh deck 
function makeDeck ( ){
    "use strict";
    return cartesianProduct(rANKS,sUITS);
}
// string to use to display rank of card 
function rankTxt( crd ){
    "use strict";
    var r = getRank( crd );
    if ( 0 < r && r < 9 ) {
	return String(r+1);
    }
    switch ( r ) {
    case 0:
	return "A";
    case 9:
	return "T";
    case 10:
	return "J";
    case 11:
	return "Q";
    case 12:
	return "K";
    default:
	return " ";
    }
}

// string to use to choose suit color of card 
function suitCol( crd ){
    "use strict";
    var s = crd[1];
    switch ( s ) {
    case 0:
	return "Yellow";
    case 1:
	return "#aa00aa";
    case 2:
	return "#FF7700";
    case 3:
	return "#0077FF";
    default:
	return "Black";
    }
}

//  set card display at button with given id
function setCardDispAtID( crd, id ){
    "use strict";
    var col, tb;
    tb = id[0];
    col = ( id === "pickupBut" ) || ( id === "discardBut" ) || ( ( tb === "C" || tb === "H" ) && ( hAND[ tb ] ).has(crd) )  ? suitCol(crd) : "#000000";
    setTagOpt(id, "value", rankTxt(crd));
    setTagSty(id, "background", col);
}

// return id string of card for given table tb 
function cardID( crd, tb ){
    "use strict";
    return tb + "_" + String(crd[0]) + "_" + String(crd[1]);
}


// set card appearance in one of the tables (tb) 
function setCardDisp( crd, tb ){
    "use strict";
    var id;
    if ( !crd.equal( [-1, -1 ] ) ){
	id = cardID( crd, tb );
	setCardDispAtID(crd, id);
    }
}


var dISCARD = [];

// update display 
function updateDisplay( pck ){
    "use strict";
    var dscrd, did;
    dscrd = dISCARD.last();
    did = cardID( dscrd, "H" );
    (makeDeck()).forEach(function(crd){setCardDisp(crd, "H");});
    setCardDispAtID( dscrd, "pickupBut" );
    //setCardDispAtID( dscrd, did );
    if ( !dscrd.equal( [-1, -1 ] ) ){
	setTagSty( did, "background-color", "LightGray" );
    } 
    if ( hAND.H.has( cARDcHOICE ) ){
	setCardDispAtID( cARDcHOICE, "discardBut" );
    } 
    if ( pck ) {
	setTagSty( cardID( pck, "H" ), "background-color", "SlateGray" );
    }
}

var dECK = makeDeck();
var lOCATION = {};

function initLoc () {
    "use strict";
    function fnc (crd) {
	lOCATION[crd] = "?";
    }
    dECK.forEach(fnc);
}

initLoc();







mESSAGE = "";

// display message 
function dispMsg( txt ){
    "use strict";
    var res;
    res = mESSAGE.split("\n");
    if ( res.length > 2 ) { 
	res.reverse();
	res.pop(); 
	res.reverse();
    } 
    res = res.map(function(m){return m + "\n";});
    res.push(txt);
    mESSAGE = res.join( "" );
    setDiv( "messages", mESSAGE.replace( /\n/g,"<br>" ) );
}

// draw one card from given deck, return card and remaining deck 
function drawOne( deck ){
    "use strict";
    var pos, crd, newdck;
    pos = Math.floor(Math.random()*deck.length);
    crd = deck[pos];
    newdck = deck.removeC(pos);
    if( newdck.length < 3 ){
	dispMsg("Last card");
    }
    return [crd, newdck];
}


// return test of player's name 
function getPlayerName( str ){
    "use strict";
    return ( str === "C" ) ? " Java Script " : " Human ";
}

// html to display card in messages 
function cardToHTML( crd ){
    "use strict";
    var txt, col, html;
    txt = rankTxt( crd );
    col = suitCol( crd );
    html = '<span style="color:' + col + '">' + txt + '</span>';
    return html;
}


var dISCARDbY = {};

// player plyr discards card crd 
function takeBase( plyr, crd ){
    "use strict";
    var len = dISCARD.length;
    hAND[plyr] = hAND[plyr].removeAll(crd);
    dISCARD.push(crd);
    lOCATION[crd] = "D";
    dISCARDbY[crd] = plyr;
    lOCATION[ dISCARD[ len - 1 ] ] = "0";
    dECK = dECK.removeAll(crd);
    updateDisplay();
}
// player plyr picks up card from discard pile 
function pickUpDiscard( plyr ){
    "use strict";
    var pick, crd;
    crd = dISCARD.last();
    dispMsg( getPlayerName( plyr ) + "picks up " + cardToHTML( crd ) + " from discard pile..." );
    pick = dISCARD.pop();
    hAND[plyr].push(pick);
    lOCATION[pick] = plyr;
    pASS = 0;
    updateDisplay( pick );
}


// add card crd to hand of player plyr 
function addToHand( plyr, crd ){
    "use strict";
    if(!hAND[plyr].has(crd)){
	hAND[plyr].push(crd);
	if(plyr === "C"){
	    lOCATION[crd] = "C";
	}
    }  
}



// deal one card from dECK to player plyr 
function dealOneTo( plyr ){
    "use strict";
    if ( dECK.length > 2 ) {
	var deal = drawOne(dECK);
	if ( plyr === "H" ){
	    cARDcHOICE = deal[0];
	}
	addToHand(plyr,deal[0]);
	dECK = deal[1];
	sTACKsIZE -= 1;
	pASS -= 1;
	return true;
    } else {
	dispMsg("Hand Over");
	gameOn = false;
	return false;
    }
}

// deal m cards to player plyr 
function dealMTo( plyr, m ){
    "use strict";
    if ( m >= 1 ) {
	dealOneTo(plyr);
	dealMTo(plyr, m-1);
    }
}




// initialize the dISCARDbY array 
function initDiscardBy(  ){
    "use strict";
    function fun (crd) {
	dISCARDbY[crd] = "?";
    }
    (makeDeck()).forEach(fun);
}


dEALER = "H";

// return other player
function togglePlayer( plyr ){
    "use strict";
    var res;
    if ( plyr === "H" ) {
	res = "C";
    } else {
	res = "H";
    }
    return res;
}



// add game score to score total 
function addScore( plyr, scr ){
    "use strict";
    var oplyr, winner, loser, txt;
    oplyr = togglePlayer(plyr);
    winner = ( scr > 0 ) ? plyr : oplyr;
    loser = togglePlayer(winner);
    sCORE[winner][0] += Math.abs( scr );
    sCORE[winner][1] += 1;
    
    if ( sCORE[winner][0] >= 150 ) {
	txt = ( winner === "H" ) ? "Human" : "Java Script";
	txt += " wins the game!";
	dispMsg(txt);
	sCORE[winner] = [ 0, 0, sCORE[winner][2] + 150 +  25 * ( sCORE[winner][1] - sCORE[loser][1] ) + (  sCORE[winner][0] - sCORE[loser][0] ) ];
	sCORE[loser] = [ 0, 0, sCORE[loser][2] ];
    }
}

// convert one player's score to text
function scoreToTxt( scr ){
    "use strict";
    var hd, gm, mt;
    hd = scr[0];
    gm = scr[1];
    mt = scr[2];
    return String(hd) + "     " + String(gm) + "     " + String(mt);
}

// update score display 
function updateScoreDisp(  ){
    "use strict";
    var txt;
    txt = "           Human: " + scoreToTxt(sCORE.H) + "\n     Java Script: " + scoreToTxt(sCORE.C);
    setDiv( "divScore", txt);
}




// Math

// from a list of cards, if there are at least 3 return them,
// o.w. return empty set
function getSet( crdlst ){
    "use strict";
    return ( crdlst.length >= 3 ) ? crdlst : [];
}

// check that a list of cards are all of the same rank
function predSet( crds ){
    "use strict";
    var rnk;
    rnk = getRank( crds[0] );
    function chck (c) { return getRank( c ) === rnk; }
    return crds.every( chck );
}


// check that a list of cards are all of the same suit
function predStraight( crds ){
    "use strict";
    var st;
    st = getSuit( crds[0] );
    function chck (c) { return getSuit( c ) === st; }
    return crds.every( chck );
}

// nmls = ordered list of numbers
// n = current candidate
// result = length of straight in nmls starting at n 
function countStraightHere( nmls, n ){
    "use strict";
    return ( nmls.has( n ) ) ? 1 + countStraightHere( nmls, n + 1 ) : 0;
}

// joins lists of runs of consecutive numbers
function consecJoin( lst1, lst2 ){
    "use strict";
    if ( lst1.length === 0 || lst2.length === 0 ) {
	return lst1.concat( lst2 );
    }
    var hd1, tl1, hd2, tl2, res;
    tl1 = lst1.last();
    hd1 = lst1.dropLastC( 1 );
    hd2 = lst2[0];
    tl2 = lst2.removeC( 0 );
    if ( tl1.last() + 1 === hd2[0] ) {
	res = hd1.concat( [ tl1.concat( hd2 ) ], tl2 );
	return res;
    } else {
	res = lst1.concat( lst2 );
	return res;
    }
}

//  returns a list of the runs of consecutive integers in ordlst
function findConsec( ordlst ){
    "use strict";
    var hd, tl, len, cut;
    if ( ordlst.length === 1 ) {
	return [ ordlst ];
    } else {
	if (  ordlst.length === 0 ) {
	    return [];
	}
    }
    hd = ordlst[0];
    tl = ordlst.last();
    len = ordlst.length;
    if ( tl - hd === len -1 ) {
	return [ ordlst];
    } else {
	cut = Math.floor( len / 2 );
	return consecJoin( findConsec( ordlst.slice( 0, cut )), findConsec( ordlst.slice( cut )));
    }
}

// nmls = list of numbers
// result = list of straights in nmls 
function getSequences( nmls ){
    "use strict";
    var consecs;
    nmls.sort( compareNumbers );
    consecs = findConsec( nmls );
    function lng( l ){ return ( l.length >= 3 ); }
    return consecs.filter( lng );
}

// make card of rank r and suit s 
function makeCard( r, s ){
    "use strict";
    return [ r, s ];
}

// given list of cards in single suit, 
// return list of straights (as list of lists of crds) 
function getStraights( stls ){
    "use strict";
    if ( stls.length < 3 ) { return []; }
    var rnks, seqs, st, res;
    st = getSuit( stls[0] );
    rnks = stls.map( getRank );
    seqs = getSequences( rnks );
    function fnc( r ) { return makeCard( r, st ); }
    return seqs.map2( fnc );
}


var meldsProto = { sets: [], strts: [] };

meldsProto.getMelds = function(){
    "use strict";
    return this.sets.concat( this.strts );
};

meldsProto.getMeldCrds = function(){
    "use strict";
    var mlds = this.getMelds();
    return mlds.union();
};

// create new melds object 
function newMelds( sets, strts ){
    "use strict";
    var res = Object.create( meldsProto );
    if ( !strts ){
	sets = [];
	strts = [];
    }
    res.sets = sets;
    res.strts = strts;
    return res;
}

// get all sets in a hand 
function getAllSets( hnd ){
    "use strict";
    var rnks, i;
    rnks = [];
    for ( i = 0; i < 13; i += 1 ) {
	rnks.push( getSet( hnd.filter( makeValCheck( getRank, i ))));
    }
    return rnks.filter( function ( l ) { return l.length !== 0; });
}

// get all straights in hand 
function getAllStraights( hnd ){
    "use strict";
    var sts, i;
    sts = [];
    for ( i = 0; i < 4; i += 1 ) {
	sts.push( getStraights( hnd.filter( makeValCheck( getSuit, i ))));
    }
    return flatten1( sts );
}



var ambigResolver = { "setCards": [], "strtCards": [] };


ambigResolver.addToSetC = function( crd ){
    "use strict";
    var newamb;
    newamb = this.clone();
    if ( !newamb.setCards.has( crd ) ) {
	newamb.setCards.push( crd );
    }
    return newamb;
};

ambigResolver.addToStrtC = function( crd ){
    "use strict";
    var newamb;
    newamb = this.clone();
    if ( !newamb.strtCards.has( crd ) ) {
	newamb.strtCards.push( crd );
    }
    return newamb;
};

ambigResolver.getAll = function(){
    "use strict";
    return this.setCards.concat( this.strtCards );
};

ambigResolver.clone = function( ){
    "use strict";
    var newamb = Object.create( ambigResolver );
    newamb.setCards = this.setCards.clone();
    newamb.strtCards = this.strtCards.clone();
    return newamb;
};


// make new ambig resolver with given properties 
function newAmbigResolver( stcrds, strtcrds ){
    "use strict";
    if ( !strtcrds ) {
	strtcrds = [];
	stcrds = [];
    }
    var res;
    res = Object.create( ambigResolver );
    res.setCards = stcrds;
    res.strtCards = strtcrds;
    return res;
}




// find the ambiguous cards (set or straight?) in a hand 
// mlds are nonambiguous
// ambrslv is an ambigResolver object that resolves some ambiguities 
function findAmbig( hnd, ambrslv, mlds ){
    "use strict";
    if ( !mlds ) {
	mlds = newMelds( [], [] );
    }
    if ( !ambrslv ) {
	ambrslv = newAmbigResolver();
    }
    var mldcrds, strtmlds, setmlds, strts, sets, res, sethnd, strthnd;
    strthnd = hnd.filter( function( c ){ return !ambrslv.setCards.has( c ); });
    sethnd = hnd.filter( function( c ){ return !ambrslv.strtCards.has( c ); });
    mldcrds = mlds.sets.concat( mlds.strts );
    strtmlds = mlds.strts.union();
    setmlds = mlds.sets.union();
    strts = getAllStraights( strtmlds.concat( strthnd ) );
    strts = strts.union();
    sets = getAllSets( setmlds.concat( sethnd ) );
    sets = sets.union();
    res = sets.filter( function(c){ return strts.has(c); });
    res = res.filter( function(c){ return !mldcrds.has(c); });
    return res;
}

// sort hand with no ambiguous cards into melds
// optionally provide existing melds to build on
function sortHandSimple( hnd, ambrslv, mlds ){
    "use strict";
    if ( !mlds ) {
	mlds = Object.create( meldsProto );
    }
    if ( !ambrslv ) {
	ambrslv = newAmbigResolver();
    }
    var sets, strts, lftvr, fltsets, fltstrts, lftset, lftstrt;
    lftvr = hnd;
    lftstrt = lftvr.filter( function( c ){ return !ambrslv.setCards.has( c ); });
    lftset = lftvr.filter( function( c ){ return !ambrslv.strtCards.has( c ); });
    sets = getAllSets( lftset.concat( flatten1( mlds.sets ) ) );
    fltsets = flatten1( sets );
    lftvr = lftvr.filter( function ( crd ) { return !fltsets.has( crd ); });
    strts = getAllStraights( lftstrt.concat( flatten1( mlds.strts ) ) );
    fltstrts = flatten1( strts );
    lftvr = lftvr.filter( function ( crd ) { return !fltstrts.has( crd ); });
    return [ lftvr, newMelds( sets, strts ) ];
}

// sort gin hand given resolver ambrslv,
// melds mlds 
function sortHand( hnd, ambrslv, mlds ){
    "use strict";
    if ( !mlds ) {
	mlds = Object.create( meldsProto );
    }
    if ( !ambrslv ) {
	ambrslv = newAmbigResolver();
    }
    var ambigs, amb1, ambrslvset, ambrslvstrt, srtset, srtstrt, res;
    ambigs = findAmbig( hnd, ambrslv, mlds );
    if ( ambigs.length === 0 ) {
	return sortHandSimple( hnd, ambrslv, mlds );
    }
    amb1 = ambigs.pop();
    ambrslvset = ambrslv.addToSetC( amb1 );
    ambrslvstrt = ambrslv.addToStrtC( amb1 );
    srtset = sortHand( hnd, ambrslvset, mlds );
    srtstrt = sortHand( hnd, ambrslvstrt, mlds );
    res = ( points( srtset[0] )[1] <  points( srtstrt[0] )[1] ) ? srtset : srtstrt;
    return res;
}

// check if cards are straight-adjacent 
function connStr1Q( crd1, crd2 ){
    "use strict";
    return getSuit( crd1 ) === getSuit( crd2 ) && Math.abs( getRank( crd1 ) - getRank( crd2 ) ) === 1;
}
// check if cards are at least 2-straight-adjacent 
function connStr2Q( crd1, crd2 ){
    "use strict";
    return getSuit( crd1 ) === getSuit( crd2 ) && Math.abs( getRank( crd1 ) - getRank( crd2 ) ) <= 2;
}
// check if cards are set-adjacent 
function connSetQ( crd1, crd2 ){
    "use strict";
    return getRank( crd1 ) === getRank( crd2 );
}
// check if cards are at least diagonally-adjacent 
function connSetQ( crd1, crd2 ){
    "use strict";
    return Math.abs( getRank( crd1 ) - getRank( crd2 ) ) === 1;
}

// separate a grp of cards by rank in a list 
function sepRanks( lst ){
    "use strict";
    var i, res;
    res = [];
    function chkrnk( r ){ 
	return function( c ){ return getRank( c ) === r; };
    }
    for ( i = 0; i < 13; i += 1 ){
	res.push( lst.filter( chkrnk( i ) ) );
    }
    return res;
}

// join adjacent nonempty elements 
function joinAdj( lst ){
    "use strict";
    var i, res, cur;
    res = [];
    cur = [];
    for ( i = 0; i < 13; i += 1 ){
	if ( lst[i].length !== 0 ) {
	    cur = cur.concat( lst[i] );
	} else {
	    if ( cur.length > 0 ){
		res.push( cur );
		cur = [];
	    }
	}
    }
    if ( cur.length > 0 ) {
	res.push( cur );
    }
    return res;
}

// join adjacent nonempty elements if related by connStr2Q
function joinAdjStr2( lst ){
    "use strict";
    var i, res, cur, nxt;
    res = [];
    cur = lst.pop();
    while ( lst.length > 0 ){
	nxt = lst.pop();
	if ( cur.connected( nxt, connStr2Q ) ) {
	    cur = cur.concat( nxt );
	} else {
	    res.push( cur );
	    cur = nxt;
	}
    }
    res.push( cur );
    return res;
}

// get all connected subgroups
function getGrps( hnd ){
    "use strict";
    return joinAdjStr2( joinAdj( sepRanks( hnd ) ) );
}

// return location of card 
function locFunc( crd ){
    "use strict";
    return lOCATION[ crd ];
}

// fraction of uncertain cards opponent has 
function probOpp(  ){
    "use strict";
    var dck, n1, n2;
    dck = makeDeck();
    n1 = dck.count( makeValCheck( locFunc, "?" ) );
    n2 = dck.count( makeValCheck( locFunc, "H" ) );
    return ( 10 - n2 ) / n1;
}

// prob 3 cards in a rank form a pair given probs a, b, c that each is present
function probPairs( a, b, c ){
    "use strict";
    return a*b + a*c + b*c - 2*a*b*c; 
}
// prob 4 cards in a straight form a pair 
// given probs a, b, c, d that each is present
function probConsec( a, b, c, d ){
    "use strict";
    //       a*b*c*d?
    return a*b + b*c + c*d - a*b*c - b*c*d; 
}

// prob opponent has card 
function probCardOpp( crd ){
    "use strict";
    var prb = probOpp();
    // if ( getRank( crd ) < 0 ) {
    // return 0;
    // }
    switch ( lOCATION[ crd ] ){
    case "H":
	return 1;
    case "?":
	return prb;
    default:
	return 0;
    }
}

// make list of all cards in given rank 
function makeRank( rnk ){
    "use strict";
    var i, lst;
    lst = [];
    for ( i = 0; i < 4; i += 1 ){
	lst.push( [ rnk, i ] );
    }
    return lst;
}

// return connSetQ neighbors of card 
function nbrsSet( crd ){
    "use strict";
    var res, st;
    st = getSuit( crd );
    res = makeRank( getRank( crd ) );
    return res.filter( function ( c ){ return st !== getSuit( c ); } );
}

//  return prob that opponent will be able to add card to set
function probSetOpp( crd ){
    "use strict";
    var nbrs, prbs;
    nbrs = nbrsSet( crd );
    prbs = nbrs.map( probCardOpp );
    return probPairs.apply( null, prbs );
}

//  return connStr2Q neighbors of card 
function nbrsConsec( crd ){
    "use strict";
    var rnk, st, i, lst;
    rnk = getRank( crd );
    st = getSuit( crd );
    lst = [];
    for ( i = rnk - 2; i <= rnk + 2; i += 1 ){
	lst.push( [ i, st ] );
    }
    lst.removeAll( crd );
    return lst;
}


//  return prob that opponent will be able to add card to straight
function probConsecOpp( crd ){
    "use strict";
    var nbrs, prbs;
    nbrs = nbrsConsec( crd );
    prbs = nbrs.map( probCardOpp );
    return probConsec.apply( null, prbs );
}


var cONeX = 1,
cONnOW = 1 - cONeX,
cONdIS = [ 0, 4, 0, 0 ],
cONoPPdIS = 0,
cONoPPmELD = 1.5,
cONkCK = 3.2,
cONoPPvAL = 1,
cONoPPgIN = 1.5,
cONdEV = 0.4,
cONcRDpT = 0.15,
cONkNCKrAT = [ 1, 0.25, 0, 0 ],
continuePlay = true;

//  calculate knock threshold (hand points) from stacksize
function knockThresh( num ){
    "use strict";
    var a, b, c, d, e, f, s;
    a = 0;
    b = 1;
    c = 11;
    d = 1;
    e = 0.2192938183803851;
    f = 16.5;
    s = Math.exp( e * ( num - f ) );
    return ( a + c * s ) / ( b + d * s );
}


// prob opponent will use card
function probUseOpp( crd ){
    "use strict";
    var p, q;
    p = probSetOpp( crd );
    q = probConsecOpp( crd );
    return p + q - p*q;
}


// adjust values: (p, [x,y]) -> [px+( 1-p)cONcRDpT(10-y/cONoPPmELD), py]
function valOppAdjust( p, val ){
    "use strict";
    var x, y;
    x = val[0];
    y = val[1];
    return [ p*x + ( 1 - p )*cONcRDpT*( 10 - ( y / cONoPPmELD ) ), p*y ];
}

// value of card to opponent 
function valOpp( crd ){
    "use strict";
    var subval, val;
    if ( dISCARDbY[ crd ] === "H" || !continuePlay ) {
	return [ 0, 0 ];
    }
    subval = points( [ crd ] ).scalarMult( cONoPPmELD );
    if ( subval[1] < cONoPPgIN * knockThresh( sTACKsIZE ) ) {
	val = cONoPPdIS+subval;
    } else {
	val = [ 3, 15 ];
    }
    return valOppAdjust( probUseOpp( crd ), val );
}

// return list of cards whose location is unknown according to lookup loc
function unknowns( loc ){
    "use strict";
    return (makeDeck()).filter( function( c ){ return loc[ c ] === "?"; } );
}

// return connSetQ and connStr1Q neighbors of grp 
function nbrsClose( grp, posscrds ){
    "use strict";
    if ( !posscrds ) {
	posscrds = unknowns( lOCATION );
    }
    function close( c1, c2 ){ return connSetQ( c1, c2 ) || connStr1Q( c1, c2 ); }
    function connQ( c ){ return grp.connected( [ c ], close ); }
    return posscrds.filter( connQ );
}

// point value of group 
function pointsOfGrp( v1, v2 ){
    "use strict";
    var cds, pts, totcds, totpts;
    cds = v1[0];
    pts = v1[1];
    totcds = v2[0];
    totpts = v2[1];
    return [ cds - totcds, pts - totpts ];
}

// points of hand after melding in presence of mlds 
function pointsOfHand( hnd, mlds ){
    "use strict";
    if ( !mlds ){
	mlds = newMelds();
    }
    return points( sortHand( hnd, newAmbigResolver() , mlds )[0] );
}

function valCardGrp( crdgrp ){
    "use strict";
    return pointsOfGrp( pointsOfHand( crdgrp ), points( crdgrp ) );
}

// value of a card to given group 
function valCardToGrp( crd, grp ){
    "use strict";
    var crdgrp = grp.concat( [ crd ] );
    return valCardGrp( crdgrp );
}

// add list of 2 vectors 
function vplus( lst, dflt ){
    "use strict";
    if ( !dflt ){
	dflt = [ 0, 0 ];
    }
    function redfun( v1, v2 ){ return v1.vectorAdd( v2 ); }
    return lst.reduce( redfun, dflt );
}

// put vals in convenient order 
function makeValVect( pos, cur ){
    "use strict";
    return [ cur[0], pos[0], cur[1], pos[1] ];
}

// value of group 
function valGrp( grp ){
    "use strict";
    var cmp, vals, grpvals, nbrs;
    cmp = valCardGrp( grp ).scalarMult( -1 );
    nbrs = nbrsClose( grp );
    grpvals = nbrs.map( function( c ){ 
	return valCardToGrp( c, grp ).vectorAdd( cmp ); 
    } );
    vals = vplus( grpvals, [ 0, 0, 0, 0 ] ).scalarMult( 1/3 );
    return makeValVect( vals, pointsOfHand( grp ) );
}

// ,athe,atical tweak to values 
function valHandFun( lst ){
    "use strict";
    var c, k, p, pp;
    c = lst[0];
    k = lst[1];
    p = lst[2];
    pp = lst[3];
    return [ c, Math.sign( k ) * Math.sqrt( Math.abs( k ) ) + cONcRDpT * p, p, pp ];
}

// hand value based on groups 
function valHandByGrp( hnd ){
    "use strict";
    var preval, grps, grpvals;
    grps = getGrps( hnd );
    grpvals = grps.map( valGrp );
    preval = vplus( grpvals, [ 0, 0, 0, 0 ] );
    return valHandFun( preval );
}

// value of potential discard from hand 
function valDiscardTotByGrp( hnd, crd ){
    "use strict";
    var hndaft, res;
    hndaft = hnd.removeAllC( crd );
    res = valHandByGrp( hndaft ).vectorAdd( makeValVect( valOpp( crd ).scalarMult( cONoPPvAL ), [ 0, 0 ] ) );
    return res;
}


// choose discard from given hand according to valfnc
function chooseDiscardWRT( hnd, valfnc ){
    "use strict";
    var choices, min;
    function mapfnc( crd ) {
	return [ hnd.removeAllC( crd ), crd ];
    }
    function valmapfnc( chc ){
	return [ valfnc.apply( null, chc ), chc[1] ];
    }
    choices = hnd.map( mapfnc );
    choices = choices.map( valmapfnc );
    return best( choices );
}

function chooseDiscard( hnd ){
    "use strict";
    return chooseDiscardWRT( hnd, valDiscardTotByGrp );
}

//  choosediscard based solely on points
function chooseDiscardMin( hnd ){
    "use strict";
    var res, pnts;
    function valfnc( h, c ){
	pnts = pointsOfHand( h );
	pnts.reverse();
	return pnts;
    }
    res = chooseDiscardWRT( hnd, valfnc );
    res[0].reverse();
    return res;
}



// procedure when C draws a card from the stack 
function turnCompDraw(  ){
    "use strict";
    var chc1, chc2, valcur, dschnd, chc, mld;
    if ( dECK.length > 2 ){
	if ( dealOneTo( "C" ) ) {
	    dispMsg( "Drawing a card..." );
	    continuePlay = true;
	    chc1 = chooseDiscard( hAND.C );
	    continuePlay = false;
	    chc2 = chooseDiscardMin( hAND.C );
	    dschnd = hAND.C.removeAllC( chc1[ 1 ] );
	    valcur = valHandByGrp( dschnd );
	    continuePlay = ( chc2[0][1] >= knockThresh( sTACKsIZE ) ) || ( valcur[0] > 0 && valcur.dot( cONkNCKrAT ) <= 0 );
	    chc = continuePlay ? chc1 : chc2;
	    takeBase( "C", chc[1] );
	    mld = sortHand( hAND.C )[1];
	    updateDisplay();
	    return [ mld, chc[0] ];
	}
    }
}

// compute score after a knock
function score( knck, mldob, hnd ){
    "use strict";
    var kpnts, hpnts;
    kpnts = points( knck )[1];
    hpnts = pointsOfHand( hnd, mldob )[1];
    if ( kpnts <= 0 ){
	if ( hpnts <= 0 ) {
	    return 25;
	} else {
	    return hpnts - kpnts + 25;
	} 
    } else if ( kpnts < hpnts ){
	return hpnts - kpnts;
    } else {
	return hpnts - kpnts - 25;
    }
}


// procedure when human knocks after discarding crd 
function humanKnocks( crd ){
    "use strict";
    var mlds, scr;
    mlds = sortHand( hAND.H.removeAllC( crd ) );
    if ( hAND.H.length === 11 && points( mlds[0] )[1] <= 10 && gameOn === true ) {
	takeBase( "H", crd );
	scr = score( mlds[0], mlds[1], hAND.C );
	dispMsg( "Human knocks" );
	dispMsg( "Score: " + String( scr ) );
	addScore( "H", scr );
	printScore();
	gameOn = false;
	return true;
    } else {
	return false;
    }
}








// human picks up card from discard pile 
function pickupFun(  ){
    "use strict";
    if ( hAND.H.length === 10 && gameOn === true ){
	pickUpDiscard( "H" );
    }
    updateDisplay();
}

function makeSuitRow(st, idpre) {
    "use strict";
    var i, res = "", crdtxt, fnc, mkfnc;
    mkfnc = function( r, s ){ 
	return function( ) {
	    buttonFun( r, s );
	};
    };
    for (i=0;i<13;i++) {
	crdtxt = idpre + String(i) + "_" + String(st);
	res += makeTag("td", makeButton("", crdtxt, mkfnc( i, st ), 60, 80, 24));
    }
    return res;
}


function makeSuitRowsAll(idpre) {
    "use strict";
    var i, res = "";
    for (i=0;i<4;i++) {
	res += makeTag("tr",makeSuitRow( i, idpre ));
    }
    return res;
}

function makeCardTable (idpre) {
    "use strict";
    var colsty, tableTxt; 
    colsty =   "<colgroup><col span='13' style='background-color:green' width='7.5%' /></colgroup>";
    tableTxt = makeTag("table", colsty + makeSuitRowsAll(idpre));
    //document.write(tableTxt);
    return tableTxt;
}

var showHandC = false;

// display location of every card in deck 
function showDeck( ev ){
    "use strict";
    if ( ev === true ) {
	showHandC = true; 
    } else if ( ev === false ){
	showHandC = false; 
    } else {
	showHandC = !showHandC; 
    }
    function fun ( crd ){
	setCardDisp(crd, "C");
    }
    if ( showHandC || ev === true ) {
	var dck = makeDeck();
	setDiv("divShowOpp",  "<br><br>" + makeCardTable("C_") + "<br><br>");
	// set button vals to location 
	dck.forEach(fun);
    } else {
	setDiv("divShowOpp","");
    }
}

// computer checks if it wants the discard 
function turnCompCheckDiscard(  ){
    "use strict";
    var dscd, newhnd, cmpval, chc1, chc2, chc, mld, ifpass;
    dscd = dISCARD.last();
    newhnd = hAND.C.concat( [ dscd ] );
    cmpval = valHandByGrp( hAND.C );
    continuePlay = true;
    chc1 = chooseDiscard( newhnd );
    continuePlay = false;
    chc2 = chooseDiscardMin( newhnd );
    continuePlay = ( chc2[0][1] >= knockThresh( sTACKsIZE ) ) || ( cmpval[0] > 0 && cmpval.dot( cONkNCKrAT ) <= 0 );
    ifpass = ( pASS <= 0 ) ? chc1[0].vectorAdd( cONdIS ) :  chc1[0];
    if ( !continuePlay || lexicalListOrder( ifpass, cmpval ) ){
	dispMsg( "Picking up discard" );
	pickUpDiscard( "C" );
	chc = continuePlay ? chc1 : chc2;
	takeBase( "C", chc[1] );
	updateDisplay( dscd );
	mld = sortHand( hAND.C )[1];
	return [ true, mld, chc[0] ];
    } else {
	return [ false, [] ];
    }
}

// end computer's turn 
function turnCompEnd( mlds, val  ){
    "use strict";
    var scr;
    if ( !continuePlay ){
	dispMsg( "Computer knocks" );
	scr = score( hAND.C.removeAllOfListC( mlds.getMeldCrds() ), mlds, hAND.H );
	dispMsg( "Score: " + String( scr ) );
	addScore( "C", scr );
	printScore();
	gameOn = false;
	// debugging:
	showDeck( true );
    } else {
	// debugging:
	showDeck( showHandC );

	dispMsg( "Your Turn" );
    }
}

// procedure for computer's turn 
function turnComp(  ){
    "use strict";
    var res, mlds, val, drwres;
    dispMsg( "thinking..." );
    res = turnCompCheckDiscard();
    mlds = res[1];
    val = res[2];
    if ( res[0] ) {
	pASS = 0;
    } else if ( pASS <= 0 ){
	drwres = turnCompDraw();
	mlds = drwres[0];
	val = drwres[1];
    } else {
	pASS -= 1;
	dispMsg( "Computer passes" );
    }
    turnCompEnd( mlds, val );
}

// human discards cARDcHOICE
function discardFun(  ){
    "use strict";
    if ( hAND.H.length === 11 && hAND.H.has( cARDcHOICE ) && gameOn === true ){
	takeBase( "H", cARDcHOICE );
	updateDisplay();
	turnComp();
    }
}

// set cARDcHOICE to selected card 
function buttonFun( r, s ){
    "use strict";
    var crd = [ r, s ];
    if ( crd.equal( dISCARD.last() ) ){
	pickupFun();
    } else if ( cARDcHOICE.equal( crd ) ){
	discardFun();
    } else {
	cARDcHOICE = crd;
	updateDisplay();
    }
}



//  start new hand, initialize variables
function startHand( args ){
    "use strict";
    var drw;
    showDeck( false );
    hAND.H = [];
    hAND.C = [];
    dECK = makeDeck();
    initLoc();
    dealMTo("H",10);
    dealMTo("C",10);
    //initDiscard();
    initDiscardBy();
    sTACKsIZE = dECK.length;
    dEALER = togglePlayer(dEALER);
    pASS = 2;

    drw = drawOne(dECK);
    dECK = drw[1];
    drw = drw[0];
    dISCARD = [[-1,-1],drw];
    lOCATION[drw] = "D";
    sTACKsIZE -= 1;

    cARDcHOICE = dISCARD.last();
    updateDisplay();
    gameOn = true;
    if ( dEALER === "H" ) {
	dispMsg("Human Deals");
	turnComp();
    } else {
	dispMsg("Java Script Deals");
    }	
}


function passFun () {
    "use strict";
    if ( gameOn && hAND.H.length === 10 ){
	if ( pASS > 0 ){
	    pASS -= 1;
	    turnComp();
	} else {
	    dealOneTo( "H" );
	    dispMsg( "Human draws a card..." );
	    updateDisplay();
	}
    }
}
function knockFun () {
    "use strict";
    var ok = humanKnocks( cARDcHOICE );
    if ( ok ){
	updateDisplay();
	showDeck( true );
    }
}

function newFun () {
    "use strict";
    var ok;
    if ( gameOn ) {
	ok = window.confirm( "Sure you want to start a new hand?" );
	if ( !ok ){ return; }
    }
    startHand();
}

getLSScore();

var scoreTitle = makeButton("Score:","scoreBut", scoreReset, 80, 40, 16,"Red");

var tbl = "<br>" + makeCardTable("H_") + "<br>";

function initTable(){
    "use strict";
    setDiv( "scoreButDiv", scoreTitle );
    setDiv( "divTable", tbl );
    printScore();
}
setTimeout(initTable,100);


var htmltxt = '';
htmltxt += '<div style="vertical-align:left;margin-left:13%;float:left">Discard:</div>';
htmltxt += '<div style="vertical-align:left;margin-left:30%;float:left"> </div>';
htmltxt += '<div style="vertical-align:left;margin-left:50%;">Pick up:</div>';

htmltxt += '<div style="vertical-align:left;margin-left:13%;clear:left;float:left">' +makeButton("","discardBut",discardFun,"60","80","24") + '</div>';

htmltxt += '<div style="vertical-align:left;margin-left:12%;float:left">' + makeButton("Draw/Pass","passBut",passFun,"120","80","20", "White") + '</div>';

htmltxt += '<div style="vertical-align:left;margin-left:50%;">' + makeButton("","pickupBut",pickupFun,"60","80","24") + '</div>';

htmltxt += repeatTxt("<br>",1);

htmltxt += '<div style="vertical-align:left;margin-left:5%;clear:left;float:left">' + makeButton("Knock","knockBut",knockFun,"80","80","20","Silver" ) + '</div>';
htmltxt += repeatTxt("&nbsp;",36);
htmltxt += '<div style="vertical-align:left;margin-left:7%;float:left">' + makeButton("New Hand","newBut",newFun,"120","80","20", "Silver" ) + '</div>';
htmltxt += repeatTxt("&nbsp;",64);
htmltxt += '<div style="vertical-align:left;margin-left:12%;float:left;margin-top:0em">' + makeButton("Reveal\nHidden","revealBut",showDeck,"120","80","20","DarkGreen" ) + '</div>';

var infoText = "The card in light gray is at the top of the discard pile; the card in dark gray was picked up by the computer.  To pick up a card click it either in the table or the \"Pick up\" button below.  To discard first select a card it by clicking it in the table, then discard it by either clicking it again in the table or the \"Discard\" button below. To knock, first select your discard then click the \"Knock\" button.  \"Reveal Hidden\" shows you the computer's hand; clicking on \"Score\" resets the scores to 0.  Games are to 150 points, each hand is worth 25 points.";

// show game instructions 
function infoFun(  ){
    "use strict";
    window.alert( infoText );
}

htmltxt += '<div style="vertical-align:left;margin-left:7%;float:left;margin-top:0em">' + makeButton( "Instructions", "infoBut", infoFun, "130", "80", "20", "DarkGreen" ) + '</div>';

//htmltxt += "</font>";

function initCntrls(){
    "use strict";
    setDiv( "divCtrls", htmltxt );
}
setTimeout(initCntrls,100);



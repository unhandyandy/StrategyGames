//-*-mode: Javascript; -*-

/*jslint browser: true, devel: true */

function repeatTxt (txt,n) {
    "use strict";
    var res = "", i;
    for (i=0;i<n;i++) {
	res += txt;
    }
    return res;
}

function brN (n) {
    "use strict";
    return repeatTxt("<br>",n);
}

function nbspN (n) {
    "use strict";
    return repeatTxt("&nbsp;",n);
}

function setDiv (divid,cntnt) {
    "use strict";
    document.getElementById(divid).innerHTML = cntnt;
}
function getDiv (divid) {
    "use strict";
    return document.getElementById(divid).innerHTML;
}

// set option opt of tag with ID id to value val
function setTagOpt( id, opt, val ){
    "use strict";
    var el = document.getElementById(id);
    el[opt] = val;
}

// set style option opt of tag with ID id to value val
function setTagSty( id, opt, val ){
    "use strict";
    var el = document.getElementById(id);
    el.style[opt] = val;
}

Function.prototype.method = function (name, func) {
    "use strict";
    this.prototype[name] = func;
    return this;
};




function makeTag (tag,txt,opts) {
    "use strict";
    if (!opts) {
	opts = "";
    }
    return "<"+tag+" "+opts+">" + txt + "</"+tag+">";
}

function randomElem(ar){
	"use strict";
    var len = ar.length,
        ind = Math.floor(Math.random()*len);
    return ar[ind];
}


smallSet = {
    bin: 0,
    add: function (n) {
	"use strict";
	this.bin |= 1<<n; },
    addAll: function ( lst ){
	"use strict";
	var that = this;
	lst.forEach( function(x){ that.add(x); } );
    },
    remove: function (n) {
	"use strict";
      this.bin -= this.bin & 1<<n; },
    union: function (ss) {
	"use strict";
	var res;
	if ( ss === undefined ){
	    ss = smallSet.spawn([]);
	}
	res = Object.create( smallSet );
	res.bin = this.bin | ss.bin;
      return res; },
    has: function (n) {
	"use strict";
	var bit = 1<<n, 
	    res = (this.bin & bit) > 0;
      return res; },
    inter: function (ss) {
	"use strict";
	var res;
	res = smallSet.spawn([]);
	res.bin = this.bin & ss.bin;
      return res; },
    minus: function (ss) {
	"use strict";
	var res;
	res = smallSet.spawn([]);
	res.bin = this.bin - (this.bin & ss.bin);
      return res; },
    subset: function (ss) {
	"use strict";
     return ss.bin === (ss.bin | this.bin); },
    superset: function (ss) {
	"use strict";
      return ss.subset(this); },
    equal: function (ss) {
	"use strict";
      return this.bin === ss.bin; },
    complement: function () {
	"use strict";
	var res = smallSet.spawn([]);
	res.bin = ~ this.bin;
      return res; },
    spawn: function (lst) {
	"use strict";
	var res = smallSet.clone();
	res.bin = 0;
	lst.forEach(function(x){ res.add(x); });
	return res;
    },
    emptyQ: function() {
	"use strict";
      return this.bin === 0; },
    clone: function() {
	"use strict";
	var res = Object.create( smallSet );
	res.bin = this.bin;
      return res; },
  size: function(){
	"use strict";
    var res = 0, i;
    //console.debug("this.bin = %s",this.bin);
    for(i=0;i<31;i++){
    //console.debug((this.bin & (1<<i)) > 0);
      if((this.bin & (1<<i)) > 0){res++;}
    }
    return res;
  },
    toList: function(){
	"use strict";
	var res = [], i;
	for(i=0;i<30;i++){
	    if(this.has(i)){
		res.push(i);
	    }
	}
	return res;
    },
    randomElem: function(){
	"use strict";
	var lst = this.toList();
	return randomElem(lst);
    }
};


// var testset1 = new smallSet()

// testset1.add(5)
// testset1.add(10)

// var testset2 = new smallSet()

// testset2.add(5)
// testset2.add(15)

function logicalOr(a,b){
	"use strict";
  return a || b;
}

function cloneList(lst){
	"use strict";
  var res = [],
      len = lst.length, i;
  for( i=0;i<len;i++ ){
    res[i] = lst[i].clone();
  }
  return res;
}


Array.prototype.clone = function(){
	"use strict";
    var res = [],
        len = this.length, i, newobj;
    for(i=0;i<len;i++){
	if( this[i] && typeof(this[i])==='object'){
	    newobj = this[i].clone();
	}
	else{
	    newobj = this[i];
	}
	res[i] = newobj;
    }
    return res;
};



function matrixTranspose(mat){
	"use strict";
    var nr = mat.length,
        nc = mat[0].length,
        res = [],
        i, fun1, fun2;
    for( i=0;i<nc;i++ ){
	res[i] = [];
    }
    fun1 = function(x,i){
	res[i].push(x);
    };
    fun2 = function(r){
	r.forEach(fun1);
    };
    mat.forEach(fun2);
    return res;
}

function flatten1(mat){
	"use strict";
    return mat.reduce(function(a,b){
			     return a.concat(b);
			 },[]);
}

function cartesianProd(l1,l2){
	"use strict";
    var res = [],
        fun = function(e1){
	return function(e2){
	    return [e1,e2];
	};
    };
    res = l1.map(function(e1){
		      return l2.map(fun(e1));
		 });
    return flatten1(res);
}

Array.prototype.equal = function(arr){
    "use strict";
    var arrlen;
    try{
	arrlen = arr.length;}
    catch (e){
	return false;}
    if(this.length !== arrlen){
	return false;
    }
    return this.every(function(e,i){
			  if(typeof(e) === "object"){
			      return e.equal(arr[i]);
			  }
			  else{
			      return e === arr[i];
			  }
		      });
};

everyLp = function( o, fun, that ){
    "use strict";
    if( that === undefined ){
	that = o;
    }
    var i, l = o.length, res = true;
    for ( i=0; i<l; i++ ){
	 if ( !fun.call( that, o[i], i ) ){
	     res = false;
	     break;}}
    return res;
};


equalLp = function(arr1,arr2){
    "use strict";
    var equalLpAux = function(e,i){
	var ai = arr2[i];
	return equalLp( e, ai );
    };
    if ( Array.isArray( arr1 ) ){
	if ( Array.isArray( arr2 ) ){
	    if( arr1.length !== arr2.length ){
		return false;
	    }
	    return everyLp( arr1, equalLpAux );}
	else {
	    return false;}}
    else {
	return arr1 === arr2;}
	
    };

String.prototype.equal = function(str){
	"use strict";
    return this === str;
};
Number.prototype.equal = function(x){
	"use strict";
    return this === x;
};
String.prototype.clone = function(){
	"use strict";
    return this.concat();
};

Array.prototype.has = function(elem){
	"use strict";
    return this.some(function(e){
			 return elem.equal(e);
		     });
};

Array.prototype.indexOfProp = function(pred){
	"use strict";
    var res = this.map(pred);
    return res.indexOf(true);
};


// remove all elements equal to elem from array 
Array.prototype.removeAll = function ( elem ){
    "use strict";
    // return true if e not equal to elem
    var newlst;
    function fun( e ){
	return !elem.equal(e);
    }
    newlst = this.filter( fun );
    this.length = 0;
    this.push.apply( this, newlst );
    return this;
};

Array.prototype.removeOne = function ( elem ) {
    "use strict";
    var hd;
    if ( this.length !== 0 ){
	hd = this.pop();
	if ( ! hd.equal( elem ) ){
	    this.removeOne( elem );
	    this.push( hd );}
    }};

Array.prototype.removeAllC = function ( elem ){
    "use strict";
    // return true if e equal to elem
    var cp = this.clone();
    cp.removeAll( elem );
    return cp;
};

Array.prototype.removeAllOfListC = function ( lst ){
    "use strict";
    // return true if e equal to elem
    var cp = this.clone();
    function eafnc( el ){
	cp.removeAll( el );
    }    
    lst.forEach( eafnc );
    return cp;
};



function lookUp(mat,loc){
    "use strict";
    return mat[loc[0]][loc[1]];
}

function lookUpSet(mat,loc,val){
    "use strict";
    mat[loc[0]][loc[1]] = val;
}

Array.prototype.vectorAdd = function(vct){
    "use strict";
    return this.map(function(x,i){
			return x + vct[i];
		    });
};

Array.prototype.vector2Add = function(vct){
     "use strict";
    return [ this[0] + vct[0], this[1] + vct[1] ];
};

Array.prototype.scalarMult = function(s){
    "use strict";
    return this.map(function(x){
			   return x*s;
		       });
};

Array.prototype.vectorMinus = function(vct){
    "use strict";
    return this.map(function(x,i){
			return x - vct[i];
		    });
};
Array.prototype.vector2Minus = function(vct){
     "use strict";
    return [ this[0] - vct[0], this[1] - vct[1] ];
};

Array.prototype.map2 = function(fun,o){
    "use strict";
    if(o===undefined){
	o = this;
    }
    var res = this.clone(),
        fun1 = function(lst){
	    return lst.map(fun,o);
	};
    return this.map(fun1,o);
};
mapLp = function( o, fun, that ){
    "use strict";
    if( that === undefined ){
	that = o;
    }
    var i, l = o.length, res = [];
    for ( i=0; i<l; i++ ){
	res.push( fun.call( that, o[i], i ) ); }
    return res;
};

Array.prototype.forEach2 = function(fun,o){
    "use strict";
    if(o===undefined){
	o = this;
    }
    var res = this.clone(),
        fun1 = function(lst){
	    lst.forEach(fun,o);
	};
    this.forEach(fun1,o);
};
eachLp = function( o, fun, that ){
    "use strict";
    if( that === undefined ){
	that = o;
    }
    var i, l=o.length;
    for ( i=0; i<l; i++ ){
	fun.call( that, o[i], i); }
};
Array.prototype.filter2 = function(fun,o){
    "use strict";
    if(o===undefined){
	o = this;
    }
    var res = this.clone(),
        fun1 = function(lst){
	return lst.filter(fun,o);
    };
    return this.map(fun1,o);
};

function numberSequence(start,finish,del){
    "use strict";
    if(del===undefined){
	del = (start<=finish) ? 1 : -1;
    }
    let res = [];
    let cur = start - del;
    do{
	cur += del;
	res.push(cur);
    }while(cur!=finish)
    return res;
}

Array.prototype.count = function(pred){
    "use strict";
    var res = this.filter(pred);
    return res.length;
};

function setMatEntry(mat,loc,val){
    "use strict";
    mat[loc[0]][loc[1]] = val;
}

function makeConstantArraySimp(num,len){
    "use strict";
    var res = [], i;
    for( i=0;i<len;i++ ){
	res.push(num);
    }
    return res;
}

function makeConstantArray(val,len){
    "use strict";
    var res = [], i;
    for( i=0;i<len;i++ ){
	res.push(val.clone());
    }
    return res;
}

Math.plus = function(x,y){
    "use strict";
    return x + y;
};
Math.minus = function(x,y){
    "use strict";
    return x - y;
};
Math.sign = function( x ){
    "use strict";
    if ( x > 0 ){
	return 1;
    } else if ( x < 0 ){
	return -1;
    } else {
	return 0;
    }
};


function fixedPoint(x0,fun){
    "use strict";
    var cur = x0,
        nxt = fun(cur);
    while(!cur.equal(nxt)){
	cur = nxt;
	nxt = fun(cur);	
    }
    return cur;
}

function repeat(x0,fun,n){
    "use strict";
    var cur = x0, i;
    for( i = 0;i<n;i++ ){
	cur = fun(cur);		
    }
    return cur;
}

// function extend(child, supertype){  
//     child.prototype.__proto__ = supertype.prototype;  
// };

function cartesianProduct (a1,a2) {
    "use strict";
    var resProduct = [];
    function fn1 (a,b) {
	resProduct.push([a,b]);
    }
    function fn2 (ar,b) {
	ar.forEach(function(x){fn1(x,b);});
    }
    a2.forEach(function(x){fn2(a1,x);});
    return resProduct;
}


// Array Remove - By John Resig (MIT Licensed)
Array.prototype.remove = function(from, to) {
    "use strict";
    var rest = this.slice((to || from) + 1 || this.length);
    this.length = from < 0 ? this.length + from : from;
    this.push.apply(this, rest);
    return this;
};
Array.prototype.removeC = function(from, to) {
    "use strict";
    var rest, res;
    rest = this.slice((to || from) + 1 || this.length);
    res = this.clone();
    res.length = from < 0 ? res.length + from : from;
    res.push.apply(res,rest);
    return res;
};


Array.prototype.last = function() {
    "use strict";
    return this[ this.length - 1 ];
};


Array.prototype.dropLastC = function( n ) {
    "use strict";
    return this.slice( 0, this.length - n );
};

function compareNumbers(a, b)
{
    "use strict";
  return a - b;
}

// if (typeof Object.create !== 'function') {
//     Object.create = function (o) {
//     "use strict";
//         function F() {}
//         F.prototype = o;
//         return new F();
//     };
// }
//newObject = Object.create(oldObject);

if (typeof Object.clone !== 'function') {
    Object.clone = function ( o ) {
    "use strict";
        return JSON.parse( JSON.stringify ( o ) );
    };
}

// returns a boolean function that checks whether fun is equal to cns 
function makeValCheck( fun, cns ){
    "use strict";
    return function (x) { return fun( x ) === cns; };
}

Array.prototype.union = function() {
    "use strict";
    var res = this.clone();
    if ( this.every( Array.isArray )) {
	return flatten1( res );
    } else {
	return res;
    }
};

Array.prototype.intersection = function( lst ) {
    "use strict";
    var res = this.clone();
    function common( el ){
	return lst.has( el );
    }
    return res.filter( common );
};

Array.prototype.meets = function( lst ){
    "use strict";
    return this.some(e => lst.has(e));
};

// converts list of strings to single string with space between each element 
Array.prototype.stringListToString = function ( ){
    "use strict";
    function cnct( s1, s2 ){
	return s1 + " " + s2;
    }
    return this.reduce( cnct, "" );
};

// lexicographical order on lists of numbers 
// right to left!
// Destructive!
function lexicalListOrderD( l1, l2 ){
    "use strict";
    var h1, h2, sub;
    if ( l1.length === 0 ){
	return true;
    }
    if ( l2.length === 0 ){
	return "equal";
    }
    h1 = l1.pop();
    h2 = l2.pop();
    if ( typeof( h1 ) === "number" && typeof( h2 ) === "number" ){
	if ( h1 < h2 ) {
	    return true;
	} else if ( h1 > h2 ) {
	    return false;
	} else{
	    return lexicalListOrderD( l1, l2 );
	}
    } else {
	h1.reverse();
	h2.reverse();
	sub = lexicalListOrderD( h1, h2 );
	if ( sub !== "equal" ){
	    return sub;
	} else {
	    return lexicalListOrderD( l1, l2 );
	}
    }
}

// lexicographical order on lists of numbers 
// left to right
// nondestructive
function lexicalListOrder( l1, l2 ){
    "use strict";
    var c1, c2;
    c1 = l1.clone();
    c2 = l2.clone();
    c1.reverse();
    c2.reverse();
    return lexicalListOrderD( c1, c2 );
}

// sort list of lists of numbers lexicographically 
function sortLists( lst ){
    "use strict";
    lst.sort( lexicalListOrder );
}

// destructive dot product 
function dotD( l1, l2 ){
    "use strict";
    if ( l1.length === 0 || l2.length === 0 ) {
	return 0;
    }
    var h1, h2;
    h1 = l1.pop();
    h2 = l2.pop();
    return h1 * h2 + dotD( l1, l2 );
}

Array.prototype.dot = function( lst ){
    "use strict";
    var c1, c2;
    c1 = this.clone();
    c2 = lst.clone();
    return dotD( c1, c2 );
};
Array.prototype.sum = function(){
    "use strict";
    return this.reduce((a,n)=>a+n);;
};


// return best item in lst according to preference func prf 
// cur = current best
function bestWRT( lst, prf, cur ){
    "use strict";
    if ( !cur ){
	cur = lst.pop();
    }
    var hd, nwcr;
    if ( lst.length === 0 ) {
	return cur;
    }
    hd = lst.pop();
    nwcr = ( prf( cur, hd ) ) ? cur : hd;
    return bestWRT( lst, prf, nwcr );
}

function best( lst ){
    "use strict";
    return bestWRT( lst, lexicalListOrder );
}

// sets function for onClick 
function setOnClick( id, fnc ){
    "use strict";
    document.querySelector( '#' + id ).addEventListener( 'click', fnc, false);
}

// set handler for button click 
function setClickHandler( id, fnc ){
    "use strict";
    document.addEventListener('DOMContentLoaded', function () {
	setTimeout( function(){
	    setOnClick( id, fnc);
	}, 
		    300 );
    }
			     );
}



// function makeButton (txt,idtxt,func,width,height,fsize,bgcolor,ffamily) {
//     "use strict";
//     if (!width) {
// 	width = "1*";
//     }
//     if (!height) {
// 	height = "1*";
//     }
//     if (!fsize) {
// 	fsize = "14";
//     }
//     if ( !bgcolor ) {
// 	bgcolor = "Chartreuse";
//     }    
//     if ( !ffamily ) {
// 	ffamily = "Georgia, Times New Roman, Comic Sans MS, Helvetica, Palatino";
//     }    
//     var stytxt = "style='margin-top:10px;' + 'width:" + width + ";font-family:" + ffamily + ";background-color:" + bgcolor + ";height:" + height + ";font-size:" + fsize + ";'";
//     setClickHandler( idtxt, func );
//     return "<input type='button' value='"+txt+"' "+stytxt+" id='"+idtxt+"'>";
//     //return "<button value='"+txt+"' "+stytxt+" id='"+idtxt+"'></button>";
// }

var buttonOpts = {
    "text": "Button", "idtext": "button", "width": "1*", "height": "1*", "fontSize": "14", "bgColor": "Chartreuse", "fontFamily": "Georgia, Times New Roman, Comic Sans MS, Helvetica, Palatino", "fontStyle": "normal", 'marginTop': 10
};

// buttonOpts maker 
function newButtonOpts( ){
    "use strict";
    var res = Object.create( buttonOpts );
    return res;
}

// produce HTML for button
function makeButt ( bopts ) {
    "use strict";   
    var stytxt = "style='width:" + bopts.width + ";font-family:" + bopts.fontFamily + ";font-style:" + bopts.fontStyle + ";background-color:" + bopts.bgColor + ";height:" + bopts.height + ";font-size:" + bopts.fontSize + ";'";
    return "<input type='button' value='"+bopts.text+"' "+stytxt+" id='"+bopts.idtext+"'>";
}

if (typeof Object.prototype.forEach !== 'function') {
    Object.prototype.forEach = function ( fnc ) {
	"use strict";
	var p;
	for ( p in this ){
	    if ( typeof( this[ p ] ) !== 'function' ){
		fnc( this[ p ], p );
	    }
	}
    };
}

function betterBezier( x1, y1, a1, a2, x2, y2, scale){
    "use strict";
    var cos1, sin1, cos2, sin2;
    if ( !scale ){
	scale = 40;
    }
    // if ( cnv === undefined ){
    //     cnv = CANVAS;
    // }
    cos1 = Math.cos( a1 / 360 * 2 * Math.PI );
    sin1 = Math.sin( a1 / 360 * 2 * Math.PI ); 
    cos2 = Math.cos( a2 / 360 * 2 * Math.PI );
    sin2 = Math.sin( a2 / 360 * 2 * Math.PI ); 
    cnv.beginPath();
    cnv.strokeStyle = "Blue";
    cnv.moveTo( x1, y1 );
    cnv.bezierCurveTo( x1 + scale * cos1, y1 - scale * sin1, x2 + scale * cos2, y2 - scale * sin2, x2, y2 );
    cnv.stroke();
    cnv.closePath();
}


function evenQ( n ){
    "use strict";
    return n % 2 === 0;
}

function oddQ( n ){
    "use strict";
    return !evenQ( n );
}


//iterator for sequence of n numbers summing to s
var numberSeqSum = {
    "n": 0,
    "s": 0,
    "new": function(n,s){
	"use strict";
	var newiter;
	newiter = Object.create( numberSeqSum );
	newiter.n = n;
	newiter.s = s;
	return newiter; },
    "next": function(){
	"use strict";
	if ( this.n === 0 ){
	    return false; }
	else if ( this.n === 1 ){
	    this.n = 0;
	    return this.s; }
	var i, r, p, m = this.s;
	for ( i=0; i<=m; i+=1 ){
	    r = Math.random();
	    p = (this.n - 1)/(this.s + 1);
	    if ( r <= p ){
		this.n -= 1;
		return i; }
    	    this.s -= 1;
	} }
};

const partiallyOrderedList = {
    "top":0,
    "list":[],
    "cut":Infinity,
    "add":function(el,v){
        "use strict";
        let added = false;
	if(v>=this.cut){
	    this.list.push([v,el]); }
	else{
            for(let i=0; i<this.top; i+=1){
		const cur = this.list[i];
		if(cur===undefined){
                    this.list.push([v,el]);
                    added = true;
                    break;  }
		if(v<cur[0]){
                    const front = this.list.slice(0,i);
                    front.push([v,el]);
                    const back = this.list.slice(i,);
                    this.list = front.concat(back);
                    added = true;
                    break; } };
            if(added){
	    	if(this.list.length>=this.top){
		    this.cut=this.list[this.top-1][0]; } }
	    else{
		this.list.push([v,el]); } } },
    "getList":function(){
        "use strict";
        return mapLp(this.list,e => e[1]); },
    "getVals":function(){
        "use strict";
        return mapLp(this.list,e => e[0]); },
    "create":function(top){
        "use strict";
        const newpol = Object.create(partiallyOrderedList);
        newpol.top = top;
        newpol.list = [];
	newpol.cut=Infinity;
        return newpol; },
    "concat":function(newlist){
        "use strict";
        for(let cur of newlist){
            this.add(...cur); } },
    "mapVals":function(fun){
        "use strict"
        this.list = this.list.map(ve => [fun(ve[0]),ve[1]]); }
}
        
function addObjs(o1,o2,min){
    "use strict";
    if(min===undefined){
        min = -Infinity; }
    let res;
    if(typeof(o1)==='number'){
        return Math.max(o1 + o2,min); }
    else{
        res = Object.clone(o1);
        for(let k of Object.keys(o1)){
            res[k] = addObjs(o1[k],o2[k],min); } }
    return res; }
function multObj(s,o){
    "use strict";
    let res;
    if(typeof(o)==='number'){
        return s * o; }
    else{
        res = Object.clone(o);
        for(let k of Object.keys(o)){
            res[k] = multObj(s,o[k]); } }
    return res; }
function zeroObj(o){
    "use strict";
    let res;
    if(typeof(o)==='number'){
        return 0; }
    else{
        res = Object.clone(o);
        for(let k of Object.keys(o)){
            res[k] = zeroObj(o[k]); } }
    return res; }
function equalObj(o1,o2){
    "use strict";
    let res;
    if(typeof(o1)==='number'){
        return o1===o2; }
    else{
        for(let k of Object.keys(o1)){
            if(!equalObj(o1[k],o2[k])){
                return false; }; } }
    return true; }

function randChoice(lst,wts){
    "use strict";
    const sum = wts.sum();
    const r=Math.random();
    let i=-1,cum=0;
    do{
        i += 1;
        cum += wts[i]/sum;
    }while(cum<r)
    return lst[i];
}

function randBool(p){
    "use strict";
    if(p===undefined){
        p = 0.5; }
    return Math.random() < p;
}

function copyValsToObj(obj,vals){
    "use strict";
    if(typeof(obj)==='number'){
        return vals; }
    else{
        for(let k of Object.keys(obj)){
           obj[k] = copyValsToObj(obj[k],vals[k]); } }
    return obj;
}

function choose(n,r){
    "use strict";
    let res = 1;
    for(let i=0; i<r; i+=1){
        res *= (n-i)/(i+1); }
    return res;
}

function bernoulli(n,p,r){
    "use strict";
    return choose(n,r) * p**r * (1-p)**(n-r);
}

function bernoulliCum(n,p,r){
    "use strict";
    let res = 0;
    for(let i=0; i<=r; i+=1){
        res += bernoulli(n,p,i); }
    return res;
}

function findMin(fun,del,flag){
    "use strict"
    let x1 = -1;
    let x2 = -1/3;
    let x3 = 1/3;
    let x4 = 1;
    let error = x4 - x1;
    if(flag===undefined){
        flag = false; }
    let miny;
    let maxy;
    while(error>del && error<1000){
        let y1 = fun(x1);
        let y2 = fun(x2);
        let y3 = fun(x3);
        let y4 = fun(x4);
        miny = Math.min(y1,y2,y3,y4);
        maxy = Math.max(y1,y2,y3,y4);
        if(!flag && (y1===miny || y4===miny || (y1<y2 && y3>y4))){
            if(y1===y4){
                x1 = x1 - error/3;
                x4 = x4 + error/3; }
            else if(y1<y4){
                x4 = x2;
                x1 = x2 - 4/3*error; }
            else{
                x1 = x3;
                x4 = x3 + 4/3*error; } }
        else{
            flag = true;
            if(miny===y1 || miny===y2){
                x1 = x1;
                x4 = x3; }
            else{
                x1 = x2;
                x4 = x4; } }
        error = x4 - x1;
        x2 = x1 + error/3;
        x3 = x4 - error/3;
        //console.log("y width = ",miny,maxy);
    }
    return error<del ? [(x1+x4)/2,miny] : undefined;
}

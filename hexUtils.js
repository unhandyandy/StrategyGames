// -*-js-*-

/*jslint browser: true, devel: true, es5: true */

/*global orthDirs, lookUp, setMatEntry, repeat, comp, score, opposite, 
  movesFromLoc, flatten1, onBoardQ, makeConstantArraySimp, makeConstantArray, 
  numMvs, cartesianProd, matrixTranspose, postMessage, 
  setBGCols, rowLen, gameHistory, posCur, setButtonProps, numberSequence,
  mapLp, eachLp, equalLp */

var hexSize = getHexSize();

var midHt = hexSize - 1;
var allDirs = [[1,0],[1,1],[0,1],[-1,0],[-1,-1],[0,-1]];

function offside(n){
    "use strict";
    return Math.abs(n - midHt);
}

function rowLen(n){
    "use strict";
    return 2*hexSize - 1 - offside(n); 
}

function onBoardQ(loc){
    "use strict";
    return loc[0] >= 0 && loc[0] < 2*hexSize - 1 && 
	loc[1] >= 0 && loc[1] < rowLen(loc[0]);
}

function hexRect(loc){
    "use strict";
    var hr = loc[0],
        hc = loc[1],
        rc = hc;
    if(hr>midHt){
	rc += offside(hr);
    }
    return [hr,rc];
}

function rectHex(loc){
    "use strict";
    var rr = loc[0],
        rc = loc[1],
        hc = rc;
    if(rr>midHt){
	hc -= offside(rr);
    }
    return [rr,hc];
}

function hexMove(l,d){
    "use strict";
    var rl = hexRect(l),
        res = rl.vector2Add(d);
    return rectHex(res);
}


function nbrs(loc,dirs){
    "use strict";
    if(dirs===undefined){
	dirs = allDirs;
    }
    var res = mapLp( dirs, function(d){
			   return hexMove(loc,d);
		       } );
    return res.filter(function(l){
			  return onBoardQ(l);
		      });
}

function nbrsAll( loc ){
    "use strict";
    var res = [], i, dir, newloc;
    for ( i = 0; i < 6; i += 1 ){
	dir = allDirs[ i ];
	newloc = hexMove( loc, dir );
	if ( onBoardQ( newloc ) ){
	    res.push( newloc ); }}
    return res;
}

function oneLineFillBlank(loc,dir,dst){
    "use strict";
    var res = [loc],
        lst = loc,
        d;
    for( d=1;d<=dst;d++){
	lst = hexMove(lst,dir);
	res.push(lst);
    }
    return res;
}

function nbrsAtDist(loc,dst){
    "use strict";
    var dstdirs = mapLp( allDirs, function(dir){
			       return dir.scalarMult(dst);
			   }),
        res = mapLp( dstdirs, function(d){
			   return hexMove(loc,d);
		       } );
    res = mapLp( res, function(l,i){
		      return oneLineFillBlank(l,allDirs[(i+2)%6],dst-1);
		  } );
    res = flatten1(res);
    return res.filter(function(l){
			  return onBoardQ(l);
		      });
}


function dirCCW(dir){
    "use strict";
    var ind = allDirs.indexOfProp(function(d){
				      return equalLp( dir, d);
				  });
    ind = (ind + 2) % 6;
    return allDirs[ind];
}


function oneLine(pos,loc,dir){
    "use strict";
    var res = [],
        fin = hexMove(loc,dir);
    while(onBoardQ(fin) && lookUp(pos,fin)===0){
	res.push([loc,fin]);
	fin = hexMove(fin,dir);
    }
    return res;
}

function oneLineFill(pos,loc,dir){
    "use strict";
    var res = [loc],
        fin = hexMove(loc,dir);
    while(onBoardQ(fin) && lookUp(pos,fin)===0){
	res.push(fin);
	fin = hexMove(fin,dir);
    }
    return res;
}



var halfDirs = [[1,0],[1,1],[0,1]];

function hexDist(l1,l2){
    "use strict";
    var r1 = hexRect(l1),
        r2 = hexRect(l2),
        del = r1.vector2Minus(r2),
        res = del.mapLp(Math.abs, del);
    if( (del[0] >= 0 && del[1] >= 0) ||
	(del[0] <= 0 && del[1] <= 0)){
	res = Math.max.apply(null,res);
    }
    else{
	res = res.reduce(Math.plus,0);
    }
    return res;
}



function linesFromLoc(pos,loc,dirs){
    "use strict";
    var res = mapLp( dirs, function(dir){
			      return oneLine(pos,loc,dir);
			  });
    return flatten1(res);
}

function lineFillsFromLoc(pos,loc,dirs){
    "use strict";
    var res = mapLp( dirs, function(dir){
			      return oneLineFill(pos,loc,dir);
			  });
    return res;
}


function makeEmptyPos(){
    "use strict";
    var rows = numberSequence(0,2*hexSize - 2),
        pos = mapLp(rows, function(r){
			   return makeConstantArraySimp(0,rowLen(r));
		       });
    return pos;
}

function makeAllLocs(){
    "use strict";
    var rows = numberSequence(0,2*hexSize - 2),
        pos = makeEmptyPos(),
        res = mapLp(rows, function(r){
			   return oneLineFill(pos,[r,0],[0,1]);
		       });
    return flatten1(res);
}

function makeAllLines(len){
    "use strict";
    var locs = makeAllLocs(),
        pos = makeEmptyPos(),
        res = mapLp( locs, function(l){
				    return lineFillsFromLoc(pos,l,halfDirs);
				});
    res = flatten1(res);
    res = res.filter(function(l){
			 return l.length >= len;
		     });
    return mapLp( res, function(ln){
		       return ln.slice(0,len);
		   });
}

var emptyCell;

function PositionGrouped(mat,grps){
    "use strict";
    this.allLocs = makeAllLocs();
    if(mat===undefined){
	this.table = [];
    }else{
	this.table = mat;
    }
    this.lookUp = function(loc){
	return lookUp(this.table,loc);
    };
    this.setGroups = function(grps){
	this.groups = grps;
    };
    this.getGroups = function(){
	return this.groups;
    };
    this.nbrs = function(loc){
	return nbrsAll(loc);
    };
    this.linkedPcesQ = function(p1,p2){
	return equalLp( p1, p2 );
    };
    this.groupNumOf = function(loc){
	var fun = function(grp){
	    return grp.some(function(l){
				return equalLp( l, loc );
			    });
	},
	    funlst = mapLp( this.groups, fun),
	    ind = funlst.indexOf(true);
	return ind;
    };
    this.occupiedQ = function(loc){
	return !equalLp( this.lookUp(loc), emptyCell);
    };
    //DEBUG
    // this.checkGroups = function(){
    // var chckQ = function(l){
    // return this.groupNumOf(l) >= 0;
    // };
    // var locs = this.allLocs.filter(this.occupiedQ,this);
    // return locs.every(chckQ,this);
    // };
    //GUBED
    this.joinGroups = function(lst){
	var lstcp = lst.clone(), newgrp = [];
	//DEBUG
	// if(!this.checkGroups()){
	// console.debug("Group check failed!");
	// console.debug("Table: %s", this.getTable().join());
	// console.debug("Groups: %s",this.groups.join());
	// };
	// var oldTab = this.getTable().clone();
	// var oldGrps = this.groups.clone();
	//GUBED
	// lstcp.forEach(function(i){
	//  newgrp = newgrp.concat(this.groups[i]);
	//  },this);
	eachLp(lstcp, function(i){
	    newgrp = newgrp.concat(this.groups[i]);
	},this);

	//console.debug("Groups joined: %s", lstcp.join());
	lstcp.sort(Math.minus);
	//console.debug("Groups joined: %s", lstcp.join());
	lstcp.reverse();
	//console.debug("Groups joined: %s", lstcp.join());
	eachLp(lstcp,function(i){
			this.groups.splice(i,1);
		    },this);
	this.groups.push(newgrp);
	//DEBUG
	// if(!this.checkGroups()){
	// console.debug("Group check failed!");
	// console.debug("Old Table: %s", oldTab.join());
	// console.debug("Old Groups: %s",oldGrps.join());
	// console.debug("Groups joined: %s", lstcp.join());
	// console.debug("Table: %s", this.getTable().join());
	// console.debug("Groups: %s",this.groups.join());
	// };
	//GUBED
	//return newgrp;
    };
    this.regroupAdd = function(loc){
	var pce = this.lookUp(loc),
	    ind0, nbs, pces, len, i, newpce, ind1, ind2;
	if(pce===emptyCell){
	    return ;
	}
	ind0 = this.groupNumOf(loc);
	if(ind0<0){
	    this.getGroups().push([loc]);	    
	}
	nbs = this.nbrs(loc);
	pces = mapLp( nbs, this.lookUp,this);
	len = nbs.length;
	for( i=0;i<len;i++){
	    newpce = pces[i];
	    if(newpce===pce){
		ind1 = this.groupNumOf(loc);
		ind2 = this.groupNumOf(nbs[i]);
		if(ind1 !== ind2){
		  this.joinGroups([ind1,ind2]);  
		}
	    }
	}
    };
    this.regroupChange = function(loc,breakQ){
	var pce = this.lookUp(loc),
	    ind0, oldgrp, nbs, pces, newpce, len, ind1, ind2, i;
	if(breakQ===undefined){
	    breakQ = false;
	}
	ind0 = this.groupNumOf(loc);
	if( equalLp( pce, emptyCell ) || breakQ){
	    if(ind0>=0){
		//this.groups[ind0].removeAll(loc);
		oldgrp = this.groups[ind0].clone();
		this.groups.splice(ind0,1);
		this.makeGroupList(oldgrp);
	    }
	    return;
	}
	if(ind0<0){
	    this.getGroups().push([loc]);	    
	}
	nbs = this.nbrs(loc);
	pces = mapLp( nbs, this.lookUp,this);
	len = nbs.length;
	for( i=0;i<len;i++){
	    newpce = pces[i];
	    if(this.linkedPcesQ(newpce,pce)){
		ind1 = this.groupNumOf(loc);
		ind2 = this.groupNumOf(nbs[i]);
		if(ind1 !== ind2){
		  this.joinGroups([ind1,ind2]);  
		}
	    }
	}	
    };
    this.makeGroupList = function(locs){
	var fun1, fun2, num, numitr, i;
	if(locs===undefined){
	    locs = this.allLocs;
	    this.groups = [];
	}
	fun1 = function(loc){
	    if( !equalLp( this.lookUp(loc), emptyCell )){
		this.groups.push([loc]);
	    }
	};
	//console.debug("allLocs.forEach...");
	locs.forEach(fun1,this);
	//console.debug("...done.");
	fun2 = function(loc){
	    this.regroupChange(loc);
	};
	num = this.allLocs.length;
	numitr = Math.log(num)/Math.log(2)+1;
	for( i=0;i<numitr;i++){
	    eachLp(locs,fun2,this);
	}
    };
    if(grps===undefined){
	this.groups = [];
	this.makeGroupList();
    }else{
	this.groups = grps;
    }
    this.setTable = function(tab){
	this.table = tab;
    };
    this.getTable = function(){
	return this.table;
    };
    this.setLoc = function(loc,val){
	setMatEntry(this.table,loc,val);
    };
    this.groupNbrsOfGrp = function(grp){
	var grpnbs = [],
	    fun2 = function(nb){
	    return !grpnbs.has(nb) && !grp.has(nb);
	},
	    fun1 = function(loc){
	    var nbs = this.nbrs(loc);
	    grpnbs = grpnbs.concat(nbs.filter(fun2));
	};
	eachLp(grp, fun1,this);
	return grpnbs;	
    };
    this.groupNbrs = function(grpind){
	var grp = this.groups[grpind];
	return this.groupNbrsOfGrp(grp);
    };
    this.clone = function(){
	return new PositionGrouped(this.getTable().clone(),this.groups.clone());
    };
    this.equal = function(pos){
	return equalLp( this.getTable(), pos.getTable() );
    };
    this.removeFromGroups = function(loc){
	var grpind = this.groupNumOf(loc);
	if(grpind<0){
	    return;
	}else{
	    this.groups[grpind] = this.groups[grpind].removeAll(loc);
	}
    };
    this.makeGroupSolo = function(ind){
	var grp = this.getGroups()[ind].clone(),
	    newpos = new PositionGrouped(makeEmptyPos(),[grp]),
	    fun = function(l){
	    newpos.setLoc(l,this.lookUp(l));
	};
	eachLp(grp,fun,this);
	return newpos;
    };
}


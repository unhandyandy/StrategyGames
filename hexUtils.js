var hexSize = getHexSize();

var midHt = hexSize - 1;

function offside(n){
    return Math.abs(n - midHt);
};

function rowLen(n){
    return 2*hexSize - 1 - offside(n); 
};

function onBoardQ(loc){
    return loc[0] >= 0 && loc[0] < 2*hexSize - 1 && 
	loc[1] >= 0 && loc[1] < rowLen(loc[0]);
};

function hexRect(loc){
    var hr = loc[0];
    var hc = loc[1];
    var rc = hc;
    if(hr>midHt){
	rc += offside(hr);
    };
    return [hr,rc];
};

function nbrs(loc,dirs){
    if(dirs===undefined){
	dirs = allDirs;
    };
    var res = dirs.map(function(d){
			   return hexMove(loc,d);
		       });
    return res.filter(function(l){
			  return onBoardQ(l);
		      });
};

function nbrsAtDist(loc,dst){
    var dstdirs = allDirs.map(function(dir){
			       return dir.scalarMult(dst);
			   });
    var res = dstdirs.map(function(d){
			   return hexMove(loc,d);
		       });
    res = res.map(function(l,i){
		      return oneLineFillBlank(l,allDirs[(i+2)%6],dst-1);
		  });
    res = flatten1(res);
    return res.filter(function(l){
			  return onBoardQ(l);
		      });
};

function oneLineFillBlank(loc,dir,dst){
    var res = [loc];
    var lst = loc;
    for(var d=1;d<=dst;d++){
	lst = hexMove(lst,dir);
	res.push(lst);
    };
    return res;
};

function dirCCW(dir){
    var ind = allDirs.indexOfProp(function(d){
				      return dir.equal(d);
				  });
    ind = (ind + 2) % 6;
    return allDirs[ind];
};

function rectHex(loc){
    var rr = loc[0];
    var rc = loc[1];
    var hc = rc;
    if(rr>midHt){
	hc -= offside(rr);
    };
    return [rr,hc];
};

function hexMove(l,d){
    var rl = hexRect(l);
    var res = rl.vectorAdd(d);
    return rectHex(res);
};

function oneLine(pos,loc,dir){
    var res = [];
    var fin = hexMove(loc,dir);
    while(onBoardQ(fin) && lookUp(pos,fin)==0){
	res.push([loc,fin]);
	fin = hexMove(fin,dir);
    };
    return res;
};

function oneLineFill(pos,loc,dir){
    var res = [loc];
    var fin = hexMove(loc,dir);
    while(onBoardQ(fin) && lookUp(pos,fin)==0){
	res.push(fin);
	fin = hexMove(fin,dir);
    };
    return res;
};


var allDirs = [[1,0],[1,1],[0,1],[-1,0],[-1,-1],[0,-1]];

var halfDirs = [[1,0],[1,1],[0,1]];

function hexDist(l1,l2){
    var r1 = hexRect(l1);
    var r2 = hexRect(l2);
    var del = r1.vectorMinus(r2);
    var res = del.map(Math.abs);
    if( (del[0] >= 0 && del[1] >= 0) ||
	(del[0] <= 0 && del[1] <= 0)){
	res = Math.max.apply(null,res);
    }
    else{
	res = res.reduce(Math.plus,0);
    };
    return res;
};



function linesFromLoc(pos,loc,dirs){
    var res = dirs.map(function(dir){
			      return oneLine(pos,loc,dir);
			  });
    return flatten1(res);
};

function lineFillsFromLoc(pos,loc,dirs){
    var res = dirs.map(function(dir){
			      return oneLineFill(pos,loc,dir);
			  });
    return res;
};


function makeEmptyPos(){
    var rows = numberSequence(0,2*hexSize - 2);
    var pos = rows.map(function(r){
			   return makeConstantArraySimp(0,rowLen(r));
		       });
    return pos;
};

function makeAllLocs(){
    var rows = numberSequence(0,2*hexSize - 2);
    var pos = makeEmptyPos();
    var res = rows.map(function(r){
			   return oneLineFill(pos,[r,0],[0,1]);
		       });
    return flatten1(res);
};

function makeAllLines(len){
    var locs = makeAllLocs();
    var pos = makeEmptyPos();
    var res = locs.map(function(l){
				    return lineFillsFromLoc(pos,l,halfDirs);
				});
    res = flatten1(res);
    res = res.filter(function(l){
			 return l.length >= len;
		     });
    return res.map(function(ln){
		       return ln.slice(0,len);
		   });
};

var emptyCell;

function positionGrouped(mat,grps){
    this.allLocs = makeAllLocs();
    if(mat===undefined){
	this.table = [];
    }else{
	this.table = mat;
    };
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
	return nbrs(loc);
    };
    this.linkedPcesQ = function(p1,p2){
	return p1.equal(p2);
    };
    this.groupNumOf = function(loc){
	var fun = function(grp){
	    return grp.some(function(l){
				return l.equal(loc);
			    });
	};
	var funlst = this.groups.map(fun);
	var ind = funlst.indexOf(true);
	return ind;
    };
    this.occupiedQ = function(loc){
	return !this.lookUp(loc).equal(emptyCell);
    };
    //DEBUG
    // this.checkGroups = function(){
    // 	var chckQ = function(l){
    // 	    return this.groupNumOf(l) >= 0;
    // 	};
    // 	var locs = this.allLocs.filter(this.occupiedQ,this);
    // 	return locs.every(chckQ,this);
    // };
    //GUBED
    this.joinGroups = function(lst){
	var lstcp = lst.clone();
	//DEBUG
	// if(!this.checkGroups()){
	// 		console.debug("Group check failed!");
	// 		console.debug("Table: %s", this.getTable().join());
	// 		console.debug("Groups: %s",this.groups.join());
	// };
	// var oldTab = this.getTable().clone();
	// var oldGrps = this.groups.clone();
	//GUBED
	var newgrp = [];
	lstcp.forEach(function(i){
			newgrp = newgrp.concat(this.groups[i]);
		    },this);
	//console.debug("Groups joined: %s", lstcp.join());
	lstcp.sort(Math.minus);
	//console.debug("Groups joined: %s", lstcp.join());
	lstcp.reverse();
	//console.debug("Groups joined: %s", lstcp.join());
	lstcp.forEach(function(i){
			this.groups.splice(i,1);
		    },this);
	this.groups.push(newgrp);
	//DEBUG
	// if(!this.checkGroups()){
	// 		console.debug("Group check failed!");
	// 		console.debug("Old Table: %s", oldTab.join());
	// 		console.debug("Old Groups: %s",oldGrps.join());
	// 		console.debug("Groups joined: %s", lstcp.join());
	// 		console.debug("Table: %s", this.getTable().join());
	// 		console.debug("Groups: %s",this.groups.join());
	// };
	//GUBED
	//return newgrp;
    };
    this.regroupAdd = function(loc){
	var pce = this.lookUp(loc);
	if(pce==emptyCell){
	    return ;
	};
	var ind0 = this.groupNumOf(loc);
	if(ind0<0){
	    this.getGroups().push([loc]);	    
	}
	var nbs = this.nbrs(loc);
	var pces = nbs.map(this.lookUp,this);
	var len = nbs.length;
	for(var i=0;i<len;i++){
	    var newpce = pces[i];
	    if(newpce==pce){
		var ind1 = this.groupNumOf(loc);
		var ind2 = this.groupNumOf(nbs[i]);
		if(ind1 != ind2){
		  this.joinGroups([ind1,ind2]);  
		};
	    };
	};
    };
    this.regroupChange = function(loc,breakQ){
	var pce = this.lookUp(loc);
	if(breakQ===undefined){
	    breakQ = false;
	};
	var ind0 = this.groupNumOf(loc);
	if(pce.equal(emptyCell) || breakQ){
	    if(ind0>=0){
		//this.groups[ind0].removeAll(loc);
		var oldgrp = this.groups[ind0].clone();
		this.groups.splice(ind0,1);
		this.makeGroupList(oldgrp);
	    };
	    return;
	};
	if(ind0<0){
	    this.getGroups().push([loc]);	    
	}
	var nbs = this.nbrs(loc);
	var pces = nbs.map(this.lookUp,this);
	var len = nbs.length;
	for(var i=0;i<len;i++){
	    var newpce = pces[i];
	    if(this.linkedPcesQ(newpce,pce)){
		var ind1 = this.groupNumOf(loc);
		var ind2 = this.groupNumOf(nbs[i]);
		if(ind1 != ind2){
		  this.joinGroups([ind1,ind2]);  
		};
	    };
	};	
    };
    this.makeGroupList = function(locs){
	if(locs===undefined){
	    locs = this.allLocs;
	    this.groups = [];
	};
	var fun1 = function(loc){
	    if(!this.lookUp(loc).equal(emptyCell)){
		this.groups.push([loc]);
	    };
	};
	//console.debug("allLocs.forEach...");
	locs.forEach(fun1,this);
	//console.debug("...done.");
	var fun2 = function(loc){
	    this.regroupChange(loc);
	};
	var num = this.allLocs.length;
	var numitr = Math.log(num)/Math.log(2)+1;
	for(var i=0;i<numitr;i++){
	    locs.forEach(fun2,this);
	};
    };
    if(grps===undefined){
	this.groups = [];
	this.makeGroupList();
    }else{
	this.groups = grps;
    };
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
	var grpnbs = [];
	var fun2 = function(nb){
	    return !grpnbs.has(nb) && !grp.has(nb);
	};
	var fun1 = function(loc){
	    var nbs = this.nbrs(loc);
	    grpnbs = grpnbs.concat(nbs.filter(fun2));
	};
	grp.forEach(fun1,this);
	return grpnbs;	
    };
    this.groupNbrs = function(grpind){
	var grp = this.groups[grpind];
	return this.groupNbrsOfGrp(grp);
    };
    this.clone = function(){
	return new positionGrouped(this.getTable().clone(),this.groups.clone());
    };
    this.equal = function(pos){
	return this.getTable().equal(pos.getTable());
    };
    this.removeFromGroups = function(loc){
	var grpind = this.groupNumOf(loc);
	if(grpind<0){
	    return;
	}else{
	    this.groups[grpind] = this.groups[grpind].removeAll(loc);
	};
    };
    this.makeGroupSolo = function(ind){
	var grp = this.getGroups()[ind].clone();
	var newpos = new positionGrouped(makeEmptyPos(),[grp]);
	var fun = function(l){
	    newpos.setLoc(l,this.lookUp(l));
	};
	grp.forEach(fun,this);
	return newpos;
    };
};


// This is a required variable.
// It represents the default search depth.  

emptyCell = 0;

//hexSize = getHexSize();
winLen = hexSize;
var numLocs = (2*hexSize - 1)*hexSize + (hexSize - 1)*(hexSize - 1);

function plyrPce(n){
    return 3 - 2*n;
};

function score(mat,plyr){
    //console.debug("evaluating...");
    var pce = plyrPce(plyr);
    var pos = mat.clone();
    //pos.pop();
    var res = pos.map(function(r){
			  return r.reduce(Math.plus,0);
		      });
    return pce*res.reduce(Math.plus,0);
};


function evalPosUncert(mat,plyr){
    var pce = plyrPce(plyr);
    var grps = mat.getGroups();
    var fun = function(g){
	if(mat.lookUp(g[0])==pce){
	    return Math.pow(g.length,2);
	}else{
	    return 0;
	};
    };
    var vals = grps.map(fun);
    return vals.reduce(Math.plus,0);
};


function winQ(mat,plyr){
    if(gameHistory[0].length<2){
	return false;
    };
    var pce = plyrPce(plyr);
    var fun = function(p) {
	return p == pce;
    };
    return score(mat.getTable(),plyr) == score(mat.getTable().filter2(fun),plyr);
};


function lossQ(mat,plyr){
    return winQ(mat,opposite(plyr));
};

function gameOverQ( mat, plyr ){
    "use strict";
    return winQ(mat,plyr) || lossQ(mat,plyr);
}

function drawQ(mat,plyr){
    return false;
};

function friendedQ(pos,loc,pce){
    var nbs = pos.nbrs(loc);
    return nbs.some(function(l){
		    return pos.lookUp(l)==pce;
		});
};

function oustPos(tab,grps,fp){
    PositionGrouped.call(this,tab,grps);
    this.forcedPass = fp;
    this.equal = function(pos){
	return this.forcedPass==pos.forcedPass && 
	    this.getTable().equal(pos.getTable());
    };
    this.clone = function(){
	var res = new oustPos(this.getTable().clone(),
			      this.groups.clone(),
			      this.forcedPass);
	return res;
    };
};

//extend(oustPos,positionGrouped);

var passMove = ["pass"];

function movesFromPos(pos,plyr){
    if(pos.forcedPass){
	return [passMove];
    };
    var frnd = plyrPce(plyr);
    var mvs = makeAllLocs();
    mvs = mvs.filter(function(loc){
			  return pos.lookUp(loc) == 0;
		      });

    var friendlessQ = function(loc){
	var nbs = pos.nbrs(loc);
	return nbs.every(function(l){
			    return pos.lookUp(l)!=frnd;
			});
    };
    var ncMvs = mvs.filter(friendlessQ);

    var captureQ = function(loc){
	var nbs = pos.nbrs(loc);
	if(friendedQ(pos,loc,frnd)){
	    var intPos = pos.clone();
	    intPos.setLoc(loc,frnd);
	    intPos.regroupChange(loc);
	    var nwgrpind = intPos.groupNumOf(loc);
	    var len = intPos.groups[nwgrpind].length;
	    var grpnbs = intPos.groupNbrs(nwgrpind);
	    var capF = false;
	    var checkLenQ = function(l){
		if(intPos.lookUp(l)==0){
		    return true;
		}else{
		    capF = true;
		    var nbgrp = intPos.groupNumOf(l);
		    //DEBUG
		    // if(nbgrp == -1){
		    // 	console.debug("No group!");
		    // 	console.debug("Table: %s", intPos.getTable().join());
		    // 	console.debug("Loc: %s", l.join());
		    // 	console.debug("Groups: %s",intPos.groups.join());
		    // };
		    //GUBED
		    return intPos.groups[nbgrp].length < len;
		};
	    };
	    return grpnbs.every(checkLenQ) && capF;
	}else{
	    return false;
	};
    };
    var cpMvs = mvs.filter(captureQ);

    var res = ncMvs.concat(cpMvs); 
    if(res.length>0){
	res.sort(function(a,b){
		     return sortOrder(pos,a,b,frnd);
		 });
	return res.map(function(l){
			   return [l];
		       });
    }else{
	return [passMove];
    };
};

numChoices = 8;

var desiredDepth = 6;


function locDist(pos,loc,pce){
    var res = 1;
    var fun = function(l){
	return pos.lookUp(l) == pce;
    };
    for(var d=1;d<2*hexSize-1;d++){
	var nbs = nbrsAtDist(loc,d);
	if(nbs.some(fun)){
	    break;
	};
	res++;
    };
    return res;
};

function locEnemyVal(pos,loc,pce){
    var dst = locDist(pos,loc,-pce);
    if(dst<3){
	return 0;
    }else{
	var nbs = nbrsAtDist(loc,dst);
	var fun = function(l){
	    return pos.lookUp(l)==-pce;
	};
	return nbs.count(fun)/(dst - 2);
    };
};

function locFriendVal(pos,loc,pce){
    var dst = locDist(pos,loc,pce);
    var nbs = nbrsAtDist(loc,dst);
    var fun = function(l){
	return pos.lookUp(l)==pce;
    };
    return nbs.count(fun)/(dst - 1);
};

var enemyFact = 4;

function numGrpNbrs(pos,loc,pce){
    var res = [];
    var fun = function(n){
	if(pos.lookUp(n)==pce){
	    var ind = pos.groupNumOf(n);
	    if(!res.has(ind)){
		res.push(ind);
	    };
	};
    };
    var nbs = pos.nbrs(loc);
    nbs.forEach(fun);
    var lens = res.map(function(i){
			   return pos.getGroups()[i].length;
		       });
    return lens.reduce(Math.plus,0);
};

function locVal(pos,loc,pce){
    if(friendedQ(pos,loc,pce)){
	var grpsjnd = numGrpNbrs(pos,loc,pce);
	var edst = locDist(pos,loc,-pce);
	var eval = Math.abs(edst - 3);
	return eval + 2*6*hexSize + grpsjnd;
    }else{
	var fval = locFriendVal(pos,loc,pce);
	var eval = locEnemyVal(pos,loc,pce);
	if(eval==0){
	    return -fval;
	}else{
	    return enemyFact*eval + fval;
	}
    };
};

function sortOrder(pos,l1,l2,pce){
    var val = locVal(pos,l2,pce) - locVal(pos,l1,pce);
    return val;
};

function positionFromMove(mov,pos,plyr){
    var pscp = pos.clone();
    if(mov[0]=="pass"){
	pscp.forcedPass = false;
	return pscp;
    };
    var loc = mov[0];
    var pce = plyrPce(plyr);
    pscp.setLoc(loc,pce);
    pscp.regroupChange(loc);    
    var nbs = pos.nbrs(loc);
    var frndQ = nbs.some(function(l){
		    return pos.lookUp(l)==pce;
		});
    if(frndQ){
	pscp.forcedPass = true;
	var nwgrpind = pscp.groupNumOf(loc);
	var grpnbs = pscp.groupNbrs(nwgrpind);
	var rmvgrp = function(loc){
	    if(pscp.lookUp(loc)!=0){
		var ddgrpind = pscp.groupNumOf(loc);
		var ddgrp = pscp.groups[ddgrpind];
		pscp.groups.splice(ddgrpind,1);
		ddgrp.forEach(function(l){
				  pscp.setLoc(l,0);
			      });
	    };
	};
	grpnbs.forEach(rmvgrp);	
    };
    return pscp;
};


function poscurToDisplay(pos){
    var fun = function(x){
	var res;
	if(x==1){
	    res = " X ";
	}
	else if(x==-1){
	    res = " O ";
	}
	else if(x==0){
	    res = "    ";
	};
	return res;
    };
    var bd = pos.getTable().map(function(r,i){
		   return pos.getTable()[i].map(fun);
	       });
    return bd;
};





function makeInitBdTab(){
    var res = [];
    for(var i = 0; i < 2*hexSize - 1; i++){
	var row = [];
	for(var j = 0; j<rowLen(i); j++){
	    row.push(["   ",[i,j],{'height' : 40}]);
	};
	res.push(row);
    };
    return res;
}

var initBdTab = makeInitBdTab();


var posInit = new oustPos(makeEmptyPos(),[]);

function makePosInit(){
    var pce = "O";
    if(comp==1){
	pce = "X";
    };
    postMessage("You are "+pce+" in this game.");
    return posInit;
};

// This is a required variable.
// It represents the default search depth.  
var desiredDepth = 4;

emptyCell = [0,0];

//hexSize = getHexSize();

var numLocs = (2*hexSize - 1)*hexSize + (hexSize - 1)*(hexSize - 1);

function plyrSgn(n){
    return 3 - 2*n;
};

function pceScore(pce){
    var val = pceVal(pce);
    if(pce[0]==pce[1]){
	val = 0;
    }else if(pce[0]<pce[1]){
	val = -val;
    };
    return val;
};
function pceVal(pce){
    var val = Math.plus.apply(null,pce);
    return val;
};
function groupScore(pos,grp){
    var res = [0,0];
    grp.forEach(function(l){
		    res = res.vectorAdd(pos.lookUp(l));
		});
    return pceScore(res);
};

var komi = 2.5;

function score(mat,plyr){
    //console.debug("evaluating...");
    var sgn = plyrSgn(plyr);

    var grpvals = mat.getGroups().map(function(g){
					  return groupScore(mat,g);
				      });

    // var locs = mat.allLocs;
    // var locvals = locs.map(function(l){
    // 			       return pceScore(mat.lookUp(l));
    // 			   });

    return sgn*(grpvals.reduce(Math.plus,0) + komi);
};


function evalPosUncert(mat,plyr){
    return score(mat,plyr);
};

function gameOverQ(pos){
    return movesFromPos(pos,1).length == 0;
};


function winQ(mat,plyr){
    if(!gameOverQ(mat)){
	return false;
    };
    return score(mat,plyr) > 0;
};


function lossQ(mat,plyr){
    return winQ(mat,opposite(plyr));
};



function drawQ(mat,plyr){
    return false;
};

function nbrMove(pos,l1,l2){
    var val1 = pceVal(pos.lookUp(l1));
    var val2 = pceVal(pos.lookUp(l2));
    if( 0 < val1 && val1 <= val2 ){
	return [[l1,l2]];
    }else{
	return [];
    };
};

function gerryPos(tab,grps){
    positionGrouped.call(this,tab,grps);
    this.linkedPcesQ = function(p1,p2){
	return pceVal(p1)>0 && pceVal(p2)>0;
    };
    this.clone = function(){
	return new gerryPos(this.getTable().clone(),this.getGroups().clone());
    };
    this.circum = function nbrs(loc){
	var crc = allDirs.map(function(d){
			       return hexMove(loc,d);
			   });
	var nbs = crc.map(function(l){
			      return onBoardQ(l) && this.occupiedQ(l);
			  },this);
	var res = 0;
	var lst = nbs[5];
	for(var i = 0;i<6;i++){
	    if(lst != nbs[i]){
		res++;
		lst = !lst;
	    };
	};
	return res/2;
    };
};

numChoices = 12;

function movesFromLoc(pos,loc){
    var nbs = pos.nbrs(loc);
    var res = [];
    var fun = function(n){
	res = res.concat(nbrMove(pos,loc,n));
    };
    nbs.forEach(fun);
    return res;
};

function moveSortVal(pos,mv){
    var res = mv.map(function(l){
			 return pos.circum(l);
		     });
    return Math.plus.apply(null,res);
};

function sortMoves(pos,mvs){
    mvs.sort(function(a,b){
		 return moveSortVal(pos,b) - moveSortVal(pos,a);
	     });
};

function movesFromPos(pos,plyr){
    var locs = pos.allLocs;
    var res = [];
    var fun = function(l){
	res = res.concat(movesFromLoc(pos,l));
    };
    locs.forEach(fun);
    sortMoves(pos,res);
    return res;
};


function positionFromMove(mov,pos,plyr){
    var pscp = pos.clone();
    var pc1 = pos.lookUp(mov[0]);
    var pc2 = pos.lookUp(mov[1]);
    var newpce = pc1.vectorAdd(pc2);
    pscp.setLoc(mov[0],emptyCell);
    pscp.setLoc(mov[1],newpce);
    pscp.regroupChange(mov[0],true);
    return pscp;
};

function repeatChar(ch,nm){
    if(nm==0){
	return "";
    }else{
	return ch + repeatChar(ch,nm-1);
    };
};

function poscurToDisplay(pos){
    var fun = function(x){
	var res1 = repeatChar("\u254b",x[0]);
	var res2 = repeatChar("\u25ce",x[1]);

	return " "+res1+" " + "\n" + " "+res2+" ";
    };
    var bd = pos.getTable().map(function(r,i){
		   return pos.getTable()[i].map(fun);
	       });
    setBGCols();
    return bd;
};





function makeInitBdTab(){
    var res = [];
    for(var i = 0; i < 2*hexSize - 1; i++){
	var row = [];
	for(var j = 0; j<rowLen(i); j++){
	    row.push(["   ",[i,j],{'height' : 80, 'width' : 140, 'fontsize' : 16}]);
	};
	res.push(row);
    };
    return res;
}

var initBdTab = makeInitBdTab();

function pceFn(r,c){
    var rng = Math.min(r+1,c+1,rowLen(r)-c,2*hexSize - (r+1)) - 1;
    if(rowLen(r) - rng > c + 1){
	if((r+c)%2 == 0){
	    return [0,1];
	}else{
	    return [1,0];
	};
    }else{
	if((r + hexSize + 1)%2 == 0){
	    return [0,1];
	}else{
	    return [1,0];
	};
    };
};

var posInit = new gerryPos(makeEmptyPos(),[makeAllLocs()]);
posInit.allLocs.forEach(function(l){
			posInit.setLoc(l,pceFn.apply(null,l));
		    });

function makePosInit(){
    var pce = "\u25ce";
    if(comp==1){
	pce = "\u254b";
    };
    postMessage("You are "+pce+" in this game.");
    return posInit;
};

function cellMvFun(loc){
    var hst = gameHistory[0];
    var ind = hst.indexOfProp(function(m){
				  return m[0].equal(loc);
			      });
    var res;
    if(ind<0){
	res = false;
    }else{
	res = hst[ind][1].clone();
    };
    return res;
};

function mapCellDest(loc){
    var res = cellMvFun(loc);
    if(res){
	return mapCellDest(res);
    }else{
	return loc;
    };
};

function cellBG(loc){
    var dest = mapCellDest(loc);
    var val = Math.minus.apply(null,posCur.lookUp(dest));
    if(val<0){
	return "orange";
    }else if(val>0){
	return "lightblue";
    }else{
	return "darkgray";
    };
};

function setBGCols(){
    var locs = posCur.allLocs;
    var fun = function(loc){
	setButtonProps(loc,false,{'bgc' : cellBG(loc)});
    };
    locs.forEach(fun);
};

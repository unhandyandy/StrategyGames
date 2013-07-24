// -*-js-*-

/*jslint browser: true, devel: true, es5: true */

/*global nbrs, orthDirs, lookUp, setMatEntry, repeat, comp, score, opposite, 
  movesFromLoc, flatten1, onBoardQ, makeConstantArraySimp, makeConstantArray, 
  numMvs, cartesianProd, matrixTranspose, postMessage, PositionGrouped, allDirs,
  hexMove, setBGCols, rowLen, gameHistory, posCur, setButtonProps, mapLp, eachLp */

// This is a required variable.
// It represents the default search depth.  
var desiredDepth = 4;

emptyCell = [0,0];

//hexSize = getHexSize();

var numLocs = (2*hexSize - 1)*hexSize + (hexSize - 1)*(hexSize - 1);

function plyrSgn(n){
    "use strict";
    return 3 - 2*n;
}

function pceVal(pce){
    "use strict";
    var val = Math.plus.apply(null,pce);
    return val;
}

function pceScore(pce){
    "use strict";
    var val = pceVal(pce);
    if(pce[0]===pce[1]){
	val = 0;
    }else if(pce[0]<pce[1]){
	val = -val;
    }
    return val;
}
function groupScore(pos,grp){
    "use strict";
    var res = [0,0];
    eachLp( grp, function(l){
		    res = res.vector2Add(pos.lookUp(l));
		});
    return pceScore(res);
}

var komi = 2.5;

function score(mat,plyr){
    "use strict";
    //console.debug("evaluating...");
    var sgn = plyrSgn(plyr),
        grpvals = mat.getGroups().map(function(g){
					  return groupScore(mat,g);
				      });

    // var locs = mat.allLocs;
    // var locvals = locs.map(function(l){
    //  return pceScore(mat.lookUp(l));
    // });

    return sgn*(grpvals.reduce(Math.plus,0) + komi);
}


function evalPosUncert(mat,plyr){
    "use strict";
    return score(mat,plyr);
}



function nbrMove(pos,l1,l2){
    "use strict";
    var val1 = pceVal(pos.lookUp(l1)),
        val2 = pceVal(pos.lookUp(l2));
    if( 0 < val1 && val1 <= val2 ){
	return [[l1,l2]];
    }else{
	return [];
    }
}

function GerryPos(tab,grps){
    "use strict";
    var crc, nbs, res, lst, i;
    PositionGrouped.call(this,tab,grps);
    this.linkedPcesQ = function(p1,p2){
	return pceVal(p1)>0 && pceVal(p2)>0;
    };
    this.clone = function(){
	return new GerryPos(this.getTable().clone(),this.getGroups().clone());
    };
    this.circum = function(loc){
	crc = mapLp( allDirs, function(d){
			       return hexMove(loc,d);
			   });
	nbs = mapLp( crc, function(l){
			      return onBoardQ(l) && this.occupiedQ(l);
			  },this);
	res = 0;
	lst = nbs[5];
	for( i = 0;i<6;i++){
	    if(lst !== nbs[i]){
		res++;
		lst = !lst;
	    }
	}
	return res/2;
    };
}

numChoices = 12;

function movesFromLoc(pos,loc){
    "use strict";
    var nbs = pos.nbrs(loc),
        res = [],
        fun = function(n){
	res = res.concat(nbrMove(pos,loc,n));
    };
    eachLp( nbs, fun);
    return res;
}

function moveSortVal(pos,mv){
    "use strict";
    var res = mv.map(function(l){
			 return pos.circum(l);
		     });
    return Math.plus.apply(null,res);
}

function sortMoves(pos,mvs){
     "use strict";
   mvs.sort(function(a,b){
		 return moveSortVal(pos,b) - moveSortVal(pos,a);
	     });
}

function movesFromPos(pos,plyr){
    "use strict";
    var locs = pos.allLocs,
        res = [],
        fun = function(l){
	res = res.concat(movesFromLoc(pos,l));
    };
    eachLp( locs, fun);
    sortMoves(pos,res);
    return res;
}


function positionFromMove(mov,pos,plyr){
    "use strict";
    var pscp = pos.clone(),
        pc1 = pos.lookUp(mov[0]),
        pc2 = pos.lookUp(mov[1]),
        newpce = pc1.vector2Add(pc2);
    pscp.setLoc(mov[0],emptyCell);
    pscp.setLoc(mov[1],newpce);
    pscp.regroupChange(mov[0],true);
    return pscp;
}

function gameOverQ(pos){
    "use strict";
    return movesFromPos(pos,1).length === 0;
}


function winQ(mat,plyr){
    "use strict";
    if(!gameOverQ(mat)){
	return false;
    }
    return score(mat,plyr) > 0;
}


function lossQ(mat,plyr){
    "use strict";
    return winQ(mat,opposite(plyr));
}



function drawQ(mat,plyr){
    "use strict";
    return false;
}


function repeatChar(ch,nm){
    "use strict";
    if(nm===0){
	return "";
    }else{
	return ch + repeatChar(ch,nm-1);
    }
}

function poscurToDisplay(pos){
    "use strict";
    var fun = function(x){
	var res1 = repeatChar("\u254b",x[0]),
	    res2 = repeatChar("\u25ce",x[1]);

	return " "+res1+" " + "\n" + " "+res2+" ";
    },
        bd = pos.getTable().map(function(r,i){
		   return pos.getTable()[i].map(fun);
	       });
    setBGCols();
    return bd;
}





function makeInitBdTab(){
    "use strict";
    var res = [], i, j, row;
    for( i = 0; i < 2*hexSize - 1; i++){
	 row = [];
	for( j = 0; j<rowLen(i); j++){
	    row.push(["   ",[i,j],{'height' : 80, 'width' : 140, 'fontsize' : 16}]);
	}
	res.push(row);
    }
    return res;
}

var initBdTab = makeInitBdTab();

function pceFn(r,c){
    "use strict";
    var rng = Math.min(r+1,c+1,rowLen(r)-c,2*hexSize - (r+1)) - 1;
    if(rowLen(r) - rng > c + 1){
	if((r+c)%2 === 0){
	    return [0,1];
	}else{
	    return [1,0];
	}
    }else{
	if((r + hexSize + 1)%2 === 0){
	    return [0,1];
	}else{
	    return [1,0];
	}
    }
}

var posInit = new GerryPos(makeEmptyPos(),[makeAllLocs()]);

eachLp( posInit.allLocs, function(l){
    "use strict";
    posInit.setLoc(l,pceFn.apply(null,l));
		    });

function makePosInit(){
    "use strict";
    var pce = "\u25ce";
    if(comp===1){
	pce = "\u254b";
    }
    postMessage("You are "+pce+" in this game.");
    return posInit;
}

function cellMvFun(loc){
    "use strict";
    var hst = gameHistory[0],
        ind = hst.indexOfProp(function(m){
				  return m[0].equal(loc);
			      }),
        res;
    if(ind<0){
	res = false;
    }else{
	res = hst[ind][1].clone();
    }
    return res;
}

function mapCellDest(loc){
    "use strict";
    var res = cellMvFun(loc);
    if(res){
	return mapCellDest(res);
    }else{
	return loc;
    }
}

function cellBG(loc){
    "use strict";
    var dest = mapCellDest(loc),
        val = Math.minus.apply(null,posCur.lookUp(dest));
    if(val<0){
	return "orange";
    }else if(val>0){
	return "lightblue";
    }else{
	return "darkgray";
    }
}

function setBGCols(){
    "use strict";
    var locs = posCur.allLocs,
        fun = function(loc){
	setButtonProps(loc,false,{'bgc' : cellBG(loc)});
    };
    eachLp( locs, fun);
}

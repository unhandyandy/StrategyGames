// -*-js-*-

/*jslint browser: true, devel: true, es5: true */

/*global nbrs, orthDirs, lookUp, setMatEntry, repeat, comp, score, opposite, 
  movesFromLoc, flatten1, onBoardQ, makeConstantArraySimp, makeConstantArray, 
  numMvs, cartesianProd, matrixTranspose, postMessage */


function evenQ(n){
    "use strict";
    return (n % 2) === 0;
}

function moveFQ(mat){
    "use strict";
    return numMvs(mat) === 6;
}

function lookUp(mat,loc){
    "use strict";
    return mat[loc[0]][loc[1]];
}

function plyrPce(plyr){
    "use strict";
    return 3 - 2*plyr;
}

function moveNbrQ(l1,l2){
    "use strict";
    if(l1.equal(l2)){
	return false;
    }
    if(l1.equal([1,1]) || l2.equal([1,1])){
	return true;
    }
    if(l1[0] !== l2[0] && l1[1] !== l2[1]){
	return false;
    }
    return Math.abs(l1[0]-l2[0]) === 1 || Math.abs(l1[1]-l2[1]) === 1;
}

function twoMoveQ(mat,mv,player){
    "use strict";
    var start = mv[0],
        finish = mv[1],
        pce = plyrPce(player);
    return (lookUp(mat,start) === pce && 
	    lookUp(mat,finish) === 0 &&
	    moveNbrQ(start,finish));
}

function genAllTwoMoves(){
    "use strict";
    var locs = cartesianProd([0,1,2],[0,1,2]),
        mvs = cartesianProd(locs,locs);
    return mvs.filter(function(mv){
			  return moveNbrQ(mv[0],mv[1]);
		      });
}

var allTwoMoves = genAllTwoMoves();

function diags(mat){
    "use strict";
    var fun = function(loc){
	return mat[loc[0]][loc[1]];
    },
        res = [[[0,0],[1,1],[2,2]].map(fun),
	       [[0,2],[1,1],[2,0]].map(fun)];
    return res;    
}

function linesOfMat(mat){
    "use strict";
    return mat.concat(matrixTranspose(mat),diags(mat));
}

function evalPosUncert(mat,plyr){
    "use strict";
    return 0;
}

function winQ(mat,plyr){
    "use strict";
    var lns = linesOfMat(mat),
        winpce = 3 - 2*plyr,
        winrow = [winpce,winpce,winpce];
    return lns.has(winrow);
}

function lossQ(mat,plyr){
    "use strict";
    return winQ(mat,opposite(plyr));
}

function numMvs(mat){
    "use strict";
    var res = flatten1(mat);
    res = res.map(Math.abs);
    return res.reduce(function(a,b){
			  return a+b;
		      },0);
}

function drawQ(mat,plyr){
    "use strict";
    return numMvs(mat) === 9;
}

function gameOverQ( mat, plyr ){
    "use strict";
    return winQ(mat,plyr) || lossQ(mat,plyr) || drawQ(mat,plyr);
}

function movesFromPos(pos,plyr){
    "use strict";
    var mvs;
    if(moveFQ(pos)){
	mvs = allTwoMoves;
	return mvs.filter(function(mv){
			      return twoMoveQ(pos,mv,plyr);
			  });
    }
    else{
	mvs = cartesianProd([0,1,2],[0,1,2]);
	mvs = mvs.filter(function(loc){
			     return pos[loc[0]][loc[1]] === 0;
			 });
	return mvs.map(function(l){
			   return [l]
			   ;});
    }
}

function positionFromMove(mov,pos,plyr){
    "use strict";
	var start, finish, res, pscp, loc, pce;
    if(moveFQ(pos)){
	start = mov[0];
	finish = mov[1];
	res = pos.clone();
	res[finish[0]][finish[1]] = lookUp(pos,start);
	res[start[0]][start[1]] = 0;
	return res;
    }
    else{
	pscp = pos.clone();
	loc = mov[0];
	pce = 3 - 2*plyr;
	pscp[loc[0]][loc[1]] = pce;
	return pscp;
    }
}

function poscurToDisplay(pos){
    "use strict";
    var fun = function(x){
	var res;
	if(x===1){
	    res = " X ";
	}
	else if(x===-1){
	    res = " O ";
	}
	else if(x===0){
	    res = "    ";
	}
	return res;
    },
        bd = pos.map(function(r,i){
		   return pos[i].map(fun);
	       });
    return bd;
}

var desiredDepth = 3;

var comp = 1;

function makeInitBdTab(){
    "use strict";
    var res = [], i, j, row;
    for( i = 0; i < 3; i++){
	row = [];
	for( j = 0; j<3; j++){
	    row.push(["   ",[i,j],{'height' : 40}]);
	}
	res.push(row);
    }
    return res;
}

var initBdTab = makeInitBdTab();

var posInit = [[0,0,0],[0,0,0],[0,0,0]];

function makePosInit(){
    "use strict";
    var pce = "O";
    if(comp===1){
	pce = "X";
    }
    postMessage("You are "+pce+" in this game.");
    return posInit;
}

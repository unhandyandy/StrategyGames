// -*-js-*-

/*jslint browser: true, devel: true, es5: true */

/*global nbrs, orthDirs, lookUp, setMatEntry, repeat, comp, score, opposite, 
  movesFromLoc, flatten1, onBoardQ, makeConstantArraySimp, makeConstantArray, repetitionQ */


function plyrPce(plyr){
    "use strict";
    return 3 - 2*plyr;
}

var numCols = 5;
var numRows = 5;

var passLoc = [numRows,0];


var allLocs = cartesianProd(numberSequence(0,numRows-1),numberSequence(0,numCols-1));

var midRowN = Math.floor(numRows/2+0.5);
var midColN = Math.floor(numCols/2+0.5);

function nbrsPce(loc,pos){
    "use strict";
    var res = nbrs(loc,orthDirs,numRows,numCols);
    return res.map(function(l){
			  return lookUp(pos,l);
		      });
}

function nbrsScore(nbrs){
    "use strict";
    var weus = nbrs.some(function(n){
			     return n === 1;
			 }),
        they = nbrs.some(function(n){
			     return n === -1;
			 });
    if(weus){
	if(they){
	    return 0;
	}else{
	    return 1;
	}
    }else{
	if(they){
	    return -1;
	}else{
	    return 0;	    
	}
    }
}

function growTerr(pos){
    "use strict";
    //console.debug("growing...");
    var locs = allLocs,
        res = pos.clone();
    locs.forEach(function(l){
		     setMatEntry(res,l,nbrsScore(nbrsPce(l,pos)));
		 });
    return res;
}

function growTerrAll(pos){
    "use strict";
    //console.debug("growing...");
    return repeat(pos.clone(),growTerr,Math.max(numRows,numCols));
    //console.debug("..done!");
}

function birthSquare(plyr){
    "use strict";
    if(plyr === comp){
	return [0,0];
    }else{
	return [numRows-1,numCols-1];
    }
}

var bsqVal = 10;

function evalPosUncert(mat,plyr){
    "use strict";
    //console.debug("evaluating...");
    var pce = plyrPce(plyr),
        pos = mat.clone(),
        grwn, res, scr;
    pos.pop();
    grwn = growTerrAll(pos);
    res = grwn.map(function(r){
			  return r.reduce(Math.plus,0);
		      });
    scr =  pce*res.reduce(Math.plus,0);
    scr += 4*numRows*score(mat,plyr);
    if(lookUp(mat,birthSquare(plyr))===-pce){
	scr -= bsqVal;
    }
    if(lookUp(mat,birthSquare(opposite(plyr)))===pce){
	scr += bsqVal;
    }
    return scr;
}

function score(mat,plyr){
    "use strict";
    //console.debug("evaluating...");
    var pce = plyrPce(plyr),
        pos = mat.clone(),
        res;
    pos.pop();
    res = pos.map(function(r){
			  return r.reduce(Math.plus,0);
		      });
    return pce*res.reduce(Math.plus,0);
}

function gameOverQ(pos,plyr){
    "use strict";
    return repetitionQ( pos, plyr );
}


function winQ(pos,plyr){
    "use strict";
    return gameOverQ(pos,plyr) && score(pos,plyr) > 0;
}

function lossQ(mat,plyr){
     "use strict";
   return winQ(mat,opposite(plyr));
}


function drawQ(pos,plyr){
     "use strict";
   return ( gameOverQ(pos,plyr) &&  evalPosUncert(pos,plyr) === 0 );
}

function listEggs(pos,plyr){
    "use strict";
    var rnk, fle, res;
    if(plyr===comp){
	rnk = 0;
	fle = 0;
    }else{
	rnk = numRows - 1;
	fle = numCols - 1;
    }
    // var cnds = cartesianProd([rnk],numberSequence(0,numCols-1));
    // var res = cnds.filter(function(l){
    // return lookUp(pos,l)==0;
    // });

    res = [];
    if(lookUp(pos,[rnk,fle])===0){
	res.push([rnk,fle]);
    }

    return res.map(function(l){
		       return [l];
		   });
}




function movesFromPos(pos,plyr){
    "use strict";
    var eggs = listEggs(pos,plyr),
        pce = plyrPce(plyr),
        locs = allLocs.filter(function(l){
				  return lookUp(pos,l) === pce;
			      }),
        res = locs.map(function(l){
			   return movesFromLoc(pos,l,orthDirs,numRows,numCols);
		       });
    return flatten1(res).concat([[passLoc]],eggs);
}

function nbrsOf(loc){
    "use strict";
    var res = orthDirs.map(function(d){
			      return d.vectorAdd(loc);
			  });
    res = res.filter(function(l){
			 return onBoardQ(l,numRows,numCols);
		     });
    return res;
}

function countNbrEnemies(pos,loc,enm){
    "use strict";
    var nbrs = nbrsOf(loc);
    nbrs = nbrs.filter(function(l){
			   return lookUp(pos,l) === enm;
		       });
    return nbrs.length;
}


function positionFromMove(mov,pos,plyr){
    "use strict";
    var res = pos.clone(),
        pce, sx, sy, fx, fy, nbrs1, kills;
    if(mov.equal([passLoc])){
	setMatEntry(res,passLoc,lookUp(pos,passLoc)+1);
	return res;
    }
    setMatEntry(res,passLoc,10);
    pce = plyrPce(plyr);
    sx = mov[0][0];
    sy = mov[0][1];

    if(mov.length===1){
	res[sx][sy] = pce;
	mov[1] = [sx,sy];
    }else{
	fx = mov[1][0];
	fy = mov[1][1];
	
	res[sx][sy] = 0;
	res[fx][fy] = pce;
    }
	
    nbrs1 = nbrsOf(mov[1]);
    nbrs1 = nbrs1.filter(function(l){
			     return lookUp(pos,l) === - pce;
			 });
    kills = nbrs1.filter(function(l){
				 return countNbrEnemies(pos,l,pce) >= 1;
			     });
    kills.forEach(function(l){
		      setMatEntry(res,l,0);
		  });
    
    return res;
}

function poscurToDisplay(pos){
    "use strict";
    var fun = function(x){
	var res;
	if(x===1){
	    res = " \u25cf ";
	}
	else if(x===-1){
	    res = " \u25a1 ";
	}
	else if(x===0){
	    res = "    ";
	}
	else if(x===10){
	    res = "Pass";
	}
	else if(x===11){
	    res = "+Pass+";
	}
	else if(x===12){
	    res = "Ended";
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
    var res = [], i, j, row, passLst, bgcolor;
    for( i = 0; i < numRows; i++){
	row = [];
	for( j = 0; j < numCols; j++){
	    if((i===0 & j===0) || (i===numRows - 1 && j === numCols - 1)){
		   bgcolor = "white";
	       }else{
		   bgcolor = "lightgray";
	       }
	    row.push(["   ",[i,j],{'height' : 40, 'bg' : bgcolor, fontsize : 30}]);
	}
	res.push(row);
    }
    passLst = ["Pass",passLoc,{'width' : 100, 'height' : 40, 'bg' : "green"}];
    res.push([passLst]);
    return res;
}

var initBdTab = makeInitBdTab();

function makePosInit(){
    "use strict";
    var pce = plyrPce(comp),
        firstrow = makeConstantArraySimp(-pce,numCols),
        midrow = makeConstantArraySimp(0,numCols),
        lastrow = makeConstantArraySimp(pce,numCols);
    return [firstrow].concat(makeConstantArray(midrow,numRows-2),[lastrow],[[10]]);
}

var posInit = makePosInit();


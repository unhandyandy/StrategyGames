// -*-js-*-

/*jslint browser: true, devel: true, es5: true */

/*global nbrs, lookUp, setMatEntry, repeat, comp, score, opposite, 
  movesFromLoc, flatten1, onBoardQ, makeConstantArraySimp, makeConstantArray, 
  numMvs, cartesianProd, matrixTranspose, 
  setBGCols, rowLen, gameHistory, posCur, setButtonProps, numberSequence,
  mapLp */


function onBoardQ(loc,numRows,numCols){
    "use strict";
    return loc[0] >= 0 && loc[0]<numRows && loc[1] >= 0 && loc[1]<numCols;
}

function oneLine(pos,loc,dir,numRows,numCols){
    "use strict";
    var res = [],
        fin = loc.vector2Add(dir);
    while(onBoardQ(fin,numRows,numCols) && lookUp(pos,fin)===0){
	res.push([loc,fin]);
	fin = fin.vector2Add(dir);
    }
    return res;
}

function oneLineFill(pos,loc,dir,numRows,numCols){
    "use strict";
    var res = [loc],
        fin = loc.vector2Add(dir);
    while(onBoardQ(fin,numRows,numCols) && lookUp(pos,fin)===0){
	res.push(fin);
	fin = fin.vector2Add(dir);
    }
    return res;
}


var orthDirs = [[1,0],[0,1],[-1,0],[0,-1]];

var diagDirs = [[1,1],[1,-1],[-1,1],[-1,-1]];

var halfDirs = [[1,0],[1,1],[0,1],[-1,1]];

var allDirs = orthDirs.concat(diagDirs);

function nbrs(loc,dirs,numRows,numCols){
    "use strict";
    var res = mapLp( dirs, function(d){
			   return loc.vector2Add(d);
		       });
    return res.filter(function(l){
			  return onBoardQ(l,numRows,numCols);
		      });
}

function diagDist(l1,l2){
    "use strict";
    var del = l1.vectorMinus(l2);
    del = mapLp( del, Math.abs);
    return Math.max.apply(null,del);
}

function movesFromLoc(pos,loc,dirs,numRows,numCols){
    "use strict";
    var res = dirs.map(function(dir){
			      return oneLine(pos,loc,dir,numRows,numCols);
			  });
    return flatten1(res);
}

function lineFillsFromLoc(pos,loc,dirs,numRows,numCols){
    "use strict";
    var res = mapLp( dirs, function(dir){
			      return oneLineFill(pos,loc,dir,numRows,numCols);
			  });
    return res;
}


function makeAllLocs(numRows,numCols){
    "use strict";
    return cartesianProd(numberSequence(0,numRows-1),numberSequence(0,numCols-1));
}

function makeAllLines(numRows,numCols,len){
    "use strict";
    var locs = makeAllLocs(numRows,numCols),
        row = makeConstantArraySimp(0,numCols),
        pos = makeConstantArray(row,numRows),
        res = mapLp( locs, function(l){
				    return lineFillsFromLoc(pos,l,halfDirs,numRows,numCols);
				});
    res = flatten1(res);
    res = res.filter(function(l){
			 return l.length >= len;
		     });
    return mapLp( res, function(ln){
		       return ln.slice(0,len);
		   });
}


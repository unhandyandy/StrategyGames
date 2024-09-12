// -*-js-*-

/*jslint browser: true, devel: true, es5: true */

/*global nbrs, lookUp, setMatEntry, repeat, comp, score, opposite, 
  movesFromLoc, flatten1, onBoardQ, makeConstantArraySimp, makeConstantArray, 
  numMvs, cartesianProd, matrixTranspose, 
  setBGCols, rowLen, gameHistory, posCur, setButtonProps, numberSequence,
  mapLp */

// check whether loc is a legal square
function onBoardQ(loc,numRows,numCols){
    "use strict";
    return loc[0] >= 0 && loc[0]<numRows && loc[1] >= 0 && loc[1]<numCols;
}

// list of all legal moves in direction dir from given loc
function oneLine(pos,loc,dir,numRows,numCols,captureQ){
    "use strict";
    if(captureQ===undefined){
        captureQ=false; }
    var res = [],
        fin = loc.vector2Add(dir);
    while(onBoardQ(fin,numRows,numCols) && lookUp(pos,fin)===0){
	res.push([loc,fin]);
	fin = fin.vector2Add(dir);
    }
    if(captureQ && onBoardQ(fin,numRows,numCols)){
        res.push([loc,fin]); }
    return res;
}

// list of all empty squares in direction dir contiguous from loc 
function oneLineFill(pos,loc,dir,numRows,numCols,captureQ){
    "use strict";
    if(captureQ===undefined){
        captureQ=false; }
    var res = [loc],
        fin = loc.vector2Add(dir);
    while(onBoardQ(fin,numRows,numCols) && lookUp(pos,fin)===0){
	res.push(fin);
	fin = fin.vector2Add(dir);
    }
    if(captureQ && onBoardQ(fin,numRows,numCols)){
        res.push(fin); }
    return res;
}


var orthDirs = [[1,0],[0,1],[-1,0],[0,-1]];

var diagDirs = [[1,1],[1,-1],[-1,1],[-1,-1]];

var halfDirs = [[1,0],[1,1],[0,1],[-1,1]];

var allDirs = orthDirs.concat(diagDirs);

// get nbr squares of loc
function nbrs(loc,dirs,numRows,numCols){
    "use strict";
    var res = mapLp( dirs, function(d){
			   return loc.vector2Add(d);
		       });
    return res.filter(function(l){
			  return onBoardQ(l,numRows,numCols);
		      });
}

// L-inf distance
function diagDist(l1,l2){
    "use strict";
    var del = l1.vectorMinus(l2);
    del = mapLp( del, Math.abs);
    return Math.max.apply(null,del);
}

// list legal moves from loc along given dirs
function movesFromLoc(pos,loc,dirs,numRows,numCols,captureQ){
    "use strict";
    if(captureQ===undefined){
        captureQ=false; }
    var res = mapLp(dirs,function(dir){
	return oneLine(pos,loc,dir,numRows,numCols,captureQ);
			  });
    return flatten1(res);
}

// list legal destination squares from loc along given dirs,
// grouped by dir
function lineFillsFromLoc(pos,loc,dirs,numRows,numCols){
    "use strict";
    var res = mapLp( dirs, function(dir){
			      return oneLineFill(pos,loc,dir,numRows,numCols);
			  });
    return res;
}

// list all locs
function makeAllLocs(numRows,numCols){
    "use strict";
    return cartesianProd(numberSequence(0,numRows-1),numberSequence(0,numCols-1));
}

// list all lines of length at least len, grouped by dir
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

function betweenLocs(l1,l2){
    "use strict";
    let x1 = l1[0];
    if(x1===l2[0]){
        let ys = numberSequence(l1[1],l2[1]).slice(0,-1);
        return ys.map(y => [x1,y]); }
    else{
        let xs = numberSequence(l1[0],l2[0]).slice(0,-1);
        return xs.map(x => [x,l1[1]]); }
}

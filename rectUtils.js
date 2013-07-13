function onBoardQ(loc,numRows,numCols){
    return loc[0] >= 0 && loc[0]<numRows && loc[1] >= 0 && loc[1]<numCols;
};

function oneLine(pos,loc,dir,numRows,numCols){
    var res = [];
    var fin = loc.vectorAdd(dir);
    while(onBoardQ(fin,numRows,numCols) && lookUp(pos,fin)==0){
	res.push([loc,fin]);
	fin = fin.vectorAdd(dir);
    };
    return res;
};

function oneLineFill(pos,loc,dir,numRows,numCols){
    var res = [loc];
    var fin = loc.vectorAdd(dir);
    while(onBoardQ(fin,numRows,numCols) && lookUp(pos,fin)==0){
	res.push(fin);
	fin = fin.vectorAdd(dir);
    };
    return res;
};


var orthDirs = [[1,0],[0,1],[-1,0],[0,-1]];

var diagDirs = [[1,1],[1,-1],[-1,1],[-1,-1]];

var halfDirs = [[1,0],[1,1],[0,1],[-1,1]];

var allDirs = orthDirs.concat(diagDirs);

function nbrs(loc,dirs,numRows,numCols){
    var res = dirs.map(function(d){
			   return loc.vectorAdd(d);
		       });
    return res.filter(function(l){
			  return onBoardQ(l,numRows,numCols);
		      });
};

function diagDist(l1,l2){
    var del = l1.vectorMinus(l2);
    del = del.map(Math.abs);
    return Math.max.apply(null,del);
};

function movesFromLoc(pos,loc,dirs,numRows,numCols){
    var res = dirs.map(function(dir){
			      return oneLine(pos,loc,dir,numRows,numCols);
			  });
    return flatten1(res);
};

function lineFillsFromLoc(pos,loc,dirs,numRows,numCols){
    var res = dirs.map(function(dir){
			      return oneLineFill(pos,loc,dir,numRows,numCols);
			  });
    return res;
};


function makeAllLocs(numRows,numCols){
    return cartesianProd(numberSequence(0,numRows-1),numberSequence(0,numCols-1));
};

function makeAllLines(numRows,numCols,len){
    var locs = makeAllLocs(numRows,numCols);
    var row = makeConstantArraySimp(0,numCols);
    var pos = makeConstantArray(row,numRows);
    var res = locs.map(function(l){
				    return lineFillsFromLoc(pos,l,halfDirs,numRows,numCols);
				});
    res = flatten1(res);
    res = res.filter(function(l){
			 return l.length >= len;
		     });
    return res.map(function(ln){
		       return ln.slice(0,len);
		   });
};


//-*-js-mode-*-

function plyrPce(plyr){
    return 3 - 2*plyr;
};

var numCols = 5;
var numRows = 5;

var passLoc = [numRows,0];


var allLocs = cartesianProd(numberSequence(0,numRows-1),numberSequence(0,numCols-1));

var midRowN = Math.floor(numRows/2+.5);
var midColN = Math.floor(numCols/2+.5);

function nbrsPce(loc,pos){
    var res = nbrs(loc,orthDirs,numRows,numCols);
    return res.map(function(l){
			  return lookUp(pos,l);
		      });
};

function nbrsScore(nbrs){
    var weus = nbrs.some(function(n){
			     return n == 1;
			 });
    var they = nbrs.some(function(n){
			     return n == -1;
			 });
    if(weus){
	if(they){
	    return 0;
	}else{
	    return 1;
	};
    }else{
	if(they){
	    return -1;
	}else{
	    return 0;	    
	};
    };
};

function growTerr(pos){
    //console.debug("growing...");
    var locs = allLocs;
    var res = pos.clone();
    locs.forEach(function(l){
		     setMatEntry(res,l,nbrsScore(nbrsPce(l,pos)));
		 });
    return res;
};

function growTerrAll(pos){
    //console.debug("growing...");
    return repeat(pos.clone(),growTerr,Math.max(numRows,numCols));
    //console.debug("..done!");
};

function birthSquare(plyr){
    if(plyr == comp){
	return [0,0];
    }else{
	return [numRows-1,numCols-1];
    };
};

var bsqVal = 10;

function evalPosUncert(mat,plyr){
    //console.debug("evaluating...");
    var pce = plyrPce(plyr);
    var pos = mat.clone();
    pos.pop();
    var grwn = growTerrAll(pos);
    var res = grwn.map(function(r){
			  return r.reduce(Math.plus,0);
		      });
    var scr =  pce*res.reduce(Math.plus,0);
    scr += 4*numRows*score(mat,plyr);
    if(lookUp(mat,birthSquare(plyr))==-pce){
	scr -= bsqVal;
    };
    if(lookUp(mat,birthSquare(opposite(plyr)))==pce){
	scr += bsqVal;
    }
    return scr;
};

function score(mat,plyr){
    //console.debug("evaluating...");
    var pce = plyrPce(plyr);
    var pos = mat.clone();
    pos.pop();
    var res = pos.map(function(r){
			  return r.reduce(Math.plus,0);
		      });
    return pce*res.reduce(Math.plus,0);
};

function gameOverQ(pos,plyr){
    return lookUp(pos,passLoc) == 12;
};


function winQ(pos,plyr){
    return gameOverQ(pos,plyr) && score(pos,plyr) > 0;
};

function lossQ(mat,plyr){
    return winQ(mat,opposite(plyr));
};


function drawQ(pos,plyr){
    return gameOverQ(pos,plyr) &&  evalPosUncert(pos,plyr) == 0;
};

function listEggs(pos,plyr){
    var rnk;
    var fle;
    if(plyr==comp){
	rnk = 0;
	fle = 0;
    }else{
	rnk = numRows - 1;
	fle = numCols - 1;
    };
    // var cnds = cartesianProd([rnk],numberSequence(0,numCols-1));
    // var res = cnds.filter(function(l){
    // 		    return lookUp(pos,l)==0;
    // 		});

    var res = [];
    if(lookUp(pos,[rnk,fle])==0){
	res.push([rnk,fle]);
    };

    return res.map(function(l){
		       return [l];
		   });
};




function movesFromPos(pos,plyr){
    var eggs = listEggs(pos,plyr);
    var pce = plyrPce(plyr);
    var locs = allLocs.filter(function(l){
				  return lookUp(pos,l) == pce;
			      });
    var res = locs.map(function(l){
			   return movesFromLoc(pos,l,orthDirs,numRows,numCols);
		       });
    return flatten1(res).concat([[passLoc]],eggs);
};

function nbrsOf(loc){
    var res = orthDirs.map(function(d){
			      return d.vectorAdd(loc);
			  });
    res = res.filter(function(l){
			 return onBoardQ(l,numRows,numCols);
		     });
    return res;
}

function countNbrEnemies(pos,loc,enm){
    var nbrs = nbrsOf(loc);
    nbrs = nbrs.filter(function(l){
			   return lookUp(pos,l) == enm;
		       });
    return nbrs.length;
};


function positionFromMove(mov,pos,plyr){
    var res = pos.clone();
    if(mov.equal([passLoc])){
	setMatEntry(res,passLoc,lookUp(pos,passLoc)+1);
	return res;
    };
    setMatEntry(res,passLoc,10);
    var pce = plyrPce(plyr);
    var sx = mov[0][0];
    var sy = mov[0][1];

    if(mov.length==1){
	res[sx][sy] = pce;
	mov[1] = [sx,sy];
    }else{
	var fx = mov[1][0];
	var fy = mov[1][1];
	
	res[sx][sy] = 0;
	res[fx][fy] = pce;
    };
	
    var nbrs1 = nbrsOf(mov[1]);
    nbrs1 = nbrs1.filter(function(l){
			     return lookUp(pos,l) == - pce;
			 });
    var kills = nbrs1.filter(function(l){
				 return countNbrEnemies(pos,l,pce) >= 1;
			     });
    kills.forEach(function(l){
		      setMatEntry(res,l,0);
		  });
    
    return res;
};

function poscurToDisplay(pos){
    var fun = function(x){
	var res;
	if(x==1){
	    res = " \u25cf ";
	}
	else if(x==-1){
	    res = " \u25a1 ";
	}
	else if(x==0){
	    res = "    ";
	}
	else if(x==10){
	    res = "Pass";
	}
	else if(x==11){
	    res = "+Pass+";
	}
	else if(x==12){
	    res = "Ended";
	};
	return res;
    };
    var bd = pos.map(function(r,i){
		   return pos[i].map(fun);
	       });
    return bd;
};

var desiredDepth = 3;

var comp = 1;

function makeInitBdTab(){
    var res = [];
    for(var i = 0; i < numRows; i++){
	var row = [];
	for(var j = 0; j < numCols; j++){
	    var bgcolor;
	    if((i==0 & j==0) || (i==numRows - 1 && j==numCols - 1)){
		   bgcolor = "white";
	       }else{
		   bgcolor = "lightgray";
	       };
	    row.push(["   ",[i,j],{'height' : 40, 'bg' : bgcolor, fontsize : 30}]);
	};
	res.push(row);
    };
    var passLst = ["Pass",passLoc,{'width' : 100, 'height' : 40, 'bg' : "green"}];
    res.push([passLst]);
    return res;
}

var initBdTab = makeInitBdTab();

function makePosInit(){
    var pce = plyrPce(comp);
    var firstrow = makeConstantArraySimp(-pce,numCols);
    var midrow = makeConstantArraySimp(0,numCols);
    var lastrow = makeConstantArraySimp(pce,numCols);
    return [firstrow].concat(makeConstantArray(midrow,numRows-2),[lastrow],[[10]]);
};

var posInit = makePosInit();


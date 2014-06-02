//-*- js-mode -*-

/*jslint browser: true, devel: true, es5: true */
/*global matrixTranspose, opposite, flatten1, cartesianProd, comp, postMessage */


function diags(mat){
    "use strict";
    var res, fun = function(loc){
	return ( mat[loc[0]][loc[1]] );
    };
    res = [[[0,0],[1,1],[2,2]].map(fun),
	   [[0,2],[1,1],[2,0]].map(fun)];
    return( res );    
}

function linesOfMat(mat){
    "use strict";
    return mat.concat(matrixTranspose(mat),diags(mat));
}



// This is a required function.  
// It takes two arguments:
//     mat = board position which is neither an immediate win nor loss;
//     plyr = current player to move (either 1 or 2).
// It returns the estimated value of the position to the player on move.
// An immediate win is 100000, an immediate loss is -100000.
// Here I don't try to do anything clever: any "uncertain" position is simply assigned a value of 0.
// Tic-tac-toe is so simple we can rely on a brute minimax search to handle everything.
function evalPosUncert(mat,plyr){
    "use strict";
    return 0;
}


// This is a required function.  
// It takes two arguments:
//     mat = board position;
//     plyr = current player to move (either 1 or 2).
// It returns a Boolean value according to whether the position is a win for the player on move.
function winQ(mat,plyr){
    "use strict";
    var lns = linesOfMat(mat),
        winpce = 3 - 2*plyr,
        winrow = [winpce,winpce,winpce];
    return lns.has(winrow);
}


// This is a required function.  
// It takes two arguments:
//     mat = board position;
//     plyr = current player to move (either 1 or 2).
// It returns a Boolean value according to whether the position is a loss for the player on move.
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


// This is a required function.  
// It takes two arguments:
//     mat = board position;
//     plyr = current player to move (either 1 or 2).
// It returns a Boolean value according to whether the position is a draw.
function drawQ(mat,plyr){
    "use strict";
    return numMvs(mat) === 9 && !winQ(mat,plyr) && !lossQ(mat,plyr);
}

function gameOverQ( mat, plyr ){
    "use strict";
    return winQ(mat,plyr) || lossQ(mat,plyr) || drawQ(mat,plyr);
}



// This is a required function.  
// It takes two arguments:
//     pos = board position;
//     plyr = current player to move (either 1 or 2).
// It returns a list (array) of the possible moves in the given position by the player.
function movesFromPos(pos,plyr){
    "use strict";
    var mvs = cartesianProd([0,1,2],[0,1,2]);
    mvs = mvs.filter(function(loc){
			  return pos[loc[0]][loc[1]] === 0;
		      });
    return mvs.map(function(l){
		       return [l]
		       ;});
}


// This is a required function.  
// It takes three arguments:
//     mov = a possible move;
//     pos = board position;
//     plyr = current player to move (either 1 or 2).
// It returns the position resulting from the given move by the given player in the given starting position.
function positionFromMove(mov,pos,plyr){
    "use strict";
    var pscp = pos.clone(),
        loc = mov[0],
        pce = 3 - 2*plyr;
    pscp[loc[0]][loc[1]] = pce;
    return pscp;
}


// This is a required function.  
// It takes one argument:
//     pos = board position;
// It returns a table (array of arrays) in which each entry is the display string for the corresponding square of the board.
function poscurToDisplay(pos){
    "use strict";
    var bd, fun = function(x){
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
    };
    bd = pos.map(function(r,i){
		   return pos[i].map(fun);
	       });
    return bd;
}


// This is a required variable.
// It represents the default search depth.  
var desiredDepth = 3;



function makeInitBdTab(){
    "use strict";
    var i, j, res = [], row;
    for( i = 0; i < 3; i++){
	row = [];
	for( j = 0; j<3; j++){
	    row.push(["   ",[i,j],{'height' : 40}]);
	}
	res.push(row);
    }
    return res;
}

// This is a required variable whose value is a table (array of arrays) representing the initial board position (i.e. at the start of the game).
// The format for each entry, which represents an individual square on the board, is list (array) whose entries are as follows:
// 0) string to display in the square;
// 1) list of the coordinates of the square in the board;
// 2) options in the form of an object, or associative list.
//    Options supported include 'height', 'width', 'fg' (foreground color), and 'bg' (background color).
var initBdTab = makeInitBdTab();


var posInit = [[0,0,0],[0,0,0],[0,0,0]];

//required function which returns a table, 
// each entry of which is the code for the 
// state of the corresponding square on the board.  
// For Tic-tac-toe I use
//  empty :  0
//      X :  1
//      O : -1.
function makePosInit(){
    "use strict";
    var pce = "O";
    if(comp===1){
	pce = "X";
    }
    postMessage("You are "+pce+" in this game.");
    return posInit;
}

GameBoard.js (V 0.1.0)
============

Library of javascript functions that makes HTML5 canvas easy to interact with for building grid based web games.

Features:
=========
- Divides HTML5 Canvas into easy to interact with blocks.
- Detects block collisions (character colliding with wall)
- Quick resizing of canvas element (percent and pixel based)

Coming Soon:
============
- Collision detection within blocks on the pixel level
- Block-to-move-to based on keypress events

Example Code:
=============

	var canvas = document.getElementById("board");
	/*last two parameters are how many blocks you want
	* the board to be divided into, width and height 
	* respectively 
	*/
    var gameBoard = new GameBoard(canvas, 5, 5);
    /*Resizes canvas with a width of 500px and 
    * a height of 1000px.
    */
    gameBoard.resizeCanvas(500, 1000, false);
    /*Resizes canvas to 1.5 times it's original
    * width and height.
    */
    gameBoard.resizeCanvas(1.5, 1.5, true);
    /* Gets position in canvas grid system. */
    var block = gameBoard.getBlockPosition(50, 100);
    var xBlock = block.getXBlock();
    var yBlock = block.getYBlock();

    /*Check for block collision between two sets of
    * coordintes on the canvas.
    */
    if(gameBoard.checkBlockCollision(50, 100, 78, 45){
    	//code
    }else{
    	//do something else
    }

    gameBoard.img.src = "FILENAME_HERE";
    gameBoard.img.onload = function(){
    	//Draw to the canvas here.
    }

NOTE: The grid system is labeled with blocks (0,0) in the upper left corner.
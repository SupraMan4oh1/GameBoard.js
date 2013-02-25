/**
 * GameBoard.js v0.1.0
 * http://github.com/shadowthekid/GameBoard.js
 * 
 * Copyright Brendan Conron
 * Released under the MIT license.
 */

/*game board object
* can is the canvas object
* x and y are the number of grids that the width and height
* respectively are represented in.
*/
function GameBoard(can, x, y){
	this.context = can.getContext("2d");
	var canvas = can;
	var height = can.height;
	var width = can.width;
	var widthBlocks = x;
	var heightBlocks = y;
	var totalBlocks = x*y;
	var xPixelsPerBlock = this.getCanvasWidth()/this.getWidthBlocks();
	var yPixelsPerBlock = this.getCanvasHeight()/this.getHeightBlocks();
	this.img = new Image();
	var that = this;
	/*Array for end-user to modify as they please. Typically
	* used to store the board as a collection of Block objects.
	*/ 
	this.blocksBoard = [[]];
	/*getters*/
	this.isCanvasSupported = function(){
		return canvas.getContext ? true : false;
	};
	this.getCanvas = function(){
		return canvas;
	};
	this.getCanvasHeight = function(){
		return height;
	};
	this.getCanvasWidth = function(){
		return width;
	};
	this.getWidthBlocks = function(){
		return widthBlocks;
	};
	this.getHeightBlocks = function(){
		return heightBlocks;
	};
	/*setters and private helper functions*/
	var setCanvasWidth = function(w, percent){
		percent ? width*=w : width = w;
		canvas.width = width;
	};
	var setCanvasHeight = function(h, percent){
		percent ? height = h*height : height = h;
		canvas.height = height;
	};
	this.setWidthBlocks = function(wb){
		widthBlocks = wb;
	};
	this.setHeightBlocks = function(hb){
		heightBlocks = hb;
	};
	this.getXPixelsPerBlock = function(){
		return xPixelsPerBlock;
	};
	this.getYPixelsPerBlock = function(){
		return yPixelsPerBlock;
	};
	/*Resize the canvas. X and Y are new dimensions in pixels. 
	* If percent == true, X and Y are treated as percents and the
	* the canvas will be resized based on those*/
	this.resizeCanvas = function(w, h, percent){
		setCanvasWidth(w, percent);
		setCanvasHeight(h, percent);
	};
	/*Takes in an x and y coordinate. Returns 
	* block coordinate object*/
	this.getBlockPosition = function(x, y){
		return new Block(Math.floor(xPixelsPerBlock), Math.floor(yPixelsPerBlock));
	};
	/*Pass in x,y coordinates of two objects (or future positions)
	 * to check to see if they exist in the same block. If yes, then
	 * collision.
	 * NOTE: Only checks for block to block collision. For
	 * collisions within blocks based on pixels and object widths, well
	 * wait for verision 1.1.*/
	this.checkBlockCollision = function(x1, y1, x2, y2){
		var block1 = that.getBlockPosition(x1, y1);
		var block2 = that.getBlockPosition(x2, y2);
		if(block1.getXBlock() === block2.getXBlock() && block1.getYBlock === block2.getYBlock)
			return true;
		return false;
	};
	this.checkPixelCollision = function(x1, y1, x2, y2, obj1Width, obj1Height, obj2Witdh, obj2Height){
		if(doIntersectX(x1, x2, obj1Width, obj2Witdh) && doIntersectY(y1, y2, obj1Height, obj2Height)) return true;
		return false;
	};
		/*private helper function*/
	var doIntersectX = function(x1, x2, obj1W, obj2W){
		if((x2 >= x1) && (x2 <= (x1+obj1W))) return true;
		if((x1 >= x2) && (x1 <= (x2+obj2W))) return true; return false;
	};
	var doIntersectY = function(y1, y2, obj1H, obj2H){
		if((y2 >= y1) && (y2 <= (y1+obj1H))) return true;
		if((y1 >= y2) && (y1 <= (y2+obj2H))) return true;
		return false;
	};
	function Block(x, y){
		var xBlock = x;
		var yBlock = y;
		/*Use ranges for more control in custom collision detecting*/ 
		var lowX = that.xPixelsPerBlock*this.getXBlock();
		var highX = that.xPixelsPerBlock*(this.getXBlock()+1);
		var lowY = that.yPixelsPerBlock*this.getYBlock();
		var highY = that.yPixelsPerBlock*(this.getYBlock()+1);
		/*Sets x and y ranges of coordinates based 
		* on block coordinates*/
		this.getXBlock = function(){
			return xBlock;
		};
		this.getYBlock = function(){
			return yBlock;
		};
		this.getLowX = function(){
			return lowX;
		};
		this.getHighX = function(){
			return highX;
		};
		this.getLowY = function(){
			return lowY;
		};
		this.getHighY = function(){
			return highY;
		};
		/*Coordinates of two objects in the same block. Note, 
		* these are the coordinates of the top left corner,
		* not the center of the image */
	};
}

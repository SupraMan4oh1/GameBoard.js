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
	var context = can.getContext("2d");
	var canvas = can;
	var height = can.height;
	var width = can.width;
	var widthBlocks = x;
	var heightBlocks = y;
	var totalBlocks = x*y;
	var that = this;
	/*getters*/
	this.getContext = function(){
		return context;
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
		var xPixelsPerBlock = width/widthBlocks;
		var yPixelsPerBlock = height/heightBlocks;
		var block = new Block(Math.floor(x/xPixelsPerBlock), Math.floor(y/yPixelsPerBlock));
		return block;
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
	function Block(x, y){
		var xBlock = x;
		var yBlock = y;
		/*Use ranges for more control in custom collision detecting*/ 
		var lowX;
		var highX;
		var lowY;
		var highY;
		/*Sets x and y ranges of coordinates based 
		* on block coordinates*/
		this.setRanges = function(){
			var xPixels = width/widthBlocks;
			var yPixels = height/heightBlocks;
			lowX = xPixels*xBlock;
			highX = xPixels*(xBlock+1);
			lowY = yPixels*yBlock;
			highY = yPixels*(yBlock+1);
		};
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
	};
}

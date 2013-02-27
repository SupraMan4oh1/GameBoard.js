/**
 * GameBoard.js v0.1.3
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
var GameBoard = (function(){
	var constr = function(canv, x, y){
		this.context = canv.getContext("2d");
		document.onkeydown = function(e){

			switch(utility.checkInt(e.keyCode)){
				case 37:
					//this.move("left");
					console.log(e.keyCode);
					break;
				case 38:
					//this.move("up");
					console.log(e.keyCode);
					break;
				case 39:
					//this.move("right");
					console.log(e.keyCode);
					break;
				case 40:
					//this.move("down");
					console.log(e.keyCode);
					break;
				default:
					break;
			}
		};	
		var canvas = canv;
		var height = canvas.height;
		var width = canvas.width;
		var widthBlocks = utility.checkInt(x);
		var heightBlocks = utility.checkInt(y);
		var totalBlocks = x*y;
		var that = this;
		//public for this instance
		this.img = new Image();
		this.move = function(dir){

		};
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
		/*variables and methods relating to the number of pixels per block*/
		var xPixelsPerBlock = this.getCanvasWidth()/this.getWidthBlocks();
		var yPixelsPerBlock = this.getCanvasHeight()/this.getHeightBlocks();
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
		/*Coordinates of two objects in the same block. Note, 
		* these are the coordinates of the top left corner,
		* not the center of the image 
		*/
		this.checkPixelCollision = function(canvasObj1, canvasObj2){
			if(doIntersectX(canvasObj1.getObjX(), canvasObj2.getObjX(), canvasObj1.getObjWidth(), 
				canvasObj2.getObjWidth()) && doIntersectY(canvasObj1.getObjY(), canvasObj2.getObjY(), canvasObj1.getObjHeight(), canvasObj2.getObjHeight())) return true;
			return false;
		};
			/*private helper function*/
		var doIntersectX = function(x1, x2, obj1W, obj2W){
			if((x2 >= x1) && (x2 <= (x1+obj1W))) return true;
			if((x1 >= x2) && (x1 <= (x2+obj2W))) return true; 
			return false;
		};
		var doIntersectY = function(y1, y2, obj1H, obj2H){
			if((y2 >= y1) && (y2 <= (y1+obj1H))) return true;
			if((y1 >= y2) && (y1 <= (y2+obj2H))) return true;
			return false;
		};
		/* Block-structor */
		this.Block = function(x, y){
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
		};
		this.originForBlock = function(x, y) {
			if(doesExistWithinBoard(x,y))  
				return new Point((x%xPixelsPerBlock)*xPixelsPerBlock, (y%yPixelsPerBlock)*yPixelsPerBlock);
			return -1;
		};
		var doesExistWithinBoard = function(x, y){
			return (x <= width && x >= 0)&&(y <= height && y >= 0)?true:false;
		};
		this.originToCenterFrameInBlock = function(frame, x, y) {

		};
		this.views = [];
		this.addView = function (view) {
			this.views.push(view);
		};
		this.removeView = function (view) {
			/* filters out the value to remove */
			this.views = this.views.filter(function (v) {
				return !(v===view);
			})
		}
		/* Calls f on all the elems of the list that pass p and implement f */
		var apply = function (f, p, list) {
			for (var i in list) {
				if (p(i) === true && p.f != undefined && typeof p.f === 'function') {
					p.f();
				}
			}
		};
		/* Calls the user's collision callback if the view's frame shares any 
		   common pixels with any other frames in the GameBoard */
		var handleCollisionsForView = function (view) {
			views.forEach(function(elem, index, array) {
				if (view.frame.hitTest(elem) == true) {
					return this.collisionCallback(view, elem);
				}
			});
		}
		this.draw = function(p) {
			apply(draw, p, views);
		}

		this.move = function(p) {
			apply(move, p, views);
			this.views.forEach(handleCollisionsForView, this); 
			/* ^^ Dont need to call this on every view, just the ones moved */
		}
	};
	return constr;
}());

/* Constructors for types used in the GameBoard */
var Point = (function(){
	var constr = function(x, y){
		this.x = utility.checkInt(x);
		this.y = utility.checkInt(y);
	};
	return constr;
}());

var Size = (function(){
	var constr = function(width, height){
		this.width = utility.checkInt(width);
		his.height = utility.height(height);
	};
	return constr;
}());

var Frame = (function(){
	var constr = function(origin, size){
		this.origin = origin;
		this.size = size;
		this.lr = new Point(origin.x + size.width, origin.y + size.height);
		/* Returns true if the two frames share any common pixels */
		this.hitTest = function (frame) {
			var isInInterval = function (x, min, max) {
				return (x >= min && x <= max);
			};
			var containsPoint = function (frame, p) {
				return (isInInterval(p.x, frame.origin.x, frame.lr.x) && isInInterval(p.y, frame.origin.y, frame.lr.y));
			};
			return containsPoint(this, frame.origin) || containsPoint(this, frame.lr) || 
				   containsPoint(this, new Point(frame.origin.x, frame.lr.y)) || containsPoint(this, new Point(frame.lr.x, frame.origin.y));
		};
	};
	return constr;
}());

var utility = {
	checkInt : function (x) { // inner function
        if (x % 1 !== 0) {
            throw new TypeError(x + " is not an integer"); // throw an exception
        }
        return x;
    }
}



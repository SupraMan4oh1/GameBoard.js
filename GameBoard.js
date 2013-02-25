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
	var setCanvasWidth = function(w){
		width = w;
		canvas.width = w;
	};
	var setCanvasHeight = function(h){
		height = h;
		canvas.height = h;
	};
	this.setWidthBlocks = function(wb){
		widthBlocks = wb;
	};
	this.setHeightBlocks = function(hb){
		heightBlocks = hb;
	};

	this.resizeCanvas = function(w, h){
		setCanvasWidth(w);
		setCanvasHeight(h);
	}

}
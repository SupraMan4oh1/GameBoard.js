function GameBoard(can, x, y){
	var context = can.getContext("2d")f;
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
	/*setters*/
	/*private helper functions*/
	var setCanvasWidth = function(w){
		width = w;
	};
	var setCanvasHeight = function(h){
		height = h;
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
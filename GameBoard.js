/**
 * GameBoard.js v2.0.0
 * http://github.com/shadowthekid/GameBoard.js
 * 
 * Copyright Brendan Conron
 * Released under the MIT license.
 */

/*2d context of cavnas*/
GameBoard.prototype.context = function(){
	return document.getElementById('gameboard').getContext('2d');
};

/*Canvas object*/
GameBoard.prototype.canvas = function(){
	return document.getElementById('gameboard');
};

/*assumes first argument is always the width*/
GameBoard.prototype.resize = function(){
	if(arguments.length === 1) this.canvas().width = arguments[0];
	else if(arguments.length > 1){this.canvas().width = arguments[0]; this.canvas().height = arguments[1];}
	else return;
};

/*Totally just for kicks. This is a sick principle though. Just like 8th grade math. Oh nostalgia*/
GameBoard.prototype.drawCurves = function(num){
	var ctx = this.context();
	var that = this;
	var rand = Math.floor(Math.random()*256);
   	var rand2 = Math.floor(Math.random()*256);
   	var rand3 = Math.floor(Math.random()*256);
	num > this.canvas().height ? num = that.canvas().height : num = num;
	(function myLoop (i) {          
   		setTimeout(function () {  
   			ctx.strokeStyle = "rgb(" + rand++ + "," + rand2++ + ", " + rand3++ + ")";
      		ctx.beginPath();
			ctx.moveTo(i, 0);
			ctx.lineTo(that.canvas().width, i);
			ctx.closePath();
			ctx.stroke();	                 
      	if (++i < num) myLoop(i); 
  	 }, 10);
	})(0);
};

/*View your canvas divided up into rows and columns*/
GameBoard.prototype.visualize = function(){
	var c;
	arguments.length === 1 ? c = arguments[0] : c = "#000000";
	var ctx = this.context();
	for(var i = 0; i < this.cols; i++){
		ctx.beginPath();
		ctx.moveTo(i * (this.canvas().width/this.cols), 0);
		ctx.lineTo(i * (this.canvas().width/this.cols), this.canvas().height);
		ctx.strokeStyle = c;
		ctx.closePath();
		ctx.stroke();

	}
	for(var i = 0; i < this.rows; i++){
		ctx.beginPath();
    	ctx.moveTo(0, i*(this.canvas().height/this.rows));
    	ctx.lineTo(this.canvas().width, i*(this.canvas().height/this.rows));
    	ctx.closePath();
    	ctx.stroke();
	}
};

function GameBoard(rows, columns){
	this.rows = rows;
	this.cols = columns;
};
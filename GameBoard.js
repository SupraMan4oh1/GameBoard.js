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
	if(arguments.length === 2) this.fillGrid(arguments[1]);
	arguments.length >= 1 ? c = arguments[0] : c = "#000000";
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

/*Fills the blocks*/
GameBoard.prototype.fillGrid = function(c){
	var ctx = this.context();
	ctx.fillStyle = c;
	for(var i = 0; i < this.rows; i++){
		for(var j = 0; j < this.cols; j++){
			ctx.beginPath();
			ctx.moveTo(j * (this.canvas().width/this.cols), i * (this.canvas().height/this.rows));
			ctx.lineTo(j *(this.canvas().width/this.cols) + (this.canvas().width/this.cols), i * (this.canvas().height/this.rows));
			ctx.lineTo(j * (this.canvas().width/this.cols) + (this.canvas().width/this.cols), (i+1) * (this.canvas().height/this.rows));
			ctx.lineTo(j * (this.canvas().width/this.cols), i * (this.canvas().height/this.rows) + (this.canvas().height/this.rows));
			ctx.fill();
		}
	}
};

GameBoard.prototype.addViews = function(){
	for(var i in arguments){
		this.views.push(arguments[i]);
	}
};

GameBoard.prototype.removeViews = function(){
	for(var i in arguments){
		var id = arguments[i];
		this.views = this.views.filter(function(view){
			return !(view.id === id);
		});
	}
};

function GameBoard(rows, columns){
	this.rows = rows;
	this.cols = columns;
	this.views = [];
};

/*View Object Methods*/

View.prototype.draw = function(){

};

/*Adds an animation sequence to a view. Pass in an sequence object*/
View.prototype.addSequence = function(s){
	sequence.push(s);
};

View.prototype.removeSeq = function(sequence){
	sequence = sequence.filter(function(s){
		return !(s === sequence);
	})
};
/*View object*/
function View(frame, id){
	this.frame = frame;
	this.sequence = [];
	this.id = id;
};

/*Sprite object*/
function Sprite(x, y){
	this.x = x;
	this.y = y;
};

/*Sequence object*/
function Sequence(s, d){
	this.sprite = s;
	this.duration = d;
};

/*Frame Object Methods*/

/*Returns the coordinates of the top right corner*/
Frame.prototype.tr = function(){
	return new Point(this.origin.x + this.size.w, this.origin.y);
};

/*Returns the coordinates for the lower right corner*/
Frame.prototype.lr = function(){
	return new Point(this.origin.x + this.size.w, this.origin.y + this.size.h);
};

/*Returns the coordinates for the lower left corner*/
Frame.prototype.ll = function(){
	return new Point(this.origin.x, this.origin.y + this.size.h);
};

/*Returns the coordinates for the center*/
Frame.prototype.c = function(){
	return new Point(this.origin.x + (this.size.w/2), this.origin.y + (this.size.h/2));
};

/*Frame object*/
function Frame(x,y, w, h){
	this.origin = new Point(x, y);
	this.size = new Size(w, h);
};

/*Point object*/
function Point(x, y){
	this.x = x;
	this.y = y;
}; //maybe add a declerating and accerlating method, perhaps not to the points but the frame. still, cool idea.

/*Size object*/
function Size(w, h){
	this.w = w;
	this.h = h;
	//array of side lengths maybe
}; //is it possible to draw a triangle from sprite to a canvas?
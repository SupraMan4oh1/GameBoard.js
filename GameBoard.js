/**
 * GameBoard.js v0.1.4
 * http://github.com/shadowthekid/GameBoard.js
 * 
 * Copyright Brendan Conron
 * Released under the MIT license.
 */
var img;

/*game board object
* can is the canvas object
* x and y are the number of grids that the width and height
* respectively are represented in.
*/
var GameBoard = (function(){
	var constr = function(canv, x, y, image){
		var canvas = canv;
		var ctx = canvas.getContext("2d");
		var height = canvas.height;
		var width = canvas.width;
		var widthBlocks = utility.checkInt(x);
		var heightBlocks = utility.checkInt(y);
		var totalBlocks = x*y;
		var that = this;
		var control = new Array();
		//public for this instance
		this.rotate;
		this.exclusionList = [];
		this.collisionCallback;
		this.img = image;
		this.isCanvasSupported = canvas.getContext ? true : false;
		this.getCanvas = (function(){
			return canvas;
		}());
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
		this.getBlockForPosition = function(x, y){
			return new Block(Math.floor(x/xPixelsPerBlock), Math.floor(y/yPixelsPerBlock));
		};
		/*Pass in x,y coordinates of two objects (or future positions)
		* to check to see if they exist in the same block. If yes, then
		* collision.
		*/ 
		this.checkBlockCollision = function(x1, y1, x2, y2){
			var block1 = that.getBlockForPosition(x1, y1);
			var block2 = that.getBlockForPosition(x2, y2);
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
				canvasObj2.getObjWidth()) && doIntersectY(canvasObj1.getObjY(), canvasObj2.getObjY(),
				 canvasObj1.getObjHeight(), canvasObj2.getObjHeight())) return true;
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
		this.score = {
			init: function(){
				this.points = 0;
				this.highScore = 0;
			}
		};
		this.originForBlock = function(x, y) {
			if(doesExistWithinBoard(x,y))  
				return new Point((x%xPixelsPerBlock)*xPixelsPerBlock, (y%yPixelsPerBlock)*yPixelsPerBlock);
			return -1;
		};
		var doesExistWithinBoard = function(x, y){
			return (x <= width && x >= 0)&&(y <= height && y >= 0)?true:false;
		};
		this.views = [];
		this.backgrounds = [];
		this.addBackground = function(background){
			this.backgrounds.push(utility.checkBackground(background));
		};
		this.addView = function (view) {
			this.views.push(utility.checkView(view));
		};
		this.removeView = function (view) {
			/* filters out the value to remove */
			that.views = that.views.filter(function (v) {
				return !(v===view);
			});
		};
		/* Calls f on all the elems of the list that pass p and implement f */
		var apply = function (f, p, list) {
			for (var i in list) {
				if (p(list[i]) === list[i] && list[i][f] != undefined && typeof list[i][f] === 'function')
					list[i][f]();
			}
		};
		var itemInExlusion = function(view){
			for(var i in that.exclusionList){
				if(that.exclusionList[i] === view.id) return true;
			}
			return false;
		};
		/* Calls the user's collision callback if the view's frame shares any 
		   common pixels with any other frames in the GameBoard */
		var handleCollisionsForView = function (view) {
			that.views.forEach(function(elem, index, array) {
				if (view.frame.hitTest(elem.frame) === true && itemInExlusion(utility.checkView(elem)) === false){
					return that.collisionCallback(view, elem);
				}
			});
		};
		this.addToList = function(){
			for(var i in arguments){
				that.exclusionList.push(arguments[i]);
			}
		};
		this.draw = function(p, list) {
			apply("draw", p, list);
		};
		this.moveViews = function(p, list) {
			apply("move", p, list);
			that.views.forEach(handleCollisionsForView); 
			/* ^^ Dont need to call this on every view, just the ones moved */
		};
		this.move = function(d){
			control.forEach(that.removeView);
			var x = control[0];
			if(d === "U"){
				x = control[0];
				that.rotate = new Rotation(0, "U"); //Rotations will be used in future development
				x.sr--;
				adjustControl(x, "sr");
				that.addView(x);
				that.render();
			}else if(d === "D"){
				x = control[3];
				that.rotate = new Rotation(-180, "D");
				x.sr++;
				adjustControl(x, "sr");
				that.addView(x);
				that.render();
			}else if(d === "R"){
				x = control[2];
				that.rotate = new Rotation(90, "R");
				x.sc++;
				adjustControl(x, "sc");
				that.addView(x);
				that.render();
			}else if(d === "L"){
				x = control[1];
				that.rotate = new Rotation(-90, "L");
				x.sc--;
				adjustControl(x, "sc");
				that.addView(x);
				that.render();
			}
		};
		var adjustControl = function(elem, p){
			for(var i in control){
				if(control[i] != elem)
					control[i][p] = elem[p];
			}
		};
		this.start = function(){
			if(!this.isCanvasSupported){
				alert("Canvas is not supported on your browser!");
				return;
			}
			img = new Image();
			img.onload = function(){
				setInterval(function(){
				that.render();
				}, 20);
			};
			img.src = this.img;
		};
		this.render = function(){
			ctx.save();
			ctx.clearRect(0, 0, that.getCanvasWidth(), that.getCanvasHeight());
			//ctx.globalAlpha=1; 
			apply("reset", utility.checkView, that.views);
			var tempViews = that.views.filter(function(elem, index, array){
				return (elem.sr != "-");
			});
			tempViews.forEach(snapToRow);
			tempViews.length = 0;
			tempViews = that.views.filter(function(elem, index, array){
				return (elem.sc != "-");
			});
			tempViews.forEach(snapToCol);
			that.draw(utility.checkBackground, that.backgrounds);
    		that.moveViews(utility.checkView, that.views);
			that.draw(utility.checkView, that.views);
			ctx.restore();
		};
		var snapToRow = function(elem, index, array){
			if(elem.sr === "c"){
				elem.frame.origin.y = (height/2) - (elem.frame.size.height/2);
				return;
			}
			centerOffset = yPixelsPerBlock-elem.frame.size.height;
			startingY = centerOffset/2;
			elem.frame.origin.y = startingY + (yPixelsPerBlock * utility.checkInt(elem.sr));
		};
		var snapToCol = function(elem, index, array){
			if(elem.sc === "c"){
				elem.frame.origin.x = (width/2) - (elem.frame.size.width/2);
				return;
			}
			centerOffset = xPixelsPerBlock-elem.frame.size.height;
			startingX = centerOffset/2;
			elem.frame.origin.x = startingX + (xPixelsPerBlock * utility.checkInt(elem.sc));
		};
		var check = function(elem){
			if(elem instanceof View) return true;
			return false;
		};
		this.setControl = function(c){
			control = that.views.filter(function(elem, index, array){
				return (elem.id === c);
			});
			for(var i in control)
				if(i != 0) that.removeView(control[i]);
		};
		this.getControl = function(){
			return control;
		};
		document.onkeydown = function(e){
			switch(utility.checkInt(e.keyCode)){
				case 37:
					e.preventDefault();
					that.move("L");
					break;
				case 38:
					e.preventDefault();
					that.move("U");
					break;
				case 39:
					e.preventDefault();
					that.move("R");
					break;
				case 40:
					e.preventDefault();
					that.move("D");
					break;
				default:
					break;
			}
		};
		/* Block-structor */
		var Block = (function(){
			var constr = function(x, y){
				
				var xBlock = x;
				var yBlock = y;
				/*Use ranges for more control in custom collision detecting*/ 
				var lowX = that.xPixelsPerBlock*this.getXBlock;
				var highX = that.xPixelsPerBlock*(this.getXBlock+1);
				var lowY = that.yPixelsPerBlock*this.getYBlock;
				var highY = that.yPixelsPerBlock*(this.getYBlock+1);
				this.getXBlock = (function(){
					return xBlock;
				}());
				this.getYBlock = (function(){
					return yBlock;
				}());
				this.getLowX = (function(){
					return lowX;
				}());
				this.getHighX = (function(){
					return highX;
				}());
				this.getLowY = (function(){
					return lowY;
				}());
				this.getHighY = (function(){
					return highY;
				}());
				/*Sets x and y ranges of coordinates based 
				* on block coordinates*/
			};
		    return constr;
		}());
	};
	constr.canv = function(){
		return document.getElementById('gameboard');
	};
	constr.context = function(){
		return document.getElementById("gameboard").getContext("2d");
	};
	return constr;
}());

/* Constructors for types used in the GameBoard */
var Point = (function(){
	var constr = function(x, y){
		this.x = utility.checkNum(x);
		this.y = utility.checkNum(y);
	};
	return constr;
}());

var Size = (function(){
	var constr = function(width, height){
		this.width = utility.checkInt(width);
		this.height = utility.checkInt(height);
	};
	return constr;
}());

/*View object*/
var View = (function(){
	var constr = function(f, o, i, snapRow, snapCol, v){
		this.frame = utility.checkFrame(f);
		this.orient = utility.checkOrientation(o);
		/*user identification string*/
		this.id = i;
		this.sr = snapRow;
		this.sc = snapCol;
		this.v = v;
		var self = this;
		var adjustForScale = (function(){
			self.frame.size.width *= self.orient.widthScale;
			self.frame.size.height *= self.orient.heightScale;
		}());
		this.draw = function(){
			GameBoard.context().drawImage(img, self.orient.tl, self.orient.tr, self.orient.dw, 
				self.orient.dh, self.frame.origin.x, self.frame.origin.y, self.frame.size.width, 
				self.frame.size.height*self.orient.heightScale);
		};
		this.move = function(){
			if(self.v != undefined){
				if(self.v.d === "R"){
					self.sc = "-";
					self.frame.origin.x += self.v.s;
				}
				if(self.v.d === "L"){
					self.sc = "-";
					self.frame.origin.x -= self.v.s;
				}
			}
		};
		this.reset = function(){
			if(v != undefined){
				if(self.v.d === "R"){
					if(self.frame.origin.x > GameBoard.canv().width){
						self.frame.origin.x = -500;
					}
				}
				if(self.v.d === "L"){
					if(self.frame.tr < GameBoard.canv().width){
						self.frame.origin.x = GameBoard.canv().width + 400;
					}
				}
			}
		};
	};
	return constr;
}());

var Velocity = (function(){
	var constr = function(d, s){
		this.d = d;
		this.s = s;
	};
	return constr;
}());

var Background = (function(){
	var constr = function(c, frame){
		this.f = frame;
		this.c = c;
		var self = this;
		this.draw = function(){
			var ctx = GameBoard.context();
			ctx.fillStyle = self.c;
			ctx.fillRect(self.f.origin.x, self.f.origin.y, self.f.size.width, self.f.size.height);
		}
	};
	return constr;
}());

var Frame = (function(){
	var constr = function(origin, size){
		this.origin = utility.checkPoint(origin);
		this.size = utility.checkSize(size);
		var self = this;
		this.lr = function(){
			return utility.checkPoint(new Point(self.origin.x + self.size.width, self.origin.y + self.size.height));
		};
		this.tr = function(){
			return utility.checkPoint(new Point(self.origin.x + self.size.width, self.origin.y));
		};
		this.ll = function(){
			return utility.checkPoint(new Point(self.origin.x, self.origin.y + self.size.height));
		};
		/* Returns true if the two frames share any common pixels */
		this.hitTest = function (frame) {
			/*var isInInterval = function (x, min, max) {
				return (x >= min && x <= max);
			};
			var containsPoint = function (frame, p) {
				return (isInInterval(p.x, frame.origin.x, frame.lr.x) && isInInterval(p.y, frame.origin.y, frame.lr.y));
			};
			return containsPoint(self, frame.origin) || containsPoint(self, frame.lr) || 
				   containsPoint(self, new Point(frame.origin.x, frame.lr.y)) || containsPoint(self, new Point(frame.lr.x, frame.origin.y));*/
			var isInXBounds = function(p){
				return (p.x >= self.origin.x && p.x <= self.tr.x);
			};
			var isInYBounds = function(p){
				return (p.y >= self.origin.y && p.y <= self.lr.y);
			};
			var isContained = function(p){
				return (isInXBounds(p) && isInYBounds(p));
			};
			return isContained(frame.origin) || isContained(frame.tr) || isContained(frame.lr) || isContained(frame.ll);
		};
	};
	return constr;
}());

/*holds sprite sheet information necessary for canvas drawing*/
var Orientation = (function(){
	var constr = function(topl, topr, drawWidth, drawHeight, ws, hs){
		this.tl = topl;
		this.tr = topr;
		this.dw = drawWidth;
		this.dh = drawHeight;
		this.widthScale = ws;
		this.heightScale = hs;
	};
	return constr;
}());

var Rotation = (function(){
	var constr = function(r, d){
		this.r = r;
		this.d = d;
	};
	return constr;
}());

var utility = {
	checkInt : function(x) { 
        if (x % 1 !== 0) 
    		utility.error(x, "is not an integer");
        return x;
    },
    checkNum : function(x){
    	if(!(typeof x === 'number'))
    		utility.error(x, "is not a number");
    	return x;
    },
    checkPoint : function(x){
    	if(!(x instanceof Point))
    		utility.error(x, "is not a Point object");
    	return x;
    },
    checkFrame : function(x){
    	if(!(x instanceof Frame))
    		utility.error(x, "is not a Point object");
    	return x;
    },
    checkSize : function(x){
    	if(!(x instanceof Size))
    		utility.error(x, "is not a Size object");
    	return x;
    },
    checkOrientation : function(x){
    	if(!(x instanceof Orientation))
    		utility.error(x, "is not an Orientation object");
    	return x;
    },	
    checkView : function(x){
    	if(!(x instanceof View))
    		utility.error(x, "is not a View object");
    	return x;
    },
    checkBackground : function(x){
    	if(!(x instanceof Background))
    		utility.error(x, "is not a Background object");
    	return x;
    },
    error : function(x, message){
    	throw new TypeError(x + " " + message);
    }
}




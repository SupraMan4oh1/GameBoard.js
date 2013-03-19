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
		var movingCounter = 0;
		//public for this instance
		this.moveSound = true;
		this.isDeath = false;
		this.deathImage = new Image();
		this.deathFile;
		this.soundFile;
		this.rotate;
		this.lives;
		this.deathHandler;
		this.deaths = 0;
		this.blockCallback = false;
		this.originalViewsState = [];
		this.originalMovableState = [];
		this.exclusionList = [];
		this.movableSet = [];
		this.needsUpdate = false;
		this.deathFun = function(){
			ctx.drawImage(that.deathImage, 0, 0, 30, 30, control[0].frame.origin.x, control[0].frame.origin.y, 100, 100);
		};
		this.doneAddingMoveSet = function(){
			addMovingElement(that.movableSet, function(){
				that.movableSet.length = 0;
			});
		};
		this.resetPlayerPiece = function(r, c){
			control.forEach(function(elem, index, array){
				elem.sr = r;
				elem.sc = c;
				elem.v = undefined;
			});
		};
		this.runtimeFunctions = [];
		this.movingElements = [];
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
		var xPixelsPerBlock = function(){
			return that.getCanvasWidth()/that.getWidthBlocks();
		};
		var yPixelsPerBlock = function(){
			return that.getCanvasHeight()/that.getHeightBlocks();
		};
		this.getXPixelsPerBlock = function(){
			return xPixelsPerBlock();
		};
		this.getYPixelsPerBlock = function(){
			return yPixelsPerBlock();
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
			return new Block(Math.floor(x/xPixelsPerBlock()), Math.floor(y/yPixelsPerBlock()));
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
			}
		};
		this.originForBlock = function(x, y) {
			if(doesExistWithinBoard(x,y))  
				return new Point((x%xPixelsPerBlock())*xPixelsPerBlock(), (y%yPixelsPerBlock())*yPixelsPerBlock());
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
		var addMovingElement = function(array, callback){
			that.movingElements.push(array.slice(0));
			callback();
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
		/*used to compare two views to see if they hit. Only for users ease*/
		/* Calls the user's collision callback if the view's frame shares any 
		   common pixels with any other frames in the GameBoard */
		var handleCollisionsForView = function (view) {
			that.views.forEach(function(elem, index, array) {
				if (view.frame.hitTest(elem.frame) === true && itemInExlusion(utility.checkView(elem)) === false && view != elem){
					return that.collisionCallback(view, elem);
				}
			});
		};
		this.retrieveViews = function(id){
			var temp = [];
			for(var i in that.views){
				if(that.views[i].id === id){
					temp.push(that.views[i]);
				}
			}
			for(var i in that.movingElements){
				for(var j in that.movingElements[i]){
					if(that.movingElements[i][j].v.id === id){
						temp.push(that.movingElements[i][j].v);
					}
				}
			}
			return temp;
		}
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
			for(var i in that.movingElements){
				for(var j in that.movingElements[i]){
					handleCollisionsForView(that.movingElements[i][j].v);
				}
			}
		};
		/*finds the cloest row to a given frame*/
		var findClosestRow = function(frame){
			var p = frame.c();
			var b = that.getBlockForPosition(p.x, p.y);
			return b.getYBlock();
		};
		var findClosestCol = function(frame){
			var p = frame.c();
			var b = that.getBlockForPosition(p.x, p.y);
			return b.getXBlock();
		};
		this.move = function(d){
			if(that.moveSound){
				var body = document.getElementById('game_div');
				var first = body.firstChild;
				var elem = document.createElement("audio");
				elem.id = "audio_tag";
				elem.setAttribute('autoplay','autoplay');
				elem.innerHTML = '<source src="assets/frogger_hop.wav" type="audio/wav">';
				body.insertBefore(elem, first);
			}
			control.forEach(that.removeView);
			var x = control[0];
			if(d === "U"){
				x = control[0];
				if(x.v != undefined || x.v != null){
					if(x.sr === "-") x.sr = findClosestRow(x.frame);
					if(x.sc === "-") x.sc = findClosestCol(x.frame);
					delete x.v;
				}
				that.rotate = new Rotation(0, "U"); //Rotations will be used in future development
				if(x.sr-1 >= 0)
					x.sr--;
				adjustControl(x, "sr");
				that.addView(x);
			}else if(d === "D"){
				x = control[3];
				if(x.v != undefined || x.v != null){
					if(x.sr === "-") x.sr = findClosestRow(x.frame);
					if(x.sc === "-") x.sc = findClosestCol(x.frame);
					delete x.v;
				}
				that.rotate = new Rotation(-180, "D");
				if(x.sr+1 <= that.getHeightBlocks()-1)
					x.sr++;
				adjustControl(x, "sr");
				that.addView(x);
			}else if(d === "R"){
				x = control[2];
				if(x.v != undefined || x.v != null){
					if(x.sr === "-") x.sr = findClosestRow(x.frame);
					if(x.sc === "-") x.sc = findClosestCol(x.frame);
					delete x.v;
				}
				that.rotate = new Rotation(90, "R");
				x.sc++;
				adjustControl(x, "sc");
				that.addView(x);
			}else if(d === "L"){
				x = control[1];
				if(x.v != undefined || x.v != null){
					if(x.sr === "-") x.sr = findClosestRow(x.frame);
					if(x.sc === "-") x.sc = findClosestCol(x.frame);
					delete x.v;
				}
				that.rotate = new Rotation(-90, "L");
				x.sc--;
				adjustControl(x, "sc");
				that.addView(x);
			}
			that.render();
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
			that.deathImage.src = that.deathFile;
			that.originalViewsState = that.views.slice(0);
			that.originalMovableState = that.movingElements.slice(0);
			img = new Image();
			img.onload = function(){
				setInterval(function(){
				that.render();
				},30);
			};
			img.src = this.img;
		};
		var isGameOver = function(){
			return that.deaths === that.lives;
		};
		var updateUILives = function(){
			var counter = 0;
			for(var i = 0; i < that.views.length; i++){
				if(that.views[i].id === "life") counter++;
			}
			var livesLeft = that.lives - that.deaths;
			var i = 0;
			while(counter >= livesLeft){
				if(that.views[i].id === "life"){
					counter--;
					that.removeView(that.views[i]);
				}
				i++;
			}
		};
		this.render = function(){
			ctx.save();
			if(!isGameOver()){
				ctx.clearRect(0, 0, that.getCanvasWidth(), that.getCanvasHeight());
				updateUILives();
				apply("reset", utility.checkView, that.views);
				for(var i in that.movingElements)
					apply('reset', utility.checkMovable, that.movingElements[i]);
				var tempViews = that.views.filter(function(elem, index, array){
					return (elem.sr != "-");
				});
				tempViews.forEach(snapToRow);
				tempViews.length = 0;
				tempViews = that.views.filter(function(elem, index, array){
					return (elem.sc != "-");
				});
				tempViews.forEach(snapToCol);
				tempViews.length = 0;
				that.movingElements.forEach(function(elem, index, array){
					for(var i in elem){
						tempViews = elem.filter(function(e, i, a){
							return (e.v.sr != "-");
						});
						for(var j in tempViews){
							snapToRow(tempViews[j].v, j, tempViews);
						}
						tempViews.length = 0;
						tempViews = elem.filter(function(e, i, a){
							return (e.v.sc != "-");
						});
						for(var j in tempViews){
							snapToCol(tempViews[j].v, j, tempViews);
						}
						tempViews.length = 0;
					}
				});
				that.draw(utility.checkBackground, that.backgrounds);
	    		that.moveViews(utility.checkView, that.views);
	    		for(var i in that.movingElements)
	    			that.moveViews(utility.checkMovable, that.movingElements[i]);
				for(var i in that.movingElements)
					that.draw(utility.checkMovable, that.movingElements[i]);
				that.draw(utility.checkView, that.views);
				movingCounter > 20 ? movingCounter = 0:movingCounter++;
				if(movingCounter === 20)
					adjustActive();
				ctx.restore();
				for(var i in that.runtimeFunctions){
					if(typeof that.runtimeFunctions[i] === 'function'){
						that.runtimeFunctions[i]();
					}
				}
				ctx.lineWidth=1;
				ctx.fillStyle="#CC00FF";
				ctx.lineStyle="#ffff00";
				ctx.font="18px sans-serif";
				ctx.fillText("Score: " + that.score.points, 0, that.getCanvasHeight() - 25);
				if(that.needsUpdate){
					for(var i in that.views){
						if(that.views[i].id === "winFrog") that.removeView(that.views[i]);
					}
					that.needsUpdate = false;
				}
				if(that.isDeath) that.deathFun();
			}else{
				ctx.lineWidth = 10;
				ctx.fillStyle = "white";
				ctx.font = "50px comic-sans";
				ctx.fillText("GAME OVER", 60, that.getCanvasHeight()/2)
			}
		};
		var adjustActive = function(){
			for(var i = 0; i < that.movingElements.length; i++){
				for(var j = 0; j < that.movingElements[i].length; j++){
					if(that.movingElements[i][j].c === true){
						that.movingElements[i][j].c = false; 
						if(j+1 < that.movingElements[i].length){
							that.movingElements[i][j+1].c = true;
						}
						else{
							that.movingElements[i][0]["c"] = true;
						}
						break;
					}
				}
			}
		};
		var snapToRow = function(elem, index, array){
			if(elem.sr === "c"){
				elem.frame.origin.y = (height/2) - (elem.frame.size.height/2);
				return;
			}
			centerOffset = yPixelsPerBlock()-elem.frame.size.height;
			startingY = centerOffset/2;
			elem.frame.origin.y = startingY + (yPixelsPerBlock() * utility.checkInt(elem.sr));
		};
		var snapToCol = function(elem, index, array){
			if(elem.sc === "c"){
				elem.frame.origin.x = (width/2) - (elem.frame.size.width/2);
				return;
			}
			centerOffset = xPixelsPerBlock()-elem.frame.size.height;
			startingX = centerOffset/2;
			elem.frame.origin.x = startingX + (xPixelsPerBlock() * utility.checkInt(elem.sc));
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
		var distance = function(point1, point2){
			return Math.sqrt(Math.pow((point2.x - point1.x), 2) + Math.pow((point2.y - point2.y), 2));
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
				var lowX = function(){
					return xPixelsPerBlock()*this.getXBlock();
				};
				var highX = function(){
					return xPixelsPerBlock()*(this.getXBlock+1);
				}
				var lowY = function(){
					return yPixelsPerBlock()*this.getYBlock();
				};
				var highY = function(){
					return yPixelsPerBlock()*(this.getYBlock+1);
				};
				this.getXBlock = function(){
					return xBlock;
				};
				this.getYBlock = function(){
					return yBlock;
				};
				this.getLowX = function(){
					return lowX();
				};
				this.getHighX = function(){
					return highX();
				};
				this.getLowY = function(){
					return lowY();
				};
				this.getHighY = function(){
					return highY();
				};
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
function Point(x, y){
	this.x = utility.checkNum(x);
	this.y = utility.checkNum(y);
};

function Size(width, height){
	this.width = utility.checkInt(width);
	this.height = utility.checkInt(height);
};

/*View object*/
View.prototype.draw = function(){
	GameBoard.context().drawImage(img, this.orient.tl, this.orient.tr, this.orient.dw, 
				this.orient.dh, this.frame.origin.x, this.frame.origin.y, this.frame.size.width, 
				this.frame.size.height);
};
View.prototype.move = function(){
	if(this.v != undefined){
		if(this.v.d === "R"){
			this.sc = "-";
			this.frame.origin.x += this.v.s;
		}
		if(this.v.d === "L"){
			this.sc = "-";
			this.frame.origin.x -= this.v.s;
		}
	}
};

View.prototype.reset = function(){
	if(this.v != undefined){
		if(this.v.d === "R"){
			if(this.frame.origin.x > GameBoard.canv().width){
				this.frame.origin.x = -this.frame.size.width - 50;
			}
		}
		if(this.v.d === "L"){
			if(this.frame.tr().x < 0){
					this.frame.origin.x = GameBoard.canv().width + this.frame.size.width + 50;
			}
		}
	}
};
View.prototype.adjustForScale = function(){
	this.frame.size.width *= this.orient.widthScale;
	this.frame.size.height *= this.orient.heightScale;
};

function View(f, o, i, snapRow, snapCol, v){
	this.frame = utility.checkFrame(f);
	this.orient = utility.checkOrientation(o);
	/*user identification string*/
	this.id = i;
	this.sr = snapRow;
	this.sc = snapCol;
	this.v = v;
	this.adjustForScale();
};
		
function Velocity(d, s){
	this.d = d;
	this.s = s;
};

Background.prototype.draw = function(){
	var ctx = GameBoard.context();
	ctx.fillStyle = this.c;
	ctx.fillRect(this.f.origin.x, this.f.origin.y, this.f.size.width, this.f.size.height);
};

function Background(c, frame){
	this.f = frame;
	this.c = c;

};

Frame.prototype.lr = function(){
	return utility.checkPoint(new Point(this.origin.x + this.size.width, this.origin.y + this.size.height));
};

Frame.prototype.tr = function(){
	return utility.checkPoint(new Point(this.origin.x + this.size.width, this.origin.y));
};

Frame.prototype.ll = function(){
	return utility.checkPoint(new Point(this.origin.x, this.origin.y + this.size.height));
};

Frame.prototype.c = function(){
	return utility.checkPoint(new Point(this.origin.x + (this.size.width/2), this.origin.y + (this.size.height/2)));
};

Frame.prototype.hitTest = function(frame){
	var that = this;
	var isInXBounds = function(p){
		return (p.x >= that.origin.x && p.x <= that.tr().x);
	};
	var isInYBounds = function(p){
		return (p.y >= that.origin.y && p.y <= that.lr().y);
	};
	var isContained = function(p){
		return (isInXBounds(p) && isInYBounds(p));
	};
	var doesOverlap = function(f){
		return ((f.origin.y <= that.origin.y && f.ll().y >= that.ll().y) && (f.origin.x >= that.origin.x && f.tr().x <= that.tr().x));
	};
	return isContained(frame.origin) || isContained(frame.tr()) || isContained(frame.lr()) || isContained(frame.ll()) || isContained(frame.c())
	|| isContained(frame.c)|| doesOverlap(frame);
};

function Frame(origin, size){
	this.origin = utility.checkPoint(origin);
	this.size = utility.checkSize(size);
};

/*holds sprite sheet information necessary for canvas drawing*/
function Orientation(topl, topr, drawWidth, drawHeight, ws, hs){
	this.tl = topl;
	this.tr = topr;
	this.dw = drawWidth;
	this.dh = drawHeight;
	this.widthScale = ws;
	this.heightScale = hs;
};

function Rotation(r, d){
	this.r = r;
	this.d = d;
};

/*canvas objects that aren't just static images being redrawn but consist of 2 or more subviews to vary their moving*/
Movable.prototype.draw = function(){
	if(this.c === true){
		GameBoard.context().drawImage(img, this.v.orient.tl, this.v.orient.tr, this.v.orient.dw, 
		this.v.orient.dh, this.v.frame.origin.x, this.v.frame.origin.y, this.v.frame.size.width, 
		this.v.frame.size.height);
	}
};

Movable.prototype.move = function(){
	if(this.v.v != undefined){
		if(this.v.v.d === "R"){
			this.v.sc = "-";
			this.v.frame.origin.x += this.v.v.s;
		}
		if(this.v.v.d === "L"){
			this.v.sc = "-";
			this.v.frame.origin.x -= this.v.v.s;
		}
	}
};

Movable.prototype.reset = function(){
	if(this.v.v != undefined){
		if(this.v.v.d === "R"){
			if(this.v.frame.origin.x > GameBoard.canv().width){
				this.v.frame.origin.x = -this.v.frame.size.width - 50;
			}
		}
		if(this.v.v.d === "L"){
			if(this.v.frame.tr().x < 0){
				this.v.frame.origin.x = GameBoard.canv().width + this.v.frame.size.width + 50;
			}
		}
	}
};

function Movable(v, c){
	this.v = v;
	this.c = c;
};

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
    checkMovable : function(x){
    	if(!(x instanceof Movable))
    		utility.error(x, "is not a Movable object");
    	return x;
    },
    error : function(x, message){
    	throw new TypeError(x + " " + message);
    }
}




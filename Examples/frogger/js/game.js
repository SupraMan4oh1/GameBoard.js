/*Global game object, makes it easily accessible*/
var frogger;
var deathImg = new Image();
$(document).ready(function(){
	game = new GameBoard(document.getElementById('gameboard'), 13, 14, "assets/frogger_sprites.png");
	frogger = game;
	frogger.deathFile = "assets/dead_frog.png";
	game.lives = 5;
	game.score.init();
	/*Frogger specific properties*/
	GameBoard.prototype.rowsForward = 0;
	GameBoard.prototype.maxRowReached = 2; //Sets max row reached by frog to 2, the starting row of the frog
	GameBoard.prototype.totalRowsHopped = 0;
	GameBoard.prototype.level = 1;
	GameBoard.prototype.frogsSaved = 0;
	GameBoard.prototype.neededToAdvance = 5;
	GameBoard.prototype.winRanges = [new Frame(new Point(8, 0), new Size(40, 30)), new Frame(new Point(97, 0), new Size(40, 30)), new Frame(new Point(185, 0), new Size(40, 30)), new Frame(new Point(271, 0), new Size(40, 30)), new Frame(new Point(358, 0), new Size(40, 30))];
	GameBoard.prototype.deathImage = "assets/dead_frog.png";
	initViews();
	game.deathHandler = deathHandler;
	initBackgrounds();
	setPlayerPiece('frog');
	game.collisionCallback = collisionHandler;
	game.addToList("border1", "border2", "life", "endzone", "logo");
	game.runtimeFunctions.push(checkInWater);
	game.runtimeFunctions.push(updateScore);
	addMovables();
	game.start();
});

/*Frogger specific functions*/

/*checks to see if the frog is colliding with anything, if no and it's above a certain height, it must be in the water. THEN IT DIES*/
function checkInWater(){
	if(!frogger.blockCallback){
		frogger.blockCallback = true;
		names = ["biglog", "littlelog", "turtle1", "turtle2", "medlog"];
		for(var i in names){
			collisions = frogger.retrieveViews(names[i]);
			for(var j in collisions){
				var piece = frogger.getControl();
				piece = piece[0];
				if(piece.sr >= 6){
					frogger.blockCallback = false;
					return;
				} 
				if(centerPointOverlaps(collisions[j].frame, piece.frame.c())){
					frogger.blockCallback = false;
					return;
				}
			}
		}
		deathHandler(unblockCallback);
	}
};

/*Updates the score*/
function updateScore(){
	var numWinFrogs = function(){
		var counter = 0;
		for(var i in frogger.views){
			if(frogger.views[i].id === "winFrog") counter++;
		}
		return counter;
	};
	var piece = frogger.getControl();
	piece = piece[0];
	var currentRow = frogger.getHeightBlocks() - piece.sr;
	if(currentRow > frogger.maxRowReached){
		frogger.maxRowReached = currentRow;
		frogger.totalRowsHopped++;
	}
	frogger.score.points = (frogger.totalRowsHopped*10) + (numWinFrogs() * 50) + ((frogger.level - 1) * 1000);
	if(numWinFrogs() === 5 && !frogger.blockCallback) increaseLevel(levelUp);
};

/*increases the level*/
function increaseLevel(levelCallback){
	frogger.level++;
	levelCallback();
};

/*updates the board to a higher difficulty when a level is reached*/
function levelUp(){
		frogger.blockCallback = true;
		for(var i in frogger.views){
			if(frogger.views[i] != undefined && (frogger.views[i].id === "car1" || frogger.views[i].id === "car2" || frogger.views[i].id === "car3" || frogger.views[i].id === "car4" || frogger.views[i].id === "truck")){
				frogger.blockCallback = true;
				frogger.views[i].v.s += 2;
			}
		}
		frogger.needsUpdate = true;	
};

/*user defined collision callback*/
function collisionHandler(view, elem){
	if((view.id === "biglog" || view.id === "littlelog" || view.id === "turtle1" || view.id === "turtle2" || view.id === "medlog") && elem.id === "frog"){
		if(elem.v === undefined){
			elem.v = new Velocity(view.v.d, view.v.s);
		}
	}
	if((view.id === "car1" || view.id === "car2" || view.id === "car3" || view.id === "car4" || view.id === "truck") && elem.id === "frog" && !frogger.blockCallback){
		frogger.deathHandler(unblockCallback);
	}
	if(view.id === "endzone" && elem.id === "frog" && !frogger.blockCallback){
		if(didPieceScore(view, elem) && isNotOccupied(elem)){
			frogger.blockCallback = true;
			placeInWinSpot(elem, unblockCallback);
			return;
		}else{
			frogger.deathHandler(unblockCallback);
		}
	}
};

/*checks if a win frog is already there*/
function isNotOccupied(elem){
	for(var i = 0; i < frogger.views.length; i++){
		if(frogger.views[i].id === "winFrog"){
			if(centerPointOverlaps(frogger.views[i].frame, elem.frame.c())) return false;
		}
	}
	return true;
};

/*checks to see if the frog is in the proper position to win*/
function didPieceScore(view, elem){
	return ((elem.sr === 0) && isInWinningRange(elem));
};

function centerPointOverlaps(frame, center){
		if(center.x >= frame.origin.x && center.x <= frame.tr().x && center.y >= frame.origin.y && center.y <= frame.ll().y) return true;
};

/*called to check if the frogs frame is in (or is close enough) to one of the five spots*/
function isInWinningRange(elem){
	for(var i in frogger.winRanges){
		if(centerPointOverlaps(frogger.winRanges[i], elem.frame.c())) return true;
	}
	return false;
};

/*places frog in endzone*/
function placeInWinSpot(elem, callback){
	var findClosestWin = function(elem){
		var dist = 10000;
		var curPoint = -1;
		for(var i in frogger.winRanges){
			if(distance(elem.frame.c(), frogger.winRanges[i].c()) < dist){
				dist = distance(elem.frame.c(), frogger.winRanges[i].c());
				curPoint = frogger.winRanges[i].origin;
			}
		}
		return curPoint;
	};
	var distance = function(point1, point2){
		return Math.sqrt(Math.pow((point2.x - point1.x), 2) + Math.pow((point2.y - point2.y), 2));
	};
	var tempPoint = findClosestWin(elem);
	var point = new Point(0, 0);
	point.x = tempPoint.x;
	point.y = tempPoint.y + 20;
	var tempView = frogger.getControl();
	var winFrame = new Frame(point, tempView[3].frame.size);
	var winView = new View(winFrame, tempView[3].orient, "winFrog", "-", "-", tempView[3].v);
	frogger.addView(winView);
	frogger.maxRowReached = 2;
	frogger.resetPlayerPiece(12, 7);
	setInterval(function(){
		callback();
	}, 100);
};

/*Called in the event of a collision that results in a death*/
function deathHandler(callback){
	frogger.blockCallback = true;
	frogger.isDeath = true;
	frogger.resetPlayerPiece(12, 7);
	frogger.deaths++;
	setInterval(function(){
		callback();
	}, 1500);
	
};

/*Blocks handlers from being calling until they're complete*/
function unblockCallback(){
	frogger.blockCallback = false;
	frogger.isDeath = false;
};

/*Add static image views to gameboard*/
function initViews(){
	game.addView(new View(new Frame(new Point(0,250), new Size(398, 34)), new Orientation(0, 114, 398, 34, 1, 1), "border1", 6, "-"));
	game.addView(new View(new Frame(new Point(0,0), new Size(398, 34)), new Orientation(1, 114, 398, 34, 1, 1), "border2", 12, "-"));
	game.addView(new View(new Frame(new Point(0,0), new Size(25, 20)), new Orientation(10, 363, 25, 20, .8, .8), "life", 13, "-"));
	game.addView(new View(new Frame(new Point(20,0), new Size(25, 20)), new Orientation(10, 363, 25, 20, .8, .8), "life", 13, "-"));
	game.addView(new View(new Frame(new Point(40,0), new Size(25, 20)), new Orientation(10, 363, 25, 20, .8, .8), "life", 13, "-"));
	game.addView(new View(new Frame(new Point(60,0), new Size(25, 20)), new Orientation(10, 363, 25, 20, .8, .8), "life", 13, "-"));
	game.addView(new View(new Frame(new Point(0,0), new Size(182, 24)), new Orientation(7, 163, 182, 24, 1.2, 1.2), "biglog", 3, 8, new Velocity('R', 1)));
	game.addView(new View(new Frame(new Point(0,0), new Size(182, 24)), new Orientation(7, 163, 182, 24, 1.2, 1.2), "biglog", 3, -3, new Velocity('R', 1)));
	game.addView(new View(new Frame(new Point(0,0), new Size(89, 24)), new Orientation(7, 227, 89, 24, 1.2, 1.2), "littlelog", 4, -5, new Velocity('R', 2)));
	game.addView(new View(new Frame(new Point(0,0), new Size(89, 24)), new Orientation(7, 227, 89, 24, 1.2, 1.2), "littlelog", 4, 8, new Velocity('R', 2)));
	game.addView(new View(new Frame(new Point(0,0), new Size(89, 24)), new Orientation(7, 227, 89, 24, 1.2, 1.2), "littlelog", 4, 3, new Velocity('R', 2)));
	game.addView(new View(new Frame(new Point(0,0), new Size(53, 23)), new Orientation(106, 297, 53, 23, 1.3, 1.2), "truck", 7, 14, new Velocity('L', 1.5)));
	game.addView(new View(new Frame(new Point(0,0), new Size(53, 23)), new Orientation(106, 297, 53, 23, 1.3, 1.2), "truck", 7, 19, new Velocity('L', 1.5)));
	game.addView(new View(new Frame(new Point(0,0), new Size(32, 27)), new Orientation(45, 258, 32, 30, 1.3, 1.2), "car1", 8, 1, new Velocity('R', 1.5)));
	game.addView(new View(new Frame(new Point(0,0), new Size(32, 27)), new Orientation(45, 258, 32, 30, 1.3, 1.2), "car1", 8, 10, new Velocity('R', 1.5)));
	game.addView(new View(new Frame(new Point(0,0), new Size(33, 24)), new Orientation(7, 264, 33, 23, 1.3, 1.2), "car2", 9, 3, new Velocity('L', 1.5)));
	game.addView(new View(new Frame(new Point(0,0), new Size(33, 24)), new Orientation(7, 264, 33, 23, 1.3, 1.2), "car2", 9, 7, new Velocity('L', 1.5)));
	game.addView(new View(new Frame(new Point(0,0), new Size(33, 24)), new Orientation(7, 264, 33, 23, 1.3, 1.2), "car2", 9, 11, new Velocity('L', 1.5)));
	game.addView(new View(new Frame(new Point(0,0), new Size(30, 27)), new Orientation(8, 294, 30, 27, 1.3, 1.2), "car3", 10, 8, new Velocity('R', 1.5)));
	game.addView(new View(new Frame(new Point(0,0), new Size(30, 27)), new Orientation(8, 294, 30, 27, 1.3, 1.2), "car3", 10, 4, new Velocity('R', 1.5)));
	game.addView(new View(new Frame(new Point(0,0), new Size(30, 27)), new Orientation(8, 294, 30, 27, 1.3, 1.2), "car3", 10, 0, new Velocity('R', 1.5)));
	game.addView(new View(new Frame(new Point(0,0), new Size(32, 27)), new Orientation(78, 260, 32, 30, 1.3, 1.2), "car4", 11, 12, new Velocity('L', 1)));
	game.addView(new View(new Frame(new Point(0,0), new Size(32, 27)), new Orientation(78, 260, 32, 30, 1.3, 1.2), "car4", 11, 16, new Velocity('L', 1)));
	game.addView(new View(new Frame(new Point(0,0), new Size(399, 54)), new Orientation(0, 54, 399, 52, 1.04, 1), "endzone", 0, "c"));
	game.addView(new View(new Frame(new Point(0,0), new Size(182, 24)), new Orientation(3, 193, 127, 26, .8, 1.2), "medlog", 1, 10, new Velocity('R', 1)));
	game.addView(new View(new Frame(new Point(0,0), new Size(182, 24)), new Orientation(3, 193, 127, 26, .8, 1.2), "medlog", 1, 5, new Velocity('R', 1)));
	game.addView(new View(new Frame(new Point(0,0), new Size(182, 24)), new Orientation(3, 193, 127, 26, .8, 1.2), "medlog", 1, 0, new Velocity('R', 1)));
	game.addView(new View(new Frame(new Point(0,0), new Size(25, 20)), new Orientation(10, 365, 25, 20, 1, 1), "frog", 12, 7));
	game.addView(new View(new Frame(new Point(0,0), new Size(25, 25)), new Orientation(76, 333, 25, 25, 1, 1), "frog", 12, 7));
	game.addView(new View(new Frame(new Point(0,0), new Size(25, 25)), new Orientation(10, 330, 25, 25, 1, 1), "frog", 12, 7));
	game.addView(new View(new Frame(new Point(0,0), new Size(25, 25)), new Orientation(76, 362, 25, 25, 1, 1), "frog", 12, 7));
};

/*Draws backgrounds to canvas*/
function initBackgrounds(){
	game.addBackground(new Background('#191970', new Frame(new Point(0, 0), new Size(game.getCanvasWidth(), 260))));
	game.addBackground(new Background('#000000', new Frame(new Point(0, 260), new Size(game.getCanvasWidth(), 300))));
};

/*Sets which view object the player controls*/
function setPlayerPiece(id){
	game.setControl(id);
};

/*Adds views that have animations*/
function addMovables(){
	game.movableSet.push(new Movable(new View(new Frame(new Point(0,0), new Size(35, 26)), new Orientation(14, 403, 35, 26, 1, 1), "turtle2", 5, 6, new Velocity('L', 1.5)), true));
	game.movableSet.push(new Movable(new View(new Frame(new Point(0,0), new Size(35, 26)), new Orientation(51, 403, 35, 26, 1, 1), "turtle2", 5, 6, new Velocity('L', 1.5)), false));
	game.doneAddingMoveSet();
	game.movableSet.push(new Movable(new View(new Frame(new Point(0,0), new Size(35, 26)), new Orientation(14, 403, 35, 26, 1, 1), "turtle2", 5, 7, new Velocity('L', 1.5)), true));
	game.movableSet.push(new Movable(new View(new Frame(new Point(0,0), new Size(35, 26)), new Orientation(51, 403, 35, 26, 1, 1), "turtle2", 5, 7, new Velocity('L', 1.5)), false));
	game.doneAddingMoveSet();
	game.movableSet.push(new Movable(new View(new Frame(new Point(0,0), new Size(35, 26)), new Orientation(14, 403, 35, 26, 1, 1), "turtle2", 5, 8, new Velocity('L', 1.5)), true));
	game.movableSet.push(new Movable(new View(new Frame(new Point(0,0), new Size(35, 26)), new Orientation(51, 403, 35, 26, 1, 1), "turtle2", 5, 8, new Velocity('L', 1.5)), false));
	game.doneAddingMoveSet();
	game.movableSet.push(new Movable(new View(new Frame(new Point(0,0), new Size(35, 26)), new Orientation(14, 403, 35, 26, 1, 1), "turtle2", 5, 11, new Velocity('L', 1.5)), true));
	game.movableSet.push(new Movable(new View(new Frame(new Point(0,0), new Size(35, 26)), new Orientation(51, 403, 35, 26, 1, 1), "turtle2", 5, 11, new Velocity('L', 1.5)), false));
	game.doneAddingMoveSet();
	game.movableSet.push(new Movable(new View(new Frame(new Point(0,0), new Size(35, 26)), new Orientation(14, 403, 35, 26, 1, 1), "turtle2", 5, 12, new Velocity('L', 1.5)), true));
	game.movableSet.push(new Movable(new View(new Frame(new Point(0,0), new Size(35, 26)), new Orientation(51, 403, 35, 26, 1, 1), "turtle2", 5, 12, new Velocity('L', 1.5)), false));
	game.doneAddingMoveSet();
	game.movableSet.push(new Movable(new View(new Frame(new Point(0,0), new Size(35, 26)), new Orientation(14, 403, 35, 26, 1, 1), "turtle2", 5, 13, new Velocity('L', 1.5)), true));
	game.movableSet.push(new Movable(new View(new Frame(new Point(0,0), new Size(35, 26)), new Orientation(51, 403, 35, 26, 1, 1), "turtle2", 5, 13, new Velocity('L', 1.5)), false));
	game.doneAddingMoveSet();
	game.movableSet.push(new Movable(new View(new Frame(new Point(0,0), new Size(35, 26)), new Orientation(14, 403, 35, 26, 1, 1), "turtle2", 5, 16, new Velocity('L', 1.5)), true));
	game.movableSet.push(new Movable(new View(new Frame(new Point(0,0), new Size(35, 26)), new Orientation(51, 403, 35, 26, 1, 1), "turtle2", 5, 16, new Velocity('L', 1.5)), false));
	game.doneAddingMoveSet();
	game.movableSet.push(new Movable(new View(new Frame(new Point(0,0), new Size(35, 26)), new Orientation(14, 403, 35, 26, 1, 1), "turtle2", 5, 17, new Velocity('L', 1.5)), true));
	game.movableSet.push(new Movable(new View(new Frame(new Point(0,0), new Size(35, 26)), new Orientation(51, 403, 35, 26, 1, 1), "turtle2", 5, 17, new Velocity('L', 1.5)), false));
	game.doneAddingMoveSet();
	game.movableSet.push(new Movable(new View(new Frame(new Point(0,0), new Size(35, 26)), new Orientation(14, 403, 35, 26, 1, 1), "turtle2", 5, 18, new Velocity('L', 1.5)), true));
	game.movableSet.push(new Movable(new View(new Frame(new Point(0,0), new Size(35, 26)), new Orientation(51, 403, 35, 26, 1, 1), "turtle2", 5, 18, new Velocity('L', 1.5)), false));
	game.doneAddingMoveSet();
	game.movableSet.push(new Movable(new View(new Frame(new Point(0,0), new Size(35, 26)), new Orientation(14, 403, 35, 26, 1, 1), "turtle1", 2, 3, new Velocity('L', 1.5)), true));
	game.movableSet.push(new Movable(new View(new Frame(new Point(0,0), new Size(35, 26)), new Orientation(51, 403, 35, 26, 1, 1), "turtle1", 2, 3, new Velocity('L', 1.5)), false));
	game.doneAddingMoveSet();
	game.movableSet.push(new Movable(new View(new Frame(new Point(0,0), new Size(35, 26)), new Orientation(14, 403, 35, 26, 1, 1), "turtle1", 2, 4, new Velocity('L', 1.5)), true));
	game.movableSet.push(new Movable(new View(new Frame(new Point(0,0), new Size(35, 26)), new Orientation(51, 403, 35, 26, 1, 1), "turtle1", 2, 4, new Velocity('L', 1.5)), false));
	game.doneAddingMoveSet();
	game.movableSet.push(new Movable(new View(new Frame(new Point(0,0), new Size(35, 26)), new Orientation(14, 403, 35, 26, 1, 1), "turtle1", 2, 6, new Velocity('L', 1.5)), true));
	game.movableSet.push(new Movable(new View(new Frame(new Point(0,0), new Size(35, 26)), new Orientation(51, 403, 35, 26, 1, 1), "turtle1", 2, 6, new Velocity('L', 1.5)), false));
	game.doneAddingMoveSet();
	game.movableSet.push(new Movable(new View(new Frame(new Point(0,0), new Size(35, 26)), new Orientation(14, 403, 35, 26, 1, 1), "turtle1", 2, 7, new Velocity('L', 1.5)), true));
	game.movableSet.push(new Movable(new View(new Frame(new Point(0,0), new Size(35, 26)), new Orientation(51, 403, 35, 26, 1, 1), "turtle1", 2, 7, new Velocity('L', 1.5)), false));
	game.doneAddingMoveSet();
	game.movableSet.push(new Movable(new View(new Frame(new Point(0,0), new Size(35, 26)), new Orientation(14, 403, 35, 26, 1, 1), "turtle1", 2, 9, new Velocity('L', 1.5)), true));
	game.movableSet.push(new Movable(new View(new Frame(new Point(0,0), new Size(35, 26)), new Orientation(51, 403, 35, 26, 1, 1), "turtle1", 2, 9, new Velocity('L', 1.5)), false));
	game.doneAddingMoveSet();
	game.movableSet.push(new Movable(new View(new Frame(new Point(0,0), new Size(35, 26)), new Orientation(14, 403, 35, 26, 1, 1), "turtle1", 2, 10, new Velocity('L', 1.5)), true));
	game.movableSet.push(new Movable(new View(new Frame(new Point(0,0), new Size(35, 26)), new Orientation(51, 403, 35, 26, 1, 1), "turtle1", 2, 10, new Velocity('L', 1.5)), false));
	game.doneAddingMoveSet();
	game.movableSet.push(new Movable(new View(new Frame(new Point(0,0), new Size(35, 26)), new Orientation(14, 403, 35, 26, 1, 1), "turtle1", 2, 0, new Velocity('L', 1.5)), true));
	game.movableSet.push(new Movable(new View(new Frame(new Point(0,0), new Size(35, 26)), new Orientation(51, 403, 35, 26, 1, 1), "turtle1", 2, 0, new Velocity('L', 1.5)), false));
	game.movableSet.push(new Movable(new View(new Frame(new Point(0,0), new Size(35, 26)), new Orientation(93, 401, 35, 26, 1, 1), "turtle1", 2, 0, new Velocity('L', 1.5)), false));
	game.movableSet.push(new Movable(new View(new Frame(new Point(0,0), new Size(35, 26)), new Orientation(133, 403, 35, 26, 1, 1), "turtle1", 2, 0, new Velocity('L', 1.5)), false));
	game.movableSet.push(new Movable(new View(new Frame(new Point(0,0), new Size(35, 26)), new Orientation(177, 403, 35, 26, 1, 1), "turtle1", 2, 0, new Velocity('L', 1.5)), false));
	game.movableSet.push(new Movable(new View(new Frame(new Point(0,0), new Size(35, 26)), new Orientation(258, 200, 35, 26, 1, 1), "under_turtle", 2, 0, new Velocity('L', 1.5)), false));
	game.movableSet.push(new Movable(new View(new Frame(new Point(0,0), new Size(35, 26)), new Orientation(258, 200, 35, 26, 1, 1), "under_turtle", 2, 0, new Velocity('L', 1.5)), false));
	game.movableSet.push(new Movable(new View(new Frame(new Point(0,0), new Size(35, 26)), new Orientation(133, 403, 35, 26, 1, 1), "turtle1", 2, 0, new Velocity('L', 1.5)), false));
	game.movableSet.push(new Movable(new View(new Frame(new Point(0,0), new Size(35, 26)), new Orientation(93, 401, 35, 26, 1, 1), "turtle1", 2, 0, new Velocity('L', 1.5)), false));
	game.movableSet.push(new Movable(new View(new Frame(new Point(0,0), new Size(35, 26)), new Orientation(51, 403, 35, 26, 1, 1), "turtle1", 2, 0, new Velocity('L', 1.5)), false));
	game.doneAddingMoveSet();
	game.movableSet.push(new Movable(new View(new Frame(new Point(0,0), new Size(35, 26)), new Orientation(14, 403, 35, 26, 1, 1), "turtle1", 2, 1, new Velocity('L', 1.5)), true));
	game.movableSet.push(new Movable(new View(new Frame(new Point(0,0), new Size(35, 26)), new Orientation(51, 403, 35, 26, 1, 1), "turtle1", 2, 1, new Velocity('L', 1.5)), false));
	game.movableSet.push(new Movable(new View(new Frame(new Point(0,0), new Size(35, 26)), new Orientation(93, 401, 35, 26, 1, 1), "turtle1", 2, 1, new Velocity('L', 1.5)), false));
	game.movableSet.push(new Movable(new View(new Frame(new Point(0,0), new Size(35, 26)), new Orientation(133, 403, 35, 26, 1, 1), "turtle1", 2, 1, new Velocity('L', 1.5)), false));
	game.movableSet.push(new Movable(new View(new Frame(new Point(0,0), new Size(35, 26)), new Orientation(177, 403, 35, 26, 1, 1), "turtle1", 2, 1, new Velocity('L', 1.5)), false));
	game.movableSet.push(new Movable(new View(new Frame(new Point(0,0), new Size(35, 26)), new Orientation(258, 200, 35, 26, 1, 1), "under_turtle", 2, 1, new Velocity('L', 1.5)), false));
	game.movableSet.push(new Movable(new View(new Frame(new Point(0,0), new Size(35, 26)), new Orientation(258, 200, 35, 26, 1, 1), "under_turtle", 2, 1, new Velocity('L', 1.5)), false));
	game.movableSet.push(new Movable(new View(new Frame(new Point(0,0), new Size(35, 26)), new Orientation(133, 403, 35, 26, 1, 1), "turtle1", 2, 1, new Velocity('L', 1.5)), false));
	game.movableSet.push(new Movable(new View(new Frame(new Point(0,0), new Size(35, 26)), new Orientation(93, 401, 35, 26, 1, 1), "turtle1", 2, 1, new Velocity('L', 1.5)), false));
	game.movableSet.push(new Movable(new View(new Frame(new Point(0,0), new Size(35, 26)), new Orientation(51, 403, 35, 26, 1, 1), "turtle1", 2, 1, new Velocity('L', 1.5)), false));
	game.doneAddingMoveSet();
};
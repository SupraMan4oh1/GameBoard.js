$(document).ready(function(){
	game = new GameBoard(document.getElementById('gameboard'), 13, 14, "assets/frogger_sprites.png");
	game.addView(new View(new Frame(new Point(0,250), new Size(398, 34)), new Orientation(0, 114, 1, 1), "border1", 6, " "));
	game.addView(new View(new Frame(new Point(0,0), new Size(398, 34)), new Orientation(1, 114, 1, 1), "border2", 12, " "));
	game.addView(new View(new Frame(new Point(0,0), new Size(25, 20)), new Orientation(10, 363, .6, .6), "lifeFrog", 13, " "));
	game.addView(new View(new Frame(new Point(15,0), new Size(25, 20)), new Orientation(10, 363, .6, .6), "lifeFrog", 13, " "));
	game.addView(new View(new Frame(new Point(30,0), new Size(25, 20)), new Orientation(10, 363, .6, .6), "lifeFrog", 13, " "));
	game.addView(new View(new Frame(new Point(45,0), new Size(25, 20)), new Orientation(10, 363, .6, .6), "lifeFrog", 13, " "));
	game.addView(new View(new Frame(new Point(60,0), new Size(25, 20)), new Orientation(10, 363, .6, .6), "lifeFrog", 13, " "));
	game.addView(new View(new Frame(new Point(0,0), new Size(182, 24)), new Orientation(7, 163, 1, 1), "biglog", 4, 8, new Velocity('R', 2)));
	game.addView(new View(new Frame(new Point(0,0), new Size(182, 24)), new Orientation(7, 163, 1, 1), "biglog", 4, -5, new Velocity('R', 2)));
	game.addView(new View(new Frame(new Point(0,0), new Size(89, 24)), new Orientation(7, 227, 1, 1), "littlelog", 5, -5, new Velocity('R', 3)));
	game.addView(new View(new Frame(new Point(0,0), new Size(399, 54)), new Orientation(0, 53, 1, .8), "endzone", 1, 0));
	game.addView(new View(new Frame(new Point(0,0), new Size(325, 34)), new Orientation(12, 11, 1, .7), "logo", 0, 1));
	game.addView(new View(new Frame(new Point(0,0), new Size(25, 20)), new Orientation(10, 365, 1, 1), "frog", 12, 7));
	game.addView(new View(new Frame(new Point(0,0), new Size(25, 25)), new Orientation(76, 333, 1, 1), "frog", 12, 7));
	game.addView(new View(new Frame(new Point(0,0), new Size(25, 25)), new Orientation(10, 330, 1, 1), "frog", 12, 7));
	game.addView(new View(new Frame(new Point(0,0), new Size(25, 25)), new Orientation(76, 362, 1, 1), "frog", 12, 7));
	game.addBackground(new Background('#191970', new Frame(new Point(0, 0), new Size(game.getCanvasWidth(), 260))));
	game.addBackground(new Background('#000000', new Frame(new Point(0, 260), new Size(game.getCanvasWidth(), 300))));
	game.setControl("frog");
	game.collisionCallback = collisionHandler;
	game.addToList("littlelog", "border1", "border2", "lifeFrog", "endzone", "logo", "frog");
	game.start();
});

function collisionHandler(view, elem){
	console.log('hi');
};
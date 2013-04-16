var requestAnimFrame = (function(){
    return window.requestAnimationFrame       ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame    ||
        window.oRequestAnimationFrame      ||
        window.msRequestAnimationFrame     ||
        function(callback){
            window.setTimeout(callback, 1000 / 60);
        };
})();

load(['img/homescreen.png', 'img/instructions.png', 'img/sidepanel.png', 'img/newgem.png', 'img/fire.png', 'img/exclamation_mark.png', 'img/door.png'], 
	 ['home', 'help', 'sidepanel', 'gem', 'fire', 'mark', 'door'], start);

function start(){
	canvas = document.createElement("canvas");
	ctx = canvas.getContext("2d");
	canvas.width = 900;
	canvas.height = 700;
	document.body.appendChild(canvas);
	canvas.setAttribute('style', 'border-style:solid;');

	screen = 'HOME';
	ctx.drawImage(getImg('home'), 0, 0);

	myAudio = new Audio('song.mp3'); 
	myAudio.addEventListener('ended', function() {
	    this.currentTime = 0;
	    this.play();
	}, false);
	myAudio.play();

	canvas.addEventListener('click', handleClick, false);
}

function init(mapnum)
{
	time = Date.now();

	map = getMap(mapnum);
	grid = map.grid;
	graph = new Graph(grid);

	heightSquares = grid.length, widthSquares = grid[0].length;
	gridHeight = 700, gridWidth = 700;
	drawx = (gridWidth/widthSquares), drawy = (gridHeight/heightSquares);


	gems = map.gems(drawx, drawy, getImg("gem"));
	fires = map.fires(drawx, drawy, getImg("fire"));
	escapes = map.escapes(drawx, drawy, getImg('door'));
	guards = map.guards(drawx, drawy, graph);
	robbers = map.robbers(drawx, drawy, graph, gems, escapes, getImg('mark'));

	pickedGuard = 0;
	guards[pickedGuard].selected();

	document.addEventListener('keydown', handleKeys, false);
	action = '';

	// For testing only. Delete later.
	placeWall = false;
	//robbers[0].moveTo(gems[0].x, gems[0].y);
	document.addEventListener('keyup', handleKeyDown, false);

	mainLoop();
}

function mainLoop(){
	requestAnimFrame(mainLoop);
	var now = Date.now();
	var dt = (now-time)/1000;
	time = now;

	updateEntities(dt);
	draw();
}

function handleClick(e){

	var x = e.offsetX, y = e.offsetY;
	if (screen == 'HOME'){
		if (y < 450){
			screen = 'MAP';
			drawMapScreen();
		}
		else{
			screen = 'HELP';
			ctx.drawImage(getImg("help"), 0, 0);
		}
	}
	else if (screen == 'HELP'){
		screen = 'HOME';
		ctx.drawImage(getImg("home"), 0, 0);
	}
	else if (screen == 'MAP'){
		screen = 'GAME';
		if (y < 350)
			init(1);
		else
			init(2);
	}
	else{
		if (x < gridWidth){
			var posx = Math.floor(x / drawx), posy = Math.floor(y / drawy);
			// Delete this if nonsense later and just keep the guards moveTo part.
			
			if (action == 'PATH'){
				guards[pickedGuard].addToPath(posx, posy);
			}
			else if (!placeWall)
				guards[pickedGuard].straightTo(posx, posy);

			else{
				grid[posx][posy] = 1 - grid[posx][posy];
				graph = new Graph(grid);

				for (var i = 0; i < guards.length; i++)
					guards[i].updateGraph(graph);

				var weightGraph = findWeightedGraph();

				for (i = 0; i < robbers.length; i++)
					robbers[i].updateGraph(weightGraph);				
			}
		}
		else{
			if (y < 100){
				action = 'PATH';
				guards[pickedGuard].resetPath();
			}
			else if (y > 275 && y < 450){
				action = '';
				guards[pickedGuard].stopPath();
			}
			else if (y > 100 && y < 275){
				action = '';
				guards[pickedGuard].startPath();
			}
			else{
				for (i = 0; i < robbers.length; i++){
					robbers[i].move();
					robbers[i].show();
				}
			}
		}
	}
}

function drawMapScreen(){
	var len = mapLength();
	var space = canvas.height / len;
	ctx.fillStyle = 'black';
	ctx.fill();
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	ctx.fillStyle = 'orange';
	ctx.fill();
	ctx.font = "18pt Arial";
	ctx.fillText("MAP 1", 400, 250);
	ctx.fillText("MAP 2", 400, 450);
}

function handleKeys(e){
	guards[pickedGuard].deselect();
	var num = e.keyCode - 49; //regular 1-9
	if (num >= 0 && num < guards.length)
		pickedGuard = num;
	num = e.keyCode - 97; //keypad 1-9
	if (num >= 0 && num < guards.length)
		pickedGuard = num;
	guards[pickedGuard].selected(); 
	action = '';

	// Placing walls - delete later.
	if (e.keyCode == 17)
		placeWall = true;
	if (e.keyCode == 83){
		window.printGrid(grid);
		window.printOtherThings(guards, robbers, gems, fires);
	}
}

// Delete later
function handleKeyDown(e){
	if (e.keyCode == 17)
		placeWall = false;
}

function updateEntities(dt){
	for (var i = 0; i < guards.length; i++){
		var guard = guards[i];
		guard.update(dt);
		if (nextToFire(guard))
			guard.replenishFire();
	}

	var weightGraph = findWeightedGraph();

	for (i = 0; i < robbers.length; i++){
		var robber = robbers[i];
		robber.update(dt);
		robber.updateGraph(new Graph(weightGraph));
	}
}

function nextToFire(guard){
	for (var i = 0; i < fires.length; i++){
		var f = fires[i];
		if (Math.abs(f.x - guard.x) <= 2 && Math.abs(f.y - guard.y) <= 2)
			return true;
	}
	return false;
}

function findWeightedGraph(){
	function valid(x, y){
		return x >= 0 && x < widthSquares && y >= 0 && y < heightSquares && grid[x][y] != 0;
	}

	function updateWeights(entity, startx, endx, starty, endy, maxWeight){
		for (var dx = startx; dx <= endx; dx++){
			for (var dy = starty; dy <= endy; dy++){
				var gx = entity.x + dx, gy = entity.y + dy;
				if (valid(gx, gy) && !(dx == 0 && dy == 0))
					weightGraph[gx][gy] += maxWeight / ((Math.abs(dx) + Math.abs(dy)));
				else if (dx == 0 && dy == 0)
					weightGraph[gx][gy] = 0;
			}	
		}
	}

	function deepcopy(g){
		temp = [];
		for (var i = 0; i < g.length; i++)
			temp.push(g[i].slice(0));
		return temp;
	}

	var weightGraph = deepcopy(grid);

	for (var i = 0; i < guards.length; i++)
		updateWeights(guards[i], -6, 6, -6, 6, robbers[0].guardWeight);
	for (var i = 0; i < fires.length; i++)
		updateWeights(fires[i], -4, 4, -4, 4, robbers[0].fireWeight);

	return weightGraph;
}

function draw(){
	ctx.clearRect(0,0,canvas.width,canvas.height);
	drawEnv();
	drawSide();
	var ambientLight = 0.00;
	var amb = 'rgba(0,0,0,' + (1-ambientLight) + ')';
	ctx.fillStyle = amb;
	ctx.globalCompositeOperation = 'xor';
	ctx.fillRect(0, 0, gridWidth, gridHeight);
	//ctx.drawImage(backcanvas, 0, 0);
	for (var i = 0; i < guards.length; i++)
		guards[i].draw(ctx);
	for (i = 0; i < robbers.length; i++)
		robbers[i].draw(ctx, guards);
	for (i = 0; i < escapes.length; i++)
		escapes[i].draw(ctx);
	for (i = 0; i < fires.length; i++)
		fires[i].draw(ctx);
	for (i = 0; i < gems.length; i++)
		gems[i].draw(ctx);
}

function drawEnv(){	
	// Walls
	for (i = 0; i < widthSquares; i++){
		for (var j = 0; j < heightSquares; j++){
			if (grid[i][j] == 0){
				ctx.fillRect(i*drawx, j*drawy, drawx, drawy);
			}
		}
	}
}

function drawSide(){
	/*
	ctx.fillText("START PATH", 730, 300);
	ctx.fillText("GOTO", 730, 500);
	ctx.fillText("START GAME", 730, 600);*/
	ctx.drawImage(getImg("sidepanel"), 700, 0);
	ctx.fillStyle = 'black';
	ctx.fill();
	ctx.font = "18pt Arial";
	ctx.fillText("Robber Health: " + robbers[0].health, 710, 640);
	if (robbers[0].escaped)
		ctx.fillText("Robber Got Gem", 740, 640);
}
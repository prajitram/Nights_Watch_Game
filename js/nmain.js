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

init();

function init()
{
	canvas = document.createElement("canvas");
	ctx = canvas.getContext("2d");
	canvas.width = 900;
	canvas.height = 700;
	document.body.appendChild(canvas);
	canvas.setAttribute('style', 'border-style:solid;');

	heightSquares = 35, widthSquares = 35;
	gridHeight = 700, gridWidth = 700;
	drawx = (gridWidth/widthSquares), drawy = (gridHeight/heightSquares);

	grid = window.grid;
	graph = new Graph(grid);
	time = Date.now();
	canvas.addEventListener('click', handleClick, false);

	gems = [new Gem(2, 2, drawx, drawy)];
	guards = [new Guard(10, 10, drawx, drawy, graph), new Guard(20, 20, drawx, drawy, graph)];
	fires = [new Fire(14, 14, drawx, drawy)];
	robbers = [new Robber(5, 5, drawx, drawy, graph)];
}

(function mainLoop(){
	requestAnimFrame(mainLoop);
	var now = Date.now();
	var dt = (now-time)/1000;
	time = now;

	updateEntities(dt);
	draw();
})();

function handleClick(e){
	var x = e.offsetX, y = e.offsetY;
	var posx = Math.floor(x / drawx), posy = Math.floor(y / drawy);
	for (var i = 0; i < guards.length; i++)
		guards[i].moveTo(posx, posy);
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
		if (Math.abs(f.x - guard.x) <= 1 && Math.abs(f.y - guard.y) <= 1)
			return true;
	}
	return false;
}

function findWeightedGraph(){
	function valid(x, y){
		return x >= 0 && x < widthSquares && y >= 0 && y < heightSquares && this.grid[x][y] != 0;
	}

	function updateWeights(entity, startx, endx, starty, endy, maxWeight){
		for (var dx = startx; dx <= endx; dx++){
			for (var dy = starty; dy <= endy; dy++){
				var gx = entity.x + dx, gy = entity.y + dy;
				if (valid(gx, gy) && !(dx == 0 && dy == 0))
					weightGraph[gx][gy] += maxWeight / ((Math.abs(dx) + Math.abs(dy)));
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
		updateWeights(guards[i], -3, 3, -3, 3, robbers[0].guardWeight);
	for (var i = 0; i < fires.length; i++)
		updateWeights(fires[i], -3, 3, -3, 3, robbers[0].fireWeight);

	return weightGraph;
}

function draw(){
	ctx.clearRect(0,0,canvas.width,canvas.height);
	drawEnv();
	for (var i = 0; i < guards.length; i++)
		guards[i].draw(ctx);
	for (i = 0; i < robbers.length; i++)
		robbers[i].draw(ctx);
	for (i = 0; i < fires.length; i++)
		fires[i].draw(ctx);
	for (i = 0; i < gems.length; i++)
		gems[i].draw(ctx);
}

function drawEnv(){	
	ctx.fillStyle = 'black';
	ctx.fill();
	ctx.fillRect(0, 0, gridWidth, gridHeight);

	ctx.fillStyle = 'white';
	ctx.fill();

	// Grid lines - vertical then horizontal
	for (var i = 0; i <= widthSquares; i++)
		ctx.fillRect(i*drawx, 0, 1, gridHeight);
	for (i = 0; i <= heightSquares; i++)
		ctx.fillRect(0, i*drawy, gridWidth, 1);

	// Walls
	for (i = 0; i < widthSquares; i++){
		for (var j = 0; j < heightSquares; j++){
			if (grid[i][j] == 0){
				ctx.fillRect(i*drawx, j*drawy, drawx, drawy);
			}
		}
	}
}
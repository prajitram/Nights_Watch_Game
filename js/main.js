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
(function animLoop(){
	requestAnimFrame(animLoop);
	var now = Date.now();
	var dt = (now-time)/1000;
	guard.update(dt);
	thief[0].update(dt);
	time = now;

	checkPositions();
	drawEnv();
})();

function init(){

	var graphWithWeight = new Graph([
        [1,1,20,30],
        [1,10,1.3,0],
        [1,1,1,1]
    ]);
    var startWithWeight = graphWithWeight.nodes[0][0];
    var endWithWeight = graphWithWeight.nodes[1][2];
    var resultWithWeight = astar.search(graphWithWeight.nodes, startWithWeight, endWithWeight, false);

    console.log(resultWithWeight);
	canvas = document.createElement("canvas");
	ctx = canvas.getContext("2d");
	heightSquares = 35, widthSquares = 35;
	gridHeight = 700, gridWidth = 700;
	action = "WALL";

	canvas.width = 900;
	canvas.height = 700;
	document.body.appendChild(canvas);
	canvas.setAttribute('style', 'border-style:solid;');

	dx = (gridWidth/widthSquares), dy = (gridHeight/heightSquares);

	canvas.addEventListener('click', changeWalls, false);

	time = Date.now();

	grid = new Array(heightSquares);
	for (var i = 0; i < widthSquares; i++){
		grid[i] = new Array(heightSquares);
	}

	for (i = 0; i < widthSquares; i++){
		for (var j = 0; j < heightSquares; j++){
			grid[i][j] = 1;
		}
	}

	grid[34][8] = -1000;

	printGrid(grid);

	guard = new Guard(20, 20, dx, dy);
	
	path = '';// = guard.moveTo(1, 2, graph);
	

	fire = [new Fire(10, 10)];
	gems = [new Gem(5, 6)];
	grid[10][10] = false;

	graph = new Graph(grid);
	thief = [new Thief(12, 4, dx, dy)];
	thief[0].moveTo(gems[0].x, gems[0].y, graph);
	
	grid[5][6] = false;

	

	drawEnv();
}

function printGrid(g){
	var r = "window.grid = [\n";
	//console.log("grid = [");
	for (var i = 0; i < g.length; i++){
		r += "\t\t\t   [";
		for (var j = 0; j < g[i].length; j++){
			r += g[i][j];
			if (j != g[i].length-1)
				r += ", ";
		}
		r += "]";
		if (i != g.length-1)
			r += ",";
		r += '\n';
	}
	r += "\t\t     ];"
	console.log(r);
}


function changeWalls(e){
	var x = e.offsetX, y = e.offsetY;
	if (x < 700){
		var posx = Math.floor(x / (gridWidth/widthSquares));
		var posy = Math.floor(y / (gridHeight/heightSquares));
		if (action == 'WALL'){
			grid[posx][posy] = 1 - grid[posx][posy];
			path = guard.recalc(new Graph(grid));
			printGrid(grid);
		}
		else if (action == 'MARKER'){
			//console.log(posx + " " + posy);
			path = guard.marker(posx, posy, new Graph(grid));
		}
		else if (action == 'PATH'){
			path = guard.addPath(posx, posy, new Graph(grid));
		}
	}
	else
	{
		if (y  < 100)
			action = 'WALL';
		else if (y > 100 && y < 200)
			action = 'GUARD';
		else if (y > 200 && y < 300)
			action = 'MARKER';
		else if (y > 300 && y < 400)
			guard.step();
		else
			action = 'PATH';
	}
	drawEnv();
}

function checkPositions()
{
	for (var i = 0; i < fire.length; i++){
		var f = fire[i];
		if (Math.abs(f.x-guard.x) <= 1 && Math.abs(f.y-guard.y) <= 1)
			guard.replenishFire();
	}
}

function drawEnv()
{
	ctx.clearRect(0,0,canvas.width,canvas.height);
	ctx.fillStyle = 'black';
	ctx.fill();

	ctx.fillText("WALL", 750, 50);
	ctx.fillRect(700, 100, 900, 20);
	ctx.fillText("GUARD", 750, 150);
	ctx.fillRect(700, 200, 900, 20);
	ctx.fillText("MARKER", 750, 250);
	ctx.fillRect(700, 300, 900, 20);
	ctx.fillText("STEP", 750, 350);
	ctx.fillRect(700, 400, 900, 20);
	ctx.fillText("PATH", 750, 450);
	ctx.fillRect(700, 500, 900, 20);

	ctx.fillRect(0, 0, gridWidth, gridHeight);

	ctx.fillStyle = 'white';
	ctx.fill();

	for (var i = 0; i <= widthSquares; i++){
		ctx.fillRect(i*dx, 0, 1, gridHeight);
	}
	for (i = 0; i <= heightSquares; i++){
		ctx.fillRect(0, i*dy, gridWidth, 1);
	}
	for (i = 0; i < widthSquares; i++){
		for (var j = 0; j < heightSquares; j++){
			if (!grid[i][j]){
				ctx.fillRect(i*dx, j*dy, dx, dy);
			}
		}
	}

	ctx.fillStyle = 'blue';
	ctx.fill();
	ctx.fillRect(guard.x*dx + guard.pixelx, guard.y*dy + guard.pixely, dx, dy);
	
	if (path){	
		ctx.fillStyle = 'green';
		ctx.fill();
		path = guard.getPath();
		for (i = 1; i < path.length; i++){
			ctx.fillRect(path[i].x*dx, path[i].y*dy, dx, dy);
		}
	}

	ctx.fillStyle = 'red';
	ctx.fill();
	for (i = 0; i < fire.length; i++){
		ctx.fillRect(fire[i].x*dx, fire[i].y*dy, dx, dy);
	}

	ctx.fillStyle = 'purple';
	ctx.fill();
	for (i = 0; i < gems.length; i++){
		ctx.fillRect(gems[i].x*dx, gems[i].y*dy, dx, dy);
	}

	ctx.fillStyle = 'orange';
	ctx.fill();
	for (i = 0; i < thief.length; i++){
		ctx.fillRect(thief[i].x*dx, thief[i].y*dy, dx, dy);
	}
	//guard.step();
	//console.log(graph.toString());
}

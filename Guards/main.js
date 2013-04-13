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

var canvas = document.createElement("canvas");
var ctx = canvas.getContext("2d");
var gridHeight = 35, gridWidth = 35;
canvas.width = 700;
canvas.height = 700;
document.body.appendChild(canvas);
canvas.setAttribute('style', 'border-style:solid;');

var guard = new Guard(20, 20);

function Point(x, y){
	this.x = x;
	this.y = y;
}
canvas.addEventListener('click', changeWalls, false);

grid = new Array(gridHeight);
for (var i = 0; i < gridWidth; i++){
	grid[i] = new Array(gridHeight);
}

for (i = 0; i < gridWidth; i++){
	for (var j = 0; j < gridHeight; j++){
		grid[i][j] = true;
	}
}


//alert("yeh");

drawEnv();

function changeWalls(e){
	var x = e.offsetX, y = e.offsetY;
	var posx = Math.floor(x / (canvas.width/gridWidth));
	var posy = Math.floor(y / (canvas.height/gridHeight));
	//console.log(grid[posx][posy]);
	grid[posx][posy] = !grid[posx][posy];
	drawEnv();
}

function drawEnv()
{
	ctx.clearRect(0,0,canvas.width,canvas.height);
	var dx = (canvas.width/gridWidth), dy = (canvas.height/gridHeight);

	ctx.fillStyle = 'black';
	ctx.fill();

	for (var i = 0; i < gridWidth; i++){
		ctx.fillRect(i*dx, 0, 1, canvas.height);
	}
	for (i = 0; i < gridHeight; i++){
		ctx.fillRect(0, i*dy, canvas.width, 1);
	}
	for (i = 0; i < gridWidth; i++){
		for (var j = 0; j < gridHeight; j++){
			if (!grid[i][j]){
				ctx.fillRect(i*dx, j*dy, dx, dy);
			}
		}
	}

	ctx.fillStyle = 'red';
	ctx.fill();
	ctx.fillRect(guard.x*dx, guard.y*dy, dx, dy);
	var graph = new Graph(grid);
	//console.log(guard.moveTo(10, 10, graph));

	
	//console.log(graph.toString());
}

//ctx.moveTo(0,0);
//ctx.fillRect(0, 0, 100, 100);

//alert("what");

/*var maze = [
			['-','-','-','-','-','-',],
			['|',' ','|',' ',' ','|'],
			['|',' ','|','-',' ','|'],
			['|',' ',' ',' ',' ','|'],
			['|',' ','-','-',' ','|'],
			['-','-','-','-','-','-']
			]

for (var i = 0; i < maze.length; i++){
	for (var j = 0; j < maze[i].length; j++){
		var c = maze[i][j];
		if (c == '-')
			ctx.fillRect(100+j*60, 100+i*60, 60, 2);
		if (c == '|')
			ctx.fillRect(100+j*60, 100+i*60, 2, 60);
	}
}*/
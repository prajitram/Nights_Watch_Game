// Lighting credit: http://stackoverflow.com/questions/7909865/canvas-fill-a-rectangle-in-all-areas-that-are-fully-transparent/7916842#7916842

//*************** MOVER *****************
var Mover = Class.extend({
	init: function(x, y, w, h, graph){
		this.x = x;
		this.y = y;
		this.endx = x;
		this.endy = y;
		this.w = w;
		this.h = h;
		this.graph = graph;
		this.path = '';

		this.timeConst = 100;
		this.pixelx = 0;
		this.pixely = 0;
	},

	moveTo: function(x, y){
		var start = this.graph.nodes[this.x][this.y];
		var end = this.graph.nodes[x][y];
		this.endx = x;
		this.endy = y;
		this.path = astar.search(this.graph.nodes, start, end);
	},

	update: function(dt){
		if (this.path == null || this.path.length == 0) return;

		var node = this.path[0];
		var dx = node.x - this.x, dy = node.y - this.y;
		this.pixelx += dx*dt*this.timeConst;
		this.pixely += dy*dt*this.timeConst;

		if (Math.abs(this.pixelx) > this.w || Math.abs(this.pixely) > this.h){
			this.x = node.x;
			this.y = node.y;
			this.path.shift();
			this.pixelx = 0; 
			this.pixely = 0;
		}
	},

	updateGraph: function(graph){
		this.graph = graph;
		this.moveTo(this.endx, this.endy);
	},

	//update with image instead of color later
	draw: function(ctx, color){
		ctx.fillStyle = color || 'yellow';
		ctx.fill();
		ctx.fillRect(this.x * this.w + this.pixelx, this.y * this.h + this.pixely, this.w, this.h);
	}
});
//***************************************

//*************** GUARD *****************
window.Guard = Mover.extend({
	init: function(x, y, w, h, graph, r, g, b){
		this._super(x, y, w, h, graph);

		this.maxfire = Math.floor(Math.random() * 600) + 700;
		this.fire = this.maxfire;
		this.fireLoss = Math.floor(Math.random()*10) + 10;
		this.radius = this.fire/100;

		this.counter = 0;
		this.timeConst = Math.floor(Math.random() * 100) + 150;
		this.circlePath = [];
		this.loopPath = false;
		this.select = false;

		this.r = r || 0;
		this.g = g || 0;
		this.b = b || 0;
	},

	moveTo: function(x, y){
		this._super(x, y);
	},

	update: function(dt){
		this._super(dt);
		this.fire = Math.max(this.fire - this.fireLoss*dt, 0);

		if (this.loopPath && this.path.length == 0 && this.circlePath.length >= 1){
			this.moveTo(this.circlePath[this.counter][0], this.circlePath[this.counter][1]);
			this.counter = (this.counter+1) % this.circlePath.length;
		}
	},

	selected: function(){
		this.select = true;
	},

	deselect: function(){
		this.select = false;
	},

	replenishFire: function(){
		this.fire = Math.min(this.maxfire, this.fire + this.maxfire/40);
	},

	startPath: function(){
		this.loopPath = true;
	},

	stopPath: function(){
		this.loopPath = false;
	},

	addToPath: function(x, y){
		this.circlePath.push([x, y]);
	},

	resetPath: function(){
		this.circlePath = [];
		this.loopPath = false;
	},

	straightTo: function(x, y){
		this.loopPath = false;
		this.moveTo(x, y);
	},

	updateGraph: function(graph){
		this._super(graph);
	},

	draw: function(ctx){
		if (this.select){
			ctx.fillStyle = 'red';
			ctx.fill();
			ctx.fillRect(this.x * this.w + this.pixelx - 2, this.y * this.h + this.pixely - 2, this.w + 4, this.h + 4);
		}
		this.drawLight(ctx);
		this._super(ctx, 'blue');		
	},

	drawLight: function(ctx){
		var ambientLight = 0.0;
		var intensity = 1;
		this.radius = this.fire/15;
		var amb = 'rgba(' + this.r + ',' + this.g + ',' + this.b +',' + (1-ambientLight) + ')';
		var drawx = this.x * this.w + this.pixelx, drawy = this.y * this.h + this.pixely;

		var g = ctx.createRadialGradient(drawx+9, drawy+9, 0, drawx+9, drawy+9, this.radius);
		g.addColorStop(1, 'rgba(' + this.r + ',' + this.g + ',' + this.b +',' + (1-intensity) + ')');
		g.addColorStop(0, amb);
		ctx.fillStyle = g;
		ctx.fillRect(drawx - this.radius, drawy - this.radius, 800, 800);
	}
});
//***************************************

//*************** ROBBER ****************
window.Robber = Mover.extend({
	init: function(x, y, w, h, graph, gems, escapes, img){
		this._super(x, y, w, h, graph);
		this.gems = gems;
		this.escapes = escapes;
		this.img = img;

		this.health = 3;

		this.time = 0;
		this.timeBetweenShow = 3;
		this.showFor = 1;
		this.doubles = [];
		this.showDoubles = false;

		this.escaped = false;
		this.timeConst = 50;
		this.showfig = false;
		this.guardWeight = 750;
		this.fireWeight = 400;
	},

	moveTo: function(x, y){
		this._super(x, y);
	},

	update: function(dt){
		this.time += dt;
		if (this.time > this.timeBetweenShow){
			this.time = 0;
			this.createDoubles();
			this.showDoubles = true;
		}
		else if (this.showDoubles && this.time > this.showFor){
			this.doubles = [];
			this.showDoubles = false;
			this.time = 0;
		}
		this._super(dt);
		if (!this.escaped && this.showfig && this.x == this.endx && this.y == this.endy){
			this.escape();
			this.escaped = true;
		}
		else if (this.escaped && this.x == this.endx && this.y == this.endy){
			alert("YOU LOST. Please refresh the page to play again.");
		}
		if (this.health == 0)
			alert("YOU WIN. Please refresh the page to play again.");
	},

	reset: function(){
		function randomPos(){
	 		var x, y;
	 		if (Math.random() < .5){
	 			y  = (Math.random() < .5 ? 0 : this.graph.input.length-1);
	 			x = Math.floor(Math.random() * this.graph.input[0].length);
	 		}
	 		else{
	 			x  = (Math.random() < .5 ? 0 : this.graph.input[0].length-1);
	 			y = Math.floor(Math.random() * this.graph.input.length);
	 		}
	 		return [x, y];
	 	}
	 	var pos = randomPos();
	 	console.log(pos);
	 	this.x = pos[0]
	 	this.y = pos[1];
	 	this.move();
	 	this.escaped = false;
	},

	move: function(){
		var gem = this.gems[Math.floor(Math.random()*this.gems.length)];
		this.moveTo(gem.x, gem.y);
	},

	escape: function(){
		var escape = this.escapes[Math.floor(Math.random()*this.escapes.length)];
		this.moveTo(escape.x, escape.y);
	},

	createDoubles: function(){
		for (var i = 1; i <= 4; i++){
			var x = Math.floor(Math.random() * this.graph.input[0].length), y = Math.floor(Math.random() * this.graph.input.length);
			while (this.graph.input[x][y] == 0)
				x = Math.floor(Math.random() * this.graph.input[0].length), y = Math.floor(Math.random() * this.graph.input.length);
			this.doubles.push([x, y]);
		}
		this.doubles.push([this.x, this.y]);
	},

	updateGraph: function(graph){
		this._super(graph);
	},

	show: function(){
		this.showfig = true;
	},

	draw: function(ctx, guards){
		if (!this.showfig) return;
		if (this.showDoubles){
			for (var i = 0; i < this.doubles.length; i++){
				ctx.drawImage(this.img, this.doubles[i][0] * this.w, this.doubles[i][1] * this.h, this.w, this.h);
			}
		}
		for (var i = 0; i < guards.length; i++){
			var g = guards[i];
			if (Math.abs(g.x - this.x) * this.w < (g.radius-5) && Math.abs(g.y - this.y) * this.h < (g.radius-5)){
				this.health--;
				//.log(this.health);
				this.reset();
				return;
			}
		}		
	}
});
//***************************************

//**************** GEM ******************
window.Gem = Class.extend({
	init: function(x, y, w, h, img){
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;
		this.img = img;
	},

	draw: function(ctx){
		this.drawLight(ctx);
		ctx.fillStyle = 'purple';
		ctx.strokeStyle = 'purple';
		ctx.stroke();
		ctx.fill();
		ctx.drawImage(this.img, this.x*this.w, this.y*this.h, this.w, this.h);
	},

	drawLight: function(ctx){
		var ambientLight = 0.0;
		var intensity = 1;
		this.radius = 40;
		var amb = 'rgba(255,0,255,' + (1-ambientLight) + ')';
		var drawx = this.x * this.w, drawy = this.y * this.h;

		var g = ctx.createRadialGradient(drawx+9, drawy+9, 0, drawx+9, drawy+9, this.radius);
		g.addColorStop(1, 'rgba(255,0,255,' + (1-intensity) + ')');
		g.addColorStop(0, amb);
		ctx.fillStyle = g;
		ctx.fillRect(drawx - this.radius, drawy - this.radius, 800, 800);
	}
});
//***************************************

//**************** FIRE *****************
window.Fire = Class.extend({
	init: function(x, y, w, h, img){
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;
		this.img = img;
	},

	draw: function(ctx){
		this.drawLight(ctx);
		ctx.drawImage(this.img, this.x*this.w, this.y*this.h, this.w, this.h);
	},

	drawLight: function(ctx){
		var ambientLight = 0.0;
		var intensity = 1;
		var radius = 60;
		var amb = 'rgba(255,0,0,' + (1-ambientLight) + ')';
		var drawx = this.x * this.w, drawy = this.y * this.h;

		var g = ctx.createRadialGradient(drawx+9, drawy+9, 0, drawx+9, drawy+9, radius);
		g.addColorStop(1, 'rgba(255,0,0,' + (1-intensity) + ')');
		g.addColorStop(0, amb);
		ctx.fillStyle = g;
		ctx.fillRect(drawx - radius, drawy - radius, drawx + radius, drawy + radius);
	}
});
//***************************************

window.Escape = Class.extend({
	init: function(x, y, w, h, img){
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;
		this.img = img;
	},

	draw: function(ctx){
		this.drawLight(ctx);
		ctx.drawImage(this.img, this.x*this.w, this.y*this.h, this.w, this.h);
	},

	drawLight: function(ctx){
		var ambientLight = 0.0;
		var intensity = 1;
		var radius = 60;
		var amb = 'rgba(161,97,8,' + (1-ambientLight) + ')';
		var drawx = this.x * this.w, drawy = this.y * this.h;

		var g = ctx.createRadialGradient(drawx+9, drawy+9, 0, drawx+9, drawy+9, radius);
		g.addColorStop(1, 'rgba(161,97,8,' + (1-intensity) + ')');
		g.addColorStop(0, amb);
		ctx.fillStyle = g;
		ctx.fillRect(drawx - radius, drawy - radius, 800, 800);
	}
});
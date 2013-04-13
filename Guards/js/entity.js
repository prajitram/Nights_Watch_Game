(function(){
	function Guard(x, y, gw, gh){
		this.x = x; 
		this.y = y;
		this.w = gw;
		this.h = gh;

		this.timeConst = 300;
		this.pixelx = 0; 
		this.pixely = 0;
		this.path = '';
		this.endpts = [];
		this.counter = 0;

		this.maxfire = 1000;
		this.fire = this.maxfire;
		this.fireLoss = 18;
	}

	Guard.prototype.moveTo = function(x, y, graph){
		//var curx = this.endpts[this.counter][0], cury = this.endpts[this.counter][1];
		//console.log(x, y, this.x, this.y);
		var start = graph.nodes[this.x][this.y];
		var end = graph.nodes[x][y];
		this.endx = x;
		this.endy = y;
		this.graph = graph;
		this.path = astar.search(graph.nodes, start, end);
		//console.log(this.path);
		return this.path;
	}

	Guard.prototype.step = function(){
		if (this.path == null || this.path.length == 0) return;
		var node = this.path[0];
		this.x = node.x;
		this.y = node.y;
		this.path.shift();
	}

	Guard.prototype.recalc = function(graph){
		if (this.path == null || this.path.length == 0) return;
		return this.moveTo(this.endx, this.endy, graph);
	}

	//must pick path beforehand and then press go

	Guard.prototype.update = function(dt){
		this.fire -= this.fireLoss*dt;
		//console.log(this.fire);

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
			console.log(this.counter, this.path.length, this.endpts.length);
			if (this.path.length == 0 && this.endpts.length >= 1){
				
				console.log(this.endpts[this.counter]);
				this.moveTo(this.endpts[this.counter][0], this.endpts[this.counter][1], this.graph);
				this.counter = (this.counter+1) % this.endpts.length;
			}
		}
		//console.log(this.pixelx + " "+ this.pixely + " " + this.w + " " + this.h );
		//console.log(this.x + " " + this.y)
	}

	Guard.prototype.marker = function(x, y, graph){
		this.endpts = [];
		this.counter = 0;
		return this.moveTo(x, y, graph);
	}

	Guard.prototype.addPath = function(x, y, graph){
		this.endpts.push([x, y]);
		this.graph = graph;
		if (this.path.length == 0)
		{	
			//console.log('ugh;)');
			return this.moveTo(x, y, graph);
		}
	}

	Guard.prototype.replenishFire = function(){this.fire = this.maxfire;}

	Guard.prototype.getPath = function(){return this.path;}

	window.Guard = Guard;
})();

(function(){
	function Thief(x, y, gw, gh){
		this.x = x;
		this.y = y;
		this.w = gw;
		this.h = gh;
		this.timeConst = 300;
		this.pixelx = 0; 
		this.pixely = 0;
	}

	Thief.prototype.moveTo = function(x, y, graph){
		var start = graph.nodes[this.x][this.y];
		var end = graph.nodes[x][y];
		this.endx = x;
		this.endy = y;
		console.log(this.x, this.y, x, y)
		this.graph = graph;
		this.path = astar.search(graph.nodes, start, end);
		console.log(this.path);
		return this.path;
	}

	Thief.prototype.update = function(dt){
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
		console.log(this.pixelx + " "+ this.pixely + " " + this.w + " " + this.h );
		//console.log(this.x + " " + this.y)
	}

	window.Thief = Thief;
})();

(function(){
	function Fire(x, y)
	{
		this.x = x;
		this.y = y;
	}

	window.Fire = Fire;
})();

(function(){
	function Gem(x, y){
		this.x = x;
		this.y = y;
	}

	window.Gem = Gem;
})();
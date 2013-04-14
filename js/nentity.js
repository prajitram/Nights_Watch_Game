//*************** MOVER *****************
var Mover = Class.extend({
	init: function(x, y, w, h, graph){
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;
		this.graph = graph;

		this.timeConst = 100;
		this.pixelx = 0;
		this.pixely = 0;
	},

	moveTo: function(x, y, graph){
		graph = graph || this.graph;
		var start = graph.nodes[this.x][this.y];
		var end = graph.nodes[x][y];
		this.endx = x;
		this.endy = y;
		this.path = astar.search(graph.nodes, start, end);
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
	init: function(x, y, w, h, graph){
		this._super(x, y, w, h, graph);

		this.maxfire = 1000;
		this.fire = this.maxfire;
		this.fireLoss = 18;

		this.counter = 0;
		this.circlePath = [];
		this.loopPath = false;
	},

	moveTo: function(x, y){
		this._super(x, y);
	},

	update: function(dt){
		this._super(dt);
		this.fire -= this.fireLoss*dt;

		if (this.loopPath && this.path.length == 0 && this.circlePath.length >= 1){
			this.moveTo(this.circlePath[this.counter][0], this.circlePath[this.counter][1]);
			this.counter = (this.counter+1) % this.circlePath.length;
		}
	},

	replenishFire: function(){
		this.fire = this.maxfire;
	},

	startPath: function(){
		this.loopPath = true;
	},

	addToPath: function(x, y){
		this.circlePath.push([x, y]);
	},

	resetPath: function(){
		this.circlePath = [];
	},

	straightTo: function(x, y){
		this.loopPath = false;
		this.moveTo(x, y);
	},

	updateGraph: function(graph){
		this._super(graph);
	},

	draw: function(ctx){
		this._super(ctx, 'blue');
	}
});
//***************************************

//*************** ROBBER ****************
window.Robber = Mover.extend({
	init: function(x, y, w, h, graph, gems, fires){
		this._super(x, y, w, h, graph);
		this.gems = gems;
		this.fires = fires;
		this.weightGraph = this.graph;
		this.guardWeight = 30;
		this.fireWeight = 15;
	},

	moveTo: function(x, y){
		this._super(x, y, this.weightGraph);
	},

	update: function(dt){
		this._super(dt);
	},

	updateGraph: function(graph){
		this._super(graph);
	},

	draw: function(ctx){
		this._super(ctx, 'green');
	}
});
//***************************************

//**************** GEM ******************
window.Gem = Class.extend({
	init: function(x, y, w, h){
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;
	},

	draw: function(ctx){
		ctx.fillStyle = 'purple';
		ctx.fill();
		ctx.fillRect(this.x * this.w, this.y * this.h, this.w, this.h);
	}
});
//***************************************

//**************** FIRE *****************
window.Fire = Class.extend({
	init: function(x, y, w, h){
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;
	},

	draw: function(ctx){
		ctx.fillStyle = 'red';
		ctx.fill();
		ctx.fillRect(this.x * this.w, this.y * this.h, this.w, this.h);
	}
});
//***************************************
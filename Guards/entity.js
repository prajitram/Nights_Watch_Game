(function(){
	function Guard(x, y)
	{
		this.x = x; 
		this.y = y;
	}

	Guard.prototype.moveTo = function(x, y, graph)
	{
		var start = graph.nodes[this.y][this.x];
		var end = graph.nodes[y][x];
		return astar.search(graph.nodes, start, end);
	}

	window.Guard = Guard;
})();
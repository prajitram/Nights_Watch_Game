(function(){
	var images = {};

	function load(imgs, keys, callback)
	{
		var counter = 0;
		for (var i = 0; i < imgs.length; i++){
			var img = new Image();
			img.onload = function(){
				counter++;
				if (counter == imgs.length){
					callback();
				}
			}
			images[keys[i]] = img;
			img.src = imgs[i];
		}
	}

	function getImg(url){
		var img = images[url];
		if (img) return img;
		else throw new Error("Can't find image " + url);
	}

	window.load = load;
	window.getImg = getImg;
})();
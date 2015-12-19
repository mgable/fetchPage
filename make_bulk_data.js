"use strict";
(function() {
	var fs  = require("fs"), 
		util = require('./util.js'),
		config = require('./config.js'),
		category = config.category.name,
		filename = category + ".formatted.json",
		document = JSON.parse(read(category));

	save(filename, category, parse(document));

	function parse(line){
		var results = '';

		//console.info(line.length);

		if (typeof line === "object"){
			line.forEach(function(v,i,a){
				var str = JSON.stringify({"index":{"_id": (i+1)}});
				results += str + "\n" + JSON.stringify(v) + "\n";
			})

			return results;
		}

		return line;
	}

	function save(filename, category, rawData){
		var path = util.getIndexPathAndFile(category)
		fs.writeFileSync(path, rawData);
		console.info("wrote file " + path);
	}

	function read(category){
		var path = (util.getStoreFilePath(category) + category + ".json");
		return fs.readFileSync(path).toString()
	}
})()
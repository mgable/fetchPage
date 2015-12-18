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
		console.info(config.dataRoot + "to_be_indexed/" + category + "/" + filename);
		fs.writeFileSync(config.dataRoot + "to_be_indexed/" + category + "/" + filename, rawData);
		console.info("wrote file " + filename);
	}

	function read(category){
		return fs.readFileSync(config.dataRoot + "store/" + category + "/" + category + ".json").toString()
	}
})()
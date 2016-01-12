"use strict";
(function() {
	var fs  = require("fs"), 
		util = require('./util.js'),
		config = require('./config.js'),
		category = config.category.name,
		filename = category + ".formatted.json",
		path = util.getStoreFilePath(category) + category + ".json",
		document = util.getFileContents(path);

	save(filename, category, parse(document));

	function parse(line){
		var results = '';

		if (typeof line === "object"){
			line.forEach(function(value, index){
				var str = JSON.stringify({"index":{"_id": (index + 1)}});
				results += str + "\n" + JSON.stringify(value) + "\n";
			});

			return results;
		}

		return line;
	}

	function save(filename, category, data){
		var path = util.getIndexPathAndFile(category);
		fs.writeFileSync(path, data);
		util.logger.log("saving bulk import file: " + path);
	}
})();
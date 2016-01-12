"use strict";
(function(){
	var fs = require("fs"),
		config = require('./config.js'),
		_ = require("underscore"),
		util = require('./util.js'),
		category = config.category.name ,
		basePath = config.dataRoot + category + "/diffs/",
		fileName = category + ".json",
		index = [];

	var years = reject(util.readDirectory(basePath));

	// cycle through years
	years.forEach(function(year){
		var yearPath = basePath + year + "/",
			months = reject(util.readDirectory(yearPath));

		// cycle through months
		months.forEach(function(month){
			var monthPath = yearPath + month + "/",
				days = reject(util.readDirectory(monthPath));

			// cycle through days
			days.forEach(function(day){
				var dayPath = monthPath + day + "/" + fileName;
				if (util.fileExists(dayPath)){
					var file = util.getFileContents(dayPath);
					index = index.concat(file);
				} 
			});
		});
	});

	fs.writeFileSync(util.getStoreFilePath(category) + fileName, JSON.stringify(index));

	util.logger.log("saving index file: " + util.getStoreFilePath(category) + fileName);

	function reject(data){
		return _.reject(data, function(name){ return /^\./.test(name);});
	}
})();
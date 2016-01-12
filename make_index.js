"use strict";

var fs = require("fs"),
	config = require('./config.js'),
	_ = require("underscore"),
	util = require('./util.js'),
	basePath = config.dataRoot + config.category.name + "/diffs/",
	fileName = config.category.name + ".json",
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

fs.writeFileSync(basePath + "test_ " + fileName, JSON.stringify(index));

function reject(data){
	return _.reject(data, function(name){ return /^\./.test(name)});
}
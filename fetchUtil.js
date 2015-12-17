"use strict";

(function() {
	var config = require('./fetchConfig.js'),
		today = new Date(), utils = {};

	function getDateString(d){
		var date = d || today;
		return date.getFullYear().toString() + (date.getMonth()+1) + date.getDate();
	} 

	function getFileName(name, suffix, fileOverwrite){
		return name + "_" + (fileOverwrite || getDateString()) + "." + suffix;
	}

	function getPath(name, fileOverwrite){
		return config.dataRoot + "raw/" + name + "/" + (fileOverwrite || getDateString());
	}

	utils.getDateString = getDateString;
	utils.getFileName = getFileName
	utils.getPath = getPath;

	module.exports = utils;
})()
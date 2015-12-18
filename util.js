"use strict";

(function() {
	var config = require('./config.js'),
		fs  = require("fs"),
		today = new Date(), utils = {};

	function getDateString(d){
		var date = d || today;
		return date.getFullYear().toString() + (date.getMonth()+1) + date.getDate();
	} 

	function getFileName(name, suffix, fileOverwrite){
		return name + "_" + (fileOverwrite || getDateString()) + "." + suffix;
	}

	function getRawDataPath(name, fileOverwrite){
		return config.dataRoot + "raw/" + name + "/" + (fileOverwrite || getDateString());
	}

	function getFileContents(filename){
		if (!filename) return false;
			
		if (fileExists(filename)){
			return JSON.parse(fs.readFileSync(filename).toString());
		} else {
			return false;
		}
	}

	function fileExists(filePath){
	    try {
	        return fs.statSync(filePath).isFile();
	    } catch (err) {
	        return false;
	    }
	}

	function getStoreFilePath(category){
		return config.dataRoot + 'store/' + category;
	}

	function getImagePath(category, dateStr){
		return getStoreFilePath(category) + "/images/" +  dateStr;
	}

	utils.getDateString = getDateString;
	utils.getFileName = getFileName;
	utils.getRawDataPath = getRawDataPath;
	utils.getFileContents = getFileContents;
	utils.fileExists = fileExists;
	utils.getStoreFilePath = getStoreFilePath;
	utils.getImagePath = getImagePath;

	module.exports = utils;
})()
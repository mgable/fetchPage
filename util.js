"use strict";

(function() {
	var config = require('./config.js'),
		fs  = require("fs"),
		Q = require("q"),
		http = require("http"),
		url = require('url'),
		today = new Date(), util = {};

	function getDateString(d){
		var date = d || today;
		return date.getFullYear().toString() + (date.getMonth()+1) + date.getDate();
	} 

	function getFileName(name, suffix, fileOverwrite){
		return name + "_" + (fileOverwrite || getDateString()) + "." + suffix;
	}

	function getRawDataPath(name, fileOverwrite){
		return config.dataRoot + name + "/raw/"  + (fileOverwrite || getDateString()) + "/";
	}

	function getPageTemplate(id){
		return config.pageUrlTemplate.replace(/( \*{3}) config\.category\.id (\*{3} )/, id);
	}

	function getFileContents(filename){
		if (!filename) return false;
			
		if (fileExists(filename)){
			return JSON.parse(fs.readFileSync(filename).toString());
		} else {
			return false;
		}
	}

	function generateUID() {
		return ("0000" + (Math.random()*Math.pow(36,4) << 0).toString(36)).slice(-4);
	}

	function fileExists(filePath){
	    try {
	        return fs.statSync(filePath).isFile();
	    } catch (err) {
	        return false;
	    }
	}

	function getStoreFilePath(category){
		return config.dataRoot  + category + '/store/';
	}

	function getImagePath(category, dateStr){
		return getStoreFilePath(category) + "images/" +  dateStr + "/";
	}

	function getIndexPathAndFile(category){
		return config.dataRoot +  category + "/to_be_indexed/" + category + ".formatted.json";
	}

	function fetchPage(options){
		var deferred = Q.defer(),
			container = [],
			req = http.request(options, function(res) {

				res.setEncoding('utf8');

				res.on('data', function (chunk) {
					container += chunk;
				});

				res.on('end', function(){
					return deferred.resolve(container)
				});
			});

		req.on('error', function(e) {
			console.error('problem with request: ' + e.message);
			deferred.reject;
		});

		// write data to request body
		req.write('data\n');
		req.end();

		return deferred.promise
	}

	function makeOptions(urlstr){
		var urlObj = (url.parse(urlstr));

		var	options = {
			host: urlObj.host,
			port: 80,
			path: urlObj.path,
			method: 'GET'
		};

		return options;
	}

	util.getDateString = getDateString;
	util.getFileName = getFileName;
	util.getRawDataPath = getRawDataPath;
	util.getFileContents = getFileContents;
	util.fileExists = fileExists;
	util.getStoreFilePath = getStoreFilePath;
	util.getImagePath = getImagePath;
	util.getIndexPathAndFile = getIndexPathAndFile;
	util.getPageTemplate = getPageTemplate;
	util.generateUID = generateUID;
	util.fetchPage = fetchPage;
	util.makeOptions = makeOptions;

	module.exports = util;
})()
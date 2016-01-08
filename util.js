"use strict";

(function() {
	var config = require('./config.js'),
		fs  = require("fs"),
		nodefs = require("node-fs"),
		Q = require("q"),
		http = require("http"),
		url = require('url'),
		logger = require('./logging.js'),
		today = new Date(), util = {};

	function getDateString(d){
		var date = d || today;
		return date.getFullYear().toString() + pad(date.getMonth()+1) + pad(date.getDate());
	} 

	function pad(date){
		return ("00" + date).slice(-2);
	}

	function getFileName(name, suffix, fileOverwrite){
		return name + "_" + (fileOverwrite || getDateString()) + "." + suffix;
	}

	function getRawDataPath(name, fileOverwrite){
		return config.dataRoot + name + "/raw/"  + makePathFromDateString(fileOverwrite || getDateString()) + "/";
	}

	function getDiffPath(name, dateStr){
		return config.dataRoot + name + "/diffs/" + makePathFromDateString(dateStr) + "/";
	}

	function getPageTemplate(id){
		return config.pageUrlTemplate.replace(/( \*{3}) config\.category\.id (\*{3} )/, id);
	}

	function getRawS3Path(name, fileOverwrite){
		return name + "/" + makePathFromDateString((fileOverwrite || getDateString())) + "/";
	}

	function makePathFromDateString(dateStr){
		var date = dateStr.match(/(\d{4})(\d{2})(\d{2})/);
		date.shift();
		return date.join("/");
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
			container = "",
			req = http.request(options, function(res) {

				res.setEncoding('utf8');

				res.on('data', function (chunk) {
					container += chunk;
				});

				res.on('end', function(){
					return deferred.resolve(container)
				});

				res.on('error', function(err){
					util.logger.log(err, 'error');
				});
			});

		req.on('error', function(err) {
			util.logger.log(err, 'error');
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
			method: 'GET',
			agent: false
		};

		return options;
	}

	function makeDirectories(path){
		nodefs.mkdirSync(path, "41777", true);
	}

	util.makeDirectories = makeDirectories;
	util.getDateString = getDateString;
	util.getFileName = getFileName;
	util.getRawDataPath = getRawDataPath;
	util.getFileContents = getFileContents;
	util.getDiffPath = getDiffPath;
	util.fileExists = fileExists;
	util.getStoreFilePath = getStoreFilePath;
	util.getImagePath = getImagePath;
	util.getIndexPathAndFile = getIndexPathAndFile;
	util.getPageTemplate = getPageTemplate;
	util.generateUID = generateUID;
	util.fetchPage = fetchPage;
	util.makeOptions = makeOptions,
	util.getRawS3Path = getRawS3Path;
	util.logger = logger;

	module.exports = util;
})()
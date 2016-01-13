"use strict";
(function(){
	require('datejs');

	var fs  = require("fs"),
		nodefs = require("node-fs"),
		_ = require("underscore"),
		config = require('./config.js'),
		util = require('./util.js'),
		Q = require("q"),
		fetch = require('./fetch_images.js'),
		program = require('commander'),
		where = config.sys_config.system;

	program
		.version('0.0.1')
		.option('-i, --noimages', 'no images')
		.option('-t, --test', 'testing')
		.parse(process.argv);

	fetch.setDownloadFlag(!program.noimages);

	var	category = config.category.name,
		dateStr = program.args[0] || util.getDateString(), // an optional date string e.g. '20151213' to retrieve historical data

		// make all paths
		rawDataPath = util.getRawDataPath(category, dateStr, where), // path to raw data (today or historical)
		storeFilePath = util.getStoreFilePath(category, where), //config.dataRoot + category + 'store/' ,
		imagePath = util.getImagePath(category, dateStr, where), //storeFilePath + "images/" +  dateStr,
		diffPath = util.getDiffPath(category, dateStr, where), //config.dataRoot + category + '/diff/' + dateStr ,
		storeFile =  storeFilePath + category + ".json",
		todayPath = rawDataPath + util.getFileName(category, "json", dateStr),
		yesterdayPath = getYesterdayFileName(dateStr);

	getDataFromLocal();

	function parse(data){
		var results = JSON.parse(data.toString());
		return results;
	}

	function getDataFromLocal(){
		// get data for today and yesterday
		var today = util.getFileContents(todayPath), //name, suffix, dateStr
			yesterday = util.getFileContents(yesterdayPath) || [],

			// get existing information
			store = util.getFileContents(storeFile) || [];

		fetchImages(diff(today, yesterday)).then(function(data){
			save(store, data);
		});
	}

	function getDataFromS3(){
		var todayPromise = util.fetchPage(util.makeOptions(todayPath)).then(parse),
			yesterdayPromise = util.fetchPage(util.makeOptions(yesterdayPath)).then(parse),
			storePromise = util.fetchPage(util.makeOptions(storeFile)).then(parse);


		Q.all([todayPromise, yesterdayPromise, storePromise]).then(function(data){
			var today = data[0],
				yesterday = data[1] || [],
				store = data[2] || [];

			fetchImages(diff(today, yesterday)).then(function(data){
				save(store, data);
			});
		});
	}

	function fetchImages(newest){
		// the meat of the matter
		return fetch.fetchImages(dateStr, imagePath, newest).then(function(data){
			return fetch.fetchAdditionalImages(dateStr, imagePath, data);
		}).then(function(data){
			console.info("done receiving data");
			return Q.all(data).then(function(data){
				console.info("TOTALLY DONE!!!!");
				return data;
			});
		});
	}

	function getYesterdayFileName(filename){
		if (!filename) {
			var yesterday = util.getDateString(Date.today().add(-1).days());
			return util.getRawDataPath(category, yesterday, where) +  util.getFileName(category, "json", yesterday);
		} else {

			var dateArray = filename.match(/(\d{4})(\d{2})(\d{2})/).splice(1).map(function(v){return parseInt(v,10);});
			dateArray.unshift(null);

			var	uncorrectedDate = new (Function.prototype.bind.apply(Date, dateArray)), // jshint ignore:line
				correctedDate = uncorrectedDate.last().month().add(-1).days(),
				dateStr = util.getDateString(correctedDate);

			return util.getRawDataPath(category, dateStr, where) +  util.getFileName(category, "json", dateStr);
		}
	}

	function diff(today, yesterday){
		var results = [];
		top:
		for (var a = 0; a < today.length; a++){
			var current = today[a];
			for (var b = 0; b < yesterday.length; b++){
				var compare = yesterday[b];
				if (_.isEqual(current.link, compare.link)){
					yesterday.splice(b,1);
					continue top;
				}
			}
			results.push(current);
		}

		util.logger.log("There are " + results.length + " new items added for " + dateStr);
		return results;
	}

	function save(store, data){
		var allData = store.concat(data);

		if(!program.test){
			saveIndex(storeFile, allData);
			saveDiff(data);
		} else {
			console.info("saving file " + storeFile);
			util.logger.log("Just a test - nothing saved");
		}
	}

	function makeFileName(path, category){
		return path + category + ".json";
	}

	function saveIndex(filename, data){
		fs.writeFileSync(filename, JSON.stringify(data));
		//util.saveToS3(filename, data, config.contentType.jpg);
		util.logger.log("the total number of items is " + data.length);
		util.logger.log("wrote file " + filename);
	}

	function saveDiff(data){
		var file = makeFileName(diffPath, category);
		//util.saveToS3(filename, data, config.contentType.json);
		nodefs.mkdirSync(diffPath, "41777", true);
		fs.writeFileSync(file, JSON.stringify(data));
		util.logger.log("saving diff file " + file);
	}
})();
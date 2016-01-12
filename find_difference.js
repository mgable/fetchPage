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
		program = require('commander');

	program
		.version('0.0.1')
		.option('-i, --noimages', 'no images')
		.option('-t, --test', 'testing')
		.parse(process.argv);

	fetch.setDownloadFlag(!program.noimages);

	var	category = config.category.name,
		dateStr = program.args[0] || util.getDateString(), // an optional date string e.g. '20151213' to retrieve historical data

		// make all paths
		rawDataPath = util.getRawDataPath(category, dateStr), // path to raw data (today or historical)
		storeFilePath = util.getStoreFilePath(category), //config.dataRoot + category + 'store/' ,
		imagePath = util.getImagePath(category, dateStr), //storeFilePath + "images/" +  dateStr,
		diffPath = util.getDiffPath(category, dateStr), //config.dataRoot + category + '/diff/' + dateStr ,

		// get data for today and yesterday
		today = util.getFileContents(rawDataPath + util.getFileName(category, "json", dateStr)), //name, suffix, dateStr
		yesterday = util.getFileContents(getYesterdayFileName(dateStr)) || [],

		// get existing information
		storeFile =  storeFilePath + category + ".json",
		store = util.getFileContents(storeFile) || [],

		// the diff for today versus yesterday expressed in items
		newest = diff(today, yesterday);

	// the meat of the matter
	fetch.fetchImages(dateStr, imagePath, newest).then(function(data){
		return fetch.fetchAdditionalImages(dateStr, imagePath, data);
	}).then(function(data){
		console.info("done receiving data");
		Q.all(data).then(function(data){
			console.info("TOTALLY DONE!!!!");
			save(storeFile, data);
		});
	});

	function getYesterdayFileName(filename){
		if (!filename) {
			var yesterday = util.getDateString(Date.today().add(-1).days());
			return util.getRawDataPath(category, yesterday) +  util.getFileName(category, "json", yesterday);
		} else {

			var dateArray = filename.match(/(\d{4})(\d{2})(\d{2})/).splice(1).map(function(v){return parseInt(v,10);});
			dateArray.unshift(null);

			var	uncorrectedDate = new (Function.prototype.bind.apply(Date, dateArray)), // jshint ignore:line
				correctedDate = uncorrectedDate.last().month().add(-1).days(),
				dateStr = util.getDateString(correctedDate);

			return util.getRawDataPath(category, dateStr) +  util.getFileName(category, "json", dateStr);
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

	function save(filename, data){
		console.info("saving data");
		var allData = store.concat(data);

		if(!program.test){
			saveDiff(data);
			saveIndex(filename, allData);
		} else {
			console.info("saving file " + filename);
			util.logger.log("Just a test - nothing saved");
		}
	}

	function makeFileName(path, category){
		return path + category + ".json";
	}

	function saveIndex(filename, data){
		fs.writeFileSync(filename, JSON.stringify(data));
		util.logger.log("the total number of items is " + data.length);
		util.logger.log("wrote file " + filename);
	}

	function saveDiff(data){
		var filename = makeFileName(diffPath, category);
		nodefs.mkdirSync(diffPath, "41777", true);
		fs.writeFileSync(filename, JSON.stringify(data));
		util.logger.log("saving diff file " + filename);
	}
})();
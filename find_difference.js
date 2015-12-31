"use strict";
(function(){
	require('datejs');

	var fs  = require("fs"),
		_ = require("underscore"),
		config = require('./config.js'),
		util = require('./util.js'),
		fetch = require('./fetch_images.js'),
		program = require('commander');

	program
		.version('0.0.1')
		.option('-i, --noimages', 'no images')
		.option('-t, --test', 'testing')
		.parse(process.argv);

	var	category = config.category.name,
		fileOverwrite = program.args[0], // an optional date string e.g. '20151213' to retrieve historical data
		dateStr = fileOverwrite || util.getDateString(), // official date label use for file names and paths

		// make all paths
		rawDataPath = util.getRawDataPath(category, fileOverwrite), // path to raw data (today or historical)
		storeFilePath = util.getStoreFilePath(category), //config.dataRoot + 'store/' + category,
		imagePath = util.getImagePath(category, (fileOverwrite || util.getDateString())), //storeFilePath + "/images/" +  (fileOverwrite || util.getDateString()),

		// get data for today and yesterday
		today = util.getFileContents(rawDataPath + util.getFileName(category, "json", fileOverwrite)), //name, suffix, fileOverwrite
		yesterday = util.getFileContents(getYesterdayFileName(fileOverwrite)) || [],

		// get existing information
		storeFile =  storeFilePath + category + ".json",
		store = util.getFileContents(storeFile) || [],
		
		// the diff for today versus yesterday expressed in items
		newest = diff(today, yesterday);

		fetch.fetchImages(dateStr, imagePath, newest, !program.noimages);
		// SHOULD BE THEN

		fetch.fetchAdditionalImages(newest, imagePath);
		// SHOULD BE THEN

	console.info("There are " + newest.length + " new items added for " + dateStr);

	// THIS SHOULD BE IN THE THEN STATEMENT
	if(!program.test){
		console.info("saving");
		save(storeFile, newest);
	} else {
		console.info("Just a test - nothing saved");
	}

	function getYesterdayFileName(filename){
		if (!filename) {
			var yesterday = util.getDateString(Date.today().add(-1).days());
			return util.getRawDataPath(category, yesterday) +  util.getFileName(category, "json", yesterday);
		} else {

			var dateArray = filename.match(/(\d{4})(\d{2})(\d{2})/).splice(1).map(function(v){return parseInt(v,10)});
			dateArray.unshift(null);

			var	uncorrectedDate = new (Function.prototype.bind.apply(Date, dateArray)),
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

		return results;
	}

	function save(filename, data){
		var newData = store.concat(data);

		fs.writeFileSync(filename, JSON.stringify(newData));
		console.info("the total number of items is " + newData.length);
		console.info("wrote file " + filename);
	}
})()
"use strict";
require('datejs');

var fs  = require("fs"),
	_ = require("underscore"),
	config = require('./fetchConfig.js'),
	util = require('./fetchUtil.js'),
	fetch = require('./fetchImages.js'),
	category = config.category.name,
	fileOverwrite = process.argv[2],
	dateStr = fileOverwrite || util.getDateString(),
	path = util.getPath(category, fileOverwrite),
	today = getFileContents(path + "/" + util.getFileName(category, "json", fileOverwrite)), //name, suffix, fileOverwrite
	yesterday = getFileContents(getYesterdayFileName(fileOverwrite)) || [],
	storeFile = config.dataRoot + 'store/' + category + "/" + category + ".json",
	store = getFileContents(storeFile) || [],
	imagePath = config.dataRoot + "store/" + category + "/images/" +  (fileOverwrite || util.getDateString()),
	newest = [];

diff();

console.info("the number of new items is " + newest.length);

newest = fetch.fetchImages(dateStr, imagePath, newest);

console.info("AFTER the number of new items is " + newest.length);

save(storeFile, newest);

function getYesterdayFileName(filename){
	if (!filename) {
		var dateStr = util.getDateString(Date.today().add(-1).days());
		return util.getPath(category, dateStr) + "/" +  util.getFileName(category, "json", dateStr);
	} else {

		var dateArray = filename.match(/(\d{4})(\d{2})(\d{2})/).splice(1).map(function(v){return parseInt(v,10)});
		dateArray.unshift(null);

		var	uncorrectedDate = new (Function.prototype.bind.apply(Date, dateArray)),
			correctedDate = uncorrectedDate.last().month().add(-1).days(),
			dateStr = util.getDateString(correctedDate);

		return util.getPath(category, dateStr) + "/" + util.getFileName(category, "json", dateStr);
	}
}

function diff(){
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
		newest.push(current);
	}

	return newest;
}

function save(filename, data){
	var newData = store.concat(data);

	fs.writeFileSync(filename, JSON.stringify(newData));
	console.info("the total number of items is " + newData.length);
	console.info("wrote file " + filename);
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
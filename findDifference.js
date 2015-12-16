"use strict";
require('datejs');

var fs  = require("fs"),
	_ = require("underscore"),
	today = getFileContents(__dirname + "/data/raw/" + ( process.argv[2] || getFileName() ) ),
	yesterday = getFileContents(__dirname + "/data/raw/" +  (process.argv[3] || getYesterdayFileName(process.argv[2]))) || [],
	store = getFileContents(__dirname + "/data/store/tins.json") || [],
	newest = [];

console.info("the number of items from today is " + today.length);
console.info("the number of items from yesterday is " + yesterday.length);

diff();

console.info("the number of new items is " + newest.length);

save(newest);

function getYesterdayFileName(filename){
	if (!filename) {
		return getFileName(Date.today().add(-1).days());
	} else {

		var dateArray = filename.match(/(\d{4})(\d{2})(\d{2})/).splice(1).map(function(v){return parseInt(v,10)});
		dateArray.unshift(null);

		var	uncorrectedDate = new (Function.prototype.bind.apply(Date, dateArray)),
			correctedDate = uncorrectedDate.last().month().add(-1).days();

		return getFileName(correctedDate);
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

function getFileName(date){
	var d = date || new Date(),
		filename = "cw_tins_" + d.getFullYear().toString() + (d.getMonth()+1) + d.getDate() + ".json";

	return filename;
}

function save(data){
	var newData = store.concat(data),
		filename = __dirname + "/data/store/tins.json";

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
    try
    {
        return fs.statSync(filePath).isFile();
    }
    catch (err)
    {
        return false;
    }
}
"use strict";
var util = require('./util.js'),
	config = require('./config.js'),
	category = config.category.name;

var options = util.makeOptions('https://s3-us-west-1.amazonaws.com/collectors-db/advertising_tins/raw/2015/12/14/advertising_tins_20151214.json');

var dateStr = "20151214";

var rawDataPath = util.getRawDataPath(category, dateStr), // path to raw data (today or historical)
	storeFilePath = util.getStoreFilePath(category), //config.dataRoot + category + 'store/' ,
	imagePath = util.getImagePath(category, dateStr), //storeFilePath + "images/" +  dateStr,
	diffPath = util.getDiffPath(category, dateStr); //config.dataRoot + category + '/diff/' + dateStr ,

console.info(rawDataPath);
console.info(storeFilePath);
console.info(imagePath);
console.info(diffPath);

// util.fetchPage(options).then(function(data){
// 	console.info("got data");
// 	console.info(data);
// });
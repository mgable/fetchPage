"use strict";
 var config = require('./fetchConfig.js');

var date = new Date(), utils = {};

function getDateString(){
	return date.getFullYear().toString() + (date.getMonth()+1) + date.getDate();
} 

function getFileName(name, suffix){
	return name + "_" + getDateString() + "." + suffix;
}

function getPath(name){
	return config.dataRoot + "raw/" + name + "/" + getDateString();
}

utils.getDateString = getDateString;
utils.getFileName = getFileName
utils.getPath = getPath;

module.exports = utils;
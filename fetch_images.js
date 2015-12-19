"use strict";

var fs = require('fs'),
	request = require('request'),
	fetchUtil = require('./util.js'),
	config = require('./config.js'),
	index = 0;

var download = function(uri, imagePath, filename, callback){
	request.head(uri, function(err, res, body){
		// console.log('content-type:', res.headers['content-type']);
		// console.log('content-length:', res.headers['content-length']);

		request(uri).pipe(fs.createWriteStream(imagePath + filename)).on('close', callback);
	});
};

function fetchImages(dataStr, imagePath, items){
	var dateRE = /\w{3,4}$/;
	addDirectory(imagePath);

	items.forEach(function(v,i){
		var src = {};
		src.original = v.src;

		var suffix = src.original.match(dateRE)[0],
			filename = getFileName(index++, suffix);

		src.local =  makeLocalImagePath(dataStr, filename);
		v.src = src;

		download(src.original, imagePath, filename, function(){
			//console.log('wrote image ' + src.original + ' to ' + filename);
		});

	});

	return items;
}

function makeLocalImagePath(dataStr, filename){
	return dataStr + "/" + filename
}

function getFileName(index, suffix){
	return   index + "." + suffix;
}

function addDirectory(path){
	if (!fs.existsSync(path)) {
		fs.mkdirSync(path);
	}
}

module.exports = {fetchImages: fetchImages};

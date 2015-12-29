"use strict";

var fs = require('fs'),
	request = require('request'),
	fetchUtil = require('./util.js'),
	config = require('./config.js'),
	_ = require('underscore'),
	index = 0;

var download = function(uri, imagePath, filename, callback){
	request.head(uri, function(err, res, body){
		// console.log('content-type:', res.headers['content-type']);
		// console.log('content-length:', res.headers['content-length']);

		request(uri).pipe(fs.createWriteStream(imagePath + filename)).on('close', callback);
	});
};

function fetchImages(dataStr, imagePath, items, downloadImages, callback){
	var dateRE = /\w{3,4}$/,
		callback = callback || _.noop;

	addDirectory(imagePath);

	if (!downloadImages) {
		console.info("not downloading images");
	};

	items.forEach(function(item,index){
		var src = {};
		src.original = item.src;

		var suffix = src.original.match(dateRE)[0],
			filename = getFileName(item.id, suffix);

		src.local =  makeLocalImagePath(dataStr, filename);
		item.src = src;

		if (downloadImages){	
			download(src.original, imagePath, filename, function(){
				callback();
			});
		}

	});

	return items;
}

function makeLocalImagePath(dataStr, filename){
	return dataStr + "/" + filename
}

function getFileName(id, suffix){
	return   id + "-t." + suffix;
}

function addDirectory(path){
	if (!fs.existsSync(path)) {
		fs.mkdirSync(path);
	}
}

module.exports = {fetchImages: fetchImages};

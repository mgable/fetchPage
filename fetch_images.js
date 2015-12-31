"use strict";

var fs = require('fs'),
	request = require('request'),
	fetchUtil = require('./util.js'),
	config = require('./config.js'),
	cheerio = require('cheerio'),
	url = require('url'),
	util = require('./util.js'),
	_ = require('underscore'),
	index = 0;

function download(uri, imagePath, filename, callback){
	var callback = callback || _.noop;
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

function fetchAdditionalImages(items, imagePath){
	var results = [];

	items.forEach(function(item,index){
		util.fetchPage(util.makeOptions(getCompletedItemUrl(item.link))).then(function(data){
			return getCompletedItemLink(data);
		}).then(function (data){
			util.fetchPage(util.makeOptions(data)).then(function(data){
				var additionalImages = collectAdditionalImages(data);
				results.push(downloadAdditionalImages(item, additionalImages, imagePath));
			});
		});
	});

	return results;
}

function collectAdditionalImages(data){
	var $ = cheerio.load(data),
		results = [];

	$(".lst.icon").first().find("li img").each(function(i,v){
		results.push(v.attribs.src);
	});

	return results;
}

function downloadAdditionalImages(item, additionalImages, imagePath){
	item.images = {};
	item.images.original = additionalImages;
	item.images.local = [];

	additionalImages.forEach(function(v,index){
		var filename = item.id + "_i_" + index + ".jpg",
			largerImageUrl = makeLargerImageUrl(v);
		
		console.info("downloading  - " + largerImageUrl);
		download(largerImageUrl, imagePath, filename); //uri, imagePath, filename, callback
		item.images.local.push(imagePath + filename);
	});

	return item;
}

function getCompletedItemLink(data){
	var $ = cheerio.load(data);
	return $(".vi-inl-lnk.vi-cvip-prel3 a")[0].attribs.href;
}

function getCompletedItemUrl(urlstr){
	var urlObj = (url.parse(urlstr, true));
	return urlObj.query.mpre
}

function makeLargerImageUrl(url){
	return url.replace(/(?!s\-l)64/, "600");
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

module.exports = {fetchImages: fetchImages, fetchAdditionalImages: fetchAdditionalImages};

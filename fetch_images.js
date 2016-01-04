"use strict";

var fs = require('fs'),
	request = require('request'),
	Q = require("q"),
	fetchUtil = require('./util.js'),
	config = require('./config.js'),
	cheerio = require('cheerio'),
	url = require('url'),
	util = require('./util.js'),
	_ = require('underscore'),
	downloadImages = true,
	index = 0;

function download(uri, imagePath, filename, callback){
	var callback = callback || _.noop;
	if (downloadImages){
		request.head(uri, function(err, res, body){
			// console.log('content-type:', res.headers['content-type']);
			// console.log('content-length:', res.headers['content-length']);

			request(uri).pipe(fs.createWriteStream(imagePath + filename)).on('close', callback);
		});
		//console.info("DOWNLOADING IMAGE " + uri);
	} else {
		//console.info("NOT - " + uri);
		callback();
	}
};

function setDownloadFlag(flag){
	console.info("setting download images to " + flag);
	downloadImages = flag;
}

function fetchImages(dateStr, imagePath, items){
	var dateRE = /\w{3,4}$/,
		deferred = Q.defer();

	addDirectory(imagePath);

	items.forEach(function(item, index){
		var src = {};
		src.original = item.src;

		var suffix = src.original.match(dateRE)[0],
			filename = getFileName(item.id, suffix),
			itemImagePath = addDirectory(imagePath + item.id);

		src.local =  makeLocalImagePath(dateStr, item.id, filename);
		item.src = src;

		download(src.original, itemImagePath, filename, function(){
			return deferred.resolve(items);
		});

	});

	return deferred.promise;
}

function fetchAdditionalImages(dateStr, imagePath, items){
	var results = items.map(function(item,index){
		var deferred = Q.defer();

		util.fetchPage(util.makeOptions(getCompletedItemUrl(item.link))).then(function(data){
			return getCompletedItemLink(data);
		}).then(function (data){
			util.fetchPage(util.makeOptions(data)).then(function(data){
				var additionalImages = collectAdditionalImages(data);
				return downloadAdditionalImages(item, additionalImages, imagePath, dateStr);
			}).then(function(data){
				console.info("DONE!!!!!");
				return deferred.resolve(data);
			});
		});

		return deferred.promise;
	});

	return results;
}

function collectAdditionalImages(data){
	var $ = cheerio.load(data),
		results = [];

	$(".lst.icon").first().find("li img").each(function(i,v){
		results.push(v.attribs.src);
	});

	if (!results.length){
		results.push($('#icImg').attr("src"));
	}

	return results;
}

function downloadAdditionalImages(item, additionalImages, imagePath, dateStr){
	item.images = {};
	item.images.original = additionalImages;
	item.images.local = [];

	additionalImages.forEach(function(v,index){
		var filename = "i_" + index + ".jpg",
			largerImageUrl = makeLargerImageUrl(v),
			itemImagePath = imagePath + item.id + "/";
		
		// console.info("downloading  - " + largerImageUrl);
		download(largerImageUrl, itemImagePath, filename); //uri, imagePath, filename, callback
		item.images.local.push(makeLocalImagePath(dateStr, item.id, filename));
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
	return url.replace(/(?!s\-l)64/, "400");
}


function makeLocalImagePath(dataStr, id, filename){
	return dataStr + "/" + id + "/" + filename
}

function getFileName(id, suffix){
	return   "t." + suffix;
}

function addDirectory(path){
	if (!fs.existsSync(path)) {
		fs.mkdirSync(path);
	}

	return path + "/";
}

module.exports = {
	fetchImages: fetchImages, 
	fetchAdditionalImages: fetchAdditionalImages,
	setDownloadFlag: setDownloadFlag
};




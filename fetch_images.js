"use strict";

var fs = require('fs'),
	request = require('request'),
	Q = require("q"),
	cheerio = require('cheerio'),
	url = require('url'),
	util = require('./util.js'),
	_ = require('underscore'),
	downloadImages = true;

function download(uri, imagePath, filename, callback){
	var callback = callback || _.noop; // jshint ignore:line

	if (downloadImages){
		console.info("downloading: " + uri);
		request.head(uri, function(err, res, body){
			if (err){
				util.logger.log("ERROR - downloading image: " + uri + " : " + imagePath + filename, 'error');
				callback();
			} 
			request(uri).pipe(fs.createWriteStream(imagePath + filename)).on('close', callback).on('error', function(err){
				util.logger.log("ERROR IN PIPE:" + err, 'error');
				callback();
			});
		});
	} else {
		console.info("not fetching - " + uri);
		callback();
	}
}

function getCompletedItemUrl(urlstr){
	var urlObj = (url.parse(urlstr, true));
	return urlObj.query.mpre;
}

function makeLargerImageUrl(url){
	return url.replace(/(?!s\-l)64/, "400");
}

function getFileName(id, suffix){
	return   "t." + suffix;
}

function downloadAdditionalImages(item, additionalImages, imagePath, dateStr){
	item.images = {};
	item.images.original = additionalImages;
	item.images.local = [];

	additionalImages.forEach(function(v,index){
		var filename = "i_" + index + ".jpg",
			largerImageUrl = makeLargerImageUrl(v),
			itemImagePath = imagePath + item.id + "/";
		
		download(largerImageUrl, itemImagePath, filename); //uri, imagePath, filename, callback
		item.images.local.push(util.makeLocalImagePath(dateStr, item.id, filename));
	});

	return item;
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

function setDownloadFlag(flag){
	console.info("setting download images to " + flag);
	downloadImages = flag;
}

function getCompletedItemLink(data, link){
	try{
		var $ = cheerio.load(data);
		return $("a:contains('See original listing')")[0].attribs.href;
	}catch(e){
		util.logger.log("fetch page ERROR: " + link, 'error');
		return false;
	}
}

function fetchImages(dateStr, imagePath, items){
	console.info("fetch images");
	var dateRE = /\w{3,4}$/,
		deferred = Q.defer();

	if(downloadImages){util.makeDirectories(imagePath);}


	items.forEach(function(item){
		var src = {};
		src.original = item.src;

		var suffix = src.original.match(dateRE)[0],
			filename = getFileName(item.id, suffix),
			itemImagePath = imagePath + item.id + "/";

		if (downloadImages){util.makeDirectories(itemImagePath);}

		src.local =  util.makeLocalImagePath(dateStr, item.id, filename);
		item.src = src;

		download(src.original, itemImagePath, filename, function(){
			return deferred.resolve(items);
		});

	});

	return deferred.promise;
}

function fetchAdditionalImages(dateStr, imagePath, items){
	var results = items.map(function(item){
		var deferred = Q.defer();

		util.fetchPage(util.makeOptions(getCompletedItemUrl(item.link))).then(function (data){
			var completedLink = getCompletedItemLink(data, item.link);
			if (completedLink){
				return completedLink;
			} else {
				return deferred.resolve(item);
			}
		}).then(function (data){
			util.fetchPage(util.makeOptions(data)).then(function (data){
				var additionalImages = collectAdditionalImages(data);
				return downloadAdditionalImages(item, additionalImages, imagePath, dateStr);
			}).then(function (data){
				console.info("all images downloaded?!");
				return deferred.resolve(data);
			});
		});

		return deferred.promise;
	});

	return results;
}

module.exports = {
	fetchImages: fetchImages, 
	fetchAdditionalImages: fetchAdditionalImages,
	setDownloadFlag: setDownloadFlag
};




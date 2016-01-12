"use strict";

var fs = require('fs'),
	request = require('request'),
	Q = require("q"),
	config = require('./config.js'),
	cheerio = require('cheerio'),
	url = require('url'),
	util = require('./util.js'),
	_ = require('underscore'),
	downloadImages = true;

function download(uri, imagePath, filename, callback){
	var callback = callback || _.noop;

	if (downloadImages){
		request.head(uri, function(err, res, body){
			// console.log('content-type:', res.headers['content-type']);
			// console.log('content-length:', res.headers['content-length']);

			request(uri).pipe(fs.createWriteStream(imagePath + filename)).on('close', callback).on('error', function(err){
				util.logger.log(err, 'error');
			});
		});
	} else {
		console.info("not fetching - " + uri);
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

	util.makeDirectories(imagePath);

	items.forEach(function(item, index){
		var src = {};
		src.original = item.src;

		var suffix = src.original.match(dateRE)[0],
			filename = getFileName(item.id, suffix),
			itemImagePath = util.makeDirectories(imagePath + item.id);

		src.local =  util.makeLocalImagePath(dateStr, item.id, filename);
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

		util.fetchPage(util.makeOptions(getCompletedItemUrl(item.link))).then(function (data){
			return getCompletedItemLink(data, item.link);
		}).then(function (data){
			util.fetchPage(util.makeOptions(data)).then(function (data){
				var additionalImages = collectAdditionalImages(data);
				return downloadAdditionalImages(item, additionalImages, imagePath, dateStr);
			}).then(function (data){
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
		
		download(largerImageUrl, itemImagePath, filename); //uri, imagePath, filename, callback
		item.images.local.push(util.makeLocalImagePath(dateStr, item.id, filename));
	});

	return item;
}

function getCompletedItemLink(data, link){
	try{
		var $ = cheerio.load(data);
		return $("a:contains('See original listing')")[0].attribs.href;
	}catch(e){
		util.logger.log(link, 'error');
	}
}

function getCompletedItemUrl(urlstr){
	var urlObj = (url.parse(urlstr, true));
	return urlObj.query.mpre
}

function makeLargerImageUrl(url){
	return url.replace(/(?!s\-l)64/, "400");
}


// function makeLocalImagePath(dataStr, id, filename){
// 	return dataStr + "/" + id + "/" + filename
// }

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




"use strict";

var fs = require('fs'),
	request = require('request'),
	fetchUtil = require('./fetchUtil.js'),
	config = require('./fetchConfig.js'),
	//file = process.argv[2],
	name = config.category.name, 
	path = fetchUtil.getPath(name) + "/",
	imagePath = path + "images/",
	file = path + fetchUtil.getFileName(name, "json"),
	index = 0;

var download = function(uri, filename, callback){
	request.head(uri, function(err, res, body){
		console.log('content-type:', res.headers['content-type']);
		console.log('content-length:', res.headers['content-length']);

		request(uri).pipe(fs.createWriteStream(imagePath + filename)).on('close', callback);
	});
};

addDirectory(imagePath);

var contents = JSON.parse(fs.readFileSync(file));

contents.forEach(function(v,i){
	var src = {original: v.src},
		suffix = src.original.match(/\w{3,4}$/)[0],
		filename = getFileName(index++, suffix);

	src.local = filename;

	v.src = src;

	//console.info(filename);

	download(src.original, filename, function(){
		console.log('wrote image ' + src.original + ' to ' + filename);
	});

 });

fs.writeFileSync(file, JSON.stringify(contents));

function getFileName(index, suffix){
	return   index + "." + suffix;
}

function addDirectory(path){
	if (fs.existsSync(path)) {
		console.info("path exists");
	} else {
		fs.mkdirSync(path);
		console.info("need to create");
	}
}

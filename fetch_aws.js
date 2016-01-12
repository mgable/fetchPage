"use strict";

var AWS = require('aws-sdk'),
	http = require('http'),
	fs = require('fs'),
	cheerio = require('cheerio'),
	util = require('./util.js'),
	config = require('./config.js'),
	program = require('commander'),
	Q = require("q");

var options = {
	host: config.domain,
	port: 80,
	path: util.getPageTemplate(config.category.id),
	method: 'POST'
};

program
	.version('0.0.1')
	.option('-t, --test', 'testing')
	.parse(process.argv);

// the meat of the matter
util.fetchPage(options).then(function(data){_process(data)});

function _process(data){
	var document = parse(data);
	save (document);
}

function save(data){
	var path = util.getRawDataPath(category),
		file = util.getFileName(category, "json"),
		filename = path + file;
	if (!program.test){
		//saveLocal(path, filename, data)
		saveToS3(file, data);
	} else {
		console.info("saving file " + filename);
		console.info("************* Just Testing ****************");
	}
}

function saveToS3(file, data){
	var credentials = new AWS.SharedIniFileCredentials({profile: 'mgable'});
	AWS.config.credentials = credentials;

	var s3bucket = new AWS.S3({ params: {Bucket: 'collectors-db', region: "Northern California"} }),
		filename = util.getRawS3Path(category) + file;
	
	s3bucket.upload({"Key": filename, "Body": data, "ContentType": "application/json; charset=UTF-8"}, function(err, data) {
		if (err) {
			util.logger.log("Error uploading data " + filename + ": " + err, 'error');
		} else {
			util.logger.log("Successfully uploaded data to: " + filename);
		}
	});
}




// s3bucket.getObject({Bucket: 'mgable', Key: 'index.html'}).on('success', function(response) {
//   console.log("Key was", response.data.Body.toString());
// }).on('error', function(response){
// 	console.info("ERROR");
// 	console.info(response);
// }).send();

// s3bucket.listObjects().on('success', function handlePage(response) {
//   // do something with response.data
//   console.info(response.data);
//   // if (response.hasNextPage()) {
//   //   response.nextPage().on('success', handlePage).send();
//   // }
// }).send();

// s3bucket.listBuckets(function(error, data) {
//   if (error) {
//     console.log(error); // error is Response.error
//   } else {
//     console.log(data); // data is Response.data
//   }
// });

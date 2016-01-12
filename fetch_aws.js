"use strict";

var AWS = require('aws-sdk'),
	http = require('http'),
	fs = require('fs'),
	cheerio = require('cheerio'),
	util = require('./util.js'),
	config = require('./config.js'),
	Q = require("q");

var options = {
	host: config.domain,
	port: 80,
	path: util.getPageTemplate(config.category.id),
	method: 'POST'
};

var credentials = new AWS.SharedIniFileCredentials({profile: 'mgable'});
AWS.config.credentials = credentials;

var s3bucket = new AWS.S3({ params: {Bucket: 'mgable', region: "Northern California"} });

util.fetchPage(options).then(function(data){
	console.info("we have data");
	var params = {Key: 'test/myKey', Body: data};

	s3bucket.upload(params, function(err, data) {
		if (err) {
		  console.log("Error uploading data: ", err);
		} else {
		  console.log("Successfully uploaded data to myBucket/myKey");
		}
	});
});



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
"use strict";

(function(){
	var AWS = require('aws-sdk'),
		util = require('./util.js'),
		config = require('./config.js'),
		program = require('commander'),
		parser = require('./parser.js'),
		category = config.category.name;

	util.logger.log("fetching: " + util.getPageTemplate(config.category.id));

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
	util.fetchPage(options).then(function(data){_process(data);});

	function _process(data){
		var document = parser.parse(data);
		save (document);
	}

	function save(data){
		var file = util.getFileName(category, "json");

		saveToS3(file, data);
	}

	function saveToS3(file, data){
		var credentials = new AWS.SharedIniFileCredentials({profile: 'mgable'});
		AWS.config.credentials = credentials;

		var s3bucket = new AWS.S3({ params: {Bucket: 'collectors-db', region: "Northern California"} }),
			filename = util.getRawS3Path(category) + file;
		
		if (!program.test){
			s3bucket.upload({"Key": filename, "Body": data, "ContentType": "application/json; charset=UTF-8"}, function(err, data) { // jshint ignore:line
				if (err) {
					util.logger.log("ERROR - S3: " + filename + ": " + err, 'error');
				} else {
					util.logger.log("saving - S3: " + filename);
				}
			});
		} else {
			console.info("TEST file: " + filename);
			console.info("************* S3: Just Testing - nothing saved!! ****************");
		}
	}
})();
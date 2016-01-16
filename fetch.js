"use strict";

(function(){
	var util = require('./util.js'),
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
		save(document);
	}

	function save(data){
		var filename = util.getFileName(category, "json"),
			path = util.getRawDataPath(category),
			file = path + filename;

		if (!program.test){
			util.save(filename, path, file, data, config.contentType.json);
		} else {
			console.info("TEST file: " + file);
			console.info("************* Just Testing - nothing saved!! ****************");
		}
	}
})();
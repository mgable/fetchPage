"use strict";
(function(){
	var winston = require('winston'),
		logger = {};

	winston.level = 'debug';

	function addLogFile(filename){
		console.info("adding log file " + filename);
		winston.add(winston.transports.File, { filename: filename });
	}

	function log(message, type){
		var type = type || 'info'; // jshint ignore:line
		winston.log(type, message);
	}

	// TEMP 
	addLogFile('./logs/201601.log');

	logger.addLogFile = addLogFile;
	logger.log = log;

	module.exports = logger;
})();
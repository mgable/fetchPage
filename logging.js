var winston = require('winston'),
	logger = {};

winston.level = 'debug';

function addLogFile(filename){
	console.info("adding log file " + filename);
	winston.add(winston.transports.File, { filename: filename });
}

function log(message, type){
	var type = type || 'info';
	console.info(message);
	winston.log(type, message);
}

// TEMP 
addLogFile('./logs/201601.log');

//winston.remove(winston.transports.Console);
//winston.info('Hello again distributed logs');
//winston.log('debug', 'Now my debug messages are written to console!');

logger.addLogFile = addLogFile;
logger.log = log;

module.exports = logger;
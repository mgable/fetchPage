"use strict";

(function(){
	var http = require('http'),
		fs = require('fs'),
		AWS = require('aws-sdk'),
		cheerio = require('cheerio'),
		util = require('./util.js'),
		config = require('./config.js'),
		program = require('commander'),
		Q = require("q"),
		url = require('url'),
		category = config.category.name,
		rawData = [];

	util.logger.log(util.getPageTemplate(config.category.id));

	require('datejs');

	var options = {
		host: config.domain,
		port: 80,
		path: util.getPageTemplate(config.category.id),
		//,
		method: 'POST'
	};

	var make = {};
	make.float = makeFloat;
	make.date = makeDate;
	make.integer = makeInteger;
	make.string = makeString;

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
			saveLocal(path, filename, data)
			saveToS3(file, data);
		} else {
			console.info(data);
			console.info("************* Just Testing ****************");
		}
	}

	function saveLocal(path, filename, data){
		util.makeDirectories(path); 
		fs.writeFileSync(filename, data);
		util.logger.log("wrote file " + filename);
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

	function makeOptions(urlstr){
		var urlObj = (url.parse(urlstr));

		var	options = {
			host: urlObj.host,
			port: 80,
			path: urlObj.path,
			method: 'GET'
		};

		return options;
	}

	// function makeDirectories(path){
	// 	console.info("making path " + path);

	// 	if(! fs.existsSync(path)) {
	// 		fs.mkdirSync(path);
	// 	}

	// 	return path;
	// }

	function parse(data){
		var $ = cheerio.load(data);
		return JSON.stringify($("a").map(function(a,b){return myMap(b)}).get());
	}

	function myMap(data){
		var obj = {};
		obj.id = util.generateUID();
		obj.title = removeDoubleEscape(data.children[1].data); //title
		obj.link = decodeLink(data.attribs.href); //link to item
		obj.meta = makeSaleData(removeDoubleEscape(data.attribs.x)); //selling price / time of sale / bids / watchers
		obj.src = decodeLink(data.children[0].attribs.src); // image src

		obj.meta.date = {
			"formatted": getDate(obj.meta.date.replace(/^\-/,'').toLowerCase()),
			"origin": obj.meta.date
		};

		return obj;
	}

	function decodeLink(link){
		return removeDoubleEscape(decodeURIComponent(link).replace(/\\(.)/g,"$1")).replace(/\"/g,"");
	}

	function removeDoubleEscape(link){
		return link.replace(/\\(.)/g,"$1");
	}

	function makeSaleData(line){
		var obj = {}, 
		 	attributes = [{name: "price", type: "float"},{name: "date", type: "string"}, {name: "bids", "type": "integer"},{name: "watchers", type: "integer"}];

		line.replace(/[^\/]*/g, function(data){
			if (data){
				var attribute = attributes.shift();			
				obj[attribute.name] = make[attribute.type](data);
		 	}
		});
		 
		 return obj;
	}

	function makeFloat(num){
		return Math.round(parseFloat(num.replace(/,/,"")) * 100);
	}

	function makeDate(date){
		return new Date(date);
	}

	function makeInteger(num){
		return parseInt(num, 10)
	}

	function makeString(str){
		return str.toString();
	}

	function getDate(which){
		try {
			return eval("Date.today().last()." + which + "()");
		}catch(e){
			return Date.today();
		}
	}
})()


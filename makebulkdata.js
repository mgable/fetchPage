"use strict";
var fs  = require("fs"), filename = "tins.formatted.json",
	document = JSON.parse(fs.readFileSync(__dirname + "/data/store/tins.json").toString());

save(filename, parse(document));

function parse(line){
	var results = '';

	console.info(line.length);

	if (typeof line === "object"){
		line.forEach(function(v,i,a){
			var str = JSON.stringify({"index":{"_id": (i+1)}});
			results += str + "\n" + JSON.stringify(v) + "\n";
		})

		return results;
	}

	return line;
}

function save(filename, rawData){
	fs.writeFileSync(__dirname + "/data/to_be_indexed/" + filename, rawData);
	console.info("wrote file " + filename);
}
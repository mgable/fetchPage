"use strict";
var fs = require("fs"),
	today = new Date(),
	filename = "logs/test_" + Date.now(),
	data = {"type": "test", "name": filename, "date": today};


fs.writeFileSync(filename, JSON.stringify(data));
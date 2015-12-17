var http = require('http'),
	fs = require('fs'),
	cheerio = require('cheerio'),
	rawData = "";

require('datejs');

var category = {name: "advertising_tins", id: 1175};

var dataRoot = "/Users/markgable/Sites/Data/collectorsDB/";

var options = {
	host: 'www.collectorsweekly.com',
	port: 80,
	path: '/ajax/category-auctions.php?id=' + category.id + '&sort=completed&limit=1000&offset=0',
	method: 'POST'
};

var req = http.request(options, function(res) {
	console.log('STATUS: ' + res.statusCode);
	console.log('HEADERS: ' + JSON.stringify(res.headers));
	res.setEncoding('utf8');
	res.on('data', function (chunk) {
		rawData += chunk;
	});

	res.on('end', save);
});

var date = new Date();

var make = {};
make.float = makeFloat;
make.date = makeDate;
make.integer = makeInteger;
make.string = makeString;

req.on('error', function(e) {
	console.log('problem with request: ' + e.message);
});

// write data to request body
req.write('data\n');
req.end();

function save(){
	var filename = makeDirectories(category) + "/" + getFileName();
	fs.writeFileSync(filename, parse(rawData));
	console.info("wrote file " + filename);
}

function getFileName(){
	return category.name + "_" + getDateString() + ".json";
}

function makeDirectories(category){
	var path = dataRoot + "raw/" + category.name + "/" + getDateString();
	if(! fs.existsSync(path)) {
		fs.mkdirSync(path);
	}

	return path;
}

function getDateString(){
	return date.getFullYear().toString() + (date.getMonth()+1) + date.getDate()
} 

function parse(data){
	$ = cheerio.load(data);
	return JSON.stringify($("a").map(function(a,b){return myMap(b)}).get());
}


function myMap(data){
	var obj = {};
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
	return (Math.round(parseFloat(num) * 100));
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



"use strict";

(function(){
	var sys_config = require('./sys_config.js');

	var category = {name: "advertising_tins", id: 1175};

	var dataRoot = "/Users/markgable/Sites/data/collectorsDB/",
		domain = 'www.collectorsweekly.com',
		pageUrlTemplate = '/ajax/category-auctions.php?id= *** config.category.id *** &sort=completed&limit=1000&offset=0';


	var aws = {}, blank = {};
	var bucket = 'collectors-db';

	blank.dataRoot = "";
	aws.dataRoot = "http://collectors-db.s3-website-us-west-1.amazonaws.com/";

	var local = {};
	local.dataRoot = dataRoot;

	var contentType = {
		"json": "application/json; charset=UTF-8",
		"jpg": "image/jpeg"
	};

	module.exports = {
		category: category,
		dataRoot: dataRoot,
		domain: domain,
		pageUrlTemplate: pageUrlTemplate,
		aws: aws,
		local: local,
		contentType: contentType,
		bucket: bucket,
		sys_config: sys_config,
		blank: blank
	};
})();
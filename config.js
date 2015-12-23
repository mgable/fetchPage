"use strict";

var category = {name: "advertising_tins", id: 1175};

var dataRoot = "/Users/markgable/Sites/data/collectorsDB/";

var domain = 'www.collectorsweekly.com';

var pageUrlTemplate = '/ajax/category-auctions.php?id= *** config.category.id *** &sort=completed&limit=1000&offset=0';
// ( \*{3}) config.category.id (\*{3}) 

module.exports = {
	category: category,
	dataRoot: dataRoot,
	domain: domain,
	pageUrlTemplate: pageUrlTemplate
}
var request = require('request');
var cheerio = require('cheerio');

var searchTerm = '?s=+hot+metal';
//var url = 'http://www.ultiworld.com/?s=+' + searchTerm;
//var url = "http://www.ultiworld.com/";
var url = "http://www.ultiworld.com/page/3/";

var count = 1;

searching(url, searchTerm);

function searching(url, searchTerm){
	getOnePageArticles(url, searchTerm, function(length){
		console.log(count + "numArticles: " + length);
		if (length == 10){
			count++
			if (count > 1){
				searching(url, "page/" + count + "/" + searchTerm)
			}
		}
	});
}


function getOnePageArticles(url, searchTerm, callback){
	request(url + searchTerm, function(err, resp, body){
	  $ = cheerio.load(body);
	  listElements = $('.snippet-excerpt__heading'); //use your CSS selector here
	  $(listElements).each(function(i, list){
	    console.log($(list).text());
	  });
	  callback(listElements.length);
	});
}

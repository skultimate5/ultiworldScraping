var request = require('request');
var cheerio = require('cheerio');

var searchTermOverall = '?s=+hot+metal';
//var url = 'http://www.ultiworld.com/?s=+' + searchTerm;
var url = "http://www.ultiworld.com/";
//var url = "http://www.ultiworld.com/page/3/";

var count = 1;

searching(url, searchTermOverall, count);

function searching(url, searchTerm, count){
	getOnePageArticles(url, searchTerm, count, function(length){
		console.log(count + " numArticles: " + length);
		if (length == 10){
			count++
			if (count > 1){
				console.log("Searching page " + count + "...");
				searching(url, searchTerm, count)
			}
		}
	});
}


function getOnePageArticles(url, searchTerm, count, callback){
	request(url + "page/" + count + "/" + searchTerm, function(err, resp, body){
	  console.log(url + "page/" + count + "/" + searchTerm)
	  $ = cheerio.load(body);
	  var listElements = $('.snippet-excerpt__heading'); //use your CSS selector here
	  //console.log(listElements);
	  /*$(listElements).each(function(i, list){
	    console.log($(list).text());
	  });*/
	  callback(listElements.length);
	});
}
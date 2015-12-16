var request = require('request');
var cheerio = require('cheerio');

var searchTermOverall = '?s=\"case+western\"';
//var url = 'http://www.ultiworld.com/?s=+' + searchTerm;
var url = "http://www.ultiworld.com/";
//var url = "http://www.ultiworld.com/page/3/";

var count = 1;
var numArticles = 0;

searching(url, searchTermOverall, count);

function searching(url, searchTerm, count){
	getOnePageArticles(url, searchTerm, count, function(length){
		numArticles = numArticles + length;
		console.log(count + " numArticles: " + length + "\nTotal numArticles: " + numArticles);
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

		//Check for error
	    if(err){
	        return console.log('Error:', err);
	    }

	    //Check for right status code
	    if(resp.statusCode !== 200){
	        return console.log('Invalid Status Code Returned:', resp.statusCode);
	    }

		  console.log(url + "page/" + count + "/" + searchTerm)
		  $ = cheerio.load(body);
		  var listElements = $('.snippet-excerpt__heading'); 		//.text() for each element in this gives you the name of each article
		  var datesPosted = $('.snippet-excerpt__byline');
		  $(datesPosted).each(function(i, date){
		  	var dateHTML = $(date).html();
		  	var substring = dateHTML.substring(0,17).split(" ")[2]		//getting year of article
		    console.log(substring);
		  });
		  callback(listElements.length);
	});
}

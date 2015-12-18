var request = require('request');
var cheerio = require('cheerio');
var express = require('express');
var app = express();

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', function(request, response) {
  response.render('index');
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});


var searchTermOverall = '?s=\"case+western\"';
var searchTermMultiple = '?s=\"case+western\"+%2B+\"sophie+knowles\"'
//var url = 'http://www.ultiworld.com/?s=+' + searchTerm;
var url = "http://www.ultiworld.com/";
//var url = "http://www.ultiworld.com/page/3/";
var year = 2014;

var count = 1;
var numArticles = 0;
var numArticlesYear = 0;

//searching(url, searchTermMultiple, count, year);

function searching(url, searchTerm, count, year){
	getOnePageArticles(url, searchTerm, count, year, function(length, certainYearArticles){
		numArticles = numArticles + length;
		console.log(count + " numArticles: " + length + "\nTotal numArticles: " + numArticles);
		numArticlesYear = numArticlesYear + certainYearArticles.length;
		console.log(count + " " + year + " articles: " + certainYearArticles.length + "\nTotal numArticlesYear: " + numArticlesYear);
		for (var i = 0; i < certainYearArticles.length; i++){
			console.log(certainYearArticles[i])
		}
		if (length == 10){
			count++
			if (count > 1){
				console.log("Searching page " + count + "...");
				searching(url, searchTerm, count, year)
			}
		}
	});
}


function getOnePageArticles(url, searchTerm, count, year, callback){
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
		  var certainYearArticles = [];
		  $(datesPosted).each(function(i, date){
		  	var dateHTML = $(date).html();
		  	var substring = dateHTML.substring(0,17).split(" ")[2]		//getting year of article
		  	if (substring == '' + year){
		  		certainYearArticles.push($(listElements[i]).text());
		  	}
		  });
		  callback(listElements.length, certainYearArticles);
	});
}

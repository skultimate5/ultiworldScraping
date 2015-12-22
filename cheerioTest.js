var request = require('request');
var cheerio = require('cheerio');
var express = require('express');
var qs = require('qs');
var app = express();

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', function(request, response) {
  response.render('index', {
  	numArticles: null,
  	numArticlesYear: null,
  	certainYearArticles: [],
  	certainYearArticlesLink: [],
  	certainYearArticlesObj: null,
	year: null,
	searchVal: null,
	count: 1,
	numArticlesTotal: 0,
  });
});

//try saving info in database from search, and then loading data on completedSearch page
//also have a loading screen which may need to be done this way

app.get('/search/:count/:searchVal/:numArticlesTotal/:certainYearArticlesObj', function(req, response){
	var count = req.params.count.split(":")[1];
	console.log(req.params.certainYearArticlesObj)
	if (count == 1){
		var searchVal = req.query.name;
		var certainYearArticles = [];
		var certainYearArticlesLink = [];
	}
	else{
		var searchVal = req.params.searchVal.split(":")[1];
		//var certainYearArticlesArray = req.params.certainYearArticles.split(":");
		//var certainYearArticlesArrayLink = req.params.certainYearArticlesLink.split(":");
		console.log("here")
		console.log(qs.parse(req.params.certainYearArticlesObj));
		var certainYearArticlesArray = certainYearArticlesObj.certainYearArticles;
		var certainYearArticlesLink = certainYearArticlesObj.certainYearArticlesLink;
		var certainYearArticles = [];
		var certainYearArticlesLink = [];
		for(var i = 1; i < certainYearArticlesArray.length; i++){
			certainYearArticles.push(certainYearArticlesArray[i])
			certainYearArticlesLink.push(certainYearArticlesArrayLink[i])
		}
	}
	var certainYearArticlesObj = {
		certainYearArticles: certainYearArticles,
		certainYearArticlesLink: certainYearArticlesLink
	};
	console.log(certainYearArticlesObj)
	var numArticlesTotal = req.params.numArticlesTotal.split(":")[1];
	console.log("Search Value is: " + searchVal)
	var formattedSearchVal = formatSearchVal(searchVal);
	var year = 2014;
	var numArticles = 0;
	var numArticlesYear = 0;
	var doneBoolean = false;

	getOnePageArticles(formattedSearchVal, count, year, doneBoolean, certainYearArticlesObj.certainYearArticles, certainYearArticlesObj.certainYearArticlesLink, function(numArticles, certainYearArticles, certainYearArticlesLink, doneBoolean){
		var certainYearArticlesObj = {
			certainYearArticles: certainYearArticles,
			certainYearArticlesLink: certainYearArticlesLink
		}
		count = parseInt(count) + 1;
		numArticlesTotal = parseInt(numArticlesTotal) + numArticles;
		if (!doneBoolean){
			var query = qs.stringify(certainYearArticlesObj)
			response.redirect('/search/:' + count + '/:' + searchVal + '/:' + numArticlesTotal + '/:' + query)
		}
		else{
			response.render('index', {
				numArticles: numArticlesTotal,
				numArticlesYear: certainYearArticles.length,
				numArticlesTotal: numArticlesTotal,
				certainYearArticles: certainYearArticles,
				certainYearArticlesLink: certainYearArticlesLink,
				year: year,
				searchVal: searchVal,
				count: count
			});
		}
	});
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

function getOnePageArticles(searchTerm, count, year, doneBoolean, certainYearArticles, certainYearArticlesLink, callback){
	var url = "http://www.ultiworld.com/";
	console.log(url + "page/" + count + "/" + searchTerm)
	request(url + "page/" + count + "/" + searchTerm, function(err, resp, body){

		//Check for error
	    if(err){
	        return console.log('Error:', err);
	    }

	    //Check for right status code
	    if(resp.statusCode !== 200){
	        return console.log('Invalid Status Code Returned:', resp.statusCode);
	    }

		  $ = cheerio.load(body);
		  var previousPageButton = $('.paging-nav__previous');			//see if there is a previous button, otherwise done searching
		  if (!previousPageButton[0]){
		  	doneBoolean = true;
		  }			  
		  var listElements = $('.snippet-excerpt__heading'); 		//list of articles
		  var datesPosted = $('.snippet-excerpt__byline');			//date for each article
		  $(datesPosted).each(function(i, date){
	  	  	var dateHTML = $(date).html();
	  		var substring = dateHTML.substring(0,17).split(" ")[2]		//getting year of article
	  		if (substring == '' + year){								//if year matches, add to this year article list
	  			console.log($(listElements[i]).children().attr('href'));
	  			certainYearArticles.push($(listElements[i]).text());
	  			certainYearArticlesLink.push($(listElements[i]).children().attr('href'));
	  		}
		  });
		  callback(listElements.length, certainYearArticles, certainYearArticlesLink, doneBoolean);
	});
}

function formatSearchVal(searchVal){
	var wordArray = searchVal.split(" ");
	var middleTerm = wordArray[0];
	for (var i = 1; i < wordArray.length; i++){
		if(wordArray[i].length != 0){
			middleTerm = middleTerm + "+" + wordArray[i];
		}
	}
	var searchTerm = '?s=\"' + middleTerm + "\"";
	console.log(searchTerm);
	return searchTerm
}


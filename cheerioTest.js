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
  response.render('index', {
  	numArticles: null,
  	numArticlesYear: null,
	year: null,
	searchVal: null,
	count: 1,
	numArticlesTotal: 0
  });
});

app.get('/search/:count/:searchVal/:numArticlesTotal', function(req, response){
	var count = req.params.count.split(":")[1];
	console.log(req.params);
	if (count == 1){
		var searchVal = req.query.name;
	}
	else{
		var searchVal = req.params.searchVal.split(":")[1];
	}
	var numArticlesTotal = req.params.numArticlesTotal.split(":")[1];
	console.log("Search Value is: " + searchVal)
	var formattedSearchVal = formatSearchVal(searchVal);
	var year = 2014;
	var numArticles = 0;
	var numArticlesYear = 0;
	var doneBoolean = false;

	getOnePageArticles(formattedSearchVal, count, year, doneBoolean, function(numArticles, certainYearArticles, doneBoolean){
		count = parseInt(count) + 1;
		numArticlesTotal = parseInt(numArticlesTotal) + numArticles;
		if (!doneBoolean){
			response.redirect('/search/:' + count + '/:' + searchVal + '/:' + numArticlesTotal)
		}
		else{
			response.render('index', {
				numArticles: numArticlesTotal,
				numArticlesYear: certainYearArticles.length,
				numArticlesTotal: numArticlesTotal,
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

function getOnePageArticles(searchTerm, count, year, doneBoolean, callback){
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
		  var certainYearArticles = [];
		  $(datesPosted).each(function(i, date){
	  	  	var dateHTML = $(date).html();
	  		var substring = dateHTML.substring(0,17).split(" ")[2]		//getting year of article
	  		if (substring == '' + year){								//if year matches, add to this year article list
	  			certainYearArticles.push($(listElements[i]).text());
	  		}
		  });
		  callback(listElements.length, certainYearArticles, doneBoolean);
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


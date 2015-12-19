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
	year: null
  });
});

app.get('/myForm', function(req, response){
	var searchVal = req.query.name;
	console.log("Search Value is: " + searchVal)
	var formattedSearchVal = formatSearchVal(searchVal);
	var url = "http://www.ultiworld.com/";
	var year = 2014;
	var count = 1;
	var numArticles = 0;
	var numArticlesYear = 0;
	var searchVal2 = formattedSearchVal;
	var doneBoolean = false;

	searching(url, searchVal2, count, year);

	function searching(url, searchTerm, count, year, doneBoolean){
		getOnePageArticles(url, searchTerm, count, year, doneBoolean, function(length, certainYearArticles, doneBoolean){
			numArticles = numArticles + length;
			console.log(count + " numArticles: " + length + "\nTotal numArticles: " + numArticles);
			numArticlesYear = numArticlesYear + certainYearArticles.length;
			console.log(count + " " + year + " articles: " + certainYearArticles.length + "\nTotal numArticlesYear: " + numArticlesYear);
			for (var i = 0; i < certainYearArticles.length; i++){
				console.log(certainYearArticles[i])
			}
			if (!doneBoolean){
				count++
				if (count > 1){
					console.log("Searching page " + count + "...");
					searching(url, searchTerm, count, year)
				}
			}
			else{
				console.log("Done Searching")
				console.log(numArticles)
				response.render('index', {
			 		numArticles: numArticles,
			 		numArticlesYear: numArticlesYear,
			 		year: year
				});
			}
		});
	}


	function getOnePageArticles(url, searchTerm, count, year, doneBoolean, callback){
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
			  var previousPageButton = $('.paging-nav__previous');
			  if (!previousPageButton[0]){
			  	doneBoolean = true;
			  }			  
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
			  callback(listElements.length, certainYearArticles, doneBoolean);
		});
	}
});

app.get('/searched', function(request, response) {
	var numArticles = doTheSearch();
	setTimeout(function(){
		response.render('index', {
		  	results: numArticles
		});
	}, 1000)
  
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

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


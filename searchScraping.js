
var phantom = require('phantom');

phantom.create(function (ph) {
	ph.createPage(function (page) {
		page.open("http://ultiworld.com/?s=+hot+metal", function (status) {
			console.log("opened page? ", status);
			page.includeJs("http://ajax.googleapis.com/ajax/libs/jquery/1.6.1/jquery.min.js", function() {
				page.evaluate(function () { 
					var searchResults = document.getElementsByClassName('snippet-excerpt__heading');
					var allLinks = [];
					for(var i = 0; i < searchResults.length; i++){
						//allLinks.push(searchResults[i].getElementsByTagName('a')[0].getAttribute('href'));
						allLinks.push(searchResults[i].getElementsByTagName('a')[0])
					}
					//$(allLinks[0]).click();
					//return document.title
					//$("paging-nav__previous").click()
					return allLinks.length
				}, function (result) {
					console.log('Page info: ' + result);
					ph.exit();
				});
			});
		});
	});
});
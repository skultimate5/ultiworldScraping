
var phantom = require('phantom');

phantom.create(function (ph) {
	ph.createPage(function (page) {
		page.open("http://ultiworld.com/?s=+hot+metal", function (status) {
			console.log("opened page? ", status);
			page.evaluate(function () { return document.title; }, function (result) {
				console.log('Page title is: ' + result);
				ph.exit();
			});
		});
	});
});
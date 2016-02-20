'use strict';

var express = require('express');
var bodyParser = require('body-parser');

var app = express();
var mapRouter = require('./routes/mapRouter.js');
var midpoint = require('./midpoint.js');

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// middleware to use for all requests
// set the response headers
app.use(function(req, res, next) {
    // do logging
    res.setHeader("Access-Control-Allow-Origin", "*");
  	res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Save-Data");
  	res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  	res.setHeader('Access-Control-Allow-Credentials', false);
    next(); // make sure we go to the next routes and don't stop here
});

// choose whatever port we want to listen on
var port = process.env.PORT || 8080;

app.get('/', function (req, res) {
	var temp1 = [43.47248,-80.53370];
	var temp2 = [43.57429,-80.53548];
	var temp3 = midpoint.findMidPoint(temp1, temp2);
	midpoint.findGatheringPoint(temp1, temp2, temp3)
	.then(function(response) {
		res.send(response);
	})
});

// use our router middleware
app.use('/', mapRouter);

//Run the server
app.listen(port, function() {
	console.log('Magic happens on port ' + port);
})

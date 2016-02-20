'use strict';

var express = require('express');
var bodyParser = require('body-parser');
var _ = require('lodash');
var striptags = require('striptags');

var app = express();
var mapRouter = require('./routes/mapRouter.js');
var midpoint = require('./midpoint.js');
var util = require('./util.js');
var mapDirection = require('./mapDirection.js');

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

app.post('/', function (req, res) {
	var temp1 = [req.body.user1.latitude, req.body.user1.longitude];
	var temp2 = [req.body.user2.latitude, req.body.user2.longitude];
	// var temp1 = [43.47248,-80.53370];
	// var temp2 = [43.57348,-80.53548];

	var midpointish = util.findMidPoint(temp1, temp2);

	midpoint.findNearbyPlaces(midpointish)
	.then(function(response) {
		
		var promises = _.map(response, function(place) {
			return new Promise(function(resolve, reject) {
				var placeLocation = [place.geometry.location.lat, place.geometry.location.lng];
				midpoint.calculateDistance(midpointish, placeLocation).then(function(response) {
					resolve({
						"distance": response,
						"owner": place
					});
				});
			});
		});

		return Promise.all(promises);
	}).then(function(response) {
		var min = undefined; 
		_.forEach(response, function(location) {
			if(min === undefined) {
				min = {
					"distance": location.distance, 
					"owner": location.owner
				}
			} else {
				if(location.distance < min.distance) {
					min = {
						"distance": location.distance, 
						"owner": location.owner
					}
				}
			}
		})
		return new Promise(function(resolve, reject) {
			res.send(min);
			resolve(min);
		});
	}).then(function(data) {
		var userOneDirections = [];
		var userTwoDirections = [];
		mapDirection.findDirections(temp1, [data.owner.geometry.location.lat, data.owner.geometry.location.lng])
		.then(function(response) {
			_.forEach(response, function(step) {
				userOneDirections.push(striptags(step.html_instructions));
			});
			return new Promise(function(resolve, reject) {
				resolve(true);
			});
		}).then(function(response) {
			mapDirection.findDirections(temp2, [data.owner.geometry.location.lat, data.owner.geometry.location.lng])
			.then(function(response) {
				_.forEach(response, function(step) {
					userTwoDirections.push(striptags(step.html_instructions));
				});
				return new Promise(function(resolve, reject) {
					console.log(userOneDirections);
					console.log(userTwoDirections);
					var obj = {
						"name": data.owner.name,
						"address": data.owner.vicinity,
						"userOne": userOneDirections,
						"userTwo": userTwoDirections
					}
					console.log(obj);
					var stringed = JSON.stringify(obj);
					console.log(stringed);
					res.send(stringed);

					resolve(true);
				});
			})
		})
	})
});

// use our router middleware
app.use('/', mapRouter);

//Run the server
app.listen(port, function() {
	console.log('Magic happens on port ' + port);
})

// import dependencies
var _ = require('lodash');
var express = require('express');
var router = express.Router();
var striptags = require('striptags');

// import modules
var util = require('../util.js');
var midpoint = require('../midpoint.js');
var mapDirection = require('../mapDirection.js');

// API endpoint for getting travel directions
router.post('/testing', function(req, res) {
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
	});
});

module.exports = router;

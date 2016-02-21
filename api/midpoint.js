var request = require('superagent');
var util = require('./util.js');

var API_KEY="AIzaSyBIJxVeb8GOebSNEEC_pjOUKEKaYhPVvus";

module.exports.calculateDistance = function(pointOne, pointTwo) {
	var string = "https://maps.googleapis.com/maps/api/distancematrix/json?"+
   		"origins="+pointOne[0]+","+pointOne[1]+
   		"&destinations="+pointTwo[0]+","+pointTwo[1]+
   		"&key="+API_KEY;
	return new Promise(function(resolve, reject) {
		request
	   		.get(string)
	   		.end(function(err, res) {
	   			if(err || !res.ok) {
	   				reject("error");
	   			} else {
	   				if(res.body.rows === undefined) {
	   					reject("error");
	   				} else{
	   					resolve(res.body.rows[0].elements[0].distance.value);
	   				}
	   			}
	   		})
	})
}

module.exports.findNearbyPlaces = function(midpoint) {
	var string = "https://maps.googleapis.com/maps/api/place/nearbysearch/json?"+
   		"location="+midpoint[0]+","+midpoint[1]+
   		"&radius=1500"+
   		"&key="+API_KEY;

   	return new Promise(function(resolve, reject) {
		request
	   		.get(string)
	   		.end(function(err, res) {
	   			if(err || !res.ok) {
	   				reject("error");
	   			} else {
	   				if(res.body === undefined) {
	   					reject("error");
	   				} else {
	   					var array = [];
	   					for(var i = 0; i < res.body.results.length-1; i++) {
	   						array.push(res.body.results[i+1]);
	   					}
	   					resolve(array);
	   				}
	   			}
	   		})
	})
}


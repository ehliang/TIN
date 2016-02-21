var request = require('superagent');
var util = require('./util.js');

var API_KEY="AIzaSyBIJxVeb8GOebSNEEC_pjOUKEKaYhPVvus";

module.exports.findDirections = function(pointOne, commonMeetingPlace) {
	var string = "https://maps.googleapis.com/maps/api/directions/json?"+
   		"origin="+pointOne[0]+","+pointOne[1]+
   		"&destination="+commonMeetingPlace[0]+","+commonMeetingPlace[1]+
   		"&key="+API_KEY;
   		//"&mode=walking";
   		console.log(string);
	return new Promise(function(resolve, reject) {
		request
	   		.get(string)
	   		.end(function(err, res) {
	   			if(err || !res.ok) {
	   				reject("error");
	   			} else {
	   				if(res.body.routes[0].legs[0].steps === undefined) {
	   					reject("error");
	   				} else{
	   					resolve(res.body.routes[0].legs[0].steps);
	   				}
	   			}
	   		})
	})
}
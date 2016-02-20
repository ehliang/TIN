var request = require('superagent');
var util = require('./util.js');

var API_KEY="AIzaSyD6iLzUSsNhsaP9Y2BK96wObMnhzWM_1jM";

var numAttempts = 0;

var maxAttempts = 7;

// returns optimal meeting point
module.exports.findGatheringPoint = function(firstUserPoint, secondUserPoint, midpoint) {
    numAttempts++;
    return new Promise(function(resolve, reject) {
    	calculateDuration(firstUserPoint, midpoint)
	    .then(function(durationOne) {
	        return calculateDuration(secondUserPoint, midpoint)
               .then(function(durationTwo) {
                    return {
                    	durationOne: durationOne, 
                    	durationTwo: durationTwo
                    };
               });
	    })
	    .then(function(response) {
	    	// Pulls apart the two durations for comparison
	        console.log("Duration of trip for first person: " + response.durationOne);
	        console.log("Duration of trip for second person: " + response.durationTwo);
	        console.log("Difference in duration: " + Math.abs(response.durationOne - response.durationTwo));

	        var tolerance = 0.05 * ((response.durationOne + response.durationTwo) / 2);

	        if ((Math.abs(response.durationOne - response.durationTwo) <= tolerance) || numAttempts >= maxAttempts) {

	            if (numAttempts >= maxAttempts) {
	            	console.warn("Stopped findGatheringPoint after max attempts reached");
	            }
	            console.log(firstUserPoint + " " + secondUserPoint);
	            resolve(midpoint);
	        }
	        else if (response.durationOne > response.durationTwo) {

	            var newMidpoint = util.findMidPoint(firstUserPoint, midpoint);
	            return exports.findGatheringPoint(firstUserPoint, midpoint, newMidpoint);
	        }
	        else {
	        	console.log("secondUserPoint: ", secondUserPoint + ", midpoint: ", midpoint);
	            var newMidpoint = util.findMidPoint(secondUserPoint, midpoint);

	            return exports.findGatheringPoint(midpoint, secondUserPoint, newMidpoint);
	        }
	    })
	    .catch(function (error) {
	        console.log("findGatheringPoint Error: " + error);
	        reject(error);
	    });
    });  
}

var calculateDuration = function(pointOne, pointTwo) {
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
   		"&radius=500"+
   		"&key="+API_KEY;
   	console.log(string);

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
	   					console.log(res.body);
	   					resolve(res.body);
	   				}
	   				
	   			}
	   		})
	})
}

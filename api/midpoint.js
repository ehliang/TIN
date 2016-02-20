var request = require('superagent');

var API_KEY="AIzaSyD6iLzUSsNhsaP9Y2BK96wObMnhzWM_1jM";

var firstUserPoint;
var secondUserPoint;

var finalMeetingPoint;
var numAttempts = 0;

var maxAttempts = 7;

module.exports.findMidPoint = function(firstUserPoint, secondUserPoint) {
	var midpointLatitude = (firstUserPoint[0] + secondUserPoint[0]) / 2;
	var midpointLongitude = (firstUserPoint[1] + secondUserPoint[1]) / 2;

	var midpoint = [Number(midpointLatitude.toFixed(5)), Number(midpointLongitude.toFixed(5))];
	return midpoint;
}

// returns optimal meeting point
module.exports.findGatheringPoint = function(firstUserPoint, secondUserPoint, midpoint) {
	    numAttempts++;
	    console.log("test #1");
	    return new Promise(function(resolve, reject) {
	    	calculateDuration(firstUserPoint, midpoint)
		    .then(function(durationOne) {
		    	console.log("test #2");
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
		            resolve(midpoint);
		        }
		        else if (response.durationOne > response.durationTwo) {
		            var newMidpoint = findMidPoint(firstUserPoint, midpoint);
		            return findGatheringPoint(firstUserPoint, midpoint, newMidpoint);
		        }
		        else {
		            var newMidpoint = findMidPoint(secondUserPoint, midpoint);
		            return findGatheringPoint(midpoint, secondUserPoint, newMidpoint);
		        }
		    })
		    .catch(function (error) {
		        console.log("findGatheringPoint Error: " + error);
		        reject(error);
		    });
	    });  
	}

	/**
	 *  Finds duration of time between two places used in findGatheringPoint function
	 *
	 *  @param {pointOne} <integer> first place, must be in coordinate form for math
	 *  @param {pointTwo} <integer> second place, must be in coordinate form for math
	 *  @return {duration} <integer> time between two places
	 */
var calculateDuration = function(pointOne, pointTwo) {
	var string = "https://maps.googleapis.com/maps/api/distancematrix/json?"+
   		"origins="+pointOne[0]+","+pointOne[1]+
   		"&destinations="+pointTwo[0]+","+pointTwo[1]+
   		"&key="+API_KEY;
   		console.log(string);
	return new Promise(function(resolve, reject) {
		request
   		.get(string)
   		.end(function(err, res) {
   			if(err || !res.ok) {
   				reject("error");
   			} else {
   				console.log(res.body);
   				if(res.body.rows === undefined) {
   					reject("error");
   				} else{
   					resolve(res.body.rows[0].elements[0].duration.value);
   				}
   				
   			}
   		})
	})
}

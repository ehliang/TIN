// Use Strict because it's the best
'use strict';

var express = require('express'); // hi
var twilio = require('twilio'); // for SMS
var bodyParser = require('body-parser'); //middleware for POST requests
var _ = require('lodash'); // _.forEach()
var striptags = require('striptags'); // strip string of HTML elements
var request = require('superagent'); // HTTP requests
var rp = require('request-promise'); // HTTP requests
var each = require('async-each-series'); // execute array of asynchronous functions synchronously

var Firebase = require('firebase');
var myFirebaseRef = new Firebase("https://tin-m-hacks.firebaseio.com");  
var userCounter = 0;

var accountSid = "ACf14e3ba903d05bddc9ca4c69e8be6d8d";
var authToken = "c6bdf749be21593d2073d7bd505ce705";

// Create a Twilio REST API client for authenticated requests to Twilio
var client = twilio(accountSid, authToken);

var app = express();
var mapRouter = require('./routes/mapRouter.js');
var midpoint = require('./midpoint.js');
var util = require('./util.js');
var mapDirection = require('./mapDirection.js');

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// choose whatever port we want to listen on
var port = process.env.PORT || 8080;

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

//Send an SMS text message
var sendThis = function(toNumber, message){
	return new Promise(function(resolve, reject) {
		client.sendMessage({

		    to: toNumber, // Any number Twilio can deliver to
		    from: '+17082924124', // A number you bought from Twilio and can use for outbound communication
		    body: message // body of the SMS message

		}, function(err, responseData) { //this function is executed when a response is received from Twilio

			if(err) {
				reject(err);
			} else { // "err" is an error received during the request, if any

		        // "responseData" is a JavaScript object containing data received from Twilio.
		        // A sample response from sending an SMS message is here (click "JSON" to see how the data appears in JavaScript):
		        // http://www.twilio.com/docs/api/rest/sending-sms#example-1

		        //console.log(responseData.from); // outputs "+14506667788"
		        console.log(responseData.body); // outputs "word to your mother."
		        resolve(true);
		    }
		});
	});
};

function clean(snapshot) {
 	snapshot.forEach(function(childSnapshot){
 		if(childSnapshot.val().matched === false){
		sendThis(childSnapshot.key(), "Match not found.");
		}
		// snapshot.ref().remove();
		// console.log("doing a clean");
	});
	snapshot.ref().remove();
	console.log("doing a clean");
}

setInterval(function(){
	var now = Date.now(); 
	var cutoff = now - 1 * 60 * 1000; 
    var old = myFirebaseRef.orderByChild('timestamp').startAt(cutoff); 
    old.once('value', clean);
    // old.on("value", function () {
    // 	console.log("Looks done?")
    // 	old.off("child_added", clean);
    // })
    
}, 1*60*1e3);   


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

/***************** Receive the text message *******************************/
app.post('/find-match', function(req, res){
	var requestContent = String(req.body.Body);
	var splitRequest = requestContent.split("@");
    // Log the request body for reference
    console.dir(String(req.body.Body));
    if(splitRequest[0] === ""){
        var phoneNumber = splitRequest[1];
    	var latitude = splitRequest[2];
    	var longitude = splitRequest[3];

        myFirebaseRef.once("value", function(snapshot){
            promisifyExists(snapshot, phoneNumber, latitude, longitude).then(function(response) {
            	return new Promise(function(resolve, reject) {
            		if(response != ""){
	            		console.log("Your match is: " + String(response));
	            		resolve(true);
	            	}else{
	            		sendThis(phoneNumber, "Waiting for match...");
	            		resolve(false);
	            	}
	            });
            }).then(function(response){
            	if(response === false){
	            	myFirebaseRef.child(phoneNumber).set({
	            		phoneNumber:phoneNumber,
		                latitude:latitude, 
		                longitude:longitude,
                        timestamp: Date.now(),
		                matched:false, 
		            });
		            console.log("Ref Created for " + phoneNumber);
		            res.send("");
	        	}
            }).catch(function(error) {
            	console.log(error);
            });
        });

    	//console.log("phoneNumber = " + phoneNumber + "\nlatitude = " + latitude + "\nlongitude = " + longitude);
    }else{
    	console.log("whoops");
    }
}); 

var promisifyExists = function(snapshot, phoneNumber, latitude, longitude) {
	return new Promise(function(resolve, reject) {
		var match = "";
		if(snapshot.exists()){
            snapshot.forEach(function(childSnapshot){
            	var childData = childSnapshot.val();
				if(childData.matched === false){
					//var distance = calculateDistance(latitude, childData.latitude, longitude, childData.longitude);
					var distance = Math.abs(Math.abs(latitude) - Math.abs(childData.latitude)) + Math.abs(Math.abs(longitude) - Math.abs(childData.longitude));
					//console.log(childSnapshot.key());
					//console.log(distance);
					if(distance < 0.5){
						// Key in this case is the phone number
						match = childSnapshot.key();
						// Update matched person to make sure nobody else matches with them.
						myFirebaseRef.child(match).update({matched:true});
						sendThis(match, "Matched!");
						sendThis(phoneNumber, "Matched!");

						rp({
						    method: 'POST',
						    uri: 'http://a968f7f9.ngrok.io/testing',
						    body: {
									user1: {
										latitude: latitude,
										longitude: longitude
									},
									user2: {
										latitude: childData.latitude,
										longitude: childData.longitude
									}
						    },
						    json: true // Automatically stringifies the body to JSON 
						}).then(function (res){
							return new Promise(function(resolve, reject) {
								console.log("***********************************************");
								console.log(res);
								//console.log(res.userOne);
								resolve(res);
							})
							
						}).then(function(res){
							return new Promise(function(resolve, reject) {
								sendThis(phoneNumber, "Start")
								.then(function(response) {
									return sendThis(match, "Start");
								}).then(function(response2) {
									resolve(res);
								})
							})
							
						}).then(function(res){
							return new Promise(function(resolve, reject) {
								sendThis(phoneNumber, "@" + res.name)
								.then(function(response) {
									return sendThis(match, "@" + res.name);
								}).then(function(response2) {
									resolve(res);
								})
							})
							
						}).then(function(res){
							return new Promise(function(resolve, reject) {
								sendThis(phoneNumber, "@" + res.address)
								.then(function(response) {
									return sendThis(match, "@" + res.address);
								}).then(function(response2) {
									resolve(res);
								})
							})
							
						}).then(function(res){
							return new Promise(function(resolve, reject) {
								each(res.userOne, function(direction, next) {
									if(direction.includes('Destination will')) {
										sendThis(phoneNumber, direction.substring(0,direction.indexOf('Destination will')))
										.then(function(response) {
											sendThis(phoneNumber, direction.substring(direction.indexOf('Destination will')))
											.then(function(response) {
												resolve(res);
											})
										})
									} else {
										sendThis(phoneNumber, direction).then(function(response) {
											next();
										});
									}
								}, function(err) {
										resolve(res);
								})
							})

						}).then(function(res){

							return new Promise(function(resolve, reject) {
								each(res.userTwo, function(direction, next) {
									if(direction.includes('Destination will')) {
										sendThis(match, direction.substring(0,direction.indexOf('Destination will')))
										.then(function(response) {
											sendThis(match, direction.substring(direction.indexOf('Destination will')))
											.then(function(response) {
												resolve(res);
											})
										})
									} else {
										sendThis(match, direction).then(function(response) {
											next();
										});
									}
								}, function(err) {
										resolve(res);
								})
							})
							
						}).then(function(res){
							return new Promise(function(resolve, reject) {
								sendThis(phoneNumber, "End").then(function(response) {
									sendThis(match, "End").then(function(response) {
										resolve(res);
									})
								})								
							})
							
						}).catch(function (err){
							console.log(err);
						});
						return true;
					}
                }
            });
            resolve(match);
        } else {
        	resolve(match);
        }
	});
};

// use our router middleware
app.use('/', mapRouter);

//Run the server
app.listen(port, function() {
	console.log('Magic happens on port ' + port);
});

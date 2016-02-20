'use strict';

var express = require('express');
var twilio = require('twilio');
var bodyParser = require('body-parser');

var Firebase = require('firebase');
var myFirebaseRef = new Firebase("https://tin-m-hacks.firebaseio.com");  
var userCounter = 0;

var accountSid = "ACf14e3ba903d05bddc9ca4c69e8be6d8d";
var authToken = "c6bdf749be21593d2073d7bd505ce705";

// Create a Twilio REST API client for authenticated requests to Twilio
var client = twilio(accountSid, authToken);

var app = express();
var mapRouter = require('./routes/mapRouter.js');

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

//Send an SMS text message
var sendThis = function(toNumber, message){
	console.log(toNumber);
	client.sendMessage({

	    to: toNumber, // Any number Twilio can deliver to
	    from: '+17082924124', // A number you bought from Twilio and can use for outbound communication
	    body: message // body of the SMS message

	}, function(err, responseData) { //this function is executed when a response is received from Twilio

	    if (!err) { // "err" is an error received during the request, if any

	        // "responseData" is a JavaScript object containing data received from Twilio.
	        // A sample response from sending an SMS message is here (click "JSON" to see how the data appears in JavaScript):
	        // http://www.twilio.com/docs/api/rest/sending-sms#example-1

	        console.log(responseData.from); // outputs "+14506667788"
	        console.log(responseData.body); // outputs "word to your mother."

	    }
	});
};

// choose whatever port we want to listen on
var port = process.env.PORT || 8080;

app.get('/', function (req, res) {
  res.send('Hello World!');
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

        /*
        //create firebase entry based on uuid
        myFirebaseRef.child(uuid).set({
            latitude:latitude, 
            longitude:longitude, 
        });


        //updates firebase snapshot every time new data is added
        myFirebaseRef.on("value", function(snapshot) {
            console.log(snapshot.val());
            }, function (errorObject) {
            console.log("The read failed: " + errorObject.code);
        });

        //sets a timer to delete "beacons" older than two minutes
        var now = Date.now(); 
        var cutoff = now - 5 * 60 * 1000; 
        var old = myFirebaseRef.orderByChild('timestamp').startAt(cutoff).limitToLast(1); 
        var listener = old.on('child_added', function(snapshot) {
            snapshot.ref().remove();
        });*/

        myFirebaseRef.once("value", function(snapshot){
            promisifyExists(snapshot, phoneNumber, latitude, longitude).then(function(response) {
            	if(response != ""){
            		console.log("Your match is: " + String(response));
            		return true;
            	}else{
            		console.log("The response is: " + String(response));
            		console.log("Waiting for match");
            		return false;
            	}
            }).then(function(response){
            	if(response === false){
	            	myFirebaseRef.child(phoneNumber).set({
	            		phoneNumber:phoneNumber,
		                latitude:latitude, 
		                longitude:longitude,
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
	                if(distance < 0.05){
	                	match = childSnapshot.key();
	                	// Update matched person to make sure nobody else matches with them.
	                	myFirebaseRef.child(match).update({matched:true});
	                	sendThis(match, "Matched!");
	                	sendThis(phoneNumber, "Matched!");
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

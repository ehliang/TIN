'use strict';

var express = require('express');
var twilio = require('twilio');
var bodyParser = require('body-parser');

var Firebase = require('firebase');
var myFirebaseRef = new Firebase("https://tin-m-hacks.firebaseio.com");  
var userCounter = 0;

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

// choose whatever port we want to listen on
var port = process.env.PORT || 8080;

app.get('/', function (req, res) {
  res.send('Hello World!');
});

/***************** Receive the text message *******************************/
// choose whatever port we want to listen on
var port = process.env.PORT || 8080;

app.post('/find-match', function(req, res){
	var requestContent = String(req.body.Body);
	var splitRequest = requestContent.split("@");
    // Log the request body for reference
    console.dir(String(req.body.Body));
    if(splitRequest[0] === ""){
        var uuid = splitRequest[1];
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
            promisifyExists(snapshot, latitude, longitude).then(function(response) {
            	if(response != ""){
            		console.log("Your match is: " + String(response));
            	}else{
            		console.log("No match found at this time");
            	}
            }).then(function(response){
            	myFirebaseRef.child(uuid).set({
	                latitude:latitude, 
	                longitude:longitude, 
	            });
	            console.log("Ref Created for " + uuid);
            }).catch(function(error) {
            	console.log(error);
            });
        });

    	console.log("latitude = " + latitude + "\nlongitude = " + longitude);
    }else{
    	console.log("whoops");
    }
}); 

var promisifyExists = function(snapshot, latitude, longitude) {
	return new Promise(function(resolve, reject) {
		var match = "";
		if(snapshot.exists()){
            snapshot.forEach(function(childSnapshot){
            	var childData = childSnapshot.val();
                //var distance = calculateDistance(latitude, childData.latitude, longitude, childData.longitude);
                var distance = Math.abs(Math.abs(latitude) - Math.abs(childData.latitude)) + Math.abs(Math.abs(longitude) - Math.abs(childData.longitude));
                //console.log(childSnapshot.key());
                //console.log(distance);
                if(distance < 0.05){
                	match = childSnapshot.key();
                	return true;
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

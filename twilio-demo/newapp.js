'use strict';

var express = require('express');
var twilio = require('twilio');
var bodyParser = require('body-parser');

var Firebase = require('firebase');
var myFirebaseRef = new Firebase("https://tin-m-hacks.firebaseio.com");  
var userCounter =0;

// setInterval(function(){
//           myFirebaseRef.child(userCounter).set({
//             latitude:"latitude", 
//             longitude:"ejwieiwfjiwef"
//         });
//             userCounter++;
// }, 5 * 1000);    


        // //create firebase entry based on uuid
        // myFirebaseRef.child("uwegfwwfwe").set({
        //     latitude:"latitude", 
        //     longitude:"ejwieiwfjiwef", 
        // });

        // myFirebaseRef.on("value", function(snapshot) {
        // console.log(snapshot.val());
        // }, function (errorObject) {
        //  console.log("The read failed: " + errorObject.code);
        // });

var app = express();
//var mapRouter = require('../routes/mapRouter.js');

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

app.post('/', function(req, res){
	var requestContent = String(req.body.Body);
	var splitRequest = requestContent.split("@");
    console.dir(String(req.body.Body));
    if(splitRequest[0] === ""){
        var uuid = splitRequest[1];
    	var latitude = splitRequest[2];
    	var longitude = splitRequest[3];

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
        });



    	console.log("latitude = " + latitude + "\nlongitude = " + longitude);
    }else{
    	console.log("whoops");
    }

    res.send("test");
}); 

app.listen(port);
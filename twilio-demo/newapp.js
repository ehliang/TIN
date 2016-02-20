'use strict';

var express = require('express');
var twilio = require('twilio');
var bodyParser = require('body-parser');

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
    	var latitude = splitRequest[1];
    	var longitude = splitRequest[2];

    	console.log("latitude = " + latitude + "\nlongitude = " + longitude);
    }else{
    	console.log("whoops");
    }

    res.send("test");
}); 

app.listen(port);
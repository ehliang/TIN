var express = require('express');
var router = express.Router();

module.exports = function() {
	router.get('/', function(req, res) {
		res.send("TEST WAS SECOND SUCCESSFUL");
	});
	router.get('/test', function(req, res) {
		res.send("TEST WAS SUCCESSFUL");
	});
}
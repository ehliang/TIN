var express = require('express');
var router = express.Router();


module.exports = function() {
	router.get('/test', function(req, res) {
		res.send("TEST WAS SUCCESSFUL");
	});
}
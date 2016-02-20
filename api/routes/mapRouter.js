var express = require('express');
var router = express.Router();

router.get('/test', function(req, res) {
	res.send("TEST WAS SUCCESSFUL");
});

router.post('/some-endpoint', function(req, res) {
	
});

module.exports = router;
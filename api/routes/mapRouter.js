var express = require('express');
var router = express.Router();


router.get('/test', function(req, res) {
	res.send("TEST WAS SUCCESSFUL");
});

module.exports = router;
var express = require('express');

var app = express();

// choose whatever port we want to listen on
var port = process.env.PORT || 8080;

app.get('/', function (req, res) {
  res.send('Hello World!');
});

//Run the server
app.listen(port, function() {
	console.log('Magic happens on port ' + port);
})
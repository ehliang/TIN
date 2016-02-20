var accountSid = "ACf14e3ba903d05bddc9ca4c69e8be6d8d";
var authToken = "c6bdf749be21593d2073d7bd505ce705";
//require the Twilio module and create a REST client
var client = require('twilio')(accountSid, authToken);

//Send an SMS text message
var sendThis = function(message){
	client.sendMessage({
	    to:'+17082924124', // Any number Twilio can deliver to
	    from: '+12672336296', // A number you bought from Twilio and can use for outbound communication
	    body: message, // body of the SMS message

	}, function(err, responseData) { //this function is executed when a response is received from Twilio

	    if (!err) { // "err" is an error received during the request, if any

	        // "responseData" is a JavaScript object containing data received from Twilio.
	        // A sample response from sending an SMS message is here (click "JSON" to see how the data appears in JavaScript):
	        // http://www.twilio.com/docs/api/rest/sending-sms#example-1
	        console.log(responseData.to);
	        console.log(responseData.from); // outputs "+14506667788"
	        console.log(responseData.body); // outputs "word to your mother."

	    }else if(err){
	    	console.log(err);
	    }
	});
};
//sendThis("@+12345678901@42.2527109@-83.7153888");
//sendThis("@+12345678902@42.2527109@-83.7153888");
sendThis("@+12345678903@42.2527109@-83.7153888");
sendThis("@+12345678904@42.2527109@-83.7153888");
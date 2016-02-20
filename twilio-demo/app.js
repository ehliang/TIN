// Download the Node helper library from twilio.com/docs/node/install
// These vars are your accountSid and authToken from twilio.com/user/account
var accountSid = "ACf14e3ba903d05bddc9ca4c69e8be6d8d";
var authToken = "c6bdf749be21593d2073d7bd505ce705";
var client = require('twilio')(accountSid, authToken);
 
client.sendMessage({

    to:'+14167006502', // Any number Twilio can deliver to
    from: '+17082924124', // A number you bought from Twilio and can use for outbound communication
    body: 'what.' // body of the SMS message

}, function(error, message) {
    // The HTTP request to Twilio will run asynchronously. This callback
    // function will be called when a response is received from Twilio
    // The "error" variable will contain error information, if any.
    // If the request was successful, this value will be "falsy"
    if (!error) {
        // The second argument to the callback will contain the information
        // sent back by Twilio for the request. In this case, it is the
        // information about the text messsage you just sent:
        console.log('Success! The SID for this SMS message is:');
        console.log(message.sid);
 
        console.log('Message sent on:');
        console.log(message.dateCreated);
    } else {
        console.log(error);
    }
});

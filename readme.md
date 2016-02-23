#TIN
Tourist Information Network

### Inspiration

While on vacation in China, one of our team members went out for a run and found himself completely and utterly lost. He had his phone with him (no data plan) and called his family but couldn’t describe his surroundings aside from “a red sign” and “a hotel or something” because he didn’t know the language. It was an embarrassing moment that ended in a 3-hour search session. We modelled this hack to make sure that this situation won’t happen again. (Google maps works in China!)

### What it does

The geographical midpoint between the two users is calculated, and a nearby establishment (restaurant, bank, library, museum, park, and many many more) is chosen as the "meeting point". This establishment minimizes the distance that both users must walk in order to meet. Once the establishment is located, a list of walking directions is sent to both user's devices to help direct them to the meeting point. 

### How we built it

We used Node.js for our server, and Android as our platform. 

We receive the user's geographical coordinates using the phone's GPS, and send it to our server via [Twilio](https://www.twilio.com/)'s text messenging APIs. 

We then check if the coordinates that we just received would put our new user within matching range of anyone that's already in our [Firebase](https://www.firebase.com/), and match them if they are. This pair is then sent to our pairing functions to determine the best meeting spots for them & directions to it. If they aren't matched immediately however, we place them in the database as someone who's waiting to be matched. This list is updated every 5 minutes, and the old entries are deleted. The owners of these entries are notified with a "Match not found." text when their entry is removed from the database.

All the geographical parts are built using [Google Map APIs](https://developers.google.com/maps/). Once the geographical coordinates of two users are located, we use Google to find a list of establishments within a certain limit from the geographical midpoint of the two users, and choose one of the establishments as the meeting ground. Once the ideal location is found, we provide directions for both users to reach the meeting point, by sending them via Twilio. 

APIs used- Twilio, Firebase, Google Places Nearby, Google Dimension Matrix, Google Directions


### Development

#### Prerequisites

* [Node](http://nodejs.org/)
* [npm](https://www.npmjs.com/)

Then clone this repo & run:

```sh
npm install
```

#### Running

```sh
npm start
```

The server will be running at
[http://localhost:8080/](http://localhost:8080/
)

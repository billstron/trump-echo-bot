require('dotenv').config();
var Twitter = require('twitter');

var client = new Twitter({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
});

function getMadLibs(){
  return "Making The Internet great again!";
}

function RetweetIt(tweet){
  var url = 'https://twitter.com/' + tweet.user.screen_name + '/statuses/' + tweet.id_str;
  var status = getMadLibs();
  client.post('statuses/update', {status: status + ' ' + url}, function(error, tweet) {
    if (error) {
      console.error(error);
    }
  });
}

client.get('users/lookup', {'screen_name': 'realDonaldTrump'}, function(error, reply, response) {
   var trump  = reply[0];

   var toFollow = [];
   toFollow.push(trump.id);

   var stream = client.stream('statuses/filter', {follow: toFollow.toString()});

   stream.on('data', function(tweet) {
     if(tweet.user.id == trump.id){
       RetweetIt(tweet);
       console.log(tweet.text);
       console.log('================');
     }
   });

   stream.on('error', e => console.error(e));

});

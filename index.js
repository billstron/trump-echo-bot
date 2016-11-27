require('dotenv').config();
var Twitter = require('twitter');
var fs = require('fs');
var csv = require('csv');
var Q = require('q');

var inputFile = 'input.csv';
var following = ['realDonaldTrump'];

function getTrumpQuote(){
  function pickOne(array){
    return array[Math.floor(Math.random() * array.length)];
  }

  return Q.nfcall(fs.readFile, inputFile, 'utf8')
    .then(function(data){
      return Q.nfcall(csv.parse, data, {columns: true, trim: true});
    })
    .then(function(items){
      var obj = {};
      function pickOut(array, key){
        return array.reduce(function(accum, value){
          if(value[key]){
            accum.push(value[key]);
          }
          return accum;
        }, []);
      }
      obj.nouns = pickOut(items, 'nouns');
      obj.adjetives = pickOut(items, 'adjetives');
      obj.phrases = pickOut(items, 'phrases');
      return obj;
    })
    .then(function(obj){
      var noun = pickOne(obj.nouns);
      var adjetive = pickOne(obj.adjetives);
      var phrase = eval('`' + pickOne(obj.phrases) + '`');
      return phrase;
    });
}

function retweet(tweet) {
  return getTrumpQuote()
    .then(function(status){
      console.log(status);
      var url = 'https://twitter.com/' + tweet.user.screen_name + '/statuses/' + tweet.id_str;
      return Q.ninvoke(client, 'post', 'statuses/update', {status: status + ' ' + url})
    })
    .then(function(tweet){
      console.log('submitted');
      console.log('================');
    })
    .catch(function(ex){
      console.error(ex);
    });
}

var client = new Twitter({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
});

client.get('users/lookup', {'screen_name': following.toString()}, function(err, reply, response){
  var toFollow = reply.map(r => r.id);
  var stream = client.stream('statuses/filter', {follow: toFollow.toString()});

  console.log('Started Trump\'s Echo');
  stream.on('data', function(tweet){
    if(toFollow.indexOf(tweet.user.id) !== -1){
      retweet(tweet);
    }
  });

  stream.on('error', e => console.error(e));
});

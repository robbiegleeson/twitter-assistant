#!/usr/bin/env node --harmony
const Twitter = require('twitter');
const background = require('background-process');
const low = require('lowdb');
const db = low('db.json')

background.ready(function(err, options) {

    if (err) return console.error(err);

    function checkForScheduledTweets() {

        const tweets = db.get('tweets')
                          .filter({status: 'scheduled'})
                          .value()

        const consumerKey = options.consumerKey;
        const consumerSecret = options.consumerSecret;
        const accessToken = options.accessToken;
        const accessTokenSecret = options.accessTokenSecret;

        const client = getTwitterClient({
            consumerKey,
            consumerSecret,
            accessToken,
            accessTokenSecret
        });


        for (var i = 0; i < tweets.length; i++) {
            const tweet = tweets[i];

            var params = {status: tweet.text};
            client.post('statuses/update', params, function(error, tweet, response) {
                if (error) {
                    console.log(error);
                    return;
                }

                return;
            });
        }

        db.get('tweets')
          .remove({ status: 'scheduled' })
          .write()

        // setTimeout(checkForScheduledTweets, 5000);
    }

    function getTwitterClient(tokens) {

        const client = new Twitter({
            consumer_key: tokens.consumerKey,
            consumer_secret: tokens.consumerSecret,
            access_token_key: tokens.accessToken,
            access_token_secret: tokens.accessTokenSecret
        });

        return client;
    }

    checkForScheduledTweets();
});

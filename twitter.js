#!/usr/bin/env node --harmony
const Twitter = require('twitter');
const background = require('background-process');
const low = require('lowdb');
const dbFile = process.env.HOME + '/db.json';
const db = low(dbFile);

background.ready(function(err, options) {
    try {
        if (err) return console.error(err);

        function checkForScheduledTweets() {
            const tweets = db.get('tweets')
                              .filter({status: 'scheduled'})
                              .value()

            const consumerKey = options.consumerKey;
            const consumerSecret = options.consumerSecret;
            const accessToken = options.accessToken;
            const accessTokenSecret = options.accessTokenSecret;
            const interval = parseInt(options.interval) * 60 * 1000|| 60000;

            var client = getTwitterClient({
                consumerKey,
                consumerSecret,
                accessToken,
                accessTokenSecret
            });

            for (var i = 0; i < tweets.length; i++) {
                const tweet = tweets[i];
                const tweetDate = tweet.date;
                const tweetTime = tweet.time;

                const scheduledDate = createDateObject(tweetDate, tweetTime);
                const dateNow = new Date();

                if (scheduledDate.getTime() <= dateNow.getTime()) {
                    var params = {status: tweet.text};
                    client.post('statuses/update', params, function(error, tweet, response) {
                        if (error) {
                            console.error(error);
                            return;
                        }
                    });

                    db.get('tweets')
                        .find({text: tweet.text})
                        .assign({status: 'published'})
                        .write();

                }
            }

            setTimeout(checkForScheduledTweets, interval);
        }

        function createDateObject(date, time) {
            const dateParts = date.split('/');
            const timeParts = time.split(':');

            const year = parseInt(dateParts[2], 10);
            const month = parseInt(dateParts[1], 10) - 1;
            const day = parseInt(dateParts[0], 10);
            const hour = parseInt(timeParts[0], 10);
            const min = parseInt(timeParts[1], 10);

            return new Date(year, month, day, hour, min);
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
    } catch (e) {
        console.log('Process Error: ', e);
    }

    checkForScheduledTweets();
});

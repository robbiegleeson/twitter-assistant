#!/usr/bin/env node --harmony
const program = require('commander');
const co = require('co');
const prompt = require('co-prompt');
const low = require('lowdb');
const db = low('db.json')
const colors = require('colors');
const Twitter = require('twitter');

function startTwitterAssistant() {
    console.log('Starting Twitter Assistant'.green);
    const client = getTwitterClient();

    const processId = checkForScheduledTweets();

}

function getTwitterClient() {
    const config = db.get('config')
                      .find({ id: 1 })
                      .value()

    const client = new Twitter({
        consumer_key: config.consumerKey,
        consumer_secret: config.consumerSecret,
        access_token_key: config.accessToken,
        access_token_secret: config.accessTokenSecret
    });

    return client;
}

program
    .command('show')
    .description('Show scheduled Tweets')
    .action(function () {

    });


program
    .command('config')
    .description('Configure Twitter details')
    .action(function() {
        co(function *() {
            const screenName = yield prompt('Twitter screen name: '.yellow);
            const consumerKey = yield prompt('Consumer Key: '.yellow);
            const consumerSecret = yield prompt('Consumer Secret: '.yellow);
            const accessToken = yield prompt('Access Token: '.yellow);
            const accessTokenSecret = yield prompt('Access Token Secret: '.yellow);

            db.defaults({ config: [] })
              .write()

            var success = db.get('config')
                .push({
                    id: 1,
                    screen_name: screenName,
                    consumerKey: consumerKey,
                    consumerSecret: consumerSecret,
                    accessToken: accessToken,
                    accessTokenSecret: accessTokenSecret,
                })
                .write();

            if (success) {
                console.log('Your configuration settings have been saved.'.green);
                startTwitterAssistant();
            }

        }).catch((err) => {
            console.log(`Error: ${err}`.red);
            process.exit(0);
        });
});


program
    .version('1.0.0');

program
    .parse(process.argv);

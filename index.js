#!/usr/bin/env node --harmony
const program = require('commander');
const co = require('co');
const prompt = require('co-prompt');
const low = require('lowdb');
const colors = require('colors');
const Twitter = require('twitter');
const cp = require('child_process');
const fs = require('fs');
const commandLineArgs = require('command-line-args');
const background = require('background-process');
const stdout = fs.openSync('logs/log.txt', 'a');
const stderr = fs.openSync('logs/error.txt', 'a');

const dbFile = process.env.HOME + '/db.json';
const db = low(dbFile);

const executables = {
    twitter: __dirname + 'twitter/index.js',
};

function startTwitterAssistant(username) {
    const config = db.get('config')
                      .find({ id: 1 })
                      .value()

    if (config['id'] !== 1) {
        console.log('App not configured. Run twitter config to set up configuration'.red);
        return;
    }

    const options = {
        consumerKey: config.consumerKey,
        consumerSecret: config.consumerSecret,
        accessToken: config.accessToken,
        accessTokenSecret: config.accessTokenSecret,
        stdio: [stdout, stderr],
        interval: config.interval,
    };

    const pId = background.start('twitter/index.js', options);

    var  update = db.get('config').find({id: 1}).assign({pId: pId}).write();

    console.log('Scheduler started'.green);
}

program
    .command('start')
    .description('Start the scheduler')
    .action(function () {
        startTwitterAssistant('robbiegleeson');
    });

program
    .command('stop')
    .description('Stop the scheduler')
    .action(function () {
        try {
            const config = db.get('config')
                              .find({ id: 1 })
                              .value()

            if (config['id'] === 1) {
                process.kill(parseInt(config['pId']));
                console.log('Process stopped'.green);
                process.exit();
            }
        } catch (e) {
            console.log('No process exists!'.red);
        }
    });

program
    .command('show')
    .description('Show scheduled Tweets')
    .action(function () {
        const tweets = db.get('tweets')
                          .value()

        for (var i = 0; i < tweets.length; i++) {
            const tweet = tweets[i];
            console.log('Tweet: '.yellow + `${tweet.text}`);
            console.log('Scheduled Date: '.yellow + `${tweet.date} @ ${tweet.time}`);
            console.log('Status: '.yellow + `${tweet.status}\n\n`);
        }
    });

program
    .command('add')
    .description('Add tweet')
    .action(function (){
        co(function *() {
            let content;
            var regex = /^[0-9]{2}[\/][0-9]{2}[\/][0-9]{4}$/g;

            content = yield prompt('What do you want to tweet?: '.yellow);
            if (content.length > 140) {
                content = yield prompt('Please enter less than 140 characters for your tweet!: ');
            }

            const date = yield prompt('What date do you want to tweet?: (dd/mm/yyyy) '.yellow);

            if (!regex.test(date)) {
                console.log('Malformed date. Please enter date as dd/mm/yyyy'.red);
                process.exit(0);
            }

            const time = yield prompt('What time do you want to tweet?: (hh:mm) '.yellow);

            db.get('tweets')
                .push({
                    status: 'scheduled',
                    text: content,
                    date: date,
                    time: time
                })
                .write()

            console.log('Tweet added!'.green);
            process.exit(0);
        });
    });

program
    .command('config')
    .description('Configure Twitter details')
    .action(function() {
        co(function *() {
            const config = db.get('config')
                              .find({ id: 1 })
                              .value()

            if (config && config['id'] === 1) {
                console.log('App already configured. Run twitter reset to clear configuration settings'.red);
                return;
            }

            db.defaults({ config: [], tweets: [] })
              .write()

            const consumerKey = yield prompt('Consumer Key: '.yellow);
            const consumerSecret = yield prompt('Consumer Secret: '.yellow);
            const accessToken = yield prompt('Access Token: '.yellow);
            const accessTokenSecret = yield prompt('Access Token Secret: '.yellow);
            const interval = yield prompt('Enter the scheduler intervel in minutes: '.yellow)

            var success = db.get('config')
                .push({
                    id: 1,
                    consumerKey: consumerKey,
                    consumerSecret: consumerSecret,
                    accessToken: accessToken,
                    accessTokenSecret: accessTokenSecret,
                    interval: interval,
                })
                .write();

            if (success) {
                console.log('Your configuration settings have been saved.'.green);
                process.exit(0);
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

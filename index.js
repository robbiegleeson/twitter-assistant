#!/usr/bin/env node --harmony
const program = require('commander');
const co = require('co');
const prompt = require('co-prompt');
const low = require('lowdb');
const db = low('db.json')
const colors = require('colors');
const Twitter = require('twitter');
const cp = require('child_process');
const fs = require('fs');

const background = require('background-process');

const executables = {
    twitter: 'twitter/index.js',
};

twitterProcesses = {};

function startTwitterAssistant(username) {
    console.log('starting...');
    const config = db.get('config')
                      .find({ id: 1 })
                      .value()

    if (config['id'] !== 1) {
        console.log('App not configured. Run twitter config to set up configuration'.red);
        return;
    }

    if ((username in twitterProcesses)) {
        log.error('App is already running!'.blue);
        return;
    }

    var stdout = fs.openSync('stdout.txt', 'a');
    var stderr = fs.openSync('stderr.txt', 'a');

    const options = {
        consumerKey: config.consumerKey,
        consumerSecret: config.consumerSecret,
        accessToken: config.accessToken,
        accessTokenSecret: config.accessTokenSecret,
        stdio: [stdout, stderr]
    };

    background.start('twitter/index.js', options);

    // let child = cp.fork('twitter/index.js', [
    //     config.consumerKey,
    //     config.consumerSecret,
    //     config.accessToken,
    //     config.accessTokenSecret
    // ]);
    //
    // twitterProcesses[username] = child.pid;
    //
    // child.on('close', (code) => {
    //     console.log(`child process exited with code ${code}`);
    // });
    //
    // child.on('error', (code) => {
    //     console.log(`Child process exited with code ${code}`);
    // });

    return;
}

program
    .command('start')
    .description('Start the scheduler')
    .action(function () {
        startTwitterAssistant('robbiegleeson');
    });

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
            const config = db.get('config')
                              .find({ id: 1 })
                              .value()

            if (config && config['id'] === 1) {
                console.log('App already configured. Run twitter reset to clear configuration settings'.red);
                return;
            }

            db.defaults({ config: [], tweets: [] })
              .write()

            const screenName = yield prompt('Twitter screen name: '.yellow);
            const consumerKey = yield prompt('Consumer Key: '.yellow);
            const consumerSecret = yield prompt('Consumer Secret: '.yellow);
            const accessToken = yield prompt('Access Token: '.yellow);
            const accessTokenSecret = yield prompt('Access Token Secret: '.yellow);

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
                return;
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

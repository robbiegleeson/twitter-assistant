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

const stdout = fs.openSync(process.env.HOME + '/logs/log.txt', 'a');
const stderr = fs.openSync(process.env.HOME + '/logs/error.txt', 'a');

const dbFile = process.env.HOME + '/db.json';
const db = low(dbFile);

const executables = {
    twitter: __dirname + 'twitter/index.js',
};

function startTwitterAssistant(username) {
    console.log('starting...');
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
        stdio: [stdout, stderr]
    };

    const pId = background.start('twitter/index.js', options);
    console.log(pId);

    var  update = db.get('config').find({id: 1}).assign({pId: pId}).write();
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
        const config = db.get('config')
                          .find({ id: 1 })
                          .value()

        if (config['id'] === 1) {
            process.kill(parseInt(config['pId']));
            console.log('Process stopped'.green);
            process.exit();
        } else {
            console.log('No process exists!'.red);
        }

    });

program
    .command('show')
    .description('Show scheduled Tweets')
    .action(function () {
        // TODO: show scheduled tweets
    });

program
    .command('add')
    .description('Add tweet')
    .action(function (){
        co(function *() {
            let content;

            content = yield prompt('What do you want to tweet?: '.yellow);
            if (content.length > 140) {
                content = yield prompt('Please enter less than 140 characters for your tweet!: ');
            }

            const date = yield prompt('What date do you want to tweet?: (dd/mm/yyyy) '.yellow);
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

            fs.openSync(process.env.HOME + '/logs/logs.txt', 'a');
            fs.openSync(process.env.HOME + '/logs/error.txt', 'a');

            const consumerKey = yield prompt('Consumer Key: '.yellow);
            const consumerSecret = yield prompt('Consumer Secret: '.yellow);
            const accessToken = yield prompt('Access Token: '.yellow);
            const accessTokenSecret = yield prompt('Access Token Secret: '.yellow);

            var success = db.get('config')
                .push({
                    id: 1,
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

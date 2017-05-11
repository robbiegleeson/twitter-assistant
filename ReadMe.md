# Twitter Scheduler

*A CLI tool for scheduling tweets for Twitter. A background process checks a local JSON file for scheduled Tweets according to a set interval*

## Features
- Schedule Tweets by date and time
- Configure scheduler interval on configuration setup ()
- View Tweets (Scheduled and Published)
- Stop running Twitter scheduler background process

## Installation
- Clone the repo `git clone https://github.com/robbiegleeson/twitter-assistant.git`
- `cd twitter-assistant && npm install -g`

## Configuration
You'll need to set up a Twitter app and get your consumer key and secret as well as your access token and secret. You can create an app [here](https://apps.twitter.com/)

Once you have your keys and secrets run `tweet config` and follow the prompts.

## Usage
```bash
    # Commands
    tweet config    # Configure the app
    tweet add       # Schedule a tweet
    tweet show      # Display scheduled and published tweets
    tweet start     # Start the Twitter scheduler background process
    tweet stop      # Stop the Twitter scheduler background process
```

## To-do
- Add command to reset or edit the configuration settings
- Add multiple Twitter accounts
- Add command to delete scheduled Tweets
- Upload media for Tweets

## Issues
Any bugs please create a new issue [here](https://github.com/robbiegleeson/twitter-assistant/issues)

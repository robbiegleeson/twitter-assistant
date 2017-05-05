var request = require('request');
var qs = require('querystring');
var fs = require('fs');
var twitter = require('twitter');

const CONSUMER_KEY = 'p5qURsUwMRxOw4AiN3yMkSuwg';
const SECRET = 'uVWQhRBl3cqsgJsoBpblKpG6kfgeUffFInanfGEoRpQybx2Bcx';
const REQUEST_TOKEN = "https://api.twitter.com/oauth/request_token";
const AUTHORIZE = "https://api.twitter.com/oauth/authorize";
const ACCESS_TOKEN = "https://api.twitter.com/oauth/access_token";

const HOMEDIR = process.env[(process.platform == 'WIN32') ? 'USERPROFILE' : 'HOME'];
const twitter_config = ".twitter_assistant";

module.exports.getAuthURL = function(cb) {
	const oauth = {
		consumer_key: CONSUMER_KEY,
		consumer_secret: SECRET,
		callback: "oob"
	};

	request.post({
		oauth: oauth,
		url: REQUEST_TOKEN
	}, function (error, rsp, body) {
		var auth_tokens = qs.parse(body);
		var url = AUTHORIZE + "?oauth_token=" + auth_tokens.oauth_token;
		cb(url, auth_tokens.oauth_token);
	});
}

module.exports.getAccessToken = function(token, pin, cb) {
	const oauth = {
		consumer_secret: SECRET,
		consumer_key: CONSUMER_KEY,
		token: token,
		verifier: pin
	};

	request.post({
		oauth: oauth,
		url: ACCESS_TOKEN
	}, function  (error, rsp, body) {
		const params = qs.parse(body);
        request.post({
            url: 'https://www.api.twitter.com/oauth2/token',
            auth: {
                username: params.oauth_token,
                password: params.oauth_token_secret
            },
        }, function (err, resp, body) {
            if (err) {
                console.log(err);
            }

            const response = qs.parse(body);
        });
		saveConfig(params);
		cb(params);
	});
};




function saveConfig(params) {
    if(!fs.existsSync(HOMEDIR + "/" + twitter_config)) {
	fs.mkdir(HOMEDIR + "/" + twitter_config);
    }
    fs.writeFileSync(HOMEDIR + "/" + twitter_config + "/user-config.json", JSON.stringify(params));
}

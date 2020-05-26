const express = require('express');
const router = express.Router();

const got = require('got');
const stream = require('stream');
const fs = require('fs');
const {promisify} = require('util');
const pipeline = promisify(stream.pipeline);
const Twitter = require('twitter-lite');
const config = require('../config');
const db = require('../models/index');

// Twitter auth creds
const client = new Twitter({
    subdomain: "api", // "api" is the default (change for other subdomains)
    version: "1.1", // version "1.1" is the default (change for other subdomains)
    consumer_key: config.twitter.consumer_key, // from Twitter.
    consumer_secret: config.twitter.consumer_secret, // from Twitter.
    access_token_key: config.twitter.access_token_key, // from your User (oauth_token)
    access_token_secret: config.twitter.access_token_secret // from your User (oauth_token_secret)
});

// retrieve oembed code from Twitter
async function getTweetEmbed(url) {
    try {
        const result = await got(`https://publish.twitter.com/oembed?url=${url}`);
        return JSON.parse(result.body);
    } catch(e) {
        console.log(e);
        return false;
    }
}

router.post('/tweets', (req, res) => {
    client.get('statuses/user_timeline', {
        screen_name: 'steak_umm',
        count: 2,
        include_rts: false,
        trim_user: true,
    })
        .then((results) => {
            res.setHeader('Content-Type', 'application/json');
            res.send(results);
        })
        .catch((e) => {
            console.log(e);
            res.status(500).send('Unable to retrieve tweet timeline.');
        });
});

router.post('/', (req, res) => {
    const profile = req.get('profile');
    let numTweets = req.get('tweet-amount');
    if (numTweets === undefined) {
        numTweets = 2;
    } else if (numTweets <= 0 || numTweets > 200) {
        res.status(400).send('Must specify between 1 to 200 tweets');
    }
    if (profile == null || profile === '') {
        res.status(400).send('No profile specified');
    } else {
        // retrieve list of recent tweets to display
        client.get('statuses/user_timeline', {
            screen_name: profile,
            count: numTweets,
            include_rts: false,
            trim_user: true,
        })
            .then((results) => {
                let tweetPromises = [];
                for (const result of results) {
                    // generate tweet URL based off profile ID and tweet ID
                    const url = encodeURIComponent(`http://twitter.com/${profile}/status/${result.id_str}`);
                    tweetPromises.push(
                        getTweetEmbed(url)
                    );
                }
                Promise.all(tweetPromises)
                    .then( (embedCodes) => {
                        res.setHeader('Content-Type', 'application/json');
                        res.send(embedCodes);
                    })
                    .catch((e) => {
                        console.log(e);
                        res.status(500).send('Unable to retrieve tweets.');
                    });
            })
            .catch((e) => {
                console.log(e);
                res.status(500).send('Unable to retrieve tweet timeline.');
            });
    }
});

module.exports = router;

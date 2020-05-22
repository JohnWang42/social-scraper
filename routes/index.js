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

// Twitter auth
const client = new Twitter({
    subdomain: "api", // "api" is the default (change for other subdomains)
    version: "1.1", // version "1.1" is the default (change for other subdomains)
    consumer_key: config.twitter.consumer_key, // from Twitter.
    consumer_secret: config.twitter.consumer_secret, // from Twitter.
    access_token_key: config.twitter.access_token_key, // from your User (oauth_token)
    access_token_secret: config.twitter.access_token_secret // from your User (oauth_token_secret)
});

/* GET home page. */
router.get('/', (req, res) => {
    res.render('index', { title: 'Allebach Communications Social Feed API' });
});

module.exports = router;

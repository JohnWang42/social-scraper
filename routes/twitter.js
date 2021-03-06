const express = require('express');
const router = express.Router();
const cors = require('cors');

const got = require('got');
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
        const params = {
            chrome: 'nofooter',
            omit_script: true,
            hide_media: true,
            link_color: 'e31d1a',
            hide_thread: true
        }
        let urlparams = '';
        Object.keys(params).forEach((key) => {
            urlparams += `${key}=${params[key]}&`;
        });
        console.log(urlparams);
        const result = await got(`https://publish.twitter.com/oembed?url=${url}?${urlparams}`);
        return JSON.parse(result.body);
    } catch(e) {
        console.log(e);
        return false;
    }
}

// find or create existing profile timestamp
async function getTwitterProfile(profile) {
    try {
        return await db['TwitterProfile'].findOrCreate({
            where: { name: profile },
            defaults: {
                last_updated: Date.now() - config.updateInterval * 60000 // sets a timestamp for before update interval
            }
        });
    } catch(error) {
        console.log(error);
        return null;
    }
}

async function cacheTweets(profile, tweets, user) {
    try {
        // get rid of old cache
        await db['TwitterEntry'].destroy({
           where: {
               account_name: profile
           }
        });

        // assemble tweet data and cache it
        let data = []; // data for caching
        let tweetData = []; // data to return
        for (const tweet of tweets) {
            data.push({
                account_name: profile,
                html: tweet.html
            });
            tweetData.push({ html: tweet.html });
        }
        await db['TwitterEntry'].bulkCreate(data);

        // update profile image and grab account info
        await db['TwitterProfile'].update({
            last_updated: Date.now(),
            profile_pic: user.profile_image_url_https,
            full_name: user.name
        }, {
            where: { name: profile }
        });
        const twitterAccount = await db['TwitterProfile'].findAll(
            {
                attributes: ['name', 'profile_pic', 'full_name'],
                where: {
                    name: profile
                }
            });

        // return tweets and account info
        return {
            tweets: tweetData,
            account: twitterAccount[0]
        };
    } catch(error) {
        console.log(error);
        return false;
    }
}

async function getTweetCache(profile) {
    try {
        const tweetData = await db['TwitterEntry'].findAll({
            attributes: ['html'],
            where: {
                account_name: profile
            }
        });

        const twitterAccount = await db['TwitterProfile'].findAll(
            {
                attributes: ['name', 'profile_pic', 'full_name'],
                where: {
                    name: profile
                }
            });

        // return tweets and account info
        return {
            tweets: tweetData,
            account: twitterAccount[0]
        };
    } catch(error) {
        console.log(error);
        return false;
    }
}

router.post('/', cors(), (req, res) => {
    const profile = req.get('profile');
    let numTweets = req.get('count');
    if (numTweets === undefined) {
        numTweets = 2;
    } else if (numTweets <= 0 || numTweets > 200) {
        res.status(400).send('Must specify between 1 to 200 tweets');
    }
    if (profile == null || profile === '') {
        res.status(400).send('No profile specified');
    } else {
        // check age of cache and grab new tweets if needed
        getTwitterProfile(profile)
            .then((account) => {
                if (Date.now() - account[0].last_updated >= config.updateInterval * 60000) {
                    // retrieve list of recent tweets to display
                    // since 'count' limits the amount before filtering retweets and replies, we have to grab the max of 200
                    client.get('statuses/user_timeline', {
                        screen_name: profile,
                        count: 200,
                        include_rts: false,
                        exclude_replies: true,
                        trim_user: false,
                    })
                        .then((results) => {
                            let tweetPromises = [];
                            for (let twt = 0; twt < numTweets && twt < results.length; twt++) {
                                const result = results[twt];
                                // generate tweet URL based off profile ID and tweet ID
                                const url = encodeURIComponent(`http://twitter.com/${profile}/status/${result.id_str}`);
                                tweetPromises.push(getTweetEmbed(url));
                            }

                            // wait for all oembed codes to return, cache and send to user
                            Promise.all(tweetPromises)
                                .then((embedCodes) => {
                                    cacheTweets(profile, embedCodes, results[0].user)
                                        .then((data) => {
                                            res.setHeader('Content-Type', 'application/json');
                                            res.send(data);
                                        });
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
                } else {
                    getTweetCache(profile)
                        .then((data) => {
                            res.setHeader('Content-Type', 'application/json');
                            res.send(JSON.stringify(data));
                        })
                        .catch((error) => {
                            console.log(error);
                            res.status(500).send('Unable to retrieve cached tweets.');
                        });
                }
            })
            .catch((error) => {
              console.log(error);
              res.status(500).send('Unable to retrieve account.')
            })
    }
});

module.exports = router;

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

// (async() => {
//   try {
//     client
//         .get("account/verify_credentials")
//         .then(results => {
//           console.log("Successful auth");
//         })
//         .catch(console.error);
//   } catch (e) {
//     console.log(e);
//   }
// })();

// grab html of instagram profile page
async function getInstaFeed(profile_slug) {
    try {
        const response = await got(`https://www.instagram.com/${profile_slug}/`);
        return response.body;
    } catch(error) {
        console.log(error.response.body);
        return null;
    }
}

// find or create existing profile timestamp
async function getInstagramProfile(slug) {
    try {
        return await db['InstagramProfile'].findOrCreate({
            where: {profile_slug: slug},
            defaults: {
                last_updated: Date.now() - config.updateInterval // sets a timestamp for before update interval
            }
        });
    } catch(error) {
        console.log(error);
        return null;
    }
}

async function getImagesFromInstagram(post) {
    try {
        for (const post of posts) {
            await pipeline(
                got.stream(post.img_src),
                fs.createWriteStream(`media/${post.url_code}.jpg`)
            );
        }
        return true;
    } catch(error) {
        console.log(error);
        return null;
    }
}

// update timestamp on profile
async function touchProfile(slug) {
    try {
        await db['InstagramProfile'].update({ last_updated: Date.now() }, {
            where: { profile_slug: slug }
        });
        return true;
    } catch(error) {
        console.log(error);
    }
}

/* GET home page. */
router.get('/', (req, res) => {
    res.render('index', { title: 'Allebach Communications Social Feed API' });
});

router.post('/twitter', (req, res) => {
    res.send("twitter feed");
});

//
router.post('/instagram', (req, res) => {
    const profile = req.get('profile');
    if (profile == null || profile === '') {
        res.status(400).send('No profile specified');
    } else {
        getInstagramProfile(profile)
            .then((account) => {
                if (Date.now() - account[0].last_updated >= config.updateInterval) {
                    // grab new images after update interval has passed
                    getInstaFeed(profile)
                        .then((data) => {
                            if (data == null) {
                                res.status(400).send('Unable to find profile');
                            } else {
                                const regex = /<script type="text\/javascript">window\._sharedData = ([\s\S]*?);<\/script>/gm;
                                const matches = regex.exec(data);
                                if (matches != null) {
                                    const images = JSON.parse(matches[1]).entry_data.ProfilePage[0].graphql.user.edge_owner_to_timeline_media.edges;
                                    let posts = [];
                                    const codeSwap = /(\\u0026)/gm;
                                    // get first 4 links and their thumbnails
                                    for (let n = 0; n < 4 && n < images.length; n++) {
                                        const thumbs = images[n].node.thumbnail_resources;
                                        let url = '';
                                        // get first thumbnail above 400px
                                        for (let t = 0; t < thumbs.length; t++) {
                                            let img = thumbs[t];
                                            if (img.config_width > 400) {
                                                url = img.src.replace(codeSwap, '&');
                                                t = thumbs.length;
                                            }
                                        }
                                        posts.push({
                                            url_code: images[n].node.shortcode,
                                            img_src: url
                                        })
                                    }
                                    // grab images, don't pull new one if it already exists
                                    for (const post of posts) {
                                        fs.access(`media/${post.url_code}.jpg`, fs.constants.F_OK, (err) => {
                                            if (!err) {
                                                getImagesFromInstagram(post)
                                                    .then()
                                                    .catch(error => {
                                                        console.log(error);
                                                        res.status(500).send('Unable to get images from Instagram');
                                                    });
                                            }
                                        });
                                    }
                                    touchProfile(profile);
                                    res.send('Send Grabbed images');
                                } else {
                                    res.status(400).send('Invalid/empty profile provided');
                                }
                            }
                        })
                        .catch(error => {
                            console.log(error);
                            res.status(500).send('Unable to retrieve profile');
                        });
                } else{
                    // send cached images if update interval has not passed
                    res.send('Send Cached images');
                }
            })
            .catch(error => {
                console.log(error);
                res.status(500).send('Unable to retrieve profile');
            });
    }
});

module.exports = router;

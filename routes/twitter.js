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

router.post('/', (req, res) => {
});

module.exports = router;

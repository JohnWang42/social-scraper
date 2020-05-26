const express = require('express');
const router = express.Router();

const stream = require('stream');
const {promisify} = require('util');

/* GET home page. */
router.get('/', (req, res) => {
    res.render('index', { title: 'Allebach Communications Social Feed API' });
});

module.exports = router;

const express = require('express');
const router = express.Router();

router.get('/', function (req, res) {
    res.render('game', {title: 'Game'});
})

module.exports = router;

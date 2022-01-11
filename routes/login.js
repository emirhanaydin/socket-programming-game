const express = require('express');
const router = express.Router();
const {v4: uuid} = require('uuid')

router.get('/', function (req, res) {
    res.redirect('/');
})

router.post('/', function (req, res) {
    const id = uuid()

    const {session} = req;
    const {username} = req.body;
    console.log(`Updating session for user ${username} (${id})`);
    session.user = {id, username}
    res.redirect('/game');
})

module.exports = router;

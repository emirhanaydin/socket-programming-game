const express = require('express');
const router = express.Router();
const {v4: uuid} = require('uuid')

function randomColor() {
    return Math.floor(Math.random() * 0x1000000);
}

router.get('/', function (req, res) {
    res.redirect('/');
})

router.post('/', function (req, res) {
    const id = uuid()

    const {session} = req;
    const {username} = req.body;
    console.log(`Updating session for user ${username} (${id})`);
    session.user = {id, username, color: randomColor()}
    res.redirect('/game');
})

module.exports = router;

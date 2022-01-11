const express = require('express');
const router = express.Router();
const {v4: uuid} = require('uuid')

router.get('/', function (req, res) {
    const id = uuid()

    console.log(`Updating session for user ${id}`);
    req.session.userId = id;
    res.send({result: 'OK', message: 'session updated'});
})

module.exports = router;

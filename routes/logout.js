const express = require('express');
const router = express.Router();
const {getWs} = require('../wss');

router.get('/', function (req, res) {
    const ws = getWs()

    console.log('destroying session');
    req.session.destroy(function () {
        if (ws != null) ws.close();

        res.send({result: 'OK', message: 'session destroyed'});
    })
})

module.exports = router;

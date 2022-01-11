const WebSocket = require('ws')

const userWsMap = new Map();

const wss = new WebSocket.Server({clientTracking: true, noServer: true});

wss.on('connection', onConnection);

function onConnection(ws, request) {
    const userId = request.session.userId;

    userWsMap.set(userId, ws);

    const thisArg = {userId};
    ws.on('message', onMessage.bind(thisArg));
    ws.on('close', onClose.bind(thisArg));
}

function onMessage(message) {
    const {userId} = this;

    console.log(`Received message ${message} from user ${userId}`)
}

function onClose() {
    const {userId} = this;
    userWsMap.delete(userId);
}

function getWs(id) {
    return userWsMap.get(id);
}

module.exports = {wss, getWs}

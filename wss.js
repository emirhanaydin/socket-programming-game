const WebSocket = require('ws')

const userWsMap = new Map();

const wss = new WebSocket.Server({clientTracking: true, noServer: true});

wss.on('connection', onConnection);

function onConnection(ws, request) {
    const {user} = request.session;
    const {id} = user;

    userWsMap.set(id, ws);

    ws.on('message', onMessage.bind(user));
    ws.on('close', onClose.bind(user));
}

function onMessage(message) {
    const {id, username} = this;

    console.log(`Received message ${message} from ${username} (${id})`)
}

function onClose() {
    const {id} = this;
    const ws = userWsMap.get(id);
    if (ws != null) {
        ws.removeAllListeners();
    }
    userWsMap.delete(id);
}

function getWs(id) {
    return userWsMap.get(id);
}

module.exports = {wss, getWs}

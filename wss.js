const WebSocket = require('ws')

const usersMap = new Map();
const userWsMap = new Map();

const wss = new WebSocket.Server({clientTracking: true, noServer: true});

wss.on('connection', onConnection);

function onConnection(ws, request) {
    const {user} = request.session;
    const {id} = user;

    const usersMessage = JSON.stringify({
        type: 'start',
        player: user,
        opponents: Array.from(usersMap.values()),
    });
    ws.send(usersMessage);

    const othersMessage = JSON.stringify({type: 'user-joined', user});
    broadcast(othersMessage);

    usersMap.set(id, user);
    userWsMap.set(id, ws);

    ws.on('message', onMessage.bind(user));
    ws.on('close', onClose.bind(user));
}

function onMessage(message) {
    const {id} = this;

    const position = JSON.parse(message);
    const msg = JSON.stringify({id, x: position.x, y: position.y});

    broadcastExcept(this, msg);
}

function broadcast(message) {
    for (const ws of userWsMap.values()) {
        ws.send(message);
    }
}

function broadcastExcept(user, message) {
    for (const [id, ws] of userWsMap.entries()) {
        if (user.id === id) continue;

        ws.send(message);
    }
}

function onClose() {
    const {id} = this;
    const ws = userWsMap.get(id);
    if (ws != null) {
        ws.removeAllListeners();
    }
    usersMap.delete(id);
    userWsMap.delete(id);

    broadcast(JSON.stringify({type: 'user-left', id}));
}

function getWs(id) {
    return userWsMap.get(id);
}

module.exports = {wss, getWs}

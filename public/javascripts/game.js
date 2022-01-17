import * as PIXI from './vendor/pixi/development/pixi.mjs'
import Vector from "./vector.js";

PIXI.utils.skipHello();

let app;
const sendRate = 1 / 20 * 1000
const opponentsMap = new Map();
const width = 800;
const height = 600;

const socket = new WebSocket('ws://localhost:3000');
socket.onmessage = function (e) {
    const {data} = e;
    const message = JSON.parse(data);
    const {type} = message;

    if (type == null) {
        const {id, x, y} = message;
        const opponent = opponentsMap.get(id);
        if (opponent == null) return;

        opponent.position = {x, y};
        return;
    }

    switch (type) {
        case 'start':
            const {player, opponents} = message;
            opponents.forEach(o => opponentsMap.set(o.id, {...o, position: {x: 0, y: 0}}));
            startApplication(player, opponents);
            break;
        case 'user-joined':
            const {user} = message;
            const opponent = {...user, position: {x: width / 2, y: height / 2}};
            const c = createCircle(opponent);
            opponent.circle = c
            app.stage.addChild(c);
            opponentsMap.set(user.id, opponent);
            break;
        case 'user-left':
            const {id} = message;
            const op = opponentsMap.get(id);
            if (op == null) return;
            app.stage.removeChild(op.circle);
            opponentsMap.delete(id);
    }
}

function createCircle(user) {
    const {renderer} = app;

    const gr = new PIXI.Graphics();
    const fillColor = user.color;
    gr.beginFill(fillColor);
    gr.drawCircle(0, 0, 48);
    gr.endFill();
    const tex = renderer.generateTexture(gr);
    const c = new PIXI.Sprite(tex);
    const text = new PIXI.Text(user.username, {
        fontSize: 16,
        fill: 0xFFFFFF - fillColor,
        fontWeight: 'bold'
    });
    const {anchor: textAnchor} = text;
    textAnchor.x = 0.5
    textAnchor.y = 0.5
    c.addChild(text);

    // Setup the position of the circle
    if (user.position != null) {
        c.x = user.position.x;
        c.y = user.position.y;
    }

    const {anchor} = c
    anchor.x = 0.5;
    anchor.y = 0.5;

    const opponent = opponentsMap.get(user.id);
    if (opponent != null) {
        opponent.circle = c;
    }

    return c;
}

function startApplication(player, opponents) {
    // The application will create a renderer using WebGL, if possible,
// with a fallback to a canvas render. It will also setup the ticker
// and the root stage PIXI.Container.
    app = new PIXI.Application({backgroundColor: 0xeeeeee});
    const {renderer} = app;

// The application will create a canvas element for you that you
// can then insert into the DOM.
    (function appendAppView() {
        const gameDiv = document.getElementById('game')
        const elem = gameDiv || document.body
        elem.appendChild(app.view);
    })()

    const velocity = new Vector(5, 5)

    const {width, height} = renderer;
    let targetX = width / 2;
    let targetY = height / 2;

    player.position = {x: targetX, y: targetY}
    const circle = createCircle(player);

    const {stage} = app;

    opponents.map(createCircle).forEach(c => {
        stage.addChild(c)
    });

    stage.addChild(circle);

    const hitArea = new PIXI.Rectangle(0, 0, width, height)
    const graphics = new PIXI.Graphics()
    graphics.hitArea = hitArea
    graphics.interactive = true
    stage.addChild(graphics)

    graphics.on('pointermove', (e) => {
        const {data: {global}} = e
        targetX = global.x
        targetY = global.y
    })

    const safeArea = (function getSafeArea() {
        const {anchor} = circle;
        const horizontal = circle.width * anchor.x
        const vertical = circle.height * anchor.y

        return new PIXI.Rectangle(
            horizontal,
            vertical,
            width - 2 * horizontal,
            height - 2 * vertical,
        )
    })()

    function moveCircle() {
        const {position} = circle
        const mousePos = new Vector(targetX, targetY)
        const difference = mousePos.subtract(position)

        if (difference.length < velocity.length) {
            position.set(targetX, targetY)
            return
        }

        const direction = difference.normalize()
        const vel = direction.product(velocity)
        const newPos = vel.add(position)

        const {x, y} = newPos.clamp(safeArea)

        position.set(x, y)
    }

// Listen for frame updates
    app.ticker.add(() => {
        moveCircle()

        for (const {position, circle} of opponentsMap.values()) {
            const {x, y} = position;
            circle.position.set(x, y)
        }
    });

    setInterval(() => {
        socket.send(`{"x":${circle.x},"y":${circle.y}}`);
    }, sendRate)
}

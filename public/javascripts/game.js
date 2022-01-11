import * as PIXI from './vendor/pixi/development/pixi.mjs'
import Vector from "./vector.js";

PIXI.utils.skipHello();

// The application will create a renderer using WebGL, if possible,
// with a fallback to a canvas render. It will also setup the ticker
// and the root stage PIXI.Container.
const app = new PIXI.Application({backgroundColor: 0xeeeeee});
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

const circle = (function createCircle() {
    const gr = new PIXI.Graphics();
    const fillColor = 0xFF0000;
    gr.beginFill(fillColor);
    gr.drawCircle(0, 0, 48);
    gr.endFill();
    const tex = renderer.generateTexture(gr);
    const c = new PIXI.Sprite(tex);
    const text = new PIXI.Text('Username', {
        fontSize: 16,
        fill: 0xFFFFFF - fillColor,
        fontWeight: 'bold'
    });
    text.anchor.x = 0.5
    text.anchor.y = 0.5
    c.addChild(text);
    return c;
})();

// Setup the position of the circle
circle.x = targetX;
circle.y = targetY;

// Rotate around the center
const {anchor} = circle
anchor.x = 0.5;
anchor.y = 0.5;

const {stage} = app;

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
});

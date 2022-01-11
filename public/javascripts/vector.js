import * as PIXI from "./vendor/pixi/development/pixi.mjs";

export default class Vector extends PIXI.Point {
    get length() {
        const {x, y} = this
        return Math.sqrt(x * x + y * y)
    }

    product(other) {
        const x = this.x * other.x
        const y = this.y * other.y
        return new Vector(x, y)
    }

    add(other) {
        const x = this.x + other.x
        const y = this.y + other.y
        return new Vector(x, y)
    }

    subtract(other) {
        const x = this.x - other.x
        const y = this.y - other.y
        return new Vector(x, y)
    }

    normalize() {
        const {x, y} = this

        const length = this.length
        return new Vector(x / length || 0, y / length || 0)
    }

    clamp(rect) {
        const {x, y} = this
        const {x: rx, y: ry, width, height} = rect

        let cx = x
        let cy = y

        if (x < rx) cx = rx
        else if (x > rx + width) cx = rx + width

        if (y < ry) cy = ry
        else if (y > ry + height) cy = ry + height

        return new Vector(cx, cy)
    }
}

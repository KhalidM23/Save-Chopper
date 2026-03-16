class Entity {
    constructor(gameEngine, x, y, width, height) {
        this.game = gameEngine;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.removeFromWorld = false;
        this.hitbox = new BoundingBox(this.x, this.y, this.width, this.height);
    }

    updateBB() {
        this.hitbox = new BoundingBox(this.x, this.y, this.width, this.height);
    }

    getBoundingBox() {
        return {
            x1: this.x,
            y1: this.y,
            x2: this.x + this.width,
            y2: this.y + this.height
        };
    }

    update() {
        this.updateBB();
    }

    draw(ctx) {
        // No default visual; subclasses are responsible for rendering.
    }
}
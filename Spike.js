class Spike extends Entity {
    constructor(gameEngine, x, y, width, height) {
        super(gameEngine, x, y, width, height);
        this.speed = 260;
        this.hasHitPlayer = false;
        this.damage = 25;

        this.animator = new Animator(
            ASSET_MANAGER.getAsset("./sprites/spike.png"),
            0, 0,
            160, 160,
            1, 0.2,
            true
        );
    }

    updateBB() {
        // Slightly shorter hitbox than the full spike to make jump timing more forgiving.
        const hbHeight = this.height * 0.7;
        const hbY = this.y + (this.height - hbHeight);
        this.hitbox = new BoundingBox(this.x, hbY, this.width, hbHeight);
    }

    update() {
        this.x -= this.speed * this.game.clockTick;

        this.updateBB();

        const player = this.game.player;
        if (player && player.hitbox && this.hitbox.collide(player.hitbox)) {
            if (!this.hasHitPlayer && typeof player.takeDamage === "function") {
                player.takeDamage(this.damage);
                this.hasHitPlayer = true;
            }
        } else {
            this.hasHitPlayer = false;
        }

        if (this.x + this.width < 0) {
            this.removeFromWorld = true;
        }
    }

    draw(ctx) {
        const scale = this.height / 160;
        const drawWidth = 50;
        const drawHeight = 50;

        // Center horizontally within the spike's logical width.
        const offsetX = this.x + (this.width - drawWidth) / 2;
        // Keep the sprite's bottom aligned with the old triangle bottom (y + height).
        const offsetY = this.y + this.height - drawHeight;

        this.animator.drawFrame(this.game.clockTick, ctx, offsetX, offsetY, 1);

        super.draw(ctx);
    }
}


class BreakableBlock extends Entity {
    constructor(gameEngine, x, y, width, height) {
        super(gameEngine, x, y, width, height);
        this.broken = false;
        this.speed = 260;
        this.damage = 1;
        this.hasDamagedPlayer = false;

        this.animator = new Animator(
            ASSET_MANAGER.getAsset("./sprites/thwomp.png"),
            0, 0,
            41, 53,
            4, 0.15,
            true
        );
    }

    update() {
        if (this.broken) return;

        this.x -= this.speed * this.game.clockTick;
        this.updateBB();

        const player = this.game.player;
        if (player && player.hitbox && this.hitbox.collide(player.hitbox)) {
            const isPunching = !!player.isPunching;
            const isSprinting = player.canSprint && player.sprintTimer > 0 && !!player.game.keys['Shift'];

            if (isPunching || isSprinting) {
                // Player breaks the block by punching or sprinting into it.
                this.broken = true;
                this.removeFromWorld = true;
            } else if (!this.hasDamagedPlayer && typeof player.takeDamage === "function") {
                // Player runs into the block without punching/sprinting: take damage.
                player.takeDamage(this.damage);
                this.hasDamagedPlayer = true;
            }
        }

        if (this.x + this.width < 0) {
            this.removeFromWorld = true;
        }
    }

    draw(ctx) {
        if (this.broken) return;
        const scaleX = this.width;
        const scaleY = this.height;
        //const scale = Math.min(scaleX, scaleY);
        this.animator.drawFrame(this.game.clockTick, ctx, this.x, this.y, 1);
        super.draw(ctx);
    }
}


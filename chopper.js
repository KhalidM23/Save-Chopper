class chopper extends Entity {
    constructor(gameEngine) {
        super(gameEngine, 200, 170, 50, 70);
        this.speed = 150;
        this.scale = -1;
        this.punchCount = 1;
        this.jumpVelocity = 0;
        this.ground = this.y;
        this.backgroundNumber = 1;
        this.cooldown = 0;

        this.maxHealth = 6;
        this.health = this.maxHealth;
        this.invulnTimer = 0;

        this.walkingAnimator  = new Animator(ASSET_MANAGER.getAsset("./sprites/walkingchopper.png"), 2, 0, 70, 73, 8, 0.14, true);
        this.idleAnimator     = new Animator(ASSET_MANAGER.getAsset("./sprites/standingchopper.png"), 0, 0, 64, 71, 4, 0.3, true);
        this.punchAnimator1   = new Animator(ASSET_MANAGER.getAsset("./sprites/punch1.png"), 2, 0, 99, 76, 4, 0.15, false);
        this.punchAnimator2   = new Animator(ASSET_MANAGER.getAsset("./sprites/punch2.png"), 2, 0, 94, 66, 4, 0.15, false);
        this.punchAnimator3   = new Animator(ASSET_MANAGER.getAsset("./sprites/punch3.png"), 0, 0, 84, 81, 4, 0.15, false);
        this.runAnimator      = new Animator(ASSET_MANAGER.getAsset("./sprites/runchopper.png"), 5, 0, 70, 71, 6, 0.2, true);
        this.jumpAnimator     = new Animator(ASSET_MANAGER.getAsset("./sprites/jumpchopper.png"), 0, 0, 89, 83, 8, 0.08, false);

        this.currentAnimator = this.walkingAnimator;

        this.movement = new Movement(this);
        this.jumpController = new JumpController(this);
        this.punchController = new PunchController(this);

        this.avoidStreak = 0;
        this.canSprint = false;
        this.sprintTimer = 0;
    }

    takeDamage(amount) {
        if (this.invulnTimer > 0) return;
        this.health = Math.max(0, this.health - amount);
        this.invulnTimer = 0.35;
        this.avoidStreak = 0;
        this.canSprint = false;
        this.sprintTimer = 0;
        if (this.health <= 0 && this.game && typeof this.game.dieGame === "function") {
            this.game.dieGame();
        }
    }

    onObstacleResult(avoidedDamage) {
        if (avoidedDamage) {
            this.avoidStreak++;
            if (this.avoidStreak >= 5) {
                this.avoidStreak = 0;
                this.canSprint = true;
                this.sprintTimer = 10;
            }
        } else {
            this.avoidStreak = 0;
        }
    }

    updateBB() {
        if(this.scale === 1) {
        this.hitbox = new BoundingBox(this.x, this.y, 50, 70);
        } else {
            this.hitbox = new BoundingBox(this.x - 50, this.y, 50, 70);
        }
    }

    update() {
        let isJumping = this.currentAnimator === this.jumpAnimator;
        let isPunching = this.currentAnimator === this.punchAnimator1 ||
                         this.currentAnimator === this.punchAnimator2 ||
                         this.currentAnimator === this.punchAnimator3;

        if (!isJumping) this.ground = this.y;

        this.movement.update();
        if (this.invulnTimer > 0) this.invulnTimer -= this.game.clockTick;
        if (this.canSprint && this.sprintTimer > 0) {
            this.sprintTimer -= this.game.clockTick;
            if (this.sprintTimer <= 0) {
                this.canSprint = false;
                this.sprintTimer = 0;
            }
        }

        if ((this.game.keys['ArrowUp'] || this.game.keys['KeyW']) && !isJumping && !isPunching) {
            this.jumpController.tryJump();
        }
        if (this.game.keys['KeyF'] && !isPunching && !isJumping && this.cooldown <= 0) {
            this.punchController.tryPunch();
            this.cooldown = 0.7;
        }
        if (this.cooldown > 0) this.cooldown -= this.game.clockTick;
        // recalculate after tryPunch may have changed currentAnimator
        isJumping = this.currentAnimator === this.jumpAnimator;
        isPunching = this.currentAnimator === this.punchAnimator1 ||
                     this.currentAnimator === this.punchAnimator2 ||
                     this.currentAnimator === this.punchAnimator3;
        this.isPunching = isPunching;

        if (isJumping) this.jumpController.update();
        if (isPunching) this.punchController.update();

        // Update hitbox AFTER movement/jump changes position this frame.
        this.updateBB();

        if (!isPunching && !isJumping) {
            const canUseSprint = this.canSprint && this.sprintTimer > 0 && this.game.keys['Shift'];
            this.currentAnimator = canUseSprint ? this.runAnimator : this.walkingAnimator;
            this.speed = canUseSprint ? 300 : 150;
        }
    }

    draw(ctx) {
        this.currentAnimator.drawFrame(this.game.clockTick, ctx, this.x, this.y, this.scale);

        const barX = 20;
        const barY = 20;
        const barWidth = 220;
        const barHeight = 14;
        const healthPercent = this.maxHealth > 0 ? (this.health / this.maxHealth) : 0;

        ctx.save();
        ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
        ctx.fillRect(barX - 3, barY - 3, barWidth + 6, barHeight + 6);
        ctx.fillStyle = "red";
        ctx.fillRect(barX, barY, barWidth, barHeight);
        ctx.fillStyle = "lime";
        ctx.fillRect(barX, barY, barWidth * Math.max(0, Math.min(1, healthPercent)), barHeight);
        ctx.strokeStyle = "white";
        ctx.lineWidth = 2;
        ctx.strokeRect(barX, barY, barWidth, barHeight);
        ctx.restore();

        const hudX = this.game.ctx.canvas.width - 220;
        const hudY = 18;
        ctx.save();
        ctx.font = "14px 'Courier New', monospace";
        ctx.textAlign = "left";

        // Pixel-style HUD panel
        ctx.fillStyle = "rgba(10, 10, 10, 0.9)";
        ctx.fillRect(hudX - 8, hudY - 10, 208, 64);
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2;
        ctx.strokeRect(hudX - 8.5, hudY - 10.5, 209, 65);

        ctx.fillStyle = "#f0f0f0";
        const sprintAvailable = this.canSprint && this.sprintTimer > 0;
        const timerText = sprintAvailable ? ` (${this.sprintTimer.toFixed(1)}s)` : "";
        ctx.fillText(`STREAK : ${this.avoidStreak}`, hudX, hudY + 4);
        ctx.fillText(`SPRINT : ${sprintAvailable ? "READY" : "LOCKED"}${timerText}`, hudX, hudY + 22);
        const score = this.game && typeof this.game.score === "number" ? Math.floor(this.game.score) : 0;
        ctx.fillText(`SCORE  : ${score}`, hudX, hudY + 40);
        ctx.restore();

        super.draw(ctx);
    }
}
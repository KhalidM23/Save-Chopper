class ObstacleManager extends Entity {
    constructor(gameEngine) {
        super(gameEngine, 0, 0, 0, 0);
        this.current = null; // kept for backward compatibility, not used
        this.obstacles = [];
        this.spawnCooldown = 0;
        this.spawnDelay = 0.9; // base delay when not sprinting
        this.totalSpawned = 0;
        this.maxObstaclesToWin = 50;

        // Ground line for obstacles. Will be initialized once from the
        // player's starting position, then treated as a fixed point.
        this.groundY = 300;
        this.groundInitialized = false;
    }

    reset() {
        this.obstacles = [];
        this.spawnCooldown = 0;
        this.groundInitialized = false;
    }

    spawnObstacle() {
        const canvasWidth = this.game.ctx ? this.game.ctx.canvas.width : 900;
        const spawnX = canvasWidth + 60;
        const isBlock = Math.random() < 0.5;

        this.totalSpawned++;

        // Trigger win condition once enough obstacles have spawned.
        if (this.totalSpawned >= this.maxObstaclesToWin &&
            this.game &&
            typeof this.game.winGame === "function" &&
            this.game.gameState === "playing") {
            this.game.winGame();
        }

        if (isBlock) {
            return new BreakableBlock(this.game, spawnX, this.groundY - 60, 60, 60);
        } else {
            return new Spike(this.game, spawnX, this.groundY - 40, 40, 40);
        }
    }

    update() {
        const player = this.game.player;
        if (!this.groundInitialized && player) {
            this.groundY = player.y + player.height;
            this.groundInitialized = true;
        }
        const isSprinting =
            player &&
            player.canSprint &&
            player.sprintTimer > 0 &&
            player.game.keys['Shift'];
        const currentDelay = isSprinting ? 0.15 : this.spawnDelay;

        const targetCount = isSprinting ? 2 : 1;

        if (this.obstacles.length < targetCount) {
            if (this.spawnCooldown > 0) {
                this.spawnCooldown -= this.game.clockTick;
            } else {
                const offset = 40 * this.obstacles.length;
                const obs = this.spawnObstacle();
                if (obs) {
                    obs.x += offset;
                    this.obstacles.push(obs);
                }
                this.spawnCooldown = currentDelay;
            }
        }

        for (let i = this.obstacles.length - 1; i >= 0; i--) {
            const o = this.obstacles[i];
            o.update();

            if (o.removeFromWorld || o.x + o.width < 0) {
                if (player && typeof player.onObstacleResult === "function") {
                    const damaged =
                        (!!o.hasDamagedPlayer) ||
                        (!!o.hasHitPlayer);
                    player.onObstacleResult(!damaged);
                }
                this.obstacles.splice(i, 1);
            }
        }
    }

    draw(ctx) {
        for (const o of this.obstacles) {
            o.draw(ctx);
        }
    }
}


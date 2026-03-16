// This game shell was happily modified from Googler Seth Ladd's "Bad Aliens" game and his Google IO talk in 2011

class GameEngine {
    constructor(options) {
        // What you will use to draw
        // Documentation: https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D
        this.ctx = null;

        // Everything that will be updated and drawn each frame
        this.entities = [];

        // Information on the input
        this.click = null;
        this.mouse = null;
        this.wheel = null;
        this.keys = {};

        // Options and the Details
        this.options = options || {
            debugging: false,
        };

        this.gameState = "menu"; // "menu" | "playing" | "help" | "dead" | "won"
        this.timeAlive = 0;
        this.score = 0;
        this.highScore = 0;
    };

















    // helper method to check if keys are being pressed
    isAnyKeyPressed() {
        return Object.values(this.keys).some(key => key === true);
    }













    init(ctx) {
        this.ctx = ctx;
        this.startInput();
        this.timer = new Timer();
    };

    start() {
        this.running = true;
        const gameLoop = () => {
            this.loop();
            requestAnimFrame(gameLoop, this.ctx.canvas);
        };
        gameLoop();
    };

    startInput() {
        const getXandY = e => ({
            x: e.clientX - this.ctx.canvas.getBoundingClientRect().left,
            y: e.clientY - this.ctx.canvas.getBoundingClientRect().top
        });


        this.ctx.canvas.addEventListener("keydown", e => {
            switch(e.code) {
                case "ArrowLeft":
                case "KeyA":
                    this.keys['KeyA'] = true;
                    this.keys['ArrowLeft'] = true;
                    break;
                case "ArrowRight":
                case "KeyD":
                    this.keys['KeyD'] = true;
                    this.keys['ArrowRight'] = true;
                    break;

                case "ArrowUp":
                case "KeyW":
                    this.keys['KeyW'] = true;
                    this.keys['ArrowUp'] = true;
                    break;

                case "KeyF":
                    this.keys['KeyF'] = true;
                    break;

                case "ShiftRight":
                case "ShiftLeft":
                    this.keys['Shift'] = true;
                    break;
            }
        }, false);

        this.ctx.canvas.addEventListener("keyup", e => {
            switch(e.code) {
                case "ArrowLeft":
                case "KeyA":
                    this.keys['KeyA'] = false;
                    this.keys['ArrowLeft'] = false;
                    break;
                case "ArrowRight":
                case "KeyD":
                    this.keys['KeyD'] = false;
                    this.keys['ArrowRight'] = false;
                    break;

                case "ArrowUp":
                case "KeyW":
                    this.keys['KeyW'] = false;
                    this.keys['ArrowUp'] = false;
                    break;

                case "KeyF":
                    this.keys['KeyF'] = false;
                    break;

                case "ShiftLeft":
                case "ShiftRight":
                    this.keys['Shift'] = false;
                    break;
            }
        }, false);
        
        this.ctx.canvas.addEventListener("mousemove", e => {
            if (this.options.debugging) {
                console.log("MOUSE_MOVE", getXandY(e));
            }
            this.mouse = getXandY(e);
        });

        this.ctx.canvas.addEventListener("click", e => {
            if (this.options.debugging) {
                console.log("CLICK", getXandY(e));
            }
            this.click = getXandY(e);
        });

        this.ctx.canvas.addEventListener("wheel", e => {
            if (this.options.debugging) {
                console.log("WHEEL", getXandY(e), e.wheelDelta);
            }
            e.preventDefault(); // Prevent Scrolling
            this.wheel = e;
        });

        this.ctx.canvas.addEventListener("contextmenu", e => {
            if (this.options.debugging) {
                console.log("RIGHT_CLICK", getXandY(e));
            }
            e.preventDefault(); // Prevent Context Menu
            this.rightclick = getXandY(e);
        });

        //.ctx.canvas.addEventListener("keydown", event => this.keys[event.key] = true);
        //this.ctx.canvas.addEventListener("keyup", event => this.keys[event.key] = false);
    };

    addEntity(entity) {
        this.entities.push(entity);
    };

    startGame() {
        this.gameState = "playing";
        this.timeAlive = 0;
        this.score = 0;
        if (this.player) {
            this.player.health = this.player.maxHealth;
            this.player.x = 200;
            this.player.y = 170;
            this.player.ground = this.player.y;
        }
        if (this.obstacleManager && typeof this.obstacleManager.reset === "function") {
            this.obstacleManager.reset();
        }
    };

    endGame() {
        if (this.score > this.highScore) {
            this.highScore = this.score;
        }
        this.gameState = "menu";
    };

    winGame() {
        if (this.score > this.highScore) {
            this.highScore = this.score;
        }
        this.gameState = "won";
    };

    dieGame() {
        if (this.score > this.highScore) {
            this.highScore = this.score;
        }
        this.gameState = "dead";
    };

    drawMenu() {
        const ctx = this.ctx;
        const canvas = ctx.canvas;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const titleY = canvas.height * 0.2;
        ctx.save();
        ctx.font = "bold 32px 'Courier New', monospace";
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.fillText("Save Chopper", canvas.width / 2, titleY);

        if (this.player && this.player.idleAnimator) {
            this.player.idleAnimator.drawFrame(
                this.clockTick || 0,
                ctx,
                canvas.width / 2 - 35,
                titleY + 30,
                this.player.scale
            );
        }

        const buttonWidth = 220;
        const buttonHeight = 60;
        const buttonX = canvas.width / 2 - buttonWidth / 2;
        const buttonY = canvas.height * 0.55;

        // Start button
        ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
        ctx.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);
        ctx.strokeStyle = "white";
        ctx.lineWidth = 2;
        ctx.strokeRect(buttonX, buttonY, buttonWidth, buttonHeight);

        ctx.font = "24px 'Courier New', monospace";
        ctx.fillStyle = "white";
        ctx.fillText("Start Game", canvas.width / 2, buttonY + 38);

        // Help button below
        const helpY = buttonY + buttonHeight + 10;
        ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
        ctx.fillRect(buttonX, helpY, buttonWidth, 48);
        ctx.strokeStyle = "white";
        ctx.lineWidth = 2;
        ctx.strokeRect(buttonX, helpY, buttonWidth, 48);

        ctx.font = "20px 'Courier New', monospace";
        ctx.fillStyle = "white";
        ctx.fillText("Help", canvas.width / 2, helpY + 30);

        ctx.font = "18px 'Courier New', monospace";
        ctx.fillText(
            `Best Score: ${Math.floor(this.highScore)}`,
            canvas.width / 2,
            helpY + 70
        );
        ctx.restore();

        if (this.click) {
            const { x, y } = this.click;
            if (x >= buttonX && x <= buttonX + buttonWidth &&
                y >= buttonY && y <= buttonY + buttonHeight) {
                this.startGame();
            } else if (x >= buttonX && x <= buttonX + buttonWidth &&
                       y >= helpY && y <= helpY + 48) {
                this.gameState = "help";
            }
            this.click = null;
        }
    };

    drawHelp() {
        const ctx = this.ctx;
        const canvas = ctx.canvas;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.save();
        const panelX = canvas.width * 0.1;
        const panelY = canvas.height * 0.15;
        const panelW = canvas.width * 0.8;
        const panelH = canvas.height * 0.7;

        ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
        ctx.fillRect(panelX, panelY, panelW, panelH);
        ctx.strokeStyle = "white";
        ctx.lineWidth = 2;
        ctx.strokeRect(panelX, panelY, panelW, panelH);

        ctx.fillStyle = "white";
        ctx.font = "26px 'Courier New', monospace";
        ctx.textAlign = "center";
        ctx.fillText("How to Play", canvas.width / 2, canvas.height * 0.22);

        ctx.font = "18px 'Courier New', monospace";
        ctx.textAlign = "left";
        const startX = panelX + 30;
        let y = canvas.height * 0.30;
        const line = text => { ctx.fillText(text, startX, y); y += 26; };

        line("W or Up Arrow  : Jump");
        line("F : Punch (break Thwomp blocks)");
        line("Avoid spikes at all costs.");
        line("Build streak by passing 5 obstacles without taking damage");
        line("to unlock Sprint for 10 seconds.");
        line("Hold Shift while Sprint is READY to become STRONGER.");
        line("Survive until 50 obstacles have spawned.");
        line("Score increases as you survive.");

        ctx.restore();

        if (this.click) {
            this.gameState = "menu";
            this.click = null;
        }
    }

    draw() {
        if (this.gameState === "menu") {
            this.drawMenu();
            return;
        } else if (this.gameState === "help") {
            this.drawHelp();
            return;
        } else if (this.gameState === "dead" || this.gameState === "won") {
            this.drawEndScreen(this.gameState === "dead" ? "You Died!" : "You Won!");
            return;
        }

        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

        for (let i = this.entities.length - 1; i >= 0; i--) {
            this.entities[i].draw(this.ctx, this);
        }
    };

    update() {
        if (this.gameState !== "playing") return;

        this.timeAlive += this.clockTick;
        const streak = this.player ? (this.player.avoidStreak || 0) : 0;
        const multiplier = 1 + 0.2 * streak;
        this.score += this.clockTick * 100 * multiplier;

        let entitiesCount = this.entities.length;

        for (let i = 0; i < entitiesCount; i++) {
            let entity = this.entities[i];

            if (!entity.removeFromWorld) {
                entity.update();
            }
        }

        for (let i = this.entities.length - 1; i >= 0; --i) {
            if (this.entities[i].removeFromWorld) {
                this.entities.splice(i, 1);
            }
        }
    };

    loop() {
        this.clockTick = this.timer.tick();
        this.update();
        this.draw();
    };

    drawEndScreen(message) {
        const ctx = this.ctx;
        const canvas = ctx.canvas;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.save();
        ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "white";
        ctx.textAlign = "center";

        ctx.font = "bold 40px 'Courier New', monospace";
        ctx.fillText(message, canvas.width / 2, canvas.height * 0.35);

        ctx.font = "22px 'Courier New', monospace";
        ctx.fillText(`Score: ${Math.floor(this.score)}`, canvas.width / 2, canvas.height * 0.45);
        ctx.fillText(`Best: ${Math.floor(this.highScore)}`, canvas.width / 2, canvas.height * 0.50);

        ctx.font = "20px 'Courier New', monospace";
        ctx.fillText("Click anywhere to return to menu", canvas.width / 2, canvas.height * 0.62);

        ctx.restore();

        if (this.click) {
            this.gameState = "menu";
            this.click = null;
        }
    }

};

// KV Le was here :)
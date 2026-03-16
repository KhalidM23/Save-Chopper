class JumpController {
    constructor(chopper) {
        this.chopper = chopper;
    }

    tryJump() {
        const c = this.chopper;
        c.currentAnimator = c.jumpAnimator;
        c.currentAnimator.reset();
        const isSprinting = c.canSprint && c.sprintTimer > 0 && !!c.game.keys['Shift'];
        c.jumpVelocity = isSprinting ? -420 : -300;
        c.ground = c.y;
    }

    update() {
        const c = this.chopper;
        c.jumpVelocity += 800 * c.game.clockTick;
        c.y += c.jumpVelocity * c.game.clockTick;

        if (c.y >= c.ground) {
            c.y = c.ground;
            c.jumpVelocity = 0;
            if (c.game.isAnyKeyPressed()) {
                c.currentAnimator = c.game.keys['Shift'] ? c.runAnimator : c.walkingAnimator;
            } else {
                c.currentAnimator = c.walkingAnimator;
            }
        }
    }
}
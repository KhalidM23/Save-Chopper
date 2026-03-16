class PunchController {
    constructor(chopper) {
        this.chopper = chopper;
    }

    tryPunch() {
        const c = this.chopper;
        if (c.punchCount === 1) c.currentAnimator = c.punchAnimator1;
        else if (c.punchCount === 2) c.currentAnimator = c.punchAnimator2;
        else {
            c.currentAnimator = c.punchAnimator3;
            c.punchCount = 0;
            c.y -= 20;
        }
        c.currentAnimator.reset();
    }

    update() {
        const c = this.chopper;
        if (c.currentAnimator.isDone()) {
            if (c.punchCount === 0) c.y += 20;
            c.punchCount += 1;
            if (c.game.isAnyKeyPressed()) {
                c.currentAnimator = c.game.keys['Shift'] ? c.runAnimator : c.walkingAnimator;
            } else {
                c.currentAnimator = c.walkingAnimator;
            }
        }
    }
}
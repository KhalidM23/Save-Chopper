class Movement {
    constructor(chopper) {
        this.chopper = chopper;
    }

    update() {
        // Dino-runner style: Chopper stays at a fixed X and only jumps.
        // Horizontal movement will be simulated by enemies/obstacles moving toward him.
    }

    handleScreenWrap() {
        // No screen wrap logic needed in runner mode.
    }
}
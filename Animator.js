class Animator {

    constructor(spritesheet, xStart, yStart, width, height, frameCount, frameDuration, loop) {
        Object.assign(this, {spritesheet, xStart, yStart, width, height, frameCount, frameDuration, loop});

        this.elapsedTime = 0;
        this.totalTime = frameCount * frameDuration;
        this.currentTime = 0;
    };


    drawFrame(tick, ctx, x, y, scale) {
        this.elapsedTime += tick;
        const frame = this.currentFrame();

        if(this.loop && this.elapsedTime >= this.totalTime - this.frameDuration) {
            this.currentTime += this.elapsedTime;
            this.elapsedTime = 0;
        }

        ctx.save();
        ctx.scale(scale, 1);
        ctx.drawImage(this.spritesheet,
            this.xStart + this.width*frame, this.yStart,
            this.width, this.height,
            scale * x, y,
            this.width, this.height);
        ctx.restore();
    };  

    currentFrame( ) {
        return Math.min(this.frameCount - 1, Math.floor(this.elapsedTime / this.frameDuration));
    };

    isDone() {
        return (this.elapsedTime >= this.totalTime);
    }

    reset() {
        this.elapsedTime = 0;
    }

    getCurrentTime() {
        return this.currentTime;
    }

}
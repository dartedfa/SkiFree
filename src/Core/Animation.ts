/**
 * Configuration for a single animation. Animations contain an array of images to play through. They can loop back
 * to the start when the full animation sequence has been played or they can not loop and just finish on the last image.
 * They can also have a callback set to fire when the animation sequence is complete.
 */
import { ANIMATION_FRAME_SPEED_MS, IMAGE_NAMES } from "../Constants";

export class Animation {
    /**
     * The sequence of images the animation cycles through
     */
    private readonly images: IMAGE_NAMES[];

    /**
     * Does the animation loop back to the beginning when complete?
     */
    private readonly looping: boolean;

    /**
     * The current frame of the current animation the rhino is on.
     */
    currentAnimationFrame: number = 0;

    /**
     * The time in ms of the last frame change. Used to provide a consistent framerate.
     */
    animationFrameTime: number = Date.now();

    /**
     * Function to call when the animation is complete
     */
    private readonly callback?: Function;

    /**
     * Function to be called when the current frame changes
     */
    private readonly getCurrentImage: Function;

    constructor(images: IMAGE_NAMES[], looping: boolean, getCurrentImage: Function,  callback?: Function) {
        this.images = images;
        this.looping = looping;
        this.callback = callback;
        this.getCurrentImage = getCurrentImage
    }

    animate(animationCalledTime: number) {
        if (animationCalledTime - this.animationFrameTime > ANIMATION_FRAME_SPEED_MS) {
            this.nextAnimationFrame(animationCalledTime);
        }
    }

    finishAnimation() {
        this.currentAnimationFrame = 0
        const animationCallback = this.getCallback();

        if (animationCallback) {
            animationCallback.apply(null);
        }
    }

    getImages(): IMAGE_NAMES[] {
        return this.images;
    }

    getLooping(): boolean {
        return this.looping;
    }

    getCallback(): Function | undefined {
        return this.callback;
    }

    nextAnimationFrame(animationCalledTime: number) {
        const animationImages = this.getImages();

        this.animationFrameTime = animationCalledTime;
        this.currentAnimationFrame++;
        if (this.currentAnimationFrame >= animationImages.length) {
            if (!this.getLooping()) {
                this.finishAnimation();
                return;
            }

            this.currentAnimationFrame = 0;
        }

        this.getCurrentImage(animationImages[this.currentAnimationFrame])
    }

    reset() {
        this.currentAnimationFrame = 0
    }
}

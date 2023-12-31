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
     * The current frame of an animation.
     */
    private currentAnimationFrame: number = 0;

    /**
     * The time in ms of the last frame change. Used to provide a consistent framerate.
     */
    private animationFrameTime: number = Date.now();

    /**
     * Function to call when the animation is complete
     */
    private readonly callback?: Function;

    /**
     * Function to be called when the frame changes, which returns image of animation.
     */
    private readonly getCurrentImage: Function;

    constructor(images: IMAGE_NAMES[], looping: boolean, getCurrentImage: Function,  callback?: Function) {
        this.images = images;
        this.looping = looping;
        this.callback = callback;
        this.getCurrentImage = getCurrentImage
    }

    /**
     * Function responsible for changing frame to the next frame if enough time has elapsed since the previous frame.
     * @param gameTime - The current game time in milliseconds.
     */
    animate(gameTime: number) {
        if (gameTime - this.animationFrameTime > ANIMATION_FRAME_SPEED_MS) {
            this.nextAnimationFrame(gameTime);
        }
    }

    /**
     * Fire callback and reset an animation.
     */
    finishAnimation() {
        const animationCallback = this.getCallback();
        this.reset()

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

    /**
     * @returns The callback function for animation completion, may be undefined.
     */
    getCallback(): Function | undefined {
        return this.callback;
    }

    /**
     * Increase the current animation frame and pass the current image to the `getCurrentImage` function.
     * If the animation isn't looping, then finish the animation instead.
     * @param gameTime - The current game time in milliseconds.
     */
    nextAnimationFrame(gameTime: number) {
        const animationImages = this.getImages();

        this.animationFrameTime = gameTime;
        if (this.currentAnimationFrame >= animationImages.length) {
            if (!this.getLooping()) {
                this.finishAnimation();
                return;
            }

            this.currentAnimationFrame = 0;
        }
        this.getCurrentImage(animationImages[this.currentAnimationFrame])
        this.currentAnimationFrame++;
    }

    /**
     * Reset current animation frame.
     */
    reset() {
        this.currentAnimationFrame = 0
    }
}

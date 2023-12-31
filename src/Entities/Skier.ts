/**
 * The skier is the entity controlled by the player in the game. The skier skis down the hill, can move at different
 * angles, and crashes into obstacles they run into. If caught by the rhino, the skier will get eaten and die.
 */

import { DIAGONAL_SPEED_REDUCER, IMAGE_NAMES, KEYS } from "../Constants";
import { Entity } from "./Entity";
import { Canvas } from "../Core/Canvas";
import { ImageManager } from "../Core/ImageManager";
import { intersectTwoRects, Rect } from "../Core/Utils";
import { ObstacleManager } from "./Obstacles/ObstacleManager";
import { Obstacle } from "./Obstacles/Obstacle";
import { Animation } from "../Core/Animation";

/**
 * The skier starts running at this speed. Saved in case speed needs to be reset at any point.
 */
const STARTING_SPEED: number = 10;

/**
 * The different states the skier can be in.
 */

export enum STATES {
    STATE_SKIING = "skiing",
    STATE_JUMPING = "jumping",
    STATE_CRASHED = "crashed",
    STATE_DEAD = "dead",
}

/**
 * The different directions the skier can be facing.
 */
export const DIRECTION_LEFT: number = 0;
export const DIRECTION_LEFT_DOWN: number = 1;
export const DIRECTION_DOWN: number = 2;
export const DIRECTION_RIGHT_DOWN: number = 3;
export const DIRECTION_RIGHT: number = 4;

/**
 * Mapping of the image to display for the skier based upon which direction they're facing.
 */
export const DIRECTION_IMAGES: { [key: number]: IMAGE_NAMES } = {
    [DIRECTION_LEFT]: IMAGE_NAMES.SKIER_LEFT,
    [DIRECTION_LEFT_DOWN]: IMAGE_NAMES.SKIER_LEFTDOWN,
    [DIRECTION_DOWN]: IMAGE_NAMES.SKIER_DOWN,
    [DIRECTION_RIGHT_DOWN]: IMAGE_NAMES.SKIER_RIGHTDOWN,
    [DIRECTION_RIGHT]: IMAGE_NAMES.SKIER_RIGHT,
};

/**
 * A sequence of images that comprises the animation for the skier.
 */
const IMAGES_JUMPING: IMAGE_NAMES[] = [
    IMAGE_NAMES.SKIER_JUMP1,
    IMAGE_NAMES.SKIER_JUMP2,
    IMAGE_NAMES.SKIER_JUMP3,
    IMAGE_NAMES.SKIER_JUMP4,
    IMAGE_NAMES.SKIER_JUMP5,
];

/**
 * The skier is the entity controlled by the player in the game.
 */
export class Skier extends Entity {
    /**
     * The name of the current image being displayed for the skier.
     */
    imageName: IMAGE_NAMES = IMAGE_NAMES.SKIER_DOWN;

    /**
     * What state the skier is currently in.
     */
    state: STATES = STATES.STATE_SKIING;

    /**
     * What direction the skier is currently facing.
     */
    direction: number = DIRECTION_DOWN;

    /**
     * How fast the skier is currently moving in the game world.
     */
    speed: number = STARTING_SPEED;

    /**
     * Stored reference to the ObstacleManager
     */
    obstacleManager: ObstacleManager;

    /**
     * The animation for the skier when jumping.
     * @private
     */
    private jumpAnimation = new Animation(IMAGES_JUMPING, false, this.setImageName.bind(this), this.land.bind(this))

    /**
     * Initializes the skier.
     */
    constructor(x: number, y: number, imageManager: ImageManager, obstacleManager: ObstacleManager, canvas: Canvas) {
        super(x, y, imageManager, canvas);

        this.obstacleManager = obstacleManager;
    }

    /**
     * Is the skier currently in the crashed state
     * @returns {boolean} True if the skier is crashed, false otherwise.
     */
    get isCrashed(): boolean {
        return this.state === STATES.STATE_CRASHED;
    }

    get isMoving(): boolean {
        return [STATES.STATE_SKIING, STATES.STATE_JUMPING].includes(this.state);
    }

    /**
     * Is the skier currently in the jumping state
     * @returns {boolean} True if the skier is jumping, false otherwise.
     */
    get isJumping(): boolean {
        return this.state === STATES.STATE_JUMPING;
    }

    /**
     * Is the skier currently in the dead state
     * @returns {boolean} True if the skier is dead, false otherwise.
     */
    get isDead(): boolean {
        return this.state === STATES.STATE_DEAD;
    }

    /**
     * Set the skier's image based upon the direction they're facing.
     * @param {IMAGE_NAMES} imageName - The name of the image to set for the skier.
     */
    setImageName(imageName: IMAGE_NAMES) {
        this.imageName = imageName
    }

    /**
     * Set the current direction the skier is facing and update the image accordingly.
     * @param {number} direction - The direction to set for the skier.
     */
    setDirection(direction: number) {
        this.direction = direction;
        this.setDirectionalImage();
    }

    /**
     * Set the skier's image based upon the direction they're facing.
     */
    setDirectionalImage() {
        this.imageName = DIRECTION_IMAGES[this.direction];
    }

    /**
     * Move the skier and check to see if they've hit an obstacle. The skier only moves in the skiing state.
     * @param {number} gameTime - The current game time in milliseconds.
     */
    update(gameTime: number) {
        if (this.isMoving) {
            this.move();
            this.checkIntersection();
            this.isJumping && this.jumpAnimation.animate(gameTime)
        }
    }

    /**
     * Draw the skier if they aren't dead
     */
    draw() {
        if (this.isDead) {
            return;
        }

        super.draw();
    }

    /**
     * Move the skier based upon the direction they're currently facing. This handles frame update movement.
     */
    move() {
        switch (this.direction) {
            case DIRECTION_LEFT_DOWN:
                this.moveSkierLeftDown();
                break;
            case DIRECTION_DOWN:
                this.moveSkierDown();
                break;
            case DIRECTION_RIGHT_DOWN:
                this.moveSkierRightDown();
                break;
            case DIRECTION_LEFT:
            case DIRECTION_RIGHT:
                // Specifically calling out that we don't move the skier each frame if they're facing completely horizontal.
                break;
        }
    }

    /**
     * Move the skier left. Since completely horizontal movement isn't frame based, just move incrementally based upon
     * the starting speed.
     */
    moveSkierLeft() {
        this.position.x -= STARTING_SPEED;
    }

    /**
     * Move the skier diagonally left in equal amounts down and to the left. Use the current speed, reduced by the scale
     * of a right triangle hypotenuse to ensure consistent traveling speed at an angle.
     */
    moveSkierLeftDown() {
        this.position.x -= this.speed / DIAGONAL_SPEED_REDUCER;
        this.position.y += this.speed / DIAGONAL_SPEED_REDUCER;
    }

    /**
     * Move the skier down at the speed they're traveling.
     */
    moveSkierDown() {
        this.position.y += this.speed;
    }

    /**
     * Move the skier diagonally right in equal amounts down and to the right. Use the current speed, reduced by the scale
     * of a right triangle hypotenuse to ensure consistent traveling speed at an angle.
     */
    moveSkierRightDown() {
        this.position.x += this.speed / DIAGONAL_SPEED_REDUCER;
        this.position.y += this.speed / DIAGONAL_SPEED_REDUCER;
    }

    /**
     * Move the skier right. Since completely horizontal movement isn't frame based, just move incrementally based upon
     * the starting speed.
     */
    moveSkierRight() {
        this.position.x += STARTING_SPEED;
    }

    /**
     * Move the skier up. Since moving up isn't frame based, just move incrementally based upon
     * the starting speed.
     */
    moveSkierUp() {
        this.position.y -= STARTING_SPEED;
    }

    /**
     * Avoid jumping if the skier is already jumping, standing, or crashed.
     * @returns {boolean} True if the skier can not jump, false otherwise.
     */
    canNotJump(): boolean {
        return this.isJumping || [DIRECTION_LEFT, DIRECTION_RIGHT].includes(this.direction)
            || this.isCrashed;
    }

    /**
     * Jump the skier at the speed they're traveling.
     */
    jump() {
        if (this.canNotJump()) {
            return
        }
        this.state = STATES.STATE_JUMPING;
    }

    /**
     * Land the skier with last direction.
     */
    land() {
        this.state = STATES.STATE_SKIING
        this.setDirectionalImage()
    }

    /**
     * Handle keyboard input. If the skier is dead or jumping, don't handle any input.
     * @param {string} inputKey - The input key to handle.
     * @returns {boolean} True if the input was handled, false otherwise.
     */
    handleInput(inputKey: string): boolean {
        if (this.isDead || this.isJumping) {
            return false;
        }

        let handled: boolean = true;

        switch (inputKey) {
            case KEYS.LEFT:
                this.turnLeft();
                break;
            case KEYS.RIGHT:
                this.turnRight();
                break;
            case KEYS.UP:
                this.turnUp();
                break;
            case KEYS.DOWN:
                this.turnDown();
                break;
            case KEYS.SPACEBAR:
                this.jump()
                break;
            default:
                handled = false;
        }

        return handled;
    }

    /**
     * Turn the skier left. If they're already completely facing left, move them left. Otherwise, change their direction
     * one step left. If they're in the crashed state, then first recover them from the crash.
     */
    turnLeft() {
        if (this.isCrashed) {
            this.recoverFromCrash(DIRECTION_LEFT);
        }

        if (this.direction === DIRECTION_LEFT) {
            this.moveSkierLeft();
        } else {
            this.setDirection(this.direction - 1);
        }
    }

    /**
     * Turn the skier right. If they're already completely facing right, move them right. Otherwise, change their direction
     * one step right. If they're in the crashed state, then first recover them from the crash.
     */
    turnRight() {
        if (this.isCrashed) {
            this.recoverFromCrash(DIRECTION_RIGHT);
        }

        if (this.direction === DIRECTION_RIGHT) {
            this.moveSkierRight();
        } else {
            this.setDirection(this.direction + 1);
        }
    }

    /**
     * Turn the skier up which basically means if they're facing left or right, then move them up a bit in the game world.
     * If they're in the crashed state, do nothing as you can't move up if you're crashed.
     */
    turnUp() {
        if (this.isCrashed) {
            return;
        }

        if (this.direction === DIRECTION_LEFT || this.direction === DIRECTION_RIGHT) {
            this.moveSkierUp();
        }
    }

    /**
     * Turn the skier to face straight down. If they're crashed don't do anything to require them to move left or right
     * to escape an obstacle before skiing down again.
     */
    turnDown() {
        if (this.isCrashed) {
            return;
        }

        this.setDirection(DIRECTION_DOWN);
    }

    /**
     * The skier has a bit different bounds calculating than a normal entity to make the collision with obstacles more
     * natural. We want te skier to end up in the obstacle rather than right above it when crashed, so move the bottom
     * boundary up.
     */
    getBounds(): Rect | null {
        const image = this.imageManager.getImage(this.imageName);
        if (!image) {
            return null;
        }

        return new Rect(
            this.position.x - image.width / 2,
            this.position.y - image.height / 2,
            this.position.x + image.width / 2,
            this.position.y - image.height / 4
        );
    }

    /**
     * Define the action to take when the skier intersects with an obstacle.
     * @param {Obstacle} obstacle - The obstacle the skier intersects with.
     */
    intersectionAction(obstacle: Obstacle) {
        const obstacleName = obstacle.imageName
        switch (obstacleName) {
            case IMAGE_NAMES.JUMP_RAMP:
                this.jump()
                break;
            case IMAGE_NAMES.ROCK1:
            case IMAGE_NAMES.ROCK2:
                !this.isJumping && this.crash()
                break
            default:
                this.crash()
        }
    }

    /**
     * Go through all the obstacles and call intersectionAction with each intersected obstacle.
     */
    checkIntersection() {
        const skierBounds = this.getBounds();
        if (!skierBounds) {
            return;
        }

        const intersectedObstacle = this.obstacleManager.getObstacles().find((obstacle: Obstacle): boolean => {
            const obstacleBounds = obstacle.getBounds();
            if (!obstacleBounds) {
                return false;
            }

            return intersectTwoRects(skierBounds, obstacleBounds);
        });

        if (intersectedObstacle) {
            this.intersectionAction(intersectedObstacle)
        }
    }

    /**
     * Crash the skier. Set the state to crashed, set the speed to zero cause you can't move when crashed and update the
     * image.
     */
    crash() {
        this.isJumping && this.jumpAnimation.reset()
        this.state = STATES.STATE_CRASHED;
        this.speed = 0;
        this.imageName = IMAGE_NAMES.SKIER_CRASH;
    }

    /**
     * Change the skier back to the skiing state, get them moving again at the starting speed and set them facing
     * whichever direction they're recovering to.
     */
    recoverFromCrash(newDirection: number) {
        this.state = STATES.STATE_SKIING;
        this.speed = STARTING_SPEED;
        this.setDirection(newDirection);
    }

    /**
     * Kill the skier by putting them into the "dead" state and stopping their movement.
     */
    die() {
        this.state = STATES.STATE_DEAD;
        this.speed = 0;
    }
}

import { Canvas } from "../../Core/Canvas";
import { ImageManager } from "../../Core/ImageManager";
import { ObstacleManager } from "../Obstacles/ObstacleManager";
import {
    DIRECTION_DOWN,
    DIRECTION_IMAGES,
    DIRECTION_LEFT,
    DIRECTION_LEFT_DOWN,
    DIRECTION_RIGHT,
    DIRECTION_RIGHT_DOWN,
    Skier,
    STATES,
} from "../Skier";
import { KEYS } from "../../Constants";

jest.mock("../../Constants");
jest.mock("../Entity");
jest.mock("../../Core/Canvas");
jest.mock("../../Core/ImageManager");
jest.mock("../../Core/Utils");
jest.mock("./../Obstacles/ObstacleManager");
jest.mock("./../Obstacles/Obstacle");
jest.mock("../../Core/Animation");

describe("Skier", () => {
    let skier: Skier;

    beforeEach(() => {
        const imageManager = new ImageManager();
        const canvas = new Canvas("test-id", 100, 100);
        const obstacleManager = new ObstacleManager(imageManager, canvas);
        skier = new Skier(0, 0, imageManager, obstacleManager, canvas);
    });


    describe("directions", () => {
        describe("leftKey", () => {
            test("calling handleInput with leftKey should move skier to left side", () => {
                skier.handleInput(KEYS.LEFT)
                expect(skier.direction).toBe(DIRECTION_LEFT_DOWN);
                expect(skier.imageName).toBe(DIRECTION_IMAGES[DIRECTION_LEFT_DOWN]);
            });

            test("calling handleInput with leftKey twice should let skier to stand on left side", () => {
                skier.handleInput(KEYS.LEFT)
                skier.handleInput(KEYS.LEFT)
                expect(skier.direction).toBe(DIRECTION_LEFT);
                expect(skier.imageName).toBe(DIRECTION_IMAGES[DIRECTION_LEFT]);
            });
        })
        describe("rightKey", () => {
            test("calling handleInput with rightKey should move skier to right side", () => {
                skier.handleInput(KEYS.RIGHT)
                expect(skier.direction).toBe(DIRECTION_RIGHT_DOWN);
                expect(skier.imageName).toBe(DIRECTION_IMAGES[DIRECTION_RIGHT_DOWN]);
            });

            test("calling handleInput with rightKey twice should let skier to stand on right side", () => {
                skier.handleInput(KEYS.RIGHT)
                skier.handleInput(KEYS.RIGHT)
                expect(skier.direction).toBe(DIRECTION_RIGHT);
                expect(skier.imageName).toBe(DIRECTION_IMAGES[DIRECTION_RIGHT]);
            });
        })

        describe("Jumping state", () => {
            beforeEach(() => {
                skier.direction = DIRECTION_DOWN
                skier.state = STATES.STATE_JUMPING
            })
            test("Should ignore leftKey when skier is jumping", () => {
                skier.handleInput(KEYS.LEFT)
                expect(skier.direction).toBe(DIRECTION_DOWN);
                expect(skier.imageName).toBe(DIRECTION_IMAGES[DIRECTION_DOWN]);
            })
            test("Should ignore rightKey when skier is jumping", () => {
                skier.handleInput(KEYS.RIGHT)
                expect(skier.direction).toBe(DIRECTION_DOWN);
                expect(skier.imageName).toBe(DIRECTION_IMAGES[DIRECTION_DOWN]);
            })
            test("Should ignore upKey when skier is jumping", () => {
                skier.handleInput(KEYS.UP)
                expect(skier.direction).toBe(DIRECTION_DOWN);
                expect(skier.imageName).toBe(DIRECTION_IMAGES[DIRECTION_DOWN]);
            })
            test("Should avoid calling jump when skier is already in jumping state", () => {
                jest.spyOn(skier, "jump")
                skier.handleInput(KEYS.SPACEBAR)
                expect(skier.jump).not.toBeCalled()
            })
            test("Should not recover from crashed state when jumping in crashed state.", () => {
                skier.state = STATES.STATE_CRASHED
                skier.handleInput(KEYS.SPACEBAR)
                expect(skier.state).toBe(STATES.STATE_CRASHED)
            })
        })
    });
});
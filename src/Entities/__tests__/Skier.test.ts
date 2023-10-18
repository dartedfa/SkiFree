import { Canvas } from "../../Core/Canvas";
import { ImageManager } from "../../Core/ImageManager";
import { ObstacleManager } from "../Obstacles/ObstacleManager";
import {
    Skier,
    DIRECTION_IMAGES,
    DIRECTION_DOWN,
    DIRECTION_RIGHT,
    DIRECTION_LEFT_DOWN,
    DIRECTION_LEFT,
    DIRECTION_RIGHT_DOWN,
} from "../Skier";

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
        test("turnLeft", () => {
            skier.turnLeft();
            expect(skier.direction).toBe(DIRECTION_LEFT);
            expect(skier.imageName).toBe(DIRECTION_IMAGES[DIRECTION_LEFT]);
        });

        it.only("should have a method isSkiing()", () => {
            expect(skier.isSkiing()).toBeTruthy();
        });
    });
});
import { Animation } from "../Animation";
import { IMAGE_NAMES } from "../../Constants";

const frameRate = 300

describe('Animation', () => {
    test('getter and callback functions.', () => {
        const getter = jest.fn()
        const callback = jest.fn()
        const animation = new Animation([IMAGE_NAMES.SKIER_DOWN, IMAGE_NAMES.SKIER_LEFT], false, getter, callback)
        animation.animate(Date.now() + frameRate)
        animation.animate(Date.now() + 2 * frameRate)
        animation.animate(Date.now() + 3 * frameRate)

        expect(getter).toHaveBeenCalledTimes(2)
        expect(getter).toHaveBeenCalledWith(IMAGE_NAMES.SKIER_DOWN)
        expect(getter).toHaveBeenCalledWith(IMAGE_NAMES.SKIER_LEFT)
        expect(callback).toBeCalled()
    })
})
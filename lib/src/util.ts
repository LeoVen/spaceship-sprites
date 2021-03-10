import { Color } from '.'

/**
 * Returns a number whose value is limited to the given range.
 *
 * Example:
 * clamp(x * 255, 0, 255)
 *
 * @param {Number} value The value to be limited
 * @param {Number} min The lower boundary of the output range
 * @param {Number} max The upper boundary of the output range
 * @returns A number in the range [min, max]
 */
function clamp(value: number, min: number, max: number) {
    return Math.min(Math.max(value, min), max)
}

const transformFade = (
    dim: [number, number],
    x: number,
    y: number,
    pixel: Color
): Color => {
    let yR = y / dim[1]

    return pixel.mixWeighed(new Color(0, 0, 0), yR)
}

const transformVignette = (
    dim: [number, number],
    x: number,
    y: number,
    pixel: Color
): Color => {
    let cx = dim[0] / 2
    let cy = dim[1] / 2

    // Calculate distance to the center (cx, cy)
    // The + 0.5 is to calculate relative to the pixel's center, not its origin
    let dist = Math.sqrt(
        Math.pow(cx - (x + 0.5), 2) + Math.pow(cy - (y + 0.5), 2)
    )

    let w = clamp((dist / Math.max(dim[0], dim[1])) * 2, 0, 1)

    return pixel.mixWeighed(new Color(0, 0, 0), w)
}

class Utils {
    static clamp = clamp
    static transformFade = transformFade
    static transformVignette = transformVignette
}

export default Utils

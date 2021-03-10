import { Color } from '.'
import { Border, Dimension } from './constants'
import Sprite from './sprite'
import Validator from './validator'

interface SpriteBuilderOptions {
    /**
     * The width and Height of the sprite.
     */
    spriteDimensions?: [number, number]
    /**
     * The percentage of blank spaces.
     */
    blankPercentage?: number
    /**
     * A pre-defined color pallet.
     */
    colorPallet?: Array<Color>
    /**
     * Uses a random pallet each sprite.
     */
    useRandomPallet?: boolean
    /**
     * If using random pallet, amount of random colors at each sprite.
     */
    randomColorCount?: number
    /**
     * If using random pallet, if the alpha value should also be random (default is always 100% opaque).
     */
    randomAlpha?: boolean
    /**
     * The dimensions for each border [up, right, down, left].
     */
    border?: [number, number, number, number] | number
    /**
     * If sprites are also symmetric horizontally. Vertical symmetry is on by default.
     */
    horizontalSymmetry?: boolean
    /**
     * The color used in spots 'without' pixels. May also be used as a background color.
     */
    blankColor?: Color
}

// Builds sprites with preset values
class SpriteBuilder {
    /**
     * The width and Height of the sprite.
     */
    private spriteDimensions: [number, number]
    /**
     * The percentage of blank spaces.
     */
    private blankPercentage: number
    /**
     * A pre-defined color pallet.
     */
    private colorPallet: Array<Color>
    /**
     * Uses a random pallet each sprite.
     */
    private useRandomPallet: boolean
    /**
     * If using random pallet, amount of random colors at each sprite.
     */
    private randomColorCount: number
    /**
     * If using random pallet, if the alpha value should also be random (default is always 100% opaque).
     */
    private randomAlpha: boolean
    /**
     * The dimensions for each border [up, right, down, left].
     */
    private border: [number, number, number, number]
    /**
     * If sprites are also symmetric horizontally. Vertical symmetry is on by default.
     */
    private horizontalSymmetry: boolean
    /**
     * The color used in spots 'without' pixels. May also be used as a background color.
     */
    private blankColor: Color

    private result?: Sprite

    constructor({
        spriteDimensions = [7, 7],
        blankPercentage = 0.5,
        colorPallet = [Color.random(), Color.random(), Color.random()],
        useRandomPallet = false,
        randomColorCount = 3,
        randomAlpha = false,
        border = 1,
        horizontalSymmetry = false,
        blankColor = Color.WHITE
    }: SpriteBuilderOptions) {
        this.spriteDimensions = spriteDimensions
        this.blankPercentage = blankPercentage
        this.colorPallet = colorPallet
        this.useRandomPallet = useRandomPallet
        this.randomColorCount = randomColorCount
        this.randomAlpha = randomAlpha
        this.border =
            typeof border === 'number'
                ? [border, border, border, border]
                : border
        this.horizontalSymmetry = horizontalSymmetry
        this.blankColor = blankColor
        this.validate()
    }

    /**
     * Builds a single sprite with the builder's configuration.
     */
    public single(): SpriteBuilder {
        let result = new Sprite({
            dim: this.spriteDimensions,
            colorFill: this.blankColor
        })

        const realPallet = this.addBlanks(this.getPallet())

        let i = 1
        let m = 1
        let queue: Array<Color> = []

        if (this.horizontalSymmetry) {
            m = 2
        }

        // TODO add horizontal symmetry
        for (let y = 0; y < Math.ceil(result.dim[Dimension.Height] / m); y++) {
            i *= -1
            let element = 0
            for (let x = 0; x < result.dim[Dimension.Width]; x++) {
                const selectedColor = this.selectColor(realPallet)

                if (element === Math.floor(result.dim[Dimension.Width] / 2)) {
                    result.setPixelAt(x, y, selectedColor)
                } else if (queue.length == element + 1) {
                    let color = queue.pop()
                    if (color !== undefined) {
                        result.setPixelAt(x, y, color)
                    } else {
                        throw new Error(
                            'Algorithm error. Expected an element when "queue.pop()" but got none.'
                        )
                    }
                } else {
                    queue.push(selectedColor)
                    result.setPixelAt(x, y, selectedColor)
                }

                if (
                    element === Math.floor(result.dim[Dimension.Width] / 2) ||
                    element === 0
                ) {
                    i *= -1
                }

                element += i
            }
        }

        this.result = result

        return this
    }

    /**
     * Changes the builder sprite dimension. Can only be called when there is no sprite being built.
     *
     * @param dim New sprite dimension
     */
    public withDim(dim: [number, number]): SpriteBuilder {
        if (this.result !== undefined) {
            throw new Error(
                "Can't change the dimension after having a sprite already built."
            )
        }

        this.spriteDimensions = dim
        this.validate()

        return this
    }

    /**
     * Adds a border around the sprite. The default color is the blankColor.
     *
     * @param {[number, number, number, number]} borders Amount of pixels at each corner. See the enum Border.
     * @param {Color} borderColor The color for the new border. Defaults to blankColor
     */
    public withBorder(
        borders: [number, number, number, number] = this.border,
        borderColor: Color = this.blankColor
    ): SpriteBuilder {
        if (this.result === undefined) {
            throw new Error('No sprite is set on builder.')
        }

        let result = new Sprite({
            dim: [
                this.result.dim[Dimension.Width] +
                    borders[Border.Left] +
                    borders[Border.Right],
                this.result.dim[Dimension.Height] +
                    borders[Border.Up] +
                    borders[Border.Down]
            ],
            colorFill: borderColor
        })

        for (
            let x = borders[Border.Left], i = 0;
            i < this.result.dim[Dimension.Width];
            x++, i++
        ) {
            for (
                let y = borders[Border.Up], j = 0;
                j < this.result.dim[Dimension.Height];
                y++, j++
            ) {
                result.setPixelAt(x, y, this.result.pixelAt(i, j))
            }
        }

        this.result = result

        return this
    }

    /**
     * To do edges, simply iterate from one side to another and mark the first
     * pixel found that is not equal to the background color. Then, apply edges
     * by adding another pixel before the new found one by mixing edgeColor with
     * the pixel found.
     *
     * @param {Color} edgeColor The edge color.
     * @param {Number} edgeWeight The weight for the edge when mixing with the adjacend pixel.
     * @param {boolean} addExtraBorder Adds 1 pixel border to fit the new edges. True by default.
     */
    public withEdges(
        edgeColor: Color = Color.BLACK,
        edgeWeight: number = 0.7,
        addExtraBorder: boolean = true
    ): SpriteBuilder {
        if (this.result === undefined) {
            throw new Error('No sprite is set on builder.')
        }

        // Might be needed to fit the new edge pixels
        if (addExtraBorder) {
            this.withBorder([1, 1, 1, 1])
        }

        // Top to bottom
        // TODO add horizontalSymmetry
        for (let x = 0; x < this.result.dim[Dimension.Width]; x++) {
            for (let y = 0; y < this.result.dim[Dimension.Height]; y++) {
                let pixel = this.result.pixelAt(x, y)

                if (pixel.equals(edgeColor)) break

                if (!pixel.equals(this.blankColor)) {
                    this.result.setPixelAtChecked(
                        x,
                        y - 1,
                        pixel.mixWeighed(edgeColor, edgeWeight)
                    )
                    break
                }
            }
        }

        // Right to left
        for (let y = 0; y < this.result.dim[Dimension.Height]; y++) {
            for (let x = 0; x < this.result.dim[Dimension.Width]; x++) {
                let pixel = this.result.pixelAt(x, y)

                if (pixel.equals(edgeColor)) break

                if (!pixel.equals(this.blankColor)) {
                    this.result.setPixelAtChecked(
                        x - 1,
                        y,
                        pixel.mixWeighed(edgeColor, edgeWeight)
                    )
                    // TODO In the future, check if the sprite is vertically symmetric
                    this.result.setPixelAtChecked(
                        this.result.dim[Dimension.Width] - x,
                        y,
                        pixel.mixWeighed(edgeColor, edgeWeight)
                    )
                    break
                }
            }
        }

        // Down to up
        for (let x = 0; x < this.result.dim[Dimension.Width]; x++) {
            for (let y = this.result.dim[Dimension.Height] - 1; y > 0; y--) {
                let pixel = this.result.pixelAt(x, y)

                if (pixel.equals(edgeColor)) break

                if (!pixel.equals(this.blankColor)) {
                    this.result.setPixelAtChecked(
                        x,
                        y + 1,
                        pixel.mixWeighed(edgeColor, edgeWeight)
                    )
                    break
                }
            }
        }

        return this
    }

    /**
     * Applies a function to each pixel. In this function you have dim as the
     * sprite's dimension and x and y of the pixel parameter.
     *
     * Example of a Function:
     * ```
     * const transformVignette = (dim: [number, number], x: number, y: number, pixel: Color): Color => {
     *      let cx = dim[0] / 2
     *      let cy = dim[1] / 2
     *      // Calculate distance to the center (cx, cy)
     *      // The + 0.5 is to calculate relative to the pixel's center, not its origin
     *      let dist = Math.sqrt(Math.pow(cx - (x + 0.5), 2) + Math.pow(cy - (y + 0.5), 2))
     *      let w = SpriteUtils.clamp((dist / Math.max(dim[0], dim[1])) * 2, 0, 1) // utils.ts
     *      return pixel.mixWeighed(new Color(0, 0, 0), w)
     *  }
     * ```
     *
     * @param {(dim: [number, number], x: number, y: number, pixel: Color) => Color} func The function to apply at each pixel.
     */
    public transform(
        func: (
            dim: [number, number],
            x: number,
            y: number,
            pixel: Color
        ) => Color
    ): SpriteBuilder {
        if (this.result === undefined) {
            throw new Error('No sprite is set on builder.')
        }

        for (let x = 0; x < this.result.dim[0]; x++) {
            for (let y = 0; y < this.result.dim[1]; y++) {
                let pixel = this.result.pixelAt(x, y)
                this.result.setPixelAt(x, y, func(this.result.dim, x, y, pixel))
            }
        }

        return this
    }

    /**
     * Adds border until sprite gets to be of the desired dimension.
     *
     * Fails if the sprite is not built yet or if the sprite dimension is less
     * than the desired dimension.
     *
     * @param {[number, number]} dim The desired dimension.
     * @param {Color} paddingColor The color to be used for padding.
     */
    public withPadding(
        dim: [number, number],
        paddingColor: Color = this.blankColor
    ): SpriteBuilder {
        if (this.result === undefined) {
            throw new Error('No sprite is set on builder.')
        }

        if (dim[0] < this.result.dim[0]) {
            throw new Error(
                `Cannot set padding because ${dim[0]} is less than the existing width of ${this.result.dim[0]}`
            )
        }
        if (dim[1] < this.result.dim[1]) {
            throw new Error(
                `Cannot set padding because ${dim[1]} is less than the existing height of ${this.result.dim[1]}`
            )
        }

        let old: Sprite = this.result
        this.result = new Sprite({ dim: dim, colorFill: paddingColor })

        let leftOffset = Math.floor((dim[0] - old.dim[0]) / 2)
        let topOffset = Math.floor((dim[1] - old.dim[1]) / 2)

        for (let x = leftOffset, i = 0; i < old.dim[0]; x++, i++) {
            for (let y = topOffset, j = 0; j < old.dim[1]; y++, j++) {
                this.result.setPixelAt(x, y, old.pixelAt(i, j))
            }
        }

        return this
    }

    /**
     * Builds a sprite and resets the builder sprite to undefined.
     *
     * Fails if no valid sprite is built.
     *
     * @returns The generated sprite.
     */
    public build(): Sprite {
        // TODO maybe add " || !this.result.isValid()" ??
        if (this.result === undefined) {
            throw new Error('Resulting sprite is not valid.')
        }

        let result = this.result
        this.result = undefined
        return result
    }

    // Gets either a random pallet or the builder's one
    public getPallet(): Array<Color> {
        if (this.useRandomPallet)
            return SpriteBuilder.randomPallet(
                this.randomColorCount,
                this.randomAlpha
            )
        else return this.colorPallet
    }

    // Selects a color from the builder pallet or a random one, assuming that the blanks have already been added
    public selectColor(pallet: Array<Color>): Color {
        return pallet[SpriteBuilder.randInt(0, pallet.length - 1)]
    }

    // Adds blank colors to the pallet so that the ratio of them is close to the builder's blankPercentage
    public addBlanks(pallet: Array<Color>): Array<Color> {
        const blanksToInsert = Math.round(
            (pallet.length * this.blankPercentage) / (1 - this.blankPercentage)
        )
        return [...pallet].concat(
            ...new Array(blanksToInsert)
                .fill(null)
                .map(() => this.blankColor.copy())
        )
    }

    public static randInt(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min + 1)) + min
    }

    public static randomPallet(
        colorCount: number,
        randomAlpha: boolean
    ): Array<Color> {
        Validator.positive(colorCount, 'colorCount')

        return Array.from({ length: colorCount }, () =>
            Color.random(randomAlpha)
        )
    }

    private validate(): void {
        Validator.positive(this.spriteDimensions[0], 'this.spriteDimensions[0]')
        Validator.positive(this.spriteDimensions[1], 'this.spriteDimensions[1]')

        Validator.percentage(this.blankPercentage, 'blankPercentage')

        for (let i = 0; i < this.border.length; i++) {
            Validator.positiveInteger(this.border[i], `border[${i}]`)
        }
    }
}

export default SpriteBuilder

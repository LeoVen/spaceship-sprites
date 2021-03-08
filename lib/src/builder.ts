import { Color } from '.'
import Sprite from './sprite'
import Validator from './validator'

interface SpriteBuilderOptions {
    // The Width and Height of the sprite.
    spriteDimensions?: [number, number]
    // The percentage of blank spaces.
    blankPercentage?: number
    // A pre-defined color pallet.
    colorPallet?: Array<Color>
    // Uses a random pallet each iteration.
    useRandomPallet?: boolean
    // If using random pallet, amount of colors.
    randomColorCount?: number
    // If using random pallet, if the alpha value should also be random (default is 1).
    randomAlpha?: boolean
    // The dimensions for each border [up, right, down, left].
    border?: [number, number, number, number] | number
    // If sprites are also symmetric horizontally. Vertical symmetry is on by default.
    horizontalSymmetry?: boolean
    // The color used in spots 'without' pixels
    blankColor?: Color
}

// Builds sprites with preset values
class SpriteBuilder {
    // The width and Height of the sprite.
    private spriteDimensions: [number, number]
    // The percentage of blank spaces.
    private blankPercentage: number
    // A pre-defined color pallet.
    private colorPallet: Array<Color>
    // Uses a random pallet each iteration.
    private useRandomPallet: boolean
    // If using random pallet, amount of random colors at each iteration.
    private randomColorCount: number
    // If using random pallet, if the alpha value should also be random (default is 1).
    private randomAlpha: boolean
    // The dimensions for each border [up, right, down, left].
    private border: [number, number, number, number]
    // If sprites are also symmetric horizontally. Vertical symmetry is on by default.
    private horizontalSymmetry: boolean
    // The color used in spots 'without' pixels
    private blankColor: Color

    private result?: Sprite

    constructor(
        {
            spriteDimensions = [7, 7],
            blankPercentage = 0.5,
            colorPallet = [
                Color.random(),
                Color.random(),
                Color.random(),
            ],
            useRandomPallet = false,
            randomColorCount = 3,
            randomAlpha = false,
            border = 1,
            horizontalSymmetry = false,
            blankColor = Color.WHITE
        }: SpriteBuilderOptions
    ) {
        this.spriteDimensions = spriteDimensions
        this.blankPercentage = blankPercentage
        this.colorPallet = colorPallet
        this.useRandomPallet = useRandomPallet
        this.randomColorCount = randomColorCount
        this.randomAlpha = randomAlpha
        this.border = typeof border === 'number' ? [border, border, border, border] : border
        this.horizontalSymmetry = horizontalSymmetry
        this.blankColor = blankColor
        this.validate()
    }

    public single(): SpriteBuilder {
        let result = new Sprite({dim: this.spriteDimensions, colorFill: this.blankColor})

        const realPallet = this.addBlanks(this.getPallet())

        let i = 1
        let m = 1
        let queue: Array<Color> = []

        if (this.horizontalSymmetry) {
            m = 2
        }

        // TODO add horizontal symmetry
        for (let y = 0; y < Math.ceil(result.dim[1] / m); y++) {
            i *= -1
            let element = 0
            for (let x = 0; x < result.dim[0]; x++) {
                const selectedColor = this.selectColor(realPallet)

                if (element === Math.floor(result.dim[0] / 2)) {
                    result.setPixelAt(x, y, selectedColor)
                } else if (queue.length == element + 1) {
                    let color = queue.pop()
                    if (color !== undefined) {
                        result.setPixelAt(x, y, color)
                    } else {
                        throw new Error('Algorithm error. Expected an element when "queue.pop()" but got none.')
                    }
                } else {
                    queue.push(selectedColor)
                    result.setPixelAt(x, y, selectedColor)
                }

                if (element === Math.floor(result.dim[0] / 2) || element === 0) {
                    i *= -1
                }

                element += i
            }
        }

        this.result = result

        return this
    }

    public withDim(dim: [number, number]): SpriteBuilder {
        if (this.result !== undefined) {
            throw new Error('Can\'t change the dimension after having a sprite already built.')
        }

        this.spriteDimensions = dim
        this.validate()

        return this
    }

    public withBorder(borderColor: Color = this.blankColor): SpriteBuilder {
        if (this.result === undefined) {
            throw new Error('No sprite is set on builder.')
        }

        let result = new Sprite({dim: [this.spriteWidth, this.spriteHeight], colorFill: borderColor})

        for (let x = this.borderLeft, i = 0; i < this.result.dim[0]; x++, i++) {
            for (let y = this.borderUp, j = 0; j < this.result.dim[1]; y++, j++) {
                result.setPixelAt(x, y, this.result.pixelAt(i, j))
            }
        }

        this.result = result

        return this
    }

    // Adds padding until sprite gets to be of dimensions dim
    public withPadding(dim: [number, number], paddingColor: Color = this.blankColor): SpriteBuilder {
        if (this.result === undefined) {
            throw new Error('No sprite is set on builder.')
        }

        if (dim[0] < this.result.dim[0]) {
            throw new Error(`Cannot set padding because ${dim[0]} is less than the existing width of ${this.result.dim[0]}`)
        }
        if (dim[1] < this.result.dim[1]) {
            throw new Error(`Cannot set padding because ${dim[1]} is less than the existing height of ${this.result.dim[1]}`)
        }

        let old: Sprite = this.result;
        this.result = new Sprite({dim: dim, colorFill: paddingColor})

        let leftOffset = Math.floor((dim[0] - old.dim[0]) / 2)
        let topOffset = Math.floor((dim[1] - old.dim[1]) / 2)

        for (let x = leftOffset, i = 0; i < old.dim[0]; x++, i++) {
            for (let y = topOffset, j = 0; j < old.dim[1]; y++, j++) {
                this.result.setPixelAt(x, y, old.pixelAt(i, j))
            }
        }

        return this
    }

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
            return SpriteBuilder.randomPallet(this.randomColorCount, this.randomAlpha)
        else
            return this.colorPallet
    }

    // Selects a color from the builder pallet or a random one, assuming that the blanks have already been added
    public selectColor(pallet: Array<Color>): Color {
        return pallet[SpriteBuilder.randInt(0, pallet.length - 1)]
    }

    // Adds blank colors to the pallet so that the ratio of them is close to the builder's blankPercentage
    public addBlanks(pallet: Array<Color>): Array<Color> {
        const blanksToInsert = Math.round((pallet.length * this.blankPercentage) / (1 - this.blankPercentage))
        return [...pallet].concat(...new Array(blanksToInsert).fill(null).map(() => this.blankColor.copy()))
    }

    // Sprite width including borders
    public get spriteWidth(): number {
        return this.spriteDimensions[0] + this.borderLeft + this.borderRight
    }

    // Sprite height including borders
    public get spriteHeight(): number {
        return this.spriteDimensions[1] + this.borderUp + this.borderDown
    }

    public get borderUp(): number {
        return this.border[0]
    }

    public get borderRight(): number {
        return this.border[1]
    }

    public get borderDown(): number {
        return this.border[2]
    }

    public get borderLeft(): number {
        return this.border[3]
    }

    public static randInt(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    public static randomPallet(colorCount: number, randomAlpha: boolean): Array<Color> {
        Validator.positive(colorCount, 'colorCount')

        return Array.from({ length: colorCount }, () => Color.random(randomAlpha))
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

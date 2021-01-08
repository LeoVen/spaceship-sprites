import { Color } from '.'
import Sprite from './sprite'
import Validator from './validator'

interface SpriteBuilderParams {
    // The width and Height of the sprite.
    spriteDimensions?: [number, number]
    // The percentage of blank spaces.
    blankPercentage?: number
    // A pre-defined color pallet.
    colorPallet?: Array<Color>
    // Uses a random pallet each iteration.
    useRandomPallet?: boolean
    // If using random pallet, amount of colors.
    colorCount?: number
    // The dimensions for each border [up, right, down, left].
    border?: [number, number, number, number] | number
    // If sprites are also symmetric horizontally. Vertical symmetry is on by default.
    horizontalSymmetry?: boolean
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
    // If using random pallet, amount of colors.
    private colorCount: number
    // The dimensions for each border [up, right, down, left].
    private border: [number, number, number, number]
    // If sprites are also symmetric horizontally. Vertical symmetry is on by default.
    private horizontalSymmetry: boolean

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
            useRandomPallet = true,
            colorCount = 3,
            border = 1,
            horizontalSymmetry = false,
        }: SpriteBuilderParams
    ) {
        this.spriteDimensions = spriteDimensions
        this.blankPercentage = blankPercentage
        this.colorPallet = colorPallet
        this.useRandomPallet = useRandomPallet
        this.colorCount = colorCount
        this.border = typeof border === "number" ? [border, border, border, border] : border
        this.horizontalSymmetry = horizontalSymmetry
        this.validate()
    }

    public single(): SpriteBuilder {
        // TODO check for random pallet and count and other newer parameters
        let result = new Sprite({dim: this.spriteDimensions})

        // Assume that the pallet is trimmed
        const blanksToInsert = Math.round((this.colorPallet.length * this.blankPercentage) / (1 - this.blankPercentage))
        const realPallet = [...this.colorPallet].concat(...new Array(blanksToInsert).fill(null).map(() => Color.BLACK.copy()))

        let i = 1
        let queue: Array<Color> = []

        // TODO add horizontal symmetry
        for (let y = 0; y < result.dim[1]; y++) {
            i *= -1
            let element = 0
            for (let x = 0; x < result.dim[0]; x++) {
                const r = SpriteBuilder.randInt(0, realPallet.length - 1)
                const selectedColor = realPallet[r]

                if (element === Math.floor(result.dim[0] / 2)) {
                    result.setPixelAt(x, y, selectedColor)
                } else if (queue.length == element + 1) {
                    let color = queue.pop()
                    if (color !== undefined) {
                        result.setPixelAt(x, y, color)
                    } else {
                        throw new Error("Algorithm error. Expected an element when 'queue.pop()' but got none.")
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

    public withBorder(): SpriteBuilder {
        if (this.result === undefined) {
            throw new Error("No sprite is set on builder.")
        }

        let result = new Sprite({dim: [this.spriteWidth, this.spriteHeight]})

        for (let x = this.borderLeft, i = 0; i < this.result.dim[0]; x++, i++) {
            for (let y = this.borderUp, j = 0; j < this.result.dim[1]; y++, j++) {
                result.setPixelAt(x, y, this.result.pixelAt(i, j))
            }
        }

        this.result = result

        return this
    }

    public build(): Sprite {
        // TODO maybe add " || !this.result.isValid()" ??
        if (this.result === undefined) {
            throw new Error("Resulting sprite is not valid.")
        }

        let result = this.result
        this.result = undefined
        return result
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

    private static randInt(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    private validate(): void {
        Validator.percentage(this.blankPercentage, "blankPercentage")
        for (let i = 0; i < this.border.length; i++) {
            Validator.positiveInteger(this.border[i], `border[${i}]`)
        }
    }
}

export default SpriteBuilder

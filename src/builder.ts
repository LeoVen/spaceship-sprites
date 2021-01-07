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
    border?: [number, number, number, number]
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
            border = [1, 1, 1, 1],
            horizontalSymmetry = false,
        }: SpriteBuilderParams
    ) {
        this.spriteDimensions = spriteDimensions
        this.blankPercentage = blankPercentage
        this.colorPallet = colorPallet
        this.useRandomPallet = useRandomPallet
        this.colorCount = colorCount
        this.border = border
        this.horizontalSymmetry = horizontalSymmetry
        this.result = undefined
        this.validate()
    }

    // TODO check for random pallet and count and other newer parameters
    public single(): Sprite {
        this.result = new Sprite({dim: this.spriteDimensions})

        // Assume that the pallet is trimmed
        const blanksToInsert = Math.ceil(this.colorPallet.length / this.blankPercentage)
        const realPallet = [...this.colorPallet].concat(...new Array(blanksToInsert).fill(null).map(() => Color.BLACK.copy()))

        let random_cols = this.spriteDimensions[0]
        let random_rows = this.spriteDimensions[1]
        let half_cols = 0
        let half_rows = 0

        // TODO this logic is equivalent to this.spriteDimensions[x] % 2
        let center_col = undefined
        let center_row = undefined

        if (this.horizontalSymmetry) {
            random_cols = Math.ceil(random_cols / 2)
            half_cols = random_cols
            center_col = this.spriteDimensions[0] % 2
        } else {
            random_rows = Math.ceil(random_rows / 2)
            half_rows = random_rows
            center_row = this.spriteDimensions[1] % 2
        }

        for (let y = 0; y < random_rows; y++) {
            for (let x = 0; x < random_cols; x++) {
                const r = SpriteBuilder.randInt(0, realPallet.length - 1)
                const selectedColor = realPallet[r]
                this.result.setPixelAt(x, y, selectedColor)
                // TODO
            }
        }

        return this.result;
    }

    public spriteWidth(): number {
        return this.spriteDimensions[0] + this.borderLeft() + this.borderRight()
    }

    public spriteHeight(): number {
        return this.spriteDimensions[1] + this.borderUp() + this.borderDown()
    }

    public borderUp(): number {
        return this.border[0]
    }

    public borderRight(): number {
        return this.border[1]
    }

    public borderDown(): number {
        return this.border[2]
    }

    public borderLeft(): number {
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

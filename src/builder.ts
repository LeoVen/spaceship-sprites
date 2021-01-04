import { Color, Pallet, SpriteSymmetry } from './core'
import Sprite from './sprite'
import Validator from './validator'

interface SpriteBuilderParams {
    spriteDimensions?: [number, number]
    blankPercentage?: number
    colorPallet?: Array<Color>
    border?: number
    symmetry?: SpriteSymmetry
}

class SpriteBuilder {
    // The dimensions of the ship sprite (Width and Height)
    private spriteDimensions: [number, number]
    // How much of blank pixels in a sprite
    private blankPercentage: number
    // Color pallet for using in generating the sprites
    private colorPallet: Pallet
    // How many pixels for a blank border
    private border: number
    // If symmetry is horizontal or vertical
    private symmetry: SpriteSymmetry

    private result?: Sprite

    constructor(
        {
            spriteDimensions = [7, 7],
            blankPercentage = 0.5,
            colorPallet = [
                SpriteBuilder.randomColor(),
                SpriteBuilder.randomColor(),
                SpriteBuilder.randomColor(),
            ],
            border = 1,
            symmetry = SpriteSymmetry.Vertical
        }: SpriteBuilderParams
    ) {
        this.spriteDimensions = spriteDimensions
        this.blankPercentage = blankPercentage
        this.colorPallet = colorPallet
        this.border = border
        this.symmetry = symmetry
        this.result = undefined
        this.validate()
    }

    public single(): Sprite {
        let random_cols = this.spriteDimensions[0]
        let random_rows = this.spriteDimensions[1]

        this.result = new Sprite({dim: this.spriteDimensions})

        return this.result;
    }

    public spriteWidth(): number {
        return this.spriteDimensions[0] + 2 * this.border
    }

    public spriteHeight(): number {
        return this.spriteDimensions[1] + 2 * this.border
    }

    private static randomColor(): Color {
        return [
            SpriteBuilder.randInt(0, 255),
            SpriteBuilder.randInt(0, 255),
            SpriteBuilder.randInt(0, 255),
        ]
    }

    private static randInt(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    private validate(): void {
        Validator.percentage(this.blankPercentage, "blankPercentage")
        if (this.blankPercentage < 0.0 || this.blankPercentage > 1.0) {
            throw new Error(`Invalid percentage value for blankPercentage. Expected percentage, but found: ${this.blankPercentage}`)
        }
        if (this.border < 0.0 || !Number.isInteger(this.border)) {
            throw new Error(`Invalid value for border. Expected positive integer, but found: ${this.border}`)
        }
    }
}

export default SpriteBuilder

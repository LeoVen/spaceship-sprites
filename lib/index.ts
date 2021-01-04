
type Color = [number, number, number]

class Sprite {

}

interface SpriteBuilderParams {
    spriteDimensions?: [number, number]
    blankPercentage?: number
    colorPallet?: Array<Color>
    border?: number
}

class SpriteBuilder {
    // The dimensions of the ship sprite (Width and Height)
    private spriteDimensions: [number, number]
    // How much of blank pixels in a sprite
    private blankPercentage: number
    // Color pallet for using in generating the sprites
    private colorPallet: Array<Color>
    // How many pixels for a blank border
    private border: number

    private result: Array<number>

    constructor(
        {
            spriteDimensions = [7, 9],
            blankPercentage = 0.5,
            colorPallet = [
                SpriteBuilder.randomColor(),
                SpriteBuilder.randomColor(),
                SpriteBuilder.randomColor(),
            ],
            border = 1,
        }: SpriteBuilderParams
    ) {
        this.spriteDimensions = spriteDimensions
        this.blankPercentage = blankPercentage
        this.colorPallet = colorPallet
        this.border = border
        this.result = []
        this.validate()
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
        if (this.blankPercentage < 0.0 || this.blankPercentage > 1.0) {
            throw new Error(`Invalid percentage value for blankPercentage. Expected percentage, but found: ${this.blankPercentage}`)
        }
        if (this.border < 0.0 || !Number.isInteger(this.border)) {
            throw new Error(`Invalid value for border. Expected positive integer, but found: ${this.border}`)
        }
    }
}

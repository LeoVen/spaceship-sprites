import SpriteBuilder from "./builder"
import Color from "./color"
import Validator from './validator'

interface SpriteParams {
    dim: [number, number]
    array?: Array<Color>
    pallet?: Array<Color>
    horizontalSymmetry?: boolean
}

class Sprite {
    private _dim: [number, number]
    private _array: Array<Color>
    private _pallet: Array<Color>
    private _horizontalSymmetry: boolean

    constructor({dim, array, pallet, horizontalSymmetry}: SpriteParams) {
        Validator.positiveInteger(dim[0], "dim.x")
        Validator.positiveInteger(dim[1], "dim.y")

        let arr: Array<Color> = array || new Array(dim[0] * dim[1]).fill(null).map(() => new Color(0, 0, 0))

        if (dim[0] * dim[1] != arr.length) {
            throw new Error(`Invalid array dimensions [${dim[0]}, ${dim[1]}] for array of length ${arr.length}`)
        }

        this._dim = dim
        this._array = arr
        this._pallet = Sprite.trimPallet(pallet || new Array())
        this._horizontalSymmetry = horizontalSymmetry || false
    }

    public get dim(): [number, number] {
        return this._dim
    }

    public get array(): Array<Color> {
        return [...this._array].map((color) => color.copy())
    }

    public arrayValues(): Array<[number, number, number]> {
        return [...this._array].map((color) => color.toArray())
    }

    public matrix(): Array<Array<[number, number, number]>> {
        return new Array(this.dim[0])
            .fill(null)
            .map((_, i) => new Array(this.dim[1])
                .fill(null)
                .map((_, j) => this.pixelAt(i, j).toArray()))
    }

    // Creates an SVG from the nearest number greater than the dimension provided, such that it fits exactly each pixel with the same scale.
    public svg(width: number, height: number, unit: string = 'px') {
        let w = width + this._dim[0] - (width % this._dim[0])
        let h = height + this._dim[1] - (height % this._dim[1])
        return this.svgExact(w, h, unit)
    }

    // Creates an SVG from exact width and height
    public svgExact(width: number, height: number, unit: string = 'px'): string {
        let result = `<svg width="${width}${unit}" height="${height}${unit}" viewBox="0, 0, ${this.dim[0]}, ${this.dim[1]}">`

        for (let x = 0; x < this._dim[0]; x++) {
            for (let y = 0; y < this.dim[1]; y++) {
                let rgb = this.pixelAt(x, y).toRgb()
                result += `<rect width="1" height="1" x="${x}" y="${y}" style="fill:${rgb};" />`
            }
        }

        return result + "</svg>"
    }

    // Creates an SVG from the sprite where each pixel is a square of pixelSize by pixelSize
    public svgScale(pixelSize: number, unit: string = 'px') {
        let width = this._dim[0] * pixelSize
        let height = this._dim[1] * pixelSize
        return this.svgExact(width, height, unit)
    }

    public get pallet(): Array<Color> {
        return [...this._pallet].map((color) => color.copy())
    }

    public get horizontalSymmetry(): boolean {
        return this._horizontalSymmetry
    }

    public data(): Uint32Array {
        let result = new Uint32Array(this._array.length)

        this._array.forEach((value, index) => {
            result[index] = value.toInt32()
        })

        return result;
    }

    public bytes(): Uint8Array {
        let result = new Uint8Array(this._array.length * 3)

        this._array.forEach((value, index) => {
            result[index + 0] = value.redByte
            result[index + 1] = value.greenByte
            result[index + 2] = value.greenByte
        })

        return result
    }

    // public base64(): string {
    //     return encode(this.bytes().toString())
    // }

    public setPixelAt(x: number, y: number, color: Color): void {
        this.checkIndex(x, y)
        this._array[y * this._dim[0] + x] = color.copy()
    }

    public pixelAt(x: number, y: number): Color {
        this.checkIndex(x, y)
        return this._array[y * this._dim[0] + x].copy()
    }

    public static builder(): SpriteBuilder {
        return new SpriteBuilder({})
    }

    private static trimPallet(pallet: Array<Color>): Array<Color> {
        pallet = pallet.filter((value) => value !== Color.BLACK)
        return pallet;
    }

    private checkIndex(x: number, y: number): void {
        if (x >= this._dim[0] || y >= this._dim[1]) {
            throw new Error(`Index out of bounds [${x}, ${y}] when actual dimension is [${this.dim[0]}, ${this.dim[1]}]`)
        }
    }
}

export default Sprite

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

    public svg(): string {
        let result = `<svg width="${this.dim[0]}" height="${this.dim[1]}">`

        for (let x = 0; x < this._dim[0]; x++) {
            for (let y = 0; y < this.dim[1]; y++) {
                result += `<rect width="10" height="10" x="${x}" y="${y}" style="fill:${this.pixelAt(x, y).toRgb()}" />`
            }
        }

        return result + "</svg>"
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

    public setPixelAt(x: number, y: number, color: Color): void {
        this.checkIndex(x, y)
        this._array[x * this._dim[0] + y] = color
    }

    public pixelAt(x: number, y: number): Color {
        this.checkIndex(x, y)
        return this._array[x * this._dim[0] + y]
    }

    public static builder(): SpriteBuilder {
        return new SpriteBuilder({})
    }

    private static trimPallet(pallet: Array<Color>): Array<Color> {
        pallet = pallet.filter((value) => value !== Color.BLACK)
        return pallet;
    }

    private checkIndex(x: number, y: number): void {
        if (x > this._dim[0] || y > this._dim[1]) {
            throw new Error(`Index out of bounds [${x}, ${y}] when actual dimension is [${this.dim[0]}, ${this.dim[1]}]`)
        }
    }
}

export default Sprite

import SpriteBuilder from "./builder"
import { Color, Pallet, SpriteSymmetry } from "./core"
import Validator from './validator'

interface SpriteParams {
    dim: [number, number]
    array?: Array<Color>
    pallet?: Array<Color>
    symmetry?: SpriteSymmetry
}

class Sprite {
    private _dim: [number, number]
    private _array: Array<Color>
    private _pallet: Pallet
    private _symmetry: SpriteSymmetry

    constructor({dim, array, pallet, symmetry}: SpriteParams) {
        Validator.positiveInteger(dim[0], "dim.x")
        Validator.positiveInteger(dim[1], "dim.y")

        let arr: Array<Color> = array || new Array(dim[0] * dim[1]).map(() => [0, 0, 0])

        if (dim[0] * dim[1] != arr.length) {
            throw new Error(`Invalid array dimensions [${dim[0]}, ${dim[1]}] for array of length ${arr.length}`)
        }

        this._dim = dim
        this._array = arr
        this._pallet = Sprite.trimPallet(pallet || new Array())
        this._symmetry = symmetry || SpriteSymmetry.Vertical
    }

    public get dim(): [number, number] {
        return this._dim
    }

    public get array(): Array<Color> {
        return [...this._array].map(color => [...color])
    }

    public get pallet(): Array<Color> {
        return [...this._pallet].map(color => [...color])
    }

    public get symmetry(): SpriteSymmetry {
        return this.symmetry
    }

    public data(): Uint32Array {
        let result = new Uint32Array(this._array.length)

        this._array.forEach((value, index) => {
            result[index] = ((value[0] & 0xFF) << 16) | ((value[1] & 0xFF) << 8) | ((value[0] & 0xFF) << 0)
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
        pallet = pallet.filter((value) => value != [0, 0, 0])
        return pallet;
    }

    private checkIndex(x: number, y: number): void {
        if (x > this._dim[0] || y > this._dim[1]) {
            throw new Error(`Index out of bounds [${x}, ${y}] when actual dimension is [${this.dim[0]}, ${this.dim[1]}]`)
        }
    }
}

export default Sprite

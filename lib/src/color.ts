import Validator from "./validator"

// Color expressed in RGBA with numbers in range [0.0, 1.0]
class Color {
    private _color: [number, number, number, number]

    constructor(r: number, g: number, b: number, a: number = 1.0) {

        this._color = [Color.toPct(r, 'Red'),
                       Color.toPct(g, 'Green'),
                       Color.toPct(b, 'Blue'),
                       Color.toPct(a, 'Alpha')]
    }

    public copy(): Color {
        return new Color(this._color[0], this._color[1], this._color[2], this._color[3])
    }

    public static random(randomAlpha: boolean = true): Color {
        return new Color(
            Math.random(),
            Math.random(),
            Math.random(),
            randomAlpha ? Math.random() : 1,
        )
    }

    public get red(): number {
        return this._color[0]
    }

    public get green(): number {
        return this._color[1]
    }

    public get blue(): number {
        return this._color[2]
    }

    public get alpha(): number {
        return this._color[3]
    }

    public set red(value: number) {
        this._color[0] = Color.toPct(value, 'Red')
    }

    public set green(value: number) {
        this._color[1] = Color.toPct(value, 'Green')
    }

    public set blue(value: number) {
        this._color[2] = Color.toPct(value, 'Blue')
    }

    public set alpha(value: number) {
        this._color[3] = Color.toPct(value, 'Alpha')
    }

    public get redByte(): number {
        return this._color[0] * 255
    }

    public get greenByte(): number {
        return this._color[1] * 255
    }

    public get blueByte(): number {
        return this._color[2] * 255
    }

    public get alphaByte(): number {
        return this._color[3] * 255
    }

    public toArray(): [number, number, number, number] {
        return [...this._color]
    }

    public toByteArray(): [number, number, number, number] {
        return [this.redByte, this.greenByte, this.blueByte, this.alphaByte]
    }

    // Returns an integer value representing 0xAARRGGBB
    public toInt(): number {
        let color = this.toByteArray()
        return (((color[3] * 255) & 0xFF) << 24) | (((color[0] * 255) & 0xFF) << 16) | (((color[1] * 255) & 0xFF) << 8) | ((color[2] & 0xFF) << 0)
    }

    public toHexa(): string {
        return this.alphaByte.toString(16) +
               this.redByte.toString(16) +
               this.greenByte.toString(16) +
               this.blueByte.toString(16)
    }

    public toRgb(): string {
        console.log(this.toByteArray())
        return `rgb(${Math.round(this.red * 255)}, ${Math.round(this.green * 255)}, ${Math.round(this.blue * 255)})`
    }

    public toRgba(): string {
        return `rgba(${Math.round(this.red * 255)}, ${Math.round(this.green * 255)}, ${Math.round(this.blue * 255)}, ${this.alpha})`
    }

    public static fromInt(colorValue: number): Color {
        Validator.positiveInteger(colorValue, 'colorValue')

        let a = (colorValue & 0xFF000000) >>> 24
        let r = (colorValue & 0x00FF0000) >>> 16
        let g = (colorValue & 0x0000FF00) >>> 8
        let b = (colorValue & 0x000000FF) >>> 0

        return new Color(r, g, b, a)
    }

    // Input has the form of AARRGGBB starting with either 0x, # or neither
    public static fromHexa(colorString: string): Color {
        if (colorString.startsWith('#'))
            colorString = colorString.slice(1)
        if (!colorString.startsWith('0x'))
            colorString = '0x' + colorString

        return Color.fromInt(parseInt(colorString))
    }

    static withinPct(n: number): boolean {
        return n >= 0.0 && n <= 1.0
    }

    static withinByte(n: number): boolean {
        return n >= 0.0 && n <= 255.0
    }

    static toPct(n: number, valueName: string = 'value'): number {
        if (Color.withinPct(n))
            return n;
        else if (Color.withinByte(n))
            return n / 255;
        else
            throw new Error(`Invalid ${valueName}: ${n} when converting color. Value N must be either 0 <= N <= 1.0 or 0 <= N <= 255.`)
    }

    public static readonly BLACK = new Color(0, 0, 0, 1)
    public static readonly WHITE = new Color(1, 1, 1, 1)
    public static readonly TRANSPARENT = new Color(0, 0, 0, 0)
}

export default Color

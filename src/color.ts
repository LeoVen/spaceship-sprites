// Color expressed in RGB with numbers in range [0.0, 1.0]
class Color {
    _color: [number, number, number]

    constructor(r: number, g: number, b: number) {
        if (Color.withinPct(r) && Color.withinPct(g) && Color.withinPct(b)) {
            this._color = [r, g, b]
        } else if (Color.withinByte(r) && Color.withinByte(g) && Color.withinByte(b)) {
            this._color = Color.toWithinPct(r, g, b)
        } else {
            throw new Error(`Invalid combination of RGB values: [${r}, ${g}, ${b}]`)
        }
    }

    public copy(): Color {
        return new Color(this._color[0], this._color[1], this._color[2])
    }

    public static random(): Color {
        return new Color(
            Math.random(),
            Math.random(),
            Math.random(),
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

    public get redByte(): number {
        return this._color[0] * 255
    }

    public get greenByte(): number {
        return this._color[0] * 255
    }

    public get blueByte(): number {
        return this._color[0] * 255
    }

    public toArray(): [number, number, number] {
        return [...this._color]
    }

    public toByteArray(): [number, number, number] {
        return [this.redByte, this.greenByte, this.blueByte]
    }

    public toInt32(): number {
        let color = this.toByteArray()
        return (((color[0] * 255) & 0xFF) << 16) | (((color[1] * 255) & 0xFF) << 8) | ((color[0] & 0xFF) << 0)
    }

    public toHexa(): string {
        return this.toInt32().toString(16)
    }

    public toRgb(): string {
        return `rgb(${Math.round(this.red * 255)}, ${Math.round(this.green * 255)}, ${Math.round(this.blue * 255)})`
    }

    private static toWithinPct(r: number, g: number, b: number): [number, number, number] {
        return [r / 255, g / 255, b / 255]
    }

    static withinPct(n: number): boolean {
        return n >= 0.0 && n <= 1.0
    }

    static withinByte(n: number): boolean {
        return n >= 0.0 && n <= 255.0
    }

    public static readonly BLACK = new Color(0, 0, 0)
    public static readonly WHITE = new Color(1, 1, 1)
}

export default Color

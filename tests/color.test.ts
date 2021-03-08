import { Color, Sprite, SpriteBuilder } from '../src'

describe('SpriteBuilder', function() {
    it('fromHexa', function() {
        let c1 = Color.fromHexa('#FF102030')
        let c2 = new Color(0x10, 0x20, 0x30, 0xFF)

        expect(c1.alpha).toEqual(c2.alpha)
        expect(c1.red).toEqual(c2.red)
        expect(c1.green).toEqual(c2.green)
        expect(c1.blue).toEqual(c2.blue)
    })

    it('fromInt', function() {
        let c1 = Color.fromInt(0xFF102030)
        let c2 = new Color(0x10, 0x20, 0x30, 0xFF)

        expect(c1.alpha).toEqual(c2.alpha)
        expect(c1.red).toEqual(c2.red)
        expect(c1.green).toEqual(c2.green)
        expect(c1.blue).toEqual(c2.blue)
    })

    it('toInt', function() {
        let c1 = Color.fromInt(0xFF102030)
        let c2 = new Color(0x10, 0x20, 0x30, 0xFF)

        expect(c1.toInt()).toEqual(c2.toInt())
    })

    it('toArray', function() {
        let c1 = Color.fromInt(0xFF102030)
        let c2 = new Color(0x10, 0x20, 0x30, 0xFF)

        expect(c1.toArray()).toEqual(c2.toArray())
    })

    it('toByteArray', function() {
        let c1 = Color.fromHexa('#FF102030')
        let c2 = new Color(0x10, 0x20, 0x30, 0xFF)

        expect(c1.toByteArray()).toEqual(c2.toByteArray())
    })

    it('toHexa', function() {
        let c1 = Color.fromHexa('#FF102030')

        expect(c1.toHexa().toUpperCase()).toEqual('FF102030')
    })
})

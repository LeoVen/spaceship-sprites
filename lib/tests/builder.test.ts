import { Color, Sprite, SpriteBuilder } from '../src'

describe('SpriteBuilder', function() {
    it('single', function() {
        // Creates a builder with default parameters
        let builder = new SpriteBuilder({})

        expect(builder).not.toBeNull()
    })
})

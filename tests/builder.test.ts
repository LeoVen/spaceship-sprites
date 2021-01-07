import Sprite from '../src/sprite'
import SpriteBuilder from '../src/builder'

describe('SpriteBuilder', function() {
    it('single', function() {
        let builder = new SpriteBuilder({});

        let sprite = builder.single()
        // console.log(sprite.matrix())

        expect(builder).not.toBeNull()
    })
})

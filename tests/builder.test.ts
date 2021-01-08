import Sprite from '../src/sprite'
import SpriteBuilder from '../src/builder'

describe('SpriteBuilder', function() {
    it('single', function() {
        let builder = new SpriteBuilder({border: 2});

        let sprite = builder.single().withBorder().build()
        console.log(sprite.svg(100, 100))
        // console.log(sprite.base64())

        expect(builder).not.toBeNull()
    })
})

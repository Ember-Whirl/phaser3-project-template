import { GameObjects } from 'phaser';
import Text from '../../text';
import { ETextStyle } from '../../ETextStyles';

export default class ProgressBar extends GameObjects.Container {
    constructor(scene, x, y, atlas, backgroundKey, fillKey, frontKey, fillLeftToRight = true) {
        super(scene, x, y)
        this.scene = scene
        this.x = x
        this.y = y
        this.atlas = atlas
        this.backgroundKey = backgroundKey
        this.fillKey = fillKey
        this.frontKey = frontKey

        if (fillLeftToRight) this.setScale(-1, 1)

        this.createBackground()
        this.createFill()

        this.createFront()

    }

    createBackground() {
        this.background = new GameObjects.Sprite(this.scene, 0, 0, this.atlas, this.backgroundKey)
        this.add(this.background)
        this.background.setOrigin(1, 0.5)



    }

    createFill() {
        this.fill = new GameObjects.Sprite(this.scene, 0, 0, this.atlas, this.fillKey)
        this.add(this.fill)

        console.log(this.fill)

        let yest = 9/10

        console.log('test' , yest)



        this.fill.setOrigin(1, 0.5)
        this.fill.setScale(yest, 1)
        
        // this.fill.fill()
    }

    createFront() {
        this.front = new GameObjects.Sprite(this.scene, 0, 0, this.atlas, this.frontKey)
        this.add(this.front)

        this.front.setOrigin(1, 0.5)
    }
}
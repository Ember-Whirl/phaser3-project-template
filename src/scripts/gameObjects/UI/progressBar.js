import { GameObjects } from 'phaser';
import Text from '../../text';
import { ETextStyle } from '../../ETextStyles';

export default class ProgressBar extends GameObjects.Container {
    constructor(scene, x, y, atlas, backgroundKey, fillKey, frontKey, fullAmount, startFill = null, fillLeftToRight = true) {
        super(scene, x, y)
        this.scene = scene
        this.x = x
        this.y = y
        this.atlas = atlas
        this.backgroundKey = backgroundKey
        this.fillKey = fillKey
        this.frontKey = frontKey
        this.fullAmount = fullAmount
        this.startFill = startFill

        if (this.startFill === null) this.startFill = this.fullAmount
        if (fillLeftToRight) this.setScale(-1, 1)

        this.createBackground()
        this.createFill()
        this.createFront()

        this.setFill(this.startFill)
    }

    createBackground() {
        this.background = new GameObjects.Sprite(this.scene, 0, 0, this.atlas, this.backgroundKey)
        this.add(this.background)
        this.background.setOrigin(1, 0.5)
    }

    createFill() {
        this.fill = new GameObjects.Sprite(this.scene, 0, 0, this.atlas, this.fillKey)
        this.add(this.fill)
        this.fill.setOrigin(1, 0.5)
    }

    createFront() {
        this.front = new GameObjects.Sprite(this.scene, 0, 0, this.atlas, this.frontKey)
        this.add(this.front)
        this.front.setOrigin(1, 0.5)
    }

    setFill(amount) {
        let fillPercentage = amount/this.fullAmount
        this.fill.setScale(fillPercentage, 1)
    }
}
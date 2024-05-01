import { GameObjects } from 'phaser';
import Text from '../../text';
import { ETextStyle } from '../../ETextStyles';

export default class ProgressBar extends GameObjects.Container {
    constructor(scene, x, y, atlas, backgroundKey, fillKey) {
        super(scene, x, y)
        this.scene = scene
        this.x = x
        this.y = y
        this.atlas = atlas
        this.backgroundKey = backgroundKey
        this.fillKey = fillKey

        this.createBackground()
        this.createFill()
    }

    createBackground() {
        this.background = new GameObjects.Sprite(this.scene, 0, 0, this.atlas, this.backgroundKey)
        this.add(this.background)
    }

    createFill() {
        this.fill = new GameObjects.Sprite(this.scene, 0, 0, this.atlas, this.fillKey)
        this.add(this.fill)

        console.log(this.fill)
    }

}
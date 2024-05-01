import { GameObjects } from 'phaser';
import Text from '../../text';
import { ETextStyle } from '../../ETextStyles';

export default class HealthBar extends GameObjects.Container {
    constructor(scene, x, y, color) {
        super(scene, x, y)
        this.scene = scene
        this.x = x
        this.y = y
        this.color = color

        this.createHealthBarImages()
    }

    createHealthBarImages() {
        this.background = new GameObjects.Sprite(this.scene, 0, 0, 'atlas-ui', 'ui-healthbar-back.png')
        this.add(this.background)
    }

}
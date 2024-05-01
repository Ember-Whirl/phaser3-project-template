import { GameObjects } from 'phaser';
import Text from '../../text';
import { ETextStyle } from '../../ETextStyles';
import ProgressBar from './progressBar';

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
        this.background = new ProgressBar(this.scene, 0, 0, 'atlas-ui', 'ui-healthbar-back.png', 'ui-healthbar-warrior.png')
        this.add(this.background)
    }

}
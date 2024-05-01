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

        this.createProgressBar()
    }

    createProgressBar() {
        if (this.color === 'green') this.fillKey = 'ui-healthbar-warrior.png'
        if (this.color === 'red') this.fillKey = 'ui-healthbar-enemy.png'

        this.background = new ProgressBar(this.scene, 0, 0, 'atlas-ui', 'ui-healthbar-back.png', this.fillKey, 'ui-healthbar-front.png')
        this.add(this.background)
    }

}
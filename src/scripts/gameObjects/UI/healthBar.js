import { GameObjects } from 'phaser';
import Text from '../../text';
import { ETextStyle } from '../../ETextStyles';
import ProgressBar from './progressBar';

export default class HealthBar extends GameObjects.Container {
    constructor(scene, x, y, color, maximumHealth) {
        super(scene, x, y)
        this.scene = scene
        this.x = x
        this.y = y
        this.color = color
        this.maximumHealth = maximumHealth

        this.createProgressBar()
    }

    createProgressBar() {
        if (this.color === 'green') this.fillKey = 'ui-healthbar-warrior.png'
        if (this.color === 'red') this.fillKey = 'ui-healthbar-enemy.png'

        this.progressBar = new ProgressBar(this.scene, 0, 0, 'atlas-ui', 'ui-healthbar-back.png', this.fillKey, 'ui-healthbar-front.png', this.maximumHealth)
        this.add(this.progressBar)
    }

    updateHealth(newHealth) {
        if (newHealth < 0) newHealth = 0
        this.progressBar.setFill(newHealth)
    }
}
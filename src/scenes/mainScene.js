import Phaser from 'phaser';
import DimensionManager from '../scripts/managers/standard-managers/dimensionManager';

export default class MainScene extends Phaser.Scene {
    constructor () {
        super('MainScene');
    }

    preload () {
        DimensionManager.instance.init(this);
        this.createBackground();
    }
      
    create () {
    }

    createBackground() {
        const center = DimensionManager.instance.center;
        this.background = this.add.image(center.x, center.y, 'background');

        // this.octopus = this.add.spine(300, 300, 'skeleton')
        // this.octopus.play('animation', true)
    }
}
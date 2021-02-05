import Phaser from 'phaser';
import DimensionManager from '../scripts/managers/standard-managers/dimensionManager';

export default class MainScene extends Phaser.Scene {
    constructor () {
        super('MainScene');
    }

    preload () {
        DimensionManager.instance.init(this);
        this.load.image('logo', 'src/assets/logo.png');
    }
      
    create () {
    }

    createBackground() {
        const center = DimensionManager.instance.center;
        this.background = this.add.image(center.x, center.y, 'logo');
    }
}
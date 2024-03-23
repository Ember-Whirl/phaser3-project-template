import Phaser from 'phaser';
import DimensionManager from '../scripts/managers/standard-managers/dimensionManager';
import EventManager from '../scripts/managers/standard-managers/eventManager';
import MainScreen from '../screens/mainScreen';
import EnemySpawner from '../scripts/managers/standard-managers/enemySpawner';

export default class MainScene extends Phaser.Scene {
    constructor () {
        super('MainScene');
    }

    preload () {
        DimensionManager.instance.init(this);
        //this.createBackground();
    }
      
    create () {
        this.mainScreen = new MainScreen(this)
        this.add.existing(this.mainScreen)
        EnemySpawner.instance.init(this)
    }

    update() {
        EventManager.instance.dispatch('update')
    }
}
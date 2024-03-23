import Phaser from 'phaser';
import EventManager from '../managers/standard-managers/eventManager';
import DimensionManager from '../managers/standard-managers/dimensionManager';

export default class Castle extends Phaser.GameObjects.Container {
    constructor(scene, x, y, maximumHealth, movementSpeed, damagePerHit, enemyID) {
        super(scene);
        this.scene = scene
        this.x = x
        this.y = y

        this.maximumHealth = maximumHealth
        this.health = this.maximumHealth

        this.createCastleVisual()

        EventManager.instance.add('update', this.update, this)
        EventManager.instance.add('LevelManager:lostLevel', this.onLevelEnd, this)
        EventManager.instance.add('LevelManager:winLevel', this.onLevelEnd, this)
    }

    createCastleVisual() {
        this.castle = this.scene.add.image(0, 0, 'square');
        this.castle.setTint(0X808080)
        this.castle.setScale(3)
        this.add(this.castle)
    }

    update() {

    }


    removeAllEvents() {
        EventManager.instance.remove('update', this.update, this)
        EventManager.instance.remove('LevelManager:lostLevel', this.onLevelEnd, this)
        EventManager.instance.remove('LevelManager:winLevel', this.onLevelEnd, this)
    }

    onLevelEnd() {
    }
}
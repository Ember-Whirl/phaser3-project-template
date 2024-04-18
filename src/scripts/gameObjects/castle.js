import Phaser from 'phaser';
import EventManager from '../managers/standard-managers/eventManager';
import DimensionManager from '../managers/standard-managers/dimensionManager';
import { ETextStyle } from '../ETextStyles';
import Text from '../text';
import Warrior from './warrior';

export default class Castle extends Phaser.GameObjects.Container {
    constructor(scene, x, y, maximumHealth) {
        super(scene);
        this.scene = scene
        this.x = x
        this.y = y

        this.maximumHealth = maximumHealth
        this.health = this.maximumHealth

        this.createCastleVisual()
        this.createLivesText()

        this.spawningOn = true

        EventManager.instance.add('update', this.update, this)
        EventManager.instance.add('startGame', this.startGame, this)

        EventManager.instance.add('LevelManager:lostLevel', this.onLevelEnd, this)
        EventManager.instance.add('LevelManager:winLevel', this.onLevelEnd, this)
        EventManager.instance.add('Enemy:hittingCastle', this.takeDamage, this)
    }

    createCastleVisual() {
        this.castle = this.scene.add.image(0, -50, 'castle');
        this.castle.setScale(1)
        this.add(this.castle)
    }

    createLivesText() {
        console.log(this.health)
        this.livesText = new Text(this.scene, 0, -25, this.health, ETextStyle.GAMEPLAYVALUES)
        this.add(this.livesText)
    }

    updateLivesText() {
        this.livesText.text = this.health
    }

    takeDamage(damage) {
        this.health -= damage
        this.updateLivesText()
        this.checkLoseCondition()
    }

    checkLoseCondition() {
        if (this.health <= 0) EventManager.instance.dispatch('gameEnd')
    }

    startGame() {
        this.health = this.maximumHealth
        this.updateLivesText()
        this.spawningOn = false
    }

    removeAllEvents() {
        EventManager.instance.remove('update', this.update, this)
        EventManager.instance.remove('LevelManager:lostLevel', this.onLevelEnd, this)
        EventManager.instance.remove('LevelManager:winLevel', this.onLevelEnd, this)
    }

    onLevelEnd() {

    }
}
import Phaser from 'phaser';
import DimensionManager from '../scripts/managers/standard-managers/dimensionManager';

import EventManager from '../scripts/managers/standard-managers/eventManager';
import { ETextStyle } from '../scripts/ETextStyles';
import Text from '../scripts/text';
import Enemy from '../scripts/gameObjects/enemy';
import Castle from '../scripts/gameObjects/castle';


export default class MainScreen extends Phaser.GameObjects.Container {
    constructor(scene) {
        super(scene);
        this.scene = scene
        this.center = DimensionManager.instance.center
        this.bottom = DimensionManager.instance.bottom

        this.createBackground()
        this.createPlayerLivesText()
        this.createGoldBalanceText()
        this.updatePlayerLivesText()
        this.updateGoldBalanceText()

        this.castle = new Castle(this.scene, DimensionManager.instance.width/2, DimensionManager.instance.height/2)
        this.add(this.castle)

        this.enemy = new Enemy(this.scene, -100, 1000, 100, 2, 4, this.castle, 0)
        this.add(this.enemy)

  

        // this.createLevelSelect()
        // this.createLevelStartButton()

        EventManager.instance.add('LevelManager:lostLevel', this.onLevelLost, this)
        EventManager.instance.add('LevelManager:winLevel', this.onLevelWon, this)
        EventManager.instance.add('LevelManager:levelStarted', this.onlevelStart, this)
    }

    createBackground() {
        this.background = this.scene.add.image(this.center.x, this.center.y, 'background');
        this.background.setTint(0xDBBA8F)
    }

    createPlayerLivesText() {
        this.playerLivesText = new Text(this.scene, 100, 100, '', ETextStyle.GAMEPLAYVALUES)
        this.add(this.playerLivesText)
    }

    updatePlayerLivesText() {
        this.playerLivesText.text = 'Lives: ' + 5
    }

    createGoldBalanceText() {
        this.goldBalanceText = new Text(this.scene, 100, 125, '', ETextStyle.GAMEPLAYVALUES)
        this.add(this.goldBalanceText)
        //this.goldBalanceText.setVisible(false)
    }

    updateGoldBalanceText() {
        this.goldBalanceText.text = 'Gold: ' + 5
    }

    onlevelStart() {
        this.playerLivesText.setVisible(true)
        this.goldBalanceText.setVisible(true)
    }

    onLevelWon() {
        this.onLevelEnd()
    }

    onLevelLost() {
        this.onLevelEnd()
    }

    onLevelEnd() {
        this.playerLivesText.setVisible(false)
        this.goldBalanceText.setVisible(false)
    }
}
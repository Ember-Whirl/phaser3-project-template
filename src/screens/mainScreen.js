import Phaser from 'phaser';
import DimensionManager from '../scripts/managers/standard-managers/dimensionManager';
import EventManager from '../scripts/managers/standard-managers/eventManager';
import { ETextStyle } from '../scripts/ETextStyles';
import Text from '../scripts/text';
import Enemy from '../scripts/gameObjects/enemy';
import Castle from '../scripts/gameObjects/castle';
import EnemySpawner from '../scripts/managers/standard-managers/enemySpawner';
import Button from '../scripts/gameObjects/UI/button';

export default class MainScreen extends Phaser.GameObjects.Container {
    constructor(scene) {
        super(scene);
        this.scene = scene
        this.center = DimensionManager.instance.center
        this.bottom = DimensionManager.instance.bottom

        this.createWorld()
        this.createUI()


        // this.octopus = this.scene.add.spine(300, 300, 'skeleton')
        // this.octopus.play('animation', true)

        // this.octopus.setScale(-1, 1)

        EventManager.instance.add('startGame', this.onStartGame, this)
        EventManager.instance.add('gameEnd', this.onEndGame, this)
        EventManager.instance.add('EnemySpawner:newWaveSpawned', this.updateWaveText, this)
        EventManager.instance.add('update', this.update, this)
    }

    onStartGame () {
        this.startButton.setVisible(false)
        this.playerLivesText.setVisible(true)
        this.goldBalanceText.setVisible(true)
        this.waveText.setVisible(true)
    }

    onEndGame () {
        this.startButton.setVisible(true)
        this.playerLivesText.setVisible(false)
        this.goldBalanceText.setVisible(false)
        this.waveText.setVisible(false)
    }

    createWorld() {
        this.createBackground()
        this.createCastle()
    }

    createUI() {
        this.uiLayer = new Phaser.GameObjects.Container(this.scene, 0, 0)
        this.scene.add.existing(this.uiLayer)
        this.uiLayer.setDepth(50000)

        this.createPlayerLivesText()
        this.createGoldBalanceText()
        this.createWaveText()
        this.updatePlayerLivesText()
        this.updateGoldBalanceText()
        this.createClickToStart()
    }

    createBackground() {
        this.background = this.scene.add.image(this.center.x, this.center.y, 'background');
        //this.background.setTint(0x589543)
    }

    createCastle() {
        this.castle = new Castle(this.scene, DimensionManager.instance.width / 2, DimensionManager.instance.height / 2, 300)
        this.scene.add.existing(this.castle)
        this.castle.setDepth(this.castle.y)
    }

    createPlayerLivesText() {
        this.playerLivesText = new Text(this.scene, 100, 100, '', ETextStyle.GAMEPLAYVALUES)
        this.playerLivesText.setVisible(false)
        this.uiLayer.add(this.playerLivesText)
    }

    createClickToStart() {
        this.startButton = new Button(this.scene, DimensionManager.instance.width / 2, DimensionManager.instance.height / 2, 'atlas-ui', 'button.png', 'button-locked.png', 'button-pressed.png', 'Start game')
        this.uiLayer.add(this.startButton)

        this.startButton.buttonEmitter.on('onClick', this.startGame, this);
    }

    startGame () {
        EventManager.instance.dispatch('startGame')
    }


    updatePlayerLivesText() {
        this.playerLivesText.text = 'Lives: ' + 5
    }

    createGoldBalanceText() {
        this.goldBalanceText = new Text(this.scene, 100, 125, '', ETextStyle.GAMEPLAYVALUES)
        this.goldBalanceText.setVisible(false)
        this.uiLayer.add(this.goldBalanceText)
    }

    updateGoldBalanceText() {
        this.goldBalanceText.text = 'Gold: ' + 5
    }

    createWaveText() {
        this.waveText = new Text(this.scene, 100, 150, '', ETextStyle.GAMEPLAYVALUES)
        this.uiLayer.add(this.waveText)
    }

    updateWaveText() {
        this.waveText.text = 'Wave: ' + (EnemySpawner.instance.waveToSpawn + 1)
    }

    update() {
    }
}
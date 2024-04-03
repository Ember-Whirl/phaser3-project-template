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
        this.warriorSpawnTime = 2
        this.warriorSpawnTimeCounter = 0
        this.counterwarriors = 0

        this.warriorTypesData = this.scene.cache.json.get('warriorTypes')


        this.createCastleVisual()
        this.createLivesText()

        this.spawningOn = true

        EventManager.instance.add('update', this.update, this)
        EventManager.instance.add('restart', this.reset, this)

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

    update() {
        if (this.spawningOn) this.warriorSpawnTimeCounter++

        if (this.spawningOn && this.warriorSpawnTimeCounter >= (this.warriorSpawnTime * 60)) {
            this.spawnWarrior()

            this.warriorSpawnTimeCounter = 0
            // this.spawningOn = false
        }
    }

    spawnWarrior() {
        let warriorType = this.warriorTypesData.warriorTypes[1]
        let spawnX = this.x + Math.random() * (20 - -20) + -20
        let spawnY = this.y + Math.random() * (20 - -20) + -20
        let warrior = new Warrior(this.scene, 0, 0, warriorType.spineKey, warriorType.weapon, warriorType.maximumHealth, warriorType.movementSpeed, warriorType.damagePerHit, warriorType.attackSpeed, warriorType.range, warriorType.attachments, { x: spawnX, y: spawnY }, this.counterwarriors)
        this.counterwarriors++
        this.scene.add.existing(warrior)
    }

    checkLoseCondition() {
        if (this.health <= 0) EventManager.instance.dispatch('restart')
    }

    reset() {
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
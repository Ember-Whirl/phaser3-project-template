import Warrior from "../../gameObjects/warrior";
import Singleton from "../../singleton";
import EventManager from "./eventManager";

export default class WarriorSpawner extends Singleton {
    constructor() {
        super()
    }

    init(scene) {
        this.scene = scene

        this.gameInProgress = false

        this.spawnedWarriors = []
        this.warriorCount = 0
        this.warriorSpawnTime = 2
        this.warriorSpawnTimeCounter = 0
        this.nextWarriorID = 0

        this.warriorTypesData = this.scene.cache.json.get('warriorTypes')

        this.gameInProgress = true

        EventManager.instance.add('update', this.update, this)
        EventManager.instance.add('Warrior:warriorDied', this.warriorDied, this)
        EventManager.instance.add('restart', this.stopWarriorSpawning, this)
    }

    update() {
        if (this.gameInProgress) this.warriorSpawnTimeCounter++

        if (this.gameInProgress && this.warriorSpawnTimeCounter >= (this.warriorSpawnTime * 60)) {
            this.spawnWarrior()

            this.warriorSpawnTimeCounter = 0
            // this.gameInProgress = false
        }
    }

    spawnWarrior() {
        console.log(Math.random())
        let type = 0
        let random = Math.random()
        if (random > 0.25 && random < 0.5) type = 1
        if (random > 0.5 && random < 0.75) type = 2
        if (random > 0.75 && random < 1) type = 3


        let warriorType = this.warriorTypesData.warriorTypes[type]
        console.log('spawn warrior ', this.scene.mainScreen.castle.x)
        let spawnX = this.scene.mainScreen.castle.x + Math.random() * (20 - -20) + -20
        let spawnY = this.scene.mainScreen.castle.y + Math.random() * (20 - -20) + -20
        let warrior = new Warrior(this.scene, 0, 0, warriorType.spineKey, warriorType.maximumHealth, warriorType.movementSpeed, warriorType.damagePerHit, warriorType.attackSpeed, warriorType.range, warriorType.attachments, { x: spawnX, y: spawnY }, this.nextWarriorID)
        this.nextWarriorID++
        this.scene.add.existing(warrior)
    }

    stopWarriorSpawning() {
        this.gameInProgress = false
    }

    warriorDied(ID) {
        this.warriorCount--
        this.removeWarriorWithID(ID)
    }

    removeWarriorWithID(warriorID) {
        for (let i = 0; i < this.spawnedWarriors.length; i++) {
            const warrior = this.spawnedWarriors[i]
            if (warrior.warriorID === warriorID) {
                this.spawnedWarriors.splice(i, 1)
                break
            }
        }
    }
}
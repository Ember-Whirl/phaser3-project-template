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

        this.maxLevel = this.warriorTypesData.warriorTypes.length
        this.spawningLevel = 1
        this.maxAmountOfWarriors = 10

        this.gameInProgress = true

        EventManager.instance.add('update', this.update, this)
        EventManager.instance.add('Warrior:warriorDied', this.warriorDied, this)
        EventManager.instance.add('restart', this.stopWarriorSpawning, this)
    }

    update() {
        if (this.gameInProgress && this.spawnedWarriors.length < this.maxAmountOfWarriors) this.warriorSpawnTimeCounter++

        if (this.gameInProgress && this.warriorSpawnTimeCounter >= (this.warriorSpawnTime * 60) && this.spawnedWarriors.length < this.maxAmountOfWarriors) {
            //this.spawnRandomWarrior()
            this.spawnWarrior(this.spawningLevel - 1)

            this.warriorSpawnTimeCounter = 0
            // this.gameInProgress = false
        }
    }

    spawnRandomWarrior() {
        console.log(Math.random())
        let type = 0
        let random = Math.random()
        if (random > 0.25 && random < 0.5) type = 1
        if (random > 0.5 && random < 0.75) type = 2
        if (random > 0.75 && random < 1) type = 3

        this.spawnWarrior(type)
    }

    spawnWarrior(type, spawnPosition = null) {
        let warriorType = this.warriorTypesData.warriorTypes[type]

        let spawnX = 0
        let spawnY = 0

        if (spawnPosition === null) {
            spawnX = this.scene.mainScreen.castle.x + Math.random() * (20 - -20) + -20
            spawnY = this.scene.mainScreen.castle.y + Math.random() * (20 - -20) + -20
        }

        if (spawnPosition !== null && spawnPosition.x && spawnPosition.y) {
             spawnX = spawnPosition.x
             spawnY = spawnPosition.y
        }

        let warrior = new Warrior(this.scene, 0, 0, warriorType.spineKey, warriorType.maximumHealth, warriorType.movementSpeed, warriorType.damagePerHit, warriorType.attackSpeed, warriorType.range, warriorType.attachments, { x: spawnX, y: spawnY }, this.nextWarriorID, type)
        this.nextWarriorID++
        this.spawnedWarriors.push(warrior)
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

    mergeWarriors(warriorOne, warriorTwo) {
        let levelToSpawn = warriorOne.warriorLevel + 1

        if (levelToSpawn >= this.maxLevel) return

        this.spawnWarrior(levelToSpawn, { x: warriorOne.x, y: warriorOne.y })

        warriorOne.killWarrior()
        warriorTwo.killWarrior()
    }
}
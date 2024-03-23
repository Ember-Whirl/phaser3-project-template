import Enemy from "../../gameObjects/enemy";
import Singleton from "../../singleton";
import EventManager from "./eventManager";

export default class EnemySpawner extends Singleton {
    constructor() {
        super()
    }

    init(scene) {
        this.scene = scene

        this.waveToSpawn = 0
        this.gameInProgress = false

        this.enemyWavesData = this.scene.cache.json.get('enemyWaves')
        this.enemyTypesData = this.scene.cache.json.get('enemyTypes')

        EventManager.instance.add('update', this.update, this)
        EventManager.instance.add('Enemy:enemyDied', this.enemyDied, this)
        EventManager.instance.add('restart', this.stopWaveSpawning, this)



        this.startWavesFromBeginning()
    }

    update() {
        if (this.waveSpawnTimer > 0) {
            this.waveSpawnTimer -= 1
            if (this.waveSpawnTimer <= 0) {
                this.startNewWave()
            }
        }

        if (!this.enemyWavesData.waves[this.waveToSpawn] && this.enemyCount <= 0) {
            console.log('Player won!!!!')
        }
    }

    startWavesFromBeginning() {
        this.gameInProgress = true

        console.log(this.enemyTypesData.enemyTypes[0])
        //this.startNewWave()

        this.waveToSpawn = 0
        this.enemyCount = 0
        this.waveSpawnTimer = this.enemyWavesData.waves[this.waveToSpawn].waveSpawnTimer
    }

    stopWaveSpawning() {
        this.gameInProgress = false
    }

    startNewWave() {
        if (!this.gameInProgress) return

        EventManager.instance.dispatch('EnemySpawner:newWaveSpawned')

        for (let i = 0; i < this.enemyWavesData.waves[this.waveToSpawn].enemies.length; i++) {
            const enemyType = this.enemyWavesData.waves[this.waveToSpawn].enemies[i];
            console.log('type to spawn ', enemyType)
            this.spawnEnemy(this.enemyTypesData.enemyTypes[enemyType])
        }

        this.waveToSpawn++
        if (this.enemyWavesData.waves[this.waveToSpawn]) this.waveSpawnTimer = this.enemyWavesData.waves[this.waveToSpawn].waveSpawnTimer


    }

    spawnEnemy(enemyType) {
        if (!this.gameInProgress) return

        console.log('enemy spawned ', enemyType)
        this.enemy = new Enemy(this.scene, 0, 0, enemyType.imageKey, enemyType.maximumHealth, enemyType.movementSpeed, enemyType.damage, enemyType.attackSpeed, this.scene.mainScreen.castle)
        this.scene.add.existing(this.enemy)

        this.enemyCount++
    }

    enemyDied() {
        this.enemyCount--
    }
}
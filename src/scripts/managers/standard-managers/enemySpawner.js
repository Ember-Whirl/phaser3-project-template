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

        this.spawnedEnemies = []
        this.nextEnemyID = 0

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
            this.spawnEnemy(this.enemyTypesData.enemyTypes[enemyType])
        }

        this.waveToSpawn++
        if (this.enemyWavesData.waves[this.waveToSpawn]) this.waveSpawnTimer = this.enemyWavesData.waves[this.waveToSpawn].waveSpawnTimer


    }

    spawnEnemy(enemyType) {
        if (!this.gameInProgress) return

        let enemy = new Enemy(this.scene, 0, 0, enemyType.imageKey, enemyType.maximumHealth, enemyType.movementSpeed, enemyType.damage, enemyType.attackSpeed, this.scene.mainScreen.castle, this.nextEnemyID)
        this.scene.add.existing(enemy)

        this.enemyCount++
        this.nextEnemyID++


        this.spawnedEnemies.push(enemy)
    }

    enemyDied(ID) {
        this.enemyCount--
        this.removeEnemyWithID(ID)
    }

    removeEnemyWithID(enemyID) {
        for (let i = 0; i < this.spawnedEnemies.length; i++) {
            const enemy = this.spawnedEnemies[i].enemy
            
            if (enemy.enemyID === enemyID) {
                this.spawnedEnemies.splice(i, 1)
                break
            }
        }
    }
}
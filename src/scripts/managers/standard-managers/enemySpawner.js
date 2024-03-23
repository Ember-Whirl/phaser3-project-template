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

        this.enemyWavesData = this.scene.cache.json.get('enemyWaves')
        this.enemyTypesData = this.scene.cache.json.get('enemyTypes')

        EventManager.instance.add('update', this.update, this)
        EventManager.instance.add('Enemy:enemyDied', this.enemyDied, this)


        this.startWavesFromBeginning()
    }

    update() {
        if (this.waveSpawnTimer > 0) {
            this.waveSpawnTimer -= 1
            if (this.waveSpawnTimer <= 0) {
                this.startNewWave()
            }
        }
    }

    startWavesFromBeginning() {

        console.log(this.enemyTypesData.enemyTypes[0])
        //this.startNewWave()

        this.waveToSpawn = 0
        this.enemyCount = 0
        this.waveSpawnTimer = this.enemyWavesData.waves[this.waveToSpawn].waveSpawnTimer
    }

    startNewWave() {

        for (let i = 0; i < this.enemyWavesData.waves[this.waveToSpawn].enemies.length; i++) {
            const enemyType = this.enemyWavesData.waves[this.waveToSpawn].enemies[i];
            console.log('type to spawn ', enemyType)
            this.spawnEnemy(this.enemyTypesData.enemyTypes[enemyType])
        }

        this.waveToSpawn++
        if (this.enemyWavesData.waves[this.waveToSpawn]) this.waveSpawnTimer = this.enemyWavesData.waves[this.waveToSpawn].waveSpawnTimer


    }

    spawnEnemy(enemyType) {
        console.log('enemy spawned ', enemyType)
        this.enemy = new Enemy(this.scene, 0, 0, enemyType.maximumHealth, enemyType.movementSpeed, enemyType.damage, this.scene.mainScreen.castle, 0)
        this.scene.mainScreen.add(this.enemy)

        this.enemyCount++
    }

    enemyDied() {
        this.enemyCount--
    }
}
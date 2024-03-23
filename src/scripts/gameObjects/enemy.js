import Phaser from 'phaser';
import EventManager from '../managers/standard-managers/eventManager';
import DimensionManager from '../managers/standard-managers/dimensionManager';

export default class Enemy extends Phaser.GameObjects.Container {
    constructor(scene, x, y, maximumHealth, movementSpeed, damagePerHit, attackSpeed, goal) {
        super(scene);
        this.scene = scene
        this.x = x
        this.y = y

        this.maximumHealth = maximumHealth
        this.health = this.maximumHealth
        this.movementSpeed = movementSpeed
        this.damagePerHit = damagePerHit
        this.attackSpeed = attackSpeed
        this.goal = goal
        this.distanceToGoal = 0

        this.attackSpeedCounter = 0

        this.dead = false

        this.spawned = false

        this.createEnemyVisual()

        this.spawn()

        EventManager.instance.add('update', this.update, this)
        EventManager.instance.add('restart', this.killEnemy, this)
        EventManager.instance.add('LevelManager:lostLevel', this.onLevelEnd, this)
        EventManager.instance.add('LevelManager:winLevel', this.onLevelEnd, this)
    }

    createEnemyVisual() {
        this.enemy = this.scene.add.image(0, 0, 'circle');
        this.enemy.setTint(0X00563B)
        this.enemy.setScale(0.5)
        this.enemy.setVisible(false)
        this.add(this.enemy)
    }

    spawn() {
        this.spawned = true
        this.enemy.setVisible(true)
        this.goTowardsGoal()
    }

    goTowardsGoal() {
        this.goal = { x: this.goal.x, y: this.goal.y }
        this.setToStartPosition()
    }

    setToStartPosition() {
        let spawnPosition = this.generateRandomPosition()
        console.log(' position ', spawnPosition)
        this.x = spawnPosition.x
        this.y = spawnPosition.y
    }

    generateRandomPosition() {
        const rectangleWidth = 1280; // adjust as needed
        const rectangleHeight = 720; // adjust as needed
        const offset = this.enemy.width > this.enemy.height ? this.enemy.width + 25 : this.enemy.height + 25

        // Calculate the perimeter of the rectangle
        const perimeter = 2 * (rectangleWidth + rectangleHeight);

        // Generate a random position along the perimeter
        const randomPositionOnPerimeter = Math.random() * perimeter;

        let x, y;

        // Randomly choose whether to place the position on horizontal or vertical sides
        if (randomPositionOnPerimeter < rectangleWidth) {
            // Random position on top or bottom side
            x = randomPositionOnPerimeter;
            y = Math.random() < 0.5 ? 0 : rectangleHeight;
        } else {
            // Random position on left or right side
            y = randomPositionOnPerimeter - rectangleWidth;
            x = Math.random() < 0.5 ? 0 : rectangleWidth;
        }

        // Calculate the distance from the generated point to the rectangle's border
        const distanceToBorderX = x === 0 ? x + offset : rectangleWidth - x + offset;
        const distanceToBorderY = y === 0 ? y + offset : rectangleHeight - y + offset;

        // Adjust the position based on the calculated distance
        if (x === 0) {
            x -= offset;
        } else if (x === rectangleWidth) {
            x += offset;
        }
        if (y === 0) {
            y -= offset;
        } else if (y === rectangleHeight) {
            y += offset;
        }

        return { x, y: Math.min(y, rectangleHeight + offset) };
    }

    update() {
        if (this.spawned && !this.dealingDamage) {
            this.moveTowardsGoal()
        }

        if (this.dealingDamage) this.attackSpeedCounter++

        if (this.dealingDamage && this.attackSpeedCounter >= (this.attackSpeed * 60)) {
            EventManager.instance.dispatch('Enemy:hittingCastle', this.damagePerHit)
            this.attackSpeedCounter = 0
        }
    }

    moveTowardsGoal() {
        let direction = this.calculateDirection(this, this.goal)
        let distance = this.calculateDistance(direction)
        if (this.goalReached(distance)) this.onGoalReached()
        else {
            let newPosition = this.getNewPostion(this, direction, distance, this.movementSpeed)
            this.velocity = this.calculateRequiredVelocity(this, this.goal, this.movementSpeed)
            this.setNewPosition(this, newPosition)
            this.distanceToGoal = this.getDistanceToGoal()
        }
    }

    calculateDirection(object, target) {
        const directionX = target.x - object.x;
        const directionY = target.y - object.y;

        return { x: directionX, y: directionY }
    }

    calculateDistance(direction) {
        return Math.sqrt(direction.x ** 2 + direction.y ** 2);
    }

    goalReached(distance) {
        return distance <= 50
    }

    onGoalReached() {
        this.dealingDamage = true
    }

    setNewPosition(object, newPosition) {
        object.x = newPosition.x;
        object.y = newPosition.y;
    }

    getNormalizedVector(direction, distance) {
        const normalizedDirectionX = direction.x / distance;
        const normalizedDirectionY = direction.y / distance;

        return { x: normalizedDirectionX, y: normalizedDirectionY }
    }

    getNewPostion(object, direction, distance, speed) {
        let normalizedDirection = this.getNormalizedVector(direction, distance)

        const newX = object.x + normalizedDirection.x * speed;
        const newY = object.y + normalizedDirection.y * speed;

        return { x: newX, y: newY }
    }

    calculateRequiredVelocity(objectA, objectB, speed) {
        // Calculate the relative velocity needed to close the gap
        const relativeVelocityX = objectB.x - objectA.x;
        const relativeVelocityY = objectB.y - objectA.y;

        // Calculate the distance between the two objects
        const distance = Math.sqrt(relativeVelocityX ** 2 + relativeVelocityY ** 2);

        // Calculate the time needed to reach objectB
        const timeToReach = distance / speed;

        // Calculate the required velocity components
        const requiredVelocityX = relativeVelocityX / timeToReach;
        const requiredVelocityY = relativeVelocityY / timeToReach;

        return {
            x: requiredVelocityX,
            y: requiredVelocityY,
        };
    }

    dealDamage(damage, index) {
        if (this.dead) return

        this.health -= damage
        this.checkHealth(index)
    }

    checkHealth(index) {
        if (this.health <= 0) {
            //this.levelEnemies.splice(index, 1)
            EventManager.instance.dispatch('Enemy:isKilled')
            this.killEnemy()
        }
    }

    removeAllEvents() {
        EventManager.instance.remove('update', this.update, this)
        EventManager.instance.remove('LevelManager:lostLevel', this.onLevelEnd, this)
        EventManager.instance.remove('LevelManager:winLevel', this.onLevelEnd, this)
    }

    getDistanceToGoal() {
        let direction = this.calculateDirection(this, this.goal)
        let distance = this.calculateDistance(direction)

        return distance
    }

    isOutOfScreen() {
        return (this.x < 0 || this.y < 0 || this.x > DimensionManager.instance.width || this.y > DimensionManager.instance.heigth)
    }

    onLevelEnd() {
        this.killEnemy()
    }

    killEnemy() {
        EventManager.instance.dispatch('Enemey:enemyDied')
        this.removeAllEvents()
        this.destroy(true)
        this.dead = true
    }
}
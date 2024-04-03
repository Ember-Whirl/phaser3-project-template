import Phaser from 'phaser';
import EventManager from '../managers/standard-managers/eventManager';
import DimensionManager from '../managers/standard-managers/dimensionManager';
import EnemySpawner from '../managers/standard-managers/enemySpawner';
import DamageDealtFeedback from '../userInterfaceObjects/damageDealtFeedback';

export default class Warrior extends Phaser.GameObjects.Container {
    constructor(scene, x, y, spineKey, weapon, maximumHealth, movementSpeed, damagePerHit, attackSpeed, range, spawnPosition, id) {
        super(scene);
        this.scene = scene
        this.x = x
        this.y = y

        this.spineKey = spineKey

        this.maximumHealth = maximumHealth
        this.health = this.maximumHealth
        this.movementSpeed = movementSpeed
        this.damagePerHit = damagePerHit
        this.attackSpeed = attackSpeed
        this.range = range
        this.spawnPosition = spawnPosition
        this.id = id

        this.attackSpeedCounter = 0

        this.dead = false

        this.spawned = false
        this.dragging = false
        this.enemySpotted = false

        this.createWarriorVisual()

        this.spawn()

        this.warrior.setInteractive()

        this.warrior.on(Phaser.Input.Events.POINTER_DOWN, this.startDrag, this)

        //this.showRange()
        EventManager.instance.add('update', this.update, this)
        EventManager.instance.add('restart', this.killWarrior, this)
        EventManager.instance.add('LevelManager:lostLevel', this.onLevelEnd, this)
        EventManager.instance.add('LevelManager:winLevel', this.onLevelEnd, this)
    }

    createWarriorVisual() {
        this.warrior = this.scene.add.spine(0, 0, this.spineKey)
        this.add(this.warrior)

        this.warrior.setAttachment('weapon-select', 'weapon-000')
    }

    startDrag(pointer) {
        this.dragging = true
        this.pointer = pointer

        this.removeSpottedEnemy()

        this.warrior.off(Phaser.Input.Events.POINTER_DOWN, this.startDrag, this)
        this.warrior.on(Phaser.Input.Events.POINTER_UP, this.stopDrag, this)
    }

    stopDrag() {
        this.dragging = false
        this.pointer = null

        this.warrior.on(Phaser.Input.Events.POINTER_DOWN, this.startDrag, this)
        this.warrior.off(Phaser.Input.Events.POINTER_UP, this.stopDrag, this)
    }

    spawn() {
        this.spawned = true
        this.warrior.setVisible(true)
        this.setToStartPosition()
        this.goTowardsGatherPoint()
    }

    goTowardsGatherPoint() {
        this.gatherPoint = { x: 100, y: 100 }
        this.goal = this.gatherPoint
    }

    setToStartPosition() {
        this.x = this.spawnPosition.x - 15
        this.y = this.spawnPosition.y + 40
    }

    generateRandomPosition() {
        const rectangleWidth = 1280; // adjust as needed
        const rectangleHeight = 720; // adjust as needed
        const offset = this.warrior.width > this.warrior.height ? this.warrior.width + 25 : this.warrior.height + 25

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
        if (this.dead) {
            console.log('warrior updating while dead')
            return
        }

        if (this.dragging && this.pointer) {
            this.x = this.pointer.x
            this.y = this.pointer.y
            this.animationSwitcher('Run')
        }

        if (!this.enemySpotted && !this.dragging) {
            let enemyToAttack = null

            if (this.spawned && !this.enemySpotted && !this.dealingDamage){
                this.animationSwitcher('Run')
            }

            for (let i = 0; i < EnemySpawner.instance.spawnedEnemies.length; i++) {
                const enemy = EnemySpawner.instance.spawnedEnemies[i]

                if (this.isInRange(enemy) && !enemy.isOutOfScreen()) {

                    if (!enemyToAttack || enemyToAttack && this.getDistance(this, enemyToAttack) > this.getDistance(this, enemy)) {
                        enemyToAttack = enemy
                    }
                }
            }

            if (enemyToAttack) this.spotEnemy(enemyToAttack)
        }

        if (this.spawned && this.enemySpotted && !this.dealingDamage && !this.dragging) {
            this.animationSwitcher('Run')
            this.moveTowardsGoal()
        }

        if (this.dealingDamage && this.enemySpotted && this.spottedEnemy) {
            this.attackSpeedCounter++
            this.animationSwitcher('Attack')

            if (this.attackSpeedCounter > (this.attackSpeed * 60)) {
                this.attackSpeedCounter = 0
                console.log('warrior deals damage!')
                this.spottedEnemy.dealDamage(this.damagePerHit, this)
            }
        }

        this.setDepth(this.y)
    }

    animationSwitcher(newAnimationToStart) {

        if (newAnimationToStart === this.currentAnimation) {
            //console.log('test ', this.warrior)
            console.log('warrior, setting', this.id)
            this.warrior.setAttachment('weapon-select', 'weapon-000')
            return
        } 

        switch (newAnimationToStart) {
            case 'Attack':
                this.warrior.play('Attack', true)
                this.warrior.setAttachment('weapon-select', 'weapon-000')

                this.currentAnimation = newAnimationToStart
                break;
            case 'Run':
                this.warrior.play('Run', true)
                this.warrior.setAttachment('weapon-select', 'weapon-000')
                this.currentAnimation = newAnimationToStart
                break;
            default:
                console.warn('animation does not exist ', newAnimationToStart)
                break;
        }
    }

    spotEnemy(enemyToAttack) {
        this.spottedEnemy = enemyToAttack
        this.enemySpotted = true
        this.goal = this.spottedEnemy
        this.spottedEnemy.setSpotted(true, this)
    }

    removeSpottedEnemy() {
        if (!this.spottedEnemy) return
        this.spottedEnemy.stopAttacking()
        this.enemySpotted = false
        this.dealingDamage = false
        this.goal = null
        this.spottedEnemy.setSpotted(false, this)
        this.spottedEnemy = null
    }

    setEnemyKilled() {
        this.removeSpottedEnemy()
    }

    isInRange(enemy) {
        return this.getDistance(this.getWorldPosition(this, { x: this.x, y: this.y }), this.getWorldPosition(enemy, { x: enemy.x, y: enemy.y })) < this.range
    }

    getWorldPosition(target, positionToAddTo = { x: 0, y: 0 }) {
        if (target.parentContainer) {
            positionToAddTo.x += target.parentContainer.x
            positionToAddTo.y += target.parentContainer.y
            return this.getWorldPosition(target.parentContainer, positionToAddTo)
        }
        else return positionToAddTo
    }

    getDistance(object, target) {
        let direction = this.calculateDirection(object, target)
        return this.calculateDistance(direction)
    }

    moveTowardsGoal() {
        let direction = this.calculateDirection(this, this.goal)

        if (direction.x < 0) this.warrior.setScale(-1, 1)
        if (direction.x > 0) this.warrior.setScale(1, 1)

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
        return distance <= 30
    }

    onGoalReached() {
        this.dealingDamage = true
        this.spottedEnemy.setAttacking(this)
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

    dealDamage(damage, damageDealer) {
        if (this.dead) return

        let feedback = new DamageDealtFeedback(this.scene, 0, -30, damage, 'Red')
        this.add(feedback)

        console.log('warrior hit!!!, ', damage, this.health - damage, this.id)

        this.health -= damage
        this.checkHealth(damageDealer)
    }

    checkHealth(damageDealer) {
        if (this.health <= 0) {
            console.log('kill warrior ', this.id)
            damageDealer.stopAttacking()
            this.killWarrior()
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
        this.killWarrior()
    }

    killWarrior() {
        console.log('warrior dead', this.id)
        this.removeAllEvents()
        this.destroy(true)
        this.dead = true
    }

    showRange() {
        this.spot = this.scene.add.image(-this.range, 0, 'circle');
        this.spot.setTint(0Xfffff)
        this.spot.setScale(0.5)
        this.add(this.spot)

        this.spot1 = this.scene.add.image(this.range, 0, 'circle');
        this.spot1.setTint(0Xfffff)
        this.spot1.setScale(0.5)
        this.add(this.spot1)

        this.spot2 = this.scene.add.image(0, -this.range, 'circle');
        this.spot2.setTint(0Xfffff)
        this.spot2.setScale(0.5)
        this.add(this.spot2)

        this.spot3 = this.scene.add.image(0, this.range, 'circle');
        this.spot3.setTint(0Xfffff)
        this.spot3.setScale(0.5)
        this.add(this.spot3)

        // console.log(this.getDistance(this, this.spot))
    }
}
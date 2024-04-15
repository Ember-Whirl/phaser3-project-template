import Phaser from 'phaser';
import EventManager from '../managers/standard-managers/eventManager';
import DimensionManager from '../managers/standard-managers/dimensionManager';
import DamageDealtFeedback from '../userInterfaceObjects/damageDealtFeedback';

export default class Enemy extends Phaser.GameObjects.Container {
    constructor(scene, x, y, spineKey, attachments, maximumHealth, movementSpeed, damagePerHit, attackSpeed, goal, enemyID) {
        super(scene);
        this.scene = scene
        this.x = x
        this.y = y

        this.spineKey = spineKey
        this.attachments = attachments

        this.maximumHealth = maximumHealth
        this.health = this.maximumHealth
        this.movementSpeed = movementSpeed
        this.damagePerHit = damagePerHit
        this.attackSpeed = attackSpeed
        this.ultimateGoal = goal
        this.goal = this.ultimateGoal
        this.distanceToGoal = 0
        this.enemyID = enemyID

        this.attackSpeedCounter = 0

        this.dead = false

        this.spawned = false

        this.spotted = false

        this.createEnemyVisual()
        this.setAttachments()
        this.setAnimationMixes()

        this.spawn()

        EventManager.instance.add('update', this.update, this)
        EventManager.instance.add('restart', this.killEnemy, this)
        EventManager.instance.add('LevelManager:lostLevel', this.onLevelEnd, this)
        EventManager.instance.add('LevelManager:winLevel', this.onLevelEnd, this)
    }

    createEnemyVisual() {
        this.enemy = this.scene.add.spine(0, 0, this.spineKey)
        this.add(this.enemy)
    }

    setAttachments() {
        this.enemy.setAttachment('r-eye', this.attachments.rightEye)
        this.enemy.setAttachment('l-eye', this.attachments.leftEye)
        this.enemy.setAttachment('head', this.attachments.head)
        this.enemy.setAttachment('body', this.attachments.body)
    }

    setAnimationMixes() {
        const animations = this.enemy.skeletonData.animations

        for (let i = 0; i < animations.length; i++) {
            for (let j = 0; j < animations.length; j++) {
                this.enemy.setMix(animations[i].name, animations[j].name, 0.05)

            }
        }
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
        if (this.dead) {
            console.log('enemy updating while dead')
            return
        }

        // this.setAttachments()


        if (this.spawned && !this.dealingDamage && !this.reachedUltimateGoal) {
            this.animationSwitcher('Run')
            this.moveTowardsGoal()
            this.attackSpeedCounter = 0
        }

        if (this.reachedUltimateGoal) {
            this.attackSpeedCounter++
            this.animationSwitcher('Attack')

            if (this.attackSpeedCounter >= (this.attackSpeed * 60)) {
                EventManager.instance.dispatch('Enemy:hittingCastle', this.damagePerHit)
                this.attackSpeedCounter = 0
            }
        }



        if (!this.reachedUltimateGoal && this.dealingDamage && this.warriorToAttack) {
            this.attackSpeedCounter++
            this.animationSwitcher('Attack')

            if (this.attackSpeedCounter >= (this.attackSpeed * 60)) {
                this.attackSpeedCounter = 0
                this.warriorToAttack.dealDamage(this.damagePerHit, this)
            }
        }

        this.setDepth(this.y)
    }

    animationSwitcher(newAnimationToStart) {

        if (newAnimationToStart === this.currentAnimation) {
            this.setAttachments()
            return
        }

        switch (newAnimationToStart) {
            case 'Run':
                this.setAttachments()
                this.enemy.play('Run', true)
                this.currentAnimation = newAnimationToStart
                break;
            case 'Attack':
                this.setAttachments()
                this.enemy.play('Attack', true)
                this.currentAnimation = newAnimationToStart
                break;
            case 'Death':
                this.setAttachments()
                this.enemy.play('Death', false)
                this.currentAnimation = newAnimationToStart
                break;
            default:
                this.setAttachments()
                console.warn('animation does not exist ', newAnimationToStart)
                break;
        }
    }

    setSpotted(spotted, warrior) {
        if (this.reachedUltimateGoal) return
        this.spotted = spotted
        if (this.spotted) this.goal = warrior
        if (!this.spotted) this.goal = this.ultimateGoal
    }

    setAttacking(warrior) {
        if (this.dealingDamage) return
        this.warriorToAttack = warrior
        this.dealingDamage = true
    }

    stopAttacking() {
        this.warriorToAttack = null
        this.dealingDamage = false
        this.setSpotted(false)
    }

    moveTowardsGoal() {
        let direction = this.calculateDirection(this, this.goal)

        if (direction.x < 0) this.enemy.setScale(1, 1)
        if (direction.x > 0) this.enemy.setScale(-1, 1)

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
        let isWithinDistance = false

        if (!this.spotted) isWithinDistance = distance <= 50
        if (this.spotted) isWithinDistance = distance <= 30

        return isWithinDistance
    }

    onGoalReached() {
        if (!this.spotted) this.reachedUltimateGoal = true
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

        console.log('enemy hit! , ', damage, this.health - damage)

        let feedback = new DamageDealtFeedback(this.scene, 0, -30, damage, 'Blue')
        this.add(feedback)

        this.health -= damage
        this.checkHealth(damageDealer)
    }

    checkHealth(damageDealer) {
        if (this.health <= 0) {
            damageDealer.setEnemyKilled()
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
        this.killEnemy(false)
    }

    async killEnemy(playAnimation = true) {
        EventManager.instance.dispatch('Enemy:enemyDied', this.enemyID)
        this.dead = true
        if (playAnimation) {
            this.animationSwitcher('Death')
            await ApiAdapter.instance.awaitForTime(this.warrior.findAnimation('Death').duration * 1000)
        }
        this.destroyEnemy()

    }

    destroyEnemy() {
        this.removeAllEvents()
        this.destroy(true)
    }

    getWorldPosition(target, positionToAddTo = { x: 0, y: 0 }) {
        if (target.parentContainer) {
            positionToAddTo.x += target.parentContainer.x
            positionToAddTo.y += target.parentContainer.y
            return this.getWorldPosition(target.parentContainer, positionToAddTo)
        }
        else return positionToAddTo
    }
}
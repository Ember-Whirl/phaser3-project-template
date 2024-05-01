import Phaser from 'phaser';
import EventManager from '../managers/standard-managers/eventManager';
import DimensionManager from '../managers/standard-managers/dimensionManager';
import EnemySpawner from '../managers/standard-managers/enemySpawner';
import DamageDealtFeedback from '../userInterfaceObjects/damageDealtFeedback';
import WarriorSpawner from '../managers/standard-managers/warriorSpawner';
import ApiAdapter from '../adapter/apiAdapter';
import HealthBar from './UI/healthBar';

export default class Warrior extends Phaser.GameObjects.Container {
    constructor(scene, x, y, spineKey, maximumHealth, movementSpeed, damagePerHit, attackSpeed, range, attachments, spawnPosition, positionToReturnTo, xScale, warriorID, warriorLevel, fromMerge) {
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
        this.xScale = xScale
        this.attachments = attachments
        this.warriorID = warriorID
        this.warriorLevel = warriorLevel
        this.merging = fromMerge

        this.attackSpeedCounter = 0
        this.mergeRange = 35
        this.warriorToMergeWith = null
        this.dragOffset = 30

        this.positionToReturnTo = positionToReturnTo

        this.dead = false

        this.spawned = false
        this.dragging = false
        this.enemySpotted = false

        this.createWarriorVisual(xScale)
        this.setAttachments(false)
        this.setAnimationMixes()
        this.createHealthBar()

        this.createRange(this.mergeRange)
        this.showRange(false)

        this.spawn()

        this.warrior.setInteractive()

        this.warrior.on(Phaser.Input.Events.POINTER_DOWN, this.startDrag, this)

        //this.showRange()
        EventManager.instance.add('update', this.update, this)
        EventManager.instance.add('gameEnd', this.killWarrior, this)
        EventManager.instance.add('LevelManager:lostLevel', this.onLevelEnd, this)
        EventManager.instance.add('LevelManager:winLevel', this.onLevelEnd, this)
    }

    createWarriorVisual(xScale) {
        this.mergeFX = this.scene.add.spine(0, 25, 'merge')
        this.add(this.mergeFX)
        this.mergeFX.setVisible(false)

        this.warrior = this.scene.add.spine(0, 0, this.spineKey)
        this.warrior.setScale(xScale, 1)
        this.add(this.warrior)
    }

    setAttachments(isAttack, isMerge = false) {
        this.warrior.setAttachment('weapon-select', this.attachments.weapon)
        this.warrior.setAttachment('shield-select', this.attachments.shield)
        this.warrior.setAttachment('body', this.attachments.body)
        this.warrior.setAttachment('arm-front', this.attachments.armFront)
        this.warrior.setAttachment('r-leg', this.attachments.rightLeg)
        this.warrior.setAttachment('l-leg', this.attachments.leftLeg)
        this.warrior.setAttachment('head', this.attachments.head)


        if (this.attachments.shield === null) this.attackAnimation = 'Attack'
        if (this.attachments.shield !== null) this.attackAnimation = 'AttackShield'

        if (isAttack) this.warrior.setAttachment('slash', 'slash')
        if (!isAttack) this.warrior.setAttachment('slash', null)

        if (isMerge) {
            this.mergeFX.setVisible(true)
        }
        if (!isMerge) {
            this.mergeFX.setVisible(false)
        }
    }

    setAnimationMixes() {
        const animations = this.warrior.skeletonData.animations

        for (let i = 0; i < animations.length; i++) {
            for (let j = 0; j < animations.length; j++) {
                this.warrior.setMix(animations[i].name, animations[j].name, 0.125)

            }
        }
    }

    createHealthBar() {
        this.healthBar = new HealthBar(this.scene, 0, -50, 'green')
        this.add(this.healthBar)
    }

    startDrag(pointer) {
        if (this.merging) return

        this.healthBar.setVisible(false)

        this.dragging = true
        this.pointer = pointer

        this.removeSpottedEnemy()

        this.warrior.off(Phaser.Input.Events.POINTER_DOWN, this.startDrag, this)
        this.warrior.on(Phaser.Input.Events.POINTER_UP, this.stopDrag, this)
    }

    stopDrag() {
        this.healthBar.setVisible(true)

        this.positionToReturnTo = { x: this.x, y: this.y }
        this.y += this.dragOffset

        this.checkMerge()

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
        this.x = this.spawnPosition.x
        this.y = this.spawnPosition.y
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
            this.setAttachments(false)
            return
        }

        if (this.merging) {
            this.animationSwitcher('Merge')
            this.setDepth(this.y)
            return
        }

        if (this.dragging && this.pointer) {
            this.setDepth(5000)

            this.x = this.pointer.x
            this.y = this.pointer.y
            this.animationSwitcher('Drag')

            this.warriorToMergeWith = null

            for (let i = 0; i < WarriorSpawner.instance.spawnedWarriors.length; i++) {
                const warrior = WarriorSpawner.instance.spawnedWarriors[i]

                if (this.warriorID === warrior.warriorID) continue

                if (this.isInMergeRange(warrior)) {
                    if (!this.warriorToMergeWith && this.warriorLevel === warrior.warriorLevel || (this.warriorToMergeWith && this.getDistance(this, this.warriorToMergeWith) > this.getDistance(this, warrior)) && this.warriorLevel === warrior.warriorLevel) {
                        this.warriorToMergeWith = warrior
                        //debug
                        this.showRange(true)
                    }
                }
            }

            //debug
            if (this.warriorToMergeWith === null) this.showRange(false)

        }

        if (this.spawned && !this.goal && !this.dragging && !this.enemySpotted && !this.dealingDamage) {
            this.animationSwitcher('Idle')
        }

        if (!this.enemySpotted && !this.dragging) {
            let enemyToAttack = null

            for (let i = 0; i < EnemySpawner.instance.spawnedEnemies.length; i++) {
                const enemy = EnemySpawner.instance.spawnedEnemies[i]

                if (this.isInRange(enemy) && !enemy.isOutOfScreen()) {

                    if (!enemyToAttack || (enemyToAttack && this.getDistance(this, enemyToAttack) > this.getDistance(this, enemy))) {
                        enemyToAttack = enemy
                    }
                }
            }

            if (enemyToAttack) this.spotEnemy(enemyToAttack)
        }

        if (this.spawned && this.goal && this.enemySpotted && !this.dealingDamage && !this.dragging) {
            this.animationSwitcher('Run')
            this.moveTowardsGoal()
        }

        if (this.spawned && this.goal && !this.enemySpotted && !this.dealingDamage && !this.dragging) {
            this.animationSwitcher('Run')
            if (this.goal !== this.positionToReturnTo) this.goal = this.positionToReturnTo
            this.moveTowardsGoal()
        }

        if (this.dealingDamage && this.enemySpotted) {
            if (!this.spottedEnemy || this.spottedEnemy.dead) {
                this.setEnemyKilled()
            }

            if (this.spottedEnemy) {
                this.attackSpeedCounter++
                this.animationSwitcher(this.attackAnimation)
                this.spottedEnemy.setAttacking(this)

                if (this.attackSpeedCounter > (this.attackSpeed * 60)) {
                    this.attackSpeedCounter = 0
                    this.spottedEnemy.dealDamage(this.damagePerHit, this)
                }
            }
        }

        if (!this.dragging) this.setDepth(this.y)
    }

    checkMerge() {
        if (this.warriorToMergeWith) WarriorSpawner.instance.mergeWarriors(this, this.warriorToMergeWith)
    }

    animationSwitcher(newAnimationToStart) {
        if (newAnimationToStart === this.currentAnimation) {
            let isAttack = this.currentAnimation === 'Attack' || this.currentAnimation === 'AttackShield'
            let isMerge = this.currentAnimation === 'Merge'
            this.setAttachments(isAttack, isMerge)
            return
        }

        // on drag remove shadow
        switch (newAnimationToStart) {
            case 'Merge':
                this.warrior.y = 0
                this.setAttachments(false, true)
                this.warrior.play('Merge', false, true)
                this.mergeFX.play('animation', false, true)
                this.currentAnimation = newAnimationToStart
                this.startMergeCountDown()
                break;
            case 'Attack':
                this.warrior.y = 0
                this.setAttachments(true)
                this.warrior.play('Attack', true, true)
                this.currentAnimation = newAnimationToStart
                break;
            case 'AttackShield':
                this.warrior.y = 0
                this.setAttachments(true)
                this.warrior.play('AttackShield', true, true)
                this.currentAnimation = newAnimationToStart
                break;
            case 'Run':
                this.warrior.y = 0
                this.setAttachments(false)
                this.warrior.play('Run', true, true)
                this.currentAnimation = newAnimationToStart
                break;
            case 'Idle':
                this.warrior.y = 0
                this.setAttachments(false)
                this.warrior.play('Idle', true, true)
                this.currentAnimation = newAnimationToStart
                break;
            case 'Drag':
                this.warrior.y = this.dragOffset
                this.setAttachments(false)
                this.warrior.play('Drag', true, true)
                this.currentAnimation = newAnimationToStart
                break;
            case 'Death':
                this.warrior.y = 0
                this.setAttachments(false)
                this.warrior.play('Death', false, true)
                this.currentAnimation = newAnimationToStart
                break;
            default:
                console.warn('animation does not exist ', newAnimationToStart)
                break;
        }
    }

    async startMergeCountDown() {
        await ApiAdapter.instance.awaitForTime(this.warrior.findAnimation('Merge').duration * 1000)
        this.merging = false
        this.goal = null
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
        this.goal = this.positionToReturnTo
        this.spottedEnemy.setSpotted(false, this)
        this.spottedEnemy = null
    }

    setEnemyKilled() {
        this.removeSpottedEnemy()
    }

    isInRange(enemy) {
        return this.getDistance(this.getWorldPosition(this, { x: this.x, y: this.y }), this.getWorldPosition(enemy, { x: enemy.x, y: enemy.y })) < this.range
    }

    isInMergeRange(warrior) {
        return this.getDistance(this.getWorldPosition(this, { x: this.x, y: this.y }), this.getWorldPosition(warrior, { x: warrior.x, y: warrior.y })) < this.mergeRange

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

        if (direction.x < 0) {
            this.warrior.setScale(-1, 1)
            this.healthBar.x = -20
            this.healthBar.y = -50
        } 
        if (direction.x > 0) {
            this.warrior.setScale(1, 1)
            this.healthBar.x = -15
            this.healthBar.y = -50
        } 

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

        
        if (this.goal === this.positionToReturnTo) {
            return distance <= 5
        }

        if (this.goal !== this.positionToReturnTo) {
            return distance <= 70
        }

    }

    onGoalReached() {

        if (this.goal === this.positionToReturnTo) {
            this.goal = null
            return
        }

        if (this.goal !== this.positionToReturnTo) {
            this.dealingDamage = true
            this.spottedEnemy.setAttacking(this)
            return
        }
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

        this.health -= damage
        this.checkHealth(damageDealer)
    }

    checkHealth(damageDealer) {
        if (this.health <= 0) {
            damageDealer.stopAttacking()
            this.killWarrior()
        }
    }

    removeAllEvents() {
        EventManager.instance.remove('update', this.update, this)
        EventManager.instance.remove('LevelManager:lostLevel', this.onLevelEnd, this)
        EventManager.instance.remove('LevelManager:winLevel', this.onLevelEnd, this)
        this.warrior.off(Phaser.Input.Events.POINTER_DOWN, this.startDrag, this)
        this.warrior.off(Phaser.Input.Events.POINTER_UP, this.stopDrag, this)
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
        this.killWarrior(false)
    }

    async killWarrior(playAnimation = true) {
        WarriorSpawner.instance.warriorDied(this.warriorID)
        this.dead = true
        if (playAnimation) {
            this.animationSwitcher('Death')
            await ApiAdapter.instance.awaitForTime(this.warrior.findAnimation('Death').duration * 1000)
        }
        this.destroyWarrior()

    }

    destroyWarrior() {
        this.removeAllEvents()
        this.destroy(true)
    }

    createRange(range) {
        this.spot0 = this.scene.add.image(-range, 0, 'circle');
        this.spot0.setTint(0Xfffff)
        this.spot0.setScale(0.5)
        this.add(this.spot0)

        this.spot1 = this.scene.add.image(range, 0, 'circle');
        this.spot1.setTint(0Xfffff)
        this.spot1.setScale(0.5)
        this.add(this.spot1)

        this.spot2 = this.scene.add.image(0, -range, 'circle');
        this.spot2.setTint(0Xfffff)
        this.spot2.setScale(0.5)
        this.add(this.spot2)

        this.spot3 = this.scene.add.image(0, range, 'circle');
        this.spot3.setTint(0Xfffff)
        this.spot3.setScale(0.5)
        this.add(this.spot3)

        // console.log(this.getDistance(this, this.spot))
    }

    showRange(show) {
        this.spot0.setVisible(show)
        this.spot1.setVisible(show)
        this.spot2.setVisible(show)
        this.spot3.setVisible(show)
    }
    
}
import Phaser from 'phaser';
import EventManager from '../managers/standard-managers/eventManager';
import DimensionManager from '../managers/standard-managers/dimensionManager';

export default class Warrior extends Phaser.GameObjects.Container {
    constructor(scene, x, y, imageKey, maximumHealth, movementSpeed, damagePerHit, attackSpeed, spawnPosition) {
        super(scene);
        this.scene = scene
        this.x = x
        this.y = y

        this.imageKey = imageKey

        this.maximumHealth = maximumHealth
        this.health = this.maximumHealth
        this.movementSpeed = movementSpeed
        this.damagePerHit = damagePerHit
        this.attackSpeed = attackSpeed
        this.spawnPosition = spawnPosition

        this.attackSpeedCounter = 0

        this.dead = false

        this.spawned = false
        this.dragging = false


        this.createWarriorVisual()

        this.spawn()

        console.log('here', this)

        this.warrior.setInteractive()


        this.warrior.on(Phaser.Input.Events.POINTER_DOWN, this.startDrag, this)


        EventManager.instance.add('update', this.update, this)
        EventManager.instance.add('restart', this.killWarrior, this)
        EventManager.instance.add('LevelManager:lostLevel', this.onLevelEnd, this)
        EventManager.instance.add('LevelManager:winLevel', this.onLevelEnd, this)
    }

    createWarriorVisual() {
        this.warrior = this.scene.add.image(0, 0, this.imageKey);
        this.warrior.setScale(1)
        this.warrior.setVisible(false)
        this.add(this.warrior)
    }

    startDrag(pointer) {
        console.log('start drag')

        this.dragging = true
        this.pointer = pointer

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
        if (this.spawned && !this.dealingDamage && !this.dragging) {
            this.moveTowardsGoal()
        }

        if (this.dragging && this.pointer){
            this.x = this.pointer.x
            this.y = this.pointer.y
        }


        // if (this.dealingDamage) this.attackSpeedCounter++

        // if (this.dealingDamage && this.attackSpeedCounter >= (this.attackSpeed * 60)) {
        //     this.attackSpeedCounter = 0
        // }
        this.setDepth(this.y)
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
        return distance <= 1
    }

    onGoalReached() {
        //this.dealingDamage = true
        this.goal = this.spawnPosition
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
        this.removeAllEvents()
        this.destroy(true)
        this.dead = true
    }
}
import Phaser from 'phaser';
import EventManager from '../managers/standard-managers/eventManager';
import DimensionManager from '../managers/standard-managers/dimensionManager';
import DamageDealtFeedback from '../userInterfaceObjects/damageDealtFeedback';
import ApiAdapter from '../adapter/apiAdapter';
import HealthBar from './UI/healthBar';
import Enemy from './enemy';

export default class Slime extends Enemy {
    constructor(scene, x, y, spineKey, attachments, maximumHealth, movementSpeed, damagePerHit, attackSpeed, goal, enemyID) {
        super(scene, x, y, spineKey, attachments, maximumHealth, movementSpeed, damagePerHit, attackSpeed, goal, enemyID)

        this.scene = scene
        this.x = 0
        this.y = 0

        this.spineKey = spineKey
        this.attachments = attachments

       // this.createEnemyVisual()
        this.setAttachments()
        this.setAnimationMixes()
    }

    createEnemyVisual() {
        this.spine = this.scene.add.spine(0, 0, this.spineKey)
        this.add(this.spine)
    }

    setAttachments(isDeath = false) {
        this.spine.setAttachment('r-eye', this.attachments.rightEye)
        this.spine.setAttachment('l-eye', this.attachments.leftEye)
        this.spine.setAttachment('head', this.attachments.head)
        this.spine.setAttachment('body', this.attachments.body)

        if (isDeath) {
            this.healthBar.setVisible(false)
        }
        if (!isDeath) {
            this.healthBar.setVisible(true)
        }
    }

    setAnimationMixes() {
        const animations = this.spine.skeletonData.animations

        for (let i = 0; i < animations.length; i++) {
            for (let j = 0; j < animations.length; j++) {
                this.spine.setMix(animations[i].name, animations[j].name, 0.05)
            }
        }
    }
}
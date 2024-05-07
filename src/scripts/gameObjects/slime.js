import Enemy from './enemy';

export default class Slime extends Enemy {
    constructor(scene, x, y, spineKey, attachments, maximumHealth, movementSpeed, damagePerHit, attackSpeed, goal, enemyID) {
        super(scene, x, y, spineKey, attachments, maximumHealth, movementSpeed, damagePerHit, attackSpeed, goal, enemyID)

        this.scene = scene

        this.spineKey = spineKey
        this.attachments = attachments

        this.setAttachments()
        this.setAnimationMixes()
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
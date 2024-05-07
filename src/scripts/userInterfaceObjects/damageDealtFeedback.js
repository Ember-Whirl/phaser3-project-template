import Phaser from 'phaser';
import Text from '../text';
import { ETextStyle } from '../ETextStyles';

export default class DamageDealtFeedback extends Phaser.GameObjects.Container {
    constructor(scene, x, y, damageAmount, color) {
        super(scene);
        this.scene = scene
        this.x = x
        this.y = y
        this.damageAmount = damageAmount
        this.color = color

        this.createText()
        this.createTweens()

    }

    createText() {
        let textStyle = ETextStyle.GAMEPLAYVALUES
        if (this.color === 'Red') textStyle = ETextStyle.FEEDBACKRED
        if (this.color === 'Blue') textStyle = ETextStyle.FEEDBACKBLUE

        this.damageText = new Text(this.scene, 0, 0, this.damageAmount.toString(), textStyle)
        this.add(this.damageText)
    }

    createTweens() {
        let duration = 900

        let minPosition = -100
        let maxPosition = 100
        let targetX = Math.random() * (maxPosition - minPosition) + minPosition

        this.positionXTween = this.scene.tweens.add({
            targets: [this.damageText],
            props: {
                x: { value: targetX, loop: 0, duration: duration, yoyo: false, ease: 'easeInOut' },
            },
            delay: 0,
            yoyo: false,
            onStart: () => {

            },
            onComplete: () => {

            }
        })

        let targetY = -50

        this.positionYTween = this.scene.tweens.add({
            targets: [this.damageText],
            props: {
                y: { value: targetY, loop: 0, duration: duration, yoyo: false, ease: 'easeInOut' },
            },
            delay: 0,
            yoyo: false,
            onStart: () => {

            },
            onComplete: () => {

            }
        })


        let rotationTarget = 65
        if (targetX > 0) rotationTarget *= -1

        this.rotateTween = this.scene.tweens.add({
            targets: [this.damageText],
            props: {
                angle: { value: rotationTarget, loop: 0, duration: duration, yoyo: false, ease: 'easeInOut' },
            },

            delay: 0,
            yoyo: false,
            onStart: () => {

            },
            onComplete: () => {

            }
        })

        this.alphaTween = this.scene.tweens.add({
            targets: [this.damageText],
            props: {
                alpha: { value: 0, loop: 0, duration: duration, yoyo: false, ease: 'easeInOut' },
            },
            delay: 0,
            yoyo: false,
            onComplete: () => {
                this.destroy()
            }
        })
    }

    createMultiplePositionTweens(tweenPositions, duration) {

        for (let i = 0; i < tweenPositions.length; i++) {
            let nextTweenPosition = tweenPositions[i]

            let positionYTween = this.scene.tweens.add({
                targets: [this.damageText],
                props: {
                    y: { value: nextTweenPosition, loop: 0, duration: duration / tweenPositions.length, yoyo: false, ease: 'easeInOut' },
                },
                delay: (duration / tweenPositions.length) * i,
                yoyo: false,
                onStart: () => {

                },
                onComplete: () => {

                }
            })
        }

    }


}
import { Scene } from 'phaser';

export default class {{SCENE_NAME}} extends Scene {
    constructor() {
        super('{{SCENE_KEY}}');
    }

    preload() {
        // Load transition assets here
    }

    create() {
        const { width, height } = this.scale;

        // Add background
        const background = this.add.rectangle(0, 0, width, height, 0x000000)
            .setOrigin(0)
            .setAlpha(0);

        // Add transition text
        const text = this.add.text(width / 2, height / 2, 'Loading...', {
            fontFamily: 'Arial',
            fontSize: '32px',
            color: '#ffffff'
        }).setOrigin(0.5).setAlpha(0);

        // Fade in animation
        this.tweens.add({
            targets: background,
            alpha: 1,
            duration: 500,
            ease: 'Power2'
        });

        this.tweens.add({
            targets: text,
            alpha: 1,
            duration: 500,
            delay: 250,
            ease: 'Power2',
            onComplete: () => {
                // Wait a bit, then transition to next scene
                this.time.delayedCall(1000, () => {
                    this.transitionToNextScene();
                });
            }
        });
    }

    transitionToNextScene() {
        const { width, height } = this.scale;

        // Fade out
        const overlay = this.add.rectangle(0, 0, width, height, 0x000000)
            .setOrigin(0)
            .setAlpha(0);

        this.tweens.add({
            targets: overlay,
            alpha: 1,
            duration: 500,
            ease: 'Power2',
            onComplete: () => {
                // Start next scene
                // this.scene.start('NextScene');
                console.log('Transition complete');
            }
        });
    }

    update(time, delta) {
        // Transition update logic here
    }
}

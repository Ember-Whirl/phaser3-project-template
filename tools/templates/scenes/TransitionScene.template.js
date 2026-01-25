import { Scene } from 'phaser';
import ResponsiveManager from '../managers/ResponsiveManager.js';
import UIBuilder from '../ui/UIBuilder.js';

export default class {{SCENE_NAME}} extends Scene {
    constructor() {
        super('{{SCENE_KEY}}');
    }

    preload() {
        // Load transition assets here
    }

    create() {
        // Initialize responsive manager
        ResponsiveManager.init(this);

        const { width, height } = this.scale;
        const ui = new UIBuilder(this);

        // Add background
        const background = this.add.rectangle(0, 0, width, height, 0x000000)
            .setOrigin(0)
            .setAlpha(0);

        // Add transition text with alignment
        const text = ui.textAt('center', 'Loading...', { x: 0, y: 0 }, 'heading');
        text.setAlpha(0);

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

        // Setup resize listener
        this.scale.on('resize', this.onResize, this);
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

    onResize(gameSize) {
        // ResponsiveManager auto-updates tracked elements
    }

    shutdown() {
        // Clean up resize listener
        this.scale.off('resize', this.onResize, this);
    }
}

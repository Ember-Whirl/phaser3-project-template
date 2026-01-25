import { Scene } from 'phaser';

export default class {{SCENE_NAME}} extends Scene {
    constructor() {
        super('{{SCENE_KEY}}');
    }

    preload() {
        // Load menu assets here
    }

    create() {
        const { width, height } = this.scale;

        // Add background
        this.add.rectangle(0, 0, width, height, 0x1a1a2e).setOrigin(0);

        // Add title
        this.add.text(width / 2, height / 3, '{{SCENE_NAME}}', {
            fontFamily: 'Arial',
            fontSize: '48px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5);

        // Add interactive text/button
        const startText = this.add.text(width / 2, height / 2, 'Start', {
            fontFamily: 'Arial',
            fontSize: '32px',
            color: '#ffffff'
        }).setOrigin(0.5).setInteractive();

        // Hover effect
        startText.on('pointerover', () => {
            startText.setColor('#ffff00');
        });

        startText.on('pointerout', () => {
            startText.setColor('#ffffff');
        });

        // Click handler
        startText.on('pointerdown', () => {
            // Change to next scene
            // this.scene.start('NextScene');
            console.log('Start clicked');
        });
    }

    update(time, delta) {
        // Menu update logic here
    }
}

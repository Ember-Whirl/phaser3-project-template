import { Scene } from 'phaser';
import ResponsiveManager from '../managers/ResponsiveManager.js';
import UIBuilder from '../ui/UIBuilder.js';

export default class {{SCENE_NAME}} extends Scene {
    constructor() {
        super('{{SCENE_KEY}}');
    }

    preload() {
        // Load menu assets here
    }

    create() {
        // Initialize responsive manager
        ResponsiveManager.init(this);

        const { width, height } = this.scale;
        const ui = new UIBuilder(this);

        // Add background
        this.add.rectangle(0, 0, width, height, 0x1a1a2e).setOrigin(0);

        // Add title with alignment
        ui.textAt('top-center', '{{SCENE_NAME}}', { x: 0, y: 80 }, 'heading');

        // Add button using Button component with alignment
        const startButton = ui.buttonAt('center', 'Start', { x: 0, y: 0 }, {
            width: 200,
            height: 60
        });

        startButton.onClick(() => {
            // Change to next scene
            // this.scene.start('NextScene');
            console.log('Start clicked');
        });

        // Setup resize listener
        this.scale.on('resize', this.onResize, this);
    }

    update(time, delta) {
        // Menu update logic here
    }

    onResize(gameSize) {
        // ResponsiveManager auto-updates tracked elements
    }

    shutdown() {
        // Clean up resize listener
        this.scale.off('resize', this.onResize, this);
    }
}

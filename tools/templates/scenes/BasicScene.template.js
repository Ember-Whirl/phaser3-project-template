import { Scene } from 'phaser';
import ResponsiveManager from '../managers/ResponsiveManager.js';
import UIBuilder from '../ui/UIBuilder.js';

export default class {{SCENE_NAME}} extends Scene {
    constructor() {
        super('{{SCENE_KEY}}');
    }

    preload() {
        // Load assets here
    }

    create() {
        // Initialize responsive manager
        ResponsiveManager.init(this);

        const { width, height } = this.scale;
        const ui = new UIBuilder(this);

        // Initialize scene here
        console.log('{{SCENE_NAME}} created');

        // Example: Add centered text
        // ui.textAt('center', '{{SCENE_NAME}}', { x: 0, y: 0 }, 'heading');

        // Setup resize listener
        this.scale.on('resize', this.onResize, this);
    }

    update(time, delta) {
        // Update logic here
    }

    onResize(gameSize) {
        // ResponsiveManager auto-updates tracked elements
        // Add custom resize logic here if needed
    }

    shutdown() {
        // Clean up resize listener
        this.scale.off('resize', this.onResize, this);
    }
}

import { Scene } from 'phaser';
import ResponsiveManager from '../managers/ResponsiveManager.js';
import UIBuilder from '../ui/UIBuilder.js';

export default class {{SCENE_NAME}} extends Scene {
    constructor() {
        super('{{SCENE_KEY}}');
    }

    preload() {
        // Load game assets here
    }

    create() {
        // Initialize responsive manager
        ResponsiveManager.init(this);

        const { width, height } = this.scale;
        const ui = new UIBuilder(this);

        // Add background
        this.add.rectangle(0, 0, width, height, 0x0f1419).setOrigin(0);

        // Initialize physics (if needed)
        // this.physics.world.setBounds(0, 0, width, height);

        // Setup input
        this.cursors = this.input.keyboard.createCursorKeys();

        // Add score text with alignment (top-left)
        this.score = 0;
        this.scoreText = ui.textAt('top-left', 'Score: 0', { x: 20, y: 20 }, 'body');

        // Game initialization
        this.initializeGame();

        // Setup resize listener
        this.scale.on('resize', this.onResize, this);

        console.log('{{SCENE_NAME}} started');
    }

    initializeGame() {
        // Initialize game objects, player, enemies, etc.
    }

    update(time, delta) {
        // Handle input
        if (this.cursors.left.isDown) {
            // Move left
        }

        if (this.cursors.right.isDown) {
            // Move right
        }

        if (this.cursors.up.isDown) {
            // Move up / jump
        }

        if (this.cursors.down.isDown) {
            // Move down
        }

        // Update game logic
    }

    updateScore(points) {
        this.score += points;
        this.scoreText.setText('Score: ' + this.score);
    }

    gameOver() {
        console.log('Game Over! Final score:', this.score);
        // this.scene.start('GameOver', { score: this.score });
    }

    onResize(gameSize) {
        // ResponsiveManager auto-updates tracked elements
    }

    shutdown() {
        // Clean up resize listener
        this.scale.off('resize', this.onResize, this);
    }
}

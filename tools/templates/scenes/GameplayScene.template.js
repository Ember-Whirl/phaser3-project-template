import { Scene } from 'phaser';

export default class {{SCENE_NAME}} extends Scene {
    constructor() {
        super('{{SCENE_KEY}}');
    }

    preload() {
        // Load game assets here
    }

    create() {
        const { width, height } = this.scale;

        // Add background
        this.add.rectangle(0, 0, width, height, 0x0f1419).setOrigin(0);

        // Initialize physics (if needed)
        // this.physics.world.setBounds(0, 0, width, height);

        // Setup input
        this.cursors = this.input.keyboard.createCursorKeys();

        // Add score text
        this.score = 0;
        this.scoreText = this.add.text(16, 16, 'Score: 0', {
            fontFamily: 'Arial',
            fontSize: '24px',
            color: '#ffffff'
        });

        // Game initialization
        this.initializeGame();

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
}

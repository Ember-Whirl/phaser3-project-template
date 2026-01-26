import { Scene } from 'phaser';
import ResponsiveManager from '../managers/ResponsiveManager.js';

/**
 * ButtonTest Scene
 * A test gameplay scene with 9 buttons in a panel
 * - Press a button to spawn 1 or 2 new random buttons
 * - Timer counts down
 * - Shows score at the end
 */
export class ButtonTest extends Scene {
    constructor() {
        super('ButtonTest');
    }

    create() {
        // Initialize responsive manager
        ResponsiveManager.init(this);

        const { width, height } = this.scale;

        // Game config
        this.gameTime = 30; // 30 seconds
        this.score = 0;
        this.gameActive = true;

        // Button styles available (matching frames in kenney-ui atlas)
        this.buttonStyles = [
            'button_square_flat',
            'button_rectangle_flat',
            'button_rectangle_gradient',
            'button_round_flat'
        ];
        
        // Color tints for visual variety (hex colors)
        this.buttonTints = [
            0x4a90e2, // blue
            0x50c878, // green
            0xe74c3c, // red
            0xf1c40f, // yellow
            0x95a5a6  // grey
        ];

        // Background
        this.cameras.main.setBackgroundColor(0x2d2d2d);

        // Panel background (darker rectangle)
        const panelWidth = 600;
        const panelHeight = 600;
        const panelX = width / 2;
        const panelY = height / 2;

        this.panel = this.add.rectangle(panelX, panelY, panelWidth, panelHeight, 0x1a1a1a);
        this.panel.setStrokeStyle(4, 0x4a4a4a);

        // Timer text
        this.timerText = this.add.text(panelX, panelY - panelHeight / 2 - 50, 'Time: 30', {
            fontFamily: 'Arial',
            fontSize: '32px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);

        // Score text
        this.scoreText = this.add.text(panelX, panelY - panelHeight / 2 - 90, 'Score: 0', {
            fontFamily: 'Arial',
            fontSize: '24px',
            color: '#ffffff'
        }).setOrigin(0.5);

        // Create grid of 9 buttons (3x3)
        this.buttons = [];
        this.activeButtons = [];
        const buttonSize = 80;
        const spacing = 40;
        const gridSize = 3;
        const totalWidth = (buttonSize * gridSize) + (spacing * (gridSize - 1));
        const startX = panelX - totalWidth / 2 + buttonSize / 2;
        const startY = panelY - totalWidth / 2 + buttonSize / 2;

        for (let row = 0; row < gridSize; row++) {
            for (let col = 0; col < gridSize; col++) {
                const x = startX + col * (buttonSize + spacing);
                const y = startY + row * (buttonSize + spacing);
                const index = row * gridSize + col;

                const buttonData = {
                    x: x,
                    y: y,
                    index: index,
                    sprite: null,
                    active: false
                };

                this.buttons.push(buttonData);
            }
        }

        // Activate random initial buttons
        this.activateRandomButtons(2);

        // Start timer
        this.timeRemaining = this.gameTime;
        this.timerEvent = this.time.addEvent({
            delay: 1000,
            callback: this.updateTimer,
            callbackScope: this,
            loop: true
        });

        // Setup resize listener
        this.scale.on('resize', this.onResize, this);
    }

    /**
     * Check if we're in production mode
     */
    isProduction() {
        return process.env.NODE_ENV === 'production';
    }

    /**
     * Helper to get sprite frame name
     * Since individual image files don't exist, we use the atlas in both modes
     */
    getButtonFrame(style) {
        // Frame name is just the style (e.g., "button_square_flat")
        // The atlas frame names match the style names
        return style;
    }

    /**
     * Create a button sprite
     */
    createButton(buttonData) {
        const randomStyle = Phaser.Utils.Array.GetRandom(this.buttonStyles);
        const randomTint = Phaser.Utils.Array.GetRandom(this.buttonTints);

        // Use atlas in both dev and production modes since individual image files don't exist
        const atlasKey = 'kenney-ui'; // Atlas key from manifest
        const frame = this.getButtonFrame(randomStyle);
        
        const sprite = this.add.image(buttonData.x, buttonData.y, atlasKey, frame);

        // Apply random color tint for visual variety
        sprite.setTint(randomTint);
        
        sprite.setDisplaySize(80, 80);
        sprite.setInteractive({ useHandCursor: true });
        sprite.setAlpha(0);

        // Fade in animation
        this.tweens.add({
            targets: sprite,
            alpha: 1,
            scale: { from: 0.5, to: 1 },
            duration: 300,
            ease: 'Back.easeOut'
        });

        // Click handler
        sprite.on('pointerdown', () => {
            if (this.gameActive) {
                this.onButtonClick(buttonData);
            }
        });

        // Hover effects
        sprite.on('pointerover', () => {
            if (this.gameActive) {
                sprite.setScale(1.1);
                this.tweens.add({
                    targets: sprite,
                    angle: 5,
                    duration: 100,
                    yoyo: true
                });
            }
        });

        sprite.on('pointerout', () => {
            if (this.gameActive) {
                sprite.setScale(1);
                sprite.setAngle(0);
            }
        });

        return sprite;
    }

    /**
     * Activate random buttons
     */
    activateRandomButtons(count) {
        const inactiveButtons = this.buttons.filter(btn => !btn.active);

        if (inactiveButtons.length === 0) {
            return;
        }

        const toActivate = Math.min(count, inactiveButtons.length);

        for (let i = 0; i < toActivate; i++) {
            const randomButton = Phaser.Utils.Array.GetRandom(inactiveButtons);
            const index = inactiveButtons.indexOf(randomButton);
            inactiveButtons.splice(index, 1);

            randomButton.active = true;
            randomButton.sprite = this.createButton(randomButton);
            this.activeButtons.push(randomButton);
        }
    }

    /**
     * Handle button click
     */
    onButtonClick(buttonData) {
        if (!buttonData.active) return;

        // Increase score
        this.score += 10;
        this.scoreText.setText(`Score: ${this.score}`);

        // Deactivate this button
        buttonData.active = false;
        const index = this.activeButtons.indexOf(buttonData);
        if (index > -1) {
            this.activeButtons.splice(index, 1);
        }

        // Animate button removal
        this.tweens.add({
            targets: buttonData.sprite,
            alpha: 0,
            scale: 0.5,
            angle: 360,
            duration: 300,
            ease: 'Back.easeIn',
            onComplete: () => {
                if (buttonData.sprite) {
                    buttonData.sprite.destroy();
                    buttonData.sprite = null;
                }
            }
        });

        // Spawn 1 or 2 new buttons randomly
        const newButtonCount = Phaser.Math.Between(1, 2);
        this.time.delayedCall(300, () => {
            this.activateRandomButtons(newButtonCount);
        });
    }

    /**
     * Update timer
     */
    updateTimer() {
        if (!this.gameActive) return;

        this.timeRemaining--;
        this.timerText.setText(`Time: ${this.timeRemaining}`);

        // Flash timer when low
        if (this.timeRemaining <= 5 && this.timeRemaining > 0) {
            this.tweens.add({
                targets: this.timerText,
                scale: { from: 1, to: 1.2 },
                duration: 200,
                yoyo: true,
                ease: 'Sine.easeInOut'
            });
            this.timerText.setColor('#ff0000');
        }

        if (this.timeRemaining <= 0) {
            this.endGame();
        }
    }

    /**
     * End game and show results
     */
    endGame() {
        this.gameActive = false;

        if (this.timerEvent) {
            this.timerEvent.remove();
        }

        // Disable all buttons
        this.activeButtons.forEach(buttonData => {
            if (buttonData.sprite) {
                buttonData.sprite.disableInteractive();
                buttonData.sprite.setAlpha(0.5);
            }
        });

        // Show game over panel
        const { width, height } = this.scale;
        const gameOverPanel = this.add.rectangle(width / 2, height / 2, 500, 300, 0x000000, 0.9);
        gameOverPanel.setStrokeStyle(4, 0xffffff);

        const gameOverText = this.add.text(width / 2, height / 2 - 60, 'TIME\'S UP!', {
            fontFamily: 'Arial',
            fontSize: '48px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5);

        const finalScoreText = this.add.text(width / 2, height / 2, `Final Score: ${this.score}`, {
            fontFamily: 'Arial',
            fontSize: '32px',
            color: '#ffff00'
        }).setOrigin(0.5);

        const restartText = this.add.text(width / 2, height / 2 + 60, 'Click to Restart', {
            fontFamily: 'Arial',
            fontSize: '24px',
            color: '#aaaaaa'
        }).setOrigin(0.5);

        // Animate game over panel
        gameOverPanel.setAlpha(0);
        gameOverText.setAlpha(0);
        finalScoreText.setAlpha(0);
        restartText.setAlpha(0);

        this.tweens.add({
            targets: [gameOverPanel, gameOverText, finalScoreText, restartText],
            alpha: 1,
            duration: 500,
            ease: 'Power2'
        });

        // Restart on click
        this.input.once('pointerdown', () => {
            this.scene.restart();
        });
    }

    onResize(gameSize) {
        // ResponsiveManager auto-updates tracked elements
    }

    shutdown() {
        // Clean up
        if (this.timerEvent) {
            this.timerEvent.remove();
        }
        this.scale.off('resize', this.onResize, this);
    }
}

import ResponsiveManager from '../../managers/ResponsiveManager.js';

/**
 * ProgressBar Component
 * Animated progress bar for health, loading, etc.
 *
 * Usage:
 *   import ProgressBar from './ui/components/ProgressBar';
 *
 *   const healthBar = new ProgressBar(scene, x, y, {
 *       width: 200,
 *       height: 20,
 *       fillColor: 0x00ff00,
 *       backgroundColor: 0x333333
 *   });
 *
 *   healthBar.setValue(0.75); // 75%
 */

export default class ProgressBar extends Phaser.GameObjects.Container {
    constructor(scene, x, y, config = {}) {
        super(scene, x, y);

        // Default configuration
        this.config = {
            width: config.width || 200,
            height: config.height || 20,
            fillColor: config.fillColor || 0x00ff00,
            backgroundColor: config.backgroundColor || 0x333333,
            borderWidth: config.borderWidth || 2,
            borderColor: config.borderColor || 0x000000,
            borderRadius: config.borderRadius || 4,
            padding: config.padding || 2,
            animated: config.animated !== undefined ? config.animated : true,
            animDuration: config.animDuration || 300,
            showLabel: config.showLabel !== undefined ? config.showLabel : false,
            labelFormat: config.labelFormat || 'percent', // 'percent' or 'fraction'
            // Responsive options
            alignment: config.alignment || null,
            margin: config.margin || { x: 20, y: 20 },
            autoReposition: config.autoReposition !== false,
            responsiveScale: config.responsiveScale || false
        };

        this.currentValue = 1.0;
        this.targetValue = 1.0;

        // Create background
        this.background = scene.add.rectangle(
            0, 0,
            this.config.width,
            this.config.height,
            this.config.backgroundColor
        );

        if (this.config.borderWidth > 0) {
            this.background.setStrokeStyle(this.config.borderWidth, this.config.borderColor);
        }

        this.add(this.background);

        // Create fill bar
        const fillWidth = this.config.width - (this.config.padding * 2);
        const fillHeight = this.config.height - (this.config.padding * 2);

        this.fillBar = scene.add.rectangle(
            -this.config.width / 2 + this.config.padding,
            0,
            fillWidth,
            fillHeight,
            this.config.fillColor
        ).setOrigin(0, 0.5);

        this.add(this.fillBar);

        // Create label if specified
        if (this.config.showLabel) {
            this.label = scene.add.text(0, 0, this.getLabel(), {
                fontFamily: 'Arial',
                fontSize: `${this.config.height * 0.6}px`,
                color: '#ffffff'
            }).setOrigin(0.5);

            this.add(this.label);
        }

        // Add to scene
        scene.add.existing(this);

        this.updateDisplay();

        // Auto-position if alignment provided
        if (this.config.alignment) {
            this.reposition();

            if (this.config.autoReposition) {
                ResponsiveManager.trackElement(this, this.config.alignment, this.config.margin, {
                    autoOrigin: false // Container origin is always 0.5, 0.5
                });
            }
        }
    }

    /**
     * Set the progress value
     * @param {number} value - Value between 0 and 1
     * @param {boolean} immediate - Skip animation
     */
    setValue(value, immediate = false) {
        this.targetValue = Phaser.Math.Clamp(value, 0, 1);

        if (immediate || !this.config.animated) {
            this.currentValue = this.targetValue;
            this.updateDisplay();
        } else {
            this.animateToValue();
        }

        return this;
    }

    /**
     * Get current value
     * @returns {number} Current value (0-1)
     */
    getValue() {
        return this.currentValue;
    }

    /**
     * Animate to target value
     */
    animateToValue() {
        if (this.tween) {
            this.tween.stop();
        }

        this.tween = this.scene.tweens.add({
            targets: this,
            currentValue: this.targetValue,
            duration: this.config.animDuration,
            ease: 'Power2',
            onUpdate: () => {
                this.updateDisplay();
            }
        });
    }

    /**
     * Update the visual display
     */
    updateDisplay() {
        const fillWidth = (this.config.width - (this.config.padding * 2)) * this.currentValue;
        this.fillBar.width = Math.max(0, fillWidth);

        // Update color based on value
        if (this.currentValue < 0.25) {
            this.fillBar.setFillStyle(0xff0000); // Red for low
        } else if (this.currentValue < 0.5) {
            this.fillBar.setFillStyle(0xff8800); // Orange for medium-low
        } else {
            this.fillBar.setFillStyle(this.config.fillColor); // Original color
        }

        // Update label
        if (this.config.showLabel && this.label) {
            this.label.setText(this.getLabel());
        }
    }

    /**
     * Get label text
     * @returns {string} Formatted label
     */
    getLabel() {
        if (this.config.labelFormat === 'percent') {
            return Math.round(this.currentValue * 100) + '%';
        } else {
            return Math.round(this.currentValue * 100) + '/100';
        }
    }

    /**
     * Increase value by amount
     * @param {number} amount - Amount to increase (0-1)
     */
    increase(amount) {
        this.setValue(this.targetValue + amount);
        return this;
    }

    /**
     * Decrease value by amount
     * @param {number} amount - Amount to decrease (0-1)
     */
    decrease(amount) {
        this.setValue(this.targetValue - amount);
        return this;
    }

    /**
     * Set to full
     */
    setFull() {
        this.setValue(1);
        return this;
    }

    /**
     * Set to empty
     */
    setEmpty() {
        this.setValue(0);
        return this;
    }

    /**
     * Check if empty
     * @returns {boolean}
     */
    isEmpty() {
        return this.currentValue === 0;
    }

    /**
     * Check if full
     * @returns {boolean}
     */
    isFull() {
        return this.currentValue === 1;
    }

    /**
     * Reposition based on alignment
     */
    reposition() {
        if (!this.config.alignment) return;

        const pos = ResponsiveManager.getAlignmentPosition(
            this.config.alignment,
            this.config.margin
        );

        this.x = pos.x;
        this.y = pos.y;

        return this;
    }

    /**
     * Set alignment and auto-reposition
     * @param {string} alignment - Alignment: 'top-left', 'center', 'bottom-right', etc.
     * @param {object|number} margin - Margin from edges { x, y } or number
     */
    setAlignment(alignment, margin) {
        this.config.alignment = alignment;
        this.config.margin = margin || this.config.margin;
        this.reposition();

        // Update tracking if auto-reposition is enabled
        if (this.config.autoReposition) {
            ResponsiveManager.untrackElement(this);
            ResponsiveManager.trackElement(this, alignment, this.config.margin, {
                autoOrigin: false
            });
        }

        return this;
    }

    /**
     * Cleanup
     */
    destroy(fromScene) {
        // Untrack from responsive manager
        if (this.config.alignment && this.config.autoReposition) {
            ResponsiveManager.untrackElement(this);
        }

        if (this.tween) {
            this.tween.stop();
            this.tween = null;
        }
        super.destroy(fromScene);
    }
}

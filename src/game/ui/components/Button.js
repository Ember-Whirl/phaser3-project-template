import { tweenPresets } from '../../animations/presets/tweenPresets.js';
import ResponsiveManager from '../../managers/ResponsiveManager.js';

/**
 * Button Component
 * Reusable button with hover effects and click handling
 *
 * Usage:
 *   import Button from './ui/components/Button';
 *
 *   const button = new Button(scene, x, y, 'Play', {
 *       backgroundColor: 0x4a4a4a,
 *       hoverColor: 0x6a6a6a,
 *       textColor: '#ffffff'
 *   });
 *
 *   button.onClick(() => {
 *       console.log('Button clicked!');
 *   });
 */

export default class Button extends Phaser.GameObjects.Container {
    constructor(scene, x, y, text, config = {}) {
        super(scene, x, y);

        // Default configuration
        this.config = {
            width: config.width || 200,
            height: config.height || 60,
            backgroundColor: config.backgroundColor || 0x4a4a4a,
            hoverColor: config.hoverColor || 0x6a6a6a,
            pressedColor: config.pressedColor || 0x3a3a3a,
            textColor: config.textColor || '#ffffff',
            fontSize: config.fontSize || '24px',
            fontFamily: config.fontFamily || 'Arial',
            borderRadius: config.borderRadius || 8,
            borderWidth: config.borderWidth || 0,
            borderColor: config.borderColor || 0xffffff,
            padding: config.padding || 10,
            // Responsive options
            alignment: config.alignment || null,
            margin: config.margin || { x: 20, y: 20 },
            autoReposition: config.autoReposition !== false,
            responsiveScale: config.responsiveScale || false
        };

        this.isHovered = false;
        this.isPressed = false;
        this.isEnabled = true;
        this.clickCallback = null;

        // Create background
        this.background = scene.add.rectangle(
            0, 0,
            this.config.width,
            this.config.height,
            this.config.backgroundColor
        );

        // Add border if specified
        if (this.config.borderWidth > 0) {
            this.background.setStrokeStyle(this.config.borderWidth, this.config.borderColor);
        }

        this.add(this.background);

        // Create text
        this.buttonText = scene.add.text(0, 0, text, {
            fontFamily: this.config.fontFamily,
            fontSize: this.config.fontSize,
            color: this.config.textColor
        }).setOrigin(0.5);

        this.add(this.buttonText);

        // Set interactive
        this.setSize(this.config.width, this.config.height);
        this.setInteractive({ useHandCursor: true });

        // Setup event handlers
        this.on('pointerover', this.onPointerOver, this);
        this.on('pointerout', this.onPointerOut, this);
        this.on('pointerdown', this.onPointerDown, this);
        this.on('pointerup', this.onPointerUp, this);

        // Add to scene
        scene.add.existing(this);

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
     * Handle pointer over
     */
    onPointerOver() {
        if (!this.isEnabled) return;

        this.isHovered = true;
        this.background.setFillStyle(this.config.hoverColor);

        // Scale up slightly
        tweenPresets.scalePulse(this.scene, this, 1.05, 100);
    }

    /**
     * Handle pointer out
     */
    onPointerOut() {
        if (!this.isEnabled) return;

        this.isHovered = false;
        this.background.setFillStyle(this.config.backgroundColor);

        // Reset scale
        this.setScale(1);
    }

    /**
     * Handle pointer down
     */
    onPointerDown() {
        if (!this.isEnabled) return;

        this.isPressed = true;
        this.background.setFillStyle(this.config.pressedColor);

        // Press effect
        tweenPresets.buttonPress(this.scene, this);
    }

    /**
     * Handle pointer up
     */
    onPointerUp() {
        if (!this.isEnabled) return;

        this.isPressed = false;

        if (this.isHovered) {
            this.background.setFillStyle(this.config.hoverColor);

            // Trigger click callback
            if (this.clickCallback) {
                this.clickCallback();
            }
        } else {
            this.background.setFillStyle(this.config.backgroundColor);
        }
    }

    /**
     * Set click callback
     * @param {function} callback - Click handler function
     */
    onClick(callback) {
        this.clickCallback = callback;
        return this;
    }

    /**
     * Update button text
     * @param {string} text - New text
     */
    setText(text) {
        this.buttonText.setText(text);
        return this;
    }

    /**
     * Enable the button
     */
    enable() {
        this.isEnabled = true;
        this.setAlpha(1);
        this.setInteractive();
        return this;
    }

    /**
     * Disable the button
     */
    disable() {
        this.isEnabled = false;
        this.setAlpha(0.5);
        this.disableInteractive();
        return this;
    }

    /**
     * Show the button with animation
     * @param {number} duration - Animation duration
     */
    show(duration = 300) {
        tweenPresets.fadeIn(this.scene, this, duration);
        return this;
    }

    /**
     * Hide the button with animation
     * @param {number} duration - Animation duration
     */
    hide(duration = 300) {
        tweenPresets.fadeOut(this.scene, this, duration);
        return this;
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

        this.clickCallback = null;
        super.destroy(fromScene);
    }
}

import { tweenPresets } from '../../animations/presets/tweenPresets.js';
import ResponsiveManager from '../../managers/ResponsiveManager.js';

/**
 * Panel Component
 * Reusable panel container for UI elements
 *
 * Usage:
 *   import Panel from './ui/components/Panel';
 *
 *   const panel = new Panel(scene, x, y, {
 *       width: 400,
 *       height: 300,
 *       backgroundColor: 0x222222,
 *       padding: 20
 *   });
 *
 *   // Add content to panel
 *   panel.addContent(mySprite);
 */

export default class Panel extends Phaser.GameObjects.Container {
    constructor(scene, x, y, config = {}) {
        super(scene, x, y);

        // Default configuration
        this.config = {
            width: config.width || 300,
            height: config.height || 200,
            backgroundColor: config.backgroundColor || 0x222222,
            backgroundAlpha: config.backgroundAlpha !== undefined ? config.backgroundAlpha : 0.9,
            borderRadius: config.borderRadius || 10,
            borderWidth: config.borderWidth || 2,
            borderColor: config.borderColor || 0x444444,
            padding: config.padding || 15,
            title: config.title || null,
            titleColor: config.titleColor || '#ffffff',
            titleSize: config.titleSize || '24px',
            // Responsive options
            alignment: config.alignment || null,
            margin: config.margin || { x: 20, y: 20 },
            autoReposition: config.autoReposition !== false,
            responsiveScale: config.responsiveScale || false
        };

        this.content = [];

        // Create background
        this.background = scene.add.rectangle(
            0, 0,
            this.config.width,
            this.config.height,
            this.config.backgroundColor,
            this.config.backgroundAlpha
        );

        if (this.config.borderWidth > 0) {
            this.background.setStrokeStyle(this.config.borderWidth, this.config.borderColor);
        }

        this.add(this.background);

        // Create title if specified
        if (this.config.title) {
            this.titleText = scene.add.text(
                0,
                -this.config.height / 2 + this.config.padding + 10,
                this.config.title,
                {
                    fontFamily: 'Arial',
                    fontSize: this.config.titleSize,
                    color: this.config.titleColor
                }
            ).setOrigin(0.5, 0);

            this.add(this.titleText);
        }

        // Content container
        this.contentContainer = scene.add.container(0, 0);
        this.add(this.contentContainer);

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
     * Add content to the panel
     * @param {Phaser.GameObjects.GameObject} gameObject - Content to add
     * @param {number} offsetX - X offset from center
     * @param {number} offsetY - Y offset from center
     */
    addContent(gameObject, offsetX = 0, offsetY = 0) {
        gameObject.setPosition(offsetX, offsetY);
        this.contentContainer.add(gameObject);
        this.content.push(gameObject);
        return this;
    }

    /**
     * Remove content from the panel
     * @param {Phaser.GameObjects.GameObject} gameObject - Content to remove
     */
    removeContent(gameObject) {
        const index = this.content.indexOf(gameObject);
        if (index > -1) {
            this.content.splice(index, 1);
            this.contentContainer.remove(gameObject);
        }
        return this;
    }

    /**
     * Clear all content
     */
    clearContent() {
        this.content.forEach(obj => {
            this.contentContainer.remove(obj);
        });
        this.content = [];
        return this;
    }

    /**
     * Show the panel with animation
     * @param {string} direction - Animation direction: 'fade', 'top', 'bottom', 'left', 'right'
     * @param {number} duration - Animation duration
     */
    show(direction = 'fade', duration = 300) {
        if (direction === 'fade') {
            tweenPresets.fadeIn(this.scene, this, duration);
        } else {
            tweenPresets.slideIn(this.scene, this, direction, duration);
        }
        return this;
    }

    /**
     * Hide the panel with animation
     * @param {string} direction - Animation direction: 'fade', 'top', 'bottom', 'left', 'right'
     * @param {number} duration - Animation duration
     */
    hide(direction = 'fade', duration = 300) {
        if (direction === 'fade') {
            tweenPresets.fadeOut(this.scene, this, duration);
        } else {
            tweenPresets.slideOut(this.scene, this, direction, duration);
        }
        return this;
    }

    /**
     * Set panel title
     * @param {string} title - New title
     */
    setTitle(title) {
        if (this.titleText) {
            this.titleText.setText(title);
        } else {
            this.titleText = this.scene.add.text(
                0,
                -this.config.height / 2 + this.config.padding + 10,
                title,
                {
                    fontFamily: 'Arial',
                    fontSize: this.config.titleSize,
                    color: this.config.titleColor
                }
            ).setOrigin(0.5, 0);

            this.add(this.titleText);
        }
        return this;
    }

    /**
     * Get content bounds for layout
     * @returns {object} Bounds { top, bottom, left, right }
     */
    getContentBounds() {
        return {
            top: -this.config.height / 2 + this.config.padding + (this.titleText ? 40 : 0),
            bottom: this.config.height / 2 - this.config.padding,
            left: -this.config.width / 2 + this.config.padding,
            right: this.config.width / 2 - this.config.padding
        };
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

        this.content = [];
        super.destroy(fromScene);
    }
}

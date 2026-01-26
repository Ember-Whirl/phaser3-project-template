/**
 * Responsive Manager
 * Centralized responsive layout and screen management system
 *
 * Features:
 * - Automatic resize handling with Phaser scale manager
 * - Orientation detection (portrait/landscape)
 * - Safe area calculations for mobile devices (notches, rounded corners)
 * - Alignment-based positioning system (top-left, center, bottom-right, etc.)
 * - Responsive element tracking with auto-repositioning
 * - Responsive scaling utilities
 *
 * @example
 * // Initialize in scene
 * ResponsiveManager.init(this);
 *
 * // Get position for alignment
 * const pos = ResponsiveManager.getAlignmentPosition('top-right', { x: 20, y: 20 });
 *
 * // Track element for auto-repositioning
 * ResponsiveManager.trackElement(button, 'center', { x: 0, y: 0 });
 *
 * @author Phaser 3 Template v3.5.0
 */
class ResponsiveManager {
    constructor() {
        this.scene = null;
        this.orientation = 'landscape';
        this.safeArea = { top: 0, bottom: 0, left: 0, right: 0 };
        this.trackedElements = [];
        this.baseWidth = 1024;
        this.baseHeight = 768;
        this.scaleFactor = 1;
        this.isInitialized = false;

        /**
         * Alignment configuration map
         * Each alignment defines normalized position (0-1) and origin point
         */
        this.ALIGNMENTS = {
            'top-left': { x: 0, y: 0, originX: 0, originY: 0 },
            'top-center': { x: 0.5, y: 0, originX: 0.5, originY: 0 },
            'top-right': { x: 1, y: 0, originX: 1, originY: 0 },
            'center-left': { x: 0, y: 0.5, originX: 0, originY: 0.5 },
            'center': { x: 0.5, y: 0.5, originX: 0.5, originY: 0.5 },
            'center-right': { x: 1, y: 0.5, originX: 1, originY: 0.5 },
            'bottom-left': { x: 0, y: 1, originX: 0, originY: 1 },
            'bottom-center': { x: 0.5, y: 1, originX: 0.5, originY: 1 },
            'bottom-right': { x: 1, y: 1, originX: 1, originY: 1 }
        };
    }

    /**
     * Initialize the responsive manager with a scene
     * @param {Phaser.Scene} scene - The Phaser scene to manage
     * @param {object} config - Configuration options
     * @param {number} config.baseWidth - Base reference width (default: 1024)
     * @param {number} config.baseHeight - Base reference height (default: 768)
     */
    init(scene, config = {}) {
        if (this.isInitialized) {
            this.destroy();
        }

        this.scene = scene;
        this.baseWidth = config.baseWidth || 1024;
        this.baseHeight = config.baseHeight || 768;
        this.isInitialized = true;

        // Attach to Phaser's scale manager resize event
        this.scene.scale.on('resize', this.onResize, this);

        // Initial setup
        this.onResize(this.scene.scale.gameSize);

        // Emit ready event
        if (this.scene.events) {
            this.scene.events.emit('responsive-ready');
        }
    }

    /**
     * Clean up and remove event listeners
     */
    destroy() {
        if (this.scene && this.scene.scale) {
            this.scene.scale.off('resize', this.onResize, this);
        }

        this.trackedElements = [];
        this.scene = null;
        this.isInitialized = false;
    }

    /**
     * Get position coordinates for an alignment
     * @param {string} alignment - Alignment key (e.g., 'top-left', 'center', 'bottom-right')
     * @param {object|number} margin - Margin from edges { x, y } or single number for uniform margin
     * @returns {{x: number, y: number, origin: {x: number, y: number}}} Position and origin
     *
     * @example
     * const pos = ResponsiveManager.getAlignmentPosition('top-right', { x: 20, y: 20 });
     * // Returns: { x: 1004, y: 20, origin: { x: 1, y: 0 } }
     */
    getAlignmentPosition(alignment, margin = 0) {
        if (!this.scene) {
            console.warn('ResponsiveManager not initialized. Call init(scene) first.');
            return { x: 0, y: 0, origin: { x: 0, y: 0 } };
        }

        const alignConfig = this.ALIGNMENTS[alignment];
        if (!alignConfig) {
            console.warn(`Unknown alignment: ${alignment}. Using 'center' as fallback.`);
            return this.getAlignmentPosition('center', margin);
        }

        // Normalize margin to object format
        const normalizedMargin = typeof margin === 'number'
            ? { x: margin, y: margin }
            : { x: margin.x || 0, y: margin.y || 0 };

        const { width, height } = this.scene.scale;
        const safe = this.safeArea;

        // Calculate base position from alignment
        let x = width * alignConfig.x;
        let y = height * alignConfig.y;

        // Apply margin based on alignment
        // Left alignments: add margin
        // Right alignments: subtract margin
        // Center alignments: add as offset
        if (alignConfig.x === 0) {
            x += normalizedMargin.x + safe.left;
        } else if (alignConfig.x === 1) {
            x -= normalizedMargin.x + safe.right;
        } else if (alignConfig.x === 0.5) {
            x += normalizedMargin.x;
        }

        if (alignConfig.y === 0) {
            y += normalizedMargin.y + safe.top;
        } else if (alignConfig.y === 1) {
            y -= normalizedMargin.y + safe.bottom;
        } else if (alignConfig.y === 0.5) {
            y += normalizedMargin.y;
        }

        return {
            x: Math.round(x),
            y: Math.round(y),
            origin: {
                x: alignConfig.originX,
                y: alignConfig.originY
            }
        };
    }

    /**
     * Track an element for automatic repositioning on resize
     * @param {Phaser.GameObjects.GameObject} element - Element to track
     * @param {string} alignment - Alignment key
     * @param {object|number} margin - Margin from edges
     * @param {object} config - Additional configuration
     * @param {boolean} config.autoOrigin - Automatically set origin (default: true)
     * @param {boolean} config.scaleWithScreen - Scale element with screen size (default: false)
     * @param {object} config.orientationConfig - Different positions for portrait/landscape
     *
     * @example
     * ResponsiveManager.trackElement(button, 'center', { x: 0, y: 0 }, {
     *     autoOrigin: true,
     *     orientationConfig: {
     *         portrait: { alignment: 'top-center', margin: { x: 0, y: 50 } },
     *         landscape: { alignment: 'center-left', margin: { x: 50, y: 0 } }
     *     }
     * });
     */
    trackElement(element, alignment, margin = 0, config = {}) {
        if (!element) {
            console.warn('Cannot track null element');
            return;
        }

        // Check if element is already tracked
        const existingIndex = this.trackedElements.findIndex(t => t.element === element);
        if (existingIndex !== -1) {
            // Update existing tracking config
            this.trackedElements[existingIndex] = { element, alignment, margin, config };
        } else {
            // Add new tracked element
            this.trackedElements.push({ element, alignment, margin, config });
        }

        // Initial position
        this.repositionElement(element, alignment, margin, config);
    }

    /**
     * Stop tracking an element
     * @param {Phaser.GameObjects.GameObject} element - Element to untrack
     */
    untrackElement(element) {
        this.trackedElements = this.trackedElements.filter(t => t.element !== element);
    }

    /**
     * Reposition a single element based on its tracking config
     * @private
     */
    repositionElement(element, alignment, margin, config) {
        if (!element || !element.active) {
            return;
        }

        // Check for orientation-specific config
        let finalAlignment = alignment;
        let finalMargin = margin;

        if (config.orientationConfig) {
            const orientationConfig = config.orientationConfig[this.orientation];
            if (orientationConfig) {
                finalAlignment = orientationConfig.alignment || alignment;
                finalMargin = orientationConfig.margin || margin;
            }
        }

        const pos = this.getAlignmentPosition(finalAlignment, finalMargin);

        element.x = pos.x;
        element.y = pos.y;

        // Auto-set origin if enabled (default: true)
        if (config.autoOrigin !== false && element.setOrigin) {
            element.setOrigin(pos.origin.x, pos.origin.y);
        }

        // Scale with screen if enabled
        if (config.scaleWithScreen && element.setScale) {
            element.setScale(this.scaleFactor);
        }
    }

    /**
     * Update all tracked elements
     */
    updateTrackedElements() {
        this.trackedElements.forEach(({ element, alignment, margin, config }) => {
            this.repositionElement(element, alignment, margin, config);
        });
    }

    /**
     * Handle resize event from Phaser scale manager
     * @private
     */
    onResize(gameSize) {
        if (!this.scene) return;

        const { width, height } = gameSize || this.scene.scale;

        // Update orientation
        const previousOrientation = this.orientation;
        this.orientation = width > height ? 'landscape' : 'portrait';

        // Update scale factor
        this.scaleFactor = Math.min(
            width / this.baseWidth,
            height / this.baseHeight
        );

        // Detect safe areas (mobile notches, etc.)
        this.detectSafeArea();

        // Reposition all tracked elements
        this.updateTrackedElements();

        // Emit events
        if (this.scene.events) {
            this.scene.events.emit('layout-changed', { width, height, orientation: this.orientation });

            if (previousOrientation !== this.orientation) {
                this.scene.events.emit('orientation-changed', this.orientation);
            }
        }
    }

    /**
     * Get current orientation
     * @returns {string} 'portrait' or 'landscape'
     */
    getOrientation() {
        return this.orientation;
    }

    /**
     * Check if current orientation is portrait
     * @returns {boolean}
     */
    isPortrait() {
        return this.orientation === 'portrait';
    }

    /**
     * Check if current orientation is landscape
     * @returns {boolean}
     */
    isLandscape() {
        return this.orientation === 'landscape';
    }

    /**
     * Get current screen size
     * @returns {{width: number, height: number}}
     */
    getScreenSize() {
        if (!this.scene) {
            return { width: this.baseWidth, height: this.baseHeight };
        }
        return {
            width: this.scene.scale.width,
            height: this.scene.scale.height
        };
    }

    /**
     * Get safe area insets (mobile devices with notches)
     * @returns {{top: number, bottom: number, left: number, right: number}}
     */
    getSafeArea() {
        return { ...this.safeArea };
    }

    /**
     * Detect safe area using CSS environment variables
     * @private
     */
    detectSafeArea() {
        // Only works in browser environment
        if (typeof window === 'undefined' || !window.getComputedStyle) {
            this.safeArea = { top: 0, bottom: 0, left: 0, right: 0 };
            return;
        }

        try {
            const style = window.getComputedStyle(document.documentElement);

            this.safeArea = {
                top: parseInt(style.getPropertyValue('env(safe-area-inset-top)')) || 0,
                bottom: parseInt(style.getPropertyValue('env(safe-area-inset-bottom)')) || 0,
                left: parseInt(style.getPropertyValue('env(safe-area-inset-left)')) || 0,
                right: parseInt(style.getPropertyValue('env(safe-area-inset-right)')) || 0
            };
        } catch (error) {
            // Fallback to no safe area
            this.safeArea = { top: 0, bottom: 0, left: 0, right: 0 };
        }
    }

    /**
     * Get scale factor relative to base dimensions
     * @returns {number} Scale factor
     */
    getScaleFactor() {
        return this.scaleFactor;
    }

    /**
     * Scale a value based on current screen size
     * @param {number} value - Value to scale
     * @returns {number} Scaled value
     *
     * @example
     * const spacing = ResponsiveManager.scale(20); // Returns scaled pixel value
     */
    scale(value) {
        return Math.round(value * this.scaleFactor);
    }

    /**
     * Get value based on current orientation
     * @param {*} portraitValue - Value to use in portrait mode
     * @param {*} landscapeValue - Value to use in landscape mode
     * @returns {*} Value based on orientation
     *
     * @example
     * const spacing = ResponsiveManager.responsiveValue(10, 20); // 10 in portrait, 20 in landscape
     */
    responsiveValue(portraitValue, landscapeValue) {
        return this.isPortrait() ? portraitValue : landscapeValue;
    }
}

// Export singleton instance
export default new ResponsiveManager();

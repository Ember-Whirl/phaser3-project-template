/**
 * Animation Manager
 * Centralized animation management system
 *
 * Usage:
 *   import AnimationManager from './animations/AnimationManager';
 *
 *   // In your scene's preload
 *   AnimationManager.loadDefinitions(this, 'path/to/animations.json');
 *
 *   // In your scene's create
 *   AnimationManager.createAnimations(this);
 *
 *   // Play animation on a sprite
 *   sprite.play('player-walk');
 */

class AnimationManager {
    constructor() {
        this.definitions = {};
        this.created = new Set();
    }

    /**
     * Load animation definitions from JSON file
     * @param {Phaser.Scene} scene - The scene loading the definitions
     * @param {string} key - Asset key for the JSON file
     * @param {string} path - Path to the JSON file
     */
    loadDefinitions(scene, key, path) {
        scene.load.json(key, path);
    }

    /**
     * Register animation definitions from loaded JSON
     * @param {Phaser.Scene} scene - The scene
     * @param {string} key - The JSON asset key
     */
    registerDefinitions(scene, key) {
        const data = scene.cache.json.get(key);

        if (!data) {
            console.warn(`[AnimationManager] JSON not found: ${key}`);
            return;
        }

        // Merge with existing definitions
        this.definitions = { ...this.definitions, ...data };
        console.log(`[AnimationManager] Registered definitions from: ${key}`);
    }

    /**
     * Create all registered animations in the scene
     * @param {Phaser.Scene} scene - The scene to create animations in
     */
    createAnimations(scene) {
        Object.keys(this.definitions).forEach(category => {
            const animations = this.definitions[category];

            Object.keys(animations).forEach(animKey => {
                const animDef = animations[animKey];
                const fullKey = `${category}-${animKey}`;

                // Skip if already created
                if (this.created.has(fullKey)) {
                    return;
                }

                // Create animation
                if (animDef.frames) {
                    const config = {
                        key: fullKey,
                        frames: this.parseFrames(scene, animDef.frames),
                        frameRate: animDef.frameRate || 10,
                        repeat: animDef.repeat !== undefined ? animDef.repeat : -1,
                        yoyo: animDef.yoyo || false,
                        hideOnComplete: animDef.hideOnComplete || false
                    };

                    scene.anims.create(config);
                    this.created.add(fullKey);
                }
            });
        });

        console.log(`[AnimationManager] Created ${this.created.size} animations`);
    }

    /**
     * Parse frame configuration
     * @param {Phaser.Scene} scene - The scene
     * @param {string|object} frames - Frame configuration
     * @returns {Array|object} Phaser frame configuration
     */
    parseFrames(scene, frames) {
        if (typeof frames === 'string') {
            // Simple spritesheet key
            return scene.anims.generateFrameNumbers(frames);
        }

        if (frames.key) {
            // Detailed configuration
            const config = {
                key: frames.key
            };

            if (frames.start !== undefined && frames.end !== undefined) {
                config.start = frames.start;
                config.end = frames.end;
            }

            if (frames.frames) {
                config.frames = frames.frames;
            }

            return scene.anims.generateFrameNumbers(frames.key, config);
        }

        return frames;
    }

    /**
     * Create a single animation manually
     * @param {Phaser.Scene} scene - The scene
     * @param {string} key - Animation key
     * @param {object} config - Animation configuration
     */
    createAnimation(scene, key, config) {
        if (this.created.has(key)) {
            console.warn(`[AnimationManager] Animation already exists: ${key}`);
            return;
        }

        scene.anims.create({
            key,
            ...config
        });

        this.created.add(key);
    }

    /**
     * Check if animation exists
     * @param {string} key - Animation key
     * @returns {boolean}
     */
    hasAnimation(key) {
        return this.created.has(key);
    }

    /**
     * Get all animation keys
     * @returns {Array<string>}
     */
    getAnimationKeys() {
        return Array.from(this.created);
    }

    /**
     * Clear all definitions (useful for scene transitions)
     */
    clearDefinitions() {
        this.definitions = {};
    }

    /**
     * Reset the manager
     */
    reset() {
        this.definitions = {};
        this.created.clear();
    }
}

// Export singleton instance
export default new AnimationManager();

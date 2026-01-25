/**
 * Tween Presets Library
 * Collection of reusable animation presets
 *
 * Usage:
 *   import { tweenPresets } from './animations/presets/tweenPresets';
 *
 *   // Fade in a sprite
 *   tweenPresets.fadeIn(scene, sprite, 500);
 *
 *   // Button press effect
 *   tweenPresets.buttonPress(scene, button);
 *
 *   // Shake effect
 *   tweenPresets.shake(scene, object);
 */

export const tweenPresets = {
    /**
     * Fade in animation
     * @param {Phaser.Scene} scene - The scene
     * @param {Phaser.GameObjects.GameObject} target - Target object
     * @param {number} duration - Duration in ms (default: 500)
     * @param {function} onComplete - Callback when complete
     */
    fadeIn(scene, target, duration = 500, onComplete = null) {
        target.setAlpha(0);

        return scene.tweens.add({
            targets: target,
            alpha: 1,
            duration: duration,
            ease: 'Power2',
            onComplete: onComplete
        });
    },

    /**
     * Fade out animation
     * @param {Phaser.Scene} scene - The scene
     * @param {Phaser.GameObjects.GameObject} target - Target object
     * @param {number} duration - Duration in ms (default: 500)
     * @param {function} onComplete - Callback when complete
     */
    fadeOut(scene, target, duration = 500, onComplete = null) {
        return scene.tweens.add({
            targets: target,
            alpha: 0,
            duration: duration,
            ease: 'Power2',
            onComplete: onComplete
        });
    },

    /**
     * Scale pulse effect
     * @param {Phaser.Scene} scene - The scene
     * @param {Phaser.GameObjects.GameObject} target - Target object
     * @param {number} scale - Max scale (default: 1.1)
     * @param {number} duration - Duration in ms (default: 300)
     */
    scalePulse(scene, target, scale = 1.1, duration = 300) {
        return scene.tweens.add({
            targets: target,
            scaleX: scale,
            scaleY: scale,
            duration: duration,
            yoyo: true,
            ease: 'Sine.easeInOut'
        });
    },

    /**
     * Continuous pulse effect
     * @param {Phaser.Scene} scene - The scene
     * @param {Phaser.GameObjects.GameObject} target - Target object
     * @param {number} scale - Max scale (default: 1.05)
     * @param {number} duration - Duration in ms (default: 1000)
     */
    pulse(scene, target, scale = 1.05, duration = 1000) {
        return scene.tweens.add({
            targets: target,
            scaleX: scale,
            scaleY: scale,
            duration: duration,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    },

    /**
     * Shake effect
     * @param {Phaser.Scene} scene - The scene
     * @param {Phaser.GameObjects.GameObject} target - Target object
     * @param {number} intensity - Shake intensity (default: 10)
     * @param {number} duration - Duration in ms (default: 200)
     */
    shake(scene, target, intensity = 10, duration = 200) {
        const originalX = target.x;
        const originalY = target.y;

        return scene.tweens.add({
            targets: target,
            x: originalX + intensity,
            duration: duration / 4,
            yoyo: true,
            repeat: 3,
            ease: 'Sine.easeInOut',
            onComplete: () => {
                target.x = originalX;
                target.y = originalY;
            }
        });
    },

    /**
     * Bounce effect
     * @param {Phaser.Scene} scene - The scene
     * @param {Phaser.GameObjects.GameObject} target - Target object
     * @param {number} distance - Bounce distance (default: 20)
     * @param {number} duration - Duration in ms (default: 500)
     */
    bounce(scene, target, distance = 20, duration = 500) {
        const originalY = target.y;

        return scene.tweens.add({
            targets: target,
            y: originalY - distance,
            duration: duration,
            ease: 'Bounce.easeOut',
            onComplete: () => {
                target.y = originalY;
            }
        });
    },

    /**
     * Float/hover effect
     * @param {Phaser.Scene} scene - The scene
     * @param {Phaser.GameObjects.GameObject} target - Target object
     * @param {number} distance - Float distance (default: 10)
     * @param {number} duration - Duration in ms (default: 2000)
     */
    float(scene, target, distance = 10, duration = 2000) {
        const originalY = target.y;

        return scene.tweens.add({
            targets: target,
            y: originalY - distance,
            duration: duration,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    },

    /**
     * Button press effect
     * @param {Phaser.Scene} scene - The scene
     * @param {Phaser.GameObjects.GameObject} target - Target button
     * @param {function} onComplete - Callback when complete
     */
    buttonPress(scene, target, onComplete = null) {
        return scene.tweens.add({
            targets: target,
            scaleX: 0.95,
            scaleY: 0.95,
            duration: 50,
            yoyo: true,
            ease: 'Power2',
            onComplete: onComplete
        });
    },

    /**
     * Slide in from direction
     * @param {Phaser.Scene} scene - The scene
     * @param {Phaser.GameObjects.GameObject} target - Target object
     * @param {string} direction - Direction: 'left', 'right', 'top', 'bottom'
     * @param {number} duration - Duration in ms (default: 500)
     * @param {function} onComplete - Callback when complete
     */
    slideIn(scene, target, direction = 'left', duration = 500, onComplete = null) {
        const { width, height } = scene.scale;
        let startX = target.x;
        let startY = target.y;
        const endX = target.x;
        const endY = target.y;

        switch (direction) {
            case 'left':
                startX = -target.width;
                break;
            case 'right':
                startX = width + target.width;
                break;
            case 'top':
                startY = -target.height;
                break;
            case 'bottom':
                startY = height + target.height;
                break;
        }

        target.setPosition(startX, startY);

        return scene.tweens.add({
            targets: target,
            x: endX,
            y: endY,
            duration: duration,
            ease: 'Power2',
            onComplete: onComplete
        });
    },

    /**
     * Slide out to direction
     * @param {Phaser.Scene} scene - The scene
     * @param {Phaser.GameObjects.GameObject} target - Target object
     * @param {string} direction - Direction: 'left', 'right', 'top', 'bottom'
     * @param {number} duration - Duration in ms (default: 500)
     * @param {function} onComplete - Callback when complete
     */
    slideOut(scene, target, direction = 'left', duration = 500, onComplete = null) {
        const { width, height } = scene.scale;
        let endX = target.x;
        let endY = target.y;

        switch (direction) {
            case 'left':
                endX = -target.width;
                break;
            case 'right':
                endX = width + target.width;
                break;
            case 'top':
                endY = -target.height;
                break;
            case 'bottom':
                endY = height + target.height;
                break;
        }

        return scene.tweens.add({
            targets: target,
            x: endX,
            y: endY,
            duration: duration,
            ease: 'Power2',
            onComplete: onComplete
        });
    },

    /**
     * Elastic bounce effect
     * @param {Phaser.Scene} scene - The scene
     * @param {Phaser.GameObjects.GameObject} target - Target object
     * @param {number} duration - Duration in ms (default: 800)
     */
    elastic(scene, target, duration = 800) {
        const originalScale = target.scale;

        target.setScale(0);

        return scene.tweens.add({
            targets: target,
            scaleX: originalScale,
            scaleY: originalScale,
            duration: duration,
            ease: 'Elastic.easeOut'
        });
    },

    /**
     * Rotate effect
     * @param {Phaser.Scene} scene - The scene
     * @param {Phaser.GameObjects.GameObject} target - Target object
     * @param {number} angle - Target angle in degrees (default: 360)
     * @param {number} duration - Duration in ms (default: 1000)
     * @param {boolean} loop - Loop animation (default: false)
     */
    rotate(scene, target, angle = 360, duration = 1000, loop = false) {
        return scene.tweens.add({
            targets: target,
            angle: angle,
            duration: duration,
            repeat: loop ? -1 : 0,
            ease: 'Linear'
        });
    },

    /**
     * Glow effect (for text or sprites with tint)
     * @param {Phaser.Scene} scene - The scene
     * @param {Phaser.GameObjects.GameObject} target - Target object
     * @param {number} tint - Target tint color (default: 0xffff00)
     * @param {number} duration - Duration in ms (default: 500)
     */
    glow(scene, target, tint = 0xffff00, duration = 500) {
        const originalTint = target.tintTopLeft;

        return scene.tweens.add({
            targets: target,
            tint: tint,
            duration: duration,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
            onComplete: () => {
                if (originalTint) {
                    target.setTint(originalTint);
                } else {
                    target.clearTint();
                }
            }
        });
    }
};

export default tweenPresets;

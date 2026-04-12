import { PLAY_WIDTH, PLAY_HEIGHT } from '../PlayAreaConfig.js';

/**
 * Helper Hand Manager
 * Manages auto-popping helper hand cursors that seek and pop bubbles.
 *
 * All positions use the fixed PLAY_WIDTH x PLAY_HEIGHT coordinate space.
 * The gameplay container handles scaling to screen.
 *
 * @example
 * const hands = new HelperHandManager(scene, gameplayContainer);
 * hands.spawnHand(upgradeDef);
 * hands.update(dt, bubbles);
 */
export default class HelperHandManager {
    /**
     * @param {Phaser.Scene} scene - The parent Phaser scene
     * @param {Phaser.GameObjects.Container} container - Gameplay container
     */
    constructor(scene, container) {
        this.scene = scene;
        this.container = container;

        /** @type {Array<Object>} Active helper hand state objects */
        this.helperHands = [];
    }

    /**
     * Spawn a new helper hand at a random play area position.
     * @param {Object} def - Upgrade definition with color, popInterval, moveSpeed
     */
    spawnHand(def) {
        const x = Phaser.Math.Between(80, PLAY_WIDTH - 80);
        const y = Phaser.Math.Between(80, PLAY_HEIGHT - 80);

        const gfx = this.scene.add.graphics();
        gfx.setPosition(x, y);
        gfx.setDepth(200);
        this._drawHandCursor(gfx, def.color, false);
        this.container.add(gfx);

        this.helperHands.push({
            gfx,
            x, y,
            target: null,
            cooldown: 0,
            popInterval: def.popInterval / 1000,
            moveSpeed: def.moveSpeed || 120,
            color: def.color,
            clicking: false,
            clickTimer: 0,
        });
    }

    /**
     * Update all helper hands: targeting, movement, and popping.
     * @param {number} dt - Delta time in seconds
     * @param {Bubble[]} bubbles - Array of active bubbles to target
     */
    update(dt, bubbles) {
        for (const hand of this.helperHands) {
            if (hand.clicking) {
                hand.clickTimer -= dt;
                if (hand.clickTimer <= 0) {
                    hand.clicking = false;
                    hand.gfx.setScale(1);
                    hand.gfx.clear();
                    this._drawHandCursor(hand.gfx, hand.color, false);
                    hand.cooldown = hand.popInterval;
                }
                continue;
            }

            // Find nearest alive bubble
            let best = null;
            let bestDist = Infinity;
            for (let i = 0; i < bubbles.length; i++) {
                const b = bubbles[i];
                if (!b || !b.active || b.isPopped) continue;
                const dx = b.x - hand.x;
                const dy = b.y - hand.y;
                const d = dx * dx + dy * dy;
                if (d < bestDist) {
                    bestDist = d;
                    best = b;
                }
            }
            hand.target = best;

            if (best) {
                // Move toward target
                const dx = best.x - hand.x;
                const dy = best.y - hand.y;
                const dist = Math.sqrt(dx * dx + dy * dy) || 0.1;

                if (dist > 5) {
                    const step = Math.min(hand.moveSpeed * dt, dist);
                    hand.x += (dx / dist) * step;
                    hand.y += (dy / dist) * step;
                    hand.gfx.setPosition(hand.x, hand.y);
                }

                // Close enough and cooldown ready → pop
                hand.cooldown -= dt;
                if (dist < best.radius + 10 && hand.cooldown <= 0) {
                    hand.clicking = true;
                    hand.clickTimer = 0.15;
                    hand.gfx.setScale(0.7);
                    hand.gfx.clear();
                    this._drawHandCursor(hand.gfx, hand.color, true);

                    if (best.active && !best.isPopped) {
                        best.pop();
                    }
                }
            } else {
                // No bubbles — drift slowly toward center of play area
                const cx = PLAY_WIDTH / 2;
                const cy = PLAY_HEIGHT / 2;
                const dx = cx - hand.x;
                const dy = cy - hand.y;
                const dist = Math.sqrt(dx * dx + dy * dy) || 0.1;
                if (dist > 30) {
                    const step = hand.moveSpeed * 0.3 * dt;
                    hand.x += (dx / dist) * step;
                    hand.y += (dy / dist) * step;
                    hand.gfx.setPosition(hand.x, hand.y);
                }
                hand.cooldown -= dt;
            }
        }
    }

    /**
     * Clamp all hand positions within the play area bounds.
     */
    clampPositions() {
        this.helperHands.forEach(h => {
            if (h.x > PLAY_WIDTH - 30) h.x = PLAY_WIDTH - 30;
            if (h.y > PLAY_HEIGHT - 30) h.y = PLAY_HEIGHT - 30;
            h.gfx.setPosition(h.x, h.y);
        });
    }

    /**
     * Draw the hand cursor graphic.
     * @param {Phaser.GameObjects.Graphics} gfx - Graphics object to draw on
     * @param {number} color - Fill color
     * @param {boolean} pressed - Whether the hand is in click state
     * @private
     */
    _drawHandCursor(gfx, color, pressed) {
        const fingerLen = pressed ? 12 : 18;
        // Palm
        gfx.fillStyle(color, 0.9);
        gfx.fillRoundedRect(-8, -4, 16, 20, 4);
        // Index finger
        gfx.fillRoundedRect(-3, -4 - fingerLen, 7, fingerLen, 3);
        // Thumb
        gfx.fillRoundedRect(-12, -2, 8, 6, 2);
        // Outline
        gfx.lineStyle(1.5, 0xffffff, 0.5);
        gfx.strokeRoundedRect(-8, -4, 16, 20, 4);
        gfx.strokeRoundedRect(-3, -4 - fingerLen, 7, fingerLen, 3);
    }

    /**
     * Destroy all helper hand graphics and clean up.
     */
    destroy() {
        this.helperHands.forEach(h => {
            if (h.gfx) h.gfx.destroy();
        });
        this.helperHands = [];
    }
}

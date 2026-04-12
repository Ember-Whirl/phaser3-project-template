import Bubble from '../objects/Bubble.js';
import { GENERATOR_DEFS } from '../data/generators.js';
import { UPGRADE_DEFS } from '../data/upgrades.js';
import { PLAY_WIDTH, PLAY_HEIGHT } from '../PlayAreaConfig.js';

/** Base lucky bubble chance (1%) */
const BASE_LUCKY_CHANCE = 0.01;

/**
 * Generator Manager
 * Manages bubble generator ownership, spawn timers, bubble creation,
 * and cascade mechanics.
 *
 * All positions use the fixed PLAY_WIDTH x PLAY_HEIGHT coordinate space.
 * The gameplay container handles scaling to screen.
 *
 * @example
 * const generators = new GeneratorManager(scene, {
 *     getUpgrades: () => upgrades,
 *     container: gameplayContainer,
 *     pickSpawnMachine: (id, i) => machine,
 *     onBubblePopped: (value, bubble) => { ... },
 *     bubbles: bubblesArray,
 * });
 * generators.init();
 * generators.startAll();
 */
export default class GeneratorManager {
    /**
     * @param {Phaser.Scene} scene - The parent Phaser scene
     * @param {Object} config - Configuration callbacks and shared state
     * @param {() => Object<string, number>} config.getUpgrades - Returns upgrade ownership map
     * @param {Phaser.GameObjects.Container} config.container - Gameplay container
     * @param {(genId: string, unitIndex: number) => Object|null} config.pickSpawnMachine - Picks a machine visual for spawn animation
     * @param {(value: number, bubble: Bubble) => void} config.onBubblePopped - Called when a bubble is popped
     * @param {Bubble[]} config.bubbles - Shared mutable bubbles array
     */
    constructor(scene, config) {
        this.scene = scene;
        this.getUpgrades = config.getUpgrades;
        this.container = config.container;
        this.pickSpawnMachine = config.pickSpawnMachine;
        this.onBubblePopped = config.onBubblePopped;
        this.bubbles = config.bubbles;

        /** @type {Object<string, number>} Generator id → owned count */
        this.generators = {};

        /** @type {Object<string, Phaser.Time.TimerEvent>} Generator id → timer */
        this.generatorTimers = {};
    }

    /**
     * Initialize generator ownership from definitions. Gives the player one basic generator free.
     */
    init() {
        GENERATOR_DEFS.forEach(def => {
            this.generators[def.id] = 0;
        });
        this.generators['basic'] = 1;
    }

    /**
     * Start timers for all generators that have at least one owned unit.
     */
    startAll() {
        GENERATOR_DEFS.forEach(def => {
            if (this.generators[def.id] > 0) {
                this.startGeneratorTimer(def);
            }
        });
    }

    /**
     * Buy one unit of a generator.
     * @param {Object} def - Generator definition
     */
    addGenerator(def) {
        this.generators[def.id]++;
        this.startGeneratorTimer(def);
    }

    /**
     * Get the owned count for a generator type.
     * @param {string} id - Generator definition id
     * @returns {number}
     */
    getOwned(id) {
        return this.generators[id] || 0;
    }

    /**
     * Calculate the effective cooldown for a generator, applying spawn-rate upgrades.
     * @param {Object} def - Generator definition
     * @returns {number} Cooldown in milliseconds
     * @private
     */
    getEffectiveCooldown(def) {
        const rateUpgrade = UPGRADE_DEFS.find(u => u.category === 'spawnRate' && u.tier === def.tier);
        if (!rateUpgrade) return def.cooldown;
        const upgrades = this.getUpgrades();
        const level = upgrades[rateUpgrade.id] || 0;
        if (level === 0) return def.cooldown;
        const reduction = 1 - (level * rateUpgrade.reductionPerLevel);
        return Math.max(100, Math.round(def.cooldown * reduction));
    }

    /**
     * Calculate how many bubbles spawn per tick, applying multi-spawn upgrades.
     * @param {Object} def - Generator definition
     * @returns {number}
     * @private
     */
    getMultiSpawnCount(def) {
        const msUpgrade = UPGRADE_DEFS.find(u => u.category === 'multiSpawn' && u.tier === def.tier);
        if (!msUpgrade) return 1;
        const upgrades = this.getUpgrades();
        const level = upgrades[msUpgrade.id] || 0;
        return 1 + level;
    }

    /**
     * Calculate bonus bubble value for a given tier from upgrades.
     * @param {string} tier - Generator tier ('basic', 'medium', 'large')
     * @returns {number} Extra value to add to base bubble value
     * @private
     */
    getBubbleValueBonus(tier) {
        const valUpgrade = UPGRADE_DEFS.find(u => u.category === 'bubbleValue' && u.tier === tier);
        if (!valUpgrade) return 0;
        const upgrades = this.getUpgrades();
        const level = upgrades[valUpgrade.id] || 0;
        return level * valUpgrade.bonusPerLevel;
    }

    /**
     * Calculate current lucky bubble spawn chance.
     * @returns {number} Probability 0–1
     * @private
     */
    getLuckyChance() {
        const luckyUpgrade = UPGRADE_DEFS.find(u => u.category === 'lucky');
        if (!luckyUpgrade) return BASE_LUCKY_CHANCE;
        const upgrades = this.getUpgrades();
        const level = upgrades[luckyUpgrade.id] || 0;
        return BASE_LUCKY_CHANCE + level * luckyUpgrade.bonusPerLevel;
    }

    /**
     * Start (or restart) the looping spawn timer for a generator.
     * @param {Object} def - Generator definition
     */
    startGeneratorTimer(def) {
        if (this.generatorTimers[def.id]) {
            this.generatorTimers[def.id].remove();
        }

        const count = this.generators[def.id];
        if (count <= 0) return;

        const cooldown = this.getEffectiveCooldown(def);

        this.generatorTimers[def.id] = this.scene.time.addEvent({
            delay: cooldown,
            callback: () => {
                const ownedCount = this.generators[def.id];
                const bubblesPerSpawn = this.getMultiSpawnCount(def);
                const luckyChance = this.getLuckyChance();

                for (let i = 0; i < ownedCount; i++) {
                    const machine = this.pickSpawnMachine(def.id, i);
                    for (let j = 0; j < bubblesPerSpawn; j++) {
                        const delay = i * 150 + j * 80;
                        this.scene.time.delayedCall(delay, () => {
                            const isLucky = Math.random() < luckyChance;
                            if (machine && machine.active) {
                                machine.triggerSpawn();
                                this.spawnBubble(def, isLucky, machine.nozzleX, machine.nozzleY);
                            } else {
                                this.spawnBubble(def, isLucky);
                            }
                        });
                    }
                }
            },
            loop: true
        });
    }

    /**
     * Spawn a single bubble with appropriate animation.
     * @param {Object} def - Generator definition
     * @param {boolean} [isLucky=false] - Whether this is a golden bubble
     * @param {number|null} [atX=null] - X position (machine nozzle), or null for random
     * @param {number|null} [atY=null] - Y position (machine nozzle), or null for random
     * @param {boolean} [isCascade=false] - Whether this is a cascade child
     * @returns {Bubble}
     */
    spawnBubble(def, isLucky = false, atX = null, atY = null, isCascade = false) {
        const pad = def.bubbleRadius + 80;

        let x, y;
        if (atX !== null && atY !== null) {
            x = atX;
            y = atY;
        } else {
            x = Phaser.Math.Between(pad, Math.max(pad + 1, PLAY_WIDTH - pad));
            y = PLAY_HEIGHT - Phaser.Math.Between(60, 140);
        }

        const centerX = PLAY_WIDTH / 2;
        const centerY = PLAY_HEIGHT * 0.4;
        const dxToCenter = centerX - x;
        const dyToCenter = centerY - y;
        const distToCenter = Math.sqrt(dxToCenter * dxToCenter + dyToCenter * dyToCenter) || 1;
        const launchSpeed = Phaser.Math.Between(80, 140);

        const radius = def.bubbleRadius;

        const valueBonus = this.getBubbleValueBonus(def.tier);
        const bubble = new Bubble(this.scene, x, y, {
            value: def.bubbleValue + valueBonus,
            radius: radius,
            color: def.bubbleColor,
            lifetime: Phaser.Math.Between(8000, 14000),
            tier: def.tier,
            isLucky: isLucky,
        });
        this.container.add(bubble);
        bubble.setDepth(50);

        if (isCascade) {
            const angle = Math.random() * Math.PI * 2;
            const burstSpeed = 150 + Math.random() * 100;
            bubble.vx = Math.cos(angle) * burstSpeed;
            bubble.vy = Math.sin(angle) * burstSpeed;

            bubble.setScale(0);
            this.scene.tweens.add({
                targets: bubble,
                scaleX: 1,
                scaleY: 1,
                duration: 400,
                ease: 'Back.easeOut'
            });
        } else if (atX !== null && atY !== null) {
            // Machine spawn — inflate at nozzle, drift up, then release
            bubble.inflating = true;
            bubble.disableInteractive();
            bubble.vx = 0;
            bubble.vy = 0;

            bubble.y = y + bubble.radius * 1.2;
            const floatDist = bubble.radius * 0.8;
            bubble.setScale(0);
            this.scene.tweens.add({
                targets: bubble,
                scaleX: 1,
                scaleY: 1,
                y: y - floatDist,
                duration: 500,
                ease: 'Sine.easeOut',
                onComplete: () => {
                    if (!bubble.active || bubble.isPopped) return;
                    bubble.inflating = false;
                    bubble.setInteractive({ useHandCursor: true });
                    bubble.vx = Phaser.Math.Between(-50, 50);
                    bubble.vy = -Phaser.Math.Between(220, 340);
                }
            });
        } else {
            const spread = 0.4;
            bubble.vx = (dxToCenter / distToCenter) * launchSpeed + Phaser.Math.Between(-20, 20);
            bubble.vy = (dyToCenter / distToCenter) * launchSpeed * (1 + Math.random() * spread);

            bubble.setScale(0);
            this.scene.tweens.add({
                targets: bubble,
                scaleX: 1,
                scaleY: 1,
                duration: 300,
                ease: 'Back.easeOut'
            });
        }

        bubble.on('popped', (value, poppedBubble) => {
            this.onBubblePopped(value, poppedBubble);
            this.tryCascade(poppedBubble);
        });

        bubble.on('destroy', () => {
            const idx = this.bubbles.indexOf(bubble);
            if (idx > -1) this.bubbles.splice(idx, 1);
        });

        this.bubbles.push(bubble);
        return bubble;
    }

    /**
     * Check if a popped bubble should trigger a cascade, and spawn children if so.
     * @param {Bubble} bubble - The bubble that was popped
     */
    tryCascade(bubble) {
        const tier = bubble.tier;
        if (tier === 'basic') return;

        const cascadeDef = UPGRADE_DEFS.find(u => u.category === 'cascade' && u.tier === tier);
        if (!cascadeDef) return;

        const upgrades = this.getUpgrades();
        const level = upgrades[cascadeDef.id] || 0;
        if (level === 0) return;

        const chance = level * cascadeDef.chancePerLevel;
        if (Math.random() >= chance) return;

        const childCount = Phaser.Math.Between(cascadeDef.minChildren, cascadeDef.maxChildren);
        const childGenDef = GENERATOR_DEFS.find(g => g.tier === cascadeDef.childTier);
        if (!childGenDef) return;

        this.showCascadeText(bubble.x, bubble.y);

        for (let i = 0; i < childCount; i++) {
            this.scene.time.delayedCall(i * 50, () => {
                this.spawnBubble(childGenDef, false, bubble.x, bubble.y, true);
            });
        }
    }

    /**
     * Show the animated "Chain!" text at a position.
     * @param {number} x - Gameplay X
     * @param {number} y - Gameplay Y
     * @private
     */
    showCascadeText(x, y) {
        const text = this.scene.add.text(x, y - 30, 'Chain!', {
            fontFamily: 'Arial Black',
            fontSize: '18px',
            color: '#ff88ff',
            stroke: '#000000',
            strokeThickness: 3,
            align: 'center'
        }).setOrigin(0.5).setDepth(201);
        this.container.add(text);

        this.scene.tweens.add({
            targets: text,
            y: y - 80,
            alpha: 0,
            scaleX: 1.3,
            scaleY: 1.3,
            duration: 700,
            ease: 'Quad.easeOut',
            onComplete: () => {
                text.destroy();
            }
        });
    }

    /**
     * Destroy all timers and clean up.
     */
    destroy() {
        Object.values(this.generatorTimers).forEach(timer => {
            if (timer) timer.remove();
        });
        this.generatorTimers = {};
    }
}

import { PLAY_WIDTH, PLAY_HEIGHT } from '../PlayAreaConfig.js';
import Fan from '../objects/Fan.js';
import GravityWell from '../objects/GravityWell.js';
import SpikeyWall from '../objects/SpikeyWall.js';
import Nail from '../objects/Nail.js';
import NailGun from '../objects/NailGun.js';

/**
 * @private
 * Map of obstacle id → constructor class
 */
const OBSTACLE_CLASSES = {
    fan: Fan,
    gravityWell: GravityWell,
    spikeyWall: SpikeyWall,
    nailGun: NailGun,
    nail: Nail,
};

/**
 * Physics Manager
 * Handles obstacle placement, bubble-bubble collisions, boundary bouncing,
 * speed clamping, and per-frame bubble updates.
 *
 * All gameplay logic uses the fixed PLAY_WIDTH x PLAY_HEIGHT coordinate
 * space. The gameplay container handles scaling to screen.
 *
 * @example
 * const physics = new PhysicsManager(scene, gameplayContainer);
 * physics.addObstacle(obstacleDef);
 * physics.update(time, delta, bubbles);
 */
export default class PhysicsManager {
    /**
     * @param {Phaser.Scene} scene - The parent Phaser scene
     * @param {Phaser.GameObjects.Container} container - Gameplay container
     */
    constructor(scene, container) {
        this.scene = scene;
        this.container = container;

        /** @type {Array<PhysicsObject>} Active obstacle instances */
        this.obstacles = [];

        /** @type {Object<string, number>} Obstacle id → owned count */
        this.ownedObstacles = {};
    }

    /**
     * Initialize obstacle ownership counts from definitions.
     * @param {Array<Object>} obstacleDefs - Array of obstacle definition objects
     */
    init(obstacleDefs) {
        obstacleDefs.forEach(def => {
            this.ownedObstacles[def.id] = 0;
        });
    }

    /**
     * Place a new obstacle instance in the play area at a random position.
     * @param {Object} def - Obstacle definition
     */
    addObstacle(def) {
        const pad = 100;
        const x = Phaser.Math.Between(pad, Math.max(pad + 1, PLAY_WIDTH - pad));
        const y = Phaser.Math.Between(pad, Math.max(pad + 1, PLAY_HEIGHT - pad));

        const ObstacleClass = OBSTACLE_CLASSES[def.id];
        if (!ObstacleClass) return;

        const obstacle = new ObstacleClass(this.scene, x, y, def);
        this.container.add(obstacle);
        this.obstacles.push(obstacle);
    }

    /**
     * Get the owned count for an obstacle type.
     * @param {string} id - Obstacle definition id
     * @returns {number}
     */
    getOwned(id) {
        return this.ownedObstacles[id] || 0;
    }

    /**
     * Increment owned count and place the obstacle.
     * @param {Object} def - Obstacle definition
     */
    buyObstacle(def) {
        this.ownedObstacles[def.id]++;
        this.addObstacle(def);
    }

    /**
     * Run one physics frame: obstacle effects, bubble collisions, boundary bounce,
     * speed clamping, and individual bubble updates.
     * @param {number} time - Scene time
     * @param {number} delta - Delta ms
     * @param {Bubble[]} bubbles - Mutable array of active bubbles
     */
    update(time, delta, bubbles) {
        const dt = delta / 1000;

        // Obstacle updates and effects
        for (let oi = 0; oi < this.obstacles.length; oi++) {
            const obs = this.obstacles[oi];
            if (!obs || !obs.active) continue;
            obs.update(time, delta);

            for (let bi = bubbles.length - 1; bi >= 0; bi--) {
                const bubble = bubbles[bi];
                if (!bubble || !bubble.active || bubble.isPopped) continue;

                obs.applyEffect(bubble, dt);

                if (obs.checkCollision(bubble)) {
                    bubble.pop();
                }
            }
        }

        // Bubble-bubble collisions
        const pushStrength = 350;
        const bounciness = 0.7;

        for (let i = bubbles.length - 1; i >= 0; i--) {
            const a = bubbles[i];
            if (!a || !a.active || a.isPopped) continue;

            for (let j = i + 1; j < bubbles.length; j++) {
                const b = bubbles[j];
                if (!b || !b.active || b.isPopped) continue;

                const dx = a.x - b.x;
                const dy = a.y - b.y;
                const dist = Math.sqrt(dx * dx + dy * dy) || 0.1;
                const touchDist = a.radius + b.radius;

                if (dist < touchDist) {
                    const penetration = 1 - (dist / touchDist);
                    const nx = dx / dist;
                    const ny = dy / dist;
                    const relVel = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny;
                    const velBonus = Math.max(0, relVel) * 1.5;
                    const force = pushStrength * penetration * penetration + velBonus;
                    const totalMass = a.mass + b.mass;
                    const aRatio = b.mass / totalMass;
                    const bRatio = a.mass / totalMass;

                    a.vx += nx * force * aRatio * dt;
                    a.vy += ny * force * aRatio * dt;
                    b.vx -= nx * force * bRatio * dt;
                    b.vy -= ny * force * bRatio * dt;
                }
            }

            // Boundary bouncing (fixed play area)
            const pad = a.radius * 0.6;
            if (a.x < pad) { a.x = pad; a.vx = Math.abs(a.vx) * bounciness; }
            if (a.x > PLAY_WIDTH - pad) { a.x = PLAY_WIDTH - pad; a.vx = -Math.abs(a.vx) * bounciness; }
            if (a.y > PLAY_HEIGHT - pad) { a.y = PLAY_HEIGHT - pad; a.vy = -Math.abs(a.vy) * bounciness; }
            if (a.y < pad) { a.y = pad; a.vy = Math.abs(a.vy) * bounciness; }

            // Speed clamping
            const maxSpeed = 220;
            const speed = Math.sqrt(a.vx * a.vx + a.vy * a.vy);
            if (speed > maxSpeed) {
                a.vx = (a.vx / speed) * maxSpeed;
                a.vy = (a.vy / speed) * maxSpeed;
            }

            a.update(time, delta);
        }
    }

    /**
     * Clamp obstacle positions within the play area bounds.
     */
    clampPositions() {
        this.obstacles.forEach(obs => {
            if (!obs || !obs.active) return;
            const pad = 30;
            if (obs.x > PLAY_WIDTH - pad) obs.x = PLAY_WIDTH - pad;
            if (obs.x < pad) obs.x = pad;
            if (obs.y > PLAY_HEIGHT - pad) obs.y = PLAY_HEIGHT - pad;
            if (obs.y < pad) obs.y = pad;
        });
    }

    /**
     * Destroy all obstacles and clean up.
     */
    destroy() {
        this.obstacles.forEach(obs => {
            if (obs && obs.active) obs.destroy();
        });
        this.obstacles = [];
    }
}

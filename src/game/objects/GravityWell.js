import PhysicsObject from './PhysicsObject.js';

export default class GravityWell extends PhysicsObject {
    constructor(scene, x, y, config = {}) {
        super(scene, x, y, {
            ...config,
            type: 'gravityWell',
            radius: config.effectRadius || 180,
        });
        this.effectRadius = config.effectRadius || 180;
        this.coreRadius = config.coreRadius || 25;
        this.strength = config.strength || 12000;
        this.color = config.color || 0x9933ff;
        this.pulsePhase = 0;
        this.drawVisual();
    }

    drawVisual() {
        this._drawWithPulse(0);
    }

    _drawWithPulse(pulse) {
        const gfx = this.gfx;
        gfx.clear();

        // Outer effect radius rings (pulsing)
        const ringCount = 3;
        for (let i = 0; i < ringCount; i++) {
            const t = (i + 1) / (ringCount + 1);
            const r = this.coreRadius + (this.effectRadius - this.coreRadius) * t;
            const pulseOffset = Math.sin(pulse + i * 0.8) * 8;
            const alpha = 0.15 - i * 0.03;
            gfx.lineStyle(1.5, this.color, alpha);
            gfx.strokeCircle(0, 0, r + pulseOffset);
        }

        // Core glow
        gfx.fillStyle(this.color, 0.25 + Math.sin(pulse * 2) * 0.1);
        gfx.fillCircle(0, 0, this.coreRadius * 1.5);

        // Core solid
        gfx.fillStyle(this.color, 0.6);
        gfx.fillCircle(0, 0, this.coreRadius);

        // Bright center
        gfx.fillStyle(0xffffff, 0.4);
        gfx.fillCircle(0, 0, this.coreRadius * 0.4);
    }

    update(time, delta) {
        const dt = delta / 1000;
        this.pulsePhase += dt * 2.5;
        this._drawWithPulse(this.pulsePhase);
    }

    applyEffect(bubble, dt) {
        const dx = this.x - bubble.x;
        const dy = this.y - bubble.y;
        const distSq = dx * dx + dy * dy;
        const dist = Math.sqrt(distSq) || 0.1;

        if (dist > this.effectRadius) return;

        if (dist < this.coreRadius) {
            // Slingshot: push bubble away from core
            const nx = -dx / dist;
            const ny = -dy / dist;
            const slingForce = 400;
            bubble.vx += nx * slingForce * dt;
            bubble.vy += ny * slingForce * dt;
        } else {
            // Attract toward core with inverse-distance force
            const nx = dx / dist;
            const ny = dy / dist;
            const force = this.strength / distSq;
            bubble.vx += nx * force * dt;
            bubble.vy += ny * force * dt;
        }
    }
}

import PhysicsObject from './PhysicsObject.js';

export default class Fan extends PhysicsObject {
    constructor(scene, x, y, config = {}) {
        super(scene, x, y, {
            ...config,
            type: 'fan',
            radius: Math.max(config.effectWidth || 80, config.effectHeight || 200) / 2,
        });
        this.effectWidth = config.effectWidth || 80;
        this.effectHeight = config.effectHeight || 200;
        this.strength = config.strength || 200;
        this.direction = config.direction || { x: 0, y: -1 };
        this.color = config.color || 0x66ccff;
        this.windPhase = 0;
        this.drawVisual();
    }

    drawVisual() {
        const gfx = this.gfx;
        gfx.clear();

        const hw = this.effectWidth / 2;
        const hh = this.effectHeight / 2;

        // Fan body (base rectangle)
        gfx.fillStyle(this.color || 0x66ccff, 0.15);
        gfx.fillRect(-hw, -hh, this.effectWidth, this.effectHeight);

        // Border
        gfx.lineStyle(2, this.color || 0x66ccff, 0.5);
        gfx.strokeRect(-hw, -hh, this.effectWidth, this.effectHeight);

        // Wind lines (animated in update)
        this._drawWindLines(0);
    }

    _drawWindLines(phase) {
        const gfx = this.gfx;
        const hw = this.effectWidth / 2;
        const hh = this.effectHeight / 2;
        const lineCount = 4;
        const color = this.color || 0x66ccff;

        for (let i = 0; i < lineCount; i++) {
            const t = (i / lineCount + phase) % 1;
            const lx = -hw + this.effectWidth * 0.2 + (this.effectWidth * 0.6) * (i / (lineCount - 1));
            const ly = hh - t * this.effectHeight;
            const alpha = Math.sin(t * Math.PI) * 0.6;

            gfx.lineStyle(2, color, alpha);
            gfx.beginPath();
            gfx.moveTo(lx, ly);
            gfx.lineTo(lx + this.direction.x * 10, ly + this.direction.y * 20);
            gfx.strokePath();

            // Arrow head
            gfx.fillStyle(color, alpha);
            gfx.fillTriangle(
                lx + this.direction.x * 10 - 4, ly + this.direction.y * 20,
                lx + this.direction.x * 10 + 4, ly + this.direction.y * 20,
                lx + this.direction.x * 10, ly + this.direction.y * 28
            );
        }
    }

    update(time, delta) {
        const dt = delta / 1000;
        this.windPhase = (this.windPhase + dt * 0.5) % 1;

        // Redraw with animated wind
        this.gfx.clear();
        const hw = this.effectWidth / 2;
        const hh = this.effectHeight / 2;

        this.gfx.fillStyle(this.color, 0.15);
        this.gfx.fillRect(-hw, -hh, this.effectWidth, this.effectHeight);
        this.gfx.lineStyle(2, this.color, 0.5);
        this.gfx.strokeRect(-hw, -hh, this.effectWidth, this.effectHeight);

        this._drawWindLines(this.windPhase);
    }

    applyEffect(bubble, dt) {
        // Check if bubble center is within the fan's rectangular zone
        const dx = bubble.x - this.x;
        const dy = bubble.y - this.y;
        const hw = this.effectWidth / 2;
        const hh = this.effectHeight / 2;

        if (dx > -hw && dx < hw && dy > -hh && dy < hh) {
            bubble.vx += this.direction.x * this.strength * dt;
            bubble.vy += this.direction.y * this.strength * dt;
        }
    }
}

import PhysicsObject from './PhysicsObject.js';

export default class NailGun extends PhysicsObject {
    constructor(scene, x, y, config = {}) {
        super(scene, x, y, {
            ...config,
            type: 'nailGun',
            radius: 25,
        });
        this.color = config.color || 0xff8800;
        this.fireRate = config.fireRate || 1.5;
        this.nailSpeed = config.nailSpeed || 350;
        this.nailRadius = config.nailRadius || 6;
        this.nailLifetime = config.nailLifetime || 3000;
        this.fireCooldown = 0;
        this.aimAngle = 0;
        this.projectiles = [];
        this.drawVisual();
    }

    drawVisual() {
        this._drawAtAngle(this.aimAngle);
    }

    _drawAtAngle(angle) {
        const gfx = this.gfx;
        gfx.clear();

        // Gun body (circle base)
        gfx.fillStyle(this.color, 0.7);
        gfx.fillCircle(0, 0, 20);
        gfx.lineStyle(2, this.color, 0.9);
        gfx.strokeCircle(0, 0, 20);

        // Barrel (line in aim direction)
        const bx = Math.cos(angle) * 30;
        const by = Math.sin(angle) * 30;
        gfx.lineStyle(6, this.color, 0.9);
        gfx.beginPath();
        gfx.moveTo(0, 0);
        gfx.lineTo(bx, by);
        gfx.strokePath();

        // Muzzle (small circle at barrel end)
        gfx.fillStyle(0xffcc00, 0.8);
        gfx.fillCircle(bx, by, 5);

        // Center dot
        gfx.fillStyle(0xffffff, 0.5);
        gfx.fillCircle(0, 0, 6);
    }

    _drawNail(gfx, r) {
        gfx.clear();
        // Nail body
        gfx.fillStyle(0xcccccc, 1.0);
        gfx.fillCircle(0, 0, r);
        // Tip shine
        gfx.fillStyle(0xffffff, 0.6);
        gfx.fillCircle(-1, -1, r * 0.4);
    }

    update(time, delta) {
        const dt = delta / 1000;

        // Find nearest bubble to aim at
        const bubbles = this.scene.bubbles;
        let nearestDist = Infinity;
        let target = null;
        for (let i = 0; i < bubbles.length; i++) {
            const b = bubbles[i];
            if (!b || !b.active || b.isPopped) continue;
            const dx = b.x - this.x;
            const dy = b.y - this.y;
            const dist = dx * dx + dy * dy;
            if (dist < nearestDist) {
                nearestDist = dist;
                target = b;
            }
        }

        if (target) {
            this.aimAngle = Math.atan2(target.y - this.y, target.x - this.x);
        }

        // Redraw gun at current aim angle
        this._drawAtAngle(this.aimAngle);

        // Fire cooldown
        this.fireCooldown -= dt;
        if (this.fireCooldown <= 0 && target) {
            this.fireNail();
            this.fireCooldown = this.fireRate;
        }

        // Update projectiles
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const p = this.projectiles[i];
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.age += delta;
            p.gfx.setPosition(p.x, p.y);

            // Remove if expired or off-screen
            const { width, height } = this.scene.scale;
            if (p.age > this.nailLifetime ||
                p.x < -20 || p.x > width + 20 ||
                p.y < -20 || p.y > height + 20) {
                p.gfx.destroy();
                this.projectiles.splice(i, 1);
            }
        }
    }

    fireNail() {
        const muzzleX = this.x + Math.cos(this.aimAngle) * 30;
        const muzzleY = this.y + Math.sin(this.aimAngle) * 30;

        const gfx = this.scene.add.graphics();
        gfx.setDepth(45);
        this._drawNail(gfx, this.nailRadius);
        gfx.setPosition(muzzleX, muzzleY);

        this.projectiles.push({
            x: muzzleX,
            y: muzzleY,
            vx: Math.cos(this.aimAngle) * this.nailSpeed,
            vy: Math.sin(this.aimAngle) * this.nailSpeed,
            age: 0,
            gfx: gfx,
        });
    }

    checkCollision(bubble) {
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const p = this.projectiles[i];
            const dx = bubble.x - p.x;
            const dy = bubble.y - p.y;
            const distSq = dx * dx + dy * dy;
            const touchDist = bubble.radius + this.nailRadius;

            if (distSq < touchDist * touchDist) {
                // Destroy this projectile on hit
                p.gfx.destroy();
                this.projectiles.splice(i, 1);
                return true;
            }
        }
        return false;
    }

    destroy() {
        // Clean up all projectiles
        for (const p of this.projectiles) {
            if (p.gfx) p.gfx.destroy();
        }
        this.projectiles = [];
        super.destroy();
    }
}

import PhysicsObject from './PhysicsObject.js';

export default class SpikeyWall extends PhysicsObject {
    constructor(scene, x, y, config = {}) {
        super(scene, x, y, {
            ...config,
            type: 'spikeyWall',
            radius: Math.max(config.wallWidth || 120, config.wallHeight || 20) / 2,
        });
        this.wallWidth = config.wallWidth || 120;
        this.wallHeight = config.wallHeight || 20;
        this.spikeCount = config.spikeCount || 8;
        this.spikeLength = config.spikeLength || 15;
        this.color = config.color || 0xff4444;
        this.drawVisual();
    }

    drawVisual() {
        const gfx = this.gfx;
        gfx.clear();

        const hw = this.wallWidth / 2;
        const hh = this.wallHeight / 2;

        // Wall body
        gfx.fillStyle(this.color, 0.6);
        gfx.fillRect(-hw, -hh, this.wallWidth, this.wallHeight);

        // Wall border
        gfx.lineStyle(2, this.color, 0.9);
        gfx.strokeRect(-hw, -hh, this.wallWidth, this.wallHeight);

        // Top spikes
        const spikeSpacing = this.wallWidth / this.spikeCount;
        gfx.fillStyle(this.color, 0.8);
        for (let i = 0; i < this.spikeCount; i++) {
            const sx = -hw + spikeSpacing * (i + 0.5);
            gfx.fillTriangle(
                sx - spikeSpacing * 0.35, -hh,
                sx + spikeSpacing * 0.35, -hh,
                sx, -hh - this.spikeLength
            );
        }

        // Bottom spikes
        for (let i = 0; i < this.spikeCount; i++) {
            const sx = -hw + spikeSpacing * (i + 0.5);
            gfx.fillTriangle(
                sx - spikeSpacing * 0.35, hh,
                sx + spikeSpacing * 0.35, hh,
                sx, hh + this.spikeLength
            );
        }
    }

    checkCollision(bubble) {
        // AABB check: bubble circle vs wall rect (including spike zone)
        const hw = this.wallWidth / 2;
        const hh = this.wallHeight / 2 + this.spikeLength;

        const dx = bubble.x - this.x;
        const dy = bubble.y - this.y;

        // Closest point on rect to bubble center
        const closestX = Math.max(-hw, Math.min(dx, hw));
        const closestY = Math.max(-hh, Math.min(dy, hh));

        const distX = dx - closestX;
        const distY = dy - closestY;
        const distSq = distX * distX + distY * distY;

        return distSq < bubble.radius * bubble.radius;
    }
}

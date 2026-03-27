import PhysicsObject from './PhysicsObject.js';

export default class Nail extends PhysicsObject {
    constructor(scene, x, y, config = {}) {
        super(scene, x, y, {
            ...config,
            type: 'nail',
            radius: config.tipRadius || 10,
        });
        this.nailLength = config.nailLength || 50;
        this.tipRadius = config.tipRadius || 10;
        this.color = config.color || 0xcccccc;
        this.animSpeed = config.animSpeed || 2.0;
        this.animAmplitude = config.animAmplitude || 60;
        this.animPhase = Math.random() * Math.PI * 2;
        this.tipOffsetX = 0;
        // Store base position for oscillation
        this.baseX = x;
        this.drawVisual();
    }

    drawVisual() {
        this._drawAtOffset(0);
    }

    _drawAtOffset(offsetX) {
        const gfx = this.gfx;
        gfx.clear();

        const tipX = offsetX;
        const tipY = this.nailLength / 2;
        const headY = -this.nailLength / 2;

        // Nail shaft
        gfx.lineStyle(4, this.color, 0.8);
        gfx.beginPath();
        gfx.moveTo(tipX * 0.3, headY);
        gfx.lineTo(tipX, tipY - this.tipRadius);
        gfx.strokePath();

        // Nail head (flat top)
        gfx.fillStyle(this.color, 0.9);
        gfx.fillRect(tipX * 0.3 - 10, headY - 4, 20, 8);

        // Nail tip (sharp point)
        gfx.fillStyle(0xeeeeee, 1.0);
        gfx.fillCircle(tipX, tipY, this.tipRadius);

        // Tip shine
        gfx.fillStyle(0xffffff, 0.5);
        gfx.fillCircle(tipX - 2, tipY - 2, this.tipRadius * 0.4);
    }

    update(time, delta) {
        const dt = delta / 1000;
        this.animPhase += this.animSpeed * dt;
        this.tipOffsetX = Math.sin(this.animPhase) * this.animAmplitude;
        this._drawAtOffset(this.tipOffsetX);
    }

    checkCollision(bubble) {
        // Check bubble vs the nail tip position (world space)
        const tipWorldX = this.x + this.tipOffsetX;
        const tipWorldY = this.y + this.nailLength / 2;

        const dx = bubble.x - tipWorldX;
        const dy = bubble.y - tipWorldY;
        const distSq = dx * dx + dy * dy;
        const touchDist = bubble.radius + this.tipRadius;

        return distSq < touchDist * touchDist;
    }
}

export default class PhysicsObject extends Phaser.GameObjects.Container {
    constructor(scene, x, y, config = {}) {
        super(scene, x, y);
        this.objectType = config.type || 'unknown';
        this.radius = config.radius || 30;
        this.isActive = true;
        this.gfx = scene.add.graphics();
        this.add(this.gfx);
        this.setDepth(40);
        scene.add.existing(this);
    }

    drawVisual() { /* override */ }

    applyEffect(bubble, dt) { /* override for force-based */ }

    checkCollision(bubble) { return false; /* override for collision-based */ }

    update(time, delta) { /* override for animation */ }

    destroy() {
        if (this.gfx) this.gfx.destroy();
        super.destroy();
    }
}

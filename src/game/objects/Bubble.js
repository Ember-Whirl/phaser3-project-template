export default class Bubble extends Phaser.GameObjects.Container {
    constructor(scene, x, y, config = {}) {
        super(scene, x, y);

        this.value = config.value || 1;
        this.radius = config.radius || 20;
        this.color = config.color || 0x87ceeb;
        this.lifetime = config.lifetime || 10000;
        this.spawnTime = scene.time.now;
        this.isPopped = false;

        // Mass scales with area (r^2), so big bubbles are much heavier
        this.mass = this.radius * this.radius;

        // Velocity-based movement
        this.vx = Phaser.Math.Between(-15, 15);
        this.vy = -Phaser.Math.Between(30, 60);

        // Gentle wobble
        this.wobblePhase = Math.random() * Math.PI * 2;
        this.wobbleSpeed = 1.5 + Math.random() * 1.5;
        this.wobbleAmplitude = 8 + Math.random() * 12;

        // Draw the bubble
        this.gfx = scene.add.graphics();
        this.drawBubble();
        this.add(this.gfx);

        // Value text (shown on hover)
        this.valueText = scene.add.text(0, 0, `$${this.value}`, {
            fontFamily: 'Arial',
            fontSize: `${Math.max(12, this.radius * 0.6)}px`,
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2,
            align: 'center'
        }).setOrigin(0.5).setAlpha(0);
        this.add(this.valueText);

        // Make interactive
        this.setSize(this.radius * 2, this.radius * 2);
        this.setInteractive({ useHandCursor: true });

        this.on('pointerover', () => {
            if (!this.isPopped) {
                this.valueText.setAlpha(1);
                this.setScale(1.1);
            }
        });

        this.on('pointerout', () => {
            if (!this.isPopped) {
                this.valueText.setAlpha(0);
                this.setScale(1.0);
            }
        });

        this.on('pointerdown', () => {
            if (!this.isPopped) {
                this.pop();
            }
        });

        scene.add.existing(this);
    }

    drawBubble() {
        const r = this.radius;
        const c = this.color;

        // Main bubble body
        this.gfx.fillStyle(c, 0.5);
        this.gfx.fillCircle(0, 0, r);

        // Bubble outline
        this.gfx.lineStyle(2, c, 0.8);
        this.gfx.strokeCircle(0, 0, r);

        // Highlight / shine
        this.gfx.fillStyle(0xffffff, 0.4);
        this.gfx.fillCircle(-r * 0.25, -r * 0.3, r * 0.3);
    }

    pop() {
        if (this.isPopped) return;
        this.isPopped = true;

        this.disableInteractive();

        // Emit event so game scene can add money
        this.emit('popped', this.value);

        // Pop animation - expand and fade
        this.scene.tweens.add({
            targets: this,
            scaleX: 1.8,
            scaleY: 1.8,
            alpha: 0,
            duration: 200,
            ease: 'Quad.easeOut',
            onComplete: () => {
                this.destroy();
            }
        });

        // Spawn particles (small circles)
        this.spawnPopParticles();
    }

    spawnPopParticles() {
        const count = 6;
        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2;
            const particle = this.scene.add.graphics();
            particle.fillStyle(this.color, 0.7);
            particle.fillCircle(0, 0, this.radius * 0.15);
            particle.setPosition(this.x, this.y);

            this.scene.tweens.add({
                targets: particle,
                x: this.x + Math.cos(angle) * this.radius * 2.5,
                y: this.y + Math.sin(angle) * this.radius * 2.5,
                alpha: 0,
                duration: 300,
                ease: 'Quad.easeOut',
                onComplete: () => {
                    particle.destroy();
                }
            });
        }
    }

    update(time, delta) {
        if (this.isPopped) return;

        const dt = delta / 1000;

        // Apply velocity
        this.x += this.vx * dt;
        this.y += this.vy * dt;

        // Add wobble on top of velocity
        this.wobblePhase += this.wobbleSpeed * dt;
        this.x += Math.sin(this.wobblePhase) * this.wobbleAmplitude * dt;

        // Gentle friction so things slow down over time
        this.vx *= 0.998;
        this.vy *= 0.998;

        // Check lifetime
        const age = time - this.spawnTime;
        const remaining = this.lifetime - age;

        // Fade out in last 2 seconds
        if (remaining < 2000) {
            this.setAlpha(remaining / 2000);
        }

        // Expire
        if (remaining <= 0 || this.y < -this.radius * 2) {
            this.isPopped = true;
            this.destroy();
        }
    }
}

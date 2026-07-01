export default class Bubble extends Phaser.GameObjects.Container {
    constructor(scene, x, y, config = {}) {
        super(scene, x, y);

        this.value = config.value || 1;
        this.radius = config.radius || 20;
        this.color = config.color || 0x87ceeb;
        this.lifetime = config.lifetime || 10000;
        this.spawnTime = scene.time.now;
        this.isPopped = false;
        this.inflating = false; // true while inflate animation plays — freezes physics

        // Tier system
        this.tier = config.tier || 'basic';

        // Lucky bubble
        this.isLucky = config.isLucky || false;
        if (this.isLucky) {
            this.color = 0xFFD700; // Golden override
        }

        // Mass scales with area (r^2), so big bubbles are much heavier
        this.mass = this.radius * this.radius;

        // Velocity-based movement
        this.vx = Phaser.Math.Between(-15, 15);
        this.vy = -Phaser.Math.Between(30, 60);

        // Gentle wobble
        this.wobblePhase = Math.random() * Math.PI * 2;
        this.wobbleSpeed = 1.5 + Math.random() * 1.5;
        this.wobbleAmplitude = 8 + Math.random() * 12;

        // Lucky glow pulse state
        this.glowPhase = 0;

        // Draw the bubble
        this.gfx = scene.add.graphics();
        this.drawBubble();
        this.add(this.gfx);

        // Sparkle graphics for lucky bubbles
        if (this.isLucky) {
            this.sparkleGfx = scene.add.graphics();
            this.sparklePhase = Math.random() * Math.PI * 2;
            this.add(this.sparkleGfx);
        }

        // Value text (shown on hover)
        const valueLabel = this.isLucky ? `$${this.value} x2!` : `$${this.value}`;
        this.valueText = scene.add.text(0, 0, valueLabel, {
            fontFamily: 'Arial',
            fontSize: `${Math.max(12, this.radius * 0.6)}px`,
            color: this.isLucky ? '#ffd700' : '#ffffff',
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

    getPopValue() {
        return this.isLucky ? this.value * 2 : this.value;
    }

    drawBubble() {
        const r = this.radius;
        const c = this.color;

        // Main bubble body
        this.gfx.fillStyle(c, this.isLucky ? 0.65 : 0.5);
        this.gfx.fillCircle(0, 0, r);

        // Bubble outline
        this.gfx.lineStyle(this.isLucky ? 3 : 2, c, this.isLucky ? 1.0 : 0.8);
        this.gfx.strokeCircle(0, 0, r);

        // Highlight / shine
        this.gfx.fillStyle(0xffffff, this.isLucky ? 0.5 : 0.4);
        this.gfx.fillCircle(-r * 0.25, -r * 0.3, r * 0.3);
    }

    pop() {
        if (this.isPopped) return;
        this.isPopped = true;

        this.disableInteractive();

        const popValue = this.getPopValue();

        // Emit event so game scene can add money and handle cascade
        this.emit('popped', popValue, this);

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
        const count = this.isLucky ? 10 : 6;
        const particleColor = this.isLucky ? 0xFFD700 : this.color;

        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2;
            const particle = this.scene.add.graphics();
            particle.fillStyle(particleColor, 0.7);
            particle.fillCircle(0, 0, this.radius * 0.15);
            particle.setPosition(this.x, this.y);

            this.scene.tweens.add({
                targets: particle,
                x: this.x + Math.cos(angle) * this.radius * 2.5,
                y: this.y + Math.sin(angle) * this.radius * 2.5,
                alpha: 0,
                duration: this.isLucky ? 450 : 300,
                ease: 'Quad.easeOut',
                onComplete: () => {
                    particle.destroy();
                }
            });
        }
    }

    update(time, delta) {
        if (this.isPopped) return;
        if (this.inflating) return; // frozen at nozzle during inflate

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

        // Lucky bubble: pulsing glow
        if (this.isLucky) {
            this.glowPhase += dt * 3;
            const pulse = 0.85 + Math.sin(this.glowPhase) * 0.15;
            this.gfx.setAlpha(pulse);

            // Sparkle particles orbiting
            if (this.sparkleGfx) {
                this.sparklePhase += dt * 2.5;
                this.sparkleGfx.clear();
                for (let i = 0; i < 3; i++) {
                    const angle = this.sparklePhase + (i * Math.PI * 2 / 3);
                    const dist = this.radius * 0.75;
                    const sx = Math.cos(angle) * dist;
                    const sy = Math.sin(angle) * dist;
                    const sparkleAlpha = 0.5 + Math.sin(this.sparklePhase * 2 + i) * 0.3;
                    this.sparkleGfx.fillStyle(0xffffff, sparkleAlpha);
                    this.sparkleGfx.fillCircle(sx, sy, 2.5);
                }
            }
        }

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

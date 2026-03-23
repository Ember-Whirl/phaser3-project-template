import { Scene } from 'phaser';

export class MainMenu extends Scene {
    constructor() {
        super('MainMenu');
    }

    create() {
        const { width, height } = this.scale;

        // Background
        this.cameras.main.setBackgroundColor(0x1a1a2e);
        const bg = this.add.graphics();
        bg.fillGradientStyle(0x0f0c29, 0x0f0c29, 0x302b63, 0x24243e, 1);
        bg.fillRect(0, 0, width, height);

        // Decorative floating bubbles in background
        this.decorBubbles = [];
        for (let i = 0; i < 15; i++) {
            const r = Phaser.Math.Between(15, 50);
            const bx = Phaser.Math.Between(r, width - r);
            const by = Phaser.Math.Between(r, height - r);
            const colors = [0x87ceeb, 0x98fb98, 0xdda0dd, 0xffd700, 0xff6347];
            const color = Phaser.Utils.Array.GetRandom(colors);

            const g = this.add.graphics();
            g.fillStyle(color, 0.2);
            g.fillCircle(0, 0, r);
            g.lineStyle(1.5, color, 0.3);
            g.strokeCircle(0, 0, r);
            g.fillStyle(0xffffff, 0.15);
            g.fillCircle(-r * 0.25, -r * 0.3, r * 0.3);
            g.setPosition(bx, by);

            this.decorBubbles.push({
                gfx: g,
                originX: bx,
                phase: Math.random() * Math.PI * 2,
                speed: 0.3 + Math.random() * 0.5,
                amplitude: Phaser.Math.Between(10, 30),
                floatSpeed: Phaser.Math.Between(15, 35)
            });
        }

        // Title
        this.add.text(width / 2, height * 0.25, 'Idle Bubbles', {
            fontFamily: 'Arial Black',
            fontSize: '64px',
            color: '#87ceeb',
            stroke: '#000000',
            strokeThickness: 6,
            align: 'center'
        }).setOrigin(0.5);

        // Subtitle
        this.add.text(width / 2, height * 0.25 + 60, 'Pop bubbles. Get rich.', {
            fontFamily: 'Arial',
            fontSize: '22px',
            color: '#aaaacc',
            align: 'center'
        }).setOrigin(0.5);

        // Play button (drawn with graphics)
        const btnW = 220;
        const btnH = 60;
        const btnX = width / 2;
        const btnY = height * 0.55;

        const btnBg = this.add.graphics();
        this.drawButton(btnBg, btnX, btnY, btnW, btnH, 0x4caf50, false);

        const btnText = this.add.text(btnX, btnY, 'PLAY', {
            fontFamily: 'Arial Black',
            fontSize: '30px',
            color: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);

        const btnZone = this.add.zone(btnX, btnY, btnW, btnH)
            .setInteractive({ useHandCursor: true });

        btnZone.on('pointerover', () => {
            btnBg.clear();
            this.drawButton(btnBg, btnX, btnY, btnW, btnH, 0x5cbf60, true);
        });

        btnZone.on('pointerout', () => {
            btnBg.clear();
            this.drawButton(btnBg, btnX, btnY, btnW, btnH, 0x4caf50, false);
        });

        btnZone.on('pointerdown', () => {
            this.scene.start('Game');
        });

        this.scale.on('resize', this.onResize, this);
    }

    drawButton(gfx, x, y, w, h, color, hovered) {
        gfx.fillStyle(color, hovered ? 1 : 0.9);
        gfx.fillRoundedRect(x - w / 2, y - h / 2, w, h, 12);
        if (hovered) {
            gfx.lineStyle(2, 0xffffff, 0.4);
            gfx.strokeRoundedRect(x - w / 2, y - h / 2, w, h, 12);
        }
    }

    update(time, delta) {
        // Animate decorative bubbles
        this.decorBubbles.forEach(b => {
            b.phase += (b.speed * delta) / 1000;
            b.gfx.x = b.originX + Math.sin(b.phase) * b.amplitude;
            b.gfx.y -= (b.floatSpeed * delta) / 1000;

            // Wrap around when going off top
            const { height } = this.scale;
            if (b.gfx.y < -60) {
                b.gfx.y = height + 60;
                b.originX = Phaser.Math.Between(60, this.scale.width - 60);
            }
        });
    }

    onResize() {
        // Could rebuild UI here if needed
    }

    shutdown() {
        this.scale.off('resize', this.onResize, this);
    }
}

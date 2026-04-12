import { Scene } from 'phaser';
import PortalManager from '../../scripts/adapters/portals/portalManager';

export class MainMenu extends Scene {
    constructor() {
        super('MainMenu');
    }

    create() {
        PortalManager.gameplayStop();
        const { width, height } = this.scale;

        // Background
        this.cameras.main.setBackgroundColor(0x1a1a2e);
        this.bgGraphics = this.add.graphics();
        this.drawBackground(width, height);

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
        const scaledTitleSize = Math.max(32, Math.min(64, width * 0.06));
        this.titleText = this.add.text(width / 2, height * 0.25, 'Idle Bubbles', {
            fontFamily: 'Arial Black',
            fontSize: `${scaledTitleSize}px`,
            color: '#87ceeb',
            stroke: '#000000',
            strokeThickness: 6,
            align: 'center'
        }).setOrigin(0.5);

        // Subtitle
        const scaledSubSize = Math.max(14, Math.min(22, width * 0.022));
        const subtitleOffset = scaledTitleSize * 0.95;
        this.subtitleText = this.add.text(width / 2, height * 0.25 + subtitleOffset, 'Pop bubbles. Get rich.', {
            fontFamily: 'Arial',
            fontSize: `${scaledSubSize}px`,
            color: '#aaaacc',
            align: 'center'
        }).setOrigin(0.5);

        // Play button (drawn with graphics)
        const btnW = Math.max(160, Math.min(220, width * 0.2));
        const btnH = Math.max(44, Math.min(60, height * 0.08));
        const btnX = width / 2;
        const btnY = height * 0.55;

        this.btnBg = this.add.graphics();
        this.drawButton(this.btnBg, btnX, btnY, btnW, btnH, 0x4caf50, false);

        const scaledBtnFont = Math.max(18, Math.min(30, width * 0.03));
        this.btnText = this.add.text(btnX, btnY, 'PLAY', {
            fontFamily: 'Arial Black',
            fontSize: `${scaledBtnFont}px`,
            color: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);

        this.btnZone = this.add.zone(btnX, btnY, btnW, btnH)
            .setInteractive({ useHandCursor: true });

        // Store button dimensions for resize
        this.btnW = btnW;
        this.btnH = btnH;

        this.btnZone.on('pointerover', () => {
            this.btnBg.clear();
            this.drawButton(this.btnBg, this.btnText.x, this.btnText.y, this.btnW, this.btnH, 0x5cbf60, true);
        });

        this.btnZone.on('pointerout', () => {
            this.btnBg.clear();
            this.drawButton(this.btnBg, this.btnText.x, this.btnText.y, this.btnW, this.btnH, 0x4caf50, false);
        });

        this.btnZone.on('pointerdown', () => {
            this.scene.start('Game');
        });

        this.scale.on('resize', this.onResize, this);
        this.events.on('shutdown', this.shutdown, this);
    }

    drawBackground(width, height) {
        this.bgGraphics.clear();
        this.bgGraphics.fillGradientStyle(0x0f0c29, 0x0f0c29, 0x302b63, 0x24243e, 1);
        this.bgGraphics.fillRect(0, 0, width, height);
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

    onResize(gameSize) {
        if (!this.scene.isActive('MainMenu')) return;
        const { width, height } = gameSize;

        // Redraw background
        this.drawBackground(width, height);

        // Reposition title with scaled font
        const scaledTitleSize = Math.max(32, Math.min(64, width * 0.06));
        this.titleText.setPosition(width / 2, height * 0.25);
        this.titleText.setFontSize(scaledTitleSize);

        // Reposition subtitle
        const scaledSubSize = Math.max(14, Math.min(22, width * 0.022));
        const subtitleOffset = scaledTitleSize * 0.95;
        this.subtitleText.setPosition(width / 2, height * 0.25 + subtitleOffset);
        this.subtitleText.setFontSize(scaledSubSize);

        // Reposition play button
        const btnW = Math.max(160, Math.min(220, width * 0.2));
        const btnH = Math.max(44, Math.min(60, height * 0.08));
        const btnX = width / 2;
        const btnY = height * 0.55;

        this.btnW = btnW;
        this.btnH = btnH;

        this.btnBg.clear();
        this.drawButton(this.btnBg, btnX, btnY, btnW, btnH, 0x4caf50, false);

        const scaledBtnFont = Math.max(18, Math.min(30, width * 0.03));
        this.btnText.setPosition(btnX, btnY);
        this.btnText.setFontSize(scaledBtnFont);

        this.btnZone.setPosition(btnX, btnY);
        this.btnZone.setSize(btnW, btnH);

        // Update decorative bubble originX bounds for new width
        this.decorBubbles.forEach(b => {
            if (b.originX > width - 60) {
                b.originX = Phaser.Math.Between(60, width - 60);
            }
        });
    }

    shutdown() {
        this.scale.off('resize', this.onResize, this);
    }
}

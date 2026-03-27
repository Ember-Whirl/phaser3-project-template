export default class BubbleMachine extends Phaser.GameObjects.Container {
    constructor(scene, x, y, config = {}) {
        super(scene, x, y);

        this.tier = config.tier || 'basic';
        this.color = config.color || 0x87ceeb;
        this.machineIndex = config.machineIndex || 0;

        // Animation state
        this.phase = Math.random() * Math.PI * 2;
        this.spawnFlashTimer = 0;

        // Size per tier
        this.machineWidth = this.tier === 'large' ? 80 : this.tier === 'medium' ? 60 : 44;
        this.machineHeight = this.tier === 'large' ? 90 : this.tier === 'medium' ? 70 : 55;

        // Nozzle Y offset (where bubbles come out, relative to container)
        this.nozzleOffsetY = -this.machineHeight + 4;

        this.gfx = scene.add.graphics();
        this.add(this.gfx);

        // Label
        this.label = scene.add.text(0, 16, this._getTierLabel(), {
            fontFamily: 'Arial',
            fontSize: '10px',
            color: '#aaaacc',
            align: 'center'
        }).setOrigin(0.5, 0).setAlpha(0.7);
        this.add(this.label);

        this.setDepth(30);
        this.drawMachine();

        scene.add.existing(this);
    }

    _getTierLabel() {
        if (this.tier === 'basic') return 'Blower';
        if (this.tier === 'medium') return 'Machine';
        return 'Launcher';
    }

    get nozzleX() { return this.x; }
    get nozzleY() { return this.y + this.nozzleOffsetY; }

    triggerSpawn() {
        this.spawnFlashTimer = 0.25;
    }

    drawMachine() {
        this.gfx.clear();
        if (this.tier === 'basic') this._drawBasic();
        else if (this.tier === 'medium') this._drawMedium();
        else this._drawLarge();
    }

    _drawBasic() {
        const g = this.gfx;
        const c = this.color;
        const hw = this.machineWidth / 2;
        const h = this.machineHeight;
        const flash = this.spawnFlashTimer > 0;

        // Base platform
        g.fillStyle(0x334466, 0.9);
        g.fillRoundedRect(-hw - 4, -8, this.machineWidth + 8, 12, 3);

        // Pipe body
        const pipeW = 18;
        g.fillStyle(c, flash ? 0.7 : 0.4);
        g.fillRoundedRect(-pipeW / 2, -h, pipeW, h - 6, { tl: 6, tr: 6, bl: 2, br: 2 });
        g.lineStyle(1.5, c, 0.7);
        g.strokeRoundedRect(-pipeW / 2, -h, pipeW, h - 6, { tl: 6, tr: 6, bl: 2, br: 2 });

        // Nozzle ring
        const ringY = -h + 2;
        g.lineStyle(2.5, flash ? 0xffffff : c, flash ? 1.0 : 0.9);
        g.strokeCircle(0, ringY, 10);
        g.fillStyle(c, 0.2);
        g.fillCircle(0, ringY, 10);

        // Small fan blade at base
        const fanY = -14;
        const fanR = 8;
        g.fillStyle(c, 0.5);
        for (let i = 0; i < 3; i++) {
            const a = this.phase + (i * Math.PI * 2 / 3);
            const bx = Math.cos(a) * fanR;
            const by = Math.sin(a) * fanR * 0.5;
            g.fillEllipse(bx, fanY + by, 6, 3);
        }

        // Center dot
        g.fillStyle(0xffffff, 0.6);
        g.fillCircle(0, fanY, 2.5);

        // Highlight stripe
        g.fillStyle(0xffffff, 0.15);
        g.fillRect(-pipeW / 2 + 2, -h + 10, 4, h - 22);
    }

    _drawMedium() {
        const g = this.gfx;
        const c = this.color;
        const hw = this.machineWidth / 2;
        const h = this.machineHeight;
        const flash = this.spawnFlashTimer > 0;

        // Base platform
        g.fillStyle(0x334466, 0.9);
        g.fillRoundedRect(-hw - 4, -8, this.machineWidth + 8, 14, 3);

        // Box body
        const boxH = h * 0.55;
        g.fillStyle(c, flash ? 0.55 : 0.35);
        g.fillRoundedRect(-hw, -boxH, this.machineWidth, boxH - 4, 5);
        g.lineStyle(1.5, c, 0.6);
        g.strokeRoundedRect(-hw, -boxH, this.machineWidth, boxH - 4, 5);

        // Chimney/pipe
        const pipeW = 22;
        g.fillStyle(c, flash ? 0.65 : 0.45);
        g.fillRoundedRect(-pipeW / 2, -h, pipeW, h - boxH + 4, { tl: 7, tr: 7, bl: 2, br: 2 });
        g.lineStyle(1.5, c, 0.7);
        g.strokeRoundedRect(-pipeW / 2, -h, pipeW, h - boxH + 4, { tl: 7, tr: 7, bl: 2, br: 2 });

        // Nozzle ring
        const ringY = -h + 2;
        g.lineStyle(3, flash ? 0xffffff : c, flash ? 1.0 : 0.9);
        g.strokeCircle(0, ringY, 12);
        g.fillStyle(c, 0.25);
        g.fillCircle(0, ringY, 12);

        // Gear on the box (left side)
        const gearX = -hw + 10;
        const gearY = -boxH / 2 - 2;
        const gearR = 8;
        g.lineStyle(2, c, 0.6);
        g.strokeCircle(gearX, gearY, gearR);
        // Gear teeth
        for (let i = 0; i < 6; i++) {
            const a = this.phase * 0.7 + (i * Math.PI / 3);
            const tx = gearX + Math.cos(a) * (gearR + 2);
            const ty = gearY + Math.sin(a) * (gearR + 2);
            g.fillStyle(c, 0.5);
            g.fillRect(tx - 2, ty - 2, 4, 4);
        }
        g.fillStyle(c, 0.4);
        g.fillCircle(gearX, gearY, 3);

        // Gauge on box (right side)
        const gaugeX = hw - 12;
        const gaugeY = -boxH / 2 - 2;
        g.lineStyle(1.5, c, 0.5);
        g.strokeCircle(gaugeX, gaugeY, 6);
        const needleA = this.phase * 1.2;
        g.lineStyle(1.5, 0xffffff, 0.6);
        g.beginPath();
        g.moveTo(gaugeX, gaugeY);
        g.lineTo(gaugeX + Math.cos(needleA) * 4, gaugeY + Math.sin(needleA) * 4);
        g.strokePath();

        // Highlight stripe on pipe
        g.fillStyle(0xffffff, 0.12);
        g.fillRect(-pipeW / 2 + 3, -h + 8, 4, h - boxH - 8);
    }

    _drawLarge() {
        const g = this.gfx;
        const c = this.color;
        const hw = this.machineWidth / 2;
        const h = this.machineHeight;
        const flash = this.spawnFlashTimer > 0;

        // Base platform (wide)
        g.fillStyle(0x334466, 0.9);
        g.fillRoundedRect(-hw - 6, -10, this.machineWidth + 12, 16, 4);

        // Chunky base body
        const baseH = h * 0.5;
        g.fillStyle(c, flash ? 0.5 : 0.3);
        g.fillRoundedRect(-hw, -baseH, this.machineWidth, baseH - 6, 6);
        g.lineStyle(2, c, 0.6);
        g.strokeRoundedRect(-hw, -baseH, this.machineWidth, baseH - 6, 6);

        // Barrel / cannon
        const barrelW = 30;
        g.fillStyle(c, flash ? 0.6 : 0.4);
        g.fillRoundedRect(-barrelW / 2, -h, barrelW, h - baseH + 6, { tl: 10, tr: 10, bl: 3, br: 3 });
        g.lineStyle(2, c, 0.7);
        g.strokeRoundedRect(-barrelW / 2, -h, barrelW, h - baseH + 6, { tl: 10, tr: 10, bl: 3, br: 3 });

        // Barrel rings
        for (let i = 0; i < 3; i++) {
            const ry = -h + 14 + i * 12;
            g.lineStyle(1.5, c, 0.5);
            g.beginPath();
            g.moveTo(-barrelW / 2, ry);
            g.lineTo(barrelW / 2, ry);
            g.strokePath();
        }

        // Nozzle ring (big)
        const ringY = -h + 2;
        g.lineStyle(3.5, flash ? 0xffffff : c, flash ? 1.0 : 0.9);
        g.strokeCircle(0, ringY, 16);
        g.fillStyle(c, 0.3);
        g.fillCircle(0, ringY, 16);

        // Steam vents on sides
        for (const side of [-1, 1]) {
            const vx = side * (hw - 6);
            const vy = -baseH + 8;
            g.fillStyle(c, 0.4);
            g.fillRoundedRect(vx - 4, vy, 8, 12, 2);
            // Steam puffs (animated)
            const puffAlpha = 0.15 + Math.sin(this.phase * 2 + side) * 0.1;
            g.fillStyle(0xffffff, puffAlpha);
            const puffY = vy - 4 - Math.sin(this.phase + side) * 4;
            g.fillCircle(vx, puffY, 4);
            g.fillCircle(vx + side * 3, puffY - 3, 3);
        }

        // Big gear on base body
        const gearX = 0;
        const gearY = -baseH / 2 - 3;
        const gearR = 12;
        g.lineStyle(2.5, c, 0.5);
        g.strokeCircle(gearX, gearY, gearR);
        for (let i = 0; i < 8; i++) {
            const a = this.phase * 0.5 + (i * Math.PI / 4);
            const tx = gearX + Math.cos(a) * (gearR + 3);
            const ty = gearY + Math.sin(a) * (gearR + 3);
            g.fillStyle(c, 0.4);
            g.fillRect(tx - 2.5, ty - 2.5, 5, 5);
        }
        g.fillStyle(c, 0.5);
        g.fillCircle(gearX, gearY, 4);

        // Highlight stripe on barrel
        g.fillStyle(0xffffff, 0.1);
        g.fillRect(-barrelW / 2 + 4, -h + 10, 5, h - baseH - 10);
    }

    update(time, delta) {
        const dt = delta / 1000;
        this.phase += dt * 2.5;

        if (this.spawnFlashTimer > 0) {
            this.spawnFlashTimer -= dt;
        }

        this.drawMachine();
    }
}

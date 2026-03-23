import { Scene } from 'phaser';
import Bubble from '../objects/Bubble.js';
import { GENERATOR_DEFS, getGeneratorCost } from '../data/generators.js';

export class Game extends Scene {
    constructor() {
        super('Game');
    }

    create() {
        const { width, height } = this.scale;

        // Game state
        this.money = 0;
        this.totalEarned = 0;
        this.bubbles = [];
        this.generators = {};
        this.generatorTimers = {};

        // Initialize generator ownership
        GENERATOR_DEFS.forEach(def => {
            this.generators[def.id] = 0;
        });

        // Give player first generator free
        this.generators['basic'] = 1;

        // Background gradient
        this.cameras.main.setBackgroundColor(0x1a1a2e);
        this.createBackground(width, height);

        // Create UI
        this.createMoneyUI(width);
        this.createShopUI(width, height);

        // Start generator timers
        this.startGenerators();

        // Floating money text pool
        this.floatingTexts = [];

        // Resize handler
        this.scale.on('resize', this.onResize, this);
    }

    createBackground(width, height) {
        // Gradient background using graphics
        const bg = this.add.graphics();
        bg.fillGradientStyle(0x0f0c29, 0x0f0c29, 0x302b63, 0x24243e, 1);
        bg.fillRect(0, 0, width, height);
        bg.setDepth(-10);
        this.bgGraphics = bg;
    }

    createMoneyUI(width) {
        // Money display at top center
        this.moneyText = this.add.text(width / 2, 30, '$0', {
            fontFamily: 'Arial Black',
            fontSize: '42px',
            color: '#ffd700',
            stroke: '#000000',
            strokeThickness: 4,
            align: 'center'
        }).setOrigin(0.5).setDepth(100);

        // Label
        this.moneyLabel = this.add.text(width / 2, 65, 'Bubble Bucks', {
            fontFamily: 'Arial',
            fontSize: '16px',
            color: '#aaaaaa',
            align: 'center'
        }).setOrigin(0.5).setDepth(100);
    }

    createShopUI(width, height) {
        const shopWidth = 260;
        const shopX = width - shopWidth / 2 - 10;
        const shopStartY = 100;

        // Shop background
        this.shopBg = this.add.graphics();
        this.shopBg.fillStyle(0x000000, 0.5);
        this.shopBg.fillRoundedRect(
            width - shopWidth - 20, shopStartY - 20,
            shopWidth + 10, GENERATOR_DEFS.length * 90 + 40,
            12
        );
        this.shopBg.setDepth(90);

        // Shop title
        this.shopTitle = this.add.text(shopX, shopStartY, 'SHOP', {
            fontFamily: 'Arial Black',
            fontSize: '22px',
            color: '#ffffff',
            align: 'center'
        }).setOrigin(0.5).setDepth(100);

        // Generator buy buttons
        this.shopItems = [];
        GENERATOR_DEFS.forEach((def, index) => {
            const itemY = shopStartY + 40 + index * 90;
            const item = this.createShopItem(def, shopX, itemY, shopWidth - 20);
            this.shopItems.push(item);
        });
    }

    createShopItem(def, x, y, itemWidth) {
        const owned = this.generators[def.id];
        const cost = getGeneratorCost(def, owned);

        // Item background (interactive)
        const bg = this.add.graphics();
        bg.setDepth(95);
        const bgX = x - itemWidth / 2;

        // Name
        const nameText = this.add.text(x - itemWidth / 2 + 8, y, def.name, {
            fontFamily: 'Arial',
            fontSize: '15px',
            fontStyle: 'bold',
            color: Phaser.Display.Color.IntegerToColor(def.bubbleColor).rgba,
            align: 'left'
        }).setOrigin(0, 0).setDepth(100);

        // Cost
        const costText = this.add.text(x - itemWidth / 2 + 8, y + 22, `Cost: $${this.formatNumber(cost)}`, {
            fontFamily: 'Arial',
            fontSize: '13px',
            color: '#cccccc',
            align: 'left'
        }).setOrigin(0, 0).setDepth(100);

        // Value info
        const valueText = this.add.text(x - itemWidth / 2 + 8, y + 40, `+$${def.bubbleValue}/pop`, {
            fontFamily: 'Arial',
            fontSize: '12px',
            color: '#888888',
            align: 'left'
        }).setOrigin(0, 0).setDepth(100);

        // Owned count
        const ownedText = this.add.text(x + itemWidth / 2 - 8, y + 10, `x${owned}`, {
            fontFamily: 'Arial Black',
            fontSize: '20px',
            color: '#ffffff',
            align: 'right'
        }).setOrigin(1, 0).setDepth(100);

        // Draw background
        const canAfford = this.money >= cost;
        this.drawShopItemBg(bg, bgX, y - 8, itemWidth, 70, canAfford);

        // Make it clickable with a transparent hit area
        const hitZone = this.add.zone(x, y + 27, itemWidth, 70)
            .setInteractive({ useHandCursor: true })
            .setDepth(101);

        hitZone.on('pointerdown', () => {
            this.buyGenerator(def);
        });

        hitZone.on('pointerover', () => {
            bg.clear();
            this.drawShopItemBg(bg, bgX, y - 8, itemWidth, 70, canAfford, true);
        });

        hitZone.on('pointerout', () => {
            bg.clear();
            const currentCost = getGeneratorCost(def, this.generators[def.id]);
            this.drawShopItemBg(bg, bgX, y - 8, itemWidth, 70, this.money >= currentCost, false);
        });

        return { def, bg, bgX, y, nameText, costText, valueText, ownedText, hitZone, itemWidth };
    }

    drawShopItemBg(gfx, x, y, w, h, canAfford, hovered = false) {
        if (hovered) {
            gfx.fillStyle(canAfford ? 0x3a5a3a : 0x5a3a3a, 0.8);
        } else {
            gfx.fillStyle(canAfford ? 0x2a3a2a : 0x3a2a2a, 0.6);
        }
        gfx.fillRoundedRect(x, y, w, h, 8);
    }

    buyGenerator(def) {
        const owned = this.generators[def.id];
        const cost = getGeneratorCost(def, owned);

        if (this.money < cost) return;

        this.money -= cost;
        this.generators[def.id]++;

        // Restart timer for this generator type
        this.startGeneratorTimer(def);

        this.updateShopUI();
        this.updateMoneyDisplay();
    }

    startGenerators() {
        GENERATOR_DEFS.forEach(def => {
            if (this.generators[def.id] > 0) {
                this.startGeneratorTimer(def);
            }
        });
    }

    startGeneratorTimer(def) {
        // Clear existing timer if any
        if (this.generatorTimers[def.id]) {
            this.generatorTimers[def.id].remove();
        }

        const count = this.generators[def.id];
        if (count <= 0) return;

        // Each owned generator spawns a bubble every cooldown period
        this.generatorTimers[def.id] = this.time.addEvent({
            delay: def.cooldown,
            callback: () => {
                const ownedCount = this.generators[def.id];
                for (let i = 0; i < ownedCount; i++) {
                    // Stagger slightly so they don't all appear at once
                    this.time.delayedCall(i * 150, () => {
                        this.spawnBubble(def);
                    });
                }
            },
            loop: true
        });
    }

    spawnBubble(def) {
        const { width, height } = this.scale;
        const shopWidth = 280;
        const playAreaWidth = width - shopWidth;

        // Spawn in the play area (left portion of screen), well away from edges
        const pad = def.bubbleRadius + 80;
        const x = Phaser.Math.Between(pad, playAreaWidth - pad);
        const y = height - Phaser.Math.Between(60, 140);

        // Give initial velocity aimed toward center of play area
        const centerX = playAreaWidth / 2;
        const centerY = height * 0.4;
        const dxToCenter = centerX - x;
        const dyToCenter = centerY - y;
        const distToCenter = Math.sqrt(dxToCenter * dxToCenter + dyToCenter * dyToCenter) || 1;
        const launchSpeed = Phaser.Math.Between(80, 140);

        // Randomize size: 60% to 140% of base radius
        const sizeVariation = 0.6 + Math.random() * 0.8;
        const radius = Math.round(def.bubbleRadius * sizeVariation);

        const bubble = new Bubble(this, x, y, {
            value: def.bubbleValue,
            radius: radius,
            color: def.bubbleColor,
            lifetime: Phaser.Math.Between(8000, 14000)
        });
        bubble.setDepth(50);

        // Aim toward center with some randomness
        const spread = 0.4;
        bubble.vx = (dxToCenter / distToCenter) * launchSpeed + Phaser.Math.Between(-20, 20);
        bubble.vy = (dyToCenter / distToCenter) * launchSpeed * (1 + Math.random() * spread);

        // Entrance animation
        bubble.setScale(0);
        this.tweens.add({
            targets: bubble,
            scaleX: 1,
            scaleY: 1,
            duration: 300,
            ease: 'Back.easeOut'
        });

        bubble.on('popped', (value) => {
            this.money += value;
            this.totalEarned += value;
            this.updateMoneyDisplay();
            this.updateShopUI();
            this.showFloatingMoney(bubble.x, bubble.y, value);
        });

        bubble.on('destroy', () => {
            const idx = this.bubbles.indexOf(bubble);
            if (idx > -1) this.bubbles.splice(idx, 1);
        });

        this.bubbles.push(bubble);
    }

    showFloatingMoney(x, y, value) {
        const text = this.add.text(x, y, `+$${value}`, {
            fontFamily: 'Arial Black',
            fontSize: '22px',
            color: '#ffd700',
            stroke: '#000000',
            strokeThickness: 3,
            align: 'center'
        }).setOrigin(0.5).setDepth(200);

        this.tweens.add({
            targets: text,
            y: y - 60,
            alpha: 0,
            duration: 800,
            ease: 'Quad.easeOut',
            onComplete: () => {
                text.destroy();
            }
        });
    }

    updateMoneyDisplay() {
        this.moneyText.setText(`$${this.formatNumber(this.money)}`);
    }

    updateShopUI() {
        this.shopItems.forEach(item => {
            const owned = this.generators[item.def.id];
            const cost = getGeneratorCost(item.def, owned);
            const canAfford = this.money >= cost;

            item.costText.setText(`Cost: $${this.formatNumber(cost)}`);
            item.ownedText.setText(`x${owned}`);

            item.bg.clear();
            this.drawShopItemBg(item.bg, item.bgX, item.y - 8, item.itemWidth, 70, canAfford);
        });
    }

    formatNumber(num) {
        if (num >= 1000000000) return (num / 1000000000).toFixed(1) + 'B';
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 10000) return (num / 1000).toFixed(1) + 'K';
        return Math.floor(num).toLocaleString();
    }

    update(time, delta) {
        const dt = delta / 1000;
        const { width, height } = this.scale;
        const shopWidth = 280;
        const playAreaWidth = width - shopWidth;

        const pushStrength = 120; // max push force when dead center

        for (let i = this.bubbles.length - 1; i >= 0; i--) {
            const a = this.bubbles[i];
            if (!a || !a.active || a.isPopped) continue;

            // --- Push overlapping bubbles apart ---
            for (let j = i + 1; j < this.bubbles.length; j++) {
                const b = this.bubbles[j];
                if (!b || !b.active || b.isPopped) continue;

                const dx = a.x - b.x;
                const dy = a.y - b.y;
                const dist = Math.sqrt(dx * dx + dy * dy) || 0.1;
                const touchDist = a.radius + b.radius;

                if (dist < touchDist) {
                    // How deep are we? 0 = just touching edges, 1 = dead center
                    const penetration = 1 - (dist / touchDist);

                    const nx = dx / dist;
                    const ny = dy / dist;

                    // How fast they're approaching each other along the collision axis
                    const relVel = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny;
                    const velBonus = Math.max(0, relVel) * 0.8; // only count closing speed

                    // Push force: depth-based + velocity-based
                    const force = pushStrength * penetration * penetration + velBonus;

                    // Mass ratio: lighter bubble gets pushed more
                    const totalMass = a.mass + b.mass;
                    const aRatio = b.mass / totalMass; // a gets pushed proportional to b's mass
                    const bRatio = a.mass / totalMass; // b gets pushed proportional to a's mass

                    a.vx += nx * force * aRatio * dt;
                    a.vy += ny * force * aRatio * dt;
                    b.vx -= nx * force * bRatio * dt;
                    b.vy -= ny * force * bRatio * dt;
                }
            }

            // --- Bounce off play area edges ---
            const pad = a.radius * 0.6;
            if (a.x < pad) { a.x = pad; a.vx = Math.abs(a.vx) * bounciness; }
            if (a.x > playAreaWidth - pad) { a.x = playAreaWidth - pad; a.vx = -Math.abs(a.vx) * bounciness; }
            if (a.y > height - pad) { a.y = height - pad; a.vy = -Math.abs(a.vy) * bounciness; }
            if (a.y < pad) { a.y = pad; a.vy = Math.abs(a.vy) * bounciness; }

            // --- Gentle speed limit ---
            const maxSpeed = 120;
            const speed = Math.sqrt(a.vx * a.vx + a.vy * a.vy);
            if (speed > maxSpeed) {
                a.vx = (a.vx / speed) * maxSpeed;
                a.vy = (a.vy / speed) * maxSpeed;
            }

            a.update(time, delta);
        }
    }

    onResize(gameSize) {
        // Rebuild UI on resize
        const { width, height } = gameSize;

        // Update background
        if (this.bgGraphics) {
            this.bgGraphics.clear();
            this.bgGraphics.fillGradientStyle(0x0f0c29, 0x0f0c29, 0x302b63, 0x24243e, 1);
            this.bgGraphics.fillRect(0, 0, width, height);
        }

        // Update money position
        if (this.moneyText) {
            this.moneyText.setX(width / 2);
        }
        if (this.moneyLabel) {
            this.moneyLabel.setX(width / 2);
        }
    }

    shutdown() {
        this.scale.off('resize', this.onResize, this);
        // Clean up timers
        Object.values(this.generatorTimers).forEach(timer => {
            if (timer) timer.remove();
        });
    }
}

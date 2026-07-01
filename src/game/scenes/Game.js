import { Scene } from 'phaser';
import Bubble from '../objects/Bubble.js';
import BubbleMachine from '../objects/BubbleMachine.js';
import { GENERATOR_DEFS, getGeneratorCost } from '../data/generators.js';
import { OBSTACLE_DEFS, getObstacleCost } from '../data/obstacles.js';
import { UPGRADE_DEFS, getUpgradeCost } from '../data/upgrades.js';
import Fan from '../objects/Fan.js';
import GravityWell from '../objects/GravityWell.js';
import SpikeyWall from '../objects/SpikeyWall.js';
import Nail from '../objects/Nail.js';
import NailGun from '../objects/NailGun.js';

const OBSTACLE_CLASSES = {
    fan: Fan,
    gravityWell: GravityWell,
    spikeyWall: SpikeyWall,
    nailGun: NailGun,
    nail: Nail,
};

// Base lucky bubble chance (1%)
const BASE_LUCKY_CHANCE = 0.01;

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
        this.obstacles = [];
        this.ownedObstacles = {};
        this.upgrades = {};
        this.helperHands = [];
        this.machineVisuals = []; // BubbleMachine display objects

        // Initialize generator ownership
        GENERATOR_DEFS.forEach(def => {
            this.generators[def.id] = 0;
        });

        // Initialize obstacle ownership
        OBSTACLE_DEFS.forEach(def => {
            this.ownedObstacles[def.id] = 0;
        });

        // Initialize upgrade ownership
        UPGRADE_DEFS.forEach(def => {
            this.upgrades[def.id] = 0;
        });

        // Give player first generator free
        this.generators['basic'] = 1;

        // Background gradient
        this.cameras.main.setBackgroundColor(0x1a1a2e);
        this.createBackground(width, height);

        // Compute proportional shop width
        this.shopWidth = this.calcShopWidth(width);

        // Create UI
        this.createMoneyUI(width);
        this.createShopUI(width, height);

        // Place machine visuals + start generator timers
        this.rebuildMachineVisuals();
        this.startGenerators();

        // Floating money text pool
        this.floatingTexts = [];

        // Money cheat: press M to add $10,000
        this.input.keyboard.on('keydown-M', () => {
            this.money += 10000;
            this.updateMoneyDisplay();
            this.updateShopUI();
            this.showFloatingMoney(width / 2, 100, 10000);
        });

        // Resize handler
        this.scale.on('resize', this.onResize, this);
        this.events.on('shutdown', this.shutdown, this);
    }

    calcShopWidth(width) {
        return Math.min(260, Math.max(200, Math.round(width * 0.22)));
    }

    createBackground(width, height) {
        const bg = this.add.graphics();
        bg.fillGradientStyle(0x0f0c29, 0x0f0c29, 0x302b63, 0x24243e, 1);
        bg.fillRect(0, 0, width, height);
        bg.setDepth(-10);
        this.bgGraphics = bg;
    }

    createMoneyUI(width) {
        this.moneyText = this.add.text(20, 20, '$0', {
            fontFamily: 'Arial Black',
            fontSize: '42px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4,
            align: 'left'
        }).setOrigin(0, 0).setDepth(100);

        this.moneyLabel = this.add.text(20, 65, 'Bubble Bucks', {
            fontFamily: 'Arial',
            fontSize: '16px',
            color: '#aaaaaa',
            align: 'left'
        }).setOrigin(0, 0).setDepth(100);
    }

    // ─── Shop UI ────────────────────────────────────────────

    createShopUI(width, height) {
        const sw = this.shopWidth;
        const sx = width - sw;
        this.shopLeft = sx;

        // Full-height dark background with left border
        this.shopBg = this.add.graphics();
        this.shopBg.fillStyle(0x0d0d1a, 0.9);
        this.shopBg.fillRect(sx, 0, sw, height);
        this.shopBg.lineStyle(1, 0x333355, 0.8);
        this.shopBg.lineBetween(sx, 0, sx, height);
        this.shopBg.setDepth(90);

        // Title
        this.shopTitle = this.add.text(sx + sw / 2, 16, 'SHOP', {
            fontFamily: 'Arial Black',
            fontSize: '22px',
            color: '#ffffff',
            align: 'center'
        }).setOrigin(0.5, 0).setDepth(100);

        // Tab bar
        this.activeTab = this.activeTab || 'bubbles';
        const tabY = 50;
        const tabH = 30;
        const tabPad = 8;
        const tabW = (sw - tabPad * 2) / 3;
        this.shopTabY = tabY;
        this.shopTabH = tabH;

        this.tabGfx = this.add.graphics().setDepth(99);
        this.tabButtons = [];

        const tabs = [
            { id: 'bubbles', label: 'Bubbles' },
            { id: 'tools', label: 'Tools' },
            { id: 'upgrades', label: 'Upgrades' }
        ];

        tabs.forEach((tab, i) => {
            const tx = sx + tabPad + i * tabW;
            const text = this.add.text(tx + tabW / 2, tabY + tabH / 2, tab.label, {
                fontFamily: 'Arial',
                fontSize: '12px',
                color: tab.id === this.activeTab ? '#ffffff' : '#666688',
                align: 'center'
            }).setOrigin(0.5).setDepth(101);

            const zone = this.add.zone(tx + tabW / 2, tabY + tabH / 2, tabW, tabH)
                .setInteractive({ useHandCursor: true })
                .setDepth(102);

            zone.on('pointerdown', () => {
                if (this.activeTab !== tab.id) {
                    this.switchTab(tab.id);
                }
            });

            this.tabButtons.push({ id: tab.id, text, zone, x: tx, w: tabW });
        });

        this.drawTabs();

        // Scrollable content area
        const contentY = tabY + tabH + 8;
        this.shopContentY = contentY;
        this.shopContentH = height - contentY;

        // Scroll mask
        this.scrollMaskGfx = this.make.graphics();
        this.scrollMaskGfx.fillRect(sx, contentY, sw, this.shopContentH);
        this.scrollMask = this.scrollMaskGfx.createGeometryMask();

        // Scroll container
        this.scrollContainer = this.add.container(sx, contentY);
        this.scrollContainer.setDepth(95);
        this.scrollContainer.setMask(this.scrollMask);

        this.scrollY = 0;
        this.maxScrollY = 0;

        // Wheel handler
        this.shopWheelHandler = (pointer, gameObjects, deltaX, deltaY) => {
            if (pointer.x >= this.shopLeft) {
                const oldY = this.scrollY;
                this.scrollY = Phaser.Math.Clamp(
                    this.scrollY + deltaY * 0.5,
                    0, Math.max(0, this.maxScrollY)
                );
                if (this.scrollY !== oldY) {
                    this.scrollContainer.y = this.shopContentY - this.scrollY;
                }
            }
        };
        this.input.on('wheel', this.shopWheelHandler);

        // Populate items for active tab
        this.tabItems = [];
        this.emptyTabText = null;
        this.populateTabItems();
    }

    destroyShopUI() {
        if (this.shopWheelHandler) {
            this.input.off('wheel', this.shopWheelHandler);
            this.shopWheelHandler = null;
        }

        if (this.shopBg) { this.shopBg.destroy(); this.shopBg = null; }
        if (this.shopTitle) { this.shopTitle.destroy(); this.shopTitle = null; }
        if (this.tabGfx) { this.tabGfx.destroy(); this.tabGfx = null; }

        if (this.tabButtons) {
            this.tabButtons.forEach(t => {
                if (t.text) t.text.destroy();
                if (t.zone) t.zone.destroy();
            });
            this.tabButtons = [];
        }

        this.destroyTabItems();

        if (this.scrollContainer) { this.scrollContainer.destroy(); this.scrollContainer = null; }
        if (this.scrollMaskGfx) { this.scrollMaskGfx.destroy(); this.scrollMaskGfx = null; }
        this.scrollMask = null;
    }

    switchTab(tabId) {
        this.activeTab = tabId;

        this.tabButtons.forEach(t => {
            t.text.setColor(t.id === tabId ? '#ffffff' : '#666688');
        });
        this.drawTabs();

        this.scrollY = 0;
        if (this.scrollContainer) {
            this.scrollContainer.y = this.shopContentY;
        }

        this.destroyTabItems();
        this.populateTabItems();
    }

    drawTabs() {
        if (!this.tabGfx) return;
        this.tabGfx.clear();

        this.tabButtons.forEach(t => {
            const isActive = t.id === this.activeTab;
            if (isActive) {
                this.tabGfx.fillStyle(0x2a2a4a, 1);
                this.tabGfx.fillRoundedRect(t.x, this.shopTabY, t.w, this.shopTabH,
                    { tl: 6, tr: 6, bl: 0, br: 0 });
                this.tabGfx.fillStyle(0x4caf50, 1);
                this.tabGfx.fillRect(t.x + 4, this.shopTabY + this.shopTabH - 3, t.w - 8, 3);
            } else {
                this.tabGfx.fillStyle(0x1a1a2e, 0.6);
                this.tabGfx.fillRoundedRect(t.x, this.shopTabY, t.w, this.shopTabH,
                    { tl: 6, tr: 6, bl: 0, br: 0 });
            }
        });
    }

    populateTabItems() {
        const sw = this.shopWidth;
        const itemW = sw - 16;
        const itemH = 80;
        const gap = 8;

        let defs = [];
        if (this.activeTab === 'bubbles') {
            defs = GENERATOR_DEFS.map(def => ({ ...def, type: 'bubble' }));
        } else if (this.activeTab === 'tools') {
            defs = OBSTACLE_DEFS.map(def => ({ ...def, type: 'tool' }));
        } else if (this.activeTab === 'upgrades') {
            defs = UPGRADE_DEFS.map(def => ({ ...def, type: 'upgrade' }));
        }

        if (defs.length === 0) {
            this.emptyTabText = this.add.text(sw / 2, 60, 'Coming Soon', {
                fontFamily: 'Arial',
                fontSize: '16px',
                color: '#666688',
                align: 'center'
            }).setOrigin(0.5).setDepth(2);
            this.scrollContainer.add(this.emptyTabText);
            this.maxScrollY = 0;
            return;
        }

        this.tabItems = [];
        defs.forEach((def, index) => {
            const y = 8 + index * (itemH + gap);
            const item = this.createTabItem(def, 8, y, itemW, itemH);
            this.tabItems.push(item);
        });

        const totalH = defs.length * (itemH + gap) + 8;
        this.maxScrollY = Math.max(0, totalH - this.shopContentH);
    }

    destroyTabItems() {
        if (this.tabItems) {
            this.tabItems.forEach(item => {
                if (item.bg) item.bg.destroy();
                if (item.icon) item.icon.destroy();
                if (item.nameText) item.nameText.destroy();
                if (item.descText) item.descText.destroy();
                if (item.countText) item.countText.destroy();
                if (item.costBtnBg) item.costBtnBg.destroy();
                if (item.costText) item.costText.destroy();
                if (item.hitZone) item.hitZone.destroy();
            });
            this.tabItems = [];
        }
        if (this.emptyTabText) {
            this.emptyTabText.destroy();
            this.emptyTabText = null;
        }
    }

    _getItemState(def) {
        if (def.type === 'bubble') {
            const owned = this.generators[def.id];
            return { owned, cost: getGeneratorCost(def, owned), maxOwned: null, color: def.bubbleColor };
        } else if (def.type === 'tool') {
            const owned = this.ownedObstacles[def.id];
            return { owned, cost: getObstacleCost(def, owned), maxOwned: def.maxOwned, color: def.color };
        } else {
            const owned = this.upgrades[def.id];
            return { owned, cost: getUpgradeCost(def, owned), maxOwned: def.maxOwned, color: def.color };
        }
    }

    _getUpgradeEffectText(def) {
        const owned = this.upgrades[def.id];
        if (owned === 0) return '';

        if (def.category === 'spawnRate') {
            const reduction = Math.round(owned * def.reductionPerLevel * 100);
            return `${reduction}% faster`;
        } else if (def.category === 'multiSpawn') {
            return `+${owned} bubbles`;
        } else if (def.category === 'cascade') {
            const chance = Math.round(owned * def.chancePerLevel * 100);
            return `${chance}% chance`;
        } else if (def.category === 'lucky') {
            const totalChance = (BASE_LUCKY_CHANCE + owned * def.bonusPerLevel) * 100;
            return `${totalChance.toFixed(1)}% rate`;
        }
        return '';
    }

    createTabItem(def, x, y, w, h) {
        const { owned, cost, maxOwned, color } = this._getItemState(def);
        const atMax = maxOwned !== null && owned >= maxOwned;
        const canAfford = !atMax && this.money >= cost;

        // Item background
        const bg = this.add.graphics().setDepth(1);
        this.drawItemBg(bg, x, y, w, h, false);
        this.scrollContainer.add(bg);

        // Icon
        const icon = this.add.graphics().setDepth(2);
        const iconCx = x + 28;
        const iconCy = y + h / 2;
        this.drawItemIcon(icon, iconCx, iconCy, def.type, color);
        this.scrollContainer.add(icon);

        // Name
        const nameText = this.add.text(x + 56, y + 12, def.name, {
            fontFamily: 'Arial',
            fontSize: '14px',
            fontStyle: 'bold',
            color: '#ffffff',
            align: 'left'
        }).setOrigin(0, 0).setDepth(2);
        this.scrollContainer.add(nameText);

        // Description / effect text for upgrades
        let descText = null;
        if (def.type === 'upgrade') {
            const effectStr = this._getUpgradeEffectText(def);
            const label = effectStr || def.description || '';
            descText = this.add.text(x + 56, y + 30, label, {
                fontFamily: 'Arial',
                fontSize: '10px',
                color: effectStr ? '#aaddaa' : '#777799',
                align: 'left'
            }).setOrigin(0, 0).setDepth(2);
            this.scrollContainer.add(descText);
        }

        // Count
        const countStr = maxOwned !== null ? `${owned}/${maxOwned}` : `x${owned}`;
        const countY = def.type === 'upgrade' ? y + 46 : y + 38;
        const countText = this.add.text(x + 56, countY, countStr, {
            fontFamily: 'Arial',
            fontSize: '12px',
            color: '#888899',
            align: 'left'
        }).setOrigin(0, 0).setDepth(2);
        this.scrollContainer.add(countText);

        // Cost button
        const btnW = 72;
        const btnH = 30;
        const btnX = x + w - btnW - 8;
        const btnY = y + (h - btnH) / 2;

        const costBtnBg = this.add.graphics().setDepth(2);
        this.drawCostButton(costBtnBg, btnX, btnY, btnW, btnH, canAfford, atMax);
        this.scrollContainer.add(costBtnBg);

        const costLabel = atMax ? 'MAX' : `$${this.formatNumber(cost)}`;
        const costColor = atMax ? '#888888' : (canAfford ? '#44ff44' : '#ff4444');
        const costText = this.add.text(btnX + btnW / 2, btnY + btnH / 2, costLabel, {
            fontFamily: 'Arial Black',
            fontSize: '11px',
            color: costColor,
            align: 'center'
        }).setOrigin(0.5).setDepth(3);
        this.scrollContainer.add(costText);

        // Hit zone (whole row)
        const hitZone = this.add.zone(x + w / 2, y + h / 2, w, h)
            .setInteractive({ useHandCursor: true })
            .setDepth(10);
        this.scrollContainer.add(hitZone);

        hitZone.on('pointerdown', (pointer) => {
            // Only respond within visible scroll area
            if (pointer.y < this.shopContentY || pointer.y > this.shopContentY + this.shopContentH) return;
            if (def.type === 'bubble') {
                this.buyGenerator(def);
            } else if (def.type === 'tool') {
                this.buyObstacle(def);
            } else if (def.type === 'upgrade') {
                this.buyUpgrade(def);
            }
        });

        hitZone.on('pointerover', () => {
            bg.clear();
            this.drawItemBg(bg, x, y, w, h, true);
        });

        hitZone.on('pointerout', () => {
            bg.clear();
            this.drawItemBg(bg, x, y, w, h, false);
        });

        return { def, type: def.type, bg, icon, nameText, descText, countText, costBtnBg, costText, hitZone, x, y, w, h };
    }

    drawItemBg(gfx, x, y, w, h, hovered) {
        gfx.fillStyle(hovered ? 0x2a2a4a : 0x1a1a2e, hovered ? 0.9 : 0.7);
        gfx.fillRoundedRect(x, y, w, h, 8);
        gfx.lineStyle(1, 0x333355, 0.5);
        gfx.strokeRoundedRect(x, y, w, h, 8);
    }

    drawCostButton(gfx, x, y, w, h, canAfford, atMax) {
        if (atMax) {
            gfx.fillStyle(0x333333, 0.6);
        } else if (canAfford) {
            gfx.fillStyle(0x1a3a1a, 0.8);
        } else {
            gfx.fillStyle(0x3a1a1a, 0.8);
        }
        gfx.fillRoundedRect(x, y, w, h, 6);
        const borderColor = atMax ? 0x555555 : (canAfford ? 0x44ff44 : 0xff4444);
        gfx.lineStyle(1, borderColor, atMax ? 0.3 : 0.4);
        gfx.strokeRoundedRect(x, y, w, h, 6);
    }

    drawItemIcon(gfx, cx, cy, type, color) {
        if (type === 'bubble') {
            gfx.fillStyle(color, 0.5);
            gfx.fillCircle(cx, cy, 18);
            gfx.lineStyle(1.5, color, 0.8);
            gfx.strokeCircle(cx, cy, 18);
            gfx.fillStyle(0xffffff, 0.3);
            gfx.fillCircle(cx - 5, cy - 6, 5);
        } else if (type === 'upgrade') {
            // Arrow-up icon
            gfx.fillStyle(color, 0.5);
            gfx.fillCircle(cx, cy, 18);
            gfx.lineStyle(1.5, color, 0.8);
            gfx.strokeCircle(cx, cy, 18);
            gfx.fillStyle(0xffffff, 0.7);
            gfx.fillTriangle(cx, cy - 10, cx - 8, cy + 2, cx + 8, cy + 2);
            gfx.fillRect(cx - 3, cy + 2, 6, 8);
        } else {
            gfx.fillStyle(color, 0.5);
            gfx.fillRoundedRect(cx - 14, cy - 14, 28, 28, 4);
            gfx.lineStyle(1.5, color, 0.8);
            gfx.strokeRoundedRect(cx - 14, cy - 14, 28, 28, 4);
            gfx.fillStyle(0xffffff, 0.2);
            gfx.fillRoundedRect(cx - 6, cy - 6, 12, 12, 2);
        }
    }

    // ─── Shop Actions ───────────────────────────────────────

    buyGenerator(def) {
        const owned = this.generators[def.id];
        const cost = getGeneratorCost(def, owned);

        if (this.money < cost) return;

        this.money -= cost;
        this.generators[def.id]++;

        this.rebuildMachineVisuals();
        this.startGeneratorTimer(def);
        this.updateShopUI();
        this.updateMoneyDisplay();
    }

    buyObstacle(def) {
        const owned = this.ownedObstacles[def.id];
        if (owned >= def.maxOwned) return;
        const cost = getObstacleCost(def, owned);
        if (this.money < cost) return;

        this.money -= cost;
        this.ownedObstacles[def.id]++;

        this.placeObstacle(def);
        this.updateShopUI();
        this.updateMoneyDisplay();
    }

    buyUpgrade(def) {
        const owned = this.upgrades[def.id];
        if (owned >= def.maxOwned) return;
        const cost = getUpgradeCost(def, owned);
        if (this.money < cost) return;

        this.money -= cost;
        this.upgrades[def.id]++;

        this.applyUpgrade(def);
        this.updateShopUI();
        this.updateMoneyDisplay();
    }

    applyUpgrade(def) {
        if (def.id === 'helperHand') {
            this.spawnHelperHand(def);
        } else if (def.category === 'spawnRate') {
            // Restart timer for the affected tier with updated cooldown
            const genDef = GENERATOR_DEFS.find(g => g.tier === def.tier);
            if (genDef) this.startGeneratorTimer(genDef);
        }
        // multiSpawn, cascade, lucky — effects are checked at spawn/pop time
    }

    spawnHelperHand(def) {
        const { width, height } = this.scale;
        const playAreaWidth = width - this.shopWidth - 20;
        const x = Phaser.Math.Between(80, playAreaWidth - 80);
        const y = Phaser.Math.Between(80, height - 80);

        const gfx = this.add.graphics();
        gfx.setPosition(x, y);
        gfx.setDepth(200);
        this._drawHandCursor(gfx, def.color, false);

        this.helperHands.push({
            gfx,
            x, y,
            target: null,
            cooldown: 0,
            popInterval: def.popInterval / 1000,
            moveSpeed: def.moveSpeed || 120,
            color: def.color,
            clicking: false,
            clickTimer: 0,
        });
    }

    updateHelperHands(dt) {
        for (const hand of this.helperHands) {
            if (hand.clicking) {
                hand.clickTimer -= dt;
                if (hand.clickTimer <= 0) {
                    hand.clicking = false;
                    hand.gfx.setScale(1);
                    hand.gfx.clear();
                    this._drawHandCursor(hand.gfx, hand.color, false);
                    hand.cooldown = hand.popInterval;
                }
                continue;
            }

            // Find nearest alive bubble
            let best = null;
            let bestDist = Infinity;
            for (let i = 0; i < this.bubbles.length; i++) {
                const b = this.bubbles[i];
                if (!b || !b.active || b.isPopped) continue;
                const dx = b.x - hand.x;
                const dy = b.y - hand.y;
                const d = dx * dx + dy * dy;
                if (d < bestDist) {
                    bestDist = d;
                    best = b;
                }
            }
            hand.target = best;

            if (best) {
                // Move toward target
                const dx = best.x - hand.x;
                const dy = best.y - hand.y;
                const dist = Math.sqrt(dx * dx + dy * dy) || 0.1;

                if (dist > 5) {
                    const step = Math.min(hand.moveSpeed * dt, dist);
                    hand.x += (dx / dist) * step;
                    hand.y += (dy / dist) * step;
                    hand.gfx.setPosition(hand.x, hand.y);
                }

                // Close enough and cooldown ready → pop
                hand.cooldown -= dt;
                if (dist < best.radius + 10 && hand.cooldown <= 0) {
                    // Click animation
                    hand.clicking = true;
                    hand.clickTimer = 0.15;
                    hand.gfx.setScale(0.7);
                    hand.gfx.clear();
                    this._drawHandCursor(hand.gfx, hand.color, true);

                    if (best.active && !best.isPopped) {
                        best.pop();
                    }
                }
            } else {
                // No bubbles — drift slowly toward center
                const { width, height } = this.scale;
                const playAreaWidth = width - this.shopWidth - 20;
                const cx = playAreaWidth / 2;
                const cy = height / 2;
                const dx = cx - hand.x;
                const dy = cy - hand.y;
                const dist = Math.sqrt(dx * dx + dy * dy) || 0.1;
                if (dist > 30) {
                    const step = hand.moveSpeed * 0.3 * dt;
                    hand.x += (dx / dist) * step;
                    hand.y += (dy / dist) * step;
                    hand.gfx.setPosition(hand.x, hand.y);
                }
                hand.cooldown -= dt;
            }
        }
    }

    _drawHandCursor(gfx, color, pressed) {
        const fingerLen = pressed ? 12 : 18;
        // Palm
        gfx.fillStyle(color, 0.9);
        gfx.fillRoundedRect(-8, -4, 16, 20, 4);
        // Index finger
        gfx.fillRoundedRect(-3, -4 - fingerLen, 7, fingerLen, 3);
        // Thumb
        gfx.fillRoundedRect(-12, -2, 8, 6, 2);
        // Outline
        gfx.lineStyle(1.5, 0xffffff, 0.5);
        gfx.strokeRoundedRect(-8, -4, 16, 20, 4);
        gfx.strokeRoundedRect(-3, -4 - fingerLen, 7, fingerLen, 3);
    }

    placeObstacle(def) {
        const { width, height } = this.scale;
        const playAreaWidth = width - this.shopWidth - 20;
        const pad = 100;
        const x = Phaser.Math.Between(pad, Math.max(pad + 1, playAreaWidth - pad));
        const y = Phaser.Math.Between(pad, Math.max(pad + 1, height - pad));

        const ObstacleClass = OBSTACLE_CLASSES[def.id];
        if (!ObstacleClass) return;

        const obstacle = new ObstacleClass(this, x, y, def);
        this.obstacles.push(obstacle);
    }

    updateShopUI() {
        if (!this.tabItems) return;

        this.tabItems.forEach(item => {
            const { owned, cost, maxOwned } = this._getItemState(item.def);
            const atMax = maxOwned !== null && owned >= maxOwned;
            const canAfford = !atMax && this.money >= cost;

            // Update count
            const countStr = maxOwned !== null ? `${owned}/${maxOwned}` : `x${owned}`;
            item.countText.setText(countStr);

            // Update effect text for upgrades
            if (item.descText && item.def.type === 'upgrade') {
                const effectStr = this._getUpgradeEffectText(item.def);
                if (effectStr) {
                    item.descText.setText(effectStr);
                    item.descText.setColor('#aaddaa');
                }
            }

            // Update cost button
            const costLabel = atMax ? 'MAX' : `$${this.formatNumber(cost)}`;
            const costColor = atMax ? '#888888' : (canAfford ? '#44ff44' : '#ff4444');
            item.costText.setText(costLabel);
            item.costText.setColor(costColor);

            const btnW = 72;
            const btnH = 30;
            const btnX = item.x + item.w - btnW - 8;
            const btnY = item.y + (item.h - btnH) / 2;
            item.costBtnBg.clear();
            this.drawCostButton(item.costBtnBg, btnX, btnY, btnW, btnH, canAfford, atMax);
        });
    }

    // ─── Machine Visuals ────────────────────────────────────

    rebuildMachineVisuals() {
        // Destroy existing
        this.machineVisuals.forEach(m => { if (m) m.destroy(); });
        this.machineVisuals = [];

        // Collect all owned machines: one visual per owned unit
        const entries = [];
        GENERATOR_DEFS.forEach(def => {
            const count = this.generators[def.id];
            for (let i = 0; i < count; i++) {
                entries.push({ def, index: i });
            }
        });

        if (entries.length === 0) return;

        const { width, height } = this.scale;
        const playAreaWidth = width - this.shopWidth - 20;

        // Space machines evenly across the bottom
        const totalMachines = entries.length;
        const spacing = playAreaWidth / (totalMachines + 1);

        entries.forEach((entry, i) => {
            const mx = spacing * (i + 1);
            const my = height - 8;

            const machine = new BubbleMachine(this, mx, my, {
                tier: entry.def.tier,
                color: entry.def.bubbleColor,
                machineIndex: entry.index,
            });
            machine._generatorId = entry.def.id;
            machine._unitIndex = entry.index;
            this.machineVisuals.push(machine);
        });
    }

    layoutMachines() {
        if (this.machineVisuals.length === 0) return;

        const { width, height } = this.scale;
        const playAreaWidth = width - this.shopWidth - 20;
        const total = this.machineVisuals.length;
        const spacing = playAreaWidth / (total + 1);

        this.machineVisuals.forEach((machine, i) => {
            machine.x = spacing * (i + 1);
            machine.y = height - 8;
        });
    }

    getMachinesForGenerator(generatorId) {
        return this.machineVisuals.filter(m => m._generatorId === generatorId);
    }

    // Pick a random machine visual for the given generator to spawn from
    pickSpawnMachine(generatorId, unitIndex) {
        const machines = this.getMachinesForGenerator(generatorId);
        if (machines.length === 0) return null;
        // Match by unit index if possible
        const match = machines.find(m => m._unitIndex === unitIndex);
        return match || machines[Math.floor(Math.random() * machines.length)];
    }

    // ─── Generators & Bubbles ───────────────────────────────

    startGenerators() {
        GENERATOR_DEFS.forEach(def => {
            if (this.generators[def.id] > 0) {
                this.startGeneratorTimer(def);
            }
        });
    }

    getEffectiveCooldown(def) {
        // Find spawn rate upgrade for this tier
        const rateUpgrade = UPGRADE_DEFS.find(u => u.category === 'spawnRate' && u.tier === def.tier);
        if (!rateUpgrade) return def.cooldown;
        const level = this.upgrades[rateUpgrade.id] || 0;
        if (level === 0) return def.cooldown;
        const reduction = 1 - (level * rateUpgrade.reductionPerLevel);
        return Math.max(100, Math.round(def.cooldown * reduction));
    }

    getMultiSpawnCount(def) {
        const msUpgrade = UPGRADE_DEFS.find(u => u.category === 'multiSpawn' && u.tier === def.tier);
        if (!msUpgrade) return 1;
        const level = this.upgrades[msUpgrade.id] || 0;
        return 1 + level;
    }

    getLuckyChance() {
        const luckyUpgrade = UPGRADE_DEFS.find(u => u.category === 'lucky');
        if (!luckyUpgrade) return BASE_LUCKY_CHANCE;
        const level = this.upgrades[luckyUpgrade.id] || 0;
        return BASE_LUCKY_CHANCE + level * luckyUpgrade.bonusPerLevel;
    }

    startGeneratorTimer(def) {
        if (this.generatorTimers[def.id]) {
            this.generatorTimers[def.id].remove();
        }

        const count = this.generators[def.id];
        if (count <= 0) return;

        const cooldown = this.getEffectiveCooldown(def);

        this.generatorTimers[def.id] = this.time.addEvent({
            delay: cooldown,
            callback: () => {
                const ownedCount = this.generators[def.id];
                const bubblesPerSpawn = this.getMultiSpawnCount(def);
                const luckyChance = this.getLuckyChance();

                for (let i = 0; i < ownedCount; i++) {
                    const machine = this.pickSpawnMachine(def.id, i);
                    for (let j = 0; j < bubblesPerSpawn; j++) {
                        const delay = i * 150 + j * 80;
                        this.time.delayedCall(delay, () => {
                            const isLucky = Math.random() < luckyChance;
                            if (machine && machine.active) {
                                machine.triggerSpawn();
                                this.spawnBubble(def, isLucky, machine.nozzleX, machine.nozzleY);
                            } else {
                                this.spawnBubble(def, isLucky);
                            }
                        });
                    }
                }
            },
            loop: true
        });
    }

    spawnBubble(def, isLucky = false, atX = null, atY = null, isCascade = false) {
        const { width, height } = this.scale;
        const playAreaWidth = width - this.shopWidth - 20;

        const pad = def.bubbleRadius + 80;

        let x, y;
        if (atX !== null && atY !== null) {
            x = atX;
            y = atY;
        } else {
            x = Phaser.Math.Between(pad, Math.max(pad + 1, playAreaWidth - pad));
            y = height - Phaser.Math.Between(60, 140);
        }

        const centerX = playAreaWidth / 2;
        const centerY = height * 0.4;
        const dxToCenter = centerX - x;
        const dyToCenter = centerY - y;
        const distToCenter = Math.sqrt(dxToCenter * dxToCenter + dyToCenter * dyToCenter) || 1;
        const launchSpeed = Phaser.Math.Between(80, 140);

        const radius = def.bubbleRadius;

        const bubble = new Bubble(this, x, y, {
            value: def.bubbleValue,
            radius: radius,
            color: def.bubbleColor,
            lifetime: Phaser.Math.Between(8000, 14000),
            tier: def.tier,
            isLucky: isLucky,
        });
        bubble.setDepth(50);

        if (isCascade) {
            // Cascade children: burst outward from pop point
            const angle = Math.random() * Math.PI * 2;
            const burstSpeed = 150 + Math.random() * 100;
            bubble.vx = Math.cos(angle) * burstSpeed;
            bubble.vy = Math.sin(angle) * burstSpeed;

            bubble.setScale(0);
            this.tweens.add({
                targets: bubble,
                scaleX: 1,
                scaleY: 1,
                duration: 400,
                ease: 'Back.easeOut'
            });
        } else if (atX !== null && atY !== null) {
            // Machine spawn — inflate at nozzle, drift up, then release
            bubble.inflating = true;
            bubble.disableInteractive();
            bubble.vx = 0;
            bubble.vy = 0;

            // Start inside the machine, float up past nozzle
            bubble.y = y + bubble.radius * 1.2;
            const floatDist = bubble.radius * 0.8;
            bubble.setScale(0);
            this.tweens.add({
                targets: bubble,
                scaleX: 1,
                scaleY: 1,
                y: y - floatDist,
                duration: 500,
                ease: 'Sine.easeOut',
                onComplete: () => {
                    if (!bubble.active || bubble.isPopped) return;
                    bubble.inflating = false;
                    bubble.setInteractive({ useHandCursor: true });
                    // Release — fly upward with spread
                    bubble.vx = Phaser.Math.Between(-50, 50);
                    bubble.vy = -Phaser.Math.Between(220, 340);
                }
            });
        } else {
            const spread = 0.4;
            bubble.vx = (dxToCenter / distToCenter) * launchSpeed + Phaser.Math.Between(-20, 20);
            bubble.vy = (dyToCenter / distToCenter) * launchSpeed * (1 + Math.random() * spread);

            bubble.setScale(0);
            this.tweens.add({
                targets: bubble,
                scaleX: 1,
                scaleY: 1,
                duration: 300,
                ease: 'Back.easeOut'
            });
        }

        bubble.on('popped', (value, poppedBubble) => {
            this.money += value;
            this.totalEarned += value;
            this.updateMoneyDisplay();
            this.updateShopUI();
            this.showFloatingMoney(bubble.x, bubble.y, value, poppedBubble.isLucky);

            // Cascade check
            this.tryCascade(poppedBubble);
        });

        bubble.on('destroy', () => {
            const idx = this.bubbles.indexOf(bubble);
            if (idx > -1) this.bubbles.splice(idx, 1);
        });

        this.bubbles.push(bubble);
        return bubble;
    }

    // ─── Cascade Mechanics ───────────────────────────────────

    tryCascade(bubble) {
        const tier = bubble.tier;
        if (tier === 'basic') return; // basic can't cascade

        // Find cascade upgrade for this tier
        const cascadeDef = UPGRADE_DEFS.find(u => u.category === 'cascade' && u.tier === tier);
        if (!cascadeDef) return;

        const level = this.upgrades[cascadeDef.id] || 0;
        if (level === 0) return;

        const chance = level * cascadeDef.chancePerLevel;
        if (Math.random() >= chance) return;

        // Cascade triggers!
        const childCount = Phaser.Math.Between(cascadeDef.minChildren, cascadeDef.maxChildren);
        const childGenDef = GENERATOR_DEFS.find(g => g.tier === cascadeDef.childTier);
        if (!childGenDef) return;

        // Show "Chain!" text
        this.showCascadeText(bubble.x, bubble.y);

        // Spawn children at pop location — never lucky, cascade=true
        for (let i = 0; i < childCount; i++) {
            this.time.delayedCall(i * 50, () => {
                this.spawnBubble(childGenDef, false, bubble.x, bubble.y, true);
            });
        }
    }

    showCascadeText(x, y) {
        const text = this.add.text(x, y - 30, 'Chain!', {
            fontFamily: 'Arial Black',
            fontSize: '18px',
            color: '#ff88ff',
            stroke: '#000000',
            strokeThickness: 3,
            align: 'center'
        }).setOrigin(0.5).setDepth(201);

        this.tweens.add({
            targets: text,
            y: y - 80,
            alpha: 0,
            scaleX: 1.3,
            scaleY: 1.3,
            duration: 700,
            ease: 'Quad.easeOut',
            onComplete: () => {
                text.destroy();
            }
        });
    }

    showFloatingMoney(x, y, value, isLucky = false) {
        const label = isLucky ? `+$${value} x2!` : `+$${value}`;
        const text = this.add.text(x, y, label, {
            fontFamily: 'Arial Black',
            fontSize: isLucky ? '26px' : '22px',
            color: isLucky ? '#ffd700' : '#ffffff',
            stroke: '#000000',
            strokeThickness: 2,
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

    formatNumber(num) {
        if (num >= 1000000000) return (num / 1000000000).toFixed(1) + 'B';
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 10000) return (num / 1000).toFixed(1) + 'K';
        return Math.floor(num).toLocaleString();
    }

    // ─── Game Loop ──────────────────────────────────────────

    update(time, delta) {
        const dt = delta / 1000;
        const { width, height } = this.scale;
        const playAreaWidth = width - this.shopWidth - 20;

        // --- Machine visuals ---
        this.machineVisuals.forEach(m => {
            if (m && m.active) m.update(time, delta);
        });

        // --- Helper hands ---
        this.updateHelperHands(dt);

        // --- Obstacle updates and effects ---
        for (let oi = 0; oi < this.obstacles.length; oi++) {
            const obs = this.obstacles[oi];
            if (!obs || !obs.active) continue;
            obs.update(time, delta);

            for (let bi = this.bubbles.length - 1; bi >= 0; bi--) {
                const bubble = this.bubbles[bi];
                if (!bubble || !bubble.active || bubble.isPopped) continue;

                obs.applyEffect(bubble, dt);

                if (obs.checkCollision(bubble)) {
                    bubble.pop();
                }
            }
        }

        const pushStrength = 350;
        const bounciness = 0.7;

        for (let i = this.bubbles.length - 1; i >= 0; i--) {
            const a = this.bubbles[i];
            if (!a || !a.active || a.isPopped) continue;

            for (let j = i + 1; j < this.bubbles.length; j++) {
                const b = this.bubbles[j];
                if (!b || !b.active || b.isPopped) continue;

                const dx = a.x - b.x;
                const dy = a.y - b.y;
                const dist = Math.sqrt(dx * dx + dy * dy) || 0.1;
                const touchDist = a.radius + b.radius;

                if (dist < touchDist) {
                    const penetration = 1 - (dist / touchDist);
                    const nx = dx / dist;
                    const ny = dy / dist;
                    const relVel = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny;
                    const velBonus = Math.max(0, relVel) * 1.5;
                    const force = pushStrength * penetration * penetration + velBonus;
                    const totalMass = a.mass + b.mass;
                    const aRatio = b.mass / totalMass;
                    const bRatio = a.mass / totalMass;

                    a.vx += nx * force * aRatio * dt;
                    a.vy += ny * force * aRatio * dt;
                    b.vx -= nx * force * bRatio * dt;
                    b.vy -= ny * force * bRatio * dt;
                }
            }

            const pad = a.radius * 0.6;
            if (a.x < pad) { a.x = pad; a.vx = Math.abs(a.vx) * bounciness; }
            if (a.x > playAreaWidth - pad) { a.x = playAreaWidth - pad; a.vx = -Math.abs(a.vx) * bounciness; }
            if (a.y > height - pad) { a.y = height - pad; a.vy = -Math.abs(a.vy) * bounciness; }
            if (a.y < pad) { a.y = pad; a.vy = Math.abs(a.vy) * bounciness; }

            const maxSpeed = 220;
            const speed = Math.sqrt(a.vx * a.vx + a.vy * a.vy);
            if (speed > maxSpeed) {
                a.vx = (a.vx / speed) * maxSpeed;
                a.vy = (a.vy / speed) * maxSpeed;
            }

            a.update(time, delta);
        }
    }

    // ─── Resize & Shutdown ──────────────────────────────────

    onResize(gameSize) {
        if (!this.scene.isActive('Game')) return;
        const { width, height } = gameSize;

        if (this.bgGraphics) {
            this.bgGraphics.clear();
            this.bgGraphics.fillGradientStyle(0x0f0c29, 0x0f0c29, 0x302b63, 0x24243e, 1);
            this.bgGraphics.fillRect(0, 0, width, height);
        }

        this.shopWidth = this.calcShopWidth(width);

        if (this.moneyText) {
            this.moneyText.setPosition(20, 20);
        }
        if (this.moneyLabel) {
            this.moneyLabel.setPosition(20, 65);
        }

        this.destroyShopUI();
        this.createShopUI(width, height);
        this.updateShopUI();

        const playAreaWidth = width - this.shopWidth - 20;
        this.bubbles.forEach(bubble => {
            if (!bubble || !bubble.active || bubble.isPopped) return;
            const pad = bubble.radius * 0.6;
            if (bubble.x > playAreaWidth - pad) {
                bubble.x = playAreaWidth - pad;
            }
            if (bubble.y > height - pad) {
                bubble.y = height - pad;
            }
        });

        this.obstacles.forEach(obs => {
            if (!obs || !obs.active) return;
            const pad = 30;
            if (obs.x > playAreaWidth - pad) obs.x = playAreaWidth - pad;
            if (obs.x < pad) obs.x = pad;
            if (obs.y > height - pad) obs.y = height - pad;
            if (obs.y < pad) obs.y = pad;
        });

        this.helperHands.forEach(h => {
            if (h.x > playAreaWidth - 30) h.x = playAreaWidth - 30;
            if (h.y > height - 30) h.y = height - 30;
            h.gfx.setPosition(h.x, h.y);
        });

        this.layoutMachines();
    }

    shutdown() {
        this.scale.off('resize', this.onResize, this);
        if (this.shopWheelHandler) {
            this.input.off('wheel', this.shopWheelHandler);
            this.shopWheelHandler = null;
        }
        Object.values(this.generatorTimers).forEach(timer => {
            if (timer) timer.remove();
        });
        this.helperHands.forEach(h => {
            if (h.gfx) h.gfx.destroy();
        });
        this.helperHands = [];
        this.machineVisuals.forEach(m => {
            if (m) m.destroy();
        });
        this.machineVisuals = [];
        this.obstacles.forEach(obs => {
            if (obs && obs.active) obs.destroy();
        });
        this.obstacles = [];
    }
}

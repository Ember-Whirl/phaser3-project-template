import { GENERATOR_DEFS, getGeneratorCost, isGeneratorUnlocked, getGeneratorUnlockText } from '../data/generators.js';
import { OBSTACLE_DEFS, getObstacleCost } from '../data/obstacles.js';
import { UPGRADE_DEFS, getUpgradeCost, isUpgradeUnlocked, getUnlockText } from '../data/upgrades.js';

/** Base lucky bubble chance (1%) — needed for upgrade effect text */
const BASE_LUCKY_CHANCE = 0.01;

/** Reference width at which shop UI is designed (scale = 1.0) */
const SHOP_DESIGN_WIDTH = 300;

/**
 * Shop Manager
 * Manages the entire shop UI panel: background, tabs, scrollable item list,
 * buy buttons, item state display, upgrade lock/unlock system, and the
 * upgrade info panel.
 *
 * Features:
 * - Three-tab layout (Bubbles, Tools, Upgrades)
 * - Scrollable item list with mouse wheel support
 * - Per-item graphics: icon, name, description, count, cost button
 * - Upgrade lock/unlock system with condition-based progression
 * - Slide-in upgrade info panel (bottom-left) on hover/click
 * - Real-time affordability and max-owned state updates
 * - Buy dispatch via injected callbacks
 * - Owns shopWidth calculation
 * - Proportional UI scaling on smaller screens
 *
 * @example
 * const shop = new ShopManager(scene, {
 *     getGameState: () => ({ generators, ownedObstacles, upgrades, money, bubblesPopped }),
 *     onBuyGenerator: (def) => { ... },
 *     onBuyObstacle: (def) => { ... },
 *     onBuyUpgrade: (def) => { ... },
 *     formatNumber: (n) => '1.2K',
 * });
 * shop.create(width, height);
 */
export default class ShopManager {
    /**
     * @param {Phaser.Scene} scene - The parent Phaser scene
     * @param {Object} config - Configuration callbacks
     * @param {() => Object} config.getGameState - Returns { generators, ownedObstacles, upgrades, money, bubblesPopped }
     * @param {(def: Object) => void} config.onBuyGenerator - Called when a generator is purchased
     * @param {(def: Object) => void} config.onBuyObstacle - Called when an obstacle is purchased
     * @param {(def: Object) => void} config.onBuyUpgrade - Called when an upgrade is purchased
     * @param {(n: number) => string} config.formatNumber - Number formatting function
     */
    constructor(scene, config) {
        this.scene = scene;
        this.getGameState = config.getGameState;
        this.onBuyGenerator = config.onBuyGenerator;
        this.onBuyObstacle = config.onBuyObstacle;
        this.onBuyUpgrade = config.onBuyUpgrade;
        this.formatNumber = config.formatNumber;

        /** @type {number} Computed shop panel width */
        this.shopWidth = 0;

        /** @type {number} UI scale factor (1.0 = designed size) */
        this.shopScale = 1;

        /** @private */
        this.activeTab = 'bubbles';
        /** @private */
        this.tabItems = [];
        /** @private */
        this.emptyTabText = null;
        /** @private */
        this.shopWheelHandler = null;

        // Info panel state
        /** @private */
        this.infoPanelContainer = null;
        /** @private */
        this.infoPanelVisible = false;
        /** @private */
        this.infoPanelDef = null;
        /** @private */
        this.infoPanelTween = null;
        /** @private */
        this._infoPanelHideTimer = null;

        // Tab unlock conditions
        this.tabUnlocks = {
            upgrades: { type: 'anyUpgradeUnlocked' },
            tools: { type: 'generators', count: 3 },
        };
        /** @private */
        this._tabTooltip = null;
        /** @private */
        this._tabTooltipText = null;

        // Tutorial state
        /** @type {boolean} Whether the shop is currently offscreen */
        this.isHidden = false;
        /** @type {boolean} Whether only the first item should be shown */
        this.tutorialMode = false;
        /** @private */
        this._hiddenOffset = 0;
    }

    /**
     * Calculate proportional shop width from viewport width.
     * Target: 1/3 of screen (game gets 2/3).
     * Cap so game never exceeds 4/5 (shop min = 1/5).
     * Also cap max to prevent overly wide shop on large screens.
     * @param {number} width - Viewport width
     * @returns {number}
     */
    calcShopWidth(width) {
        const target = Math.round(width / 3);
        const minW = Math.round(width / 5);
        const maxW = 400;
        return Phaser.Math.Clamp(target, minW, maxW);
    }

    /**
     * Scale a design-time pixel value by the current shop scale factor.
     * @param {number} px - Design-time pixel value
     * @returns {number} Scaled pixel value
     */
    _s(px) { return Math.round(px * this.shopScale); }

    /**
     * Scale a font size and return a CSS-ready string (min 8px).
     * @param {number} px - Design-time font size
     * @returns {string} Scaled CSS font size
     */
    _fs(px) { return Math.max(8, Math.round(px * this.shopScale)) + 'px'; }

    /**
     * Build the full shop UI. Call on initial create and on resize.
     * @param {number} width - Viewport width
     * @param {number} height - Viewport height
     */
    create(width, height) {
        this.shopWidth = this.calcShopWidth(width);
        this.shopScale = Math.min(1, this.shopWidth / SHOP_DESIGN_WIDTH);
        const sw = this.shopWidth;
        const sx = width - sw;
        this.shopLeft = sx;

        // Full-height dark background with left border
        this.shopBg = this.scene.add.graphics();
        this.shopBg.fillStyle(0x0d0d1a, 0.9);
        this.shopBg.fillRect(sx, 0, sw, height);
        this.shopBg.lineStyle(1, 0x333355, 0.8);
        this.shopBg.lineBetween(sx, 0, sx, height);
        this.shopBg.setDepth(90);

        // Title
        this.shopTitle = this.scene.add.text(sx + sw / 2, this._s(16), 'SHOP', {
            fontFamily: 'Arial Black',
            fontSize: this._fs(22),
            color: '#ffffff',
            align: 'center'
        }).setOrigin(0.5, 0).setDepth(100);

        // Tab bar
        const tabY = this._s(50);
        const tabH = this._s(30);
        const tabPad = this._s(8);
        const tabW = (sw - tabPad * 2) / 3;
        this.shopTabY = tabY;
        this.shopTabH = tabH;

        this.tabGfx = this.scene.add.graphics().setDepth(99);
        this.tabButtons = [];

        const tabs = [
            { id: 'bubbles', label: 'Spawn' },
            { id: 'upgrades', label: 'Upgrades' },
            { id: 'tools', label: 'Tools' }
        ];

        tabs.forEach((tab, i) => {
            const tx = sx + tabPad + i * tabW;
            const isLocked = !this._isTabUnlocked(tab.id);
            const text = this.scene.add.text(tx + tabW / 2, tabY + tabH / 2,
                isLocked ? '\u{1F512} ' + tab.label : tab.label, {
                fontFamily: 'Arial',
                fontSize: this._fs(12),
                color: isLocked ? '#444455' : (tab.id === this.activeTab ? '#ffffff' : '#666688'),
                align: 'center'
            }).setOrigin(0.5).setDepth(101);

            const zone = this.scene.add.zone(tx + tabW / 2, tabY + tabH / 2, tabW, tabH)
                .setInteractive({ useHandCursor: !isLocked })
                .setDepth(102);

            zone.on('pointerdown', () => {
                if (!this._isTabUnlocked(tab.id)) {
                    this._showTabTooltip(tab.id, tx + tabW / 2, tabY + tabH + this._s(4));
                    return;
                }
                if (this.activeTab !== tab.id) {
                    this.switchTab(tab.id);
                }
            });

            if (isLocked) {
                zone.on('pointerover', () => {
                    this._showTabTooltip(tab.id, tx + tabW / 2, tabY + tabH + this._s(4));
                });
                zone.on('pointerout', () => {
                    this._hideTabTooltip();
                });
            }

            this.tabButtons.push({ id: tab.id, text, zone, x: tx, w: tabW, _locked: isLocked });
        });

        this.drawTabs();

        // Scrollable content area
        const contentY = tabY + tabH + this._s(8);
        this.shopContentY = contentY;
        this.shopContentH = height - contentY;

        // Scroll mask
        this.scrollMaskGfx = this.scene.make.graphics();
        this.scrollMaskGfx.fillRect(sx, contentY, sw, this.shopContentH);
        this.scrollMask = this.scrollMaskGfx.createGeometryMask();

        // Scroll container
        this.scrollContainer = this.scene.add.container(sx, contentY);
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
                    this._hideInfoPanel();
                }
            }
        };
        this.scene.input.on('wheel', this.shopWheelHandler);

        // Populate items for active tab
        this.tabItems = [];
        this.emptyTabText = null;
        this.populateTabItems();

        // Create info panel (starts offscreen)
        this._createInfoPanel();
    }

    /**
     * Tear down all shop UI elements.
     */
    destroyUI() {
        if (this.shopWheelHandler) {
            this.scene.input.off('wheel', this.shopWheelHandler);
            this.shopWheelHandler = null;
        }

        this._hideTabTooltip();
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

        this._destroyInfoPanel();
    }

    /**
     * Switch the active tab and repopulate items.
     * @param {string} tabId - 'bubbles', 'tools', or 'upgrades'
     */
    switchTab(tabId) {
        if (!this._isTabUnlocked(tabId)) return;
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

        this._hideInfoPanel();
    }

    /**
     * Redraw tab background graphics.
     * @private
     */
    drawTabs() {
        if (!this.tabGfx) return;
        this.tabGfx.clear();

        const notifications = this._getTabNotificationState();

        this.tabButtons.forEach(t => {
            const isActive = t.id === this.activeTab;
            const isLocked = !this._isTabUnlocked(t.id);

            if (isLocked) {
                this.tabGfx.fillStyle(0x111118, 0.4);
                this.tabGfx.fillRoundedRect(t.x, this.shopTabY, t.w, this.shopTabH,
                    { tl: 6, tr: 6, bl: 0, br: 0 });
            } else if (isActive) {
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

            // Notification dot for non-active, unlocked tabs with affordable items
            if (!isActive && !isLocked && notifications[t.id]) {
                const dotX = t.x + t.w - this._s(8);
                const dotY = this.shopTabY + this._s(8);
                this.tabGfx.fillStyle(0x4caf50, 1);
                this.tabGfx.fillCircle(dotX, dotY, this._s(4));
            }
        });
    }

    /**
     * Create item rows for the current active tab.
     * @private
     */
    populateTabItems() {
        const sw = this.shopWidth;
        const itemW = sw - this._s(16);
        const itemH = this._s(130);
        const gap = this._s(12);

        let defs = [];
        if (this.activeTab === 'bubbles') {
            // Generators + their spawn-rate and multi-spawn upgrades
            // Unlocked items first, then locked
            const state = this.getGameState();
            const unlocked = [];
            const locked = [];
            GENERATOR_DEFS.forEach(gen => {
                const genLocked = !isGeneratorUnlocked(gen, state);
                const genItem = { ...gen, type: 'bubble', _locked: genLocked };
                (genLocked ? locked : unlocked).push(genItem);
                UPGRADE_DEFS
                    .filter(u => (u.category === 'spawnRate' || u.category === 'multiSpawn' || u.category === 'bubbleValue') && u.tier === gen.tier)
                    .forEach(u => {
                        const isLocked = genLocked || !isUpgradeUnlocked(u, state);
                        const item = { ...u, type: 'upgrade', _locked: isLocked };
                        (isLocked ? locked : unlocked).push(item);
                    });
            });
            defs = [...unlocked, ...locked];
        } else if (this.activeTab === 'tools') {
            defs = OBSTACLE_DEFS.map(def => ({ ...def, type: 'tool' }));
        } else if (this.activeTab === 'upgrades') {
            // Exclude spawnRate and multiSpawn (they live on the Bubbles tab)
            // Unlocked items first, then locked
            const state = this.getGameState();
            const unlocked = [];
            const locked = [];
            UPGRADE_DEFS
                .filter(u => u.category !== 'spawnRate' && u.category !== 'multiSpawn' && u.category !== 'bubbleValue')
                .forEach(u => {
                    const isLocked = !isUpgradeUnlocked(u, state);
                    const item = { ...u, type: 'upgrade', _locked: isLocked };
                    (isLocked ? locked : unlocked).push(item);
                });
            defs = [...unlocked, ...locked];
        }

        // Tutorial mode: only show the first item on the bubbles tab
        if (this.tutorialMode && this.activeTab === 'bubbles') {
            defs = defs.slice(0, 1);
        }

        if (defs.length === 0) {
            this.emptyTabText = this.scene.add.text(sw / 2, this._s(60), 'Coming Soon', {
                fontFamily: 'Arial',
                fontSize: this._fs(16),
                color: '#666688',
                align: 'center'
            }).setOrigin(0.5).setDepth(2);
            this.scrollContainer.add(this.emptyTabText);
            this.maxScrollY = 0;
            return;
        }

        this.tabItems = [];
        defs.forEach((def, index) => {
            const y = this._s(8) + index * (itemH + gap);
            const locked = def._locked || false;
            const item = this.createTabItem(def, this._s(8), y, itemW, itemH, locked);
            this.tabItems.push(item);
        });

        const totalH = defs.length * (itemH + gap) + this._s(8);
        this.maxScrollY = Math.max(0, totalH - this.shopContentH);
    }

    /**
     * Destroy all current tab item display objects.
     * @private
     */
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

    /**
     * Get current ownership, cost, and state for a shop item.
     * @param {Object} def - Item definition with type field
     * @returns {{ owned: number, cost: number, maxOwned: number|null, color: number }}
     * @private
     */
    _getItemState(def) {
        const state = this.getGameState();
        if (def.type === 'bubble') {
            const owned = state.generators[def.id];
            return { owned, cost: getGeneratorCost(def, owned), maxOwned: null, color: def.bubbleColor };
        } else if (def.type === 'tool') {
            const owned = state.ownedObstacles[def.id];
            return { owned, cost: getObstacleCost(def, owned), maxOwned: def.maxOwned, color: def.color };
        } else {
            const owned = state.upgrades[def.id];
            return { owned, cost: getUpgradeCost(def, owned), maxOwned: def.maxOwned, color: def.color };
        }
    }

    /**
     * Get human-readable current-level effect text for an upgrade.
     * @param {Object} def - Upgrade definition
     * @returns {string}
     * @private
     */
    _getUpgradeEffectText(def) {
        const state = this.getGameState();
        const owned = state.upgrades[def.id];
        return this._getEffectAtLevel(def, owned);
    }

    /**
     * Get human-readable effect text for an upgrade at a given level.
     * @param {Object} def - Upgrade definition
     * @param {number} level - Level to describe
     * @returns {string} Empty string if level <= 0
     * @private
     */
    _getEffectAtLevel(def, level) {
        if (level <= 0) return '';

        if (def.category === 'spawnRate') {
            const pct = Math.round(level * def.reductionPerLevel * 100);
            return `${pct}% faster`;
        } else if (def.category === 'multiSpawn') {
            return `+${level} bubble${level > 1 ? 's' : ''} per spawn`;
        } else if (def.category === 'cascade') {
            const pct = Math.round(level * def.chancePerLevel * 100);
            return `${pct}% chain chance`;
        } else if (def.category === 'bubbleValue') {
            return `+$${level * def.bonusPerLevel} per bubble`;
        } else if (def.category === 'lucky') {
            const total = (BASE_LUCKY_CHANCE + level * def.bonusPerLevel) * 100;
            return `${total.toFixed(1)}% golden rate`;
        } else if (def.id === 'helperHand') {
            return `${level} auto-popper${level !== 1 ? 's' : ''}`;
        }
        return '';
    }

    /**
     * Create a single shop item row with all display elements and interaction.
     * @param {Object} def - Item definition
     * @param {number} x - Local X within scroll container
     * @param {number} y - Local Y within scroll container
     * @param {number} w - Item width
     * @param {number} h - Item height
     * @param {boolean} [locked=false] - Whether this item is locked
     * @returns {Object} Item display object collection
     * @private
     */
    createTabItem(def, x, y, w, h, locked = false) {
        const state = this.getGameState();
        const { owned, cost, maxOwned, color } = this._getItemState(def);
        const atMax = maxOwned !== null && owned >= maxOwned;
        const canAfford = !locked && !atMax && state.money >= cost;

        // Item background
        const bg = this.scene.add.graphics().setDepth(1);
        this.drawItemBg(bg, x, y, w, h, false, locked);
        this.scrollContainer.add(bg);

        // Icon (generic grey when locked to hide identity)
        const icon = this.scene.add.graphics().setDepth(2);
        const iconCx = x + this._s(34);
        const iconCy = y + h / 2;
        this.drawItemIcon(icon, iconCx, iconCy, def.type, locked ? 0x444444 : color, locked);
        this.scrollContainer.add(icon);

        // Name (hidden behind ??? when locked)
        const nameText = this.scene.add.text(x + this._s(68), y + this._s(16), locked ? '???' : def.name, {
            fontFamily: 'Arial',
            fontSize: this._fs(20),
            fontStyle: 'bold',
            color: locked ? '#444455' : '#ffffff',
            align: 'left'
        }).setOrigin(0, 0).setDepth(2);
        this.scrollContainer.add(nameText);

        // Description / effect text
        let descText = null;
        if (def.type === 'upgrade') {
            let label, labelColor;
            if (locked) {
                label = `Unlock: ${getUnlockText(def)}`;
                labelColor = '#886633';
            } else {
                const effectStr = this._getUpgradeEffectText(def);
                label = effectStr || def.description || '';
                labelColor = effectStr ? '#aaddaa' : '#777799';
            }
            descText = this.scene.add.text(x + this._s(68), y + this._s(42), label, {
                fontFamily: 'Arial',
                fontSize: this._fs(15),
                color: labelColor,
                align: 'left'
            }).setOrigin(0, 0).setDepth(2);
            this.scrollContainer.add(descText);
        } else if (def.type === 'bubble' && locked) {
            descText = this.scene.add.text(x + this._s(68), y + this._s(42), `Unlock: ${getGeneratorUnlockText(def)}`, {
                fontFamily: 'Arial',
                fontSize: this._fs(15),
                color: '#886633',
                align: 'left'
            }).setOrigin(0, 0).setDepth(2);
            this.scrollContainer.add(descText);
        }

        // Count
        let countStr;
        if (locked) {
            countStr = 'LOCKED';
        } else {
            countStr = maxOwned !== null ? `${owned}/${maxOwned}` : `x${owned}`;
        }
        const hasDescLine = def.type === 'upgrade' || (def.type === 'bubble' && locked);
        const countY = hasDescLine ? y + this._s(68) : y + this._s(52);
        const countText = this.scene.add.text(x + this._s(68), countY, countStr, {
            fontFamily: 'Arial',
            fontSize: this._fs(15),
            color: locked ? '#443333' : '#888899',
            align: 'left'
        }).setOrigin(0, 0).setDepth(2);
        this.scrollContainer.add(countText);

        // Cost button
        const btnW = this._s(95);
        const btnH = this._s(38);
        const btnX = x + w - btnW - this._s(8);
        const btnY = y + (h - btnH) / 2;

        const costBtnBg = this.scene.add.graphics().setDepth(2);
        if (locked) {
            this._drawLockedButton(costBtnBg, btnX, btnY, btnW, btnH);
        } else {
            this.drawCostButton(costBtnBg, btnX, btnY, btnW, btnH, canAfford, atMax);
        }
        this.scrollContainer.add(costBtnBg);

        let costLabel, costColor, costFontSize;
        if (locked) {
            costLabel = 'LOCKED';
            costColor = '#555555';
            costFontSize = this._fs(13);
        } else if (atMax) {
            costLabel = 'MAX';
            costColor = '#888888';
            costFontSize = this._fs(15);
        } else {
            costLabel = `$${this.formatNumber(cost)}`;
            costColor = canAfford ? '#44ff44' : '#ff4444';
            costFontSize = this._fs(15);
        }
        const costText = this.scene.add.text(btnX + btnW / 2, btnY + btnH / 2, costLabel, {
            fontFamily: 'Arial Black',
            fontSize: costFontSize,
            color: costColor,
            align: 'center'
        }).setOrigin(0.5).setDepth(3);
        this.scrollContainer.add(costText);

        // Hit zone (whole row)
        const hitZone = this.scene.add.zone(x + w / 2, y + h / 2, w, h)
            .setInteractive({ useHandCursor: !locked })
            .setDepth(10);
        this.scrollContainer.add(hitZone);

        hitZone.on('pointerdown', (pointer) => {
            if (pointer.y < this.shopContentY || pointer.y > this.shopContentY + this.shopContentH) return;
            // Show info panel for all upgrades (locked or not)
            if (def.type === 'upgrade') {
                this._onUpgradeHover(def);
            }
            if (locked) return;
            if (def.type === 'bubble') {
                this.onBuyGenerator(def);
            } else if (def.type === 'tool') {
                this.onBuyObstacle(def);
            } else if (def.type === 'upgrade') {
                this.onBuyUpgrade(def);
            }
        });

        hitZone.on('pointerover', () => {
            if (!locked) {
                bg.clear();
                this.drawItemBg(bg, x, y, w, h, true, false);
            }
            if (def.type === 'upgrade') {
                this._onUpgradeHover(def);
            }
        });

        hitZone.on('pointerout', () => {
            bg.clear();
            this.drawItemBg(bg, x, y, w, h, false, locked);
            if (def.type === 'upgrade') {
                this._onUpgradeHoverOut();
            }
        });

        return { def, type: def.type, bg, icon, nameText, descText, countText, costBtnBg, costText, hitZone, x, y, w, h, locked };
    }

    /**
     * Draw an item row background (normal, hovered, or locked).
     * @private
     */
    drawItemBg(gfx, x, y, w, h, hovered, locked = false) {
        if (locked) {
            gfx.fillStyle(0x111118, 0.5);
        } else {
            gfx.fillStyle(hovered ? 0x2a2a4a : 0x1a1a2e, hovered ? 0.9 : 0.7);
        }
        gfx.fillRoundedRect(x, y, w, h, 8);
        gfx.lineStyle(1, locked ? 0x222233 : 0x333355, locked ? 0.3 : 0.5);
        gfx.strokeRoundedRect(x, y, w, h, 8);
    }

    /**
     * Draw a cost button (affordable, unaffordable, or maxed).
     * @private
     */
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

    /**
     * Draw a locked/disabled button.
     * @private
     */
    _drawLockedButton(gfx, x, y, w, h) {
        gfx.fillStyle(0x1a1a1a, 0.6);
        gfx.fillRoundedRect(x, y, w, h, 6);
        gfx.lineStyle(1, 0x333333, 0.3);
        gfx.strokeRoundedRect(x, y, w, h, 6);
    }

    /**
     * Draw an item icon based on type, with optional locked dimming.
     * @private
     */
    drawItemIcon(gfx, cx, cy, type, color, locked = false) {
        const alpha = locked ? 0.2 : 0.5;
        const strokeAlpha = locked ? 0.3 : 0.8;
        const highlightAlpha = locked ? 0.1 : 0.3;
        const r = this._s(24);

        if (type === 'bubble') {
            gfx.fillStyle(color, alpha);
            gfx.fillCircle(cx, cy, r);
            gfx.lineStyle(1.5, color, strokeAlpha);
            gfx.strokeCircle(cx, cy, r);
            gfx.fillStyle(0xffffff, highlightAlpha);
            gfx.fillCircle(cx - this._s(7), cy - this._s(8), this._s(7));
        } else if (type === 'upgrade') {
            gfx.fillStyle(color, alpha);
            gfx.fillCircle(cx, cy, r);
            gfx.lineStyle(1.5, color, strokeAlpha);
            gfx.strokeCircle(cx, cy, r);
            gfx.fillStyle(0xffffff, locked ? 0.2 : 0.7);
            gfx.fillTriangle(cx, cy - this._s(13), cx - this._s(11), cy + this._s(3), cx + this._s(11), cy + this._s(3));
            gfx.fillRect(cx - this._s(4), cy + this._s(3), this._s(8), this._s(11));
        } else {
            const s19 = this._s(19);
            gfx.fillStyle(color, alpha);
            gfx.fillRoundedRect(cx - s19, cy - s19, s19 * 2, s19 * 2, this._s(5));
            gfx.lineStyle(1.5, color, strokeAlpha);
            gfx.strokeRoundedRect(cx - s19, cy - s19, s19 * 2, s19 * 2, this._s(5));
            const s8 = this._s(8);
            gfx.fillStyle(0xffffff, locked ? 0.05 : 0.2);
            gfx.fillRoundedRect(cx - s8, cy - s8, s8 * 2, s8 * 2, this._s(3));
        }
    }

    /**
     * Refresh all visible item states (counts, costs, button colors).
     * Rebuilds the upgrades tab if any lock states changed.
     */
    updateItems() {
        if (!this.tabItems) return;

        // Check if any tab unlock state changed (needs full rebuild)
        if (this.tabButtons) {
            for (const tab of this.tabButtons) {
                const isLocked = !this._isTabUnlocked(tab.id);
                if (tab._locked !== isLocked) {
                    const { width, height } = this.scene.scale;
                    this.destroyUI();
                    this.create(width, height);
                    return;
                }
            }
        }

        // Check if any lock state changed (needs full rebuild)
        const state = this.getGameState();
        let needsRebuild = false;
        for (const item of this.tabItems) {
            if (item.def.type === 'upgrade') {
                const nowLocked = !isUpgradeUnlocked(item.def, state);
                if (item.locked !== nowLocked) {
                    needsRebuild = true;
                    break;
                }
            } else if (item.def.type === 'bubble') {
                const nowLocked = !isGeneratorUnlocked(item.def, state);
                if (item.locked !== nowLocked) {
                    needsRebuild = true;
                    break;
                }
            }
        }
        if (needsRebuild) {
            this.destroyTabItems();
            this.populateTabItems();
            return;
        }

        this.tabItems.forEach(item => {
            if (item.locked) return; // locked items don't update

            const { owned, cost, maxOwned } = this._getItemState(item.def);
            const atMax = maxOwned !== null && owned >= maxOwned;
            const canAfford = !atMax && state.money >= cost;

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

            const btnW = this._s(95);
            const btnH = this._s(38);
            const btnX = item.x + item.w - btnW - this._s(8);
            const btnY = item.y + (item.h - btnH) / 2;
            item.costBtnBg.clear();
            this.drawCostButton(item.costBtnBg, btnX, btnY, btnW, btnH, canAfford, atMax);
        });

        // Redraw tabs (notification dots may have changed)
        this.drawTabs();

        // Update info panel if visible
        if (this.infoPanelVisible && this.infoPanelDef) {
            this._updateInfoPanelContent(this.infoPanelDef);
        }
    }

    // ─── Info Panel ─────────────────────────────────────────

    /**
     * Create the upgrade info panel (starts hidden below screen).
     * @private
     */
    _createInfoPanel() {
        const { height } = this.scene.scale;
        const panelW = this._s(280);
        const panelH = this._s(150);

        this.infoPanelW = panelW;
        this.infoPanelH = panelH;

        // Container starts below the screen
        this.infoPanelContainer = this.scene.add.container(12, height + 10);
        this.infoPanelContainer.setDepth(300);

        // Background
        this.infoPanelBg = this.scene.add.graphics();
        this.infoPanelBg.fillStyle(0x0d0d1a, 0.95);
        this.infoPanelBg.fillRoundedRect(0, 0, panelW, panelH, this._s(8));
        this.infoPanelBg.lineStyle(1, 0x333355, 0.8);
        this.infoPanelBg.strokeRoundedRect(0, 0, panelW, panelH, this._s(8));
        // Separator after title
        this.infoPanelBg.lineStyle(1, 0x333355, 0.4);
        this.infoPanelBg.lineBetween(this._s(10), this._s(34), panelW - this._s(10), this._s(34));
        this.infoPanelContainer.add(this.infoPanelBg);

        // Title
        this.infoPanelTitle = this.scene.add.text(this._s(12), this._s(10), '', {
            fontFamily: 'Arial',
            fontSize: this._fs(15),
            fontStyle: 'bold',
            color: '#ffffff',
        }).setOrigin(0, 0);
        this.infoPanelContainer.add(this.infoPanelTitle);

        // Status (right-aligned)
        this.infoPanelStatus = this.scene.add.text(panelW - this._s(12), this._s(12), '', {
            fontFamily: 'Arial',
            fontSize: this._fs(12),
            color: '#888899',
        }).setOrigin(1, 0);
        this.infoPanelContainer.add(this.infoPanelStatus);

        // Description
        this.infoPanelDesc = this.scene.add.text(this._s(12), this._s(42), '', {
            fontFamily: 'Arial',
            fontSize: this._fs(11),
            color: '#8899aa',
            wordWrap: { width: panelW - this._s(24) },
            maxLines: 2,
        }).setOrigin(0, 0);
        this.infoPanelContainer.add(this.infoPanelDesc);

        // Current effect
        this.infoPanelCurrent = this.scene.add.text(this._s(12), this._s(78), '', {
            fontFamily: 'Arial',
            fontSize: this._fs(11),
            color: '#aaddaa',
        }).setOrigin(0, 0);
        this.infoPanelContainer.add(this.infoPanelCurrent);

        // Next effect
        this.infoPanelNext = this.scene.add.text(this._s(12), this._s(96), '', {
            fontFamily: 'Arial',
            fontSize: this._fs(11),
            color: '#88bbff',
        }).setOrigin(0, 0);
        this.infoPanelContainer.add(this.infoPanelNext);

        // Cost / Unlock condition
        this.infoPanelCost = this.scene.add.text(this._s(12), this._s(124), '', {
            fontFamily: 'Arial',
            fontSize: this._fs(12),
            fontStyle: 'bold',
            color: '#44ff44',
        }).setOrigin(0, 0);
        this.infoPanelContainer.add(this.infoPanelCost);

        this.infoPanelVisible = false;
        this.infoPanelDef = null;
        this.infoPanelTween = null;
        this._infoPanelHideTimer = null;
    }

    /**
     * Clean up info panel elements.
     * @private
     */
    _destroyInfoPanel() {
        if (this._infoPanelHideTimer) {
            this._infoPanelHideTimer.remove();
            this._infoPanelHideTimer = null;
        }
        if (this.infoPanelTween) {
            this.infoPanelTween.stop();
            this.infoPanelTween = null;
        }
        if (this.infoPanelContainer) {
            this.infoPanelContainer.destroy();
            this.infoPanelContainer = null;
        }
        this.infoPanelVisible = false;
        this.infoPanelDef = null;
    }

    /**
     * Update the info panel text content for a given upgrade definition.
     * @param {Object} def - Upgrade definition
     * @private
     */
    _updateInfoPanelContent(def) {
        const state = this.getGameState();
        const locked = !isUpgradeUnlocked(def, state);
        const owned = state.upgrades[def.id] || 0;
        const atMax = def.maxOwned !== null && owned >= def.maxOwned;

        // Title (hidden behind ??? when locked)
        this.infoPanelTitle.setText(locked ? '???' : def.name);
        this.infoPanelTitle.setColor(locked ? '#444455' : '#ffffff');

        // Status
        if (locked) {
            this.infoPanelStatus.setText('LOCKED');
            this.infoPanelStatus.setColor('#ff4444');
        } else if (atMax) {
            this.infoPanelStatus.setText('MAXED');
            this.infoPanelStatus.setColor('#888888');
        } else {
            this.infoPanelStatus.setText(`Lv.${owned}/${def.maxOwned}`);
            this.infoPanelStatus.setColor('#888899');
        }

        // Description (hidden when locked)
        if (locked) {
            this.infoPanelDesc.setText('');
        } else {
            this.infoPanelDesc.setText(def.description);
            this.infoPanelDesc.setColor('#8899aa');
        }

        // Dynamic Y positioning for content below description
        let nextY = locked ? this._s(48) : this._s(42) + this.infoPanelDesc.height + this._s(10);

        // Current effect (hidden when locked)
        const currentEffect = locked ? '' : this._getEffectAtLevel(def, owned);
        if (currentEffect) {
            this.infoPanelCurrent.setText(`Current: ${currentEffect}`);
            this.infoPanelCurrent.setY(nextY);
            this.infoPanelCurrent.setVisible(true);
            nextY += this._s(18);
        } else {
            this.infoPanelCurrent.setVisible(false);
        }

        // Next effect (hidden when locked)
        if (!locked && !atMax) {
            const nextEffect = this._getEffectAtLevel(def, owned + 1);
            if (nextEffect) {
                this.infoPanelNext.setText(`Next: ${nextEffect}`);
                this.infoPanelNext.setY(nextY);
                this.infoPanelNext.setVisible(true);
                nextY += this._s(18);
            } else {
                this.infoPanelNext.setVisible(false);
            }
        } else {
            this.infoPanelNext.setVisible(false);
        }

        // Cost / Unlock
        nextY += this._s(4);
        this.infoPanelCost.setY(nextY);
        if (locked) {
            this.infoPanelCost.setText(`Unlock: ${getUnlockText(def)}`);
            this.infoPanelCost.setColor('#ffaa44');
        } else if (atMax) {
            this.infoPanelCost.setText('Fully upgraded');
            this.infoPanelCost.setColor('#888888');
        } else {
            const cost = getUpgradeCost(def, owned);
            const canAfford = state.money >= cost;
            this.infoPanelCost.setText(`Cost: $${this.formatNumber(cost)}`);
            this.infoPanelCost.setColor(canAfford ? '#44ff44' : '#ff4444');
        }
    }

    /**
     * Handle upgrade item hover — show the info panel.
     * @param {Object} def - Upgrade definition
     * @private
     */
    _onUpgradeHover(def) {
        if (!this.infoPanelContainer) return;

        // Cancel any pending hide
        if (this._infoPanelHideTimer) {
            this._infoPanelHideTimer.remove();
            this._infoPanelHideTimer = null;
        }

        // Update content
        this._updateInfoPanelContent(def);
        this.infoPanelDef = def;

        if (this.infoPanelVisible) return; // already shown, content updated

        this.infoPanelVisible = true;

        if (this.infoPanelTween) {
            this.infoPanelTween.stop();
        }

        const { height } = this.scene.scale;
        const targetY = height - this.infoPanelH - 12;

        this.infoPanelTween = this.scene.tweens.add({
            targets: this.infoPanelContainer,
            y: targetY,
            duration: 200,
            ease: 'Power2',
        });
    }

    /**
     * Handle upgrade item hover-out — schedule info panel hide.
     * @private
     */
    _onUpgradeHoverOut() {
        if (this._infoPanelHideTimer) {
            this._infoPanelHideTimer.remove();
        }

        this._infoPanelHideTimer = this.scene.time.delayedCall(300, () => {
            this._hideInfoPanel();
            this._infoPanelHideTimer = null;
        });
    }

    /**
     * Slide the info panel back offscreen.
     * @private
     */
    _hideInfoPanel() {
        if (!this.infoPanelContainer || !this.infoPanelVisible) return;

        this.infoPanelVisible = false;
        this.infoPanelDef = null;

        if (this.infoPanelTween) {
            this.infoPanelTween.stop();
        }

        const { height } = this.scene.scale;

        this.infoPanelTween = this.scene.tweens.add({
            targets: this.infoPanelContainer,
            y: height + 10,
            duration: 150,
            ease: 'Power2',
        });
    }

    // ─── Tab Unlock & Notification ─────────────────────────

    /**
     * Check whether a tab is unlocked based on game state.
     * @param {string} tabId
     * @returns {boolean}
     * @private
     */
    _isTabUnlocked(tabId) {
        if (tabId === 'bubbles') return true;
        const unlock = this.tabUnlocks[tabId];
        if (!unlock) return true;
        const state = this.getGameState();
        if (unlock.type === 'generators') {
            const total = Object.values(state.generators).reduce((sum, c) => sum + c, 0);
            return total >= unlock.count;
        }
        if (unlock.type === 'bubblesPopped') {
            return state.bubblesPopped >= unlock.count;
        }
        if (unlock.type === 'anyUpgradeUnlocked') {
            return UPGRADE_DEFS
                .filter(u => u.category !== 'spawnRate' && u.category !== 'multiSpawn' && u.category !== 'bubbleValue')
                .some(u => isUpgradeUnlocked(u, state));
        }
        return true;
    }

    /**
     * Return which tabs currently have affordable, unlocked items.
     * @returns {{ bubbles: boolean, tools: boolean, upgrades: boolean }}
     * @private
     */
    _getTabNotificationState() {
        const state = this.getGameState();
        const result = { bubbles: false, tools: false, upgrades: false };

        // Bubbles tab: generators + spawn-related upgrades
        for (const gen of GENERATOR_DEFS) {
            if (!isGeneratorUnlocked(gen, state)) continue;
            const owned = state.generators[gen.id];
            if (state.money >= getGeneratorCost(gen, owned)) { result.bubbles = true; break; }
        }
        if (!result.bubbles) {
            for (const u of UPGRADE_DEFS) {
                if (u.category !== 'spawnRate' && u.category !== 'multiSpawn' && u.category !== 'bubbleValue') continue;
                if (!isUpgradeUnlocked(u, state)) continue;
                const owned = state.upgrades[u.id];
                if (u.maxOwned !== null && owned >= u.maxOwned) continue;
                if (state.money >= getUpgradeCost(u, owned)) { result.bubbles = true; break; }
            }
        }

        // Tools tab
        for (const def of OBSTACLE_DEFS) {
            const owned = state.ownedObstacles[def.id];
            if (def.maxOwned !== null && owned >= def.maxOwned) continue;
            if (state.money >= getObstacleCost(def, owned)) { result.tools = true; break; }
        }

        // Upgrades tab (non-spawn upgrades)
        for (const u of UPGRADE_DEFS) {
            if (u.category === 'spawnRate' || u.category === 'multiSpawn' || u.category === 'bubbleValue') continue;
            if (!isUpgradeUnlocked(u, state)) continue;
            const owned = state.upgrades[u.id];
            if (u.maxOwned !== null && owned >= u.maxOwned) continue;
            if (state.money >= getUpgradeCost(u, owned)) { result.upgrades = true; break; }
        }

        return result;
    }

    /**
     * Get human-readable unlock condition text for a tab.
     * @param {string} tabId
     * @returns {string}
     * @private
     */
    _getTabUnlockText(tabId) {
        const unlock = this.tabUnlocks[tabId];
        if (!unlock) return '';
        if (unlock.type === 'generators') return `Own ${unlock.count} generators to unlock`;
        if (unlock.type === 'bubblesPopped') return `Pop ${unlock.count} bubbles to unlock`;
        if (unlock.type === 'anyUpgradeUnlocked') return 'Keep earning to unlock';
        return '';
    }

    /**
     * Show a tooltip below a locked tab.
     * @param {string} tabId
     * @param {number} x - Center X
     * @param {number} y - Top Y
     * @private
     */
    _showTabTooltip(tabId, x, y) {
        this._hideTabTooltip();
        const text = this._getTabUnlockText(tabId);
        if (!text) return;

        const padding = this._s(8);
        this._tabTooltipText = this.scene.add.text(x, y + padding + this._s(4), text, {
            fontFamily: 'Arial',
            fontSize: this._fs(11),
            color: '#cccccc',
            align: 'center',
        }).setOrigin(0.5, 0).setDepth(200);

        const bounds = this._tabTooltipText.getBounds();
        this._tabTooltip = this.scene.add.graphics().setDepth(199);
        this._tabTooltip.fillStyle(0x000000, 0.9);
        this._tabTooltip.fillRoundedRect(
            bounds.x - padding, bounds.y - padding / 2,
            bounds.width + padding * 2, bounds.height + padding,
            4
        );
    }

    /**
     * Hide the tab tooltip.
     * @private
     */
    _hideTabTooltip() {
        if (this._tabTooltip) { this._tabTooltip.destroy(); this._tabTooltip = null; }
        if (this._tabTooltipText) { this._tabTooltipText.destroy(); this._tabTooltipText = null; }
    }

    /**
     * Handle resize: tear down and rebuild the shop UI.
     * @param {number} width - New viewport width
     * @param {number} height - New viewport height
     */
    onResize(width, height) {
        const wasHidden = this.isHidden;
        const wasTutorial = this.tutorialMode;
        this.destroyUI();
        if (wasHidden) {
            this.createHidden(width, height);
        } else {
            this.tutorialMode = wasTutorial;
            this.create(width, height);
        }
        this.updateItems();
    }

    /**
     * Clean up everything.
     */
    destroy() {
        this.destroyUI();
    }

    // ─── Tutorial Methods ────────────────────────────────────

    /**
     * Create the shop UI in a hidden state (offscreen to the right).
     * @param {number} width - Viewport width
     * @param {number} height - Viewport height
     */
    createHidden(width, height) {
        this.tutorialMode = true;
        this.create(width, height);
        this.isHidden = true;
        this._hiddenOffset = this.shopWidth;
        this._getShopElements().forEach(el => { if (el) el.x += this._hiddenOffset; });
    }

    /**
     * Slide the shop in from the right edge of the screen.
     * @param {number} [duration=500] - Animation duration in ms
     * @param {() => void} [onComplete] - Callback when animation finishes
     */
    slideIn(duration = 500, onComplete) {
        if (!this.isHidden) return;
        this.isHidden = false;

        const elements = this._getShopElements();
        this.scene.tweens.add({
            targets: elements,
            x: `-=${this._hiddenOffset}`,
            duration,
            ease: 'Power2',
            onComplete: () => { if (onComplete) onComplete(); }
        });
    }

    /**
     * After the first purchase, reveal all remaining shop items with
     * a staggered fade-in animation.
     * @param {() => void} [onComplete] - Callback when all items are revealed
     */
    revealAllItems(onComplete) {
        this.tutorialMode = false;
        this.destroyTabItems();
        this.populateTabItems();

        const items = this.tabItems;
        items.forEach((item, index) => {
            if (index === 0) return; // First item was already visible

            const visuals = [item.bg, item.icon, item.nameText, item.descText,
                item.countText, item.costBtnBg, item.costText].filter(Boolean);
            visuals.forEach(el => el.setAlpha(0));
            if (item.hitZone) item.hitZone.disableInteractive();

            const delay = index * 120;
            this.scene.tweens.add({
                targets: visuals,
                alpha: 1,
                duration: 300,
                delay,
                ease: 'Power2',
                onComplete: () => {
                    if (item.hitZone) {
                        item.hitZone.setInteractive({ useHandCursor: !item.locked });
                    }
                }
            });
        });

        if (onComplete) {
            const totalDuration = Math.max(0, (items.length - 1) * 120 + 300);
            this.scene.time.delayedCall(totalDuration, onComplete);
        }
    }

    /**
     * Collect all moveable shop UI elements (for slide animation).
     * @returns {Phaser.GameObjects.GameObject[]}
     * @private
     */
    _getShopElements() {
        const elements = [];
        if (this.shopBg) elements.push(this.shopBg);
        if (this.shopTitle) elements.push(this.shopTitle);
        if (this.tabGfx) elements.push(this.tabGfx);
        if (this.tabButtons) {
            this.tabButtons.forEach(t => {
                if (t.text) elements.push(t.text);
                if (t.zone) elements.push(t.zone);
            });
        }
        if (this.scrollContainer) elements.push(this.scrollContainer);
        if (this.scrollMaskGfx) elements.push(this.scrollMaskGfx);
        return elements;
    }
}

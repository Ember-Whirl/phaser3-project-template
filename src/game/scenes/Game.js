import { Scene } from 'phaser';
import { GENERATOR_DEFS, getGeneratorCost, isGeneratorUnlocked } from '../data/generators.js';
import { OBSTACLE_DEFS, getObstacleCost } from '../data/obstacles.js';
import { UPGRADE_DEFS, getUpgradeCost } from '../data/upgrades.js';
import { PLAY_WIDTH, PLAY_HEIGHT } from '../PlayAreaConfig.js';

import EconomyManager from '../managers/EconomyManager.js';
import MachineManager from '../managers/MachineManager.js';
import HelperHandManager from '../managers/HelperHandManager.js';
import PhysicsManager from '../managers/PhysicsManager.js';
import GeneratorManager from '../managers/GeneratorManager.js';
import ShopManager from '../managers/ShopManager.js';
import TutorialManager from '../managers/TutorialManager.js';
import PortalManager from '../../scripts/adapters/portals/portalManager';

export class Game extends Scene {
    constructor() {
        super('Game');
    }

    create() {
        const { width, height } = this.scale;

        // Shared state
        this.bubbles = [];
        this.upgrades = {};
        this.permanentUnlocks = new Set();
        UPGRADE_DEFS.forEach(def => { this.upgrades[def.id] = 0; });

        // Background
        this.cameras.main.setBackgroundColor(0x1a1a2e);
        this.createBackground(width, height);

        // Gameplay container — all gameplay objects live inside this.
        // Internal coordinates are fixed at PLAY_WIDTH x PLAY_HEIGHT;
        // the container is scaled to fit the available screen space.
        this.gameplayContainer = this.add.container(0, 0);
        this.gameplayContainer.setDepth(10);

        // Managers
        this.economy = new EconomyManager(this, this.gameplayContainer);
        this.economy.createUI(width);

        this.physics = new PhysicsManager(this, this.gameplayContainer);
        this.physics.init(OBSTACLE_DEFS);

        this.generators = new GeneratorManager(this, {
            getUpgrades: () => this.upgrades,
            container: this.gameplayContainer,
            pickSpawnMachine: (genId, unitIndex) => this.machines.pickSpawnMachine(genId, unitIndex),
            onBubblePopped: (value, bubble) => {
                this.economy.addMoney(value);
                this.economy.bubblesPopped++;
                this.economy.showFloatingMoney(bubble.x, bubble.y, value, bubble.isLucky);
                this.shop.updateItems();
            },
            bubbles: this.bubbles,
        });
        this.generators.init();

        this.shop = new ShopManager(this, {
            getGameState: () => ({
                generators: this.generators.generators,
                ownedObstacles: this.physics.ownedObstacles,
                upgrades: this.upgrades,
                money: this.economy.getMoney(),
                bubblesPopped: this.economy.bubblesPopped,
                permanentUnlocks: this.permanentUnlocks,
            }),
            onBuyGenerator: (def) => this.buyGenerator(def),
            onBuyObstacle: (def) => this.buyObstacle(def),
            onBuyUpgrade: (def) => this.buyUpgrade(def),
            formatNumber: (n) => this.economy.formatNumber(n),
        });
        this.shop.createHidden(width, height);

        this.tutorial = new TutorialManager(this, {
            shop: this.shop,
            economy: this.economy,
            getGameState: () => ({
                bubblesPopped: this.economy.bubblesPopped,
                totalEarned: this.economy.totalEarned,
                money: this.economy.getMoney(),
                basicGenerators: this.generators.getOwned('basic'),
                upgradesPurchased: this.tutorial ? this.tutorial.upgradesPurchased : 0,
            }),
            onShopReveal: () => this.onShopReveal(),
        });

        this.machines = new MachineManager(this, this.gameplayContainer);

        this.hands = new HelperHandManager(this, this.gameplayContainer);

        // Size and position the gameplay container to fit available space
        this.layoutPlayArea();

        // Place machines + start generator timers
        this.machines.rebuild(this.generators.generators);
        this.generators.startAll();

        // Money cheat: press M to add $10,000
        this.input.keyboard.on('keydown-M', () => {
            this.economy.addMoney(10000);
            this.shop.updateItems();
            this.economy.showFloatingMoney(PLAY_WIDTH / 2, 100, 10000);
        });

        // Notify portal that gameplay has started
        PortalManager.gameplayStart();

        // Resize + shutdown handlers
        this.scale.on('resize', this.onResize, this);
        this.events.on('shutdown', this.shutdown, this);
    }

    createBackground(width, height) {
        const bg = this.add.graphics();
        bg.fillGradientStyle(0x0f0c29, 0x0f0c29, 0x302b63, 0x24243e, 1);
        bg.fillRect(0, 0, width, height);
        bg.setDepth(-10);
        this.bgGraphics = bg;
    }

    /**
     * Position and scale the gameplay container so that the fixed
     * PLAY_WIDTH x PLAY_HEIGHT area fits the available screen space
     * (screen minus the shop panel).
     */
    layoutPlayArea() {
        const { width, height } = this.scale;
        const shopWidth = (this.tutorial && this.tutorial.isShopHidden()) ? 0 : this.shop.shopWidth;
        const viewW = width - shopWidth;
        const viewH = height;

        const scaleX = viewW / PLAY_WIDTH;
        const scaleY = viewH / PLAY_HEIGHT;
        const scale = Math.min(scaleX, scaleY);

        // Center the play area within the available viewport
        const offsetX = (viewW - PLAY_WIDTH * scale) / 2;
        const offsetY = (viewH - PLAY_HEIGHT * scale) / 2;

        this.gameplayContainer.setPosition(offsetX, offsetY);
        this.gameplayContainer.setScale(scale);
    }

    /**
     * Called when the shop is about to slide in — smoothly resize the play area.
     */
    onShopReveal() {
        const { width, height } = this.scale;
        const shopWidth = this.shop.shopWidth;
        const viewW = width - shopWidth;

        const scaleX = viewW / PLAY_WIDTH;
        const scaleY = height / PLAY_HEIGHT;
        const newScale = Math.min(scaleX, scaleY);

        const offsetX = (viewW - PLAY_WIDTH * newScale) / 2;
        const offsetY = (height - PLAY_HEIGHT * newScale) / 2;

        this.tweens.add({
            targets: this.gameplayContainer,
            scaleX: newScale,
            scaleY: newScale,
            x: offsetX,
            y: offsetY,
            duration: 500,
            ease: 'Power2',
        });
    }

    // ─── Buy Actions ────────────────────────────────────────

    buyGenerator(def) {
        const state = { generators: this.generators.generators, permanentUnlocks: this.permanentUnlocks };
        if (def.unlock && !isGeneratorUnlocked(def, state)) return;
        const owned = this.generators.getOwned(def.id);
        const cost = getGeneratorCost(def, owned);
        if (!this.economy.spendMoney(cost)) return;

        this.generators.addGenerator(def);
        this.machines.rebuild(this.generators.generators);
        this.shop.updateItems();
        this.tutorial.onPurchaseMade();
    }

    buyObstacle(def) {
        const owned = this.physics.getOwned(def.id);
        if (owned >= def.maxOwned) return;
        const cost = getObstacleCost(def, owned);
        if (!this.economy.spendMoney(cost)) return;

        this.physics.buyObstacle(def);
        this.shop.updateItems();
    }

    buyUpgrade(def) {
        const owned = this.upgrades[def.id];
        if (owned >= def.maxOwned) return;
        const cost = getUpgradeCost(def, owned);
        if (!this.economy.spendMoney(cost)) return;

        this.upgrades[def.id]++;
        this.applyUpgrade(def);
        this.shop.updateItems();
        this.tutorial.onUpgradePurchased();
    }

    applyUpgrade(def) {
        if (def.id === 'helperHand') {
            this.hands.spawnHand(def);
        } else if (def.category === 'spawnRate') {
            const genDef = GENERATOR_DEFS.find(g => g.tier === def.tier);
            if (genDef) this.generators.startGeneratorTimer(genDef);
        }
    }

    // ─── Game Loop ──────────────────────────────────────────

    update(time, delta) {
        const dt = delta / 1000;
        this.tutorial.update();
        this.machines.update(time, delta);
        this.hands.update(dt, this.bubbles);
        this.physics.update(time, delta, this.bubbles);
    }

    // ─── Resize & Shutdown ──────────────────────────────────

    onResize(gameSize) {
        if (!this.scene.isActive('Game')) return;
        const { width, height } = gameSize;

        // Redraw background to fill screen
        if (this.bgGraphics) {
            this.bgGraphics.clear();
            this.bgGraphics.fillGradientStyle(0x0f0c29, 0x0f0c29, 0x302b63, 0x24243e, 1);
            this.bgGraphics.fillRect(0, 0, width, height);
        }

        // UI resize (screen space)
        this.economy.onResize(width);
        this.tutorial.onResize(width);
        this.shop.onResize(width, height);

        // Rescale and reposition the gameplay container
        this.layoutPlayArea();
    }

    shutdown() {
        PortalManager.gameplayStop();
        this.scale.off('resize', this.onResize, this);
        this.tutorial.destroy();
        this.tutorial = null;
        this.generators.destroy();
        this.hands.destroy();
        this.machines.destroy();
        this.physics.destroy();
        this.shop.destroy();
        this.economy.destroy();
    }
}

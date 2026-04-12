import { GENERATOR_DEFS, getGeneratorCost } from '../data/generators.js';

/**
 * Tutorial task definitions.
 * Each task's target is a DELTA — how much progress is needed from the
 * moment the task becomes active (not an absolute value).
 */
const TUTORIAL_TASKS = [
    {
        id: 'pop_first',
        text: 'Pop a bubble!',
        target: 1,
        getProgress: (state) => state.bubblesPopped,
    },
    {
        id: 'earn_5',
        text: 'Earn $5',
        target: 5,
        getProgress: (state) => state.totalEarned,
        formatProgress: (current, target) => `$${Math.min(current, target).toFixed(0)} / $${target}`,
    },
    {
        id: 'buy_spawner',
        text: 'Buy a Bubble Spawner',
        target: 1,
        getProgress: (state) => state.basicGenerators,
    },
    {
        id: 'pop_20',
        text: 'Pop 20 bubbles',
        target: 20,
        getProgress: (state) => state.bubblesPopped,
    },
    {
        id: 'buy_upgrade',
        text: 'Buy an upgrade',
        target: 1,
        getProgress: (state) => state.upgradesPurchased,
    },
];

/**
 * Tutorial Manager
 * Manages the new-player tutorial flow and displays task objectives.
 *
 * Phases (control shop behavior):
 * - WAITING_FOR_MONEY: Shop hidden
 * - SHOP_VISIBLE: Shop slid in, tutorial mode (1 item)
 * - COMPLETE: All items revealed
 *
 * Tasks (visual guide for player):
 * - Displayed as a top-center panel showing current objective + progress
 * - Each task tracks progress as a DELTA from a baseline snapshot
 * - Transitions between tasks with animations
 */
export default class TutorialManager {
    /**
     * @param {Phaser.Scene} scene
     * @param {Object} config
     * @param {import('./ShopManager').default} config.shop
     * @param {import('./EconomyManager').default} config.economy
     * @param {() => Object} config.getGameState - Returns state for task progress
     * @param {() => void} config.onShopReveal - Called when shop starts sliding in
     */
    constructor(scene, config) {
        this.scene = scene;
        this.shop = config.shop;
        this.economy = config.economy;
        this.getGameState = config.getGameState;
        this.onShopReveal = config.onShopReveal;

        // Phase state (controls shop)
        this.phase = 'WAITING_FOR_MONEY';
        const basicDef = GENERATOR_DEFS[0];
        this.firstPurchaseCost = getGeneratorCost(basicDef, 1); // $5

        // Task state
        this.tasks = TUTORIAL_TASKS;
        this.currentTaskIndex = 0;
        this.upgradesPurchased = 0;
        this._taskCompleting = false;

        // Snapshot the baseline for the first task
        this._taskBaseline = 0;
        this._snapshotBaseline();

        // UI
        this._createUI();
    }

    // ─── Baseline Tracking ───────────────────────────────────

    /**
     * Snapshot current progress value as baseline for the active task.
     * @private
     */
    _snapshotBaseline() {
        if (this.currentTaskIndex >= this.tasks.length) return;
        const task = this.tasks[this.currentTaskIndex];
        const state = this.getGameState();
        this._taskBaseline = task.getProgress(state);
    }

    /**
     * Get current progress relative to the baseline.
     * @returns {number}
     * @private
     */
    _getRelativeProgress() {
        if (this.currentTaskIndex >= this.tasks.length) return 0;
        const task = this.tasks[this.currentTaskIndex];
        const state = this.getGameState();
        return task.getProgress(state) - this._taskBaseline;
    }

    // ─── UI ──────────────────────────────────────────────────

    /** @private */
    _createUI() {
        const { width } = this.scene.scale;

        // Root container for the task panel
        this.container = this.scene.add.container(width / 2, 20);
        this.container.setDepth(200);

        // Background panel
        this.panelBg = this.scene.add.graphics();
        this.container.add(this.panelBg);

        // "TASK" label
        this.labelText = this.scene.add.text(0, 14, 'TASK', {
            fontFamily: 'Arial',
            fontSize: '14px',
            color: '#888899',
            align: 'center',
            letterSpacing: 3,
        }).setOrigin(0.5, 0);
        this.container.add(this.labelText);

        // Task description
        this.taskText = this.scene.add.text(0, 36, '', {
            fontFamily: 'Arial Black',
            fontSize: '22px',
            color: '#ffffff',
            align: 'center',
        }).setOrigin(0.5, 0);
        this.container.add(this.taskText);

        // Progress text
        this.progressText = this.scene.add.text(0, 66, '', {
            fontFamily: 'Arial',
            fontSize: '16px',
            color: '#aaddaa',
            align: 'center',
        }).setOrigin(0.5, 0);
        this.container.add(this.progressText);

        // Progress bar background
        this.barBg = this.scene.add.graphics();
        this.container.add(this.barBg);

        // Progress bar fill
        this.barFill = this.scene.add.graphics();
        this.container.add(this.barFill);

        // Completion checkmark (hidden initially)
        this.checkText = this.scene.add.text(0, 55, '\u2713', {
            fontFamily: 'Arial Black',
            fontSize: '36px',
            color: '#44ff44',
            align: 'center',
        }).setOrigin(0.5, 0.5).setAlpha(0);
        this.container.add(this.checkText);

        // Draw initial state
        this._updateTaskDisplay();
    }

    /** @private */
    _drawPanel() {
        const panelW = 300;
        const panelH = 100;

        this.panelBg.clear();
        this.panelBg.fillStyle(0x0d0d1a, 0.85);
        this.panelBg.fillRoundedRect(-panelW / 2, 0, panelW, panelH, 12);
        this.panelBg.lineStyle(1.5, 0x333355, 0.6);
        this.panelBg.strokeRoundedRect(-panelW / 2, 0, panelW, panelH, 12);
    }

    /** @private */
    _drawProgressBar(progress) {
        const barW = 220;
        const barH = 8;
        const barX = -barW / 2;
        const barY = 86;
        const fill = Phaser.Math.Clamp(progress, 0, 1);

        this.barBg.clear();
        this.barBg.fillStyle(0x222233, 1);
        this.barBg.fillRoundedRect(barX, barY, barW, barH, 4);

        this.barFill.clear();
        if (fill > 0) {
            const fillW = Math.max(barH, barW * fill);
            this.barFill.fillStyle(0x44ff44, 0.8);
            this.barFill.fillRoundedRect(barX, barY, fillW, barH, 4);
        }
    }

    /** @private */
    _updateTaskDisplay() {
        if (this.currentTaskIndex >= this.tasks.length) {
            this._hidePanel();
            return;
        }

        const task = this.tasks[this.currentTaskIndex];
        const relativeProgress = this._getRelativeProgress();
        const progress = Math.max(0, Math.min(relativeProgress, task.target));
        const fraction = progress / task.target;

        this.taskText.setText(task.text);

        const progressStr = task.formatProgress
            ? task.formatProgress(relativeProgress, task.target)
            : `${progress} / ${task.target}`;
        this.progressText.setText(progressStr);

        this._drawPanel();
        this._drawProgressBar(fraction);
    }

    /** @private */
    _hidePanel() {
        if (!this.container || !this.container.active) return;
        this.scene.tweens.add({
            targets: this.container,
            alpha: 0,
            y: -50,
            duration: 400,
            ease: 'Power2',
            onComplete: () => {
                if (this.container) this.container.setVisible(false);
            }
        });
    }

    /** @private */
    _completeCurrentTask() {
        if (this._taskCompleting) return;
        this._taskCompleting = true;

        // Flash green and show checkmark
        this.taskText.setColor('#44ff44');
        this.progressText.setAlpha(0);
        this.barBg.setAlpha(0);
        this.barFill.setAlpha(0);
        this.checkText.setAlpha(0);
        this.checkText.y = 55;

        this.scene.tweens.add({
            targets: this.checkText,
            alpha: 1,
            duration: 200,
            ease: 'Power2',
        });

        // After a brief pause, transition to next task
        this.scene.time.delayedCall(800, () => {
            this.currentTaskIndex++;
            this._taskCompleting = false;

            if (this.currentTaskIndex >= this.tasks.length) {
                this._hidePanel();
                return;
            }

            // Snapshot baseline for the new task
            this._snapshotBaseline();

            // Reset visuals
            this.taskText.setColor('#ffffff');
            this.progressText.setAlpha(1);
            this.barBg.setAlpha(1);
            this.barFill.setAlpha(1);
            this.checkText.setAlpha(0);

            // Slide transition
            this.container.setAlpha(0.5);
            this.scene.tweens.add({
                targets: this.container,
                alpha: 1,
                duration: 300,
                ease: 'Power2',
            });

            this._updateTaskDisplay();
        });
    }

    // ─── Game Logic ──────────────────────────────────────────

    /**
     * Check if tutorial conditions are met. Call every frame.
     */
    update() {
        // Phase logic (shop reveal)
        if (this.phase === 'WAITING_FOR_MONEY') {
            if (this.economy.getMoney() >= this.firstPurchaseCost) {
                this.revealShop();
            }
        }

        // Task progress check
        if (this.currentTaskIndex < this.tasks.length && !this._taskCompleting) {
            const relativeProgress = this._getRelativeProgress();
            const task = this.tasks[this.currentTaskIndex];

            if (relativeProgress >= task.target) {
                this._completeCurrentTask();
            } else {
                this._updateTaskDisplay();
            }
        }
    }

    /**
     * Trigger the shop slide-in animation.
     * @private
     */
    revealShop() {
        this.phase = 'SHOP_VISIBLE';
        if (this.onShopReveal) this.onShopReveal();
        this.shop.slideIn(500);
    }

    /**
     * Notify tutorial that a generator was purchased.
     */
    onPurchaseMade() {
        if (this.phase === 'SHOP_VISIBLE') {
            this.phase = 'COMPLETE';
            this.shop.revealAllItems();
        }
    }

    /**
     * Notify tutorial that an upgrade was purchased.
     */
    onUpgradePurchased() {
        this.upgradesPurchased++;
    }

    /**
     * Whether the shop should currently be hidden for layout purposes.
     * @returns {boolean}
     */
    isShopHidden() {
        return this.phase === 'WAITING_FOR_MONEY';
    }

    /**
     * Whether the tutorial is fully complete.
     * @returns {boolean}
     */
    isComplete() {
        return this.phase === 'COMPLETE' && this.currentTaskIndex >= this.tasks.length;
    }

    /**
     * Handle screen resize — reposition the task panel.
     * @param {number} width - New viewport width
     */
    onResize(width) {
        if (this.container) {
            this.container.x = width / 2;
        }
    }

    /**
     * Clean up all UI elements.
     */
    destroy() {
        if (this.container) {
            this.container.destroy();
            this.container = null;
        }
    }
}

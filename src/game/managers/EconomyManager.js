/**
 * Economy Manager
 * Manages currency state, money display UI, and floating money text effects.
 *
 * The money counter UI stays in screen space. Floating money text is added
 * to the gameplay container (since it spawns at bubble positions in gameplay
 * coordinates).
 *
 * @example
 * const economy = new EconomyManager(scene, gameplayContainer);
 * economy.createUI(width);
 * economy.addMoney(50);
 * economy.showFloatingMoney(100, 200, 50, false);
 */
export default class EconomyManager {
    /**
     * @param {Phaser.Scene} scene - The parent Phaser scene
     * @param {Phaser.GameObjects.Container} gameplayContainer - Container for gameplay objects
     */
    constructor(scene, gameplayContainer) {
        this.scene = scene;
        this.gameplayContainer = gameplayContainer;

        /** @type {number} Current money balance */
        this.money = 0;

        /** @type {number} Total money earned over the game session */
        this.totalEarned = 0;

        /** @type {number} Total bubbles popped this session */
        this.bubblesPopped = 0;

        /** @private */
        this.moneyText = null;
        /** @private */
        this.moneyLabel = null;
    }

    /**
     * Create the money display UI elements (screen space).
     * @param {number} width - Current viewport width
     */
    createUI(width) {
        this.moneyText = this.scene.add.text(20, 20, '$0', {
            fontFamily: 'Arial Black',
            fontSize: '42px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4,
            align: 'left'
        }).setOrigin(0, 0).setDepth(100);

        this.moneyLabel = this.scene.add.text(20, 65, 'Bubble Bucks', {
            fontFamily: 'Arial',
            fontSize: '16px',
            color: '#aaaaaa',
            align: 'left'
        }).setOrigin(0, 0).setDepth(100);
    }

    /**
     * Add money to the player's balance.
     * @param {number} amount - Amount to add
     */
    addMoney(amount) {
        this.money += amount;
        this.totalEarned += amount;
        this.updateDisplay();
    }

    /**
     * Attempt to spend money. Returns false if insufficient funds.
     * @param {number} amount - Amount to spend
     * @returns {boolean} Whether the purchase succeeded
     */
    spendMoney(amount) {
        if (this.money < amount) return false;
        this.money -= amount;
        this.updateDisplay();
        return true;
    }

    /**
     * Check if the player can afford a given cost.
     * @param {number} amount - Cost to check
     * @returns {boolean}
     */
    canAfford(amount) {
        return this.money >= amount;
    }

    /**
     * @returns {number} Current money balance
     */
    getMoney() {
        return this.money;
    }

    /**
     * Refresh the on-screen money counter text.
     */
    updateDisplay() {
        if (this.moneyText) {
            this.moneyText.setText(`$${this.formatNumber(this.money)}`);
        }
    }

    /**
     * Show an animated floating money label at the given position.
     * Coordinates are in gameplay space (added to gameplay container).
     * @param {number} x - Gameplay X position
     * @param {number} y - Gameplay Y position
     * @param {number} value - Money value to display
     * @param {boolean} [isLucky=false] - Whether this was a lucky (golden) pop
     */
    showFloatingMoney(x, y, value, isLucky = false) {
        const label = isLucky ? `+$${value} x2!` : `+$${value}`;
        const text = this.scene.add.text(x, y, label, {
            fontFamily: 'Arial Black',
            fontSize: isLucky ? '26px' : '22px',
            color: isLucky ? '#ffd700' : '#ffffff',
            stroke: '#000000',
            strokeThickness: 2,
            align: 'center'
        }).setOrigin(0.5).setDepth(200);

        if (this.gameplayContainer) {
            this.gameplayContainer.add(text);
        }

        this.scene.tweens.add({
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

    /**
     * Reposition UI elements on window resize.
     * @param {number} width - New viewport width
     */
    onResize(width) {
        if (this.moneyText) this.moneyText.setPosition(20, 20);
        if (this.moneyLabel) this.moneyLabel.setPosition(20, 65);
    }

    /**
     * Format a number with K/M/B suffixes for display.
     * @param {number} num - Number to format
     * @returns {string} Formatted string
     */
    formatNumber(num) {
        if (num >= 1000000000) return (num / 1000000000).toFixed(1) + 'B';
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 10000) return (num / 1000).toFixed(1) + 'K';
        return Math.floor(num).toLocaleString();
    }

    /**
     * Clean up all UI elements.
     */
    destroy() {
        if (this.moneyText) { this.moneyText.destroy(); this.moneyText = null; }
        if (this.moneyLabel) { this.moneyLabel.destroy(); this.moneyLabel = null; }
    }
}

import { Scene } from 'phaser';
import ResponsiveManager from '../../managers/ResponsiveManager.js';
import Button from '../../ui/components/Button.js';

/**
 * UITestBase
 * Abstract base class for UI test scenes with navigation
 */
export class UITestBase extends Scene {
    // Scene keys for navigation
    static TEST_SCENES = [
        'UITestButtons',
        'UITestPanels',
        'UITestProgressBars',
        'UITestTextStyles',
        'UITestButtonVariations',
        'UITestPanelVariations',
        'UITestProgressBarVariations',
        'UITestComponentCombinations',
        'UITestContainers',
        'UITestContainerAlignments'
    ];

    // All 9 alignment positions
    static ALIGNMENTS = [
        'top-left', 'top-center', 'top-right',
        'center-left', 'center', 'center-right',
        'bottom-left', 'bottom-center', 'bottom-right'
    ];

    // Margin configurations
    static MARGINS = {
        WITH_OFFSET: { x: 50, y: 50 },
        WITHOUT_OFFSET: { x: 0, y: 0 }
    };

    constructor(key) {
        super(key);
        this.sceneKey = key;
        this.sceneTitle = 'UI Test';
        this.testElements = [];
    }

    create() {
        // Initialize responsive manager
        ResponsiveManager.init(this);

        // Create navigation UI
        this.createNavigation();

        // Setup keyboard navigation
        this.setupKeyboardNav();

        // Create test elements (implemented by subclasses)
        this.createTestElements();

        // Setup resize listener
        this.scale.on('resize', this.onResize, this);
    }

    /**
     * Create navigation buttons and title
     */
    createNavigation() {
        const { width, height } = this.scale;

        // Navigation bar background
        this.navBg = this.add.rectangle(width / 2, height - 40, width, 80, 0x1a1a2e, 0.9);

        // Previous button
        this.prevButton = new Button(this, 0, 0, '< Prev', {
            width: 120,
            height: 50,
            backgroundColor: 0x4a90e2,
            hoverColor: 0x5aa0f2,
            pressedColor: 0x3a80d2,
            fontSize: '20px',
            alignment: 'bottom-left',
            margin: { x: 20, y: 15 }
        });
        this.prevButton.onClick(() => this.previousScene());

        // Next button
        this.nextButton = new Button(this, 0, 0, 'Next >', {
            width: 120,
            height: 50,
            backgroundColor: 0x4a90e2,
            hoverColor: 0x5aa0f2,
            pressedColor: 0x3a80d2,
            fontSize: '20px',
            alignment: 'bottom-right',
            margin: { x: 20, y: 15 }
        });
        this.nextButton.onClick(() => this.nextScene());

        // Scene title
        this.titleText = this.add.text(width / 2, height - 40, this.sceneTitle, {
            fontFamily: 'Arial',
            fontSize: '24px',
            color: '#ffffff'
        }).setOrigin(0.5);

        // Scene counter
        const currentIndex = UITestBase.TEST_SCENES.indexOf(this.sceneKey) + 1;
        const total = UITestBase.TEST_SCENES.length;
        this.counterText = this.add.text(width / 2, height - 15, `${currentIndex} / ${total}`, {
            fontFamily: 'Arial',
            fontSize: '14px',
            color: '#888888'
        }).setOrigin(0.5);

        // Back to menu button
        this.menuButton = new Button(this, 0, 0, 'Menu', {
            width: 80,
            height: 40,
            backgroundColor: 0x666666,
            hoverColor: 0x777777,
            pressedColor: 0x555555,
            fontSize: '16px',
            alignment: 'top-left',
            margin: { x: 10, y: 10 }
        });
        this.menuButton.onClick(() => this.scene.start('MainMenu'));
    }

    /**
     * Setup keyboard navigation
     */
    setupKeyboardNav() {
        this.input.keyboard.on('keydown-LEFT', () => this.previousScene());
        this.input.keyboard.on('keydown-RIGHT', () => this.nextScene());

        // Number keys for direct navigation
        this.input.keyboard.on('keydown-ONE', () => this.goToScene(0));
        this.input.keyboard.on('keydown-TWO', () => this.goToScene(1));
        this.input.keyboard.on('keydown-THREE', () => this.goToScene(2));
        this.input.keyboard.on('keydown-FOUR', () => this.goToScene(3));
        this.input.keyboard.on('keydown-FIVE', () => this.goToScene(4));
        this.input.keyboard.on('keydown-SIX', () => this.goToScene(5));
        this.input.keyboard.on('keydown-SEVEN', () => this.goToScene(6));
        this.input.keyboard.on('keydown-EIGHT', () => this.goToScene(7));
        this.input.keyboard.on('keydown-NINE', () => this.goToScene(8));
    }

    /**
     * Navigate to next scene
     */
    nextScene() {
        const currentIndex = UITestBase.TEST_SCENES.indexOf(this.sceneKey);
        const nextIndex = (currentIndex + 1) % UITestBase.TEST_SCENES.length;
        this.scene.start(UITestBase.TEST_SCENES[nextIndex]);
    }

    /**
     * Navigate to previous scene
     */
    previousScene() {
        const currentIndex = UITestBase.TEST_SCENES.indexOf(this.sceneKey);
        const prevIndex = (currentIndex - 1 + UITestBase.TEST_SCENES.length) % UITestBase.TEST_SCENES.length;
        this.scene.start(UITestBase.TEST_SCENES[prevIndex]);
    }

    /**
     * Navigate to scene by index
     */
    goToScene(index) {
        if (index >= 0 && index < UITestBase.TEST_SCENES.length) {
            this.scene.start(UITestBase.TEST_SCENES[index]);
        }
    }

    /**
     * Get margin for alignment position
     * @param {string} alignment - Alignment key
     * @param {boolean} hasOffset - Whether to apply offset
     * @returns {object} Margin object { x, y }
     */
    getMarginForAlignment(alignment, hasOffset) {
        if (!hasOffset) {
            return { x: 0, y: 0 };
        }

        // For center alignments (vertically or horizontally), adjust margins
        const margin = { x: 50, y: 50 };

        // Horizontal center alignments only need vertical margin
        if (alignment === 'top-center' || alignment === 'bottom-center') {
            margin.x = 0;
        }
        // Vertical center alignments only need horizontal margin
        if (alignment === 'center-left' || alignment === 'center-right') {
            margin.y = 0;
        }
        // Pure center has no margin
        if (alignment === 'center') {
            margin.x = 0;
            margin.y = 0;
        }

        return margin;
    }

    /**
     * Format margin for display
     */
    formatMargin(margin) {
        return `m: {${margin.x}, ${margin.y}}`;
    }

    /**
     * Handle resize
     */
    onResize(gameSize) {
        const { width, height } = gameSize;

        // Update nav background (check both existence and destroyed state)
        if (this.navBg && !this.navBg.scene) return; // Scene is shutting down

        if (this.navBg && this.navBg.active !== false) {
            this.navBg.setPosition(width / 2, height - 40);
            this.navBg.setSize(width, 80);
        }

        // Update title position
        if (this.titleText && this.titleText.active !== false) {
            this.titleText.setPosition(width / 2, height - 40);
        }

        // Update counter position
        if (this.counterText && this.counterText.active !== false) {
            this.counterText.setPosition(width / 2, height - 15);
        }
    }

    /**
     * Abstract method - must be implemented by subclasses
     */
    createTestElements() {
        throw new Error('createTestElements must be implemented by subclass');
    }

    /**
     * Cleanup
     */
    shutdown() {
        this.scale.off('resize', this.onResize, this);
        this.input.keyboard.off('keydown-LEFT');
        this.input.keyboard.off('keydown-RIGHT');
        this.input.keyboard.off('keydown-ONE');
        this.input.keyboard.off('keydown-TWO');
        this.input.keyboard.off('keydown-THREE');
        this.input.keyboard.off('keydown-FOUR');
        this.input.keyboard.off('keydown-FIVE');
        this.input.keyboard.off('keydown-SIX');
        this.input.keyboard.off('keydown-SEVEN');
        this.input.keyboard.off('keydown-EIGHT');
        this.input.keyboard.off('keydown-NINE');
    }
}

export default UITestBase;

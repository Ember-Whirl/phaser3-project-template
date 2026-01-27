import { UITestBase } from './UITestBase.js';
import ProgressBar from '../../ui/components/ProgressBar.js';

/**
 * UITestProgressBarVariations
 * Test scene for ProgressBar component with different sizes, colors, and animations
 */
export class UITestProgressBarVariations extends UITestBase {
    constructor() {
        super('UITestProgressBarVariations');
        this.sceneTitle = 'ProgressBar Variations Test';
    }

    createTestElements() {
        this.testElements = [];
        const { width, height } = this.scale;
        const centerX = width / 2;
        const startY = 80;
        const spacing = 100;

        // Test 1: Different sizes
        this.add.text(centerX, startY, 'Size Variations', {
            fontFamily: 'Arial',
            fontSize: '20px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);

        const sizes = [
            { width: 150, height: 15, label: 'Small' },
            { width: 200, height: 20, label: 'Medium' },
            { width: 300, height: 30, label: 'Large' },
            { width: 400, height: 40, label: 'X-Large' }
        ];

        sizes.forEach((size, index) => {
            const y = startY + 40 + (index * 50);
            const bar = new ProgressBar(this, centerX, y, {
                width: size.width,
                height: size.height,
                showLabel: true,
                labelFormat: 'percent'
            });
            bar.setValue(0.3 + (index * 0.2), true);

            const label = this.add.text(centerX - size.width / 2 - 10, y, size.label, {
                fontFamily: 'Arial',
                fontSize: '14px',
                color: '#aaaaaa'
            }).setOrigin(1, 0.5);

            this.testElements.push(bar);
        });

        // Test 2: Different color schemes
        this.add.text(centerX, startY + spacing * 2.5, 'Color Variations', {
            fontFamily: 'Arial',
            fontSize: '20px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);

        const colorSchemes = [
            { high: 0x00ff00, medium: 0xff8800, low: 0xff0000, label: 'Health' },
            { high: 0x00ffff, medium: 0x0088ff, low: 0x0000ff, label: 'Mana' },
            { high: 0xffff00, medium: 0xff8800, low: 0xff0000, label: 'Energy' },
            { high: 0xff00ff, medium: 0x8800ff, low: 0x0000ff, label: 'Custom' }
        ];

        colorSchemes.forEach((scheme, index) => {
            const y = startY + spacing * 2.5 + 40 + (index * 50);
            const bar = new ProgressBar(this, centerX, y, {
                width: 300,
                height: 25,
                tintHigh: scheme.high,
                tintMedium: scheme.medium,
                tintLow: scheme.low,
                showLabel: true,
                labelFormat: 'percent'
            });
            // Set different values to show all color states
            const values = [0.1, 0.35, 0.6, 0.85];
            bar.setValue(values[index], true);

            const label = this.add.text(centerX - 160, y, scheme.label, {
                fontFamily: 'Arial',
                fontSize: '14px',
                color: '#aaaaaa'
            }).setOrigin(1, 0.5);

            this.testElements.push(bar);
        });

        // Test 3: Animated vs Immediate
        this.add.text(centerX, startY + spacing * 4.5, 'Animation Variations', {
            fontFamily: 'Arial',
            fontSize: '20px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);

        const animatedBar = new ProgressBar(this, centerX - 150, startY + spacing * 4.5 + 40, {
            width: 250,
            height: 25,
            animated: true,
            animDuration: 500,
            showLabel: true,
            labelFormat: 'percent'
        });
        animatedBar.setValue(0.5, true);

        const immediateBar = new ProgressBar(this, centerX + 150, startY + spacing * 4.5 + 40, {
            width: 250,
            height: 25,
            animated: false,
            showLabel: true,
            labelFormat: 'percent'
        });
        immediateBar.setValue(0.5, true);

        this.add.text(centerX - 150, startY + spacing * 4.5 + 70, 'Animated', {
            fontFamily: 'Arial',
            fontSize: '12px',
            color: '#aaaaaa'
        }).setOrigin(0.5);

        this.add.text(centerX + 150, startY + spacing * 4.5 + 70, 'Immediate', {
            fontFamily: 'Arial',
            fontSize: '12px',
            color: '#aaaaaa'
        }).setOrigin(0.5);

        // Make bars interactive to test animation
        animatedBar.setSize(250, 25);
        animatedBar.setInteractive({ useHandCursor: true });
        animatedBar.on('pointerdown', () => {
            const newValue = animatedBar.getValue() >= 1.0 ? 0.1 : animatedBar.getValue() + 0.1;
            animatedBar.setValue(newValue);
        });

        immediateBar.setSize(250, 25);
        immediateBar.setInteractive({ useHandCursor: true });
        immediateBar.on('pointerdown', () => {
            const newValue = immediateBar.getValue() >= 1.0 ? 0.1 : immediateBar.getValue() + 0.1;
            immediateBar.setValue(newValue, true); // Immediate update
        });

        this.testElements.push(animatedBar, immediateBar);

        // Test 4: Label format variations
        this.add.text(centerX, startY + spacing * 6, 'Label Format Variations', {
            fontFamily: 'Arial',
            fontSize: '20px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);

        const percentBar = new ProgressBar(this, centerX - 150, startY + spacing * 6 + 40, {
            width: 250,
            height: 25,
            showLabel: true,
            labelFormat: 'percent'
        });
        percentBar.setValue(0.65, true);

        const fractionBar = new ProgressBar(this, centerX + 150, startY + spacing * 6 + 40, {
            width: 250,
            height: 25,
            showLabel: true,
            labelFormat: 'fraction'
        });
        fractionBar.setValue(0.65, true);

        const noLabelBar = new ProgressBar(this, centerX, startY + spacing * 6 + 80, {
            width: 250,
            height: 25,
            showLabel: false
        });
        noLabelBar.setValue(0.65, true);

        this.add.text(centerX - 150, startY + spacing * 6 + 70, 'Percent', {
            fontFamily: 'Arial',
            fontSize: '12px',
            color: '#aaaaaa'
        }).setOrigin(0.5);

        this.add.text(centerX + 150, startY + spacing * 6 + 70, 'Fraction', {
            fontFamily: 'Arial',
            fontSize: '12px',
            color: '#aaaaaa'
        }).setOrigin(0.5);

        this.add.text(centerX, startY + spacing * 6 + 110, 'No Label', {
            fontFamily: 'Arial',
            fontSize: '12px',
            color: '#aaaaaa'
        }).setOrigin(0.5);

        this.testElements.push(percentBar, fractionBar, noLabelBar);

        // Test 5: Different frame styles
        this.add.text(centerX, startY + spacing * 7.5, 'Frame Style Variations', {
            fontFamily: 'Arial',
            fontSize: '20px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);

        const frames = [
            { bg: 'slide_horizontal_grey.png', fill: 'slide_horizontal_color.png', label: 'Default' },
            { bg: 'input_rectangle.png', fill: 'button_rectangle_flat.png', label: 'Custom' }
        ];

        frames.forEach((frameData, index) => {
            const y = startY + spacing * 7.5 + 40 + (index * 50);
            const bar = new ProgressBar(this, centerX, y, {
                width: 300,
                height: 25,
                backgroundFrame: frameData.bg,
                fillFrame: frameData.fill,
                showLabel: true,
                labelFormat: 'percent'
            });
            bar.setValue(0.6, true);

            const label = this.add.text(centerX - 160, y, frameData.label, {
                fontFamily: 'Arial',
                fontSize: '14px',
                color: '#aaaaaa'
            }).setOrigin(1, 0.5);

            this.testElements.push(bar);
        });

        // Test 6: Auto-updating bars (simulated)
        this.add.text(centerX, startY + spacing * 9, 'Auto-Updating Bars', {
            fontFamily: 'Arial',
            fontSize: '20px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);

        const autoBar1 = new ProgressBar(this, centerX - 150, startY + spacing * 9 + 40, {
            width: 250,
            height: 25,
            showLabel: true,
            labelFormat: 'percent'
        });
        autoBar1.setValue(0.3, true);

        const autoBar2 = new ProgressBar(this, centerX + 150, startY + spacing * 9 + 40, {
            width: 250,
            height: 25,
            showLabel: true,
            labelFormat: 'percent'
        });
        autoBar2.setValue(0.7, true);

        // Auto-update bars every 2 seconds
        this.time.addEvent({
            delay: 2000,
            callback: () => {
                if (this.scene.isActive()) {
                    const newValue1 = Phaser.Math.FloatBetween(0.1, 1.0);
                    const newValue2 = Phaser.Math.FloatBetween(0.1, 1.0);
                    autoBar1.setValue(newValue1);
                    autoBar2.setValue(newValue2);
                }
            },
            loop: true
        });

        this.add.text(centerX - 150, startY + spacing * 9 + 70, 'Auto 1', {
            fontFamily: 'Arial',
            fontSize: '12px',
            color: '#aaaaaa'
        }).setOrigin(0.5);

        this.add.text(centerX + 150, startY + spacing * 9 + 70, 'Auto 2', {
            fontFamily: 'Arial',
            fontSize: '12px',
            color: '#aaaaaa'
        }).setOrigin(0.5);

        this.testElements.push(autoBar1, autoBar2);
    }
}

export default UITestProgressBarVariations;

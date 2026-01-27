import { UITestBase } from './UITestBase.js';
import Button from '../../ui/components/Button.js';

/**
 * UITestButtonVariations
 * Test scene for Button component with different sizes, colors, and styles
 */
export class UITestButtonVariations extends UITestBase {
    constructor() {
        super('UITestButtonVariations');
        this.sceneTitle = 'Button Variations Test';
    }

    createTestElements() {
        this.testElements = [];
        const { width, height } = this.scale;
        const centerX = width / 2;
        const startY = 80;
        const spacing = 80;

        // Test 1: Different sizes
        this.add.text(centerX, startY, 'Size Variations', {
            fontFamily: 'Arial',
            fontSize: '20px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);

        const sizes = [
            { width: 100, height: 40, label: 'Small' },
            { width: 200, height: 60, label: 'Medium' },
            { width: 300, height: 80, label: 'Large' },
            { width: 400, height: 100, label: 'X-Large' }
        ];

        sizes.forEach((size, index) => {
            const button = new Button(this, centerX - 200 + (index * 150), startY + 40, size.label, {
                width: size.width,
                height: size.height,
                fontSize: `${Math.max(14, size.height * 0.3)}px`
            });
            this.testElements.push(button);
        });

        // Test 2: Different colors/tints
        this.add.text(centerX, startY + spacing * 1.5, 'Color Variations', {
            fontFamily: 'Arial',
            fontSize: '20px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);

        const colors = [
            { tint: 0x4a90e2, label: 'Blue' },
            { tint: 0x50c878, label: 'Green' },
            { tint: 0xe74c3c, label: 'Red' },
            { tint: 0xf1c40f, label: 'Yellow' },
            { tint: 0x9b59b6, label: 'Purple' }
        ];

        colors.forEach((color, index) => {
            // Create color object for manipulation
            const colorObj = new Phaser.Display.Color(color.tint);
            const hoverColor = Phaser.Display.Color.GetColor(
                Math.min(255, colorObj.r + 30),
                Math.min(255, colorObj.g + 30),
                Math.min(255, colorObj.b + 30)
            );
            const pressedColor = Phaser.Display.Color.GetColor(
                Math.max(0, colorObj.r - 30),
                Math.max(0, colorObj.g - 30),
                Math.max(0, colorObj.b - 30)
            );

            const button = new Button(this, centerX - 200 + (index * 120), startY + spacing * 1.5 + 40, color.label, {
                width: 150,
                height: 50,
                tintNormal: color.tint,
                tintHover: hoverColor,
                tintPressed: pressedColor
            });
            this.testElements.push(button);
        });

        // Test 3: Different button frames/styles
        this.add.text(centerX, startY + spacing * 3, 'Style Variations', {
            fontFamily: 'Arial',
            fontSize: '20px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);

        const styles = [
            { frame: 'button_square_flat.png', label: 'Square' },
            { frame: 'button_rectangle_flat.png', label: 'Rectangle' },
            { frame: 'button_rectangle_gradient.png', label: 'Gradient' },
            { frame: 'button_round_flat.png', label: 'Round' }
        ];

        styles.forEach((style, index) => {
            const button = new Button(this, centerX - 150 + (index * 140), startY + spacing * 3 + 40, style.label, {
                width: 140,
                height: 60,
                frame: style.frame
            });
            this.testElements.push(button);
        });

        // Test 4: Different font sizes
        this.add.text(centerX, startY + spacing * 4.5, 'Font Size Variations', {
            fontFamily: 'Arial',
            fontSize: '20px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);

        const fontSizes = ['14px', '18px', '24px', '32px', '40px'];

        fontSizes.forEach((fontSize, index) => {
            const button = new Button(this, centerX - 200 + (index * 120), startY + spacing * 4.5 + 40, fontSize, {
                width: 120,
                height: 50,
                fontSize: fontSize
            });
            this.testElements.push(button);
        });

        // Test 5: Enabled/Disabled states
        this.add.text(centerX, startY + spacing * 6, 'State Variations', {
            fontFamily: 'Arial',
            fontSize: '20px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);

        const enabledButton = new Button(this, centerX - 100, startY + spacing * 6 + 40, 'Enabled', {
            width: 150,
            height: 50
        });
        enabledButton.onClick(() => {
            enabledButton.setText('Clicked!');
            this.time.delayedCall(1000, () => {
                enabledButton.setText('Enabled');
            });
        });

        const disabledButton = new Button(this, centerX + 100, startY + spacing * 6 + 40, 'Disabled', {
            width: 150,
            height: 50
        });
        disabledButton.disable();

        this.testElements.push(enabledButton, disabledButton);

        // Test 6: Long text buttons
        this.add.text(centerX, startY + spacing * 7.5, 'Text Length Variations', {
            fontFamily: 'Arial',
            fontSize: '20px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);

        const textVariations = [
            'Short',
            'Medium Length Text',
            'Very Long Button Text That Wraps',
            'OK'
        ];

        textVariations.forEach((text, index) => {
            const button = new Button(this, centerX - 200 + (index * 180), startY + spacing * 7.5 + 40, text, {
                width: 160,
                height: 50,
                fontSize: '16px'
            });
            this.testElements.push(button);
        });
    }
}

export default UITestButtonVariations;

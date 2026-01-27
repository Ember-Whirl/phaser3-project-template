import { UITestBase } from './UITestBase.js';
import Panel from '../../ui/components/Panel.js';
import Button from '../../ui/components/Button.js';

/**
 * UITestPanelVariations
 * Test scene for Panel component with different sizes, padding, and configurations
 */
export class UITestPanelVariations extends UITestBase {
    constructor() {
        super('UITestPanelVariations');
        this.sceneTitle = 'Panel Variations Test';
    }

    createTestElements() {
        this.testElements = [];
        const { width, height } = this.scale;
        const centerX = width / 2;
        const startY = 80;
        const spacing = 200;

        // Test 1: Different sizes
        this.add.text(centerX, startY, 'Size Variations', {
            fontFamily: 'Arial',
            fontSize: '20px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);

        const sizes = [
            { width: 150, height: 100, label: 'Small' },
            { width: 250, height: 150, label: 'Medium' },
            { width: 350, height: 200, label: 'Large' }
        ];

        sizes.forEach((size, index) => {
            const panel = new Panel(this, centerX - 250 + (index * 250), startY + 80, {
                width: size.width,
                height: size.height,
                title: size.label,
                padding: 15
            });

            const contentText = this.add.text(0, 0, `${size.width}x${size.height}`, {
                fontFamily: 'Arial',
                fontSize: '14px',
                color: '#aaaaaa'
            }).setOrigin(0.5);
            panel.addContent(contentText);

            this.testElements.push(panel);
        });

        // Test 2: Different padding values
        this.add.text(centerX, startY + spacing, 'Padding Variations', {
            fontFamily: 'Arial',
            fontSize: '20px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);

        const paddings = [5, 15, 30, 50];

        paddings.forEach((padding, index) => {
            const panel = new Panel(this, centerX - 300 + (index * 200), startY + spacing + 80, {
                width: 180,
                height: 120,
                padding: padding,
                title: `Pad: ${padding}px`
            });

            const contentText = this.add.text(0, 0, `Padding\n${padding}px`, {
                fontFamily: 'Arial',
                fontSize: '12px',
                color: '#aaaaaa',
                align: 'center'
            }).setOrigin(0.5);
            panel.addContent(contentText);

            this.testElements.push(panel);
        });

        // Test 3: Different tints/colors
        this.add.text(centerX, startY + spacing * 2, 'Color Variations', {
            fontFamily: 'Arial',
            fontSize: '20px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);

        const tints = [
            { tint: 0x4a90e2, label: 'Blue' },
            { tint: 0x50c878, label: 'Green' },
            { tint: 0xe74c3c, label: 'Red' },
            { tint: 0xf1c40f, label: 'Yellow' }
        ];

        tints.forEach((color, index) => {
            const panel = new Panel(this, centerX - 300 + (index * 200), startY + spacing * 2 + 80, {
                width: 180,
                height: 120,
                tint: color.tint,
                title: color.label,
                padding: 15
            });

            const contentText = this.add.text(0, 0, 'Colored\nPanel', {
                fontFamily: 'Arial',
                fontSize: '14px',
                color: '#ffffff',
                align: 'center'
            }).setOrigin(0.5);
            panel.addContent(contentText);

            this.testElements.push(panel);
        });

        // Test 4: Panels with different frame styles
        this.add.text(centerX, startY + spacing * 3, 'Frame Style Variations', {
            fontFamily: 'Arial',
            fontSize: '20px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);

        const frames = [
            { frame: 'input_rectangle.png', label: 'Input' },
            { frame: 'button_rectangle_flat.png', label: 'Button' },
            { frame: 'panel_beige.png', label: 'Beige' }
        ];

        frames.forEach((frameData, index) => {
            const panel = new Panel(this, centerX - 200 + (index * 250), startY + spacing * 3 + 80, {
                width: 200,
                height: 140,
                frame: frameData.frame,
                title: frameData.label,
                padding: 15
            });

            const contentText = this.add.text(0, 0, 'Frame\nStyle', {
                fontFamily: 'Arial',
                fontSize: '14px',
                color: '#aaaaaa',
                align: 'center'
            }).setOrigin(0.5);
            panel.addContent(contentText);

            this.testElements.push(panel);
        });

        // Test 5: Panels with content (buttons inside)
        this.add.text(centerX, startY + spacing * 4, 'Panels with Content', {
            fontFamily: 'Arial',
            fontSize: '20px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);

        const contentPanel = new Panel(this, centerX, startY + spacing * 4 + 100, {
            width: 300,
            height: 200,
            title: 'Interactive Panel',
            padding: 20
        });

        const button1 = new Button(this, 0, -30, 'Button 1', {
            width: 120,
            height: 40,
            fontSize: '16px'
        });
        button1.onClick(() => {
            button1.setText('Clicked!');
            this.time.delayedCall(1000, () => {
                button1.setText('Button 1');
            });
        });

        const button2 = new Button(this, 0, 20, 'Button 2', {
            width: 120,
            height: 40,
            fontSize: '16px'
        });
        button2.onClick(() => {
            button2.setText('Clicked!');
            this.time.delayedCall(1000, () => {
                button2.setText('Button 2');
            });
        });

        contentPanel.addContent(button1);
        contentPanel.addContent(button2);

        this.testElements.push(contentPanel);

        // Test 6: Title size variations
        this.add.text(centerX, startY + spacing * 5, 'Title Size Variations', {
            fontFamily: 'Arial',
            fontSize: '20px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);

        const titleSizes = ['16px', '20px', '24px', '32px'];

        titleSizes.forEach((titleSize, index) => {
            const panel = new Panel(this, centerX - 300 + (index * 200), startY + spacing * 5 + 80, {
                width: 180,
                height: 120,
                title: `Title ${titleSize}`,
                titleSize: titleSize,
                padding: 15
            });

            const contentText = this.add.text(0, 20, 'Content', {
                fontFamily: 'Arial',
                fontSize: '12px',
                color: '#aaaaaa'
            }).setOrigin(0.5);
            panel.addContent(contentText);

            this.testElements.push(panel);
        });
    }
}

export default UITestPanelVariations;

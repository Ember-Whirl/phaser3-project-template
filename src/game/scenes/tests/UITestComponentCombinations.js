import { UITestBase } from './UITestBase.js';
import Panel from '../../ui/components/Panel.js';
import Button from '../../ui/components/Button.js';
import ProgressBar from '../../ui/components/ProgressBar.js';

/**
 * UITestComponentCombinations
 * Test scene for combinations of UI components together
 */
export class UITestComponentCombinations extends UITestBase {
    constructor() {
        super('UITestComponentCombinations');
        this.sceneTitle = 'Component Combinations Test';
    }

    createTestElements() {
        this.testElements = [];
        const { width, height } = this.scale;
        const centerX = width / 2;
        const startY = 80;
        const spacing = 250;

        // Test 1: Panel with buttons
        this.add.text(centerX, startY, 'Panel with Buttons', {
            fontFamily: 'Arial',
            fontSize: '20px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);

        const buttonPanel = new Panel(this, centerX, startY + 80, {
            width: 400,
            height: 200,
            title: 'Button Panel',
            padding: 20
        });

        const btn1 = new Button(this, 0, -40, 'Button 1', {
            width: 150,
            height: 45,
            fontSize: '18px'
        });
        btn1.onClick(() => {
            btn1.setText('Clicked!');
            this.time.delayedCall(1000, () => btn1.setText('Button 1'));
        });

        const btn2 = new Button(this, 0, 10, 'Button 2', {
            width: 150,
            height: 45,
            fontSize: '18px'
        });
        btn2.onClick(() => {
            btn2.setText('Clicked!');
            this.time.delayedCall(1000, () => btn2.setText('Button 2'));
        });

        const btn3 = new Button(this, 0, 60, 'Button 3', {
            width: 150,
            height: 45,
            fontSize: '18px'
        });
        btn3.onClick(() => {
            btn3.setText('Clicked!');
            this.time.delayedCall(1000, () => btn3.setText('Button 3'));
        });

        buttonPanel.addContent(btn1);
        buttonPanel.addContent(btn2);
        buttonPanel.addContent(btn3);

        this.testElements.push(buttonPanel);

        // Test 2: Panel with progress bars
        this.add.text(centerX, startY + spacing, 'Panel with Progress Bars', {
            fontFamily: 'Arial',
            fontSize: '20px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);

        const progressPanel = new Panel(this, centerX, startY + spacing + 100, {
            width: 400,
            height: 250,
            title: 'Stats Panel',
            padding: 20
        });

        const healthBar = new ProgressBar(this, 0, -60, {
            width: 320,
            height: 25,
            tintHigh: 0x00ff00,
            tintMedium: 0xff8800,
            tintLow: 0xff0000,
            showLabel: true,
            labelFormat: 'percent'
        });
        healthBar.setValue(0.75, true);

        const manaBar = new ProgressBar(this, 0, -20, {
            width: 320,
            height: 25,
            tintHigh: 0x00ffff,
            tintMedium: 0x0088ff,
            tintLow: 0x0000ff,
            showLabel: true,
            labelFormat: 'percent'
        });
        manaBar.setValue(0.45, true);

        const expBar = new ProgressBar(this, 0, 20, {
            width: 320,
            height: 25,
            tintHigh: 0xffff00,
            tintMedium: 0xff8800,
            tintLow: 0xff0000,
            showLabel: true,
            labelFormat: 'percent'
        });
        expBar.setValue(0.6, true);

        const staminaBar = new ProgressBar(this, 0, 60, {
            width: 320,
            height: 25,
            tintHigh: 0x00ff00,
            tintMedium: 0xffff00,
            tintLow: 0xff0000,
            showLabel: true,
            labelFormat: 'percent'
        });
        staminaBar.setValue(0.9, true);

        const healthLabel = this.add.text(-160, -60, 'Health:', {
            fontFamily: 'Arial',
            fontSize: '14px',
            color: '#ffffff'
        }).setOrigin(0, 0.5);

        const manaLabel = this.add.text(-160, -20, 'Mana:', {
            fontFamily: 'Arial',
            fontSize: '14px',
            color: '#ffffff'
        }).setOrigin(0, 0.5);

        const expLabel = this.add.text(-160, 20, 'Exp:', {
            fontFamily: 'Arial',
            fontSize: '14px',
            color: '#ffffff'
        }).setOrigin(0, 0.5);

        const staminaLabel = this.add.text(-160, 60, 'Stamina:', {
            fontFamily: 'Arial',
            fontSize: '14px',
            color: '#ffffff'
        }).setOrigin(0, 0.5);

        progressPanel.addContent(healthLabel);
        progressPanel.addContent(healthBar);
        progressPanel.addContent(manaLabel);
        progressPanel.addContent(manaBar);
        progressPanel.addContent(expLabel);
        progressPanel.addContent(expBar);
        progressPanel.addContent(staminaLabel);
        progressPanel.addContent(staminaBar);

        this.testElements.push(progressPanel);

        // Test 3: Panel with buttons and progress bars
        this.add.text(centerX, startY + spacing * 2, 'Mixed Components', {
            fontFamily: 'Arial',
            fontSize: '20px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);

        const mixedPanel = new Panel(this, centerX, startY + spacing * 2 + 100, {
            width: 450,
            height: 300,
            title: 'Game UI Panel',
            padding: 20
        });

        const mixedHealthBar = new ProgressBar(this, 0, -80, {
            width: 350,
            height: 25,
            tintHigh: 0x00ff00,
            tintMedium: 0xff8800,
            tintLow: 0xff0000,
            showLabel: true,
            labelFormat: 'percent'
        });
        mixedHealthBar.setValue(0.65, true);

        const mixedManaBar = new ProgressBar(this, 0, -40, {
            width: 350,
            height: 25,
            tintHigh: 0x00ffff,
            tintMedium: 0x0088ff,
            tintLow: 0x0000ff,
            showLabel: true,
            labelFormat: 'percent'
        });
        mixedManaBar.setValue(0.35, true);

        const actionBtn1 = new Button(this, -100, 20, 'Action 1', {
            width: 140,
            height: 45,
            fontSize: '16px'
        });
        actionBtn1.onClick(() => {
            mixedHealthBar.decrease(0.1);
            mixedManaBar.decrease(0.15);
        });

        const actionBtn2 = new Button(this, 100, 20, 'Action 2', {
            width: 140,
            height: 45,
            fontSize: '16px'
        });
        actionBtn2.onClick(() => {
            mixedHealthBar.increase(0.1);
            mixedManaBar.increase(0.1);
        });

        const healBtn = new Button(this, 0, 80, 'Heal', {
            width: 200,
            height: 50,
            fontSize: '18px',
            tintNormal: 0x50c878,
            tintHover: 0x60d888,
            tintPressed: 0x40b868
        });
        healBtn.onClick(() => {
            mixedHealthBar.setFull();
            mixedManaBar.increase(0.2);
        });

        mixedPanel.addContent(mixedHealthBar);
        mixedPanel.addContent(mixedManaBar);
        mixedPanel.addContent(actionBtn1);
        mixedPanel.addContent(actionBtn2);
        mixedPanel.addContent(healBtn);

        this.testElements.push(mixedPanel);

        // Test 4: Multiple small panels in a grid
        this.add.text(centerX, startY + spacing * 3, 'Panel Grid Layout', {
            fontFamily: 'Arial',
            fontSize: '20px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);

        const gridPanels = [];
        const gridStartX = centerX - 200;
        const gridStartY = startY + spacing * 3 + 80;
        const gridSpacing = 150;

        for (let row = 0; row < 2; row++) {
            for (let col = 0; col < 3; col++) {
                const panel = new Panel(this, gridStartX + col * gridSpacing, gridStartY + row * 120, {
                    width: 130,
                    height: 100,
                    title: `P${row * 3 + col + 1}`,
                    padding: 10
                });

                const bar = new ProgressBar(this, 0, 10, {
                    width: 100,
                    height: 15,
                    showLabel: false
                });
                bar.setValue(0.3 + (row * 3 + col) * 0.1, true);

                const btn = new Button(this, 0, 35, 'Click', {
                    width: 80,
                    height: 30,
                    fontSize: '12px'
                });
                btn.onClick(() => {
                    const newValue = bar.getValue() >= 1.0 ? 0.1 : bar.getValue() + 0.1;
                    bar.setValue(newValue);
                });

                panel.addContent(bar);
                panel.addContent(btn);

                gridPanels.push(panel);
            }
        }

        this.testElements.push(...gridPanels);
    }
}

export default UITestComponentCombinations;

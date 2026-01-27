import { UITestBase } from './UITestBase.js';
import Button from '../../ui/components/Button.js';
import UIContainer from '../../ui/components/UIContainer.js';
import ResponsiveManager from '../../managers/ResponsiveManager.js';

/**
 * UITestContainers
 * Test scene for UIContainer component with scaling behavior and responsive alignment
 */
export class UITestContainers extends UITestBase {
    constructor() {
        super('UITestContainers');
        this.sceneTitle = 'UIContainer Layout Test';
        this.containers = [];
        this.labels = [];
    }

    createTestElements() {
        this.testElements = [];

        // Test 1: Top-center - Horizontal container with anchor positions
        this.createHorizontalAnchorTest();

        // Test 2: Center - Scaling test with interactive controls
        this.createScalingTest();

        // Test 3: Center-left - Vertical layout
        this.createVerticalTest();

        // Test 4: Center-right - Nested containers
        this.createNestedTest();

        // Instructions at bottom
        this.createInstructions();
    }

    /**
     * Create a label that tracks with ResponsiveManager
     */
    createLabel(text, alignment, margin, offsetY = -50) {
        const pos = ResponsiveManager.getAlignmentPosition(alignment, margin);
        const label = this.add.text(pos.x, pos.y + offsetY, text, {
            fontFamily: 'Arial',
            fontSize: '16px',
            color: '#aaaaaa'
        }).setOrigin(0.5);

        // Track label for responsive repositioning
        ResponsiveManager.trackElement(label, alignment, { x: margin.x, y: margin.y - offsetY }, {
            autoOrigin: false
        });

        this.labels.push(label);
        return label;
    }

    /**
     * Test horizontal container with start/center/end anchors
     * Aligned: top-center
     * Also demonstrates fitScreen - scales down when window is smaller than container
     */
    createHorizontalAnchorTest() {
        const alignment = 'top-center';
        const margin = { x: 0, y: 100 };

        // Label
        this.createLabel(`Horizontal Layout [${alignment}] + fitScreen`, alignment, margin, -50);

        // Create container with alignment and fitScreen enabled
        const container = new UIContainer(this, 0, 0, {
            width: 600,
            height: 70,
            layout: 'horizontal',
            spacing: 30,
            childAlign: 'center',
            showBackground: true,
            tint: 0x333355,
            alignment: alignment,
            margin: margin,
            // Screen-fit scaling: first reduces spacing, then scales container
            fitScreen: true,
            fitScreenAxis: 'width',
            fitScreenMargin: { x: 20, y: 0 },
            minSpacing: 5,
            minContainerScale: 0.4
        });

        // Add buttons with different anchors
        const btn1 = new Button(this, 0, 0, 'Start', { width: 100, height: 50 });
        const btn2 = new Button(this, 0, 0, 'Center', { width: 120, height: 50 });
        const btn3 = new Button(this, 0, 0, 'End', { width: 100, height: 50 });

        container.addChild(btn1, { anchor: 'start' });
        container.addChild(btn2, { anchor: 'center' });
        container.addChild(btn3, { anchor: 'end' });

        this.containers.push(container);
    }

    /**
     * Test scaling behavior with interactive controls
     * Aligned: center
     */
    createScalingTest() {
        const alignment = 'center';
        const margin = { x: 0, y: -30 };

        // Label
        this.createLabel(`Scaling Test [${alignment}] + fitScreen`, alignment, margin, -70);

        // Create container with alignment
        this.scalingContainer = new UIContainer(this, 0, 0, {
            width: 500,
            height: 70,
            layout: 'horizontal',
            spacing: 20,
            childAlign: 'center',
            showBackground: true,
            tint: 0x335533,
            scaleMode: 'shrink',
            minScaleFactor: 0.4,
            alignment: alignment,
            margin: margin,
            // Screen-fit scaling
            fitScreen: true,
            fitScreenAxis: 'width',
            fitScreenMargin: { x: 20, y: 0 },
            minSpacing: 5,
            minContainerScale: 0.4
        });

        // Add several buttons
        for (let i = 1; i <= 4; i++) {
            const btn = new Button(this, 0, 0, `Btn ${i}`, { width: 100, height: 50 });
            this.scalingContainer.addChild(btn);
        }

        // Width indicator (tracked)
        const indicatorPos = ResponsiveManager.getAlignmentPosition(alignment, { x: 0, y: margin.y + 55 });
        this.widthText = this.add.text(indicatorPos.x, indicatorPos.y, `Width: 500px | Scale: 1.00`, {
            fontFamily: 'Arial',
            fontSize: '14px',
            color: '#aaaaaa'
        }).setOrigin(0.5);
        ResponsiveManager.trackElement(this.widthText, alignment, { x: 0, y: margin.y + 55 }, { autoOrigin: false });
        this.labels.push(this.widthText);

        // Control buttons (tracked)
        const shrinkBtn = new Button(this, 0, 0, 'Shrink', {
            width: 100,
            height: 40,
            fontSize: '16px',
            alignment: alignment,
            margin: { x: -80, y: margin.y + 95 }
        });
        shrinkBtn.onClick(() => this.adjustContainerWidth(-50));

        const expandBtn = new Button(this, 0, 0, 'Expand', {
            width: 100,
            height: 40,
            fontSize: '16px',
            alignment: alignment,
            margin: { x: 80, y: margin.y + 95 }
        });
        expandBtn.onClick(() => this.adjustContainerWidth(50));

        this.containers.push(this.scalingContainer);
    }

    /**
     * Adjust the scaling test container width
     */
    adjustContainerWidth(delta) {
        const currentWidth = this.scalingContainer.config.width;
        const newWidth = Phaser.Math.Clamp(currentWidth + delta, 200, 700);

        this.scalingContainer.setContainerSize(newWidth, 70);

        const scaleFactor = this.scalingContainer.getScaleFactor();
        this.widthText.setText(`Width: ${newWidth}px | Scale: ${scaleFactor.toFixed(2)}`);
    }

    /**
     * Test vertical layout
     * Aligned: center-left
     */
    createVerticalTest() {
        const alignment = 'center-left';
        const margin = { x: 120, y: 80 };

        // Label
        this.createLabel(`Vertical [${alignment}] + fitScreen`, alignment, margin, -130);

        const container = new UIContainer(this, 0, 0, {
            width: 150,
            height: 200,
            layout: 'vertical',
            spacing: 10,
            childAlign: 'center',
            showBackground: true,
            tint: 0x553333,
            alignment: alignment,
            margin: margin,
            // Screen-fit scaling
            fitScreen: true,
            fitScreenAxis: 'both',
            fitScreenMargin: { x: 20, y: 100 },
            minSpacing: 2,
            minContainerScale: 0.4
        });

        const btn1 = new Button(this, 0, 0, 'Top', { width: 120, height: 45 });
        const btn2 = new Button(this, 0, 0, 'Middle', { width: 120, height: 45 });
        const btn3 = new Button(this, 0, 0, 'Bottom', { width: 120, height: 45 });

        container.addChild(btn1, { anchor: 'start' });
        container.addChild(btn2, { anchor: 'center' });
        container.addChild(btn3, { anchor: 'end' });

        this.containers.push(container);
    }

    /**
     * Test nested containers
     * Aligned: center-right
     */
    createNestedTest() {
        const alignment = 'center-right';
        const margin = { x: 180, y: 80 };

        // Label
        this.createLabel(`Nested [${alignment}] + fitScreen`, alignment, margin, -130);

        // Outer container (vertical) with alignment
        const outerContainer = new UIContainer(this, 0, 0, {
            width: 280,
            height: 200,
            layout: 'vertical',
            spacing: 15,
            childAlign: 'center',
            showBackground: true,
            tint: 0x444466,
            alignment: alignment,
            margin: margin,
            // Screen-fit scaling
            fitScreen: true,
            fitScreenAxis: 'both',
            fitScreenMargin: { x: 20, y: 100 },
            minSpacing: 5,
            minContainerScale: 0.4
        });

        // Inner container 1 (horizontal) - no alignment, positioned by parent
        const innerContainer1 = new UIContainer(this, 0, 0, {
            width: 240,
            height: 60,
            layout: 'horizontal',
            spacing: 10,
            showBackground: true,
            tint: 0x666688,
            autoReposition: false
        });

        const btn1a = new Button(this, 0, 0, 'A', { width: 60, height: 40 });
        const btn1b = new Button(this, 0, 0, 'B', { width: 60, height: 40 });
        const btn1c = new Button(this, 0, 0, 'C', { width: 60, height: 40 });
        innerContainer1.addChild(btn1a);
        innerContainer1.addChild(btn1b);
        innerContainer1.addChild(btn1c);

        // Inner container 2 (horizontal) - no alignment, positioned by parent
        const innerContainer2 = new UIContainer(this, 0, 0, {
            width: 240,
            height: 60,
            layout: 'horizontal',
            spacing: 10,
            showBackground: true,
            tint: 0x668866,
            autoReposition: false
        });

        const btn2a = new Button(this, 0, 0, '1', { width: 50, height: 40 });
        const btn2b = new Button(this, 0, 0, '2', { width: 50, height: 40 });
        const btn2c = new Button(this, 0, 0, '3', { width: 50, height: 40 });
        const btn2d = new Button(this, 0, 0, '4', { width: 50, height: 40 });
        innerContainer2.addChild(btn2a);
        innerContainer2.addChild(btn2b);
        innerContainer2.addChild(btn2c);
        innerContainer2.addChild(btn2d);

        outerContainer.addChild(innerContainer1);
        outerContainer.addChild(innerContainer2);

        this.containers.push(outerContainer);
        this.containers.push(innerContainer1);
        this.containers.push(innerContainer2);
    }

    /**
     * Instructions at bottom
     */
    createInstructions() {
        const alignment = 'bottom-center';
        const margin = { x: 0, y: 110 };

        const pos = ResponsiveManager.getAlignmentPosition(alignment, margin);
        const instructions = this.add.text(pos.x, pos.y,
            'Resize window to test fitScreen | All containers: first reduce spacing, then scale', {
                fontFamily: 'Arial',
                fontSize: '14px',
                color: '#666666'
            }).setOrigin(0.5);

        ResponsiveManager.trackElement(instructions, alignment, margin, { autoOrigin: false });
        this.labels.push(instructions);
    }

    /**
     * Cleanup
     */
    shutdown() {
        super.shutdown();

        // Untrack and destroy labels
        this.labels.forEach(label => {
            if (label && !label.destroyed) {
                ResponsiveManager.untrackElement(label);
                label.destroy();
            }
        });
        this.labels = [];

        // Destroy containers (they handle their own untracking)
        this.containers.forEach(c => {
            if (c && c.destroy) {
                c.destroy();
            }
        });
        this.containers = [];
    }
}

export default UITestContainers;

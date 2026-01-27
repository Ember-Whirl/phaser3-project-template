import { UITestBase } from './UITestBase.js';
import Button from '../../ui/components/Button.js';
import UIContainer from '../../ui/components/UIContainer.js';
import ResponsiveManager from '../../managers/ResponsiveManager.js';

/**
 * UITestContainerAlignments
 * Test scene for UIContainer fitScreen behavior with different alignments
 * Focuses on left/right alignments to verify available space calculation
 */
export class UITestContainerAlignments extends UITestBase {
    constructor() {
        super('UITestContainerAlignments');
        this.sceneTitle = 'Container Alignments + FitScreen';
        this.containers = [];
        this.labels = [];
    }

    createTestElements() {
        this.testElements = [];

        // Left side containers
        this.createLeftContainer('top-left', { x: 160, y: 80 });
        this.createLeftContainer('center-left', { x: 160, y: 0 });
        this.createLeftContainer('bottom-left', { x: 160, y: 120 });

        // Right side containers
        this.createRightContainer('top-right', { x: 160, y: 80 });
        this.createRightContainer('center-right', { x: 160, y: 0 });
        this.createRightContainer('bottom-right', { x: 160, y: 120 });

        // Center column for comparison
        this.createCenterContainer('top-center', { x: 0, y: 80 });
        this.createCenterContainer('center', { x: 0, y: 0 });

        // Instructions
        this.createInstructions();
    }

    /**
     * Create a label for a container
     */
    createLabel(text, alignment, margin, offsetY = -45) {
        const pos = ResponsiveManager.getAlignmentPosition(alignment, margin);
        const label = this.add.text(pos.x, pos.y + offsetY, text, {
            fontFamily: 'Arial',
            fontSize: '14px',
            color: '#aaaaaa'
        }).setOrigin(0.5);

        ResponsiveManager.trackElement(label, alignment, { x: margin.x, y: margin.y - offsetY }, {
            autoOrigin: false
        });

        this.labels.push(label);
        return label;
    }

    /**
     * Create a left-aligned container
     */
    createLeftContainer(alignment, margin) {
        this.createLabel(`[${alignment}]`, alignment, margin, -45);

        const container = new UIContainer(this, 0, 0, {
            width: 250,
            height: 60,
            layout: 'horizontal',
            spacing: 15,
            childAlign: 'center',
            showBackground: true,
            tint: 0x335533,
            alignment: alignment,
            margin: margin,
            fitScreen: true,
            fitScreenAxis: 'width',
            fitScreenMargin: { x: 10, y: 10 },
            minSpacing: 2,
            minContainerScale: 0.4
        });

        // Add buttons
        const btn1 = new Button(this, 0, 0, 'L1', { width: 60, height: 40 });
        const btn2 = new Button(this, 0, 0, 'L2', { width: 60, height: 40 });
        const btn3 = new Button(this, 0, 0, 'L3', { width: 60, height: 40 });

        container.addChild(btn1);
        container.addChild(btn2);
        container.addChild(btn3);

        this.containers.push(container);
        return container;
    }

    /**
     * Create a right-aligned container
     */
    createRightContainer(alignment, margin) {
        this.createLabel(`[${alignment}]`, alignment, margin, -45);

        const container = new UIContainer(this, 0, 0, {
            width: 250,
            height: 60,
            layout: 'horizontal',
            spacing: 15,
            childAlign: 'center',
            showBackground: true,
            tint: 0x553333,
            alignment: alignment,
            margin: margin,
            fitScreen: true,
            fitScreenAxis: 'width',
            fitScreenMargin: { x: 10, y: 10 },
            minSpacing: 2,
            minContainerScale: 0.4
        });

        // Add buttons
        const btn1 = new Button(this, 0, 0, 'R1', { width: 60, height: 40 });
        const btn2 = new Button(this, 0, 0, 'R2', { width: 60, height: 40 });
        const btn3 = new Button(this, 0, 0, 'R3', { width: 60, height: 40 });

        container.addChild(btn1);
        container.addChild(btn2);
        container.addChild(btn3);

        this.containers.push(container);
        return container;
    }

    /**
     * Create a center-aligned container (for comparison)
     */
    createCenterContainer(alignment, margin) {
        this.createLabel(`[${alignment}]`, alignment, margin, -45);

        const container = new UIContainer(this, 0, 0, {
            width: 300,
            height: 60,
            layout: 'horizontal',
            spacing: 15,
            childAlign: 'center',
            showBackground: true,
            tint: 0x333355,
            alignment: alignment,
            margin: margin,
            fitScreen: true,
            fitScreenAxis: 'width',
            fitScreenMargin: { x: 10, y: 10 },
            minSpacing: 2,
            minContainerScale: 0.4
        });

        // Add buttons
        const btn1 = new Button(this, 0, 0, 'C1', { width: 70, height: 40 });
        const btn2 = new Button(this, 0, 0, 'C2', { width: 70, height: 40 });
        const btn3 = new Button(this, 0, 0, 'C3', { width: 70, height: 40 });

        container.addChild(btn1);
        container.addChild(btn2);
        container.addChild(btn3);

        this.containers.push(container);
        return container;
    }

    /**
     * Instructions at bottom
     */
    createInstructions() {
        const alignment = 'bottom-center';
        const margin = { x: 0, y: 110 };

        const pos = ResponsiveManager.getAlignmentPosition(alignment, margin);
        const instructions = this.add.text(pos.x, pos.y,
            'Resize window: Container shrinks first (spacing reduces), then scales when spacing hits minimum', {
                fontFamily: 'Arial',
                fontSize: '14px',
                color: '#666666',
                wordWrap: { width: 700 }
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

        // Destroy containers
        this.containers.forEach(c => {
            if (c && c.destroy) {
                c.destroy();
            }
        });
        this.containers = [];
    }
}

export default UITestContainerAlignments;

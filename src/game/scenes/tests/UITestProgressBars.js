import { UITestBase } from './UITestBase.js';
import ProgressBar from '../../ui/components/ProgressBar.js';
import ResponsiveManager from '../../managers/ResponsiveManager.js';

/**
 * UITestProgressBars
 * Test scene for ProgressBar component at all 9 alignment positions
 */
export class UITestProgressBars extends UITestBase {
    constructor() {
        super('UITestProgressBars');
        this.sceneTitle = 'ProgressBar Alignment Test';
    }

    createTestElements() {
        this.testElements = [];

        // Different initial values for each bar
        const initialValues = [0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0];

        UITestBase.ALIGNMENTS.forEach((alignment, index) => {
            const adjustedMargin = this.getAdjustedMargin(alignment, true);

            const bar = new ProgressBar(this, 0, 0, {
                width: 150,
                height: 25,
                fillColor: 0x00ff00,
                backgroundColor: 0x333333,
                borderWidth: 2,
                borderColor: 0x000000,
                showLabel: true,
                labelFormat: 'percent',
                alignment: alignment,
                margin: adjustedMargin
            });

            bar.setValue(initialValues[index], true);

            // Create info label
            const labelOffset = alignment.includes('bottom') ? -40 : 35;
            const pos = ResponsiveManager.getAlignmentPosition(alignment, adjustedMargin);

            const infoText = this.add.text(pos.x, pos.y + labelOffset,
                `${alignment}\n${this.formatMargin(adjustedMargin)}`, {
                fontFamily: 'Arial',
                fontSize: '11px',
                color: '#aaaaaa',
                align: 'center'
            }).setOrigin(0.5);

            // Track info text for repositioning
            ResponsiveManager.trackElement(infoText, alignment, {
                x: adjustedMargin.x,
                y: adjustedMargin.y + labelOffset
            });

            const testData = {
                element: bar,
                alignment: alignment,
                hasOffset: true,
                infoText: infoText,
                labelOffset: labelOffset
            };

            // Make progress bar interactive
            bar.setSize(150, 25);
            bar.setInteractive({ useHandCursor: true });
            bar.on('pointerdown', () => this.onBarClick(testData));

            this.testElements.push(testData);
        });

        // Add instruction text
        this.add.text(this.scale.width / 2, 30, 'Click progress bars to increase value (wraps at 100%)', {
            fontFamily: 'Arial',
            fontSize: '16px',
            color: '#888888'
        }).setOrigin(0.5);
    }

    /**
     * Get adjusted margin for alignment, accounting for nav bar and labels
     */
    getAdjustedMargin(alignment, hasOffset) {
        const margin = this.getMarginForAlignment(alignment, hasOffset);

        // Add extra margin for bottom positions to avoid nav bar overlap
        if (alignment.includes('bottom')) {
            margin.y = hasOffset ? 120 : 105;
        }

        // Add extra margin for top positions to make room for labels
        if (alignment.includes('top')) {
            margin.y = hasOffset ? 80 : 60;
        }

        return margin;
    }

    /**
     * Handle bar click - increase value by 10%
     */
    onBarClick(testData) {
        const currentValue = testData.element.getValue();
        const newValue = currentValue >= 1.0 ? 0.1 : Math.min(currentValue + 0.1, 1.0);
        testData.element.setValue(newValue);
    }

    /**
     * Handle resize - update info text positions
     */
    onResize(gameSize) {
        super.onResize(gameSize);

        // Update info text positions
        this.testElements.forEach(testData => {
            const margin = this.getAdjustedMargin(testData.alignment, testData.hasOffset);
            const pos = ResponsiveManager.getAlignmentPosition(testData.alignment, margin);
            testData.infoText.setPosition(pos.x, pos.y + testData.labelOffset);
        });
    }
}

export default UITestProgressBars;

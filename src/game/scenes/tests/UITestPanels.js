import { UITestBase } from './UITestBase.js';
import Panel from '../../ui/components/Panel.js';

/**
 * UITestPanels
 * Test scene for Panel component at all 9 alignment positions
 */
export class UITestPanels extends UITestBase {
    constructor() {
        super('UITestPanels');
        this.sceneTitle = 'Panel Alignment Test';
    }

    createTestElements() {
        this.testElements = [];

        UITestBase.ALIGNMENTS.forEach((alignment) => {
            const adjustedMargin = this.getAdjustedMargin(alignment, true);

            const panel = new Panel(this, 0, 0, {
                width: 160,
                height: 100,
                backgroundColor: 0x222222,
                backgroundAlpha: 0.95,
                borderWidth: 2,
                borderColor: 0x4a90e2,
                title: alignment,
                titleSize: '14px',
                padding: 10,
                alignment: alignment,
                margin: adjustedMargin
            });

            // Add content text showing margin
            const marginText = this.add.text(0, 15, this.formatMargin(adjustedMargin), {
                fontFamily: 'Arial',
                fontSize: '12px',
                color: '#aaaaaa',
                align: 'center'
            }).setOrigin(0.5);

            panel.addContent(marginText);

            // Add click instruction
            const clickText = this.add.text(0, 32, '(click to toggle)', {
                fontFamily: 'Arial',
                fontSize: '10px',
                color: '#666666'
            }).setOrigin(0.5);

            panel.addContent(clickText);

            const testData = {
                element: panel,
                alignment: alignment,
                hasOffset: true,
                marginText: marginText
            };

            // Make panel interactive
            panel.setSize(160, 100);
            panel.setInteractive({ useHandCursor: true });
            panel.on('pointerdown', () => this.toggleMargin(testData));

            this.testElements.push(testData);
        });
    }

    /**
     * Get adjusted margin for alignment, accounting for nav bar
     */
    getAdjustedMargin(alignment, hasOffset) {
        const margin = this.getMarginForAlignment(alignment, hasOffset);

        // Add extra margin for bottom positions to avoid nav bar overlap
        if (alignment.includes('bottom')) {
            margin.y = hasOffset ? 100 : 85;
        }

        return margin;
    }

    /**
     * Toggle margin offset for a panel
     */
    toggleMargin(testData) {
        testData.hasOffset = !testData.hasOffset;
        const newMargin = this.getAdjustedMargin(testData.alignment, testData.hasOffset);

        // Update panel position
        testData.element.setAlignment(testData.alignment, newMargin);

        // Update margin text
        testData.marginText.setText(this.formatMargin(newMargin));
    }
}

export default UITestPanels;

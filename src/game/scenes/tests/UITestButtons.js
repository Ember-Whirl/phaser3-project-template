import { UITestBase } from './UITestBase.js';
import Button from '../../ui/components/Button.js';

/**
 * UITestButtons
 * Test scene for Button component at all 9 alignment positions
 */
export class UITestButtons extends UITestBase {
    constructor() {
        super('UITestButtons');
        this.sceneTitle = 'Button Alignment Test';
    }

    createTestElements() {
        this.testElements = [];

        UITestBase.ALIGNMENTS.forEach((alignment) => {
            // Skip bottom positions to avoid overlap with navigation
            const adjustedMargin = this.getAdjustedMargin(alignment, true);

            const buttonText = this.getButtonText(alignment, adjustedMargin);

            const button = new Button(this, 0, 0, buttonText, {
                width: 160,
                height: 70,
                backgroundColor: 0x4a4a4a,
                hoverColor: 0x6a6a6a,
                pressedColor: 0x3a3a3a,
                fontSize: '14px',
                alignment: alignment,
                margin: adjustedMargin
            });

            const testData = {
                element: button,
                alignment: alignment,
                hasOffset: true
            };

            button.onClick(() => this.toggleMargin(testData));
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
     * Get button text showing alignment and margin
     */
    getButtonText(alignment, margin) {
        return `${alignment}\n${this.formatMargin(margin)}`;
    }

    /**
     * Toggle margin offset for a button
     */
    toggleMargin(testData) {
        testData.hasOffset = !testData.hasOffset;
        const newMargin = this.getAdjustedMargin(testData.alignment, testData.hasOffset);

        // Update button position
        testData.element.setAlignment(testData.alignment, newMargin);

        // Update button text
        const newText = this.getButtonText(testData.alignment, newMargin);
        testData.element.setText(newText);
    }
}

export default UITestButtons;

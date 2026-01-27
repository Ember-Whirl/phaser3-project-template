import { UITestBase } from './UITestBase.js';
import textStyles from '../../config/text/textStyles.js';

/**
 * UITestTextStyles
 * Test scene for all text styles
 */
export class UITestTextStyles extends UITestBase {
    constructor() {
        super('UITestTextStyles');
        this.sceneTitle = 'Text Styles Test';
    }

    createTestElements() {
        const styleNames = Object.keys(textStyles);
        const startY = 60;
        const spacing = 50;
        const labelX = 30;
        const sampleX = 160;

        // Sample text for each style
        const sampleTexts = {
            heading: 'Heading Text Sample',
            subheading: 'Subheading Text Sample',
            body: 'Body Text Sample',
            bodySmall: 'Body Small Text Sample',
            button: 'Button Text',
            score: 'Score: 12345',
            caption: 'Caption Text Sample',
            title: 'TITLE',
            hud: 'HUD: 100/100',
            damage: '-50 Damage',
            heal: '+25 Heal',
            levelUp: 'LEVEL UP!'
        };

        styleNames.forEach((styleName, index) => {
            const y = startY + (index * spacing);

            // Style name label
            this.add.text(labelX, y, `${styleName}:`, {
                fontFamily: 'Arial',
                fontSize: '16px',
                color: '#888888'
            }).setOrigin(0, 0.5);

            // Sample text with the actual style
            const sampleText = sampleTexts[styleName] || styleName;
            const styleConfig = { ...textStyles[styleName] };

            // Scale down large styles to fit
            if (styleName === 'title' || styleName === 'heading' || styleName === 'levelUp') {
                styleConfig.fontSize = '32px';
            }

            this.add.text(sampleX, y, sampleText, styleConfig)
                .setOrigin(0, 0.5);
        });

        // Add info about the number of styles
        this.add.text(this.scale.width / 2, this.scale.height - 100,
            `Total text styles: ${styleNames.length}`, {
            fontFamily: 'Arial',
            fontSize: '14px',
            color: '#666666'
        }).setOrigin(0.5);

        // Add note about styles file location
        this.add.text(this.scale.width / 2, this.scale.height - 120,
            'Styles defined in: src/game/config/text/textStyles.js', {
            fontFamily: 'Arial',
            fontSize: '12px',
            color: '#555555'
        }).setOrigin(0.5);
    }
}

export default UITestTextStyles;

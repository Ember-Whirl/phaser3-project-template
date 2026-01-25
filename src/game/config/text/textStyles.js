/**
 * Text Styles
 * Predefined text styles for consistent typography
 *
 * Usage:
 *   import textStyles from './config/text/textStyles';
 *
 *   const text = scene.add.text(x, y, 'Hello', textStyles.heading);
 */

export const textStyles = {
    heading: {
        fontFamily: 'Arial',
        fontSize: '48px',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 4,
        shadow: {
            offsetX: 2,
            offsetY: 2,
            color: '#000000',
            blur: 4,
            fill: true
        }
    },

    subheading: {
        fontFamily: 'Arial',
        fontSize: '32px',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 3
    },

    body: {
        fontFamily: 'Arial',
        fontSize: '24px',
        color: '#ffffff'
    },

    bodySmall: {
        fontFamily: 'Arial',
        fontSize: '18px',
        color: '#cccccc'
    },

    button: {
        fontFamily: 'Arial',
        fontSize: '28px',
        color: '#ffffff',
        fontStyle: 'bold'
    },

    score: {
        fontFamily: 'Courier',
        fontSize: '32px',
        color: '#ffff00',
        stroke: '#000000',
        strokeThickness: 2
    },

    caption: {
        fontFamily: 'Arial',
        fontSize: '16px',
        color: '#888888'
    },

    title: {
        fontFamily: 'Arial Black',
        fontSize: '64px',
        color: '#ffff00',
        stroke: '#000000',
        strokeThickness: 6,
        shadow: {
            offsetX: 4,
            offsetY: 4,
            color: '#000000',
            blur: 8,
            fill: true
        }
    },

    hud: {
        fontFamily: 'Arial',
        fontSize: '20px',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 2
    },

    damage: {
        fontFamily: 'Arial',
        fontSize: '32px',
        color: '#ff0000',
        stroke: '#000000',
        strokeThickness: 3,
        fontStyle: 'bold'
    },

    heal: {
        fontFamily: 'Arial',
        fontSize: '32px',
        color: '#00ff00',
        stroke: '#000000',
        strokeThickness: 3,
        fontStyle: 'bold'
    },

    levelUp: {
        fontFamily: 'Arial',
        fontSize: '48px',
        color: '#ffd700',
        stroke: '#000000',
        strokeThickness: 5,
        fontStyle: 'bold'
    }
};

export default textStyles;

import Button from './components/Button.js';
import Panel from './components/Panel.js';
import ProgressBar from './components/ProgressBar.js';
import theme from './themes/defaultTheme.js';

/**
 * UIBuilder
 * Fluent API for building UI layouts quickly
 *
 * Usage:
 *   import UIBuilder from './ui/UIBuilder';
 *
 *   const ui = new UIBuilder(scene);
 *
 *   ui.button(400, 300, 'Play')
 *     .onClick(() => scene.scene.start('Game'))
 *     .theme('primary');
 *
 *   ui.panel(400, 200, { width: 500, height: 300, title: 'Settings' })
 *     .show('top');
 */

export default class UIBuilder {
    constructor(scene) {
        this.scene = scene;
        this.theme = theme;
        this.elements = [];
    }

    /**
     * Create a button
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {string} text - Button text
     * @param {object} config - Button configuration
     * @returns {Button} Button instance
     */
    button(x, y, text, config = {}) {
        const button = new Button(this.scene, x, y, text, config);
        this.elements.push(button);
        return button;
    }

    /**
     * Create a panel
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {object} config - Panel configuration
     * @returns {Panel} Panel instance
     */
    panel(x, y, config = {}) {
        const panel = new Panel(this.scene, x, y, config);
        this.elements.push(panel);
        return panel;
    }

    /**
     * Create a progress bar
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {object} config - ProgressBar configuration
     * @returns {ProgressBar} ProgressBar instance
     */
    progressBar(x, y, config = {}) {
        const bar = new ProgressBar(this.scene, x, y, config);
        this.elements.push(bar);
        return bar;
    }

    /**
     * Create text with theme styling
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {string} text - Text content
     * @param {string} style - Style preset: 'heading', 'body', 'caption'
     * @returns {Phaser.GameObjects.Text} Text object
     */
    text(x, y, text, style = 'body') {
        const styles = {
            heading: {
                fontFamily: this.theme.fonts.heading,
                fontSize: this.theme.fontSizes.large,
                color: this.theme.colors.text
            },
            body: {
                fontFamily: this.theme.fonts.primary,
                fontSize: this.theme.fontSizes.medium,
                color: this.theme.colors.text
            },
            caption: {
                fontFamily: this.theme.fonts.primary,
                fontSize: this.theme.fontSizes.small,
                color: this.theme.colors.textSecondary
            }
        };

        const textObj = this.scene.add.text(x, y, text, styles[style] || styles.body);
        this.elements.push(textObj);
        return textObj;
    }

    /**
     * Create an image
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {string} key - Image key
     * @returns {Phaser.GameObjects.Image} Image object
     */
    image(x, y, key) {
        const img = this.scene.add.image(x, y, key);
        this.elements.push(img);
        return img;
    }

    /**
     * Layout helpers - Center an element
     * @param {Phaser.GameObjects.GameObject} element - Element to center
     * @param {string} direction - 'horizontal', 'vertical', or 'both'
     */
    center(element, direction = 'both') {
        const { width, height } = this.scene.scale;

        if (direction === 'horizontal' || direction === 'both') {
            element.x = width / 2;
        }

        if (direction === 'vertical' || direction === 'both') {
            element.y = height / 2;
        }

        return element;
    }

    /**
     * Align element to screen edge
     * @param {Phaser.GameObjects.GameObject} element - Element to align
     * @param {string} position - 'top', 'bottom', 'left', 'right', or combinations
     * @param {number} margin - Margin from edge
     */
    align(element, position, margin = 20) {
        const { width, height } = this.scene.scale;

        if (position.includes('top')) {
            element.y = margin;
        }

        if (position.includes('bottom')) {
            element.y = height - margin;
        }

        if (position.includes('left')) {
            element.x = margin;
        }

        if (position.includes('right')) {
            element.x = width - margin;
        }

        if (position.includes('center-x')) {
            element.x = width / 2;
        }

        if (position.includes('center-y')) {
            element.y = height / 2;
        }

        return element;
    }

    /**
     * Distribute elements evenly
     * @param {Array} elements - Elements to distribute
     * @param {string} direction - 'horizontal' or 'vertical'
     * @param {number} startPos - Start position
     * @param {number} endPos - End position
     */
    distribute(elements, direction, startPos, endPos) {
        const spacing = (endPos - startPos) / (elements.length + 1);

        elements.forEach((element, index) => {
            const position = startPos + spacing * (index + 1);

            if (direction === 'horizontal') {
                element.x = position;
            } else {
                element.y = position;
            }
        });

        return elements;
    }

    /**
     * Create a grid of elements
     * @param {number} x - Grid start X
     * @param {number} y - Grid start Y
     * @param {number} cols - Number of columns
     * @param {number} rows - Number of rows
     * @param {number} cellWidth - Cell width
     * @param {number} cellHeight - Cell height
     * @param {function} createFn - Function to create each cell element
     * @returns {Array} Array of created elements
     */
    grid(x, y, cols, rows, cellWidth, cellHeight, createFn) {
        const elements = [];

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const cellX = x + col * cellWidth;
                const cellY = y + row * cellHeight;
                const element = createFn(cellX, cellY, col, row);
                elements.push(element);
                this.elements.push(element);
            }
        }

        return elements;
    }

    /**
     * Create a vertical stack of elements
     * @param {number} x - Stack X position
     * @param {number} y - Stack start Y position
     * @param {Array} elements - Elements to stack
     * @param {number} spacing - Spacing between elements
     */
    vstack(x, y, elements, spacing = 10) {
        let currentY = y;

        elements.forEach(element => {
            element.x = x;
            element.y = currentY;
            currentY += (element.height || 0) + spacing;
        });

        return elements;
    }

    /**
     * Create a horizontal stack of elements
     * @param {number} x - Stack start X position
     * @param {number} y - Stack Y position
     * @param {Array} elements - Elements to stack
     * @param {number} spacing - Spacing between elements
     */
    hstack(x, y, elements, spacing = 10) {
        let currentX = x;

        elements.forEach(element => {
            element.x = currentX;
            element.y = y;
            currentX += (element.width || 0) + spacing;
        });

        return elements;
    }

    /**
     * Get all created elements
     * @returns {Array} Array of UI elements
     */
    getElements() {
        return this.elements;
    }

    /**
     * Destroy all created elements
     */
    destroyAll() {
        this.elements.forEach(element => {
            if (element && element.destroy) {
                element.destroy();
            }
        });
        this.elements = [];
    }
}

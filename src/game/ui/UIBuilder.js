import Button from './components/Button.js';
import Panel from './components/Panel.js';
import ProgressBar from './components/ProgressBar.js';
import UIContainer from './components/UIContainer.js';
import theme from './themes/defaultTheme.js';
import ResponsiveManager from '../managers/ResponsiveManager.js';

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
     * Create a UIContainer for layout management
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {object} config - UIContainer configuration
     * @returns {UIContainer} UIContainer instance
     *
     * @example
     * const container = ui.container(400, 300, {
     *     width: 600,
     *     height: 80,
     *     layout: 'horizontal',
     *     spacing: 20
     * });
     * container.addChild(button1, { anchor: 'start' });
     * container.addChild(button2, { anchor: 'center' });
     * container.addChild(button3, { anchor: 'end' });
     */
    container(x, y, config = {}) {
        const container = new UIContainer(this.scene, x, y, config);
        this.elements.push(container);
        return container;
    }

    /**
     * Create a UIContainer with alignment
     * @param {string} alignment - Alignment: 'top-left', 'center', 'bottom-right', etc.
     * @param {object|number} margin - Margin from edges { x, y } or number
     * @param {object} config - UIContainer configuration
     * @returns {UIContainer} UIContainer instance
     *
     * @example
     * const container = ui.containerAt('bottom-center', { x: 0, y: 30 }, {
     *     width: 600,
     *     height: 80,
     *     layout: 'horizontal'
     * });
     */
    containerAt(alignment, margin = 20, config = {}) {
        const pos = ResponsiveManager.getAlignmentPosition(alignment, margin);
        const container = new UIContainer(this.scene, pos.x, pos.y, config);

        ResponsiveManager.trackElement(container, alignment, margin, {
            autoOrigin: false
        });

        this.elements.push(container);
        return container;
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
     * Position element using alignment
     * @param {Phaser.GameObjects.GameObject} element - Element to position
     * @param {string} alignment - Alignment: 'top-left', 'center', 'bottom-right', etc.
     * @param {object|number} margin - Margin from edges { x, y } or number
     * @param {object} config - Additional config { autoOrigin, track }
     * @returns {Phaser.GameObjects.GameObject} Element for chaining
     *
     * @example
     * ui.positionAt(sprite, 'top-right', { x: 20, y: 20 });
     */
    positionAt(element, alignment, margin = 20, config = {}) {
        const pos = ResponsiveManager.getAlignmentPosition(alignment, margin);

        element.x = pos.x;
        element.y = pos.y;

        if (config.autoOrigin !== false && element.setOrigin) {
            element.setOrigin(pos.origin.x, pos.origin.y);
        }

        if (config.track !== false) {
            ResponsiveManager.trackElement(element, alignment, margin, config);
        }

        return element;
    }

    /**
     * Create button with alignment
     * @param {string} alignment - Alignment: 'top-left', 'center', 'bottom-right', etc.
     * @param {string} text - Button text
     * @param {object|number} margin - Margin from edges { x, y } or number
     * @param {object} config - Button configuration
     * @returns {Button} Button instance
     *
     * @example
     * ui.buttonAt('center', 'Play', { x: 0, y: 50 })
     *   .onClick(() => this.scene.start('Game'));
     */
    buttonAt(alignment, text, margin = 20, config = {}) {
        const pos = ResponsiveManager.getAlignmentPosition(alignment, margin);
        const button = new Button(this.scene, pos.x, pos.y, text, config);

        if (button.setOrigin && config.autoOrigin !== false) {
            button.setOrigin(pos.origin.x, pos.origin.y);
        }

        ResponsiveManager.trackElement(button, alignment, margin, {
            autoOrigin: config.autoOrigin !== false
        });

        this.elements.push(button);
        return button;
    }

    /**
     * Create panel with alignment
     * @param {string} alignment - Alignment: 'top-left', 'center', 'bottom-right', etc.
     * @param {object|number} margin - Margin from edges { x, y } or number
     * @param {object} config - Panel configuration
     * @returns {Panel} Panel instance
     *
     * @example
     * ui.panelAt('center', { x: 0, y: 0 }, { width: 400, height: 300 });
     */
    panelAt(alignment, margin = 20, config = {}) {
        const pos = ResponsiveManager.getAlignmentPosition(alignment, margin);
        const panel = new Panel(this.scene, pos.x, pos.y, config);

        if (panel.setOrigin && config.autoOrigin !== false) {
            panel.setOrigin(pos.origin.x, pos.origin.y);
        }

        ResponsiveManager.trackElement(panel, alignment, margin, {
            autoOrigin: config.autoOrigin !== false
        });

        this.elements.push(panel);
        return panel;
    }

    /**
     * Create progress bar with alignment
     * @param {string} alignment - Alignment: 'top-left', 'center', 'bottom-right', etc.
     * @param {object|number} margin - Margin from edges { x, y } or number
     * @param {object} config - ProgressBar configuration
     * @returns {ProgressBar} ProgressBar instance
     *
     * @example
     * ui.progressBarAt('top-center', { x: 0, y: 20 }, { width: 400 });
     */
    progressBarAt(alignment, margin = 20, config = {}) {
        const pos = ResponsiveManager.getAlignmentPosition(alignment, margin);
        const bar = new ProgressBar(this.scene, pos.x, pos.y, config);

        if (bar.setOrigin && config.autoOrigin !== false) {
            bar.setOrigin(pos.origin.x, pos.origin.y);
        }

        ResponsiveManager.trackElement(bar, alignment, margin, {
            autoOrigin: config.autoOrigin !== false
        });

        this.elements.push(bar);
        return bar;
    }

    /**
     * Create text with alignment
     * @param {string} alignment - Alignment: 'top-left', 'center', 'bottom-right', etc.
     * @param {string} text - Text content
     * @param {object|number} margin - Margin from edges { x, y } or number
     * @param {string} style - Style preset: 'heading', 'body', 'caption'
     * @returns {Phaser.GameObjects.Text} Text object
     *
     * @example
     * ui.textAt('top-center', 'Game Title', { x: 0, y: 40 }, 'heading');
     */
    textAt(alignment, text, margin = 20, style = 'body') {
        const pos = ResponsiveManager.getAlignmentPosition(alignment, margin);
        const textObj = this.text(pos.x, pos.y, text, style);

        textObj.setOrigin(pos.origin.x, pos.origin.y);
        ResponsiveManager.trackElement(textObj, alignment, margin, { autoOrigin: false });

        return textObj;
    }

    /**
     * Get responsive value based on screen size
     * @param {number} value - Value to scale
     * @param {boolean} scaleFactor - Whether to apply scale factor
     * @returns {number} Scaled value
     *
     * @example
     * const spacing = ui.responsive(20); // Returns scaled value
     */
    responsive(value, scaleFactor = true) {
        return scaleFactor ? ResponsiveManager.scale(value) : value;
    }

    /**
     * Layout helpers - Center an element
     * @param {Phaser.GameObjects.GameObject} element - Element to center
     * @param {string} direction - 'horizontal', 'vertical', or 'both'
     * @param {boolean} track - Whether to track element for auto-repositioning
     */
    center(element, direction = 'both', track = true) {
        const { width, height } = this.scene.scale;

        if (direction === 'horizontal' || direction === 'both') {
            element.x = width / 2;
        }

        if (direction === 'vertical' || direction === 'both') {
            element.y = height / 2;
        }

        if (track) {
            ResponsiveManager.trackElement(element, 'center', { x: 0, y: 0 });
        }

        return element;
    }

    /**
     * Align element to screen edge
     * @param {Phaser.GameObjects.GameObject} element - Element to align
     * @param {string} position - 'top', 'bottom', 'left', 'right', or combinations
     * @param {number} margin - Margin from edge
     * @param {boolean} track - Whether to track element for auto-repositioning
     */
    align(element, position, margin = 20, track = true) {
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

        // Convert position string to alignment format for tracking
        if (track) {
            let alignment = '';
            if (position.includes('top')) alignment += 'top';
            else if (position.includes('bottom')) alignment += 'bottom';
            else if (position.includes('center-y')) alignment += 'center';

            if (alignment && (position.includes('left') || position.includes('right') || position.includes('center-x'))) {
                alignment += '-';
            }

            if (position.includes('left')) alignment += 'left';
            else if (position.includes('right')) alignment += 'right';
            else if (position.includes('center-x')) alignment += 'center';

            if (!alignment) alignment = 'center';

            ResponsiveManager.trackElement(element, alignment, margin);
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

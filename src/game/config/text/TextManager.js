/**
 * Text Manager
 * Centralized text and localization management
 *
 * Usage:
 *   import TextManager from './config/text/TextManager';
 *
 *   // Initialize with default language
 *   await TextManager.init(scene, 'en');
 *
 *   // Get text
 *   const title = TextManager.getText('menu.title');
 *
 *   // Get text with parameters
 *   const score = TextManager.getText('game.score', 1000); // "Score: 1000"
 *
 *   // Create text with styling
 *   const text = TextManager.createText(scene, 400, 300, 'menu.title', 'heading');
 *
 *   // Change language
 *   TextManager.setLanguage(scene, 'es');
 */

import textStyles from './textStyles.js';

class TextManager {
    constructor() {
        this.currentLanguage = 'en';
        this.texts = {};
        this.styles = textStyles;
        this.loadedLanguages = new Set();
    }

    /**
     * Initialize the text manager
     * @param {Phaser.Scene} scene - The scene
     * @param {string} language - Default language code
     */
    async init(scene, language = 'en') {
        // Load language from localStorage if available
        const savedLanguage = localStorage.getItem('game_language');
        this.currentLanguage = savedLanguage || language;

        await this.loadLanguage(scene, this.currentLanguage);

        console.log(`[TextManager] Initialized with language: ${this.currentLanguage}`);
    }

    /**
     * Load a language file
     * @param {Phaser.Scene} scene - The scene
     * @param {string} language - Language code
     */
    async loadLanguage(scene, language) {
        if (this.loadedLanguages.has(language)) {
            return;
        }

        const path = `src/game/config/text/languages/${language}.json`;

        return new Promise((resolve, reject) => {
            scene.load.json(language, path);
            scene.load.once(`filecomplete-json-${language}`, () => {
                this.texts[language] = scene.cache.json.get(language);
                this.loadedLanguages.add(language);
                console.log(`[TextManager] Loaded language: ${language}`);
                resolve();
            });

            scene.load.start();
        });
    }

    /**
     * Set the current language
     * @param {Phaser.Scene} scene - The scene
     * @param {string} language - Language code
     */
    async setLanguage(scene, language) {
        if (!this.loadedLanguages.has(language)) {
            await this.loadLanguage(scene, language);
        }

        this.currentLanguage = language;
        localStorage.setItem('game_language', language);

        console.log(`[TextManager] Language changed to: ${language}`);

        // Emit language changed event
        scene.events.emit('languageChanged', language);
    }

    /**
     * Get text by key
     * @param {string} key - Text key (e.g., 'menu.title')
     * @param {...any} params - Parameters for substitution
     * @returns {string} Localized text
     */
    getText(key, ...params) {
        const texts = this.texts[this.currentLanguage] || {};
        const keys = key.split('.');

        let value = texts;
        for (const k of keys) {
            value = value?.[k];
            if (value === undefined) {
                console.warn(`[TextManager] Text not found: ${key}`);
                return key;
            }
        }

        // Replace parameters {0}, {1}, etc.
        if (params.length > 0 && typeof value === 'string') {
            params.forEach((param, index) => {
                value = value.replace(`{${index}}`, param);
            });
        }

        return value;
    }

    /**
     * Create a text object with style
     * @param {Phaser.Scene} scene - The scene
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {string} textKey - Text key
     * @param {string} styleName - Style name
     * @returns {Phaser.GameObjects.Text} Text object
     */
    createText(scene, x, y, textKey, styleName = 'body') {
        const text = this.getText(textKey);
        const style = this.styles[styleName] || this.styles.body;

        return scene.add.text(x, y, text, style);
    }

    /**
     * Get a text style
     * @param {string} styleName - Style name
     * @returns {object} Text style object
     */
    getStyle(styleName) {
        return this.styles[styleName] || this.styles.body;
    }

    /**
     * Get current language
     * @returns {string} Current language code
     */
    getLanguage() {
        return this.currentLanguage;
    }

    /**
     * Get available languages
     * @returns {Array<string>} Array of language codes
     */
    getAvailableLanguages() {
        return Array.from(this.loadedLanguages);
    }

    /**
     * Check if a language is loaded
     * @param {string} language - Language code
     * @returns {boolean}
     */
    isLanguageLoaded(language) {
        return this.loadedLanguages.has(language);
    }

    /**
     * Register a custom style
     * @param {string} name - Style name
     * @param {object} style - Style object
     */
    registerStyle(name, style) {
        this.styles[name] = style;
    }

    /**
     * Reset the text manager
     */
    reset() {
        this.currentLanguage = 'en';
        this.texts = {};
        this.loadedLanguages.clear();
    }
}

// Export singleton instance
export default new TextManager();

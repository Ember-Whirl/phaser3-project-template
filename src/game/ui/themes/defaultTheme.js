/**
 * Default UI Theme
 * Centralized color scheme and styling for UI components
 *
 * Usage:
 *   import theme from './ui/themes/defaultTheme';
 *
 *   const button = new Button(scene, x, y, 'Play', {
 *       backgroundColor: theme.colors.primary,
 *       textColor: theme.colors.text
 *   });
 */

export const defaultTheme = {
    colors: {
        // Primary colors
        primary: 0x4a90e2,
        secondary: 0x7b68ee,
        success: 0x50c878,
        warning: 0xffa500,
        danger: 0xe74c3c,
        info: 0x5bc0de,

        // Neutral colors
        background: 0x1a1a2e,
        backgroundLight: 0x2a2a3e,
        backgroundDark: 0x0f0f1e,

        // UI element colors
        panel: 0x222222,
        panelBorder: 0x444444,

        button: 0x4a4a4a,
        buttonHover: 0x6a6a6a,
        buttonPressed: 0x3a3a3a,

        // Text colors (hex strings for Phaser text)
        text: '#ffffff',
        textSecondary: '#cccccc',
        textDisabled: '#666666',
        textDark: '#333333'
    },

    fonts: {
        primary: 'Arial',
        heading: 'Arial Black',
        monospace: 'Courier'
    },

    fontSizes: {
        small: '16px',
        medium: '24px',
        large: '32px',
        xlarge: '48px',
        xxlarge: '64px'
    },

    spacing: {
        xs: 4,
        sm: 8,
        md: 16,
        lg: 24,
        xl: 32,
        xxl: 48
    },

    borderRadius: {
        small: 4,
        medium: 8,
        large: 12,
        xlarge: 16
    },

    shadows: {
        small: { x: 2, y: 2, blur: 4, color: 0x000000, alpha: 0.3 },
        medium: { x: 4, y: 4, blur: 8, color: 0x000000, alpha: 0.4 },
        large: { x: 6, y: 6, blur: 12, color: 0x000000, alpha: 0.5 }
    },

    animations: {
        fast: 150,
        normal: 300,
        slow: 500
    }
};

export default defaultTheme;

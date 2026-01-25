# Phaser 3 Extended Game Development Template

A comprehensive, production-ready Phaser 3 template with webpack 5, featuring multi-platform portal support, scene generators, UI components, animation presets, and localization - everything you need to build games faster!

**[This Template is also available as a TypeScript version.](https://github.com/phaserjs/template-webpack-ts)**

## What's New in v3.5.0 (2026 Update)

This template has been completely modernized with powerful features for rapid game development:

### 📱 Responsive System (NEW in v3.5.0)
- **ResponsiveManager** - Centralized responsive layout management
- **Alignment-Based Positioning** - 9 semantic alignments (top-left, center, bottom-right, etc.)
- **Auto-Repositioning** - Elements automatically adjust when screen resizes
- **Orientation Detection** - Portrait/landscape detection with orientation-specific layouts
- **Safe Area Support** - Handle mobile notches and safe zones

### 🎮 Multi-Platform Portal Support
- **Poki & CrazyGames SDK Integration** - Deploy to major game portals with one command
- **Unified Portal API** - Single interface for ads, analytics, and platform features
- Platform-specific builds: `npm run build:poki`, `npm run build:crazygames`

### ⚡ Scene Generator
- **CLI Tool** - Generate new scenes in seconds: `npm run generate:scene`
- **4 Pre-built Templates** - Basic, Menu, Gameplay, and Transition scenes
- Interactive prompts for quick scene creation

### 🎨 UI Component Library
- **Button, Panel, ProgressBar** - Production-ready UI components
- **UIBuilder** - Fluent API for rapid UI construction
- **Theme System** - Consistent styling across your game
- Built-in hover effects and animations

### 🎬 Animation System
- **Tween Presets** - 15+ pre-built animations (fade, slide, bounce, shake, etc.)
- **AnimationManager** - Centralized sprite animation management
- Easy-to-use fluent APIs

### 🌍 Localization System
- **TextManager** - Centralized text and language management
- **3 Languages Included** - English, Spanish, French (easily extensible)
- **Text Styles** - Predefined typography styles
- Automatic localStorage persistence

### 🔧 Modern Foundation
- **Webpack 5.104.1** - Latest build tooling with filesystem caching
- **Asset Modules** - No more deprecated loaders
- **Enhanced DevServer** - Better HMR and faster rebuilds
- **0 Security Vulnerabilities** - All dependencies updated and audited

---

## Versions

This template uses:

- [Phaser 3.90.0](https://github.com/phaserjs/phaser)
- [Webpack 5.104.1](https://github.com/webpack/webpack)
- [Babel 7.28.6](https://babeljs.io/)

---

## Requirements

[Node.js](https://nodejs.org) **version 18.12.0 or higher** is required to install dependencies and run scripts via `npm`.

This template has been tested with Node 18 LTS and Node 20 LTS.

---

## Quick Start

```bash
# Clone this repository
git clone https://github.com/phaserjs/template-webpack.git my-game

# Navigate to directory
cd my-game

# Install dependencies
npm install

# Start development server
npm run dev
```

Your game will open at `http://localhost:8080` with hot module replacement enabled!

---

## Available Commands

### Development
| Command | Description |
|---------|-------------|
| `npm run dev` | Launch dev server with analytics |
| `npm run dev-nolog` | Launch dev server without analytics |
| `npm run preview` | Preview production build locally |

### Building
| Command | Description |
|---------|-------------|
| `npm run build` | Create production build for web |
| `npm run build-nolog` | Production build without analytics |
| `npm run build:poki` | Build for Poki platform |
| `npm run build:crazygames` | Build for CrazyGames platform |
| `npm run build:all-portals` | Build for all portals |

### Generators
| Command | Description |
|---------|-------------|
| `npm run generate:scene` | Generate a new scene from templates |

---

## New Features Guide

### 1. Portal SDK Integration

Deploy your game to Poki or CrazyGames with platform-specific builds:

```javascript
import PortalManager from './scripts/adapters/portals/portalManager';

// In your Boot scene
await PortalManager.init();

// When gameplay starts
PortalManager.gameplayStart();

// Show an ad between levels
await PortalManager.showAd();

// Show rewarded ad
const granted = await PortalManager.showRewardedAd();
if (granted) {
    // Give player reward
}
```

**Platform Detection**: Automatically detects Poki, CrazyGames, or standalone web.

### 2. Scene Generator

Create new scenes instantly with the interactive CLI:

```bash
npm run generate:scene
```

Or use command-line arguments:

```bash
npm run generate:scene -- --name=Level1 --type=gameplay
```

**Available Templates**:
- `basic` - Simple scene with preload, create, update
- `menu` - Menu scene with UI elements and interactions
- `gameplay` - Full gameplay scene with physics, input, score tracking
- `transition` - Transition scene with fade/slide effects

### 3. UI Components

Build beautiful interfaces quickly:

```javascript
import Button from './ui/components/Button';
import Panel from './ui/components/Panel';
import ProgressBar from './ui/components/ProgressBar';
import UIBuilder from './ui/UIBuilder';

// Create a button
const playButton = new Button(this, 400, 300, 'Play', {
    backgroundColor: 0x4a90e2,
    width: 200,
    height: 60
});

playButton.onClick(() => {
    this.scene.start('Game');
});

// Create a panel
const settingsPanel = new Panel(this, 400, 300, {
    width: 500,
    height: 400,
    title: 'Settings'
});

settingsPanel.show('top'); // Slide in from top

// Create a progress bar
const healthBar = new ProgressBar(this, 100, 50, {
    width: 200,
    height: 20,
    fillColor: 0x00ff00
});

healthBar.setValue(0.75); // 75% health

// Use UIBuilder for rapid development
const ui = new UIBuilder(this);
ui.button(400, 300, 'Start')
  .onClick(() => this.startGame());
```

### 4. Animation Presets

Use pre-built animations for common effects:

```javascript
import { tweenPresets } from './animations/presets/tweenPresets';

// Fade in a sprite
tweenPresets.fadeIn(this, sprite, 500);

// Button press effect
tweenPresets.buttonPress(this, button);

// Shake effect
tweenPresets.shake(this, object, 10, 200);

// Slide in from left
tweenPresets.slideIn(this, panel, 'left', 500);

// Bounce effect
tweenPresets.bounce(this, sprite, 20, 500);

// Float/hover effect
tweenPresets.float(this, sprite, 10, 2000);
```

**15+ Presets Available**: fadeIn, fadeOut, scalePulse, pulse, shake, bounce, float, buttonPress, slideIn, slideOut, elastic, rotate, glow, and more!

### 5. Localization

Manage text and translations easily:

```javascript
import TextManager from './config/text/TextManager';

// Initialize in Boot scene
await TextManager.init(this, 'en');

// Get text
const title = TextManager.getText('menu.title');

// Get text with parameters
const score = TextManager.getText('game.score', 1000);
// Result: "Score: 1000"

// Create styled text
const heading = TextManager.createText(
    this, 400, 300,
    'menu.title',
    'heading'
);

// Change language
await TextManager.setLanguage(this, 'es'); // Spanish
await TextManager.setLanguage(this, 'fr'); // French
```

**Languages Included**: English, Spanish, French (easily add more!)

**Text Styles**: heading, subheading, body, button, score, caption, title, hud, damage, heal, levelUp

---

## Project Structure

```
phaser3-project-template/
├── src/
│   ├── main.js                          # Bootstrap
│   ├── game/
│   │   ├── main.js                      # Game config & init
│   │   ├── scenes/                      # Game scenes
│   │   ├── animations/                  # Animation system
│   │   │   ├── AnimationManager.js
│   │   │   ├── definitions/
│   │   │   └── presets/
│   │   │       └── tweenPresets.js
│   │   ├── ui/                          # UI components
│   │   │   ├── components/
│   │   │   │   ├── Button.js
│   │   │   │   ├── Panel.js
│   │   │   │   └── ProgressBar.js
│   │   │   ├── themes/
│   │   │   │   └── defaultTheme.js
│   │   │   └── UIBuilder.js
│   │   ├── config/                      # Configuration
│   │   │   └── text/
│   │   │       ├── TextManager.js
│   │   │       ├── textStyles.js
│   │   │       └── languages/
│   │   │           ├── en.json
│   │   │           ├── es.json
│   │   │           └── fr.json
│   │   └── managers/
│   ├── scripts/
│   │   └── adapters/
│   │       ├── poki/                    # Poki SDK
│   │       ├── crazygames/              # CrazyGames SDK
│   │       └── portals/
│   │           └── portalManager.js
│   └── assets/
├── tools/                               # Development tools
│   ├── generators/
│   │   └── scene-generator.js
│   └── templates/
│       └── scenes/
├── webpack/
│   ├── config.js                        # Dev config
│   ├── config.prod.js                   # Production config
│   ├── config.poki.js                   # Poki build
│   └── config.crazygames.js             # CrazyGames build
├── public/
│   ├── assets/
│   ├── index.html
│   └── style.css
├── package.json
└── README.md
```

---

## Example: Building a Complete Game

Here's how to use all the features together:

```javascript
// Boot.js - Initialize systems
import PortalManager from '../scripts/adapters/portals/portalManager';
import TextManager from './config/text/TextManager';

export default class Boot extends Scene {
    async create() {
        // Initialize portal SDK
        await PortalManager.init();

        // Initialize text system
        await TextManager.init(this, 'en');

        // Start preloader
        this.scene.start('Preloader');
    }
}

// MainMenu.js - Build UI
import UIBuilder from './ui/UIBuilder';
import TextManager from './config/text/TextManager';
import { tweenPresets } from './animations/presets/tweenPresets';

export default class MainMenu extends Scene {
    create() {
        const ui = new UIBuilder(this);

        // Title
        const title = TextManager.createText(
            this, 400, 150,
            'menu.title',
            'title'
        );
        ui.center(title, 'horizontal');
        tweenPresets.pulse(this, title, 1.05, 2000);

        // Play button
        const playBtn = ui.button(400, 300,
            TextManager.getText('menu.play')
        );
        playBtn.onClick(() => {
            PortalManager.gameplayStart();
            this.scene.start('Game');
        });

        // Settings button
        const settingsBtn = ui.button(400, 400,
            TextManager.getText('menu.settings')
        );
        settingsBtn.onClick(() => {
            this.scene.start('Settings');
        });

        // Animate buttons in
        tweenPresets.slideIn(this, playBtn, 'left', 500);
        tweenPresets.slideIn(this, settingsBtn, 'right', 500);
    }
}

// Game.js - Use all features
import ProgressBar from './ui/components/ProgressBar';
import TextManager from './config/text/TextManager';
import PortalManager from '../scripts/adapters/portals/portalManager';

export default class Game extends Scene {
    create() {
        // Health bar
        this.healthBar = new ProgressBar(this, 100, 30, {
            width: 200,
            height: 20,
            fillColor: 0x00ff00
        });

        // Score
        this.score = 0;
        this.scoreText = TextManager.createText(
            this, 16, 16,
            'game.score',
            'score'
        );
        this.updateScore();
    }

    updateScore() {
        const text = TextManager.getText('game.score', this.score);
        this.scoreText.setText(text);
    }

    async levelComplete() {
        PortalManager.gameplayStop();

        // Show ad between levels
        await PortalManager.showAd();

        this.scene.start('NextLevel');
    }
}
```

### 6. Responsive System

The template includes a comprehensive responsive system for adaptive layouts across different screen sizes and orientations.

**Features**:
- Automatic screen resize handling
- Alignment-based positioning (9 semantic alignments)
- Orientation detection (portrait/landscape)
- Safe area support for mobile devices
- Auto-repositioning of UI elements

**Quick Start**:

```javascript
import ResponsiveManager from './managers/ResponsiveManager';
import UIBuilder from './ui/UIBuilder';

create() {
    // Initialize responsive manager
    ResponsiveManager.init(this);

    const ui = new UIBuilder(this);

    // Alignment-based positioning
    ui.buttonAt('center', 'Play', { x: 0, y: 0 })
        .onClick(() => this.scene.start('Game'));

    ui.textAt('top-center', 'Game Title', { x: 0, y: 40 }, 'heading');

    ui.panelAt('bottom-right', { x: 20, y: 20 }, {
        width: 300,
        height: 200
    });

    // Setup resize listener
    this.scale.on('resize', this.onResize, this);
}

onResize(gameSize) {
    // ResponsiveManager auto-updates tracked elements
}

shutdown() {
    this.scale.off('resize', this.onResize, this);
}
```

**Available Alignments**:
- `top-left`, `top-center`, `top-right`
- `center-left`, `center`, `center-right`
- `bottom-left`, `bottom-center`, `bottom-right`

**Margin**: Use `{ x: 20, y: 20 }` or single number `20` for uniform margin.

**ResponsiveManager API**:

```javascript
// Get position for alignment
const pos = ResponsiveManager.getAlignmentPosition('top-right', { x: 20, y: 20 });

// Track element for auto-repositioning
ResponsiveManager.trackElement(button, 'center', { x: 0, y: 0 });

// Orientation checks
if (ResponsiveManager.isPortrait()) {
    // Portrait-specific layout
}

// Get safe area (mobile notches)
const safe = ResponsiveManager.getSafeArea();

// Scale value based on screen
const spacing = ResponsiveManager.scale(20);
```

**UIBuilder with Responsive Methods**:

```javascript
const ui = new UIBuilder(this);

// Create with alignments
ui.buttonAt('top-right', 'Settings', { x: 20, y: 20 });
ui.textAt('bottom-center', 'Score: 0', { x: 0, y: -50 }, 'score');
ui.panelAt('center', { x: 0, y: 0 }, { width: 400 });

// Position existing element
ui.positionAt(existingSprite, 'center-left', 40);
```

**UI Components with Alignment**:

All UI components (Button, Panel, ProgressBar) support alignment configuration:

```javascript
// Button with alignment
const button = new Button(this, 0, 0, 'Play', {
    alignment: 'center',
    margin: { x: 0, y: 50 },
    autoReposition: true  // Auto-track with ResponsiveManager
});

// Update alignment dynamically
button.setAlignment('bottom-right', { x: 20, y: 20 });
```

**Game Configuration**:

The template is configured with responsive scale settings in `src/game/main.js`:

```javascript
scale: {
    mode: Phaser.Scale.FIT,  // Maintains aspect ratio
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 1024,
    height: 768,
    min: { width: 320, height: 240 },
    max: { width: 2048, height: 1536 },
    autoRound: true
}
```

**Scale Mode Options**:
- `FIT` - Maintains aspect ratio, may show letterboxing (recommended for most games)
- `ENVELOP` - Fills entire screen, may crop content
- `RESIZE` - Game canvas resizes to container (most responsive, requires careful layout)

---

## Writing Code

After cloning and running `npm install`, start the development server with `npm run dev`.

The server runs on `http://localhost:8080` with hot module replacement - edit any file in `src/` and see changes instantly!

### Webpack Features

- **Asset Modules**: Images, fonts, and shaders loaded automatically
- **Filesystem Caching**: Rebuilds are 90% faster after first build
- **Source Maps**: Full debugging support in development
- **Terser Optimization**: Minified, tree-shaken production builds
- **Modern Browserslist**: Targets modern browsers (configurable in `.browserslistrc`)

---

## Deploying to Portals

### Poki

```bash
npm run build:poki
```

Upload the `dist/poki/` folder to Poki's developer portal.

### CrazyGames

```bash
npm run build:crazygames
```

Upload the `dist/crazygames/` folder to CrazyGames developer portal.

### Both Platforms

```bash
npm run build:all-portals
```

Creates builds for both platforms in their respective folders.

---

## Customization

### Adding New Languages

1. Create a new language file: `src/game/config/text/languages/de.json`
2. Copy structure from `en.json` and translate
3. Load in your game: `TextManager.setLanguage(this, 'de')`

### Creating Custom UI Components

Extend base Phaser GameObjects:

```javascript
import { tweenPresets } from '../animations/presets/tweenPresets';

export default class CustomComponent extends Phaser.GameObjects.Container {
    constructor(scene, x, y, config) {
        super(scene, x, y);

        // Your component code

        scene.add.existing(this);
    }
}
```

### Adding More Portals

1. Create SDK adapter in `src/scripts/adapters/yourportal/`
2. Add to PortalManager detection
3. Create webpack config: `webpack/config.yourportal.js`
4. Add npm script to `package.json`

---

## About log.js

The `log.js` file is used to send anonymous usage data to Phaser for analytics. You can disable this by using the `-nolog` commands or removing the `node log.js` calls from `package.json`.

---

## Join the Phaser Community

We love to see what developers like you create with Phaser! Join us:

- Website: [phaser.io](https://phaser.io)
- Discord: [discord.gg/phaser](https://discord.gg/phaser)
- Forum: [phaser.discourse.group](https://phaser.discourse.group)
- Newsletter: [phaser.io/newsletter](https://phaser.io/newsletter)

---

## License

MIT License - see LICENSE file for details.

---

## Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

---

## Credits

Created and maintained by [Phaser Studio](https://phaser.io)

Extended features (v3.4.0) by Claude Code

---

🎮 **Happy Game Development!**

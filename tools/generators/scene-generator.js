#!/usr/bin/env node

/**
 * Scene Generator CLI
 * Generates new Phaser 3 scenes from templates
 *
 * Usage:
 *   npm run generate:scene -- --name=MyScene --type=basic
 *   npm run generate:scene -- --name=Level1 --type=gameplay
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const SCENE_TYPES = {
    basic: 'BasicScene',
    menu: 'MenuScene',
    gameplay: 'GameplayScene',
    transition: 'TransitionScene'
};

const SCENE_DIR = path.join(process.cwd(), 'src', 'game', 'scenes');
const TEMPLATE_DIR = path.join(__dirname, '..', 'templates', 'scenes');

/**
 * Parse command line arguments
 */
function parseArgs() {
    const args = process.argv.slice(2);
    const options = {};

    args.forEach(arg => {
        if (arg.startsWith('--')) {
            const [key, value] = arg.substring(2).split('=');
            options[key] = value;
        }
    });

    return options;
}

/**
 * Ask a question and return the answer
 */
function question(query) {
    return new Promise(resolve => {
        rl.question(query, resolve);
    });
}

/**
 * Validate scene name
 */
function isValidSceneName(name) {
    return /^[A-Z][a-zA-Z0-9]*$/.test(name);
}

/**
 * Load template file
 */
function loadTemplate(templateType) {
    const templatePath = path.join(TEMPLATE_DIR, `${templateType}.template.js`);

    if (!fs.existsSync(templatePath)) {
        console.error(`❌ Template not found: ${templatePath}`);
        return null;
    }

    return fs.readFileSync(templatePath, 'utf-8');
}

/**
 * Generate scene from template
 */
function generateScene(sceneName, templateType) {
    const template = loadTemplate(templateType);

    if (!template) {
        return false;
    }

    // Replace template placeholders
    const sceneContent = template
        .replace(/{{SCENE_NAME}}/g, sceneName)
        .replace(/{{SCENE_KEY}}/g, sceneName);

    // Create scene file
    const scenePath = path.join(SCENE_DIR, `${sceneName}.js`);

    if (fs.existsSync(scenePath)) {
        console.error(`❌ Scene already exists: ${scenePath}`);
        return false;
    }

    // Ensure directory exists
    if (!fs.existsSync(SCENE_DIR)) {
        fs.mkdirSync(SCENE_DIR, { recursive: true });
    }

    // Write scene file
    fs.writeFileSync(scenePath, sceneContent);
    console.log(`✅ Scene created: ${scenePath}`);

    return true;
}

/**
 * Interactive mode
 */
async function interactiveMode() {
    console.log('\n🎮 Phaser 3 Scene Generator\n');

    // Ask for scene name
    let sceneName = '';
    while (!sceneName) {
        const input = await question('Scene name (e.g., Level1, MainMenu): ');

        if (!input) {
            console.log('❌ Scene name is required');
            continue;
        }

        if (!isValidSceneName(input)) {
            console.log('❌ Scene name must start with uppercase and contain only letters and numbers');
            continue;
        }

        sceneName = input;
    }

    // Ask for scene type
    console.log('\nScene types:');
    console.log('  1. basic      - Simple scene with preload, create, update');
    console.log('  2. menu       - Menu scene with UI elements');
    console.log('  3. gameplay   - Gameplay scene with physics and input');
    console.log('  4. transition - Transition scene with effects');

    let templateType = '';
    while (!templateType) {
        const input = await question('\nSelect type (1-4 or name): ');

        const typeMap = {
            '1': 'basic',
            '2': 'menu',
            '3': 'gameplay',
            '4': 'transition',
            'basic': 'basic',
            'menu': 'menu',
            'gameplay': 'gameplay',
            'transition': 'transition'
        };

        if (typeMap[input.toLowerCase()]) {
            templateType = SCENE_TYPES[typeMap[input.toLowerCase()]];
        } else {
            console.log('❌ Invalid scene type');
        }
    }

    // Generate scene
    const success = generateScene(sceneName, templateType);

    if (success) {
        console.log('\n✨ Scene generated successfully!');
        console.log(`\nTo use your new scene, import it in your game:`);
        console.log(`  import ${sceneName} from './scenes/${sceneName}';`);
        console.log(`\nThen add it to your scene config:`);
        console.log(`  scene: [Boot, Preloader, ${sceneName}]`);
    }

    rl.close();
}

/**
 * Command line mode
 */
function commandLineMode(options) {
    const { name, type } = options;

    if (!name) {
        console.error('❌ Scene name is required. Use --name=MyScene');
        process.exit(1);
    }

    if (!isValidSceneName(name)) {
        console.error('❌ Scene name must start with uppercase and contain only letters and numbers');
        process.exit(1);
    }

    if (!type || !SCENE_TYPES[type.toLowerCase()]) {
        console.error('❌ Invalid scene type. Use: basic, menu, gameplay, or transition');
        process.exit(1);
    }

    const templateType = SCENE_TYPES[type.toLowerCase()];
    const success = generateScene(name, templateType);

    if (success) {
        console.log('✅ Scene generated successfully!');
        process.exit(0);
    } else {
        process.exit(1);
    }
}

/**
 * Main entry point
 */
function main() {
    const options = parseArgs();

    if (options.name && options.type) {
        commandLineMode(options);
    } else {
        interactiveMode();
    }
}

// Run generator
main();

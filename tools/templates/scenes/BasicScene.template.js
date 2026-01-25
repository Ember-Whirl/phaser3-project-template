import { Scene } from 'phaser';

export default class {{SCENE_NAME}} extends Scene {
    constructor() {
        super('{{SCENE_KEY}}');
    }

    preload() {
        // Load assets here
    }

    create() {
        // Initialize scene here
        console.log('{{SCENE_NAME}} created');
    }

    update(time, delta) {
        // Update logic here
    }
}

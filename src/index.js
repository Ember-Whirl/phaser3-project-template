import Phaser from 'phaser';
import BootScene from './scenes/bootScene'
import MainScene from './scenes/mainScene'
import "regenerator-runtime/runtime.js";

const config = {
    type: Phaser.AUTO,
    parent: 'phaser-example',
    width: 800,
    height: 600,
    scene: [BootScene, MainScene]
};

const game = new Phaser.Game(config);

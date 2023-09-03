import Phaser from 'phaser';
import BootScene from './scenes/bootScene'
import MainScene from './scenes/mainScene'
import "regenerator-runtime/runtime.js";

const config = {
    type: Phaser.AUTO,
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH
    },
    width: 1280,
    height: 720,
    OrientationType: 'LANDSCAPE',
    scene: [BootScene, MainScene],
    antialiasGL: false,
    parent: 'content'
};

const game = new Phaser.Game(config);

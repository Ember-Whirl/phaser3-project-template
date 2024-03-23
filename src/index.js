import Phaser from 'phaser';
import BootScene from './scenes/bootScene'
import MainScene from './scenes/mainScene'
import "regenerator-runtime/runtime.js";
import * as SpinePlugin from '../node_modules/phaser/plugins/spine/dist/SpinePlugin.js';


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
    parent: 'content',
    plugins: {
      scene: [
        {
          key: 'SpinePlugin',
          plugin: window.SpinePlugin,
          mapping: 'spine',
        }
      ]
    }
};

const game = new Phaser.Game(config);

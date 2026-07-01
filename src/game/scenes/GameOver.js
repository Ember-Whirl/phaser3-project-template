import { Scene } from 'phaser';
import ResponsiveManager from '../managers/ResponsiveManager.js';
import UIBuilder from '../ui/UIBuilder.js';

export class GameOver extends Scene
{
    constructor ()
    {
        super('GameOver');
    }

    create ()
    {
        //  Initialize responsive manager
        ResponsiveManager.init(this);

        const { width, height } = this.scale;
        const ui = new UIBuilder(this);

        this.cameras.main.setBackgroundColor(0xff0000);

        //  Background - fill entire screen
        const bg = this.add.image(width / 2, height / 2, 'background');
        bg.setAlpha(0.5);
        bg.setDisplaySize(width, height);

        //  Game Over text - centered
        const gameOverText = this.add.text(0, 0, 'Game Over', {
            fontFamily: 'Arial Black', fontSize: 64, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        });
        ui.positionAt(gameOverText, 'center', { x: 0, y: 0 });

        //  Click to continue text - positioned at bottom
        const continueText = this.add.text(0, 0, 'Click to Continue', {
            fontFamily: 'Arial', fontSize: 24, color: '#ffffff',
            align: 'center'
        });
        ui.positionAt(continueText, 'bottom-center', { x: 0, y: -50 });

        this.input.once('pointerdown', () => {
            this.scene.start('MainMenu');
        });

        //  Setup resize listener
        this.scale.on('resize', this.onResize, this);
    }

    onResize (gameSize)
    {
        //  ResponsiveManager auto-updates tracked elements
    }

    shutdown ()
    {
        //  Clean up resize listener
        this.scale.off('resize', this.onResize, this);
    }
}

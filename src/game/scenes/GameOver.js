import { Scene } from 'phaser';
import ResponsiveManager from '../managers/ResponsiveManager.js';
import UIBuilder from '../ui/UIBuilder.js';
import PortalManager from '../../scripts/adapters/portals/portalManager';

export class GameOver extends Scene
{
    constructor ()
    {
        super('GameOver');
    }

    create ()
    {
        PortalManager.gameplayStop();

        //  Initialize responsive manager
        ResponsiveManager.init(this);

        const { width, height } = this.scale;
        const ui = new UIBuilder(this);

        this.cameras.main.setBackgroundColor(0xff0000);

        //  Background - fill entire screen
        this.bg = this.add.image(width / 2, height / 2, 'background');
        this.bg.setAlpha(0.5);
        this.bg.setDisplaySize(width, height);

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
        this.events.on('shutdown', this.shutdown, this);
    }

    onResize (gameSize)
    {
        if (!this.scene.isActive('GameOver')) return;
        const { width, height } = gameSize;

        //  Resize background to fill new dimensions
        if (this.bg) {
            this.bg.setPosition(width / 2, height / 2);
            this.bg.setDisplaySize(width, height);
        }

        //  ResponsiveManager auto-updates tracked elements (text)
    }

    shutdown ()
    {
        //  Clean up resize listener
        this.scale.off('resize', this.onResize, this);
    }
}

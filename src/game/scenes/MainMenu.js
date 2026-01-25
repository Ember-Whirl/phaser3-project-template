import { Scene } from 'phaser';
import ResponsiveManager from '../managers/ResponsiveManager.js';
import UIBuilder from '../ui/UIBuilder.js';

export class MainMenu extends Scene
{
    constructor ()
    {
        super('MainMenu');
    }

    create ()
    {
        //  Initialize responsive manager
        ResponsiveManager.init(this);

        const { width, height } = this.scale;
        const ui = new UIBuilder(this);

        //  Background - fill entire screen
        const bg = this.add.image(width / 2, height / 2, 'background');
        bg.setDisplaySize(width, height);

        //  Logo - positioned at top-center with margin
        const logo = this.add.image(0, 0, 'logo');
        ui.positionAt(logo, 'top-center', { x: 0, y: 80 });

        //  Title text - positioned below logo
        const titleText = this.add.text(0, 0, 'Main Menu', {
            fontFamily: 'Arial Black', fontSize: 38, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        });
        ui.positionAt(titleText, 'center', { x: 0, y: 0 });

        //  Click to start text - positioned at bottom
        const startText = this.add.text(0, 0, 'Click to Start', {
            fontFamily: 'Arial', fontSize: 24, color: '#ffffff',
            align: 'center'
        });
        ui.positionAt(startText, 'bottom-center', { x: 0, y: -50 });

        this.input.once('pointerdown', () => {
            this.scene.start('Game');
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

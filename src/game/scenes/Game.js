import { Scene } from 'phaser';
import ResponsiveManager from '../managers/ResponsiveManager.js';
import UIBuilder from '../ui/UIBuilder.js';

export class Game extends Scene
{
    constructor ()
    {
        super('Game');
    }

    create ()
    {
        //  Initialize responsive manager
        ResponsiveManager.init(this);

        const { width, height } = this.scale;
        const ui = new UIBuilder(this);

        this.cameras.main.setBackgroundColor(0x00ff00);

        //  Background - fill entire screen
        const bg = this.add.image(width / 2, height / 2, 'background');
        bg.setAlpha(0.5);
        bg.setDisplaySize(width, height);

        //  Game text - centered
        const gameText = this.add.text(0, 0, 'Make something fun!\nand share it with us:\nsupport@phaser.io', {
            fontFamily: 'Arial Black', fontSize: 38, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        });
        ui.positionAt(gameText, 'center', { x: 300, y: 0 });

        this.input.once('pointerdown', () => {
            this.scene.start('GameOver');
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

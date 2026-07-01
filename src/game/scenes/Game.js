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

        //  Example: Using images/sprites from your folders
        //  Just specify the folder name and image filename (without extension)
        //
        //  If you have: src/assets/images-source/characters/player.png
        //  Use: this.addSprite('characters', 'player')
        //
        //  Examples (uncomment when you have the assets):
        //
        //  const player = this.addSprite('characters', 'player');
        //  player.setPosition(400, 300);
        //
        //  const enemy = this.addSprite('enemies', 'enemy1');
        //  enemy.setPosition(500, 300);
        //
        //  const button = this.addSprite('ui', 'button');
        //  button.setPosition(100, 100);

        this.input.once('pointerdown', () => {
            this.scene.start('GameOver');
        });

        //  Setup resize listener
        this.scale.on('resize', this.onResize, this);
    }

    /**
     * Check if we're in production mode
     */
    isProduction ()
    {
        return process.env.NODE_ENV === 'production';
    }

    /**
     * Helper method to add sprite/image that works in both dev and production
     * @param {string} folder - Folder name (e.g., 'characters', 'enemies', 'ui')
     * @param {string} imageName - Image filename without extension (e.g., 'player', 'enemy1')
     * @returns {Phaser.GameObjects.Image}
     */
    addSprite (folder, imageName)
    {
        return this.isProduction()
            ? this.add.image(0, 0, folder, imageName)  // Atlas: folder is atlas key, imageName is frame
            : this.add.image(0, 0, imageName);         // Individual: imageName is the loaded image key
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

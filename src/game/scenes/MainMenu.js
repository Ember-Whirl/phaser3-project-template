import { Scene } from 'phaser';
import ResponsiveManager from '../managers/ResponsiveManager.js';
import UIBuilder from '../ui/UIBuilder.js';
import Button from '../ui/components/Button.js';

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

        //  Button Test button
        const buttonTestBtn = new Button(this, width / 2, height / 2 + 60, 'Button Test', {
            width: 250,
            height: 60,
            backgroundColor: 0x4a90e2,
            hoverColor: 0x5aa0f2,
            pressedColor: 0x3a80d2,
            fontSize: '28px'
        });

        buttonTestBtn.onClick(() => {
            this.scene.start('ButtonTest');
        });

        //  Main game button
        const playButton = new Button(this, width / 2, height / 2 + 140, 'Play Game', {
            width: 250,
            height: 60,
            backgroundColor: 0x4caf50,
            hoverColor: 0x5cbf60,
            pressedColor: 0x3c9f40,
            fontSize: '28px'
        });

        playButton.onClick(() => {
            this.scene.start('Game');
        });

        //  UI Tests button
        const uiTestsButton = new Button(this, width / 2, height / 2 + 220, 'UI Tests', {
            width: 250,
            height: 60,
            backgroundColor: 0x9b59b6,
            hoverColor: 0xab69c6,
            pressedColor: 0x8b49a6,
            fontSize: '28px'
        });

        uiTestsButton.onClick(() => {
            this.scene.start('UITestButtons');
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

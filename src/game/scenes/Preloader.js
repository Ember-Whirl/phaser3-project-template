import { Scene } from 'phaser';
import ResponsiveManager from '../managers/ResponsiveManager.js';
import ProgressBar from '../ui/components/ProgressBar.js';

export class Preloader extends Scene
{
    constructor ()
    {
        super('Preloader');
    }

    init ()
    {
        //  Initialize responsive manager
        ResponsiveManager.init(this);

        const { width, height } = this.scale;

        //  We loaded this image in our Boot Scene, so we can display it here
        const bg = this.add.image(width / 2, height / 2, 'background');
        bg.setDisplaySize(width, height);

        //  Create progress bar using ProgressBar component
        const barWidth = Math.min(468, width - 100);
        this.progressBar = new ProgressBar(this, width / 2, height / 2, {
            width: barWidth,
            height: 32,
            fillColor: 0xffffff,
            backgroundColor: 0x222222,
            showLabel: true,
            labelFormat: 'percent'
        });

        //  Track progress bar for auto-repositioning
        ResponsiveManager.trackElement(this.progressBar, 'center', { x: 0, y: 0 });

        //  Use the 'progress' event emitted by the LoaderPlugin to update the loading bar
        this.load.on('progress', (progress) => {
            this.progressBar.setValue(progress, true);
        });

        //  Setup resize listener
        this.scale.on('resize', this.onResize, this);
    }

    preload ()
    {
        //  Load the assets for the game - Replace with your own assets
        this.load.setPath('assets');

        this.load.image('logo', 'logo.png');
    }

    create ()
    {
        //  When all the assets have loaded, it's often worth creating global objects here that the rest of the game can use.
        //  For example, you can define global animations here, so we can use them in other scenes.

        //  Move to the MainMenu. You could also swap this for a Scene Transition, such as a camera fade.
        this.scene.start('MainMenu');
    }

    onResize (gameSize)
    {
        //  ResponsiveManager auto-updates tracked elements
        //  Add custom resize logic here if needed
    }

    shutdown ()
    {
        //  Clean up resize listener
        this.scale.off('resize', this.onResize, this);
    }
}

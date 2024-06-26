import ApiAdapter from "../scripts/adapter/apiAdapter";

export default class BootScene extends Phaser.Scene {
constructor () {
    super('BootScene');
}

preload () {
  this.load.image('background', 'src/assets/background.png');

  this.load.setPath('src/assets/spines')
  this.load.spine('skeleton', 'skeleton.json', ['skeleton.atlas'], true)

  
  this.load.on('complete', (loader, totalComplete, totalFailed) => {
    this.onLoadComplete(loader, totalComplete, totalFailed);
  }, this);
}
  
async onLoadComplete (loader, totalComplete, totalFailed) {
  console.log('COMPLETE: totalComplete:', totalComplete, ', totalFailed:', totalFailed);
  await ApiAdapter.instance.startGameAsync(this);
}

create () {
    const logo = this.add.image(400, 150, 'logo');
      
        this.tweens.add({
            targets: logo,
            y: 450,
            duration: 2000,
            ease: "Power2",
            yoyo: true,
            loop: -1
        });
    }
}
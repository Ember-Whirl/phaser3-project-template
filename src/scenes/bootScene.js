import ApiAdapter from "../scripts/adapter/apiAdapter";

export default class BootScene extends Phaser.Scene {
constructor () {
    super('BootScene');
}

preload () {
  this.load.image('background', 'src/assets/background.png');
  this.load.image('circle', 'src/assets/circle.png');
  this.load.image('square', 'src/assets/square.png');
  this.load.image('castle', 'src/assets/Castle.png')
  this.load.image('slime0', 'src/assets/slime-0.png')
  this.load.image('slime1', 'src/assets/slime-1.png')
  this.load.image('warrior0', 'src/assets/warrior-0.png')
  this.load.image('warrior1', 'src/assets/warrior-1.png')
  this.load.image('warrior2', 'src/assets/warrior-2.png')
  this.load.image('warrior3', 'src/assets/warrior-3.png')
  this.load.image('warrior4', 'src/assets/warrior-4.png')
  this.load.image('warrior5', 'src/assets/warrior-5.png')
  this.load.image('warrior6', 'src/assets/warrior-6.png')
  this.load.image('warrior7', 'src/assets/warrior-7.png')

  this.load.json('enemyWaves', 'src/assets/json/enemyWaves.json');
  this.load.json('enemyTypes', 'src/assets/json/enemyTypes.json');
  this.load.json('warriorTypes', 'src/assets/json/warriorTypes.json');

  this.load.atlas('atlas-ui', 'src/assets/atlas/atlas-ui.png', 'src/assets/atlas/atlas-ui.json')

  this.load.setPath('src/assets/spines')
  this.load.spine('skeleton', 'skeleton.json', ['skeleton.atlas'], true)

  this.load.setPath('src/assets/spines/warrior')
  this.load.spine('warrior', 'warrior.json', ['warrior.atlas'], true)

  this.load.setPath('src/assets/spines/slime')
  this.load.spine('slime', 'Slime.json', ['Slime.atlas'], true)

  this.load.setPath('src/assets/spines/fx/merge')
  this.load.spine('merge', 'MergeFX.json', ['MergeFX.atlas'], true)

  
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
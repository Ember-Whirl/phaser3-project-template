import { ETextStyle } from "./ETextStyles";

export default class Text extends Phaser.GameObjects.Text {
  constructor(scene, x, y, text, style = ETextStyle.DEFAULT) {
    super(scene, x, y, text, style);

    this.setOrigin(0.5, 0.5);
  }
}
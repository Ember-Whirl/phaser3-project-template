import Singleton from "../../singleton";

export default class DimensionManager extends Singleton {
  constructor() {
    super();
  }
  init(scene) {
    this.scene = scene;
    this._setDimensions();
  }

  _onResize() {
    this._setDimensions();
  }

  _setDimensions() {
    this.width = this.scene.sys.game.scale.gameSize.width;
    this.height = this.scene.sys.game.scale.gameSize.height;

    this.center = { x: this.width / 2, y: this.height / 2 };
    this.left = { x: this.center.x - this.width / 2, y: this.height / 2 };
    this.topLeft = { x: this.center.x - this.width / 2, y: this.center.y - this.height / 2 };
    this.top = { x: this.width / 2, y: this.center.y - this.height / 2 };
    this.topRight = { x: this.center.x + this.width / 2, y: this.center.y - this.height / 2 };
    this.right = { x: this.center.x + this.width / 2, y: this.height / 2 };
    this.bottomLeft = { x: this.center.x - this.width / 2, y: this.center.y + this.height / 2 };
    this.bottom = { x: this.width / 2, y: this.center.y + this.height / 2 };
    this.bottomRight = { x: this.center.x + this.width / 2, y: this.center.y + this.height / 2 };
  }

}
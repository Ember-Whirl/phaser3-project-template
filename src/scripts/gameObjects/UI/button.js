import { GameObjects } from 'phaser';
import Text from '../../text';
import { ETextStyle } from '../../ETextStyles';

export default class Button extends GameObjects.Container {
  constructor(scene, x, y, atlasKey, enabledKey, disabledKey, pressedKey, text) {
    super(scene, x, y);
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.enabledKey = enabledKey;
    this.disabledKey = disabledKey
    this.pressedKey = pressedKey
    this.textString = text;
    this.createButtonImage(atlasKey, enabledKey);
    this._initialze();
    if (this.textString) {
      this._createText();
    }

    this.clickTime = 750;
  }

  createButtonImage(atlasKey, imageKey) {
    this.buttonImage = new GameObjects.Sprite(this.scene, 0, 0, atlasKey, imageKey);
    this.add(this.buttonImage);
  }

  setText(text) {
    this.text.setText(text);
  }

  setVisible(bool) {
    super.setVisible(bool);
    if (this.text) this.text.visible = bool;
  }

  setScale(value1, value2) {
    super.setScale(value1, value2);
    if (this.text) this.text.setScale(value1, value2);
  }

  _createText() {
    this.text = new Text(this.scene, 0, 0, this.textString, ETextStyle.BUTTON_BLACK)
      .setOrigin(0.5);
    this.add(this.text);
  }

  _initialze() {
    this.buttonImage.setInteractive();
    this.onDownTime = performance.now();

    this.states = Object.freeze({
      disabled: 0,
      enabled: 1,
      pressed: 2,
      cooldown: 3,
    });

    this.buttonEmitter = new Phaser.Events.EventEmitter();
    /* this.buttonEmitter.on('onUp', this._onUp);
    this.buttonEmitter.on('onDown', this._onDown); */
    this.buttonEmitter.on('onClick', this.onClick, this);
    this.onOver = false;

    this.buttonImage.on('pointerup', () => {
      this._onUp();
    }).on('pointerover', () => {
      this.onOver = true;
    }).on('pointerout', () => {
      this.onOver = false;
    }).on('pointerdown', () => {
      this._onDown();
    });

    this._currentState('enabled');
  }

  onClick() {

  }

  onDown() {

  }

  _onDown() {
    if (this.currentState !== this.states.enabled) return;
    this._currentState('pressed');
    this.onDownTime = performance.now();
    this.buttonEmitter.emit('onDown');
    this.onDown();
  }

  _onUp(args) {
    if (this.currentState !== this.states.pressed) return;
    if (!this.onOver) {
      this._currentState('enabled');
      return;
    }
    this._currentState('enabled');
    if (performance.now() - this.onDownTime < this.clickTime) {
      this.buttonEmitter.emit('onClick');
    }
  }

  _currentState(state) {
    switch (state) {
      case 'disabled':
        this.currentState = this.states.disabled;
        this.buttonImage.setFrame(this.disabledKey);
        break;
      case 'enabled':
        this.currentState = this.states.enabled;
        this.buttonImage.setFrame(this.enabledKey);
        break;
      case 'pressed':
        this.currentState = this.states.pressed;
        this.buttonImage.setFrame(this.pressedKey);
        break;
      case 'cooldown':
        this.currentState = this.states.cooldown;
        this.buttonImage.setFrame(this.enabledKey);
        break;
      default:
      // new Error(`State can only be disabled | enabled | pressed | cooldown. ${state} is not available`);
    }
  }

  switchState(newState) {
    this._currentState(newState)
  }
}
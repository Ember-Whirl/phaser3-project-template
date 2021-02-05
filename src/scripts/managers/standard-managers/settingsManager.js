import Singleton from "../utilities/singleton";
import DataManager from "./dataManager";
//import SoundManager from "./soundManager";

export default class SettingsManager extends Singleton {
  constructor() {
    super(game);  
    this.settings = {};
  }

  setSFX(bool, saveToData) {
    return;
    this.settings.soundOn = bool;
    (this.settings.soundOn) ? SoundManager.instance.enableSFX() : SoundManager.instance.disableSFX();
    if (saveToData) this._saveSettings();
  }

  setBGM(bool, saveToData) {
    return;
    this.settings.musicOn = bool;
    (this.settings.musicOn) ? SoundManager.instance.enableBGM() : SoundManager.instance.disableBGM();
    if (saveToData) this._saveSettings();
  }
  
  setSettings(settingsObj) {
    this.settings = settingsObj;
    return;
    this.setSFX(this.settings.soundOn, false);
    this.setBGM(this.settings.musicOn, false);
  }

  _saveSettings() {
    DataManager.instance.playerData.settings = this.settings;
    DataManager.instance.saveAllDataAsync();
  }
}
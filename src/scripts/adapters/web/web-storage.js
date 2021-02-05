import Singleton from "../../utilities/singleton";

export default class WebStorage extends Singleton{
  constructor() {
    super();
  }

  async getItems(keys) {
    var data = {};
    for (let k = 0; k < keys.length; k++) {
      const key = keys[k];
      data[key] = JSON.parse(localStorage.getItem(key));
    }
    return data;
  }

  async setItems(data) {    
    for (let k = 0; k < Object.keys(data).length; k++) {
      const key = Object.keys(data)[k];
      localStorage.setItem(key, data[key]);
    }
  }
}
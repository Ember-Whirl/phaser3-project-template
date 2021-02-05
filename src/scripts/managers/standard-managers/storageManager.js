// get item
// set item
// get lenght
// save all

import Singleton from "../../singleton";


// parse data
export default class StorageManager extends Singleton {
  constructor() {
    super();
  }

  setStorageManager(manager) {
    this.currentLocalStorage = manager;
  }

  setDataSet(data) {

  }

  async setItems(data) {
    if (typeof this.currentLocalStorage === 'undefined') return console.error('This should not happen, please specify a storage in apiAdapter');
    await this.currentLocalStorage.setItems(data);
    return
  }

  async getItems(keys) {
    if (typeof this.currentLocalStorage === 'undefined') return console.error('This should not happen, please specify a storage in apiAdapter');
    var data = {};
    data = await this.currentLocalStorage.getItems(keys);
    return data;
  }

  removeItem(key) {
    localStorage.removeItem(key);
  }

  clear() {
    localStorage.clear();
  }

  length() {
    return localStorage.length;
  }

  key() {

  }
  
  error() {

  }
}
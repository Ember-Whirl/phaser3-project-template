const singleton = Symbol('singleton');

export default class Singleton {
  /**
   * Return the instance of the singleton.
   * @returns {*} Return the instance.
   */
  static get instance() {
    if (!this[singleton]) {
      this[singleton] = new this();
    }

    return this[singleton];
  }

  constructor() {
    const Class = this.constructor;

    if (!Class[singleton]) {
      Class[singleton] = this;
    }

    return Class[singleton];
  }
}
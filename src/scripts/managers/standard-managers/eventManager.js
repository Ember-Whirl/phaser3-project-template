import Singleton from "../../singleton";


export default class EventManager extends Singleton {
  constructor() {
    super()
    this._events = {}

    this.emitter = new Phaser.Events.EventEmitter();
  }

  createEvent(eventName) {
    if (this.checkIfExists(eventName)) return console.warn('Event with name: ' + eventName + ' not made, it already exists')

    this._events[eventName] = new Phaser.Events.EventEmitter()
    return this._events[eventName]
  }

  dispatch(eventName, ...params) {
    let event = this.getEvent(eventName)
    event.emit(event, ...params)
    return event
  }

  add(eventName, callback, context) {
    let event = this.getEvent(eventName)
    event.addListener(event, callback, context)
    const binding = this.emitter._events[0]
    return binding
  }

  addOnce(eventName, callback, context) {
    let event = this.getEvent(eventName)
    event.once(event, callback, context)
  }

  remove(eventName, callback, context) {
    let event = this.getEvent(eventName)
    event.off(event, callback, context)
  }

  getEvent(eventName) {
    let event = this._events[eventName]
    if (typeof event === 'undefined') {
      event = this.createEvent(eventName)
    }

    return event
  }

  checkIfExists(eventName) {
    return typeof this._events[eventName] !== 'undefined'
  }
}
import Singleton from '../utilities/singleton'
import StorageManager from '../gameUtilities/storageManager'
import SettingsManager from './settingsManager'

export default class DataManager extends Singleton {
  constructor () {
    super()
    this.playerData = {}
    this.dataInitialized = false
    this.basicData = game.cache.getJSON('basic-data')
  }

  async initializeData () {
    this.currentData = {}
    this.currentData = await StorageManager.instance.getItems(Object.keys(this.basicData))
    console.log(this.basicData)
    console.log(JSON.parse(JSON.stringify(this.currentData)))
    this.currentData = this.validateStorageData(this.currentData)
    console.log(JSON.parse(JSON.stringify(this.currentData)))
    this.playerData = this.currentData
    this.playerData.playerStats.totalLogins += 1

    // Save validated data
    const data = this.stringifyDataObject(this.playerData)
    await StorageManager.instance.setItems(data)

    SettingsManager.instance.setSettings(this.playerData.settings)
    this.dataInitialized = true
    return this.currentData
  }

  async saveAllDataAsync () {
    var data = this.stringifyDataObject(this.playerData)
    await StorageManager.instance.setItems(data)
  }

  stringifyDataObject (dataObject) {
    var data = {}
    for (let key in dataObject) {
      let val = (typeof this.playerData[key] === 'String')
        ? dataObject[key] : JSON.stringify(dataObject[key])
      data[key] = val
    }
    return data
  }

  validateStorageData (data) {
    data.lastLogin = new Date().toISOString() // todo Check with server
    let playerData = data
    this.recursiveCheckData(this.basicData, data)
    return data
  }

  /**
   * Checks if playerdata has al the necessary data from basicData. If certain objects that
   * are in basicData are not included in playerData it will create these objects in playerData
   * @param {} basicDataObj
   * @param {*} playerDataObj
   */
  recursiveCheckData (basicDataObj, playerDataObj) {
    const basicDataKeys = Object.keys(basicDataObj)
    for (let index = 0; index < basicDataKeys.length; index++) {
      const key = basicDataKeys[index]
      if (typeof playerDataObj[key] !== typeof basicDataObj[key] || playerDataObj[key] === null) {
        console.warn('Data is inccorect for key', key, 'val', playerDataObj[key])
        playerDataObj[key] = basicDataObj[key]
      } else if (typeof playerDataObj[key] === 'object') {
        this.recursiveCheckData(basicDataObj[key], playerDataObj[key])
      } else {
        // reached leaf node. Should be fine
        // possible to do a insanity check with a 'max' value json.
      }
    }
  }

  async resetData () {
    this.playerData = this.basicData
    var data = this.stringifyDataObject(this.playerData)
    await StorageManager.instance.setItems(data)
    location.reload()
  }
}

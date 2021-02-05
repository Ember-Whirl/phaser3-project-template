/* globals __platform__, __DEV__ */
import StorageManager from '../managers/standard-managers/storageManager'
import FacebookStorage from '../adapters/facebook/fb-storage'
import WebStorage from '../adapters/web/web-storage'
import AsyncDownloadManager from '../managers/standard-managers/asyncDownloadManager'
import FBI from '../adapters/facebook/FBI'
import Singleton from '../singleton'
import AnalyticsManager from '../managers/standard-managers/analyticsManager'

export default class ApiAdapter extends Singleton {
  constructor () {
    super()
    this.setPlatform()
  }

  setPlatform () {
    console.log(__platform__ );
    this.platform = ''
    if (__platform__ === 'Facebook' || (__DEV__ && FBI.instance.fBInstantExists)) this.platform = 'Facebook'
    else this.platform = __platform__
  }

  async initializeGame (Game) {
    console.log('On initialize game for platform', this.platform)
    if (__platform__ === 'Facebook' || (__DEV__ && FBI.instance.fBInstantExists)) {
      await FBI.instance.initializeAsync(Game)
      StorageManager.instance.setStorageManager(FacebookStorage.instance)
    } else if (__platform__ === 'Android') {
      console.error('Intialize for Android')
      StorageManager.instance.setStorageManager(WebStorage.instance)
    } else {
      console.log('Setting storate Manager')
      StorageManager.instance.setStorageManager(WebStorage.instance)
    }
    console.log('Initliazed game')
    window.game = new Game()
  }

  setLoadingProcess (p) {
    switch (this.platform) {
      case 'Facebook': {
        FBI.instance.setLoadingProgress(p)
        break
      }
      default: {

      }
    }
  }

  async startGameAsync () {
    switch (this.platform) {
      case 'Facebook': {
        await FBI.instance.startGameAsync()
        this.trustedIDs = [2301714739922109]
        this.trustedIDPlaying = this.trustedIDs.includes(Number(this.getPlayerID()))
        console.log('this.getPlayerID()', Number(this.getPlayerID()), 'this.trustedIsPlaying', this.trustedIDPlaying)
        break
      }
      case 'Poki': {

      }
      default: {

      }
    }
  }

  getEntryPointData () {
    let data = {}
    switch (this.platform) {
      case 'Facebook': {
        const dataFB = FBI.instance.getEntryPointData()
        data = Object.is(dataFB, null) ? {} : dataFB
        break
      }
      default: {
        // return;
      }
    }
    return data
  }

  async getPictureSrc () {
    let photoSrc
    switch (this.platform) {
      case 'Facebook': {
        photoSrc = await FBI.instance.getPlayerPhoto()
        break
      }
      default: {
        // return;
      }
    }
    return photoSrc
  }

  canGetPicture () {
    return this.platform === 'Facebook'
  }

  getPlayerID () {
    switch (this.platform) {
      case 'Facebook': {
        return FBI.instance.getPlayerID()
      }
      default: {
        return undefined
      }
    }
  }

  getPlayerName () {
    if (__DEV__) return Math.random() > 0.5 ? 'Mukumbo Beast' : 'Aff'

    switch (this.platform) {
      case 'Facebook': {
        return FBI.instance.getPlayerName()
      }
      default: {
        return undefined
      }
    }
  }
  /*
  * All leaderboard related calls
  */
  async postScoreToLeaderboard (score, leaderboardName, data = {}) {
    let entry = {}
    switch (this.platform) {
      case 'Facebook': {
        entry = await FBI.instance.setScoreAsync(leaderboardName, score, data)
        break
      }
      default: {

      }
    }
  }

  async getConnectedPlayersAsync () {
    let players = []
    switch (this.platform) {
      case 'Facebook': {
        const fbPlayers = await FBI.instance.getConnectedPlayersAsync()
        players = fbPlayers.map(function (player) {
          return {
            playerID: player.getID(),
            name: player.getName(),
            photoURL: player.getPhoto()
          }
        })
        if (players) break
      }
      default: {
        players = game.cache.getJSON('fake-players')
      }
    }
    return players
  }
  /**
   *
   * @param {*} name
   * @param {*} count
   * @param {*} offset offset from top
   */
  async getLeaderboard (name, count, offset) {
    let leaderboard = []
    switch (this.platform) {
      case 'Facebook': {
        const fbLeaderboard = await FBI.instance.getEntriesAsync(name, count, offset)
        leaderboard = this.transformFacebookLeaderboardData(fbLeaderboard)
        break
      }
      default: {
        leaderboard = game.cache.getJSON('fake-leaderboard-stars')
      }
    }
    return leaderboard
  }

  async getFriendLeaderboard (name, count, offset) {
    let leaderboard = []
    switch (this.platform) {
      case 'Facebook': {
        const fbLeaderboard = await FBI.instance.getConnectedPlayerEntriesAsync(name, count, offset)
        leaderboard = this.transformFacebookLeaderboardData(fbLeaderboard)
        break
      }
      default: {
        leaderboard = game.cache.getJSON('fake-leaderboard-stars')
      }
    }
    return leaderboard
  }

  async getPlayerEntryAsync (name) {
    let leaderboard = []
    switch (this.platform) {
      case 'Facebook': {
        const fbLeaderboard = await FBI.instance.getConnectedPlayerEntriesAsync(name, count, offset)
        leaderboard = this.transformFacebookLeaderboardData(fbLeaderboard)
        break
      }
      default: {
        leaderboard = game.cache.getJSON('fake-leaderboard-stars')
      }
    }
    return leaderboard
  }

  canInviteFriend () {
    return (['Facebook'].includes(this.platform))
  }

  async chooseAsync (singlePerson = false) {
    switch (this.platform) {
      case 'Facebook': {
        await FBI.instance.chooseAsync(singlePerson)
        return FBI.instance.getContextID()
      }
      default: {
        break
      }
    }
  }
  /**
   * Returns the context id
   * @param {*} pTopTextImg
   * @param {*} pMessageText
   * @param {*} pButtonText
   * @param {*} imgName
   * @param {*} entryEvent
   */
  async inviteFriend (pTopTextImg, pMessageText, pButtonText, imgName = undefined, entryEvent = 'invite-general', data = {}, singlePerson = false, currentContext = false) {
    const topText = Object.is(pTopTextImg, undefined) ? 'I am playing Golf World.' : pTopTextImg
    const messageText = Object.is(pMessageText, undefined) ? 'I am playing Golf World, it is amazing!' : pMessageText
    const buttonText = Object.is(pButtonText, undefined) ? 'Join me!' : pButtonText
    AnalyticsManager.instance.send('inviteFriend_' + entryEvent)
    switch (this.platform) {
      case 'Facebook': {
        let chosenPlayer
        if (!currentContext) chosenPlayer = await FBI.instance.chooseAsync(singlePerson)
        else chosenPlayer = FBI.instance.getContextID()
        if (!chosenPlayer) break // not chosen player
        const img = await this.createShareImage(topText, imgName)
        await FBI.instance.updateAsync(img, buttonText, messageText, entryEvent, data)
        return FBI.instance.getContextID()
      }
      default: {
      }
    }
  }

  async share (b64Img) {
    switch (this.platform) {
      case 'Facebook': {
        const shared = await FBI.instance.shareAsync('SHARE', b64Img, 'I am playing Golf World.', { entryEvent: 'general-share'})
        return shared
      }
      default: {
        return false
      }
    }
  }

  transformFacebookLeaderboardData (leaderboardData) {
    let leaderboard = []
    for (let index = 0; index < leaderboardData.length; index++) {
      const element = leaderboardData[index]
      const playerObj = {}
      playerObj.name = element.getPlayer().getName()
      playerObj.rank = element.getRank()
      playerObj.score = element.getScore()
      playerObj.photoURL = element.getPlayer().getPhoto()
      playerObj.playerID = element.getPlayer().getID()
      playerObj.data = JSON.parse(element.getExtraData())
      leaderboard.push(playerObj)
    }
    return leaderboard
  }

  // --- Social images --- ///

  async createShareImage (topText = 'I am playing Golf World.', imgName = 'bg-share-photo') {
    return;
    await AsyncDownloadManager.instance.getImage(imgName, './assets/images/facebook/' + imgName + '.png')
    const bgImg = game.cache.getImage(imgName)
    const bitmapData = new Phaser.BitmapData(game, imgName + 'bmd', bgImg.width, bgImg.height)
    const playerPhotoSrc = await this.getPictureSrc()
    const downloadedImageKey = await AsyncDownloadManager.instance.getImage('playerPicture', playerPhotoSrc)

    const needPlayerImg = (imgName !== 'bg-send-life')
    if (needPlayerImg) {
      const playerImage = new Image({key: downloadedImageKey, pivotCentered: true})
      playerImage.width = 185
      playerImage.height = 185

      const playerImgX = (imgName === 'bg-share-photo') ? bgImg.width / 2 : bgImg.width / 2 + 165
      bitmapData.draw(playerImage, playerImgX, bgImg.height / 2)
      playerImage.destroy()
    }

    const exampleText = new Text({text: 'My new level is 12', size: 50, align: 'center'})
    const textTop = new Phaser.Text(game, bgImg.width / 2, 25, topText, exampleText.style)
    const newImage = new Image({key: imgName, pivotCentered: false})
    bitmapData.draw(newImage, 0, 0)
    this.cropText(textTop, 400, 100)
    const topTextX = (bgImg.width / 2) - textTop.width / 2
    bitmapData.draw(textTop, topTextX, 25)
    const b64 = bitmapData.canvas.toDataURL('image/jpeg')

    newImage.destroy()
    bitmapData.destroy()
    exampleText.destroy()
    textTop.destroy()
    return b64
  }

  // -- Utils -- //

  cropText (text, width, height, log) {
    // The Phaser.Text crop doesnt seem to work
    text.wordWrapWidth = width
    text.mx = 1000

    while ((text.height > height || text.width > width) && text.mx > 0) {
      text.mx -= 1
      text.fontSize = parseInt(text.fontSize, 10) - 1
    }
  }

  /** Ad related */

  canWatchInterstitial () {
    switch (this.platform) {
      case 'Facebook': {
        return FBI.instance.supportedAPIs.includes('getInterstitialAdAsync')
      }
      default: {
        return false
      }
    }
  }

  canWatchRewardedAd () {
    switch (this.platform) {
      case 'Facebook': {
        return FBI.instance.supportedAPIs.includes('getRewardedVideoAsync')
      }
      default: {
        return false
      }
    }
  }

  canInviteFriends () {
    switch (this.platform) {
      case 'Facebook': {
        return true
      }
      default: {
        return false
      }
    }
  }

  async preloadAd () {

  }

  async watchInterstitialAsync (adKey) {
    if (__DEV__) return await this.watchPretendAd()
    if (!this.canWatchInterstitial()) return false
    this.lastTimeInterstitialOpened = performance.now()
    switch (this.platform) {
      case 'Facebook': {
        const adWathced = await FBI.instance.watchInterstitialAd(adKey)
        return adWathced
      }
      default: {
        throw new Error('No supported platform to watch ad. There was a problem with canWatchInterstitial()')
      }
    }
  }

  async watchRewardedAdAsync (adKey) {
    if (__DEV__) return await this.watchPretendAd()
    if (!this.canWatchRewardedAd()) return false
    switch (this.platform) {
      case 'Facebook': {
        const adWathced = await FBI.instance.watchRewardedAdAsync(adKey)
        return adWathced
      }
      default: {
        throw new Error('No supported platform to watch ad. There was a problem with canWatchRewardedAd()')
      }
    }
  }

  async watchPretendAd () {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve('done!')
      }, 1000)
    })
  }
}

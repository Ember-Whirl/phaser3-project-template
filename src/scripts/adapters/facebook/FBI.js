/* globals __platform__, __DEV__ */
import Phaser from 'phaser';
import AnalyticsManager from '../../managers/standard-managers/analyticsManager';
import Singleton from '../../singleton';

export default class FBI extends Singleton {
  constructor() {
    super()
    const conditions = ['fbinstant'];
    this.fBInstantExists = (conditions.some(e => window.location.href.includes(e)) || __platform__ === 'Facebook');
    if (!this.fBInstantExists) return;
    this.setAdInformation();
  }

  async initializeAsync (Game) {
    try {
      if (this.fBInstantExists) await FBInstant.initializeAsync();
    } catch (error) {
      console.log("Error", error)
    }
  }

  async setLoadingProgress(progress) {
    try {
      if (this.fBInstantExists) FBInstant.setLoadingProgress(progress);
    } catch (error) {
      console.log("Error", error)
    }
  }

  async startGameAsync() {
    try {
      if (!this.fBInstantExists) return;
        // FBInstant.onPause(() => EventManager.instance.dispatch('onPause'))
        await FBInstant.startGameAsync();
        this.supportedAPIs = FBInstant.getSupportedAPIs();
    } catch (error) {
      console.log("Error", error)
    }


    this.canWatchInterstitialAd = this.supportedAPIs.includes('getInterstitialAdAsync');
    this.canWatchRewardedVideo = this.supportedAPIs.includes('getRewardedVideoAsync');
    // preload ads
    if (this.canWatchRewardedVideo) this.loadAd('rewarded', 'extraShot')
    if (this.canWatchInterstitialAd) this.loadAd('interstitial', 'interstitialGame')
  }

  getEntryPointData() {
    return FBInstant.getEntryPointData();
  }
  
  async getDataAsync(...keys) {
    if (!this.fBInstantExists) return;
    let data = await FBInstant.player.getDataAsync(keys);
    console.log(data);
  }

  /*
    Set data to be saved to the designated cloud storage of the current player. 
    The game can store up to 1MB of data for each unique player.
  */
  async setDataAsync(data) {
    if (!this.fBInstantExists) return;
    await FBInstant.player.setDataAsync(data);
  }

  async getConnectedPlayersAsync() {
    if (!this.fBInstantExists) return;
    try {
      const players = await FBInstant.player.getConnectedPlayersAsync();
      return players;
    } catch(e) {
      console.warn('Error on getting connected players', e);
      return undefined;
    }
  }

  async getLeaderboardAsync(name) {
    if (!this.fBInstantExists) return;
    try {
      const leaderboard = await FBInstant.getLeaderboardAsync(name);
      return leaderboard;
    } catch(e) {
      console.log('Error on getting leaderboard with name', name, e);
      return undefined;
    }
  }

  /**
   * 
   * @param {String} name The name of the leaderboard
   * @param {Number} count The number of entries to attempt to fetch from the leaderboard. Defaults to 10 if not specified. Currently, up to a maximum of 100 entries may be fetched per query.
   * @param {Number} offset The offset from the top of the leaderboard that entries will be fetched from.
   */
  async getEntriesAsync(name, count = 100, offset = 0) {
    if (!this.fBInstantExists) return;
    const leaderboard = await this.getLeaderboardAsync(name);

    const entries = await leaderboard.getEntriesAsync(count, offset);
    return entries;
  }

  /**
   * 
   * @param {String} name The name of the leaderboard
   * @param {Number} count The number of entries to attempt to fetch from the leaderboard. Defaults to 10 if not specified. Currently, up to a maximum of 100 entries may be fetched per query.
   * @param {Number} offset The offset from the top of the leaderboard that entries will be fetched from.
   */
  async getConnectedPlayerEntriesAsync(name, count = 100, offset = 0) {
    if (!this.fBInstantExists) return;
    const leaderboard = await this.getLeaderboardAsync(name);

    const entries = await leaderboard.getConnectedPlayerEntriesAsync(count, offset);
    return entries;
  }

  async setScoreAsync(leaderboardName, score, data) {
    if (!this.fBInstantExists) return;
    const leaderboard = await this.getLeaderboardAsync(leaderboardName);
    if (!leaderboard) return;
    data = (typeof data === 'String') ? data : JSON.stringify(data);
    const entry = await leaderboard.setScoreAsync(score, data);
    return entry;
  }

  getPlayerID() {
    if (!this.fBInstantExists) return;
    return FBInstant.player.getID();
  }

  getContextID() {
    if (!this.fBInstantExists) return;
    return FBInstant.context.getID();
  }

  async getPlayerPhoto() {
    if (!this.fBInstantExists) return;
    return FBInstant.player.getPhoto();
  }

  getPlayerName() {
    if (!this.fBInstantExists) return;
    const playerName = FBInstant.player.getName();
    return playerName;
  }

  async logEvent(eventName, valueToSum, parameters) {
    if (!this.fBInstantExists) return;
    var logged = await FBInstant.logEvent(
      eventName,
      valueToSum,
      parameters,
    );
  }

  async canCreateShortcutAsync() {
    if (!this.fBInstantExists) return;
    return await FBInstant.canCreateShortcutAsync();
  }

  async createShortcutAsync() {
    if (!this.fBInstantExists) return;
    try {
      const canCreate = await this.canCreateShortcutAsync();
      if (!canCreate) return;
      AnalyticsManager.instance.send('start createShortcutAsync')
      const created = await FBInstant.createShortcutAsync();
      AnalyticsManager.instance.send('accepted createShortcutAsync')
    } catch (e) {
      console.warn('Error on creating shortcut', e);
      return false
    }
    return true;
  }

  /**
   * 
   * @param {string} intent ("INVITE" | "REQUEST" | "CHALLENGE" | "SHARE") Indicates the intent of the share.
   * @param {string} image A base64 encoded image to be shared.
   * @param {string} text A text message to be shared.
   * @param {Object} data A blob of data to attach to the share. All game sessions launched from the share will be able to access this blob through FBInstant.getEntryPointData().
   */
  async shareAsync(intent = 'REQUEST', image, text, data) {
    if (!this.fBInstantExists) return;
    try {
      const obj = {
        intent: intent,
        image: image,
        text: text,
        data: data,
      };
      await FBInstant.shareAsync(obj)
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * 
   * @param {*} options Object? An object specifying conditions on the contexts that should be offered.
                options.filters Array<ContextFilter>?  ("NEW_CONTEXT_ONLY" | "INCLUDE_EXISTING_CHALLENGES" | "NEW_PLAYERS_ONLY")
                options.maxSize number? The maximum number of participants that a suggested context should ideally have.
                options.minSize number? The minimum number of participants that a suggested context should ideally have. 
   */
  async chooseAsync(singlePerson = false, addOptions = false, filters = "NEW_CONTEXT_ONLY", maxSize =  100, minSize= 0) {
    if (!this.fBInstantExists) return;
    let options = {};
    if (addOptions && false) {
      options.filters = filters;
      options.maxSize = maxSize;
      options.minSize = minSize;
    }

    if (singlePerson) {
      options.minSize = 2;
      options.maxSize = 2;
    }

    try {
      await FBInstant.context.chooseAsync(options)
      return true;
    } catch(e) {
      switch (e.code) {
        case "SAME_CONTEXT": {
          return true;
        }
      }
      console.warn('Error on chooseAsync', e)
      return false;
    }
  }

  async updateAsync(img, cta = "Play Now!", text = 'I am playing Golf World, it is amazing!', entryEvent = 'invite-general', data = {}) {
    if (!this.fBInstantExists) return;
    data.entryEvent = entryEvent;
    data.playerID = this.getPlayerID();
    await FBInstant.updateAsync({
      action: 'CUSTOM',
      cta: cta,
      image: img,
      text: text,
      template: 'VILLAGE_INVASION',
      data: data,
      strategy: 'IMMEDIATE',
      notification: 'PUSH',
    })
  }

  /** Ad related functions */

  setAdInformation() {    
    this.interstitialIDs = {
      'interstitialGame': '311923823088797_525583648389479' 
    };
    this.rewardedAdIDs = {
      'extraShot': '311923823088797_536329020648275',
      'extraLives': '311923823088797_551063069174870'
    };

    this.currentAdsDoneLoading = {};
    this.currentAdsDoneLoading.keys = [];
    this.currentAdsLoading = [];
    this.onAdDoneLoading = new Phaser.Signal();
    this.onErrorLoadingAd = new Phaser.Signal();
  }
  
  async watchInterstitialAd(adKey) {
    const loadPromise = new Promise((resolve, reject) => {
      console.log('Start getting and loading interstitial ad with key:', adKey);
      this.loadAd('interstitial', adKey).then(ad => { resolve(ad) });
    }); 
    try {
      const ad = await Promise.race([loadPromise, this.getTimeout()]);
      console.log('Start showing interstitial ad')
      const watched = await ad.showAsync();
      console.log('Wathced interstitial: ', watched)
      this.currentAdsDoneLoading.keys = this.currentAdsDoneLoading.keysfilter(k => k !== adKey)
      return watched;
    } catch (e) {
      console.log('Error on wathcing ad.', e);
      return false;
    }
  }

  async watchRewardedAdAsync(adKey) {
    const loadPromise = new Promise((resolve, reject) => {
      console.log('Start getting and loading rewarded ad with key:', adKey);
      this.loadAd('rewarded', adKey).then(ad => { resolve(ad) });
    }); 
    let startedShowing = false;
    try {
      const ad = await Promise.race([loadPromise, this.getTimeout()]);
      console.log('Start showing rewarded ad with key:', adKey, ad);
      startedShowing = true;
      // LoadingScreen.instance.disable();
      await ad.showAsync();
      this.currentAdsDoneLoading.keys = this.currentAdsDoneLoading.keys.filter(k => k !== adKey)
      this.currentAdsDoneLoading[adKey] = undefined;
      return true;
    } catch (e) {
      if (startedShowing) {        
        this.currentAdsDoneLoading.keys = this.currentAdsDoneLoading.keys.filter(k => k !== adKey)
        this.currentAdsDoneLoading[adKey] = undefined;
      }
      console.log('Error on wathcing ad', ad, e);
      return false;
    }

  }

  async getInterstitialAsync(key = 'interstitialGame') {
    const id = this.interstitialIDs[key];
    if (!id) throw new Error('Couldnt find key in interstitials. Key: ' + 
      key + '. Interstitial IDs: ' + JSON.stringify(this.interstitialIDs));
    const interstitial = await FBInstant.getInterstitialAdAsync(id)
    return interstitial;
  }

  async getRewardedVideoAsync(key = 'interstitialGame') {
    const id = this.rewardedAdIDs[key];
    console.log('Getting rewarded ad async', key, id)
    if (!id) throw new Error('Couldnt find key in rewarded ids. Key: ' + key + '. Rewarded IDs: ' + JSON.stringify(this.rewardedAdIDs));
    const rewardedAd = await FBInstant.getRewardedVideoAsync(id);
    return rewardedAd;
  }

  async loadAd(type, key) {    
    console.log('start of load ad with type/key', type,"/",key);
    let ad = undefined;
    if (this.currentAdsDoneLoading.keys.includes(key)) {
      ad = this.currentAdsDoneLoading[key];
      return ad;
    } else if (type === 'interstitial') {
      if (!this.canWatchInterstitialAd) return console.log('Cant watch interstitial ad, not supported');
      ad = await this.getInterstitialAsync(key);
    }
    else if (type === 'rewarded') {      
      if (!this.canWatchRewardedVideo) return console.log('Cant watch rewarded video ad, not supported');
      ad = await this.getRewardedVideoAsync(key);
    }
    if (!ad) throw new Error('Couldnt find ad with with type ' + type + ' and key ' + key);
    
    if (this.currentAdsLoading.includes(key)) {
      console.log('Ad is already loading returning new promise')
      return new Promise((resolve, reject) => {
        this.onAdDoneLoading.add((keyDone, loadedAdInstance) => {
          console.log('Ad is done loading with key', keyDone);
          if (key === keyDone) resolve(loadedAdInstance);
        });
        this.onErrorLoadingAd.add((keyError) => {
          if (key === keyError) reject();
        });
      })
    }

    try {
      console.log('start loading ad', key, ad)
      this.currentAdsLoading.push(key);
      if (this.currentAdsDoneLoading.keys.includes(key)) {
        console.log('Ad was already done loading, shoudltn happen. ', key)
        return ad;
      } else await ad.loadAsync();
      this.adDoneLoading(key, ad);
      return ad;
    } catch (e) {
      this.errorLoadingAd(key);
      throw new Error('Error on loading ad with key' + key + ' e message: ' + e)
    }
  };

  async preloadInterstitial(type) {
    const interstitial = await this.getInterstitialAsync(type);

    this.currentAdsLoading.push(type);
    await interstitial.loadAsync();
  }

  async preloadRewardedAd() {
    // Check
  }
  
  getTimeout() {
    const ms = 3000;
    return new Promise((resolve, reject) => setTimeout(() => reject('Timeout called after ' + ms + ' ms'), ms));
  }

  adDoneLoading(key, loadedAdInstance) {
    console.log('Ad is done loading with key', key);
    this.onAdDoneLoading.dispatch(key, loadedAdInstance);
    this.currentAdsLoading = this.currentAdsLoading.filter(k => k !== key)
    this.currentAdsDoneLoading.keys.push(key);
    this.currentAdsDoneLoading[key] = loadedAdInstance;
    console.log('this.currentAdsLoading', this.currentAdsLoading)
    console.log('this.currentAdsDoneLoading', this.currentAdsDoneLoading)
  }

  errorLoadingAd(key) {
    this.onErrorLoadingAd.dispatch(key);
    this.currentAdsLoading = this.currentAdsLoading.filter(k => k !== key)
  }
}
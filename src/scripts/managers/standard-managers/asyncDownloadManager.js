import Singleton from "../../singleton";

export default class AsyncDownloadManager extends Singleton{
  constructor () {
    super();
    this.bgmLoading = [];
    this.sfxLoading = [];
    this.imagesLoading = [];
    this.jsonLoading = [];
    game.load.enableParallel = true;
    game.load.crossOrigin = 'Anonymous';
    this.allImagesDoneLoading = true;
    this.allCoursesDoneLoading = true;
  }

  loadImage(key, url) {
    game.load.image(key, url)
  }

  getImage(key, src) {
    // if downloaded. return immediate
    // wait for downloadComplete
    const keyExists = game.cache.checkImageKey(key);
    if (keyExists) return new Promise(resolve => resolve(key));
    const keyLoading = this.imagesLoading.includes(key);
    if (!keyLoading) {
      this.imagesLoading.push(key);
      this.loadImage(key, src);
      game.load.start();
    }
    return new Promise((resolve, reject) => { 
      game.load.onFileComplete.add((progression, imageKey) => {
        if (key === imageKey) {
          this.imagesLoading = this.imagesLoading.filter(k => k !== key)
          resolve(imageKey);
          if (progression >= 100) this.onAllImagesDoneLoading();
        }
      });
      game.load.onFileError.add((loadKey, file) => {
        if (key === loadKey) {
          reject('Error loading Image: ' + loadKey)
        }
      });
    })
  }

  /**
   * 
   * @param {*} key 
   * @param {*} type Can be either 'bgm' or 'sfx'
   */
  getAudio(key, type) {
    const keyExists = game.cache.checkSoundKey(key);
    if (keyExists) return new Promise(resolve => resolve(key));
    const keyLoading = this[type+'Loading'].includes(key);
    if (!keyLoading) {
      this[type+'Loading'].push(key);
      game.load.audio(key, './assets/audio/'+ type + '/' + key + '.mp3')
      game.load.start();
    }
    return new Promise((resolve, reject) => { 
      game.load.onFileComplete.add((progression, loadKey) => {
        if (key === loadKey) {
          this[type+'Loading'] = this[type+'Loading'].filter(k => k !== loadKey)
          resolve(loadKey);
          if (progression >= 100) this.allDoneLoading();
        }
      });
      game.load.onFileError.add((loadKey, file) => {
        if (key === loadKey) {
          reject('Error loading Audio: ' + loadKey)
        }
      });
    })
  }

  getJSON(key, src) {
    const keyExists = game.cache.checkJSONKey(key);
    if (keyExists) return new Promise(resolve => resolve(key));
    const keyLoading = this.jsonLoading.includes(key);
    if (!keyLoading) {
      this.jsonLoading.push(key);
      game.load.json(key, src);
      game.load.start();
    }

    return new Promise((resolve, reject) => { 
      game.load.onFileComplete.add((progression, jsonKey) => {
        if (key === jsonKey) {
          this.jsonLoading = this.jsonLoading.filter(k => k !== key)
          resolve(jsonKey);
          if (progression >= 100) this.allDoneLoading();
        }
      });
      game.load.onFileError.add((jsonKey, file) => {
        if (key === jsonKey) {
          reject('Error loading JSON: ' + jsonKey)
        }
      });
    })
  }

  onAllImagesDoneLoading() {
    this.allImagesDoneLoading = true;
    if (this.allImagesDoneLoading) {
      this.allDoneLoading();
    }
  }

  allDoneLoading() {
    game.load.onFileComplete.removeAll();
    game.load.onFileError.removeAll();
  }
}
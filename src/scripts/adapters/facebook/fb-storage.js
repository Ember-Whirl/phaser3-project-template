import Singleton from "../../singleton";

export default class FacebookStorage extends Singleton{
  constructor() {
    super();
  }

  async getItems(keys) {
    var data = {};
    var fbData = await FBInstant.player
    .getDataAsync(keys)
    .then((data) => {
        return data;
      });
    
    for (let k = 0; k < keys.length; k++) {
      const key = keys[k];
      data[key] = (typeof fbData[key] === 'undefined') ? undefined : JSON.parse(fbData[key]);
    }
    return data;
  }

  async setItems(data) {
    await FBInstant.player
      .setDataAsync(data)
      .then(function() {
        return;
      });
  }
}
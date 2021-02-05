/* globals __platform__, __DEV__*/
import Singleton from "../utilities/singleton";
import fbAnalytics from "../adapters/facebook/fb-Analytics";
import webAnalytics from "../adapters/web/web-Analytics";
import FBI from "../adapters/facebook/FBI";

export default class AnalyticsAdapter extends Singleton {
  constructor() {
    super();
    this.createManager();
  }

  createManager() {
    if (__platform__ === 'Facebook' || FBI.instance.fBInstantExists) this.manager = new fbAnalytics();
    else this.manager = new webAnalytics();
  }

  getManager() {
    return this.manager;
  }
}
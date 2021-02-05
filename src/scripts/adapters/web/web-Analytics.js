/* globals __platform__, __DEV__*/
import Singleton from "../../utilities/singleton";

export default class WebAnalyticsManager extends Singleton {
  constructor() {
    super();
  }

  send(key, values) {
    if (__DEV__) return;
    var dataObj = (typeof values === 'object') ? values : { data: values }; 
    window.ga('send','event', 'analyticsTest:' + __platform__, key, dataObj.data)
  }
}
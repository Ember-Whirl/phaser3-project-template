/* globals __platform__, __DEV__*/
import Singleton from "../../utilities/singleton";
import FBI from "./FBI";

export default class FBAnalytics extends Singleton {
  constructor() {
    super();
  }

  send(key, values) {
    if (__DEV__) return;
    var dataObj = (typeof values === 'object') ? values : { data: values }; 
    FBI.instance.logEvent(key, 0, dataObj)
    window.ga('send','event', 'analyticsTest:' + __platform__, key, dataObj.data)
  }
}
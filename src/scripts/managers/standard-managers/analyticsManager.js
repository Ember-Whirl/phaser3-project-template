/* globals __platform__, __DEV__*/

import AnalyticsAdapter from "../../adapter/analyticsAdapter";
import Singleton from "../../singleton";

export default class AnalyticsManager extends Singleton {
  constructor() {
    super();
  }

  send(key, values) {
    if (__DEV__) return;
    AnalyticsAdapter.instance.getManager().send(key, values);
  }
}
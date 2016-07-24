/// <reference path="leonardo.d.ts" />

declare const window: any;

export class Storage {
  private APP_PREFIX;
  private STATES_STORE_KEY;
  private SAVED_STATES_KEY;

  constructor() {
    this.APP_PREFIX = Leonardo.APP_PREFIX || '';
    this.STATES_STORE_KEY = `${this.APP_PREFIX}leonardo-states`;
    this.SAVED_STATES_KEY = `${this.APP_PREFIX}leonardo-unregistered-states`;
  }
  _getItem (key) {
    var item = window.localStorage.getItem(key);
    if (!item) {
      return null;
    }
    return angular.fromJson(item);
  }

  _setItem(key, data) {
    window.localStorage.setItem(key, angular.toJson(data));
  }

  getStates() {
    return this._getItem(this.STATES_STORE_KEY) || {};
  }

  setStates(states) {
    this._setItem(this.STATES_STORE_KEY, states);
    Leonardo.statesChanged();
  }

  getSavedStates() {
    var states = this._getItem(this.SAVED_STATES_KEY) || [];
    states.forEach(function(state){
      state.options.forEach(option => {
        option.from_local = true;
      })
    });
    return states;
  }

  setSavedStates(states) {
    this._setItem(this.SAVED_STATES_KEY, states);
  }
}

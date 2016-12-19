import Utils from './utils';

declare const window: any;

export class Storage {
  private APP_PREFIX;
  private STATES_STORE_KEY;
  private SCENARIOS_STORE_KEY;
  private SAVED_STATES_KEY;
  private POSITION_KEY;

  constructor() {
    this.APP_PREFIX = Leonardo.APP_PREFIX || '';
    this.STATES_STORE_KEY = `${this.APP_PREFIX}leonardo-states`;
    this.SAVED_STATES_KEY = `${this.APP_PREFIX}leonardo-unregistered-states`;
    this.SCENARIOS_STORE_KEY = `${this.APP_PREFIX}leonardo-scenarios`;
    this.POSITION_KEY = `${this.APP_PREFIX}leonardo-position`;
  }

  _getItem(key) {
    var item = window.localStorage.getItem(key);
    if (!item) {
      return null;
    }
    return Utils.fromJson(item);
  }

  _setItem(key, data) {
    window.localStorage.setItem(key, Utils.toJson(data));
  }

  getStates() {
    return this._getItem(this.STATES_STORE_KEY) || {};
  }

  getScenarios() {
    return this._getItem(this.SCENARIOS_STORE_KEY) || [];
  }

  setStates(states) {
    this._setItem(this.STATES_STORE_KEY, states);
    Leonardo.statesChanged();
  }

  setScenarios(scenarios) {
    this._setItem(this.SCENARIOS_STORE_KEY, scenarios);
  }

  getSavedStates() {
    var states = this._getItem(this.SAVED_STATES_KEY) || [];
    states.forEach(function (state) {
      state.options.forEach(option => {
        option.from_local = true;
      })
    });
    return states;
  }

  setSavedStates(states) {
    this._setItem(this.SAVED_STATES_KEY, states);
  }

  setSavedPosition(position) {
    if (!position) {
      return;
    }
    this._setItem(this.POSITION_KEY, position);
  }

  getSavedPosition() {
    return this._getItem(this.POSITION_KEY);
  }
}

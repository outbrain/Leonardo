import Utils from './utils';

declare const window: any;

export class Storage {
  private APP_PREFIX;
  private STATES_STORE_KEY;
  private SCENARIOS_STORE_KEY;
  private SAVED_STATES_KEY;
  private POSITION_KEY;
  private CONSOLE_OUTPUT;
  private NO_UI;
  private LAUNCHER_VISIBILITY
  private RECORDING_ENABLED;

  constructor() {
    this.APP_PREFIX = Leonardo.APP_PREFIX || '';
    this.STATES_STORE_KEY = `${this.APP_PREFIX}leonardo-states`;
    this.SAVED_STATES_KEY = `${this.APP_PREFIX}leonardo-unregistered-states`;
    this.SCENARIOS_STORE_KEY = `${this.APP_PREFIX}leonardo-scenarios`;
    this.POSITION_KEY = `${this.APP_PREFIX}leonardo-position`;
    this.CONSOLE_OUTPUT = `${this.APP_PREFIX}leonardo-console-output`;
    this.NO_UI = `${this.APP_PREFIX}leonardo-no-ui`;
    this.LAUNCHER_VISIBILITY = `${this.APP_PREFIX}leonardo-launcher-visibility`
    this.RECORDING_ENABLED = `${this.APP_PREFIX}leonardo-recording-enabled`;
  }

  _getItem(key) {
    let item = window.localStorage.getItem(key);
    if (!item) {
      return null;
    }
    return Utils.fromJson(item);
  }

  _setItem(key, data) {
    window.localStorage.setItem(key, Utils.toJson(data));
  }

  _removeItem(key) {
    window.localStorage.removeItem(key);
  }

  getStates() {
    return this._getItem(this.STATES_STORE_KEY) || {};
  }

  getScenarios() {
    return this._getItem(this.SCENARIOS_STORE_KEY) || [];
  }

  removeStates() {
    this._removeItem(this.SAVED_STATES_KEY);
    this._removeItem(this.STATES_STORE_KEY);
    window.location.reload();
  }

  setStates(states) {
    this._setItem(this.STATES_STORE_KEY, states);
    Leonardo.statesChanged();
  }

  setScenarios(scenarios) {
    this._setItem(this.SCENARIOS_STORE_KEY, scenarios);
  }

  getSavedStates() {
    let states = this._getItem(this.SAVED_STATES_KEY) || [];
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

  getConsoleOutput(): boolean {
    const item  = this._getItem(this.CONSOLE_OUTPUT);
    return item && item.enabled;
  }

  getRecordingEnabled(): boolean {
    const item  = this._getItem(this.RECORDING_ENABLED);
    if (item) {
      return item.enabled
    }
    return true
  }

  getNoUI(): boolean {
    const item  = this._getItem(this.NO_UI);
    return item && item.value;
  }

  setNoUI(value: boolean) {
    this._setItem(this.NO_UI, {value});
  }

  setConsoleOutput(enabled: boolean) {
    this._setItem(this.CONSOLE_OUTPUT, {enabled: enabled});
  }

  setLauncherVisibility(visibility: string) {
    this._setItem(this.LAUNCHER_VISIBILITY, visibility)
  }

  getLauncherVisibility(): string {
    return this._getItem(this.LAUNCHER_VISIBILITY)
  }

  setRecordingEnabled(enabled: boolean) {
    this._setItem(this.RECORDING_ENABLED, {enabled: enabled});
  }
}

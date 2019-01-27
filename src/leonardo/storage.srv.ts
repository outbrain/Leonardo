import Utils from './utils';
import Leonardo from './leonardo';

export class Storage {
    private STATES_STORE_KEY;
    private SCENARIOS_STORE_KEY;
    private SAVED_STATES_KEY;
    private POSITION_KEY;
    private CONSOLE_OUTPUT;
    private NO_UI;

    constructor() {
        this.STATES_STORE_KEY = `leonardo-states`;
        this.SAVED_STATES_KEY = `leonardo-unregistered-states`;
        this.SCENARIOS_STORE_KEY = `leonardo-scenarios`;
        this.POSITION_KEY = `leonardo-position`;
        this.CONSOLE_OUTPUT = `leonardo-console-output`;
        this.NO_UI = `leonardo-no-ui`;
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
        const item = this._getItem(this.CONSOLE_OUTPUT);
        return item && item.enabled;
    }

    getNoUI(): boolean {
        const item = this._getItem(this.NO_UI);
        return item && item.value;
    }

    setConsoleOutput(enabled: boolean) {
        this._setItem(this.CONSOLE_OUTPUT, {enabled: enabled});
    }
}

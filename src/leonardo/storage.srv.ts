export class Storage {
  static $inject = ['$rootScope', '$window', '$leonardo'];
  private APP_PREFIX;
  private STATES_STORE_KEY;
  private SAVED_STATES_KEY;

  constructor(private $rootScope, private $window, private $leonardo) {
      this.APP_PREFIX = `${$leonardo.getAppPrefix()}_`;
      this.STATES_STORE_KEY = `${this.APP_PREFIX}leonardo-states`;
      this.SAVED_STATES_KEY = `${this.APP_PREFIX}leonardo-unregistered-states`;

  }
  _getItem (key) {
    var item = this.$window.localStorage.getItem(key);
    if (!item) {
      return null;
    }
    return angular.fromJson(item);
  }

  _setItem(key, data) {
    this.$window.localStorage.setItem(key, angular.toJson(data));
  }

  getStates() {
    return this._getItem(this.STATES_STORE_KEY) || {};
  }

  setStates(states) {
    this._setItem(this.STATES_STORE_KEY, states);
    this.$rootScope.$emit('leonardo:setStates');
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
};

angular.module('leonardo').factory('leoStorage', ['$rootScope', '$window', '$leonardo', function storageService($rootScope, $window, $leonardo) {
  var APP_PREFIX = $leonardo.getAppPrefix() + '_',
      STATES_STORE_KEY = APP_PREFIX + 'leonardo-states',
      SAVED_STATES_KEY = APP_PREFIX + 'leonardo-unregistered-states';
  function _getItem(key) {
    var item = $window.localStorage.getItem(key);
    if (!item) {
      return null;
    }
    return angular.fromJson(item);
  }

  function _setItem(key, data) {
    $window.localStorage.setItem(key, angular.toJson(data));
  }

  function getStates() {
    return _getItem(STATES_STORE_KEY) || {};
  }

  function setStates(states) {
    _setItem(STATES_STORE_KEY, states);
    $rootScope.$emit('leonardo:setStates');
  }

  function getSavedStates() {
    return _getItem(SAVED_STATES_KEY) || [];
  }

  function setSavedStates(states) {
    _setItem(SAVED_STATES_KEY, states);
  }

  return {
    setStates: setStates,
    getStates: getStates,
    getSavedStates: getSavedStates,
    setSavedStates: setSavedStates
  };
}]);

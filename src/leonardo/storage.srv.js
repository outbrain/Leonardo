angular.module('leonardo').factory('leoStorage', ['$rootScope', '$window', '$leonardo', function storageService($rootScope, $window, $leonardo) {
  var APP_PREFIX = $leonardo.getAppPrefix() + '_',
      STATES_STORE_KEY = APP_PREFIX + 'leonardo-states',
      SAVED_STATES_KEY = APP_PREFIX + 'leonardo-unregistered-states';
  function getItem(key) {
    key = APP_PREFIX + key;
    var item = $window.localStorage.getItem(key);
    if (!item) {
      return null;
    }
    return angular.fromJson(item);
  }

  function setItem(key, data) {
    key = APP_PREFIX + key;
    $window.localStorage.setItem(key, angular.toJson(data));
  }

  function getStates() {
    return getItem(STATES_STORE_KEY) || {};
  }

  function setStates(states) {
    setItem(STATES_STORE_KEY, states);
    $rootScope.$emit('leonardo:setStates');
  }

  function getSavedStates() {
    return getItem(SAVED_STATES_KEY) || [];
  }

  function setSavedStates(states) {
    setItem(SAVED_STATES_KEY, states);
  }

  return {
    getItem: getItem,
    setItem: setItem,
    setStates: setStates,
    getStates: getStates,
    getSavedStates: getSavedStates,
    setSavedStates: setSavedStates
  };
}]);

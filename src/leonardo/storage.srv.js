angular.module('leonardo').factory('leoStorage', ['$rootScope', '$window', function storageService($rootScope, $window) {
  var STATES_STORE_KEY = 'leonardo-states',
      SAVED_STATES_KEY = 'leonardo-unregistered-states';
  function getItem(key) {
    var item = $window.localStorage.getItem(key);
    if (!item) {
      return null;
    }
    return angular.fromJson(item);
  }

  function setItem(key, data) {
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

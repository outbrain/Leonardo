angular.module('leonardo').factory('leoStorage', ['$rootScope', function storageService($rootScope) {
  var STATES_STORE_KEY = 'leonardo-states';
  function getItem(key) {
    var item = localStorage.getItem(key);
    if (!item) {
      return null;
    }
    return angular.fromJson(item);
  }

  function setItem(key, data) {
    localStorage.setItem(key, angular.toJson(data));
  }

  function getStates() {
    return getItem(STATES_STORE_KEY) || {};
  }

  function setStates(states) {
    setItem(STATES_STORE_KEY, states);
    $rootScope.$emit('leonardo:setStates');
  }

  return {
    getItem: getItem,
    setItem: setItem,
    setStates: setStates,
    getStates: getStates
  };
}]);

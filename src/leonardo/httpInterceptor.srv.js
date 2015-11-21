angular.module('leonardo').factory('leoHttpInterceptor', ['leoConfiguration', '$q', function(leoConfiguration, $q) {
  return {
    'request': function(request) {
      return $q.when(request);
    },
    'response': function(response) {
      leoConfiguration._logRequest(response.config.method, response.config.url, response.data, response.status);
      return $q.when(response);
    },
    'responseError': function(rejection) {
      leoConfiguration._logRequest(rejection.config.method, rejection.config.url, rejection.data, rejection.status);
      return $q.reject(rejection);
    }
  };
}]);

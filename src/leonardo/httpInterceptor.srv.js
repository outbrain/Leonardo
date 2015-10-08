angular.module('leonardo').factory('leoHttpInterceptor', ['leoConfiguration', function(leoConfiguration) {
  return {
    'request': function(request) {
      leoConfiguration._logRequest(request.method, request.url);
      return request;
    },
    'response': function(response) {
      leoConfiguration._logRequest(response.config.method, response.config.url, response.data, response.status);
      return response;
    },
    'responseError': function(rejection) {
      leoConfiguration._logRequest(rejection.config.method, rejection.config.url, rejection.data, rejection.status);
      return rejection;
    }
  };
}]);

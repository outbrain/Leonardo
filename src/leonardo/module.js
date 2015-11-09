angular.module('leonardo', ['leonardo.templates', 'ngMockE2E'])
  .config(['$provide', '$httpProvider', function($provide, $httpProvider) {

    $httpProvider.interceptors.push('leoHttpInterceptor');

    $provide.decorator('$httpBackend', ['$delegate', '$timeout', function($delegate, $timeout) {
      var proxy = function(method, url, data, callback, headers) {
        var interceptor = function() {
          var _this = this,
            _arguments = arguments;
          $timeout(function() {
            callback.apply(_this, _arguments);
          }, proxy.delay || 0);
          proxy.delay = 0;
        };
        return $delegate.call(this, method, url, data, interceptor, headers);
      };

      for(var key in $delegate) {
        if ($delegate.hasOwnProperty(key)) {
          proxy[key] = $delegate[key];
        }
      }

      proxy.setDelay = function(delay) {
        proxy.delay = delay;
      };

      return proxy;
    }]);

    $provide.decorator('$http', ['leoConfiguration', '$delegate', function(leoConfiguration, $delegate) {
      var proxy = function(requestConfig) {
        leoConfiguration._requestSubmitted(requestConfig);
        return $delegate.call(this, requestConfig);
      };

      for(var key in $delegate) {
        if ($delegate.hasOwnProperty(key)) {
          proxy[key] = $delegate[key];
        }
      }

      createShortMethodsWithData('post', 'put', 'patch');

      createShortMethods('get', 'delete', 'head', 'jsonp');

      function createShortMethods() {
        angular.forEach(arguments, function(name) {
          proxy[name] = function(url, config) {
            return proxy(angular.extend({}, config || {}, {
              method: name,
              url: url
            }));
          };
        });
      }

      function createShortMethodsWithData() {
        angular.forEach(arguments, function(name) {
          proxy[name] = function(url, data, config) {
            return proxy(angular.extend({}, config || {}, {
              method: name,
              url: url,
              data: data
            }));
          };
        });
      }

      return proxy;
    }]);
  }])
  .run(['leoConfiguration', function(leoConfiguration) {
      leoConfiguration.loadSavedStates();
    }]);
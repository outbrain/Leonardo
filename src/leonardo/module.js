angular.module('leonardo', ['leonardo.templates', 'ngMockE2E'])
  /* wrap $httpbackend with a proxy in order to support delaying its responses
   * we are using the approach described in Endless Indirection:
   * https://endlessindirection.wordpress.com/2013/05/18/angularjs-delay-response-from-httpbackend/
   */
  .config(['$provide', function($provide) {
    $provide.decorator('$httpBackend', ['$delegate', function($delegate) {
      var proxy = function(method, url, data, callback, headers) {
        var interceptor = function() {
          var _this = this,
              _arguments = arguments;
          setTimeout(function() {
            callback.apply(_this, _arguments);
          }, proxy.delay || 0);
          proxy.delay = 0;
        };
        return $delegate.call(this, method, url, data, interceptor, headers);
      };
      for(var key in $delegate) {
        proxy[key] = $delegate[key];
      }
      proxy.setDelay = function(delay) {
        proxy.delay = delay;
      };
      return proxy;
    }]);

    $provide.decorator('$http', ['$delegate', function($delegate) {
      var activator;

      var proxy = function(requestConfig) {
        activator._requestSubmitted(requestConfig);
        return $delegate.call(this, requestConfig);
      };
      for(var key in $delegate) {
        proxy[key] = $delegate[key];
      }

      proxy.setActivator = function(_activator){
        activator = _activator;
      };

      return proxy;
    }]);
  }]);


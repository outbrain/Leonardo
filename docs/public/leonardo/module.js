$traceurRuntime.options.symbols = true;
System.registerModule("../src/leonardo/activator.drv.js", [], function() {
  "use strict";
  var __moduleName = "../src/leonardo/activator.drv.js";
  function activatorDirective($compile) {
    return {
      restrict: 'A',
      link: function(scope, elem) {
        var el = $('<div ng-click="activate()" class="leonardo-activator"></div>');
        var win = $(['<div class="leonardo-window">', '<div class="leonardo-header">Leonardo Configuration</div>', '<window-body></window-body>', '</div>', '</div>'].join(''));
        $compile(el)(scope);
        $compile(win)(scope);
        $(elem).append(el);
        $(elem).append(win);
        win[0].addEventListener('webkitTransitionEnd', function() {
          if (!document.body.classList.contains('pull-top')) {
            document.body.classList.add("pull-top-closed");
          }
        }, false);
        scope.activate = function() {
          if (!document.body.classList.contains('pull-top')) {
            document.body.classList.add('pull-top');
            document.body.classList.remove('pull-top-closed');
          } else {
            document.body.classList.remove('pull-top');
          }
        };
      }
    };
  }
  var $__default = activatorDirective;
  return {get default() {
      return $__default;
    }};
});
$traceurRuntime.options.symbols = true;
System.registerModule("../src/leonardo/configuration.srv.js", [], function() {
  "use strict";
  var __moduleName = "../src/leonardo/configuration.srv.js";
  function configurationService() {
    var states = [];
    return {
      states: states,
      upsert: function($__0) {
        var $__2,
            $__3,
            $__4;
        var $__1 = $__0,
            state = $__1.state,
            name = $__1.name,
            url = $__1.url,
            status = ($__2 = $__1.status) === void 0 ? 200 : $__2,
            data = ($__3 = $__1.data) === void 0 ? {} : $__3,
            delay = ($__4 = $__1.delay) === void 0 ? 0 : $__4;
        var defaultState = {};
        var defaultOption = {};
        var stateItem = states.find((function(_state) {
          return (url ? _state.url === url : _state.name === state);
        })) || defaultState;
        angular.extend(stateItem, {
          name: state || stateItem.name || url,
          url: url || stateItem.url,
          options: stateItem.options || []
        });
        if (stateItem === defaultState) {
          states.push(stateItem);
        }
        var option = stateItem.options.find((function(_option) {
          return _option.name === name;
        })) || defaultOption;
        angular.extend(option, {
          name: name,
          status: status,
          data: data,
          delay: delay
        });
        if (option === defaultOption) {
          stateItem.options.push(option);
        }
      },
      addBundle: function(name, options) {
        states[$traceurRuntime.toProperty(name)] = states[$traceurRuntime.toProperty(name)] || [];
        states[$traceurRuntime.toProperty(name)].unshift.apply(states[$traceurRuntime.toProperty(name)].unshift, options);
      }
    };
  }
  var $__default = configurationService;
  return {get default() {
      return $__default;
    }};
});
$traceurRuntime.options.symbols = true;
System.registerModule("../src/leonardo/window-body.drv.js", [], function() {
  "use strict";
  var __moduleName = "../src/leonardo/window-body.drv.js";
  function windowBodyDirective($http, configuration) {
    return {
      restrict: 'E',
      templateUrl: 'window-body.html',
      scope: true,
      replace: true,
      controller: function($scope) {
        $scope.states = configuration.states.map((function(state) {
          return angular.copy(state);
        }));
        $scope.states.forEach((function(state) {
          return state.options.forEach((function(option) {
            return option.active = true;
          }));
        }));
        $scope.selectedItem = 'activate';
      },
      link: function(scope) {
        scope.submit = function(value) {
          if (value) {
            $http.get(value).success(function(res) {
              scope.value = res;
            });
          }
        };
      }
    };
  }
  var $__default = windowBodyDirective;
  return {get default() {
      return $__default;
    }};
});
$traceurRuntime.options.symbols = true;
System.registerModule("../src/leonardo/module.js", [], function() {
  "use strict";
  var __moduleName = "../src/leonardo/module.js";
  var activatorDirective = System.get("../src/leonardo/activator.drv.js").default;
  var configurationService = System.get("../src/leonardo/configuration.srv.js").default;
  var windowBodyDirective = System.get("../src/leonardo/window-body.drv.js").default;
  var $__default = angular.module('leonardo', ['leonardo.templates', 'ngMockE2E']).run(run).factory('configuration', configurationService).directive('activator', activatorDirective).directive('windowBody', windowBodyDirective);
  function run(configuration, $httpBackend) {
    configuration.upsert({
      state: 'state1',
      name: 'get url1 aaaa',
      url: 'http://url1.com',
      status: 200,
      data: ["url1 aaa"]
    });
    configuration.upsert({
      state: 'state1',
      name: 'get url1 bbbb',
      status: 200,
      data: ["url1 bbb"]
    });
    configuration.upsert({
      url: 'http://url1.com',
      name: 'get url1 cccc',
      status: 200,
      data: ["url1 ccc"]
    });
    configuration.upsert({
      url: 'http://url2.com',
      name: 'get url2 a',
      status: 200,
      data: ["url2 aaa"]
    });
    configuration.upsert({
      url: 'http://url2.com',
      name: 'get url2 b',
      status: 200,
      data: ["url2 bbb"]
    });
  }
  return {get default() {
      return $__default;
    }};
});
System.get("../src/leonardo/module.js" + '');

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8wIiwiQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzYiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvNSIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci80IiwiLi4vc3JjL2xlb25hcmRvL2FjdGl2YXRvci5kcnYuanMiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvMSIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8zIiwiQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzIiLCIuLi9zcmMvbGVvbmFyZG8vY29uZmlndXJhdGlvbi5zcnYuanMiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvNyIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci84IiwiLi4vc3JjL2xlb25hcmRvL3dpbmRvdy1ib2R5LmRydi5qcyIsIi4uL3NyYy9sZW9uYXJkby9tb2R1bGUuanMiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvOSIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8xMCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxjQUFjLFFBQVEsUUFBUSxFQUFJLEtBQUcsQ0FBQTtBQ0FyQyxLQUFLLGVBQWUsQUFBQyxvQ0FBb0IsR0FBQyxDQ0ExQyxVQUFTLEFBQUQ7O0FDQVIsQUFBSSxJQUFBLENBQUEsWUFBVyxxQ0FBb0IsQ0FBQztBQ1dwQyxTQUFTLG1CQUFpQixDQUFFLFFBQU87QUFDakMsU0FBTztBQUNMLGFBQU8sQ0FBRyxJQUFFO0FBQ1osU0FBRyxDQUFHLFVBQVMsS0FBSSxDQUFHLENBQUEsSUFBRztBQUN2QixBQUFJLFVBQUEsQ0FBQSxFQUFDLEVBQUksQ0FBQSxDQUFBLEFBQUMsQ0FBQyw4REFBNkQsQ0FBQyxDQUFDO0FBRTFF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RyxDQUFHLEVBQUMsVUFBUyxDQUFDO0FBQUEsSUFBQyxDQUFDLENBQUM7QUFDeEgsZ0JBQVksT0FBTyxBQUFDLENBQUM7QUFBRSxVQUFJLENBQUcsU0FBTztBQUFHLFNBQUcsQ0FBRyxnQkFBYztBQUFHLFdBQUssQ0FBRSxJQUFFO0FBQUksU0FBRyxDQUFHLEVBQUMsVUFBUyxDQUFDO0FBQUEsSUFBQyxDQUFDLENBQUM7QUFDaEcsZ0JBQVksT0FBTyxBQUFDLENBQUM7QUFBRSxRQUFFLENBQUcsa0JBQWdCO0FBQUcsU0FBRyxDQUFHLGdCQUFjO0FBQUcsV0FBSyxDQUFFLElBQUU7QUFBSSxTQUFHLENBQUcsRUFBQyxVQUFTLENBQUM7QUFBQSxJQUFDLENBQUMsQ0FBQztBQUN2RyxnQkFBWSxPQUFPLEFBQUMsQ0FBQztBQUFFLFFBQUUsQ0FBRyxrQkFBZ0I7QUFBRyxTQUFHLENBQUcsYUFBVztBQUFHLFdBQUssQ0FBRSxJQUFFO0FBQUksU0FBRyxDQUFHLEVBQUMsVUFBUyxDQUFDO0FBQUEsSUFBQyxDQUFDLENBQUM7QUFDcEcsZ0JBQVksT0FBTyxBQUFDLENBQUM7QUFBRSxRQUFFLENBQUcsa0JBQWdCO0FBQUcsU0FBRyxDQUFHLGFBQVc7QUFBRyxXQUFLLENBQUUsSUFBRTtBQUFJLFNBQUcsQ0FBRyxFQUFDLFVBQVMsQ0FBQztBQUFBLElBQUMsQ0FBQyxDQUFDO0VBT3RHO0FBQUEsQU50QkEsU0NBQSxhQUF3QjtBQUFFLHVCQUF3QjtJQUFFLEVEQTdCO0FKRWpCLENERndELENBQUM7QWFBL0QsS0FBSyxJQUFJLEFBQUMsQ0FBQyw2QkFBbUIsR0FBQyxDQUFDLENBQUEiLCJmaWxlIjoiL1VzZXJzL3NmcmFua2VsL2Rldi9vdXRicmFpbi9MZW9uYXJkby9kaXN0L21vZHVsZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIiR0cmFjZXVyUnVudGltZS5vcHRpb25zLnN5bWJvbHMgPSB0cnVlIiwiU3lzdGVtLnJlZ2lzdGVyTW9kdWxlKCRfX3BsYWNlaG9sZGVyX18wLCBbXSwgJF9fcGxhY2Vob2xkZXJfXzEpOyIsImZ1bmN0aW9uKCkge1xuICAgICAgICAkX19wbGFjZWhvbGRlcl9fMFxuICAgICAgfSIsInZhciBfX21vZHVsZU5hbWUgPSAkX19wbGFjZWhvbGRlcl9fMDsiLG51bGwsInZhciAkX19kZWZhdWx0ID0gJF9fcGxhY2Vob2xkZXJfXzAiLCJyZXR1cm4gJF9fcGxhY2Vob2xkZXJfXzAiLCJnZXQgJF9fcGxhY2Vob2xkZXJfXzAoKSB7IHJldHVybiAkX19wbGFjZWhvbGRlcl9fMTsgfSIsbnVsbCwiKCRfX3BsYWNlaG9sZGVyX18wID0gJF9fcGxhY2Vob2xkZXJfXzEuJF9fcGxhY2Vob2xkZXJfXzIpID09PSB2b2lkIDAgP1xuICAgICAgICAkX19wbGFjZWhvbGRlcl9fMyA6ICRfX3BsYWNlaG9sZGVyX180IiwiJF9fcGxhY2Vob2xkZXJfXzBbJHRyYWNldXJSdW50aW1lLnRvUHJvcGVydHkoJF9fcGxhY2Vob2xkZXJfXzEpXSIsbnVsbCxudWxsLCJTeXN0ZW0uZ2V0KCRfX3BsYWNlaG9sZGVyX18wKSIsIlN5c3RlbS5nZXQoJF9fcGxhY2Vob2xkZXJfXzAgKycnKSJdfQ==

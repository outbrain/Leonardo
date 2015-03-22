$traceurRuntime.options.symbols = true;
System.registerModule("../src/leonardo/activator.drv.js", [], function() {
  "use strict";
  var __moduleName = "../src/leonardo/activator.drv.js";
  function activatorDirective($compile) {
    return {
      restrict: 'A',
      link: function(scope, elem) {
        var el = angular.element('<div ng-click="activate()" class="leonardo-activator"></div>');
        var win = angular.element(['<div class="leonardo-window">', '<div class="leonardo-header">Leonardo Configuration</div>', '<window-body></window-body>', '</div>', '</div>'].join(''));
        $compile(el)(scope);
        $compile(win)(scope);
        elem.append(el);
        elem.append(win);
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
  function configurationService($q, activeStatesStore, $httpBackend) {
    var states = [];
    var stateReq = {};
    var upsertOption = function(state, name, active) {
      var states = activeStatesStore.get('states') || {};
      states[$traceurRuntime.toProperty(state)] = {
        name: name,
        active: active
      };
      activeStatesStore.set('states', states);
      return sync();
    };
    function fetchStates() {
      var activeStates = activeStatesStore.get('states');
      var _states = states.map((function(state) {
        return angular.copy(state);
      }));
      _states.forEach(function(state) {
        var option = activeStates[$traceurRuntime.toProperty(state.name)];
        state.active = !!option && option.active;
        state.activeOption = !!option ? state.options.find((function(_option) {
          return _option.name === option.name;
        })) : state.options[0];
      });
      return $q.when(_states);
    }
    function findStateOption(name) {
      return fetchStates().then(function(states) {
        return states.find((function(state) {
          return state.name === name;
        })).activeOption;
      });
    }
    function sync() {
      return fetchStates().then(function(states) {
        var defer = $q.defer();
        var promise = defer.promise;
        defer.resolve();
        states.forEach(function(state) {
          promise = promise.then(function() {
            return findStateOption(state.name).then(function(option) {
              if (state.active) {
                stateReq[$traceurRuntime.toProperty(state.name)].respond(function() {
                  return [option.status, option.data];
                });
              } else {
                stateReq[$traceurRuntime.toProperty(state.name)].passThrough();
              }
            });
          });
        });
        return promise;
      });
    }
    var initialized = fetchStates().then(function() {
      (states || []).forEach(function(state) {
        stateReq[$traceurRuntime.toProperty(state.name)] = $httpBackend.when(state.verb || 'GET', new RegExp(state.url));
      });
    });
    return {
      states: states,
      initialize: function() {
        return initialized.then(sync);
      },
      active_states_option: [],
      upsertOption: upsertOption,
      fetchStates: fetchStates,
      upsert: function($__1) {
        var $__3,
            $__4,
            $__5;
        var $__2 = $__1,
            verb = $__2.verb,
            state = $__2.state,
            name = $__2.name,
            url = $__2.url,
            status = ($__3 = $__2.status) === void 0 ? 200 : $__3,
            data = ($__4 = $__2.data) === void 0 ? {} : $__4,
            delay = ($__5 = $__2.delay) === void 0 ? 0 : $__5;
        var defaultState = {};
        var defaultOption = {};
        var stateItem = states.find((function(_state) {
          return (url ? _state.url === url : _state.name === state);
        })) || defaultState;
        angular.extend(stateItem, {
          name: state || stateItem.name || url,
          url: url || stateItem.url,
          verb: verb || stateItem.verb,
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
      upsertMany: function(items) {
        var $__0 = this;
        items.forEach((function(item) {
          return $__0.upsert(item);
        }));
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
        $scope.selectedItem = 'activate';
        configuration.fetchStates().then(function(states) {
          $scope.states = states;
          $scope.changeActive = function(state) {
            console.log("activate: " + state.name + " " + state.active);
            configuration.upsertOption(state.name, state.activeOption.name, state.active);
          };
          states.forEach(function(state) {
            $scope.$watch(function() {
              return state.activeOption;
            }, function(activeOption, oldValue) {
              if (activeOption !== oldValue) {
                console.log("select: " + state.name + " " + activeOption.name + " " + state.active);
                configuration.upsertOption(state.name, activeOption.name, state.active);
              }
            });
          });
        });
      },
      link: function(scope) {
        scope.test = {
          url: '',
          value: undefined
        };
        scope.submit = function(url) {
          scope.test.value = undefined;
          scope.url = url;
          if (url) {
            $http.get(url).success(function(res) {
              scope.test.value = res;
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
  var $__default = angular.module('leonardo', ['leonardo.templates', 'angular-storage', 'ngMockE2E']).factory('configuration', configurationService).factory('activeStatesStore', function(store) {
    return store.getNamespacedStore('active_states');
  }).directive('activator', activatorDirective).directive('windowBody', windowBodyDirective);
  return {get default() {
      return $__default;
    }};
});
System.get("../src/leonardo/module.js" + '');

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8wIiwiQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzYiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvNSIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci80IiwiLi4vc3JjL2xlb25hcmRvL2FjdGl2YXRvci5kcnYuanMiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvMSIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8zIiwiQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzIiLCIuLi9zcmMvbGVvbmFyZG8vY29uZmlndXJhdGlvbi5zcnYuanMiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvOCIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci83IiwiLi4vc3JjL2xlb25hcmRvL3dpbmRvdy1ib2R5LmRydi5qcyIsIi4uL3NyYy9sZW9uYXJkby9tb2R1bGUuanMiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvOSIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8xMCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxjQUFjLFFBQVEsUUFBUSxFQUFJLEtBQUcsQ0FBQTtBQ0FyQyxLQUFLLGVBQWUsQUFBQyxvQ0FBb0IsR0FBQyxDQ0ExQyxVQUFTLEFBQUQ7O0FDQVIsQUFBSSxJQUFBLENBQUEsWUFBVyxxQ0FBb0IsQ0FBQztBQ0FwQyxTQUFTLG1CQUFpQixDQUFFLFFBQU87QUFDakMsU0FBTztBQUNMLGFBQU8sQ0FBRyxJQUFFO0FBQ1osU0FBRyxDQUFHLFVBQVMsS0FBSSxDQUFHLENBQUEsSUFBRztBQUN2QixBQUFJLFVBQUEsQ0FBQSxFQUFDLEVBQUksQ0FBQSxPQUFNLFFBQVEsQUFBQyxDQUFDLDhEQUE2RCxDQUFDLENBQUM7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Q0FBQSxVQUFTLEVPSUUsQ0FBQSxPQUFNLE9BQU8sQUFBQyxDQUFDLFVBQVMsQ0FBRyxFQUFDLG9CQUFtQixDQUFHLGtCQUFnQixDQUFHLFlBQVUsQ0FBQyxDQUFDLFFBQ3ZGLEFBQUMsQ0FBQyxlQUFjLENBQUcscUJBQW1CLENBQUMsUUFDdkMsQUFBQyxDQUFDLG1CQUFrQixDQUFHLFVBQVMsS0FBSSxDQUFHO0FBQzVDLFNBQU8sQ0FBQSxLQUFJLG1CQUFtQixBQUFDLENBQUMsZUFBYyxDQUFDLENBQUM7RUFDbEQsQ0FBQyxVQUNRLEFBQUMsQ0FBQyxXQUFVLENBQUcsbUJBQWlCLENBQUMsVUFDakMsQUFBQyxDQUFDLFlBQVcsQ0FBRyxvQkFBa0IsQ0FBQyxBUFZiLENBQUE7QUNBakMsU0NBQSxhQUF3QjtBQUFFLHVCQUF3QjtJQUFFLEVEQTdCO0FKRWpCLENERndELENBQUM7QWFBL0QsS0FBSyxJQUFJLEFBQUMsQ0FBQyw2QkFBbUIsR0FBQyxDQUFDLENBQUEiLCJmaWxlIjoiL1VzZXJzL3NmcmFua2VsL2Rldi9vdXRicmFpbi9MZW9uYXJkby9kaXN0L21vZHVsZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIiR0cmFjZXVyUnVudGltZS5vcHRpb25zLnN5bWJvbHMgPSB0cnVlIiwiU3lzdGVtLnJlZ2lzdGVyTW9kdWxlKCRfX3BsYWNlaG9sZGVyX18wLCBbXSwgJF9fcGxhY2Vob2xkZXJfXzEpOyIsImZ1bmN0aW9uKCkge1xuICAgICAgICAkX19wbGFjZWhvbGRlcl9fMFxuICAgICAgfSIsInZhciBfX21vZHVsZU5hbWUgPSAkX19wbGFjZWhvbGRlcl9fMDsiLG51bGwsInZhciAkX19kZWZhdWx0ID0gJF9fcGxhY2Vob2xkZXJfXzAiLCJyZXR1cm4gJF9fcGxhY2Vob2xkZXJfXzAiLCJnZXQgJF9fcGxhY2Vob2xkZXJfXzAoKSB7IHJldHVybiAkX19wbGFjZWhvbGRlcl9fMTsgfSIsbnVsbCwiJF9fcGxhY2Vob2xkZXJfXzBbJHRyYWNldXJSdW50aW1lLnRvUHJvcGVydHkoJF9fcGxhY2Vob2xkZXJfXzEpXSIsIigkX19wbGFjZWhvbGRlcl9fMCA9ICRfX3BsYWNlaG9sZGVyX18xLiRfX3BsYWNlaG9sZGVyX18yKSA9PT0gdm9pZCAwID9cbiAgICAgICAgJF9fcGxhY2Vob2xkZXJfXzMgOiAkX19wbGFjZWhvbGRlcl9fNCIsbnVsbCxudWxsLCJTeXN0ZW0uZ2V0KCRfX3BsYWNlaG9sZGVyX18wKSIsIlN5c3RlbS5nZXQoJF9fcGxhY2Vob2xkZXJfXzAgKycnKSJdfQ==

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
    var activeStates = {};
    var stateReq = {};
    var upsertOption = function(state, name, active) {
      var states = activeStatesStore.get('states');
      states[$traceurRuntime.toProperty(state)] = {
        name: name,
        active: active
      };
      activeStatesStore.set('states', states);
      return sync();
    };
    var select = function() {
      var states = [];
      for (var state in activeStatesStore.get('states'))
        if (!$traceurRuntime.isSymbolString(state)) {
          states.push({
            name: state.name,
            active: state.active
          });
        }
      return $q.when(states);
    };
    function fetchStates() {
      return select().then(function(states) {
        var _states = states.map((function(state) {
          return angular.copy(state);
        }));
        _states.forEach(function(state) {
          var option = activeStates[$traceurRuntime.toProperty(state.name)];
          state.active = !!option;
          state.activeOption = !!option ? state.options.find((function(_option) {
            return _option.name === option;
          })) : state.options[0];
        });
        return _states;
      });
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
    var initialized = fetchStates().then(function(states) {
      states.forEach(function(state) {
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8wIiwiQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzYiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvNSIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci80IiwiLi4vc3JjL2xlb25hcmRvL2FjdGl2YXRvci5kcnYuanMiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvMSIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8zIiwiQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzIiLCIuLi9zcmMvbGVvbmFyZG8vY29uZmlndXJhdGlvbi5zcnYuanMiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvOCIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci85IiwiQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzciLCIuLi9zcmMvbGVvbmFyZG8vd2luZG93LWJvZHkuZHJ2LmpzIiwiLi4vc3JjL2xlb25hcmRvL21vZHVsZS5qcyIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8xMCIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8xMSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxjQUFjLFFBQVEsUUFBUSxFQUFJLEtBQUcsQ0FBQTtBQ0FyQyxLQUFLLGVBQWUsQUFBQyxvQ0FBb0IsR0FBQyxDQ0ExQyxVQUFTLEFBQUQ7O0FDQVIsQUFBSSxJQUFBLENBQUEsWUFBVyxxQ0FBb0IsQ0FBQztBQ0FwQyxTQUFTLG1CQUFpQixDQUFFLFFBQU87QUFDakMsU0FBTztBQUNMLGFBQU8sQ0FBRyxJQUFFO0FBQ1osU0FBRyxDQUFHLFVBQVMsS0FBSSxDQUFHLENBQUEsSUFBRztBQUN2QixBQUFJLFVBQUEsQ0FBQSxFQUFDLEVBQUksQ0FB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QWpDLFNDQUEsYUFBd0I7QUFBRSx1QkFBd0I7SUFBRSxFREE3QjtBSkVqQixDREZ3RCxDQUFDO0FEQS9ELGNBQWMsUUFBUSxRQUFRLEVBQUksS0FBRyxDQUFBO0FDQXJDLEtBQUssZUFBZSxBQUFDLDZCQUFvQixHQUFDLENDQTFDLFVBQVMsQUFBRDs7QUNBUixBQUFJLElBQUEsQ0FBQSxZQUFXLDhCQUFvQixDQUFDO0lVQTdCLG1CQUFpQixFQ0F4QixDQUFBLE1BQUssSUFBSSxBQUFDLG9DQUFrQjtJRENyQixxQkFBbUIsRUNEMUIsQ0FBQSxNQUFLLElBQUksQUFBQyx3Q0FBa0I7SURFckIsb0JBQWtCLEVDRnpCLENBQUEsTUFBSyxJQUFJLEFBQUMsc0NBQWtCO0FUQTVCLEFBQUksSUFBQSxDQUFBLFVBQVMsRVFJRSxDQUFBLE9BQU0sT0FBTyxBQUFDLENBQUMsVUFBUyxDQUFHLEVBQUMsb0JBQW1CLENBQUcsa0JBQWdCLENBQUcsWUFBVSxDQUFDLENBQUMsUUFDdkYsQUFBQyxDQUFDLGVBQWMsQ0FBRyxxQkFBbUIsQ0FBQyxRQUN2QyxBQUFDLENBQUMsbUJBQWtCLENBQUcsVUFBUyxLQUFJLENBQUc7QUFDNUMsU0FBTyxDQUFBLEtBQUksbUJBQW1CLEFBQUMsQ0FBQyxlQUFjLENBQUMsQ0FBQztFQUNsRCxDQUFDLFVBQ1EsQUFBQyxDQUFDLFdBQVUsQ0FBRyxtQkFBaUIsQ0FBQyxVQUNqQyxBQUFDLENBQUMsWUFBVyxDQUFHLG9CQUFrQixDQUFDLEFSVmIsQ0FBQTtBQ0FqQyxTQ0FBLGFBQXdCO0FBQUUsdUJBQXdCO0lBQUUsRURBN0I7QUpFakIsQ0RGd0QsQ0FBQztBY0EvRCxLQUFLLElBQUksQUFBQyxDQUFDLDZCQUFtQixHQUFDLENBQUMsQ0FBQSIsImZpbGUiOiIvVXNlcnMvc2ZyYW5rZWwvZGV2L291dGJyYWluL0xlb25hcmRvL2Rpc3QvbW9kdWxlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJHRyYWNldXJSdW50aW1lLm9wdGlvbnMuc3ltYm9scyA9IHRydWUiLCJTeXN0ZW0ucmVnaXN0ZXJNb2R1bGUoJF9fcGxhY2Vob2xkZXJfXzAsIFtdLCAkX19wbGFjZWhvbGRlcl9fMSk7IiwiZnVuY3Rpb24oKSB7XG4gICAgICAgICRfX3BsYWNlaG9sZGVyX18wXG4gICAgICB9IiwidmFyIF9fbW9kdWxlTmFtZSA9ICRfX3BsYWNlaG9sZGVyX18wOyIsbnVsbCwidmFyICRfX2RlZmF1bHQgPSAkX19wbGFjZWhvbGRlcl9fMCIsInJldHVybiAkX19wbGFjZWhvbGRlcl9fMCIsImdldCAkX19wbGFjZWhvbGRlcl9fMCgpIHsgcmV0dXJuICRfX3BsYWNlaG9sZGVyX18xOyB9IixudWxsLCIkX19wbGFjZWhvbGRlcl9fMFskdHJhY2V1clJ1bnRpbWUudG9Qcm9wZXJ0eSgkX19wbGFjZWhvbGRlcl9fMSldIiwiaWYgKCEkdHJhY2V1clJ1bnRpbWUuaXNTeW1ib2xTdHJpbmcoJF9fcGxhY2Vob2xkZXJfXzApKSAkX19wbGFjZWhvbGRlcl9fMSIsIigkX19wbGFjZWhvbGRlcl9fMCA9ICRfX3BsYWNlaG9sZGVyX18xLiRfX3BsYWNlaG9sZGVyX18yKSA9PT0gdm9pZCAwID9cbiAgICAgICAgJF9fcGxhY2Vob2xkZXJfXzMgOiAkX19wbGFjZWhvbGRlcl9fNCIsbnVsbCxudWxsLCJTeXN0ZW0uZ2V0KCRfX3BsYWNlaG9sZGVyX18wKSIsIlN5c3RlbS5nZXQoJF9fcGxhY2Vob2xkZXJfXzAgKycnKSJdfQ==

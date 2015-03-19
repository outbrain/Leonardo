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
  function configurationService($q, $httpBackend) {
    var states = [];
    var activeStates = {};
    var stateReq = {};
    var db = openDatabase("leonardo.db", '1.0', "Leonardo WebSQL Database", 2 * 1024 * 1024);
    db.transaction(function(tx) {
      tx.executeSql("CREATE TABLE IF NOT EXISTS active_states_option (state PRIMARY KEY, name text, active text)", [], sync);
    });
    var upsertOption = function(state, name, active) {
      var defer = $q.defer();
      db.transaction(function(tx) {
        tx.executeSql("INSERT OR REPLACE into active_states_option (state, name, active) VALUES (?,?, ?)", [state, name, active], function() {
          sync().then(function() {
            defer.resolve();
          });
        });
      });
      return defer.promise;
    };
    var select = function() {
      var defer = $q.defer();
      db.transaction(function(tx) {
        tx.executeSql("SELECT * from active_states_option", [], function(tx, results) {
          defer.resolve(results.rows);
        });
      });
      return defer.promise;
    };
    function fetchStates() {
      return select().then(function(rows) {
        for (var i = 0; i < rows.length; i++) {
          activeStates[$traceurRuntime.toProperty(rows.item(i).state)] = {
            name: rows.item(i).name,
            active: (rows.item(i).active === "true")
          };
        }
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
  var $__default = angular.module('leonardo', ['leonardo.templates', 'ngMockE2E']).factory('configuration', configurationService).directive('activator', activatorDirective).directive('windowBody', windowBodyDirective);
  return {get default() {
      return $__default;
    }};
});
System.get("../src/leonardo/module.js" + '');

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8wIiwiQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzYiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvNSIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci80IiwiLi4vc3JjL2xlb25hcmRvL2FjdGl2YXRvci5kcnYuanMiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvMSIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8zIiwiQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzIiLCIuLi9zcmMvbGVvbmFyZG8vY29uZmlndXJhdGlvbi5zcnYuanMiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvOCIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci83IiwiLi4vc3JjL2xlb25hcmRvL3dpbmRvdy1ib2R5LmRydi5qcyIsIi4uL3NyYy9sZW9uYXJkby9tb2R1bGUuanMiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvOSIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8xMCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxjQUFjLFFBQVEsUUFBUSxFQUFJLEtBQUcsQ0FBQTtBQ0FyQyxLQUFLLGVBQWUsQUFBQyxvQ0FBb0IsR0FBQyxDQ0ExQyxVQUFTLEFBQUQ7O0FDQVIsQUFBSSxJQUFBLENBQUEsWUFBVyxxQ0FBb0IsQ0FBQztBQ0FwQyxTQUFTLG1CQUFpQixDQUFFLFFBQU87QUFDakMsU0FBTztBQUNMLGFBQU8sQ0FBRyxJQUFFO0FBQ1osU0FBRyxDQUFHLFVBQVMsS0FBSSxDQUFHLENBQUEsSUFBRztBQUN2QixBQUFJLFVBQUEsQ0FBQSxFQUFDLEVBQUksQ0FBQSxPQUFNLFFBQVEsQUFBQyxDQUFDLDhEQUE2RCxDQUFDLENBQUM7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LHdDQUFrQjtJREVyQixvQkFBa0IsRUNGekIsQ0FBQSxNQUFLLElBQUksQUFBQyxzQ0FBa0I7QVJBNUIsQUFBSSxJQUFBLENBQUEsVUFBUyxFT0lFLENBQUEsT0FBTSxPQUFPLEFBQUMsQ0FBQyxVQUFTLENBQUcsRUFBQyxvQkFBbUIsQ0FBRyxZQUFVLENBQUMsQ0FBQyxRQUNwRSxBQUFDLENBQUMsZUFBYyxDQUFHLHFCQUFtQixDQUFDLFVBQ3JDLEFBQUMsQ0FBQyxXQUFVLENBQUcsbUJBQWlCLENBQUMsVUFDakMsQUFBQyxDQUFDLFlBQVcsQ0FBRyxvQkFBa0IsQ0FBQyxBUFBiLENBQUE7QUNBakMsU0NBQSxhQUF3QjtBQUFFLHVCQUF3QjtJQUFFLEVEQTdCO0FKRWpCLENERndELENBQUM7QWFBL0QsS0FBSyxJQUFJLEFBQUMsQ0FBQyw2QkFBbUIsR0FBQyxDQUFDLENBQUEiLCJmaWxlIjoiL1VzZXJzL3NmcmFua2VsL2Rldi9vdXRicmFpbi9MZW9uYXJkby9kaXN0L21vZHVsZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIiR0cmFjZXVyUnVudGltZS5vcHRpb25zLnN5bWJvbHMgPSB0cnVlIiwiU3lzdGVtLnJlZ2lzdGVyTW9kdWxlKCRfX3BsYWNlaG9sZGVyX18wLCBbXSwgJF9fcGxhY2Vob2xkZXJfXzEpOyIsImZ1bmN0aW9uKCkge1xuICAgICAgICAkX19wbGFjZWhvbGRlcl9fMFxuICAgICAgfSIsInZhciBfX21vZHVsZU5hbWUgPSAkX19wbGFjZWhvbGRlcl9fMDsiLG51bGwsInZhciAkX19kZWZhdWx0ID0gJF9fcGxhY2Vob2xkZXJfXzAiLCJyZXR1cm4gJF9fcGxhY2Vob2xkZXJfXzAiLCJnZXQgJF9fcGxhY2Vob2xkZXJfXzAoKSB7IHJldHVybiAkX19wbGFjZWhvbGRlcl9fMTsgfSIsbnVsbCwiJF9fcGxhY2Vob2xkZXJfXzBbJHRyYWNldXJSdW50aW1lLnRvUHJvcGVydHkoJF9fcGxhY2Vob2xkZXJfXzEpXSIsIigkX19wbGFjZWhvbGRlcl9fMCA9ICRfX3BsYWNlaG9sZGVyX18xLiRfX3BsYWNlaG9sZGVyX18yKSA9PT0gdm9pZCAwID9cbiAgICAgICAgJF9fcGxhY2Vob2xkZXJfXzMgOiAkX19wbGFjZWhvbGRlcl9fNCIsbnVsbCxudWxsLCJTeXN0ZW0uZ2V0KCRfX3BsYWNlaG9sZGVyX18wKSIsIlN5c3RlbS5nZXQoJF9fcGxhY2Vob2xkZXJfXzAgKycnKSJdfQ==

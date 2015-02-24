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
  function configurationService($q) {
    var states = [];
    var db = openDatabase("leonardo.db", '1.0', "Leonardo WebSQL Database", 2 * 1024 * 1024);
    db.transaction(function(tx) {
      tx.executeSql("CREATE TABLE IF NOT EXISTS active_states_option (state PRIMARY KEY, name text, active text)");
    });
    var upsertOption = function(state, name, active) {
      db.transaction(function(tx) {
        tx.executeSql("INSERT OR REPLACE into active_states_option (state, name, active) VALUES (?,?, ?)", [state, name, active]);
      });
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
    select();
    return {
      states: states,
      getActiveStateOptions: select,
      active_states_option: [],
      upsertOption: upsertOption,
      upsert: function($__1) {
        var $__3,
            $__4,
            $__5;
        var $__2 = $__1,
            state = $__2.state,
            name = $__2.name,
            url = $__2.url,
            status = ($__3 = $__2.status) === void 0 ? 200 : $__3,
            data = ($__4 = $__2.data) === void 0 ? {} : $__4,
            delay = ($__5 = $__2.delay) === void 0 ? 0 : $__5;
        debugger;
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
      upsertMany: function(items) {
        var $__0 = this;
        debugger;
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
        configuration.getActiveStateOptions().then(function(rows) {
          var activeStates = {};
          for (var i = 0; i < rows.length; i++) {
            activeStates[$traceurRuntime.toProperty(rows.item(i).state)] = {
              name: rows.item(i).name,
              active: (rows.item(i).active === "true")
            };
          }
          $scope.states = configuration.states.map((function(state) {
            return angular.copy(state);
          }));
          $scope.states.forEach(function(state) {
            var option = activeStates[$traceurRuntime.toProperty(state.name)];
            state.active = !!option && option.active;
            state.activeOption = !!option ? state.options.find((function(_option) {
              return _option.name === option.name;
            })) : state.options[0];
          });
          $scope.changeActive = function(state) {
            console.log("activate: " + state.name + " " + state.active);
            configuration.upsertOption(state.name, state.activeOption.name, state.active);
          };
          $scope.states.forEach(function(state) {
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
  var $__default = angular.module('leonardo', ['leonardo.templates', 'ngMockE2E']).factory('configuration', configurationService).directive('activator', activatorDirective).directive('windowBody', windowBodyDirective);
  return {get default() {
      return $__default;
    }};
});
System.get("../src/leonardo/module.js" + '');

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8wIiwiQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzYiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvNSIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci80IiwiLi4vc3JjL2xlb25hcmRvL2FjdGl2YXRvci5kcnYuanMiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvMSIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8zIiwiQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzIiLCIuLi9zcmMvbGVvbmFyZG8vY29uZmlndXJhdGlvbi5zcnYuanMiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvNyIsIi4uL3NyYy9sZW9uYXJkby93aW5kb3ctYm9keS5kcnYuanMiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvOCIsIi4uL3NyYy9sZW9uYXJkby9tb2R1bGUuanMiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvOSIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8xMCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxjQUFjLFFBQVEsUUFBUSxFQUFJLEtBQUcsQ0FBQTtBQ0FyQyxLQUFLLGVBQWUsQUFBQyxvQ0FBb0IsR0FBQyxDQ0ExQyxVQUFTLEFBQUQ7O0FDQVIsQUFBSSxJQUFBLENBQUEsWUFBVyxxQ0FBb0IsQ0FBQztBQ1dwQyxTQUFTLG1CQUFpQixDQUFFLFFBQU87QUFDakMsU0FBTztBQUNMLGFBQU8sQ0FBRyxJQUFFO0FBQ1osU0FBRyxDQUFHLFVBQVMsS0FBSSxDQUFHLENBQUEsSUFBRztBQUN2QixBQUFJLFVBQUEsQ0FBQSxFQUFDLEVBQUksQ0FBQSxDQUFBLEFBQUMsQ0FBQyw4REFBNkQsQ0FBQyxDQUFDO0FBRTFF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RSxBQUFDLENBQUMsZUFBYyxDQUFHLHFCQUFtQixDQUFDLFVBQ3JDLEFBQUMsQ0FBQyxXQUFVLENBQUcsbUJBQWlCLENBQUMsVUFDakMsQUFBQyxDQUFDLFlBQVcsQ0FBRyxvQkFBa0IsQ0FBQyxBUFBiLENBQUE7QUNBakMsU0NBQSxhQUF3QjtBQUFFLHVCQUF3QjtJQUFFLEVEQTdCO0FKRWpCLENERndELENBQUM7QWFBL0QsS0FBSyxJQUFJLEFBQUMsQ0FBQyw2QkFBbUIsR0FBQyxDQUFDLENBQUEiLCJmaWxlIjoiL1VzZXJzL3NmcmFua2VsL2Rldi9vdXRicmFpbi9MZW9uYXJkby9kaXN0L21vZHVsZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIiR0cmFjZXVyUnVudGltZS5vcHRpb25zLnN5bWJvbHMgPSB0cnVlIiwiU3lzdGVtLnJlZ2lzdGVyTW9kdWxlKCRfX3BsYWNlaG9sZGVyX18wLCBbXSwgJF9fcGxhY2Vob2xkZXJfXzEpOyIsImZ1bmN0aW9uKCkge1xuICAgICAgICAkX19wbGFjZWhvbGRlcl9fMFxuICAgICAgfSIsInZhciBfX21vZHVsZU5hbWUgPSAkX19wbGFjZWhvbGRlcl9fMDsiLG51bGwsInZhciAkX19kZWZhdWx0ID0gJF9fcGxhY2Vob2xkZXJfXzAiLCJyZXR1cm4gJF9fcGxhY2Vob2xkZXJfXzAiLCJnZXQgJF9fcGxhY2Vob2xkZXJfXzAoKSB7IHJldHVybiAkX19wbGFjZWhvbGRlcl9fMTsgfSIsbnVsbCwiKCRfX3BsYWNlaG9sZGVyX18wID0gJF9fcGxhY2Vob2xkZXJfXzEuJF9fcGxhY2Vob2xkZXJfXzIpID09PSB2b2lkIDAgP1xuICAgICAgICAkX19wbGFjZWhvbGRlcl9fMyA6ICRfX3BsYWNlaG9sZGVyX180IixudWxsLCIkX19wbGFjZWhvbGRlcl9fMFskdHJhY2V1clJ1bnRpbWUudG9Qcm9wZXJ0eSgkX19wbGFjZWhvbGRlcl9fMSldIixudWxsLCJTeXN0ZW0uZ2V0KCRfX3BsYWNlaG9sZGVyX18wKSIsIlN5c3RlbS5nZXQoJF9fcGxhY2Vob2xkZXJfXzAgKycnKSJdfQ==

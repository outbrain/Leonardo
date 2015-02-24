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
  function configurationService($q, $httpBackend) {
    var states = [];
    var activeStates = {};
    var stateReq = {};
    var db = openDatabase("leonardo.db", '1.0', "Leonardo WebSQL Database", 2 * 1024 * 1024);
    db.transaction(function(tx) {
      tx.executeSql("CREATE TABLE IF NOT EXISTS active_states_option (state PRIMARY KEY, name text, active text)");
      sync();
    });
    var upsertOption = function(state, name, active) {
      db.transaction(function(tx) {
        tx.executeSql("INSERT OR REPLACE into active_states_option (state, name, active) VALUES (?,?, ?)", [state, name, active]);
        sync();
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
        states.forEach(function(state) {
          findStateOption(state.name).then(function(option) {
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
    }
    var initialized = fetchStates().then(function(states) {
      states.forEach(function(state) {
        stateReq[$traceurRuntime.toProperty(state.name)] = $httpBackend.when('GET', new RegExp(state.url));
      });
    });
    return {
      states: states,
      initialied: function() {
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8wIiwiQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzYiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvNSIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci80IiwiLi4vc3JjL2xlb25hcmRvL2FjdGl2YXRvci5kcnYuanMiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvMSIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8zIiwiQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzIiLCIuLi9zcmMvbGVvbmFyZG8vY29uZmlndXJhdGlvbi5zcnYuanMiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvOCIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci83IiwiLi4vc3JjL2xlb25hcmRvL3dpbmRvdy1ib2R5LmRydi5qcyIsIi4uL3NyYy9sZW9uYXJkby9tb2R1bGUuanMiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvOSIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8xMCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxjQUFjLFFBQVEsUUFBUSxFQUFJLEtBQUcsQ0FBQTtBQ0FyQyxLQUFLLGVBQWUsQUFBQyxvQ0FBb0IsR0FBQyxDQ0ExQyxVQUFTLEFBQUQ7O0FDQVIsQUFBSSxJQUFBLENBQUEsWUFBVyxxQ0FBb0IsQ0FBQztBQ1dwQyxTQUFTLG1CQUFpQixDQUFFLFFBQU87QUFDakMsU0FBTztBQUNMLGFBQU8sQ0FBRyxJQUFFO0FBQ1osU0FBRyxDQUFHLFVBQVMsS0FBSSxDQUFHLENBQUEsSUFBRztBQUN2QixBQUFJLFVBQUEsQ0FBQSxFQUFDLEVBQUksQ0FBQSxDQUFBLEFBQUMsQ0FBQyw4REFBNkQsQ0FBQyxDQUFDO0FBRTFF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REUsb0JBQWtCLEFOcERBLENBQUE7QUNBakMsU0NBQSxhQUF3QjtBQUFFLHVCQUF3QjtJQUFFLEVEQTdCO0FKRWpCLENERndELENBQUM7QURBL0QsY0FBYyxRQUFRLFFBQVEsRUFBSSxLQUFHLENBQUE7QUNBckMsS0FBSyxlQUFlLEFBQUMsNkJBQW9CLEdBQUMsQ0NBMUMsVUFBUyxBQUFEOztBQ0FSLEFBQUksSUFBQSxDQUFBLFlBQVcsOEJBQW9CLENBQUM7SVNBN0IsbUJBQWlCLEVDQXhCLENBQUEsTUFBSyxJQUFJLEFBQUMsb0NBQWtCO0lEQ3JCLHFCQUFtQixFQ0QxQixDQUFBLE1BQUssSUFBSSxBQUFDLHdDQUFrQjtJREVyQixvQkFBa0IsRUNGekIsQ0FBQSxNQUFLLElBQUksQUFBQyxzQ0FBa0I7QVJBNUIsQUFBSSxJQUFBLENBQUEsVUFBUyxFT0lFLENBQUEsT0FBTSxPQUFPLEFBQUMsQ0FBQyxVQUFTLENBQUcsRUFBQyxvQkFBbUIsQ0FBRyxZQUFVLENBQUMsQ0FBQyxRQUNwRSxBQUFDLENBQUMsZUFBYyxDQUFHLHFCQUFtQixDQUFDLFVBQ3JDLEFBQUMsQ0FBQyxXQUFVLENBQUcsbUJBQWlCLENBQUMsVUFDakMsQUFBQyxDQUFDLFlBQVcsQ0FBRyxvQkFBa0IsQ0FBQyxBUFBiLENBQUE7QUNBakMsU0NBQSxhQUF3QjtBQUFFLHVCQUF3QjtJQUFFLEVEQTdCO0FKRWpCLENERndELENBQUM7QWFBL0QsS0FBSyxJQUFJLEFBQUMsQ0FBQyw2QkFBbUIsR0FBQyxDQUFDLENBQUEiLCJmaWxlIjoiL1VzZXJzL3NmcmFua2VsL2Rldi9vdXRicmFpbi9MZW9uYXJkby9kaXN0L21vZHVsZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIiR0cmFjZXVyUnVudGltZS5vcHRpb25zLnN5bWJvbHMgPSB0cnVlIiwiU3lzdGVtLnJlZ2lzdGVyTW9kdWxlKCRfX3BsYWNlaG9sZGVyX18wLCBbXSwgJF9fcGxhY2Vob2xkZXJfXzEpOyIsImZ1bmN0aW9uKCkge1xuICAgICAgICAkX19wbGFjZWhvbGRlcl9fMFxuICAgICAgfSIsInZhciBfX21vZHVsZU5hbWUgPSAkX19wbGFjZWhvbGRlcl9fMDsiLG51bGwsInZhciAkX19kZWZhdWx0ID0gJF9fcGxhY2Vob2xkZXJfXzAiLCJyZXR1cm4gJF9fcGxhY2Vob2xkZXJfXzAiLCJnZXQgJF9fcGxhY2Vob2xkZXJfXzAoKSB7IHJldHVybiAkX19wbGFjZWhvbGRlcl9fMTsgfSIsbnVsbCwiJF9fcGxhY2Vob2xkZXJfXzBbJHRyYWNldXJSdW50aW1lLnRvUHJvcGVydHkoJF9fcGxhY2Vob2xkZXJfXzEpXSIsIigkX19wbGFjZWhvbGRlcl9fMCA9ICRfX3BsYWNlaG9sZGVyX18xLiRfX3BsYWNlaG9sZGVyX18yKSA9PT0gdm9pZCAwID9cbiAgICAgICAgJF9fcGxhY2Vob2xkZXJfXzMgOiAkX19wbGFjZWhvbGRlcl9fNCIsbnVsbCxudWxsLCJTeXN0ZW0uZ2V0KCRfX3BsYWNlaG9sZGVyX18wKSIsIlN5c3RlbS5nZXQoJF9fcGxhY2Vob2xkZXJfXzAgKycnKSJdfQ==

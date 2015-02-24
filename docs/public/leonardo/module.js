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
        var defer = $q.defer;
        defer.resolve();
        states.forEach(function(state) {
          defer = defer.promise.then(function() {
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
        return defer;
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8wIiwiQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzYiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvNSIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci80IiwiLi4vc3JjL2xlb25hcmRvL2FjdGl2YXRvci5kcnYuanMiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvMSIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8zIiwiQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzIiLCIuLi9zcmMvbGVvbmFyZG8vY29uZmlndXJhdGlvbi5zcnYuanMiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvOCIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci83IiwiLi4vc3JjL2xlb25hcmRvL3dpbmRvdy1ib2R5LmRydi5qcyIsIi4uL3NyYy9sZW9uYXJkby9tb2R1bGUuanMiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvOSIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8xMCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxjQUFjLFFBQVEsUUFBUSxFQUFJLEtBQUcsQ0FBQTtBQ0FyQyxLQUFLLGVBQWUsQUFBQyxvQ0FBb0IsR0FBQyxDQ0ExQyxVQUFTLEFBQUQ7O0FDQVIsQUFBSSxJQUFBLENBQUEsWUFBVyxxQ0FBb0IsQ0FBQztBQ0FwQyxTQUFTLG1CQUFpQixDQUFFLFFBQU87QUFDakMsU0FBTztBQUNMLGFBQU8sQ0FBRyxJQUFFO0FBQ1osU0FBRyxDQUFHLFVBQVMsS0FBSSxDQUFHLENBQUEsSUFBRztBQUN2QixBQUFJLFVBQUEsQ0FBQSxFQUFDLEVBQUksQ0FBQSxDQUFBLEFBQUMsQ0FBQyw4REFBNkQsQ0FBQyxDQUFDO0FBRTFF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QUEsYUFBd0I7QUFBRSx1QkFBd0I7SUFBRSxFREE3QjtBSkVqQixDREZ3RCxDQUFDO0FhQS9ELEtBQUssSUFBSSxBQUFDLENBQUMsNkJBQW1CLEdBQUMsQ0FBQyxDQUFBIiwiZmlsZSI6Ii9Vc2Vycy9zZnJhbmtlbC9kZXYvb3V0YnJhaW4vTGVvbmFyZG8vZGlzdC9tb2R1bGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIkdHJhY2V1clJ1bnRpbWUub3B0aW9ucy5zeW1ib2xzID0gdHJ1ZSIsIlN5c3RlbS5yZWdpc3Rlck1vZHVsZSgkX19wbGFjZWhvbGRlcl9fMCwgW10sICRfX3BsYWNlaG9sZGVyX18xKTsiLCJmdW5jdGlvbigpIHtcbiAgICAgICAgJF9fcGxhY2Vob2xkZXJfXzBcbiAgICAgIH0iLCJ2YXIgX19tb2R1bGVOYW1lID0gJF9fcGxhY2Vob2xkZXJfXzA7IixudWxsLCJ2YXIgJF9fZGVmYXVsdCA9ICRfX3BsYWNlaG9sZGVyX18wIiwicmV0dXJuICRfX3BsYWNlaG9sZGVyX18wIiwiZ2V0ICRfX3BsYWNlaG9sZGVyX18wKCkgeyByZXR1cm4gJF9fcGxhY2Vob2xkZXJfXzE7IH0iLG51bGwsIiRfX3BsYWNlaG9sZGVyX18wWyR0cmFjZXVyUnVudGltZS50b1Byb3BlcnR5KCRfX3BsYWNlaG9sZGVyX18xKV0iLCIoJF9fcGxhY2Vob2xkZXJfXzAgPSAkX19wbGFjZWhvbGRlcl9fMS4kX19wbGFjZWhvbGRlcl9fMikgPT09IHZvaWQgMCA/XG4gICAgICAgICRfX3BsYWNlaG9sZGVyX18zIDogJF9fcGxhY2Vob2xkZXJfXzQiLG51bGwsbnVsbCwiU3lzdGVtLmdldCgkX19wbGFjZWhvbGRlcl9fMCkiLCJTeXN0ZW0uZ2V0KCRfX3BsYWNlaG9sZGVyX18wICsnJykiXX0=

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
    return {
      states: states,
      getActiveStateOptions: select,
      active_states_option: [],
      upsertOption: upsertOption,
      updateHttpBackEnd: function() {
        this.getConfiguredOptions().then(function(states) {
          states.filter((function(state) {
            return state.active;
          })).forEach(function(state) {
            var option = state.activeOption;
            $httpBackend.when('GET', state.url).respond(option.status, option.data);
          });
        });
      },
      getConfiguredOptions: function() {
        return this.getActiveStateOptions().then(function(rows) {
          var activeStates = {};
          for (var i = 0; i < rows.length; i++) {
            activeStates[$traceurRuntime.toProperty(rows.item(i).state)] = {
              name: rows.item(i).name,
              active: (rows.item(i).active === "true")
            };
          }
          var states = states.map((function(state) {
            return angular.copy(state);
          }));
          states.forEach(function(state) {
            var option = activeStates[$traceurRuntime.toProperty(state.name)];
            state.active = !!option && option.active;
            state.activeOption = !!option ? state.options.find((function(_option) {
              return _option.name === option.name;
            })) : state.options[0];
          });
          return states;
        });
      },
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8wIiwiQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzYiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvNSIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci80IiwiLi4vc3JjL2xlb25hcmRvL2FjdGl2YXRvci5kcnYuanMiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvMSIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8zIiwiQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzIiLCIuLi9zcmMvbGVvbmFyZG8vY29uZmlndXJhdGlvbi5zcnYuanMiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvOCIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci83IiwiLi4vc3JjL2xlb25hcmRvL3dpbmRvdy1ib2R5LmRydi5qcyIsIi4uL3NyYy9sZW9uYXJkby9tb2R1bGUuanMiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvOSIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8xMCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxjQUFjLFFBQVEsUUFBUSxFQUFJLEtBQUcsQ0FBQTtBQ0FyQyxLQUFLLGVBQWUsQUFBQyxvQ0FBb0IsR0FBQyxDQ0ExQyxVQUFTLEFBQUQ7O0FDQVIsQUFBSSxJQUFBLENBQUEsWUFBVyxxQ0FBb0IsQ0FBQztBQ1dwQyxTQUFTLG1CQUFpQixDQUFFLFFBQU87QUFDakMsU0FBTztBQUNMLGFBQU8sQ0FBRyxJQUFFO0FBQ1osU0FBRyxDQUFHLFVBQVMsS0FBSSxDQUFHLENBQUEsSUFBRztBQUN2QixBQUFJLFVBQUEsQ0FBQSxFQUFDLEVBQUksQ0FBQSxDQUFBLEFBQUMsQ0FBQyw4REFBNkQsQ0FBQyxDQUFDO0FBRTFF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Q0g7QUFBQSxJQUNGLENBQUM7RUFDSDtBTjVEQSxBQUFJLElBQUEsQ0FBQSxVQUFTLEVNOERFLG9CQUFrQixBTjlEQSxDQUFBO0FDQWpDLFNDQUEsYUFBd0I7QUFBRSx1QkFBd0I7SUFBRSxFREE3QjtBSkVqQixDREZ3RCxDQUFDO0FEQS9ELGNBQWMsUUFBUSxRQUFRLEVBQUksS0FBRyxDQUFBO0FDQXJDLEtBQUssZUFBZSxBQUFDLDZCQUFvQixHQUFDLENDQTFDLFVBQVMsQUFBRDs7QUNBUixBQUFJLElBQUEsQ0FBQSxZQUFXLDhCQUFvQixDQUFDO0lTQTdCLG1CQUFpQixFQ0F4QixDQUFBLE1BQUssSUFBSSxBQUFDLG9DQUFrQjtJRENyQixxQkFBbUIsRUNEMUIsQ0FBQSxNQUFLLElBQUksQUFBQyx3Q0FBa0I7SURFckIsb0JBQWtCLEVDRnpCLENBQUEsTUFBSyxJQUFJLEFBQUMsc0NBQWtCO0FSQTVCLEFBQUksSUFBQSxDQUFBLFVBQVMsRU9JRSxDQUFBLE9BQU0sT0FBTyxBQUFDLENBQUMsVUFBUyxDQUFHLEVBQUMsb0JBQW1CLENBQUcsWUFBVSxDQUFDLENBQUMsUUFDcEUsQUFBQyxDQUFDLGVBQWMsQ0FBRyxxQkFBbUIsQ0FBQyxVQUNyQyxBQUFDLENBQUMsV0FBVSxDQUFHLG1CQUFpQixDQUFDLFVBQ2pDLEFBQUMsQ0FBQyxZQUFXLENBQUcsb0JBQWtCLENBQUMsQVBQYixDQUFBO0FDQWpDLFNDQUEsYUFBd0I7QUFBRSx1QkFBd0I7SUFBRSxFREE3QjtBSkVqQixDREZ3RCxDQUFDO0FhQS9ELEtBQUssSUFBSSxBQUFDLENBQUMsNkJBQW1CLEdBQUMsQ0FBQyxDQUFBIiwiZmlsZSI6Ii9Vc2Vycy9zZnJhbmtlbC9kZXYvb3V0YnJhaW4vTGVvbmFyZG8vZGlzdC9tb2R1bGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIkdHJhY2V1clJ1bnRpbWUub3B0aW9ucy5zeW1ib2xzID0gdHJ1ZSIsIlN5c3RlbS5yZWdpc3Rlck1vZHVsZSgkX19wbGFjZWhvbGRlcl9fMCwgW10sICRfX3BsYWNlaG9sZGVyX18xKTsiLCJmdW5jdGlvbigpIHtcbiAgICAgICAgJF9fcGxhY2Vob2xkZXJfXzBcbiAgICAgIH0iLCJ2YXIgX19tb2R1bGVOYW1lID0gJF9fcGxhY2Vob2xkZXJfXzA7IixudWxsLCJ2YXIgJF9fZGVmYXVsdCA9ICRfX3BsYWNlaG9sZGVyX18wIiwicmV0dXJuICRfX3BsYWNlaG9sZGVyX18wIiwiZ2V0ICRfX3BsYWNlaG9sZGVyX18wKCkgeyByZXR1cm4gJF9fcGxhY2Vob2xkZXJfXzE7IH0iLG51bGwsIiRfX3BsYWNlaG9sZGVyX18wWyR0cmFjZXVyUnVudGltZS50b1Byb3BlcnR5KCRfX3BsYWNlaG9sZGVyX18xKV0iLCIoJF9fcGxhY2Vob2xkZXJfXzAgPSAkX19wbGFjZWhvbGRlcl9fMS4kX19wbGFjZWhvbGRlcl9fMikgPT09IHZvaWQgMCA/XG4gICAgICAgICRfX3BsYWNlaG9sZGVyX18zIDogJF9fcGxhY2Vob2xkZXJfXzQiLG51bGwsbnVsbCwiU3lzdGVtLmdldCgkX19wbGFjZWhvbGRlcl9fMCkiLCJTeXN0ZW0uZ2V0KCRfX3BsYWNlaG9sZGVyX18wICsnJykiXX0=

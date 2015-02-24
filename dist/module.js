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
      addBundle: function(name, options) {}
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
    configuration.getActiveStateOptions().then(function(rows) {
      var activeStates = {};
      for (var i = 0; i < rows.length; i++) {
        activeStates[$traceurRuntime.toProperty(rows.item(i).state)] = {
          name: rows.item(i).name,
          active: (rows.item(i).active === "true")
        };
      }
      var states = configuration.states.map((function(state) {
        return angular.copy(state);
      }));
      states.forEach(function(state) {
        var option = activeStates[$traceurRuntime.toProperty(state.name)];
        state.active = !!option && option.active;
        state.activeOption = !!option ? state.options.find((function(_option) {
          return _option.name === option.name;
        })) : state.options[0];
      });
      states.filter((function(state) {
        return state.active;
      })).forEach(function(state) {
        var option = state.activeOption;
        $httpBackend.when('GET', state.url).respond(option.status, option.data);
      });
    });
  }
  return {get default() {
      return $__default;
    }};
});
System.get("../src/leonardo/module.js" + '');

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8wIiwiQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzYiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvNSIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci80IiwiLi4vc3JjL2xlb25hcmRvL2FjdGl2YXRvci5kcnYuanMiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvMSIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8zIiwiQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzIiLCIuLi9zcmMvbGVvbmFyZG8vY29uZmlndXJhdGlvbi5zcnYuanMiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvNyIsIi4uL3NyYy9sZW9uYXJkby93aW5kb3ctYm9keS5kcnYuanMiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvOCIsIi4uL3NyYy9sZW9uYXJkby9tb2R1bGUuanMiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvOSIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8xMCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxjQUFjLFFBQVEsUUFBUSxFQUFJLEtBQUcsQ0FBQTtBQ0FyQyxLQUFLLGVBQWUsQUFBQyxvQ0FBb0IsR0FBQyxDQ0ExQyxVQUFTLEFBQUQ7O0FDQVIsQUFBSSxJQUFBLENBQUEsWUFBVyxxQ0FBb0IsQ0FBQztBQ1dwQyxTQUFTLG1CQUFpQixDQUFFLFFBQU87QUFDakMsU0FBTztBQUNMLGFBQU8sQ0FBRyxJQUFFO0FBQ1osU0FBRyxDQUFHLFVBQVMsS0FBSSxDQUFHLENBQUEsSUFBRztBQUN2QixBQUFJLFVBQUEsQ0FBQSxFQUFDLEVBQUksQ0FBQSxDQUFBLEFBQUMsQ0FBQyw4REFBNkQsQ0FBQyxDQUFDO0FBRTFF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QUMsRUFBQyxTQUFBLEtBQUk7YUFBSyxDQUFBLEtBQUksT0FBTztNQUFBLEVBQUMsUUFBUSxBQUFDLENBQUMsU0FBUyxLQUFJLENBQUU7QUFDMUQsQUFBSSxVQUFBLENBQUEsTUFBSyxFQUFJLENBQUEsS0FBSSxhQUFhLENBQUM7QUFDL0IsbUJBQVcsS0FBSyxBQUFDLENBQUMsS0FBSSxDQUFHLENBQUEsS0FBSSxJQUFJLENBQUMsUUFBUSxBQUFDLENBQUMsTUFBSyxPQUFPLENBQUcsQ0FBQSxNQUFLLEtBQUssQ0FBQyxDQUFDO01BQ3pFLENBQUMsQ0FBQztJQUNKLENBQUMsQ0FBQztFQUNKO0FObkNBLFNDQUEsYUFBd0I7QUFBRSx1QkFBd0I7SUFBRSxFREE3QjtBSkVqQixDREZ3RCxDQUFDO0FhQS9ELEtBQUssSUFBSSxBQUFDLENBQUMsNkJBQW1CLEdBQUMsQ0FBQyxDQUFBIiwiZmlsZSI6Ii9Vc2Vycy9zZnJhbmtlbC9kZXYvb3V0YnJhaW4vTGVvbmFyZG8vZGlzdC9tb2R1bGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIkdHJhY2V1clJ1bnRpbWUub3B0aW9ucy5zeW1ib2xzID0gdHJ1ZSIsIlN5c3RlbS5yZWdpc3Rlck1vZHVsZSgkX19wbGFjZWhvbGRlcl9fMCwgW10sICRfX3BsYWNlaG9sZGVyX18xKTsiLCJmdW5jdGlvbigpIHtcbiAgICAgICAgJF9fcGxhY2Vob2xkZXJfXzBcbiAgICAgIH0iLCJ2YXIgX19tb2R1bGVOYW1lID0gJF9fcGxhY2Vob2xkZXJfXzA7IixudWxsLCJ2YXIgJF9fZGVmYXVsdCA9ICRfX3BsYWNlaG9sZGVyX18wIiwicmV0dXJuICRfX3BsYWNlaG9sZGVyX18wIiwiZ2V0ICRfX3BsYWNlaG9sZGVyX18wKCkgeyByZXR1cm4gJF9fcGxhY2Vob2xkZXJfXzE7IH0iLG51bGwsIigkX19wbGFjZWhvbGRlcl9fMCA9ICRfX3BsYWNlaG9sZGVyX18xLiRfX3BsYWNlaG9sZGVyX18yKSA9PT0gdm9pZCAwID9cbiAgICAgICAgJF9fcGxhY2Vob2xkZXJfXzMgOiAkX19wbGFjZWhvbGRlcl9fNCIsbnVsbCwiJF9fcGxhY2Vob2xkZXJfXzBbJHRyYWNldXJSdW50aW1lLnRvUHJvcGVydHkoJF9fcGxhY2Vob2xkZXJfXzEpXSIsbnVsbCwiU3lzdGVtLmdldCgkX19wbGFjZWhvbGRlcl9fMCkiLCJTeXN0ZW0uZ2V0KCRfX3BsYWNlaG9sZGVyX18wICsnJykiXX0=

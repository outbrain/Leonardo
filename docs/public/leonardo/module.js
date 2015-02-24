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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8wIiwiQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzYiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvNSIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci80IiwiLi4vc3JjL2xlb25hcmRvL2FjdGl2YXRvci5kcnYuanMiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvMSIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8zIiwiQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzIiLCIuLi9zcmMvbGVvbmFyZG8vY29uZmlndXJhdGlvbi5zcnYuanMiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvOCIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci83IiwiLi4vc3JjL2xlb25hcmRvL3dpbmRvdy1ib2R5LmRydi5qcyIsIi4uL3NyYy9sZW9uYXJkby9tb2R1bGUuanMiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvOSIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8xMCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxjQUFjLFFBQVEsUUFBUSxFQUFJLEtBQUcsQ0FBQTtBQ0FyQyxLQUFLLGVBQWUsQUFBQyxvQ0FBb0IsR0FBQyxDQ0ExQyxVQUFTLEFBQUQ7O0FDQVIsQUFBSSxJQUFBLENBQUEsWUFBVyxxQ0FBb0IsQ0FBQztBQ0FwQyxTQUFTLG1CQUFpQixDQUFFLFFBQU87QUFDakMsU0FBTztBQUNMLGFBQU8sQ0FBRyxJQUFFO0FBQ1osU0FBRyxDQUFHLFVBQVMsS0FBSSxDQUFHLENBQUEsSUFBRztBQUN2QixBQUFJLFVBQUEsQ0FBQSxFQUFDLEVBQUksQ0FBQSxDQUFBLEFBQUMsQ0FBQyw4REFBNkQsQ0FBQyxDQUFDO0FBRTFF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QyxVQUNqQyxBQUFDLENBQUMsWUFBVyxDQUFHLG9CQUFrQixDQUFDLEFQUGIsQ0FBQTtBQ0FqQyxTQ0FBLGFBQXdCO0FBQUUsdUJBQXdCO0lBQUUsRURBN0I7QUpFakIsQ0RGd0QsQ0FBQztBYUEvRCxLQUFLLElBQUksQUFBQyxDQUFDLDZCQUFtQixHQUFDLENBQUMsQ0FBQSIsImZpbGUiOiIvVXNlcnMvc2ZyYW5rZWwvZGV2L291dGJyYWluL0xlb25hcmRvL2Rpc3QvbW9kdWxlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJHRyYWNldXJSdW50aW1lLm9wdGlvbnMuc3ltYm9scyA9IHRydWUiLCJTeXN0ZW0ucmVnaXN0ZXJNb2R1bGUoJF9fcGxhY2Vob2xkZXJfXzAsIFtdLCAkX19wbGFjZWhvbGRlcl9fMSk7IiwiZnVuY3Rpb24oKSB7XG4gICAgICAgICRfX3BsYWNlaG9sZGVyX18wXG4gICAgICB9IiwidmFyIF9fbW9kdWxlTmFtZSA9ICRfX3BsYWNlaG9sZGVyX18wOyIsbnVsbCwidmFyICRfX2RlZmF1bHQgPSAkX19wbGFjZWhvbGRlcl9fMCIsInJldHVybiAkX19wbGFjZWhvbGRlcl9fMCIsImdldCAkX19wbGFjZWhvbGRlcl9fMCgpIHsgcmV0dXJuICRfX3BsYWNlaG9sZGVyX18xOyB9IixudWxsLCIkX19wbGFjZWhvbGRlcl9fMFskdHJhY2V1clJ1bnRpbWUudG9Qcm9wZXJ0eSgkX19wbGFjZWhvbGRlcl9fMSldIiwiKCRfX3BsYWNlaG9sZGVyX18wID0gJF9fcGxhY2Vob2xkZXJfXzEuJF9fcGxhY2Vob2xkZXJfXzIpID09PSB2b2lkIDAgP1xuICAgICAgICAkX19wbGFjZWhvbGRlcl9fMyA6ICRfX3BsYWNlaG9sZGVyX180IixudWxsLG51bGwsIlN5c3RlbS5nZXQoJF9fcGxhY2Vob2xkZXJfXzApIiwiU3lzdGVtLmdldCgkX19wbGFjZWhvbGRlcl9fMCArJycpIl19

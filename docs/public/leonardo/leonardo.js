$traceurRuntime.options.symbols = true;
System.registerModule("src/leonardo/activator.drv.js", [], function() {
  "use strict";
  var __moduleName = "src/leonardo/activator.drv.js";
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
System.registerModule("src/leonardo/configuration.srv.js", [], function() {
  "use strict";
  var __moduleName = "src/leonardo/configuration.srv.js";
  function configurationService(storage, $httpBackend) {
    var states = [];
    var responseHandlers = {};
    var upsertOption = function(state, name, active) {
      var _states = storage.getStates();
      _states[$traceurRuntime.toProperty(state)] = {
        name: name,
        active: active
      };
      storage.setStates(_states);
      sync();
    };
    function fetchStates() {
      var activeStates = storage.getStates();
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
    }
    function deactivateAll() {
      var _states = storage.getStates();
      Object.keys(_states).forEach(function(stateKey) {
        _states[$traceurRuntime.toProperty(stateKey)].active = false;
      });
      storage.setStates(_states);
      sync();
    }
    function findStateOption(name) {
      return fetchStates().find((function(state) {
        return state.name === name;
      })).activeOption;
    }
    function sync() {
      fetchStates().forEach(function(state) {
        var option,
            responseHandler;
        if (state.url) {
          option = findStateOption(state.name);
          responseHandler = getResponseHandler(state);
          if (state.active) {
            responseHandler.respond(function() {
              $httpBackend.setDelay(option.delay);
              return [option.status, angular.isFunction(option.data) ? option.data() : option.data];
            });
          } else {
            responseHandler.passThrough();
          }
        }
      });
    }
    function getResponseHandler(state) {
      if (!responseHandlers[$traceurRuntime.toProperty(state.name)]) {
        responseHandlers[$traceurRuntime.toProperty(state.name)] = $httpBackend.when(state.verb || 'GET', new RegExp(state.url));
      }
      return responseHandlers[$traceurRuntime.toProperty(state.name)];
    }
    return {
      states: states,
      active_states_option: [],
      upsertOption: upsertOption,
      fetchStates: fetchStates,
      getState: function(name) {
        var state = fetchStates().find((function(state) {
          return state.name === name;
        }));
        return (state && state.active && findStateOption(name)) || null;
      },
      addState: function(stateObj) {
        var $__0 = this;
        stateObj.options.forEach((function(option) {
          $__0.upsert({
            state: stateObj.name,
            url: stateObj.url,
            verb: option.verb,
            name: option.name,
            status: option.status,
            data: option.data,
            delay: option.delay
          });
        }));
      },
      addStates: function(statesArr) {
        var $__0 = this;
        statesArr.forEach((function(stateObj) {
          $__0.addState(stateObj);
        }));
      },
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
        if (!state) {
          console.log("cannot upsert - state is mandatory");
          return ;
        }
        var stateItem = states.find((function(_state) {
          return _state.name === state;
        })) || defaultState;
        angular.extend(stateItem, {
          name: state,
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
        sync();
      },
      upsertMany: function(items) {
        var $__0 = this;
        items.forEach((function(item) {
          return $__0.upsert(item);
        }));
      },
      deactivateAll: deactivateAll
    };
  }
  var $__default = configurationService;
  return {get default() {
      return $__default;
    }};
});
$traceurRuntime.options.symbols = true;
System.registerModule("src/leonardo/storage.srv.js", [], function() {
  "use strict";
  var __moduleName = "src/leonardo/storage.srv.js";
  function storageService() {
    var STATES_STORE_KEY = 'states';
    function getItem(key) {
      var item = localStorage.getItem(key);
      if (!item) {
        return null;
      }
      return angular.fromJson(item);
    }
    function setItem(key, data) {
      localStorage.setItem(key, angular.toJson(data));
    }
    function getStates() {
      return getItem(STATES_STORE_KEY) || {};
    }
    function setStates(states) {
      setItem(STATES_STORE_KEY, states);
    }
    return {
      getItem: getItem,
      setItem: setItem,
      setStates: setStates,
      getStates: getStates
    };
  }
  var $__default = storageService;
  return {get default() {
      return $__default;
    }};
});
$traceurRuntime.options.symbols = true;
System.registerModule("src/leonardo/window-body.drv.js", [], function() {
  "use strict";
  var __moduleName = "src/leonardo/window-body.drv.js";
  function windowBodyDirective($http, configuration) {
    return {
      restrict: 'E',
      templateUrl: 'window-body.html',
      scope: true,
      replace: true,
      controller: function($scope) {
        $scope.selectedItem = 'activate';
        $scope.NothasUrl = function(option) {
          return !option.url;
        };
        $scope.hasUrl = function(option) {
          return !!option.url;
        };
        $scope.deactivate = function() {
          $scope.states.forEach(function(state) {
            state.active = false;
          });
          configuration.deactivateAll();
        };
        $scope.updateState = function(state) {
          console.log(("update state: " + state.name + " " + state.activeOption.name + " " + state.active));
          configuration.upsertOption(state.name, state.activeOption.name, state.active);
        };
        $scope.states = configuration.fetchStates();
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
System.registerModule("src/leonardo/module.js", [], function() {
  "use strict";
  var __moduleName = "src/leonardo/module.js";
  var activatorDirective = System.get("src/leonardo/activator.drv.js").default;
  var configurationService = System.get("src/leonardo/configuration.srv.js").default;
  var storageService = System.get("src/leonardo/storage.srv.js").default;
  var windowBodyDirective = System.get("src/leonardo/window-body.drv.js").default;
  var $__default = angular.module('leonardo', ['leonardo.templates', 'ngMockE2E']).factory('storage', storageService).factory('configuration', configurationService).directive('activator', activatorDirective).directive('windowBody', windowBodyDirective).config(function($provide) {
    $provide.decorator('$httpBackend', function($delegate) {
      var proxy = function(method, url, data, callback, headers) {
        var interceptor = function() {
          var _this = this,
              _arguments = arguments;
          setTimeout(function() {
            callback.apply(_this, _arguments);
          }, proxy.delay || 0);
          proxy.delay = 0;
        };
        return $delegate.call(this, method, url, data, interceptor, headers);
      };
      for (var key in $delegate)
        if (!$traceurRuntime.isSymbolString(key)) {
          proxy[$traceurRuntime.toProperty(key)] = $delegate[$traceurRuntime.toProperty(key)];
        }
      proxy.setDelay = (function(delay) {
        proxy.delay = delay;
      });
      return proxy;
    });
  });
  return {get default() {
      return $__default;
    }};
});
System.get("src/leonardo/module.js" + '');
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9sZW9uYXJkby9hY3RpdmF0b3IuZHJ2LmpzIiwic3JjL2xlb25hcmRvL2NvbmZpZ3VyYXRpb24uc3J2LmpzIiwic3JjL2xlb25hcmRvL3N0b3JhZ2Uuc3J2LmpzIiwic3JjL2xlb25hcmRvL3dpbmRvdy1ib2R5LmRydi5qcyIsInNyYy9sZW9uYXJkby9tb2R1bGUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkEsYyxRLFEsRSxLLEM7QSxLLGUsQSxpQyxHLEMsVSxBOztBLEEsSSxDLFksa0MsQztBQUFBLFNBQVMsbUJBQWlCLENBQUUsUUFBTztBQUNqQyxTQUFPO0FBQ0wsYUFBTyxDQUFHLElBQUU7QUFDWixTQUFHLENBQUcsVUFBUyxLQUFJLENBQUcsQ0FBQSxJQUFHO0FBQ3ZCLEFBQUksVUFBQSxDQUFBLEVBQUMsRUFBSSxDQUFBLE9BQU0sUUFBUSxBQUFDLENBQUMsOERBQTZELENBQUMsQ0FBQztBQUV4RixBQUFJLFVBQUEsQ0FBQSxHQUFFLEVBQUksQ0FBQSxPQUFNLFFBQVEsQUFBQyxDQUFDLENBQzFCLCtCQUE4QixDQUM1Qiw0REFBMEQsQ0FDeEQsOEJBQTRCLENBQzlCLFNBQU8sQ0FDVCxTQUFPLENBQ1AsS0FBSyxBQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQztBQUVYLGVBQU8sQUFBQyxDQUFDLEVBQUMsQ0FBQyxBQUFDLENBQUMsS0FBSSxDQUFDLENBQUM7QUFDbkIsZUFBTyxBQUFDLENBQUMsR0FBRSxDQUFDLEFBQUMsQ0FBQyxLQUFJLENBQUMsQ0FBQztBQUVwQixXQUFHLE9BQU8sQUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDO0FBQ2YsV0FBRyxPQUFPLEFBQUMsQ0FBQyxHQUFFLENBQUMsQ0FBQztBQUVoQixVQUFFLENBQUUsQ0FBQSxDQUFDLGlCQUFpQixBQUFDLENBQUUscUJBQW9CLENBQUcsVUFBUyxBQUFELENBQUc7QUFDekQsYUFBSSxDQUFDLFFBQU8sS0FBSyxVQUFVLFNBQVMsQUFBQyxDQUFDLFVBQVMsQ0FBQyxD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QUNqQixDQUFDO0FBQ0QsYUFBTyxDQUFBLFNBQVEsS0FBSyxBQUFDLENBQUMsSUFBRyxDQUFHLE9BQUssQ0FBRyxJQUFFLENBQUcsS0FBRyxDQUFHLFlBQVUsQ0FBRyxRQUFNLENBQUMsQ0FBQztNQUN0RSxDQUFDO0FBQ0QsVUFBUSxHQUFBLENBQUEsR0FBRSxDQUFBLEVBQUssVUFBUTtBQTNCN0IsV0FBSSxDQUFDLGVBQWMsZUFBZSxBQUFDLEtBQWtCLENBMkJyQjtBQUN4QixjQUFJLENBNUJNLGVBQWMsV0FBVyxBQUFDLENBNEI5QixHQUFFLENBNUI4QyxDQUFDLEVBQS9ELENBNEJxQixTQUFRLENBNUJYLGVBQWMsV0FBVyxBQUFDLENBNEJiLEdBQUUsQ0E1QjZCLENBQUMsQUE0QjdCLENBQUM7UUFDN0I7QUE3QmtFLEFBOEJsRSxVQUFJLFNBQVMsSUFBSSxTQUFDLEtBQUksQ0FBTTtBQUMxQixZQUFJLE1BQU0sRUFBSSxNQUFJLENBQUM7TUFDckIsQ0FBQSxDQUFDO0FBQ0QsV0FBTyxNQUFJLENBQUM7SUFDZCxDQUFDLENBQUM7RUFDSixDQUFDLEFBbkM4QixDQUFBO0FBQWpDLFNBQUEsYUFBd0I7QUFBRSx1QkFBd0I7SUFBRSxFQUE3QjtBQUVqQixDQUZ3RCxDQUFDO0FBQS9ELEtBQUssSUFBSSxBQUFDLENBQUMsMEJBQW1CLEdBQUMsQ0FBQyxDQUFBIiwiZmlsZSI6Ii9Vc2Vycy90c2h1c2hhbi9kZXYvTGVvbmFyZG8vdGVtcG91dE1DNDNNemd5TnpneE9USTVNek0yTkRnNC5qcyIsInNvdXJjZXNDb250ZW50IjpbImZ1bmN0aW9uIGFjdGl2YXRvckRpcmVjdGl2ZSgkY29tcGlsZSkge1xuICByZXR1cm4ge1xuICAgIHJlc3RyaWN0OiAnQScsXG4gICAgbGluazogZnVuY3Rpb24oc2NvcGUsIGVsZW0pIHtcbiAgICAgIHZhciBlbCA9IGFuZ3VsYXIuZWxlbWVudCgnPGRpdiBuZy1jbGljaz1cImFjdGl2YXRlKClcIiBjbGFzcz1cImxlb25hcmRvLWFjdGl2YXRvclwiPjwvZGl2PicpO1xuXG4gICAgICB2YXIgd2luID0gYW5ndWxhci5lbGVtZW50KFtcbiAgICAgICc8ZGl2IGNsYXNzPVwibGVvbmFyZG8td2luZG93XCI+JyxcbiAgICAgICAgJzxkaXYgY2xhc3M9XCJsZW9uYXJkby1oZWFkZXJcIj5MZW9uYXJkbyBDb25maWd1cmF0aW9uPC9kaXY+JyxcbiAgICAgICAgICAnPHdpbmRvdy1ib2R5Pjwvd2luZG93LWJvZHk+JyxcbiAgICAgICAgJzwvZGl2PicsXG4gICAgICAnPC9kaXY+J1xuICAgICAgXS5qb2luKCcnKSk7XG5cbiAgICAgICRjb21waWxlKGVsKShzY29wZSk7XG4gICAgICAkY29tcGlsZSh3aW4pKHNjb3BlKTtcblxuICAgICAgZWxlbS5hcHBlbmQoZWwpO1xuICAgICAgZWxlbS5hcHBlbmQod2luKTtcblxuICAgICAgd2luWzBdLmFkZEV2ZW50TGlzdGVuZXIoICd3ZWJraXRUcmFuc2l0aW9uRW5kJywgZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICghZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QuY29udGFpbnMoJ3B1bGwtdG9wJykpe1xuICAgICAgICAgIGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LmFkZChcInB1bGwtdG9wLWNsb3NlZFwiKTtcbiAgICAgICAgfVxuICAgICAgfSwgZmFsc2UgKTtcblxuICAgICAgc2NvcGUuYWN0aXZhdGUgPSBmdW5jdGlvbigpe1xuICAgICAgICBpZiAoIWRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LmNvbnRhaW5zKCdwdWxsLXRvcCcpKSB7XG4gICAgICAgICAgZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QuYWRkKCdwdWxsLXRvcCcpO1xuICAgICAgICAgIGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LnJlbW92ZSgncHVsbC10b3AtY2xvc2VkJyk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QucmVtb3ZlKCdwdWxsLXRvcCcpO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgIH1cbiAgfTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgYWN0aXZhdG9yRGlyZWN0aXZlIiwiZnVuY3Rpb24gY29uZmlndXJhdGlvblNlcnZpY2Uoc3RvcmFnZSwgJGh0dHBCYWNrZW5kKSB7XG4gIHZhciBzdGF0ZXMgPSBbXTtcbiAgdmFyIHJlc3BvbnNlSGFuZGxlcnMgPSB7fTtcblxuICB2YXIgdXBzZXJ0T3B0aW9uID0gZnVuY3Rpb24oc3RhdGUsIG5hbWUsIGFjdGl2ZSkge1xuICAgIHZhciBfc3RhdGVzID0gc3RvcmFnZS5nZXRTdGF0ZXMoKTtcbiAgICBfc3RhdGVzW3N0YXRlXSA9IHtcbiAgICAgIG5hbWU6IG5hbWUsXG4gICAgICBhY3RpdmU6IGFjdGl2ZVxuICAgIH07XG5cbiAgICBzdG9yYWdlLnNldFN0YXRlcyhfc3RhdGVzKTtcblxuICAgIHN5bmMoKTtcbiAgfTtcblxuICBmdW5jdGlvbiBmZXRjaFN0YXRlcygpe1xuICAgIHZhciBhY3RpdmVTdGF0ZXMgPSBzdG9yYWdlLmdldFN0YXRlcygpO1xuICAgIHZhciBfc3RhdGVzID0gc3RhdGVzLm1hcChzdGF0ZSA9PiBhbmd1bGFyLmNvcHkoc3RhdGUpKTtcblxuICAgIF9zdGF0ZXMuZm9yRWFjaChmdW5jdGlvbihzdGF0ZSkge1xuICAgICAgbGV0IG9wdGlvbiA9IGFjdGl2ZVN0YXRlc1tzdGF0ZS5uYW1lXTtcbiAgICAgIHN0YXRlLmFjdGl2ZSA9ICEhb3B0aW9uICYmIG9wdGlvbi5hY3RpdmU7XG4gICAgICBzdGF0ZS5hY3RpdmVPcHRpb24gPSAhIW9wdGlvbiA/IHN0YXRlLm9wdGlvbnMuZmluZChfb3B0aW9uID0+IF9vcHRpb24ubmFtZSA9PT0gb3B0aW9uLm5hbWUpIDogc3RhdGUub3B0aW9uc1swXTtcbiAgICB9KTtcblxuICAgIHJldHVybiBfc3RhdGVzO1xuICB9XG5cbiAgZnVuY3Rpb24gZGVhY3RpdmF0ZUFsbCgpIHtcbiAgICB2YXIgX3N0YXRlcyA9IHN0b3JhZ2UuZ2V0U3RhdGVzKCk7XG4gICAgT2JqZWN0LmtleXMoX3N0YXRlcykuZm9yRWFjaChmdW5jdGlvbihzdGF0ZUtleSkge1xuICAgICAgX3N0YXRlc1tzdGF0ZUtleV0uYWN0aXZlID0gZmFsc2U7XG4gICAgfSk7XG4gICAgc3RvcmFnZS5zZXRTdGF0ZXMoX3N0YXRlcyk7XG5cbiAgICBzeW5jKCk7XG4gIH1cblxuICBmdW5jdGlvbiBmaW5kU3RhdGVPcHRpb24obmFtZSl7XG4gICAgcmV0dXJuIGZldGNoU3RhdGVzKCkuZmluZChzdGF0ZSA9PiBzdGF0ZS5uYW1lID09PSBuYW1lKS5hY3RpdmVPcHRpb247XG4gIH1cblxuICBmdW5jdGlvbiBzeW5jKCl7XG4gICAgZmV0Y2hTdGF0ZXMoKS5mb3JFYWNoKGZ1bmN0aW9uIChzdGF0ZSkge1xuICAgICAgdmFyIG9wdGlvbiwgcmVzcG9uc2VIYW5kbGVyO1xuICAgICAgaWYgKHN0YXRlLnVybCkge1xuICAgICAgICBvcHRpb24gPSBmaW5kU3RhdGVPcHRpb24oc3RhdGUubmFtZSk7XG4gICAgICAgIHJlc3BvbnNlSGFuZGxlciA9IGdldFJlc3BvbnNlSGFuZGxlcihzdGF0ZSk7XG4gICAgICAgIGlmIChzdGF0ZS5hY3RpdmUpIHtcbiAgICAgICAgICByZXNwb25zZUhhbmRsZXIucmVzcG9uZChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAkaHR0cEJhY2tlbmQuc2V0RGVsYXkob3B0aW9uLmRlbGF5KTtcbiAgICAgICAgICAgIHJldHVybiBbb3B0aW9uLnN0YXR1cywgYW5ndWxhci5pc0Z1bmN0aW9uKG9wdGlvbi5kYXRhKSA/IG9wdGlvbi5kYXRhKCkgOiBvcHRpb24uZGF0YV07XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmVzcG9uc2VIYW5kbGVyLnBhc3NUaHJvdWdoKCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGdldFJlc3BvbnNlSGFuZGxlcihzdGF0ZSkge1xuICAgIGlmICghcmVzcG9uc2VIYW5kbGVyc1tzdGF0ZS5uYW1lXSkge1xuICAgICAgcmVzcG9uc2VIYW5kbGVyc1tzdGF0ZS5uYW1lXSA9ICRodHRwQmFja2VuZC53aGVuKHN0YXRlLnZlcmIgfHwgJ0dFVCcsIG5ldyBSZWdFeHAoc3RhdGUudXJsKSk7XG4gICAgfVxuICAgIHJldHVybiByZXNwb25zZUhhbmRsZXJzW3N0YXRlLm5hbWVdO1xuICB9XG5cbiAgcmV0dXJuIHtcbiAgICAvL2NvbmZpZ3VyZWQgc3RhdGVzIHRvZG8gZG9jXG4gICAgc3RhdGVzOiBzdGF0ZXMsXG4gICAgLy90b2RvIGRvY1xuICAgIGFjdGl2ZV9zdGF0ZXNfb3B0aW9uOiBbXSxcbiAgICAvL3RvZG8gZG9jXG4gICAgdXBzZXJ0T3B0aW9uOiB1cHNlcnRPcHRpb24sXG4gICAgLy90b2RvIGRvY1xuICAgIGZldGNoU3RhdGVzOiBmZXRjaFN0YXRlcyxcbiAgICBnZXRTdGF0ZTogZnVuY3Rpb24obmFtZSl7XG4gICAgICB2YXIgc3RhdGUgPSBmZXRjaFN0YXRlcygpLmZpbmQoc3RhdGUgPT4gc3RhdGUubmFtZSA9PT0gbmFtZSk7XG4gICAgICByZXR1cm4gKHN0YXRlICYmIHN0YXRlLmFjdGl2ZSAmJiBmaW5kU3RhdGVPcHRpb24obmFtZSkpIHx8IG51bGw7XG4gICAgfSxcbiAgICBhZGRTdGF0ZTogZnVuY3Rpb24oc3RhdGVPYmopIHtcbiAgICAgIHN0YXRlT2JqLm9wdGlvbnMuZm9yRWFjaCgob3B0aW9uKSA9PiB7XG4gICAgICAgIHRoaXMudXBzZXJ0KHtcbiAgICAgICAgICBzdGF0ZTogc3RhdGVPYmoubmFtZSxcbiAgICAgICAgICB1cmw6IHN0YXRlT2JqLnVybCxcbiAgICAgICAgICB2ZXJiOiBvcHRpb24udmVyYixcbiAgICAgICAgICBuYW1lOiBvcHRpb24ubmFtZSxcbiAgICAgICAgICBzdGF0dXM6IG9wdGlvbi5zdGF0dXMsXG4gICAgICAgICAgZGF0YTogb3B0aW9uLmRhdGEsXG4gICAgICAgICAgZGVsYXk6IG9wdGlvbi5kZWxheVxuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH0sXG4gICAgYWRkU3RhdGVzOiBmdW5jdGlvbihzdGF0ZXNBcnIpIHtcbiAgICAgIHN0YXRlc0Fyci5mb3JFYWNoKChzdGF0ZU9iaikgPT4ge1xuICAgICAgICB0aGlzLmFkZFN0YXRlKHN0YXRlT2JqKTtcbiAgICAgIH0pO1xuICAgIH0sXG4gICAgLy9pbnNlcnQgb3IgcmVwbGFjZSBhbiBvcHRpb24gYnkgaW5zZXJ0IG9yIHVwZGF0ZWluZyBhIHN0YXRlLlxuICAgIHVwc2VydDogZnVuY3Rpb24oeyB2ZXJiLCBzdGF0ZSwgbmFtZSwgdXJsLCBzdGF0dXMgPSAyMDAsIGRhdGEgPSB7fSwgZGVsYXkgPSAwfSl7XG4gICAgICB2YXIgZGVmYXVsdFN0YXRlID0ge307XG5cbiAgICAgIHZhciBkZWZhdWx0T3B0aW9uID0ge307XG5cbiAgICAgIGlmICghc3RhdGUpIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJjYW5ub3QgdXBzZXJ0IC0gc3RhdGUgaXMgbWFuZGF0b3J5XCIpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIHZhciBzdGF0ZUl0ZW0gPSBzdGF0ZXMuZmluZChfc3RhdGUgPT4gX3N0YXRlLm5hbWUgPT09IHN0YXRlKSB8fCBkZWZhdWx0U3RhdGU7XG5cbiAgICAgIGFuZ3VsYXIuZXh0ZW5kKHN0YXRlSXRlbSwge1xuICAgICAgICBuYW1lOiBzdGF0ZSxcbiAgICAgICAgdXJsOiB1cmwgfHwgc3RhdGVJdGVtLnVybCxcbiAgICAgICAgdmVyYjogdmVyYiB8fCBzdGF0ZUl0ZW0udmVyYixcbiAgICAgICAgb3B0aW9uczogc3RhdGVJdGVtLm9wdGlvbnMgfHwgW11cbiAgICAgIH0pO1xuXG5cbiAgICAgIGlmIChzdGF0ZUl0ZW0gPT09IGRlZmF1bHRTdGF0ZSkge1xuICAgICAgICBzdGF0ZXMucHVzaChzdGF0ZUl0ZW0pO1xuICAgICAgfVxuXG4gICAgICB2YXIgb3B0aW9uID0gc3RhdGVJdGVtLm9wdGlvbnMuZmluZChfb3B0aW9uID0+IF9vcHRpb24ubmFtZSA9PT0gbmFtZSkgfHwgZGVmYXVsdE9wdGlvbjtcblxuICAgICAgYW5ndWxhci5leHRlbmQob3B0aW9uLCB7XG4gICAgICAgIG5hbWU6IG5hbWUsXG4gICAgICAgIHN0YXR1czogc3RhdHVzLFxuICAgICAgICBkYXRhOiBkYXRhLFxuICAgICAgICBkZWxheTogZGVsYXlcbiAgICAgIH0pO1xuXG4gICAgICBpZiAob3B0aW9uID09PSBkZWZhdWx0T3B0aW9uKSB7XG4gICAgICAgIHN0YXRlSXRlbS5vcHRpb25zLnB1c2gob3B0aW9uKTtcbiAgICAgIH1cbiAgICAgIHN5bmMoKTtcbiAgICB9LFxuICAgIC8vdG9kbyBkb2NcbiAgICB1cHNlcnRNYW55OiBmdW5jdGlvbihpdGVtcyl7XG4gICAgICBpdGVtcy5mb3JFYWNoKGl0ZW0gPT4gdGhpcy51cHNlcnQoaXRlbSkpO1xuICAgIH0sXG4gICAgZGVhY3RpdmF0ZUFsbDogZGVhY3RpdmF0ZUFsbFxuICB9O1xufVxuXG5leHBvcnQgZGVmYXVsdCBjb25maWd1cmF0aW9uU2VydmljZTsiLCJmdW5jdGlvbiBzdG9yYWdlU2VydmljZSgpIHtcbiAgdmFyIFNUQVRFU19TVE9SRV9LRVkgPSAnc3RhdGVzJztcbiAgZnVuY3Rpb24gZ2V0SXRlbShrZXkpIHtcbiAgICB2YXIgaXRlbSA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKGtleSk7XG4gICAgaWYgKCFpdGVtKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgcmV0dXJuIGFuZ3VsYXIuZnJvbUpzb24oaXRlbSk7XG4gIH1cblxuICBmdW5jdGlvbiBzZXRJdGVtKGtleSwgZGF0YSkge1xuICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKGtleSwgYW5ndWxhci50b0pzb24oZGF0YSkpO1xuICB9XG5cbiAgZnVuY3Rpb24gZ2V0U3RhdGVzKCkge1xuICAgIHJldHVybiBnZXRJdGVtKFNUQVRFU19TVE9SRV9LRVkpIHx8IHt9O1xuICB9XG5cbiAgZnVuY3Rpb24gc2V0U3RhdGVzKHN0YXRlcykge1xuICAgIHNldEl0ZW0oU1RBVEVTX1NUT1JFX0tFWSwgc3RhdGVzKTtcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgZ2V0SXRlbTogZ2V0SXRlbSxcbiAgICBzZXRJdGVtOiBzZXRJdGVtLFxuICAgIHNldFN0YXRlczogc2V0U3RhdGVzLFxuICAgIGdldFN0YXRlczogZ2V0U3RhdGVzXG4gIH07XG59XG5cbmV4cG9ydCBkZWZhdWx0IHN0b3JhZ2VTZXJ2aWNlOyIsIi8vIFRoaXMgSXMgQSBIZWFkZXJcbi8vIC0tLS0tLS0tLS0tLS0tLS1cblxuXG4vLyBUaGlzIGlzIGEgbm9ybWFsIGNvbW1lbnQsIHRoYXQgd2lsbCBiZWNvbWUgcGFydCBvZiB0aGVcbi8vIGFubm90YXRpb25zIGFmdGVyIHJ1bm5pbmcgdGhyb3VnaCB0aGUgRG9jY28gdG9vbC4gVXNlIHRoaXNcbi8vIHNwYWNlIHRvIGRlc2NyaWJlIHRoZSBmdW5jdGlvbiBvciBvdGhlciBjb2RlIGp1c3QgYmVsb3dcbi8vIHRoaXMgY29tbWVudC4gRm9yIGV4YW1wbGU6XG4vL1xuLy8gVGhlIGBEb1NvbWV0aGluZ2AgbWV0aG9kIGRvZXMgc29tZXRoaW5nISBJdCBkb2Vzbid0IHRha2UgYW55XG4vLyBwYXJhbWV0ZXJzLi4uIGl0IGp1c3QgZG9lcyBzb21ldGhpbmcuXG5mdW5jdGlvbiB3aW5kb3dCb2R5RGlyZWN0aXZlKCRodHRwLCBjb25maWd1cmF0aW9uKSB7XG4gIHJldHVybiB7XG4gICAgcmVzdHJpY3Q6ICdFJyxcbiAgICB0ZW1wbGF0ZVVybDogJ3dpbmRvdy1ib2R5Lmh0bWwnLFxuICAgIHNjb3BlOiB0cnVlLFxuICAgIHJlcGxhY2U6IHRydWUsXG4gICAgY29udHJvbGxlcjogZnVuY3Rpb24oJHNjb3BlKXtcbiAgICAgICRzY29wZS5zZWxlY3RlZEl0ZW0gPSAnYWN0aXZhdGUnO1xuICAgICAgJHNjb3BlLk5vdGhhc1VybCA9IGZ1bmN0aW9uKG9wdGlvbil7XG4gICAgICAgIHJldHVybiAhb3B0aW9uLnVybDtcbiAgICAgIH07XG4gICAgICAkc2NvcGUuaGFzVXJsID0gZnVuY3Rpb24ob3B0aW9uKXtcbiAgICAgICAgcmV0dXJuICEhb3B0aW9uLnVybDtcbiAgICAgIH07XG5cbiAgICAgICRzY29wZS5kZWFjdGl2YXRlID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICRzY29wZS5zdGF0ZXMuZm9yRWFjaChmdW5jdGlvbihzdGF0ZSl7XG4gICAgICAgICAgICBzdGF0ZS5hY3RpdmUgPSBmYWxzZTtcbiAgICAgICAgfSk7XG4gICAgICAgIGNvbmZpZ3VyYXRpb24uZGVhY3RpdmF0ZUFsbCgpO1xuICAgICAgfTtcblxuICAgICAgJHNjb3BlLnVwZGF0ZVN0YXRlID0gZnVuY3Rpb24oc3RhdGUpe1xuICAgICAgICBjb25zb2xlLmxvZyhgdXBkYXRlIHN0YXRlOiAke3N0YXRlLm5hbWV9ICR7c3RhdGUuYWN0aXZlT3B0aW9uLm5hbWV9ICR7c3RhdGUuYWN0aXZlfWApO1xuICAgICAgICBjb25maWd1cmF0aW9uLnVwc2VydE9wdGlvbihzdGF0ZS5uYW1lLCBzdGF0ZS5hY3RpdmVPcHRpb24ubmFtZSwgc3RhdGUuYWN0aXZlKTtcbiAgICAgIH07XG5cbiAgICAgICRzY29wZS5zdGF0ZXMgPSBjb25maWd1cmF0aW9uLmZldGNoU3RhdGVzKCk7XG4gICAgfSxcbiAgICBsaW5rOiBmdW5jdGlvbihzY29wZSkge1xuICAgICAgc2NvcGUudGVzdCA9IHtcbiAgICAgICAgdXJsOiAnJyxcbiAgICAgICAgdmFsdWU6IHVuZGVmaW5lZFxuICAgICAgfTtcblxuICAgICAgc2NvcGUuc3VibWl0ID0gZnVuY3Rpb24odXJsKXtcbiAgICAgICAgc2NvcGUudGVzdC52YWx1ZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgc2NvcGUudXJsID0gdXJsO1xuICAgICAgICBpZiAodXJsKSB7XG4gICAgICAgICAgJGh0dHAuZ2V0KHVybCkuc3VjY2VzcyhmdW5jdGlvbiAocmVzKSB7XG4gICAgICAgICAgICBzY29wZS50ZXN0LnZhbHVlID0gcmVzO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgIH1cbiAgfTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgd2luZG93Qm9keURpcmVjdGl2ZSIsImltcG9ydCBhY3RpdmF0b3JEaXJlY3RpdmUgZnJvbSAnLi9hY3RpdmF0b3IuZHJ2LmpzJztcbmltcG9ydCBjb25maWd1cmF0aW9uU2VydmljZSBmcm9tICcuL2NvbmZpZ3VyYXRpb24uc3J2LmpzJztcbmltcG9ydCBzdG9yYWdlU2VydmljZSBmcm9tICcuL3N0b3JhZ2Uuc3J2LmpzJztcbmltcG9ydCB3aW5kb3dCb2R5RGlyZWN0aXZlIGZyb20gJy4vd2luZG93LWJvZHkuZHJ2LmpzJztcblxuZXhwb3J0IGRlZmF1bHQgYW5ndWxhci5tb2R1bGUoJ2xlb25hcmRvJywgWydsZW9uYXJkby50ZW1wbGF0ZXMnLCAnbmdNb2NrRTJFJ10pXG4gIC5mYWN0b3J5KCdzdG9yYWdlJywgc3RvcmFnZVNlcnZpY2UpXG4gIC5mYWN0b3J5KCdjb25maWd1cmF0aW9uJywgY29uZmlndXJhdGlvblNlcnZpY2UpXG4gIC5kaXJlY3RpdmUoJ2FjdGl2YXRvcicsIGFjdGl2YXRvckRpcmVjdGl2ZSlcbiAgLmRpcmVjdGl2ZSgnd2luZG93Qm9keScsIHdpbmRvd0JvZHlEaXJlY3RpdmUpXG4gIC8qIHdyYXAgJGh0dHBiYWNrZW5kIHdpdGggYSBwcm94eSBpbiBvcmRlciB0byBzdXBwb3J0IGRlbGF5aW5nIGl0cyByZXNwb25zZXNcbiAgICogd2UgYXJlIHVzaW5nIHRoZSBhcHByb2FjaCBkZXNjcmliZWQgaW4gRW5kbGVzcyBJbmRpcmVjdGlvbjpcbiAgICogaHR0cHM6Ly9lbmRsZXNzaW5kaXJlY3Rpb24ud29yZHByZXNzLmNvbS8yMDEzLzA1LzE4L2FuZ3VsYXJqcy1kZWxheS1yZXNwb25zZS1mcm9tLWh0dHBiYWNrZW5kL1xuICAgKi9cbiAgLmNvbmZpZyhmdW5jdGlvbigkcHJvdmlkZSkge1xuICAgICRwcm92aWRlLmRlY29yYXRvcignJGh0dHBCYWNrZW5kJywgZnVuY3Rpb24oJGRlbGVnYXRlKSB7XG4gICAgICB2YXIgcHJveHkgPSBmdW5jdGlvbihtZXRob2QsIHVybCwgZGF0YSwgY2FsbGJhY2ssIGhlYWRlcnMpIHtcbiAgICAgICAgdmFyIGludGVyY2VwdG9yID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgdmFyIF90aGlzID0gdGhpcyxcbiAgICAgICAgICAgICAgX2FyZ3VtZW50cyA9IGFyZ3VtZW50cztcbiAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgY2FsbGJhY2suYXBwbHkoX3RoaXMsIF9hcmd1bWVudHMpO1xuICAgICAgICAgIH0sIHByb3h5LmRlbGF5IHx8IDApO1xuICAgICAgICAgIHByb3h5LmRlbGF5ID0gMDtcbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuICRkZWxlZ2F0ZS5jYWxsKHRoaXMsIG1ldGhvZCwgdXJsLCBkYXRhLCBpbnRlcmNlcHRvciwgaGVhZGVycyk7XG4gICAgICB9O1xuICAgICAgZm9yKHZhciBrZXkgaW4gJGRlbGVnYXRlKSB7XG4gICAgICAgIHByb3h5W2tleV0gPSAkZGVsZWdhdGVba2V5XTtcbiAgICAgIH1cbiAgICAgIHByb3h5LnNldERlbGF5ID0gKGRlbGF5KSA9PiB7XG4gICAgICAgIHByb3h5LmRlbGF5ID0gZGVsYXk7XG4gICAgICB9O1xuICAgICAgcmV0dXJuIHByb3h5O1xuICAgIH0pO1xuICB9KTtcblxuIl19

(function(module) {
try {
  module = angular.module('leonardo.templates');
} catch (e) {
  module = angular.module('leonardo.templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('window-body.html',
    '<div class="leonardo-window-body"><div class="tabs"><div ng-click="selectedItem = \'configure\'" ng-class="{ \'selected\': selectedItem == \'configure\' }">Configure</div><div ng-click="selectedItem = \'activate\'" ng-class="{ \'selected\': selectedItem == \'activate\' }">Activate</div><div ng-click="selectedItem = \'test\'" ng-class="{ \'selected\': selectedItem == \'test\' }">Test</div></div><div ng-switch="selectedItem" class="leonardo-window-options"><div ng-switch-when="configure" class="leonardo-configure"><table><thead><tr><th>State</th><th>URL</th><th>Options</th></tr></thead><tbody><tr ng-repeat="state in states"><td>{{state.name}}</td><td>{{state.url}}</td><td><ul><li ng-repeat="option in state.options">Name: {{option.name}}<br>Status: {{option.status}}<br>Data: {{option.data}}<br></li></ul></td></tr></tbody></table></div><div ng-switch-when="activate" class="leonardo-activate"><ul><li><h3>Non Ajax State</h3></li><li ng-repeat="state in ::states | filter:NothasUrl"><div><div class="onoffswitch"><input ng-model="state.active" ng-click="updateState(state)" class="onoffswitch-checkbox" id="{{::state.name}}" type="checkbox" name="{{::state.name}}" value="{{::state.name}}"> <label class="onoffswitch-label" for="{{::state.name}}"><span class="onoffswitch-inner"></span> <span class="onoffswitch-switch"></span></label></div></div><div><h4>{{::state.name}}</h4></div><div><select ng-model="state.activeOption" ng-options="option.name for option in ::state.options" ng-change="updateState(state)"></select></div></li><li><h3>Ajax State</h3></li><li ng-repeat="state in ::states | filter:hasUrl"><div><div class="onoffswitch"><input ng-model="state.active" ng-click="updateState(state)" class="onoffswitch-checkbox" id="{{::state.name}}" type="checkbox" name="{{::state.name}}" value="{{::state.name}}"> <label class="onoffswitch-label" for="{{::state.name}}"><span class="onoffswitch-inner"></span> <span class="onoffswitch-switch"></span></label></div></div><div><h4>{{::state.name}}</h4>&nbsp;&nbsp; - {{::state.url}}</div><div><select ng-model="state.activeOption" ng-options="option.name for option in ::state.options" ng-change="updateState(state)"></select></div></li></ul></div><div ng-switch-when="test" class="leonardo-test"><div><label for="url"></label>URL: <input id="url" type="text" ng-model="test.url"> <input type="button" ng-click="submit(test.url)" value="submit"></div><textarea>{{test.value | json}}</textarea></div></div></div>');
}]);
})();

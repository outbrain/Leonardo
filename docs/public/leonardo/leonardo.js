
angular.module('leonardo', ['leonardo.templates', 'ngMockE2E'])
  /* wrap $httpbackend with a proxy in order to support delaying its responses
   * we are using the approach described in Endless Indirection:
   * https://endlessindirection.wordpress.com/2013/05/18/angularjs-delay-response-from-httpbackend/
   */
  .config(function($provide) {
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
      for(var key in $delegate) {
        proxy[key] = $delegate[key];
      }
      proxy.setDelay = function(delay) {
        proxy.delay = delay;
      };
      return proxy;
    });
  });


angular.module('leonardo').factory('configuration', function(storage, $httpBackend) {
  var states = [];
  var responseHandlers = {};

  var upsertOption = function(state, name, active) {
    var _states = storage.getStates();
    _states[state] = {
      name: name,
      active: active
    };

    storage.setStates(_states);

    sync();
  };

  function fetchStates(){
    var activeStates = storage.getStates();
    var _states = states.map(function(state) {
      return angular.copy(state);
    });

    _states.forEach(function(state) {
      var option = activeStates[state.name];
      state.active = !!option && option.active;
      state.activeOption = !!option ?
        state.options.filter(function (_option) {
          return _option.name === option.name;
        })[0] : state.options[0];
    });

    return _states;
  }

  function deactivateAll() {
    var _states = storage.getStates();
    Object.keys(_states).forEach(function(stateKey) {
      _states[stateKey].active = false;
    });
    storage.setStates(_states);

    sync();
  }

  function findStateOption(name){
    return fetchStates().filter(function(state){ return state.name === name;})[0].activeOption;
  }

  function sync(){
    fetchStates().forEach(function (state) {
      var option, responseHandler;
      if (state.url) {
        option = findStateOption(state.name);
        responseHandler = getResponseHandler(state);
        if (state.active) {
          responseHandler.respond(function () {
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
    if (!responseHandlers[state.name]) {
      responseHandlers[state.name] = $httpBackend.when(state.verb || 'GET', new RegExp(state.url));
    }
    return responseHandlers[state.name];
  }

  return {
    //configured states todo doc
    states: states,
    //todo doc
    active_states_option: [],
    //todo doc
    upsertOption: upsertOption,
    //todo doc
    fetchStates: fetchStates,
    getState: function(name){
      var state = fetchStates().filter(function(state) { return state.name === name})[0];
      return (state && state.active && findStateOption(name)) || null;
    },
    addState: function(stateObj) {
      stateObj.options.forEach(function (option) {
        this.upsert({
          state: stateObj.name,
          url: stateObj.url,
          verb: option.verb,
          name: option.name,
          status: option.status,
          data: option.data,
          delay: option.delay
        });
      }.bind(this));
    },
    addStates: function(statesArr) {
      statesArr.forEach(function(stateObj) {
        this.addState(stateObj);
      }.bind(this));
    },
    //insert or replace an option by insert or updateing a state.
    upsert: function(stateObj) {
      var verb = stateObj.verb,
          state = stateObj.state,
          name = stateObj.name,
          url = stateObj.url,
          status = stateObj.status || 200,
          data = stateObj.data || {},
          delay = stateObj.delay || 0;
      var defaultState = {};

      var defaultOption = {};

      if (!state) {
        console.log("cannot upsert - state is mandatory");
        return;
      }

      var stateItem = states.filter(function(_state) { return _state.name === state;})[0] || defaultState;

      angular.extend(stateItem, {
        name: state,
        url: url || stateItem.url,
        verb: verb || stateItem.verb,
        options: stateItem.options || []
      });


      if (stateItem === defaultState) {
        states.push(stateItem);
      }

      var option = stateItem.options.filter(function(_option) {return _option.name === name})[0] || defaultOption;

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
    //todo doc
    upsertMany: function(items){
      items.forEach(function(item) {
        this.upsert(item);
      }.bind(this));
    },
    deactivateAll: deactivateAll
  };
});

angular.module('leonardo').factory('storage', function storageService() {
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
});

angular.module('leonardo').directive('activator', function activatorDirective($compile) {
  return {
    restrict: 'A',
    link: function(scope, elem) {
      var el = angular.element('<div ng-click="activate()" class="leonardo-activator"></div>');

      var win = angular.element([
      '<div class="leonardo-window">',
        '<div class="leonardo-header">Leonardo Configuration</div>',
          '<window-body></window-body>',
        '</div>',
      '</div>'
      ].join(''));

      $compile(el)(scope);
      $compile(win)(scope);

      elem.append(el);
      elem.append(win);

      win[0].addEventListener( 'webkitTransitionEnd', function() {
        if (!document.body.classList.contains('pull-top')){
          document.body.classList.add("pull-top-closed");
        }
      }, false );

      scope.activate = function(){
        if (!document.body.classList.contains('pull-top')) {
          document.body.classList.add('pull-top');
          document.body.classList.remove('pull-top-closed');
        }
        else {
          document.body.classList.remove('pull-top');
        }
      };
    }
  };
});

// This Is A Header
// ----------------


// This is a normal comment, that will become part of the
// annotations after running through the Docco tool. Use this
// space to describe the function or other code just below
// this comment. For example:
//
// The `DoSomething` method does something! It doesn't take any
// parameters... it just does something.
angular.module('leonardo').directive('windowBody', function windowBodyDirective($http, configuration) {
  return {
    restrict: 'E',
    templateUrl: 'window-body.html',
    scope: true,
    replace: true,
    controller: function($scope){
      $scope.selectedItem = 'activate';
      $scope.NothasUrl = function(option){
        return !option.url;
      };
      $scope.hasUrl = function(option){
        return !!option.url;
      };

      $scope.deactivate = function() {
        $scope.states.forEach(function(state){
            state.active = false;
        });
        configuration.deactivateAll();
      };

      $scope.updateState = function(state){
        console.log(`update state: ${state.name} ${state.activeOption.name} ${state.active}`);
        configuration.upsertOption(state.name, state.activeOption.name, state.active);
      };

      $scope.states = configuration.fetchStates();
    },
    link: function(scope) {
      scope.test = {
        url: '',
        value: undefined
      };

      scope.submit = function(url){
        scope.test.value = undefined;
        scope.url = url;
        if (url) {
          $http.get(url).success(function (res) {
            scope.test.value = res;
          });
        }
      };
    }
  };
});

(function(module) {
try {
  module = angular.module('leonardo.templates');
} catch (e) {
  module = angular.module('leonardo.templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('window-body.html',
    '<div class="leonardo-window-body"><div class="tabs"><div ng-click="selectedItem = \'configure\'" ng-class="{ \'selected\': selectedItem == \'configure\' }">Configure</div><div ng-click="selectedItem = \'activate\'" ng-class="{ \'selected\': selectedItem == \'activate\' }">Activate</div><div ng-click="selectedItem = \'test\'" ng-class="{ \'selected\': selectedItem == \'test\' }">Test</div></div><div ng-switch="selectedItem" class="leonardo-window-options"><div ng-switch-when="configure" class="leonardo-configure"><table><thead><tr><th>State</th><th>URL</th><th>Options</th></tr></thead><tbody><tr ng-repeat="state in states"><td>{{state.name}}</td><td>{{state.url}}</td><td><ul><li ng-repeat="option in state.options">Name: {{option.name}}<br>Status: {{option.status}}<br>Data: {{option.data}}<br></li></ul></td></tr></tbody></table></div><div ng-switch-when="activate" class="leonardo-activate"><ul><li><h3>Non Ajax State</h3></li><li ng-repeat="state in states | filter:NothasUrl"><div><div class="onoffswitch"><input ng-model="state.active" ng-click="updateState(state)" class="onoffswitch-checkbox" id="{{state.name}}" type="checkbox" name="{{state.name}}" value="{{state.name}}"> <label class="onoffswitch-label" for="{{state.name}}"><span class="onoffswitch-inner"></span> <span class="onoffswitch-switch"></span></label></div></div><div><h4>{{state.name}}</h4></div><div><select ng-model="state.activeOption" ng-options="option.name for option in state.options" ng-change="updateState(state)"></select></div></li><li><h3>Ajax State</h3></li><li ng-repeat="state in states | filter:hasUrl"><div><div class="onoffswitch"><input ng-model="state.active" ng-click="updateState(state)" class="onoffswitch-checkbox" id="{{state.name}}" type="checkbox" name="{{state.name}}" value="{{state.name}}"> <label class="onoffswitch-label" for="{{state.name}}"><span class="onoffswitch-inner"></span> <span class="onoffswitch-switch"></span></label></div></div><div><h4>{{state.name}}</h4>&nbsp;&nbsp; - {{state.url}}</div><div><select ng-model="state.activeOption" ng-options="option.name for option in state.options" ng-change="updateState(state)"></select></div></li></ul></div><div ng-switch-when="test" class="leonardo-test"><div><label for="url"></label>URL: <input id="url" type="text" ng-model="test.url"> <input type="button" ng-click="submit(test.url)" value="submit"></div><textarea>{{test.value | json}}</textarea></div></div></div>');
}]);
})();

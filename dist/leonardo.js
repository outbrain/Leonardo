angular.module('leonardo', ['leonardo.templates', 'ngMockE2E'])
  .config(['$provide', '$httpProvider', function($provide, $httpProvider) {

    $httpProvider.interceptors.push('leoHttpInterceptor');

    $provide.decorator('$httpBackend', ['$delegate', '$timeout', function($delegate, $timeout) {
      var proxy = function(method, url, data, callback, headers) {
        var interceptor = function() {
          var _this = this,
            _arguments = arguments;
          $timeout(function() {
            callback.apply(_this, _arguments);
          }, proxy.delay || 0);
          proxy.delay = 0;
        };
        return $delegate.call(this, method, url, data, interceptor, headers);
      };

      for(var key in $delegate) {
        if ($delegate.hasOwnProperty(key)) {
          proxy[key] = $delegate[key];
        }
      }

      proxy.setDelay = function(delay) {
        proxy.delay = delay;
      };

      return proxy;
    }]);

    $provide.decorator('$http', ['leoConfiguration', '$delegate', function(leoConfiguration, $delegate) {
      var proxy = function(requestConfig) {
        leoConfiguration._requestSubmitted(requestConfig);
        return $delegate.call(this, requestConfig);
      };

      for(var key in $delegate) {
        if ($delegate.hasOwnProperty(key)) {
          proxy[key] = $delegate[key];
        }
      }

      createShortMethodsWithData('post', 'put', 'patch');

      createShortMethods('get', 'delete', 'head', 'jsonp');

      function createShortMethods() {
        angular.forEach(arguments, function(name) {
          proxy[name] = function(url, config) {
            return proxy(angular.extend({}, config || {}, {
              method: name,
              url: url
            }));
          };
        });
      }

      function createShortMethodsWithData() {
        angular.forEach(arguments, function(name) {
          proxy[name] = function(url, data, config) {
            return proxy(angular.extend({}, config || {}, {
              method: name,
              url: url,
              data: data
            }));
          };
        });
      }

      return proxy;
    }]);
  }])
  .run(['leoConfiguration', function(leoConfiguration) {
      leoConfiguration.loadSavedStates();
    }]);

// Common.js package manager support (e.g. ComponentJS, WebPack)
if (typeof module !== "undefined" && typeof exports !== "undefined" && module.exports === exports) {
  module.exports = 'leonardo';
}

angular.module('leonardo').provider('$leonardo', function LeonardoProvider() {
    var pref = '';

    this.setAppPrefix = function (prefix) {
        pref = prefix;
    };

    this.$get = [function leonardoProvider() {

        return {
            getAppPrefix: function () {
                return pref;
            }
        };
    }];
});
angular.module('leonardo').factory('leoConfiguration',
    ['leoStorage', '$httpBackend', '$rootScope', function(leoStorage, $httpBackend, $rootScope) {
  var states = [],
      _scenarios = {},
      responseHandlers = {},
      _requestsLog = [],
      _savedStates = [],
      // Core API
      // ----------------
      api = {
        // Add a new state which you wish to mock - there a two types of states - one with url and one without.
        addState: addState,
        addStates: addStates,
        getState: getState,
        getStates: fetchStates,
        deactivateState: deactivateState,
        deactivateAllStates: deactivateAll,
        activateStateOption: activateStateOption,
        addScenario: addScenario,
        addScenarios: addScenarios,
        getScenario: getScenario,
        getScenarios: getScenarios,
        setActiveScenario: setActiveScenario,
        getRecordedStates: getRecordedStates,
        getRequestsLog: getRequestsLog,
        loadSavedStates: loadSavedStates,
        addSavedState: addSavedState,
        //Private api for passing through unregistered urls to $htto
        _requestSubmitted: requestSubmitted,
        _logRequest: logRequest
      };
  return api;

  function upsertOption(state, name, active) {
    var _states = leoStorage.getStates();
    _states[state] = {
      name: name || findStateOption(state).name,
      active: active
    };

    leoStorage.setStates(_states);

    sync();
  }

  function fetchStatesByUrl(url, method){
    return fetchStates().filter(function(state){
      return state.url === url && state.verb.toLowerCase() === method.toLowerCase();
    });
  }

  function fetchStates(){
    var activeStates = leoStorage.getStates();
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
    var _states = leoStorage.getStates();
    Object.keys(_states).forEach(function(stateKey) {
      _states[stateKey].active = false;
    });
    leoStorage.setStates(_states);

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
    var url = state.url;
    var verb = state.verb === 'jsonp' ? state.verb : state.verb.toUpperCase();
    var key = (url + '_' + verb).toUpperCase();

    var escapedUrl = url.replace(/[?]/g, '\\?');
    if (!responseHandlers[key]) {
      if (state.verb === 'jsonp'){
        responseHandlers[key] = $httpBackend.whenJSONP(new RegExp(escapedUrl));
      }
      else {
        responseHandlers[key] = $httpBackend.when(verb || 'GET', new RegExp(escapedUrl));
      }
    }
    return responseHandlers[key];
  }

  function getState(name){
    var state = fetchStates().filter(function(state) { return state.name === name})[0];
    return (state && state.active && findStateOption(name)) || null;
  }

  function addState(stateObj) {
    stateObj.options.forEach(function (option) {
      upsert({
        state: stateObj.name,
        url: stateObj.url,
        verb: stateObj.verb,
        name: option.name,
        status: option.status,
        data: option.data,
        delay: option.delay
      });
    });

    $rootScope.$broadcast('leonardo:stateChanged', stateObj);
  }

  function addStates(statesArr) {
    if (angular.isArray(statesArr)) {
      statesArr.forEach(function(stateObj) {
        addState(stateObj);
      });
    } else {
      console.warn('leonardo: addStates should get an array');
    }
  }

  function upsert(stateObj) {
    var verb = stateObj.verb || 'GET',
        state = stateObj.state,
        name = stateObj.name,
        url = stateObj.url,
        status = stateObj.status || 200,
        data = angular.isDefined(stateObj.data) ? stateObj.data : {},
        delay = stateObj.delay || 0;
    var defaultState = {};

    var defaultOption = {};

    if (!state) {
      console.log("leonardo: cannot upsert - state is mandatory");
      return;
    }

    var stateItem = states.filter(function(_state) { return _state.name === state;})[0] || defaultState;

    angular.extend(stateItem, {
      name: state,
      url: url || stateItem.url,
      verb: verb,
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
  }

  function addScenario(scenario){
    if (scenario && typeof scenario.name === 'string') {
      _scenarios[scenario.name] = scenario;
    } else {
      throw 'addScenario method expects a scenario object with name property';
    }
  }

  function addScenarios(scenarios){
    angular.forEach(scenarios, addScenario);
  }

  function getScenarios(){
    return Object.keys(_scenarios);
  }

  function getScenario(name){
    if (!_scenarios[name]) {
      return;
    }
    return _scenarios[name].states;
  }

  function setActiveScenario(name){
    var scenario = getScenario(name);
    if (!scenario) {
      console.warn("leonardo: could not find scenario named " + name);
      return;
    }
    deactivateAll();
    scenario.forEach(function(state){
      upsertOption(state.name, state.option, true);
    });
  }

  function activateStateOption(state, optionName) {
    upsertOption(state, optionName, true);
  }

  function deactivateState(state) {
    upsertOption(state, null, false);
  }

  function requestSubmitted(requestConfig){
    var url = requestConfig.url;
    var method = requestConfig.method;

    var state = fetchStatesByUrl(url, method)[0];
    var handler = getResponseHandler(state || {
        url: url,
        verb: method
      });
    if (!state) {
      handler.passThrough();
    }
  }

  function logRequest(method, url, data, status) {
    if (method && url && !(url.indexOf(".html") > 0)) {
      var req = {
        verb: method,
        data: data,
        url: url.trim(),
        status: status,
        timestamp: new Date()
      };
      req.state = getStateByRequest(req);
      _requestsLog.push(req);
    }
  }

  function getStateByRequest(req) {
    return fetchStates().filter(function(state) {
      if (!state.url) return false;
      return state.url === req.url && state.verb.toLowerCase() === req.verb.toLowerCase();
    })[0];
  }

  function getRequestsLog() {
    return _requestsLog;
  }

  function loadSavedStates() {
    _savedStates = leoStorage.getSavedStates();
    addStates(_savedStates);
  }

  function addSavedState(state) {
    _savedStates.push(state);
    leoStorage.setSavedStates(_savedStates);
    addState(state);
  }

  function getRecordedStates() {
    var requestsArr = _requestsLog
          .map(function(req){
            var state = getStateByRequest(req);
            return {
              name: state ? state.name : req.verb + " " + req.url,
              verb: req.verb,
              url: req.url,
              options: [{
                name: req.status >= 200 && req.status < 300 ? 'Success' : 'Failure',
                status: req.status,
                data: req.data
              }]
            }
          });
    console.log(angular.toJson(requestsArr, true));
    return requestsArr;
  }
}]);

angular.module('leonardo').factory('leoHttpInterceptor', ['leoConfiguration', '$q', function(leoConfiguration, $q) {
  return {
    'request': function(request) {
      return $q.when(request);
    },
    'response': function(response) {
      leoConfiguration._logRequest(response.config.method, response.config.url, response.data, response.status);
      return $q.when(response);
    },
    'responseError': function(rejection) {
      leoConfiguration._logRequest(rejection.config.method, rejection.config.url, rejection.data, rejection.status);
      return $q.reject(rejection);
    }
  };
}]);

angular.module('leonardo').factory('leoStorage', ['$rootScope', '$window', '$leonardo', function storageService($rootScope, $window, $leonardo) {
  var APP_PREFIX = $leonardo.getAppPrefix() + '_',
      STATES_STORE_KEY = APP_PREFIX + 'leonardo-states',
      SAVED_STATES_KEY = APP_PREFIX + 'leonardo-unregistered-states';
  function _getItem(key) {
    var item = $window.localStorage.getItem(key);
    if (!item) {
      return null;
    }
    return angular.fromJson(item);
  }

  function _setItem(key, data) {
    $window.localStorage.setItem(key, angular.toJson(data));
  }

  function getStates() {
    return _getItem(STATES_STORE_KEY) || {};
  }

  function setStates(states) {
    _setItem(STATES_STORE_KEY, states);
    $rootScope.$emit('leonardo:setStates');
  }

  function getSavedStates() {
    return _getItem(SAVED_STATES_KEY) || [];
  }

  function setSavedStates(states) {
    _setItem(SAVED_STATES_KEY, states);
  }

  return {
    setStates: setStates,
    getStates: getStates,
    getSavedStates: getSavedStates,
    setSavedStates: setSavedStates
  };
}]);

angular.module('leonardo').directive('leoActivator', ['$compile', function activatorDirective($compile) {
  return {
    restrict: 'A',
    controllerAs: 'leonardo',
    controller: LeoActivator,
    bindToController: true,
    link: function(scope, elem) {
      var el = angular.element('<div ng-click="leonardo.activate()" class="leonardo-activator" ng-show="leonardo.isLeonardoVisible"></div>');

      var win = angular.element([
      '<div class="leonardo-window">',
        '<div class="leonardo-header">',
          '<div class="menu">',
            '<ul>',
              '<li>LEONARDO</li>',
              '<li ng-class="{ \'leo-selected-tab\': leonardo.activeTab === \'scenarios\' }" ng-click="leonardo.selectTab(\'scenarios\')">Scenarios</li>',
              '<li ng-class="{ \'leo-selected-tab\': leonardo.activeTab === \'recorder\' }"ng-click="leonardo.selectTab(\'recorder\')">Recorder</li>',
              '<li ng-class="{ \'leo-selected-tab\': leonardo.activeTab === \'export\' }"ng-click="leonardo.selectTab(\'export\')">Exported Code</li>',
            '</ul>',
          '</div>',
        '</div>',
        '<leo-window-body></leo-window-body>',
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
    }
  };
}]);

LeoActivator.$inject = ['$scope', '$document'];
function LeoActivator($scope, $document) {
  this.isLeonardoVisible = true;
  this.activeTab = 'scenarios';

  this.selectTab = function (name) {
    this.activeTab = name;
  };

  $document.on('keypress', function(e) {
    if(e.shiftKey && e.ctrlKey && e.keyCode === 12) {
      this.isLeonardoVisible = !this.isLeonardoVisible;
      $scope.$apply();
    }
  }.bind(this));

  this.activate = function() {
    if (!document.body.classList.contains('pull-top')) {
      document.body.classList.add('pull-top');
      document.body.classList.remove('pull-top-closed');
    }
    else {
      document.body.classList.remove('pull-top');
    }
  };
}
angular.module('leonardo').directive('leoWindowBody', ['$http', 'leoConfiguration', '$timeout', function windowBodyDirective($http, leoConfiguration, $timeout) {
  return {
    restrict: 'E',
    templateUrl: 'window-body.html',
    scope: true,
    controller: LeoWindowBody,
    bindToController: true,
    controllerAs: 'leoWindowBody',
    require: ['^leoActivator', 'leoWindowBody'],
    link: function (scope, el, attr, controllers) {
      var leoActivator = controllers[0];
      var leoWindowBody = controllers[1];

      leoWindowBody.saveUnregisteredState = function () {
        var stateName = this.detail.state;

        leoConfiguration.addSavedState({
          name: stateName,
          verb: leoWindowBody.detail._unregisteredState.verb,
          url: leoWindowBody.detail._unregisteredState.url,
          options: [
            {
              name: leoWindowBody.detail.option,
              status: leoWindowBody.detail.status,
              data: leoWindowBody.detail.value,
              delay: leoWindowBody.detail.delay
            }
          ]
        });

        leoActivator.selectTab('scenarios');
      };

      leoWindowBody.test = {
        url: '',
        value: undefined
      };

      leoWindowBody.submit = function (url) {
        leoWindowBody.test.value = undefined;
        leoWindowBody.url = url;
        if (url) {
          $http.get(url).success(function (res) {
            leoWindowBody.test.value = res;
          });
        }
      };
    }
  };
}]);

LeoWindowBody.$inject = ['$scope', 'leoConfiguration', '$timeout'];
function LeoWindowBody($scope, leoConfiguration, $timeout) {
  this.detail = {
    option: 'success',
    delay: 0,
    status: 200
  };

  this.states = leoConfiguration.getStates();

  this.scenarios = leoConfiguration.getScenarios();

  this.notHasUrl = function (option) {
    return !option.url;
  };

  this.hasUrl = function (option) {
    return !!option.url;
  };

  this.deactivate = function () {
    this.states.forEach(function (state) {
      state.active = false;
    });
    leoConfiguration.deactivateAllStates();
  };

  this.updateState = function (state) {
    if (state.active) {
      console.log('leonardo: activate state option:' + state.name + ': ' + state.activeOption.name);
      leoConfiguration.activateStateOption(state.name, state.activeOption.name);
    } else {
      console.log('leonardo: deactivating state: ' + state.name);
      leoConfiguration.deactivateState(state.name);
    }
  };


  this.activateScenario = function (scenario) {
    this.activeScenario = scenario;
    leoConfiguration.setActiveScenario(scenario);
    this.states = leoConfiguration.getStates();
  }.bind(this);

  this.requests = leoConfiguration.getRequestsLog();

  $scope.$watch('leoWindowBody.detail.value', function (value) {
    if (!value) {
      return;
    }
    try {
      this.detail.stringValue = value ? JSON.stringify(value, null, 4) : '';
      this.detail.error = '';
    }
    catch (e) {
      this.detail.error = e.message;
    }
  }.bind(this));

  $scope.$watch('leoWindowBody.detail.stringValue', function (value) {
    try {
      this.detail.value = value ? JSON.parse(value) : {};
      this.detail.error = '';
    }
    catch (e) {
      this.detail.error = e.message;
    }
  }.bind(this));

  this.requestSelect = function (request) {
    this.requests.forEach(function (request) {
      request.active = false;
    });

    request.active = true;

    if (request.state && request.state.name) {
      var optionName = request.state.name + ' option ' + request.state.options.length;
    }

    angular.extend(this.detail, {
      state: (request.state && request.state.name) || '',
      option: optionName || '',
      delay: 0,
      status: 200,
      stateActive: !!request.state,
      value: request.data || {}
    });
    this.detail._unregisteredState = request;
  }.bind(this);

  $scope.$on('leonardo:stateChanged', function (event, stateObj) {
    this.states = leoConfiguration.getStates();

    var state = this.states.filter(function (state) {
      return state.name === stateObj.name;
    })[0];

    if (state) {
      state.highlight = true;
      $timeout(function () {
        state.highlight = false;
      }, 3000);
    }
  }.bind(this));

  this.getStatesForExport = function () {
    this.exportStates = leoConfiguration.getStates();
  }
}

angular.module('leonardo').directive('leoRequest', function () {
  return {
    restrict: 'E',
    templateUrl: 'request.html',
    scope: {
      request: '=',
      onSelect: '&'
    },
    controllerAs: 'leoRequest',
    bindToController: true,
    controller: LeoRequest
  };
});

function LeoRequest() {
  this.select = function () {
    this.onSelect();
  }
}
(function(module) {
try {
  module = angular.module('leonardo.templates');
} catch (e) {
  module = angular.module('leonardo.templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('request.html',
    '<a href="#" class="leo-list-item" ng-click="leoRequest.select()" ng-class="{active: leoRequest.request.active}"><span class="leo-request-verb {{leoRequest.request.verb.toLowerCase()}}">{{leoRequest.request.verb}}</span> <span class="leo-request-name">{{leoRequest.request.url}}</span> <span ng-if="!!leoRequest.request.state" class="leo-request leo-request-existing">{{leoRequest.request.state.name}}</span> <span ng-if="!leoRequest.request.state" class="leo-request leo-request-new">new</span> <span ng-if="!!leoRequest.request.state && leoRequest.request.state.active" class="leo-request leo-request-mocked">mocked</span></a>');
}]);
})();

(function(module) {
try {
  module = angular.module('leonardo.templates');
} catch (e) {
  module = angular.module('leonardo.templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('window-body.html',
    '<div class="leonardo-window-body"><div ng-switch="leonardo.activeTab" class="leonardo-window-options"><div ng-switch-when="configure" class="leonardo-configure"><table><thead><tr><th>State</th><th>URL</th><th>Options</th></tr></thead><tbody><tr ng-repeat="state in leoWindowBody.states"><td>{{state.name}}</td><td>{{state.url}}</td><td><ul><li ng-repeat="option in state.options">Name: {{option.name}}<br>Status: {{option.status}}<br>Data: {{option.data}}<br></li></ul></td></tr></tbody></table></div><div ng-switch-when="recorder" class="leonardo-recorder"><div class="leo-list"><div class="list-group"><leo-request ng-repeat="request in leoWindowBody.requests" request="request" on-select="leoWindowBody.requestSelect(request)"></leo-request></div></div><div class="leo-detail"><div class="leo-detail-header"><div ng-if="!leoWindowBody.detail.stateActive"><span>Add new state:</span> <input class="leo-detail-state" ng-model="leoWindowBody.detail.state" placeholder="Enter state name"></div><div ng-if="leoWindowBody.detail.stateActive" class="leo-detail-state">Add mocked response for "{{leoWindowBody.detail.state}}"</div></div><div class="leo-detail-option"><div>Response name: <input ng-model="leoWindowBody.detail.option"></div><div>Status code: <input ng-model="leoWindowBody.detail.status"></div><div>Delay: <input ng-model="leoWindowBody.detail.delay"></div><div class="leo-detail-option-json">Response JSON:<div class="leo-error">{{leoWindowBody.detail.error}}</div><textarea ng-model="leoWindowBody.detail.stringValue"></textarea></div></div><div class="leo-action-row"><button ng-click="leoWindowBody.saveUnregisteredState()">{{ leoWindowBody.detail.stateActive ? \'Add Option\' : \'Add State\' }}</button></div></div></div><div ng-switch-when="export" class="leonardo-export" style="padding: 30px"><code contenteditable="" ng-init="leoWindowBody.getStatesForExport()">\n' +
    '\n' +
    '        <div>angular.module(\'leonardo\').run([\'leoConfiguration\', function(leoConfiguration) {</div>\n' +
    '\n' +
    '        <div ng-repeat="state in leoWindowBody.exportStates">\n' +
    '          <div style="margin-left: 10px">leoConfiguration.addStates([</div>\n' +
    '          <pre style="margin-left: 20px">{{state | json}}</pre>\n' +
    '          <div style="margin-left: 10px">])</div>\n' +
    '        </div>\n' +
    '\n' +
    '        <div>}])</div>\n' +
    '\n' +
    '      </code></div><div ng-switch-when="scenarios" class="leonardo-activate"><div class="leonardo-menu"><div>SCENARIOS</div><ul><li ng-class="{ \'selected\': scenario === leoWindowBody.activeScenario }" ng-repeat="scenario in leoWindowBody.scenarios" ng-click="leoWindowBody.activateScenario(scenario)">{{scenario}}</li></ul></div><ul><li class="leo-non-ajax"><h3>Non Ajax States</h3></li><li ng-repeat="state in leoWindowBody.states | filter:leoWindowBody.notHasUrl track by $index"><div><div class="onoffswitch"><input ng-model="state.active" ng-click="leoWindowBody.updateState(state)" class="onoffswitch-checkbox" id="{{state.name}}" type="checkbox" name="{{state.name}}" value="{{state.name}}"> <label class="onoffswitch-label" for="{{state.name}}"><span class="onoffswitch-inner"></span> <span class="onoffswitch-switch"></span></label></div></div><div><h4>{{state.name}}</h4></div><div><select ng-disabled="!state.active" ng-model="state.activeOption" ng-options="option.name for option in state.options" ng-change="leoWindowBody.updateState(state)"></select></div></li><li><h3>Ajax States</h3></li><li ng-repeat="state in leoWindowBody.states | filter:leoWindowBody.hasUrl track by $index" ng-class="{ \'leo-highlight\': state.highlight }"><div><div class="onoffswitch"><input ng-model="state.active" ng-click="leoWindowBody.updateState(state)" class="onoffswitch-checkbox" id="{{state.name}}" type="checkbox" name="{{state.name}}" value="{{state.name}}"> <label class="onoffswitch-label" for="{{state.name}}"><span class="onoffswitch-inner"></span> <span class="onoffswitch-switch"></span></label></div></div><div><h4>{{state.name}}</h4>&nbsp;&nbsp; - {{state.url}}</div><div><select ng-disabled="!state.active" ng-model="state.activeOption" ng-options="option.name for option in state.options" ng-change="leoWindowBody.updateState(state)"></select></div></li></ul></div><div ng-switch-when="test" class="leonardo-test"><div><label for="url"></label>URL: <input id="url" type="text" ng-model="leoWindowBody.test.url"> <input type="button" ng-click="leoWindowBody.submit(test.url)" value="submit"></div><textarea>{{leoWindowBody.test.value | json}}</textarea></div></div></div>');
}]);
})();

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
              data: leoWindowBody.detail.value
            }
          ]
        });

        leoActivator.selectTab('scenarios');
      };

      scope.test = {
        url: '',
        value: undefined
      };

      scope.submit = function (url) {
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

  this.NothasUrl = function (option) {
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

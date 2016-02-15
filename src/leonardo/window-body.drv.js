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

      leoWindowBody.hasActiveOption = function(){
        return this.requests.filter(function (request) {
          return !!request.active;
        }).length;
      };

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

angular.module('leonardo').directive('leoJsonFormatter', function JsonFormatter() {
  return {
    restrict: 'E',
    scope: {
      jsonString: '=',
      onError: '&',
      onSuccess: '&'
    },
    controller: function ($scope) {
      this.valueChanged = function () {
        try {
          JSON.parse(this.jsonString);
          this.onSuccess({value: this.jsonString});
        }
        catch (e) {
          this.onError({msg: e.message});
        }
      };

      $scope.$watch('jsonString', function () {
        this.valueChanged();
      }.bind(this));
    },
    bindToController: true,
    controllerAs: 'leoJsonFormatterCtrl',
    template: '<textarea ng-model="leoJsonFormatterCtrl.jsonString" ng-change="leoJsonFormatterCtrl.valueChanged()" />'
  }
});

LeoWindowBody.$inject = ['$scope', 'leoConfiguration', '$timeout'];
function LeoWindowBody($scope, leoConfiguration, $timeout) {
  this.editedState = null;

  function removeStateByName(name) {
    var index = 0;
    this.states.forEach(function(state, i){
      if (state.name === name){
        index = i;
      }
    });

    this.states.splice(index, 1);
  }


  function removeOptionByName(stateName, optionName) {
    var sIndex = 0;
    var oIndex = 0;

    this.states.forEach(function(state, i){
      if (state.name === stateName){
        sIndex = i;
      }
    });

    this.states[sIndex].options.forEach(function(option, i){
      if (option.name === optionName){
        oIndex = i;
      }
    });

    this.states[sIndex].options.splice(oIndex, 1);
  }

  this.detail = {
    option: 'success',
    delay: 0,
    status: 200
  };

  this.removeState = function(state){
    leoConfiguration.removeState(state);
    removeStateByName.call(this, state.name);
  };

  this.removeOption = function(state, option){
    if (state.options.length === 1) {
      this.removeState(state);
    } else {
      leoConfiguration.removeOption(state, option);
      removeOptionByName.call(this, state.name, option.name);
      state.activeOption = state.options[0];
    }
  };

  this.editState = function(state){
    this.editedState = angular.copy(state);
    this.editedState.dataStringValue = JSON.stringify(this.editedState.activeOption.data);
  };

  this.onEditOptionSuccess = function (str) {
    this.editedState.activeOption.data = JSON.parse(str);
    this.editedState.error = '';
  };

  this.onEditOptionJsonError = function (msg) {
    this.editedState.error = msg;
  };

  this.saveEditedState = function() {
    leoConfiguration.addSavedState(this.editedState);
    this.editedState = null;
  }

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

  this.toggleState = function (state) {
    state.active = !state.active;
    this.updateState(state);
  }.bind(this);

  this.updateState = function (state) {
    if (state.active) {
      leoConfiguration.activateStateOption(state.name, state.activeOption.name);
    } else {
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
    var optionName;
    this.requests.forEach(function (request) {
      request.active = false;
    });

    request.active = true;

    if (request.state && request.state.name) {
      optionName = request.state.name + ' option ' + request.state.options.length;
    }

    angular.extend(this.detail, {
      state: (request.state && request.state.name) || '',
      option: optionName || '',
      delay: 0,
      status: request.status || 200,
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

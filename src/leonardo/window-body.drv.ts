windowBodyDirective.$inject = ['$http', 'leoConfiguration', '$timeout'];

export function windowBodyDirective($http, leoConfiguration, $timeout) {
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
}


class LeoWindowBody {
  editedState:any;
  states: any[];
  private detail: {
    option: string;
    delay: number;
    status: number;
    stringValue?: string;
    error?: string;
    value?: string;
    _unregisteredState?: any;
  };
  private scenarios;
  private selectedState;
  private activeScenario;
  private requests: any[];
  private exportStates;

  static $inject = ['$scope', 'leoConfiguration', '$timeout'];
  constructor(private $scope, private leoConfiguration, private $timeout) {
    this.detail = {
      option: 'success',
      delay: 0,
      status: 200
    };

    this.states = this.leoConfiguration.getStates();
    this.scenarios = this.leoConfiguration.getScenarios();
    this.requests = this.leoConfiguration.getRequestsLog();

    $scope.$watch('leoWindowBody.detail.value', (value) => {
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
    });

    $scope.$watch('leoWindowBody.detail.stringValue', (value) => {
      try {
        this.detail.value = value ? JSON.parse(value) : {};
        this.detail.error = '';
      }
      catch (e) {
        this.detail.error = e.message;
      }
    });

    $scope.$on('leonardo:stateChanged', (event, stateObj) => {
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
    });
  }

  removeStateByName (name) {
    this.states = this.states.filter(function(state) {
      return state.name !== name;
    });
  };


  removeOptionByName (stateName, optionName) {
    this.states.forEach(function(state, i){
      if (state.name === stateName){
        state.options = state.options.filter(function(option) {
          return option.name !== optionName;
        });
      }
    });
  };


  removeState (state){
    this.leoConfiguration.removeState(state);
    this.removeStateByName(state.name);
  };

  removeOption (state, option){
    if (state.options.length === 1) {
      this.removeState(state);
    } else {
      this.leoConfiguration.removeOption(state, option);
      this.removeOptionByName(state.name, option.name);
      state.activeOption = state.options[0];
    }
  };

  editState (state){
    this.editedState = angular.copy(state);
    this.editedState.dataStringValue = JSON.stringify(this.editedState.activeOption.data);
  };

  onEditOptionSuccess (str) {
    this.editedState.activeOption.data = JSON.parse(str);
    this.editedState.error = '';
  };

  onEditOptionJsonError (msg) {
    this.editedState.error = msg;
  };

  saveEditedState () {
    this.leoConfiguration.addOrUpdateSavedState(this.editedState);
    this.closeEditedState();
  };

  closeEditedState () {
    this.editedState = null;
  };

  notHasUrl (option) {
    return !option.url;
  };

  hasUrl (option) {
    return !!option.url;
  };

  deactivate () {
    this.states.forEach(function (state) {
      state.active = false;
    });
    this.leoConfiguration.deactivateAllStates();
  };

  toggleState (state) {
    state.active = !state.active;
    this.updateState(state);
  }


  updateState (state) {
    if (state.active) {
      this.leoConfiguration.activateStateOption(state.name, state.activeOption.name);
    } else {
      this.leoConfiguration.deactivateState(state.name);
    }

    if (this.selectedState === state) {
      this.editState(state);
    }

  };

  activateScenario (scenario) {
    this.activeScenario = scenario;
    this.leoConfiguration.setActiveScenario(scenario);
    this.states = this.leoConfiguration.getStates();
  }




  stateItemSelected (state) {
    if (state === this.selectedState) {
      this.editedState = this.selectedState = null;
    } else {
      this.selectedState = state;
      this.editState(state);
    }
  }

  requestSelect (request) {
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
  }

  getStatesForExport () {
    this.exportStates = this.leoConfiguration.getStates();
  }
}

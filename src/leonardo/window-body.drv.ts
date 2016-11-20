/// <reference path="leonardo.d.ts" />

windowBodyDirective.$inject = ['$http'];

export function windowBodyDirective($http) {
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

      leoWindowBody.hasActiveOption = function () {
        return this.requests.filter(function (request) {
          return !!request.active;
        }).length;
      };

      leoWindowBody.saveUnregisteredState = function () {
        var stateName = this.detail.state;

        Leonardo.addSavedState({
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

        leoWindowBody.refreshStates();
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
  editedState: any;
  states: any[];
  activateBtnText: string;
  isAllActivated: boolean;
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
  private codeWrapper;
  private showAddState: boolean = false;
  private newScenarioName: string = '';

  static $inject = ['$scope', '$timeout'];

  constructor(private $scope, private $timeout) {
    this.activateBtnText = 'Activate All';
    this.detail = {
      option: 'success',
      delay: 0,
      status: 200
    };

    this.states = Leonardo.getStates();
    this.scenarios = Leonardo.getScenariosTypes();
    this.requests = Leonardo.getRequestsLog();

    this.isAllActivated = this.states.every(s => s.active);
    this.activateBtnText = this.isAllActivated ? 'Deactivate All' : 'Activate All';

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
      this.states = Leonardo.getStates();

      var state: any = this.states.filter(function (state) {
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

  refreshStates() {
    this.states = Leonardo.getStates();
  }

  removeStateByName(name) {
    this.states = this.states.filter(function (state) {
      return state.name !== name;
    });
  };

  toggleActivate() {
    this.isAllActivated = !this.isAllActivated;
    this.states = Leonardo.toggleActivateAll(this.isAllActivated);
    this.activateBtnText = this.isAllActivated ? 'Deactivate All' : 'Activate All';
  }

  removeOptionByName(stateName, optionName) {
    this.states.forEach(function (state: any, i) {
      if (state.name === stateName) {
        state.options = state.options.filter(function (option) {
          return option.name !== optionName;
        });
      }
    });
  };

  removeState(state) {
    Leonardo.removeState(state);
    this.removeStateByName(state.name);
  };

  removeOption(state, option) {
    if (state.options.length === 1) {
      this.removeState(state);
    } else {
      Leonardo.removeOption(state, option);
      this.removeOptionByName(state.name, option.name);
      state.activeOption = state.options[0];
    }
  };

  editState(state) {
    this.editedState = angular.copy(state);
    this.editedState.dataStringValue = JSON.stringify(this.editedState.activeOption.data);
  };

  onEditOptionSuccess(str) {
    this.editedState.activeOption.data = JSON.parse(str);
    this.editedState.error = '';
  };

  onEditOptionJsonError(msg) {
    this.editedState.error = msg;
  };

  saveEditedState() {
    Leonardo.addOrUpdateSavedState(this.editedState);
    this.closeEditedState();
  };

  closeEditedState() {
    this.editedState = null;
  };

  notHasUrl(option) {
    return !option.url;
  };

  hasUrl(option) {
    return !!option.url;
  };

  deactivate() {
    this.states.forEach(function (state: any) {
      state.active = false;
    });
    Leonardo.toggleActivateAll(false);
  };

  toggleState(state) {
    state.active = !state.active;
    this.updateState(state);
  }

  updateState(state) {
    if (state.active) {
      Leonardo.activateStateOption(state.name, state.activeOption.name);
    } else {
      Leonardo.deactivateState(state.name);
    }

    if (this.selectedState === state) {
      this.editState(state);
    }
  }

  activateScenario(scenario) {
    this.activeScenario = scenario;
    this.states = Leonardo.setActiveScenario(scenario);
  }

  removeScenario(name) {
    Leonardo.removeScenario(name);
    this.scenarios = Leonardo.getScenariosTypes();
    this.states = Leonardo.getStates();
  }

  saveNewScenario() {
    if (this.newScenarioName.length < 1) {
      return;
    }

    const states = this.states
      .filter((state) => state.active)
      .map((state: any) => {
        return {
          name: state.name,
          option: state.activeOption.name
        }
      });

    Leonardo.addScenario({
      name: this.newScenarioName,
      states: states,
      from_local: true
    }, true);

    this.scenarios = Leonardo.getScenariosTypes();

    this.closeNewScenarioForm();
  }

  closeNewScenarioForm() {
    this.showAddState = false;
    this.newScenarioName = '';
  }

  stateItemSelected(state) {
    if (state === this.selectedState) {
      this.editedState = this.selectedState = null;
    } else {
      this.selectedState = state;
      this.editState(state);
    }
  }

  requestSelect(request: any) {
    var optionName;
    this.requests.forEach(function (request: any) {
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

  getStatesForExport() {
    this.exportStates = Leonardo.getStates().map((state) => {
      let {name, url, verb, options} = state;
      return {name, url, verb, options};
    });
  }

  downloadCode() {
    this.codeWrapper = document.getElementById('exportedCode');
    let codeToStr;
    if (this.codeWrapper.innerText) {
      codeToStr = this.codeWrapper.innerText;
    }
    else if (XMLSerializer) {
      codeToStr = new XMLSerializer().serializeToString(this.codeWrapper);
    }
    window.open('data:application/octet-stream;filename=Leonardo-States.txt,' + encodeURIComponent(codeToStr), 'Leonardo-States.txt');
  }

}

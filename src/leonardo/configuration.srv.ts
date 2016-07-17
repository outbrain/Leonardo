import IRootScopeService = angular.IRootScopeService;

leoConfiguration.$inject = ['leoStorage', '$rootScope'];

export function leoConfiguration (leoStorage, $rootScope: any) {
  var _states = [],
    _scenarios = {},
    _requestsLog = [],
    _savedStates = [];

  // Core API
  // ----------------
  return {
    addState: addState,
    addStates: addStates,
    getActiveStateOption: getActiveStateOption,
    getStates: fetchStates,
    deactivateState: deactivateState,
    toggleActivateAll: toggleActivateAll,
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
    addOrUpdateSavedState: addOrUpdateSavedState,
    fetchStatesByUrlAndMethod: fetchStatesByUrlAndMethod,
    removeState: removeState,
    removeOption: removeOption,
    _logRequest: logRequest
  };

  function upsertOption(state, name, active) {
    var statesStatus = leoStorage.getStates();
    statesStatus[state] = {
      name: name || findStateOption(state).name,
      active: active
    };

    leoStorage.setStates(statesStatus);
  }

  function fetchStatesByUrlAndMethod(url, method) {
    return fetchStates().filter(function (state) {
      return state.url && new RegExp(state.url).test(url) && state.verb.toLowerCase() === method.toLowerCase();
    })[0];
  }

  function fetchStates() {
    var activeStates = leoStorage.getStates();
    var statesCopy = _states.map(function (state) {
      return angular.copy(state);
    });

    statesCopy.forEach(function (state:any) {
      var option = activeStates[state.name];
      state.active = !!option && option.active;
      state.activeOption = !!option ?
        state.options.filter(function (_option) {
          return _option.name === option.name;
        })[0] : state.options[0];
    });

    return statesCopy;
  }

  function toggleActivateAll(flag: boolean) {
    var statesStatus = leoStorage.getStates();
    Object.keys(statesStatus).forEach(function (stateKey) {
      statesStatus[stateKey].active = flag;
    });
    leoStorage.setStates(statesStatus);
  }

  function findStateOption(name) {
    return fetchStates().filter(function (state) {
      return state.name === name;
    })[0].activeOption;
  }

  function getActiveStateOption(name) {
    var state = fetchStates().filter(function (state) {
      return state.name === name
    })[0];
    return (state && state.active && findStateOption(name)) || null;
  }

  function addState(stateObj, overrideOption) {

    stateObj.options.forEach(function (option) {
      upsert({
        state: stateObj.name,
        url: stateObj.url,
        verb: stateObj.verb,
        name: option.name,
        from_local: !!overrideOption,
        status: option.status,
        data: option.data,
        delay: option.delay
      }, overrideOption);
    });

    $rootScope.$broadcast('leonardo:stateChanged', stateObj);
  }

  function addStates(statesArr, overrideOption = false) {
    if (angular.isArray(statesArr)) {
      statesArr.forEach(function (stateObj) {
        addState(stateObj, overrideOption);
      });
    } else {
      console.warn('leonardo: addStates should get an array');
    }
  }

  function upsert(configObj, overrideOption) {
    var verb = configObj.verb || 'GET',
      state = configObj.state,
      name = configObj.name,
      from_local = configObj.from_local,
      url = configObj.url,
      status = configObj.status || 200,
      data = angular.isDefined(configObj.data) ? configObj.data : {},
      delay = configObj.delay || 0;
    var defaultState = {};

    var defaultOption = {};

    if (!state) {
      console.log("leonardo: cannot upsert - state is mandatory");
      return;
    }

    var stateItem = _states.filter(function (_state) {
        return _state.name === state;
      })[0] || defaultState;

    angular.extend(stateItem, {
      name: state,
      url: url || stateItem.url,
      verb: verb,
      options: stateItem.options || []
    });


    if (stateItem === defaultState) {
      _states.push(stateItem);
    }

    var option = stateItem.options.filter(function (_option) {
        return _option.name === name
      })[0];

    if (overrideOption && option) {
      angular.extend(option, {
        name: name,
        from_local: from_local,
        status: status,
        data: data,
        delay: delay
      });
    }
    else if (!option) {
      angular.extend(defaultOption, {
        name: name,
        from_local: from_local,
        status: status,
        data: data,
        delay: delay
      });

      stateItem.options.push(defaultOption);
    }
  }

  function addScenario(scenario) {
    if (scenario && typeof scenario.name === 'string') {
      _scenarios[scenario.name] = scenario;
    } else {
      throw 'addScenario method expects a scenario object with name property';
    }
  }

  function addScenarios(scenarios) {
    angular.forEach(scenarios, addScenario);
  }

  function getScenarios() {
    return Object.keys(_scenarios);
  }

  function getScenario(name) {
    if (!_scenarios[name]) {
      return;
    }
    return _scenarios[name].states;
  }

  function setActiveScenario(name) {
    var scenario = getScenario(name);
    if (!scenario) {
      console.warn("leonardo: could not find scenario named " + name);
      return;
    }
    toggleActivateAll(false);
    scenario.forEach(function (state) {
      upsertOption(state.name, state.option, true);
    });
  }

  function activateStateOption(state, optionName) {
    upsertOption(state, optionName, true);
  }

  function deactivateState(state) {
    upsertOption(state, null, false);
  }

  interface INetworkRequest {
    verb: Function;
    data: any;
    url?: string;
    status: string;
    timestamp: Date;
    state?: string;
  }

  function logRequest(method, url, data, status) {
    if (method && url && !(url.indexOf(".html") > 0)) {
      var req: INetworkRequest = {
        verb: method,
        data: data,
        url: url.trim(),
        status: status,
        timestamp: new Date()
      };
      req.state = fetchStatesByUrlAndMethod(req.url, req.verb);
      _requestsLog.push(req);
    }
  }

  function getRequestsLog() {
    return _requestsLog;
  }

  function loadSavedStates() {
    _savedStates = leoStorage.getSavedStates();
    addStates(_savedStates, true);
  }

  function addSavedState(state) {
    _savedStates.push(state);
    leoStorage.setSavedStates(_savedStates);
    addState(state, true);
  }

  function addOrUpdateSavedState(state) {
    var option = state.activeOption;

    //update local storage state
    var _savedState = _savedStates.filter(function(_state) {
      return _state.name === state.name;
    })[0];

    if (_savedState) {
      var _savedOption = _savedState.options.filter(function(_option) {
        return _option.name === option.name;
      })[0];

      if (_savedOption) {
        _savedOption.status = option.status;
        _savedOption.delay = option.delay;
        _savedOption.data = option.data;
      }
      else {
        _savedState.options.push(option);
      }

      leoStorage.setSavedStates(_savedStates);
    }
    else {
      addSavedState(state);
    }

    //update in memory state
    var _state = _states.filter(function(__state) {
      return __state.name === state.name;
    })[0];

    if (_state) {
      var _option = _state.options.filter(function(__option) {
        return __option.name === option.name;
      })[0];

      if (_option) {
        _option.status = option.status;
        _option.delay = option.delay;
        _option.data = option.data;
      }
      else {
        _state.options.push(option);
      }

      $rootScope.$broadcast('leonardo:stateChanged', _state);
    }
  }

  function removeStateByName(name) {
    var index = 0;
    _states.forEach(function (state, i) {
      if (state.name === name) {
        index = i;
      }
    });

    _states.splice(index, 1);
  }

  function removeSavedStateByName(name) {
    var index = 0;
    _savedStates.forEach(function (state, i) {
      if (state.name === name) {
        index = i;
      }
    });

    _savedStates.splice(index, 1);
  }

  function removeState(state) {

    removeStateByName(state.name);
    removeSavedStateByName(state.name);

    leoStorage.setSavedStates(_savedStates);
  }

  function removeStateOptionByName(stateName, optionName) {
    var sIndex = null;
    var oIndex = null;

    _states.forEach(function (state, i) {
      if (state.name === stateName) {
        sIndex = i;
      }
    });

    if (sIndex !== null) {
      _states[sIndex].options.forEach(function (option, i) {
        if (option.name === optionName) {
          oIndex = i;
        }
      });

      if (oIndex !== null) {
        _states[sIndex].options.splice(oIndex, 1);
      }
    }
  }

  function removeSavedStateOptionByName(stateName, optionName) {
    var sIndex = null;
    var oIndex = null;

    _savedStates.forEach(function (state, i) {
      if (state.name === stateName) {
        sIndex = i;
      }
    });

    if (sIndex !== null) {
      _savedStates[sIndex].options.forEach(function (option, i) {
        if (option.name === optionName) {
          oIndex = i;
        }
      });

      if (oIndex !== null) {
        _savedStates[sIndex].options.splice(oIndex, 1);
      }
    }
  }

  function removeOption(state, option) {
    removeStateOptionByName(state.name, option.name);
    removeSavedStateOptionByName(state.name, option.name);

    leoStorage.setSavedStates(_savedStates);

    activateStateOption(_states[0].name, _states[0].options[0].name);
  }

  function getRecordedStates() {
    var requestsArr = _requestsLog
      .map(function (req) {
        var state = fetchStatesByUrlAndMethod(req.url, req.verb);
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
}

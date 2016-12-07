/// <reference path="leonardo.d.ts" />
declare var Object: any;
export function leoConfiguration () {
  var _states = [],
    _scenarios = {},
    _requestsLog = [],
    _savedStates = [],
    _statesChangedEvent = new CustomEvent('leonardo:setStates'),
    _eventsElem = document.body;
  
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
    onStateChange: onSetStates,
    statesChanged: statesChanged,
    _logRequest: logRequest
  };

  function upsertOption(state, name, active) {
    var statesStatus = Leonardo.storage.getStates();
    statesStatus[state] = {
      name: name || findStateOption(state).name,
      active: active
    };

    Leonardo.storage.setStates(statesStatus);
  }

  function fetchStatesByUrlAndMethod(url, method) {
    return fetchStates().filter(function (state) {
      return state.url && new RegExp(state.url).test(url) && state.verb.toLowerCase() === method.toLowerCase();
    })[0];
  }

  function fetchStates() {
    var activeStates = Leonardo.storage.getStates();
    var statesCopy = _states.map(function (state) {
      return Object.assign({}, state);
    });

    statesCopy.forEach(function (state: any) {
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
    let statesStatus = fetchStates();
    const statuses = statesStatus.reduce((obj, s) => {
        var optionName = s.activeOption ? s.activeOption.name : s.options[0].name;
        obj[s.name] = {name: optionName, active: flag};
        return obj;
      }
    , {});
    Leonardo.storage.setStates(statuses);
    return statesStatus;
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

    //$rootScope.$broadcast('leonardo:stateChanged', stateObj);
  }

  function addStates(statesArr, overrideOption = false) {
    if (Array.isArray(statesArr)) {
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
      data = (typeof configObj.data !== 'undefined') ? configObj.data : {},
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

    Object.assign(stateItem, {
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
      Object.assign(option, {
        name: name,
        from_local: from_local,
        status: status,
        data: data,
        delay: delay
      });
    }
    else if (!option) {
      Object.assign(defaultOption, {
        name: name,
        from_local: from_local,
        status: status,
        data: data,
        delay: delay
      });

      stateItem.options.push(defaultOption);
    }
  }

  function addScenario(scenario, fromLocal: boolean = false) {
    if (scenario && typeof scenario.name === 'string') {
      if (fromLocal) {
        const scenarios = Leonardo.storage.getScenarios();
        scenarios.push(scenario);
        Leonardo.storage.setScenarios(scenarios);
      } else {
        _scenarios[scenario.name] = scenario;
      }
    } else {
      throw 'addScenario method expects a scenario object with name property';
    }
  }

  function addScenarios(scenarios) {
    scenarios.forEach((scenario) => {
      addScenario(scenario);
    });
  }

  function getScenarios() {
    const scenarios = Leonardo.storage.getScenarios().map((scenario: any) => scenario.name);
    return Object.keys(_scenarios).concat(scenarios);
  }

  function getScenario(name: string) {
    let states;
    if (_scenarios[name]) {
      states = _scenarios[name].states;
    } else {
      states = Leonardo.storage.getScenarios()
        .filter((scenario) => scenario.name === name)[0].states;
    }

    return states;
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
    _savedStates = Leonardo.storage.getSavedStates();
    addStates(_savedStates, true);
  }

  function addSavedState(state) {
    _savedStates.push(state);
    Leonardo.storage.setSavedStates(_savedStates);
    addState(state, true);
  }

  function addOrUpdateSavedState(state) {
    var option = state.activeOption;

    //update local storage state
    var _savedState = _savedStates.filter(function (_state) {
      return _state.name === state.name;
    })[0];

    if (_savedState) {
      var _savedOption = _savedState.options.filter(function (_option) {
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

      Leonardo.storage.setSavedStates(_savedStates);
    }
    else {
      addSavedState(state);
    }

    //update in memory state
    var _state = _states.filter(function (__state) {
      return __state.name === state.name;
    })[0];

    if (_state) {
      var _option = _state.options.filter(function (__option) {
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

      //$rootScope.$broadcast('leonardo:stateChanged', _state);
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

    Leonardo.storage.setSavedStates(_savedStates);
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

    Leonardo.storage.setSavedStates(_savedStates);

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
          recorded: !!req.state,
          options: [{
            name: req.status >= 200 && req.status < 300 ? 'Success' : 'Failure',
            status: req.status,
            data: req.data
          }]
        }
      });
    return requestsArr;
  }

  function onSetStates(fn) {
    _eventsElem && _eventsElem.addEventListener('leonardo:setStates', fn , false);
  }

  function statesChanged() {
    _eventsElem && _eventsElem.dispatchEvent(_statesChangedEvent);
  }
}

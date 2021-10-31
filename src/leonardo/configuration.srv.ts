/// <reference path="leonardo.d.ts" />
declare let Object: any;
export function leoConfiguration() {
  let _states = [],
    _scenarios = {},
    _requestsLog = [],
    _savedStates = [],
    _statesChangedEvent = new CustomEvent('leonardo:setStates'),
    _eventsElem = document.body,
    _jsonpCallbacks = {},
    _consoleOutputEnabled = null;

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
    clearRequestsLog: clearRequestsLog,
    loadSavedStates: loadSavedStates,
    addSavedState: addSavedState,
    addOrUpdateSavedState: addOrUpdateSavedState,
    fetchStatesByUrlAndMethod: fetchStatesByUrlAndMethod,
    removeState: removeState,
    removeOption: removeOption,
    onStateChange: onSetStates,
    statesChanged: statesChanged,
    toggleConsoleOutput: toggleConsoleOutput,
    _logRequest: logRequest,
    getLastRequestByState: getLastRequestByState,
    _jsonpCallbacks: _jsonpCallbacks
  };

  function upsertOption(state, name, active) {
    let statesStatus = Leonardo.storage.getStates();
    statesStatus[state] = {
      name: name || findStateOption(state).name,
      active: active
    };

    Leonardo.storage.setStates(statesStatus);
    setupJsonpForState(state);
  }

  function setupJsonpForState(stateName) {
    const state = fetchState(stateName);
    if (state && state.verb === 'JSONP') {
      const callbackName = getCallbackName(state);
      state.active ? activeJsonpState(state, callbackName) : deactivateJsonpState(state, callbackName);
    }
  }

  function activeJsonpState(state, callbackName: string) {
    const funcName = state.name + callbackName;
    if (_jsonpCallbacks[funcName]) return;

    const evaluatedFunction = eval(callbackName);
    if (typeof evaluatedFunction === 'function') {
      _jsonpCallbacks[funcName] = evaluatedFunction;
      if (callbackName.lastIndexOf('.') > -1) {
        const callbackWrapperObj = eval(getAndSpliceStr(callbackName));
        callbackWrapperObj[extractCallbackSuffix(callbackName)] = dummyJsonpCallback;
      }
      else {
        window[callbackName] = dummyJsonpCallback;
      }
    }

    activateJsonpMObserver();
  }

  function getAndSpliceStr(str: string) : string {
    const lastIndex = str.lastIndexOf('.');
    const cutString = str.substring(0,lastIndex);
    return 'window.' + cutString;
  }

  function extractCallbackSuffix(str: string): string {
    const lastIndex = str.lastIndexOf('.');
    return str.substring(lastIndex+1, str.length)
  }

  function activateJsonpMObserver() {
    if (Leonardo._jsonpMutationObservers) {
      if (!fetchStates().some(state => state.verb === 'JSONP' && state.active)) {
        Leonardo._jsonpMutationObservers.forEach(mutationObserver => mutationObserver && mutationObserver.disconnect());
        delete Leonardo._jsonpCallbacks;
        delete Leonardo._jsonpMutationObservers;
      }
      return;
    }
    const targets = [document.body, document.head].filter(target => !!target);
    const config = {attributes: false, childList: true, characterData: false, subtree: false};

    Leonardo._jsonpMutationObservers = targets.map((target) => {
      return new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation: any) {
          if (mutation.addedNodes &&
            mutation.addedNodes[0] &&
            mutation.addedNodes[0].tagName &&
            mutation.addedNodes[0].tagName.toLowerCase() === 'script') {
            const scriptNode = mutation.addedNodes[0];
            if (scriptNode.src && scriptNode.src.indexOf('callback') > 0) {
              logRequest('JSONP', scriptNode.src, 200);
            }
            const state = fetchStatesByUrlAndMethod(scriptNode.src, 'JSONP');
            if (state && state.active) {
              const callbackName = getCallbackName(state);
              const funcName = state.name + callbackName;
              if (!_jsonpCallbacks[funcName]) {
                activeJsonpState(state, callbackName);
              }
              if ((typeof(state.jsonCallbackAdditionalParams) === 'function') && (typeof(state.activeOption.data) === 'function')) {
                setTimeout(_jsonpCallbacks[funcName].bind(null, state.activeOption.data(scriptNode.src), ...state.jsonCallbackAdditionalParams(scriptNode.src)), state.activeOption.delay || 0);
              }
              else {
                setTimeout(_jsonpCallbacks[funcName].bind(null, state.activeOption.data, ...state.jsonCallbackAdditionalParams), state.activeOption.delay || 0);
              }
            }
          }
        });
      });
    });
    targets.forEach((target, index) => Leonardo._jsonpMutationObservers[index].observe(target, config));
  }

  function dummyJsonpCallback() {
  }

  function deactivateJsonpState(state, callbackName) {
    const funcName = state.name + callbackName;
    if (_jsonpCallbacks[funcName]) {
      if (callbackName.lastIndexOf('.') > -1) {
        const callbackWrapperObj = eval(getAndSpliceStr(callbackName));
        callbackWrapperObj[extractCallbackSuffix(callbackName)] = _jsonpCallbacks[funcName];
      }
      else {
        window[callbackName] = _jsonpCallbacks[funcName];
      }
      delete _jsonpCallbacks[funcName];
    }
    activateJsonpMObserver();
  }

  function getCallbackName(state) {
    if (state.jsonpCallback) {
      return state.jsonpCallback;
    }

    if (state.url.indexOf('callback=') > 1) {
      const postfix = state.url.split('callback=')[1];
      return postfix.split('&')[0];
    }
  }

  function fetchStatesByUrlAndMethod(url, method) {
    return fetchStates().filter((state) => {
      return state.url &&
        isMatchUrl(state.url, url) &&
        state.verb.toLowerCase() === method.toLowerCase();
    })[0];
  }

  function isMatchUrl(stateUrlPattern, url) {
    const urlRegexp = new RegExp(stateUrlPattern);
    const decodedUrl = decodeURIComponent(url);
    return urlRegexp.test(url) ||
      urlRegexp.test(decodedUrl) ||
      stateUrlPattern === url ||
      stateUrlPattern === decodedUrl;
  }

  function fetchStates() {
    const activeStates = Leonardo.storage.getStates();
    let statesCopy = _states.map(function (state) {
      return Object.assign({}, state);
    });

    statesCopy.forEach(function (state: any) {
      let option = activeStates[state.name];
      state.active = !!option && option.active;
      state.activeOption = !!option ?
        state.options.filter(function (_option) {
          return _option.name === option.name;
        })[0]
        :
        state.options[0];

      if (typeof state.activeOption === 'undefined') {
        console.warn('state with state name:', state.name, 'does not have active option:', option.name);
      }
    });

    return statesCopy;
  }

  function fetchState(name: string) {
    return fetchStates().filter(function (state) {
      return state.name === name;
    })[0];
  }

  function toggleActivateAll(flag: boolean) {
    let statesStatus = fetchStates();
    const statuses = statesStatus.reduce((obj, s) => {
        let optionName = s.activeOption ? s.activeOption.name : s.options[0].name;
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
    let state = fetchStates().filter(function (state) {
      return state.name === name
    })[0];
    return (state && state.active && findStateOption(name)) || null;
  }

  function addState(stateObj, overrideOption) {
    stateObj.options.forEach(function (option) {
      upsert({
        state: stateObj.name,
        url: stateObj.url,
        jsonCallbackAdditionalParams: stateObj.jsonCallbackAdditionalParams,
        jsonpCallback: stateObj.jsonpCallback,
        verb: stateObj.verb,
        name: option.name,
        from_local: !!overrideOption,
        status: option.status,
        data: option.data,
        headers: option.headers,
        delay: option.delay
      }, overrideOption);
    });
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
    let verb = configObj.verb || 'GET',
      state = configObj.state,
      name = configObj.name,
      jsonpCallback = configObj.jsonpCallback,
      jsonCallbackAdditionalParams = configObj.jsonCallbackAdditionalParams,
      from_local = configObj.from_local,
      url = configObj.url,
      status = configObj.status || 200,
      data = (typeof configObj.data !== 'undefined') ? configObj.data : {},
      headers = configObj.headers,
      delay = configObj.delay || 0;
    let defaultState = {};

    let defaultOption = {};

    if (!state) {
      console.log("leonardo: cannot upsert - state is mandatory");
      return;
    }

    let stateItem = _states.filter(function (_state) {
        return _state.name === state;
      })[0] || defaultState;

    Object.assign(stateItem, {
      name: state,
      url: url || stateItem.url,
      verb: verb,
      jsonpCallback: jsonpCallback,
      jsonCallbackAdditionalParams: jsonCallbackAdditionalParams,
      options: stateItem.options || []
    });


    if (stateItem === defaultState) {
      _states.push(stateItem);
    }

    let option = stateItem.options.filter(function (_option) {
      return _option.name === name
    })[0];

    if (overrideOption && option) {
      Object.assign(option, {
        name,
        from_local,
        status,
        data,
        headers,
        delay
      });
    }
    else if (!option) {
      Object.assign(defaultOption, {
        name,
        from_local,
        status,
        data,
        headers,
        delay
      });

      stateItem.options.push(defaultOption);
    }
    if (verb.toUpperCase() === 'JSONP') {
      setupJsonpForState(state);
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
    let scenario = getScenario(name);
    if (!scenario) {
      console.warn("leonardo: could not find scenario named " + name);
      return;
    }
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
    reqBody?: any;
    reqHeaders?: any;
    resHeaders?: any;
    timestamp: Date;
    state?: IState;
  }

  function logRequest(method, url, status, reqHeaders?, reqBody?, resHeaders?, resBody?) {
    if (method && url) {
      let req: INetworkRequest = {
        verb: method,
        url: url.trim(),
        status: status,
        reqHeaders: reqHeaders || {},
        reqBody: reqBody || {},
        resHeaders: resHeaders || {},
        data: resBody || {},
        timestamp: new Date()
      };
      req.state = fetchStatesByUrlAndMethod(req.url, req.verb);
      logRequestToConsole(req);
      _requestsLog.push(req);
    }
  }

  function clearRequestsLog() {
    _requestsLog = [];
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
    let option = state.activeOption;

    //update local storage state
    let _savedState = _savedStates.filter(function (_state) {
      return _state.name === state.name;
    })[0];

    if (_savedState) {
      let _savedOption = _savedState.options.filter(function (_option) {
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
    let _state = _states.filter(function (__state) {
      return __state.name === state.name;
    })[0];

    if (_state) {
      let _option = _state.options.filter(function (__option) {
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
    let index = 0;
    _states.forEach(function (state, i) {
      if (state.name === name) {
        index = i;
      }
    });

    _states.splice(index, 1);
  }

  function removeSavedStateByName(name) {
    let index = 0;
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
    let sIndex = null;
    let oIndex = null;

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
    let sIndex = null;
    let oIndex = null;

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
    let requestsArr = _requestsLog
      .map(function (req) {
        let state = fetchStatesByUrlAndMethod(req.url, req.verb);
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
    _eventsElem && _eventsElem.addEventListener('leonardo:setStates', fn, false);
  }

  function statesChanged() {
    _eventsElem && _eventsElem.dispatchEvent(_statesChangedEvent);
  }

  function toggleConsoleOutput() {
    _consoleOutputEnabled = !_consoleOutputEnabled;
    console.log(`%cLeonardo console is now ${_consoleOutputEnabled ? 'enabled' : 'disabled'}`, `color: ${_consoleOutputEnabled ? 'green' : 'gray' }; font-size:13px;`);
    Leonardo.storage.setConsoleOutput(_consoleOutputEnabled);
  }

  function logRequestToConsole(req: INetworkRequest) {
    if (_consoleOutputEnabled === null) {
      _consoleOutputEnabled = Leonardo.storage.getConsoleOutput();
    }
    if (_consoleOutputEnabled) {
      const mocked = req.state && req.state.active;
      if (mocked) {
        console.groupCollapsed(`Leonardo logger: ${req.verb} ${req.url}`);
        console.groupCollapsed(`Request`);
        console.log('verb: ', req.verb);
        console.log('url: ', req.url);
        console.log('headers: ', req.reqHeaders);
        console.log('body: ', req.reqBody);
        console.groupEnd();
        console.group(`Response`);
        console.log('status code: ', req.status);
        console.log('headers: ', req.resHeaders);
        console.log('body: ', req.data);
        console.groupEnd();
        console.groupEnd();
      }
    }
  }

  function getLastRequestByState(stateName: string) {
    return _requestsLog.filter(entry => {
      return entry.state && entry.state.name === stateName;
    }).reverse()[0];
  }
}

export interface IState {
  name: string;
  active?: boolean;
  activeOption?: any;
  jsonCallbackAdditionalParams?: string;
  jsonpCallback?: Function;
  options: any[];
  url: string;
  verb: 'GET' | 'POST' | 'PUT';
}

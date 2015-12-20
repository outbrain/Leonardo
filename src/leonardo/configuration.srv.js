angular.module('leonardo').factory('leoConfiguration',
    ['leoStorage', '$rootScope', function(leoStorage, $rootScope) {
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
        fetchStatesByUrlAndMethod: fetchStatesByUrlAndMethod,
        removeState: removeState,
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

      function fetchStatesByUrlAndMethod(url, method){
        return fetchStates().filter(function(state){
          return state.url && new RegExp(state.url).test(url) && state.verb.toLowerCase() === method.toLowerCase();
        })[0];
      }

      function fetchStates(){
        var activeStates = leoStorage.getStates();
        var statesCopy = _states.map(function(state) {
          return angular.copy(state);
        });

        statesCopy.forEach(function(state) {
          var option = activeStates[state.name];
          state.active = !!option && option.active;
          state.activeOption = !!option ?
              state.options.filter(function (_option) {
                return _option.name === option.name;
              })[0] : state.options[0];
        });

        return statesCopy;
      }

      function deactivateAll() {
        var statesStatus = leoStorage.getStates();
        Object.keys(statesStatus).forEach(function(stateKey) {
          statesStatus[stateKey].active = false;
        });
        leoStorage.setStates(statesStatus);
      }

      function findStateOption(name){
        return fetchStates().filter(function(state){ return state.name === name;})[0].activeOption;
      }

      function getActiveStateOption(name){
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

        var stateItem = _states.filter(function(_state) { return _state.name === state;})[0] || defaultState;

        angular.extend(stateItem, {
          name: state,
          url: url || stateItem.url,
          verb: verb,
          options: stateItem.options || []
        });


        if (stateItem === defaultState) {
          _states.push(stateItem);
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

      function logRequest(method, url, data, status) {
        if (method && url && !(url.indexOf(".html") > 0)) {
          var req = {
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
        addStates(_savedStates);
      }

      function addSavedState(state) {
        _savedStates.push(state);
        leoStorage.setSavedStates(_savedStates);
        addState(state);
      }

  function removeState(state) {
    if (angular.isArray(statesArr)) {
      statesArr.forEach(function(stateObj) {
        addState(stateObj);
      });
    } else {
      console.warn('leonardo: addStates should get an array');
    }
  }

      function getRecordedStates() {
        var requestsArr = _requestsLog
            .map(function(req){
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
    }]);

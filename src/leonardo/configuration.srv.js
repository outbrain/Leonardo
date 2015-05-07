function configurationService($q, activeStatesStore, $httpBackend) {
  var states = [];
  var responseHandlers = {};

  var upsertOption = function(state, name, active) {
    var _states = getStatesFromStore();
    _states[state] = {
      name: name,
      active: active
    };

    activeStatesStore.set('states', _states);

    sync();
  };

  function getStatesFromStore(){
    return activeStatesStore.get('states') || {};
  }

  function fetchStates(){
    var activeStates = getStatesFromStore();
    var _states = states.map(state => angular.copy(state));

    _states.forEach(function(state) {
      let option = activeStates[state.name];
      state.active = !!option && option.active;
      state.activeOption = !!option ? state.options.find(_option => _option.name === option.name) : state.options[0];
    });

    return _states;
  }

  function deactivateAll() {
    var _states = getStatesFromStore();
    Object.keys(_states).forEach(function(stateKey) {
      _states[stateKey].active = false;
    });
    activeStatesStore.set('states', _states);

    sync();
  }

  function findStateOption(name){
    return fetchStates().find(state => state.name === name).activeOption;
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
            return [option.status, option.data];
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
      var state = fetchStates().find(state => state.name === name);
      return (state && state.active && findStateOption(name)) || null;
    },
    addState: function(stateObj) {
      stateObj.options.forEach((option) => {
        this.upsert({
          state: stateObj.name,
          url: stateObj.url,
          verb: option.verb,
          name: option.name,
          status: option.status,
          data: option.data,
          delay: option.delay
        });
      });
    },
    addStates: function(statesArr) {
      statesArr.forEach((stateObj) => {
        this.addState(stateObj);
      });
    },
    //insert or replace an option by insert or updateing a state.
    upsert: function({ verb, state, name, url, status = 200, data = {}, delay = 0}){
      var defaultState = {};

      var defaultOption = {};

      if (!state) {
        console.log("cannot upsert - state is mandatory");
        return;
      }

      var stateItem = states.find(_state => _state.name === state) || defaultState;

      angular.extend(stateItem, {
        name: state,
        url: url || stateItem.url,
        verb: verb || stateItem.verb,
        options: stateItem.options || []
      });


      if (stateItem === defaultState) {
        states.push(stateItem);
      }

      var option = stateItem.options.find(_option => _option.name === name) || defaultOption;

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
      items.forEach(item => this.upsert(item));
    },
    deactivateAll: deactivateAll
  };
}

export default configurationService;
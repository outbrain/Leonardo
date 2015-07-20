angular.module('leonardo').factory('configuration', function(storage, $httpBackend) {
  var states = [];
  var responseHandlers = {};

  var upsertOption = function(state, name, active) {
    var _states = storage.getStates();
    _states[state] = {
      name: name,
      active: active
    };

    storage.setStates(_states);

    sync();
  };

  function fetchStates(){
    var activeStates = storage.getStates();
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
    var _states = storage.getStates();
    Object.keys(_states).forEach(function(stateKey) {
      _states[stateKey].active = false;
    });
    storage.setStates(_states);

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
      var state = fetchStates().filter(function(state) { return state.name === name})[0];
      return (state && state.active && findStateOption(name)) || null;
    },
    addState: function(stateObj) {
      stateObj.options.forEach(function (option) {
        this.upsert({
          state: stateObj.name,
          url: stateObj.url,
          verb: option.verb,
          name: option.name,
          status: option.status,
          data: option.data,
          delay: option.delay
        });
      }.bind(this));
    },
    addStates: function(statesArr) {
      statesArr.forEach(function(stateObj) {
        this.addState(stateObj);
      }.bind(this));
    },
    //insert or replace an option by insert or updateing a state.
    upsert: function(stateObj) {
      var verb = stateObj.verb,
          state = stateObj.state,
          name = stateObj.name,
          url = stateObj.url,
          status = stateObj.status || 200,
          data = stateObj.data || {},
          delay = stateObj.delay || 0;
      var defaultState = {};

      var defaultOption = {};

      if (!state) {
        console.log("cannot upsert - state is mandatory");
        return;
      }

      var stateItem = defaultState;
      states.filter(function(_state) { return _state.name === state;})[0] || defaultState;

      angular.extend(stateItem, {
        name: state,
        url: url || stateItem.url,
        verb: verb || stateItem.verb,
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
    },
    //todo doc
    upsertMany: function(items){
      items.forEach(function(item) {
        this.upsert(item);
      }.bind(this));
    },
    deactivateAll: deactivateAll
  };
});

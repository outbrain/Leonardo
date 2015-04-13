function configurationService($q, activeStatesStore, $httpBackend) {
  var states = [];
  var stateReq = {};

  var upsertOption = function(state, name, active) {
    var _states = getStatesFromStore();
    _states[state] = {
      name: name,
      active: active
    };

    activeStatesStore.set('states', _states);

    return sync();
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

    return $q.when(_states);
  }

  function deactivateAll() {
    var _states = getStatesFromStore();
    Object.keys(_states).forEach(function(stateKey) {
      _states[stateKey].active = false;
    });
    activeStatesStore.set('states', _states);

    return sync();
  }

  function findStateOption(name){
    return fetchStates().then(function(states){
      return states.find(state => state.name === name).activeOption;
    });

  }

  function sync(){
    return fetchStates().then(function(states) {
      var defer = $q.defer();
      var promise = defer.promise;
      defer.resolve();
      states.forEach(function (state) {
        promise = promise.then(function(){
          return findStateOption(state.name).then(function(option) {
            if (state.active) {
              stateReq[state.name].respond(function () {
                //var deferred = $q.defer();
                //$timeout(function() {
                //  deferred.resolve([option.status, option.data]);
                //}, option.delay);
                return [option.status, option.data];
              });
            }
            else {
              stateReq[state.name].passThrough();
            }
          });
        });
      });

      return promise;
    });
  }

  var initialized = fetchStates().then(function() {
    (states || []).forEach(function (state) {
      stateReq[state.name] = $httpBackend.when(state.verb || 'GET', new RegExp(state.url));
    });
  });

  return {
    //configured states todo doc
    states: states,
    initialize: function(){
      return initialized.then(sync);
    },
    //todo doc
    active_states_option: [],
    //todo doc
    upsertOption: upsertOption,
    //todo doc
    fetchStates: fetchStates,
    getState: function(name){
      return fetchStates().then(function(states){
        var state = states.find(state => state.name === name);
        return (state && state.active && findStateOption(name)) || $q.when(null);
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
    },
    //todo doc
    upsertMany: function(items){
      items.forEach(item => this.upsert(item));
    },
    deactivateAll: deactivateAll
  };
}

export default configurationService;
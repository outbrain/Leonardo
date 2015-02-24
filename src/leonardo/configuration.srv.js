function configurationService($q, $httpBackend) {
  var states = [];
  var activeStates = {};
  var stateReq = {};

  var db = openDatabase("leonardo.db", '1.0', "Leonardo WebSQL Database", 2 * 1024 * 1024);

  db.transaction(function (tx) {
    tx.executeSql("CREATE TABLE IF NOT EXISTS active_states_option (state PRIMARY KEY, name text, active text)");
    sync();
  });

  var upsertOption = function(state, name, active) {
    db.transaction(function (tx) {
      tx.executeSql("INSERT OR REPLACE into active_states_option (state, name, active) VALUES (?,?, ?)", [state, name, active]);
      sync();
    });
  }

  var select = function() {
    var defer = $q.defer();

    db.transaction(function (tx) {
      tx.executeSql("SELECT * from active_states_option", [], function(tx, results) {
        defer.resolve(results.rows);
      });
    });

    return defer.promise;
  };

  function fetchStates(){
    return select().then(function(rows){
      for(var i = 0; i < rows.length; i++) {
        activeStates[rows.item(i).state] = { name: rows.item(i).name, active: (rows.item(i).active === "true") };
      }

      var _states = states.map(state => angular.copy(state));

      _states.forEach(function(state) {
        let option = activeStates[state.name];
        state.active = !!option && option.active;
        state.activeOption = !!option ? state.options.find(_option => _option.name === option.name) : state.options[0];
      });

      return _states;
    });
  }

  function findStateOption(name){
    return fetchStates().then(function(states){
      return states.find(state => state.name === name).activeOption;
    });

  }

  function sync(){
    return fetchStates().then(function(states) {
      var defer = $q.defer();
      defer.resolve();
      states.forEach(function (state) {
        defer = defer.promise.then(function(){
          return findStateOption(state.name).then(function(option){
            if (state.active)
            {
              stateReq[state.name].respond(function () {
                return [option.status, option.data];
              });
            }
            else {
              stateReq[state.name].passThrough();
            }
          });
        });
      });

      return defer;
    });
  }

  var initialized = fetchStates().then(function(states) {
    states.forEach(function (state) {
      stateReq[state.name] = $httpBackend.when('GET', new RegExp(state.url));
    });
  });


  return {
    //configured states todo doc
    states: states,
    initialied: function(){
      return initialized.then(sync);
    },
    //todo doc
    active_states_option: [],
    //todo doc
    upsertOption: upsertOption,
    //todo doc
    fetchStates: fetchStates,
    //insert or replace an option by insert or updateing a state.
    upsert: function({ state, name, url, status = 200, data = {}, delay = 0}){
      var defaultState = {};

      var defaultOption = {};

      var stateItem = states.find(_state => (url ? _state.url === url : _state.name === state)) || defaultState;

      angular.extend(stateItem, {
        name: state || stateItem.name || url,
        url: url || stateItem.url,
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
    }
  };
}

export default configurationService;
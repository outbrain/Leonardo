function configurationService($q) {
  var states = [];

  var db = openDatabase("leonardo.db", '1.0', "Leonardo WebSQL Database", 2 * 1024 * 1024);

  db.transaction(function (tx) {
    tx.executeSql("CREATE TABLE IF NOT EXISTS active_states_option (state PRIMARY KEY, name text, active text)");
  });

  var upsertOption = function(state, name, active) {
    db.transaction(function (tx) {
      tx.executeSql("INSERT OR REPLACE into active_states_option (state, name, active) VALUES (?,?, ?)", [state, name, active]);
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

  select();

  return {
    //configured states todo doc
    states: states,
    getActiveStateOptions: select,
    //todo doc
    active_states_option: [],
    //todo doc
    upsertOption: upsertOption,
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
    addBundle: function(name, options){
      //todo implement
    }
  };
}

export default configurationService;
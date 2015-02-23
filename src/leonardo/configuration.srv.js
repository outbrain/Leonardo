function configurationService() {
  var states = [];

  return {
    // register
    states: states,
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
    addBundle: function(name, options){
      states[name] = states[name] || [];
      states[name].unshift.apply(states[name].unshift, options);
    }
  };
}

export default configurationService;
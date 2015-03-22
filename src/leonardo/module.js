import activatorDirective from './activator.drv.js';
import configurationService from './configuration.srv.js';
import windowBodyDirective from './window-body.drv.js';

export default angular.module('leonardo', ['leonardo.templates', 'angular-storage', 'ngMockE2E'])
  .factory('configuration', configurationService)
  .factory('activeStatesStore', function(store) {
    return store.getNamespacedStore('active_states');
  })
  .directive('activator', activatorDirective)
  .directive('windowBody', windowBodyDirective);


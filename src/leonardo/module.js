import activatorDirective from './activator.drv.js';
import configurationService from './configuration.srv.js';
import windowBodyDirective from './window-body.drv.js';

export default angular.module('leonardo', ['leonardo.templates', 'ngMockE2E'])
  .factory('configuration', configurationService)
  .directive('activator', activatorDirective)
  .directive('windowBody', windowBodyDirective);


import activatorDirective from './activator.drv.js';
import configurationService from './configuration.srv.js';
import windowBodyDirective from './window-body.drv.js';

export default angular.module('leonardo', ['leonardo.templates', 'ngMockE2E'])
  .run(run)
  .factory('configuration', configurationService)
  .directive('activator', activatorDirective)
  .directive('windowBody', windowBodyDirective);

function run(configuration, $httpBackend){
  configuration.upsert({ state: 'state1', name: 'get url1 aaaa', url: 'http://url1.com', status: 200, data: ["url1 aaa"]});
  configuration.upsert({ state: 'state1', name: 'get url1 bbbb', status:200,  data: ["url1 bbb"]});
  configuration.upsert({ url: 'http://url1.com', name: 'get url1 cccc', status:200,  data: ["url1 ccc"]});
  configuration.upsert({ url: 'http://url2.com', name: 'get url2 a', status:200,  data: ["url2 aaa"]});
  configuration.upsert({ url: 'http://url2.com', name: 'get url2 b', status:200,  data: ["url2 bbb"]});

//  configuration.states.forEach(function (state) {
//    state.options.forEach(function(option){
//      $httpBackend.when('GET', state.url).respond(state.status, state.data);
//    });
//  });
}


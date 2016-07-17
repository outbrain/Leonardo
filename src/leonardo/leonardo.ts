/// <reference path="../../typings/angularjs/angular.d.ts" />
import {leoActivator} from './activator.drv';
import {leoConfiguration} from './configuration.srv';
import {LeonardoProvider} from './leonardo.prov';
import {leoRequest} from './request.drv';
import {leoSelect} from './select.drv';
import {leoStateItem} from './state-item.drv';
import {Storage} from './storage.srv';
import {jsonFormatter} from './leo-json-formatter.drv';
import {windowBodyDirective} from './window-body.drv';

declare var sinon;

angular.module('leonardo', ['leonardo.templates', 'ngclipboard'])
  .directive('leoActivator', leoActivator)
  .directive('leoRequest', leoRequest)
  .directive('leoSelect', leoSelect)
  .directive('leoStateItem', leoStateItem)
  .directive('leoJsonFormatter', jsonFormatter)
  .directive('leoWindowBody', windowBodyDirective)
  .service('leoStorage', Storage)
  .factory('leoConfiguration', leoConfiguration)
  .provider('$leonardo', LeonardoProvider)
  .run([
    'leoConfiguration',
    '$document',
    '$rootScope',
    '$compile',
    '$timeout', function(leoConfiguration, $document, $rootScope, $compile, $timeout) {
    var server = sinon.fakeServer.create({
      autoRespond: true,
      autoRespondAfter: 10
    });

    sinon.FakeXMLHttpRequest.useFilters = true;
    sinon.FakeXMLHttpRequest.addFilter(function(method, url) {
      if (url.indexOf('.html') > 0 && url.indexOf('template') >= 0) {
        return true;
      }
      var state = leoConfiguration.fetchStatesByUrlAndMethod(url, method);
      return !(state && state.active);
    });

    sinon.FakeXMLHttpRequest.onResponseEnd = function(xhr) {
      var res = xhr.response;
      try { res = JSON.parse(xhr.response); }
      catch (e) {}
      leoConfiguration._logRequest(xhr.method, xhr.url, res, xhr.status);
    };

    server.respondWith(function(request) {
      var state = leoConfiguration.fetchStatesByUrlAndMethod(request.url, request.method),
          activeOption = leoConfiguration.getActiveStateOption(state.name);

      if (!!activeOption) {
        var responseData = angular.isFunction(activeOption.data) ? activeOption.data(request) : activeOption.data;
        request.respond(activeOption.status, { "Content-Type": "application/json" }, JSON.stringify(responseData));
        leoConfiguration._logRequest(request.method, request.url, responseData, activeOption.status);
      } else {
        console.warn('could not find a state for the following request', request);
      }
    });
    leoConfiguration.loadSavedStates();

    var el = $compile('<div leo-activator></div>')($rootScope);
    $timeout(function() {
      $document[0].body.appendChild(el[0]);
    });
  }]);

declare var module;
declare var exports;
// Common.js package manager support (e.g. ComponentJS, WebPack)
if (typeof module !== "undefined" && typeof exports !== "undefined" && module.exports === exports) {
  module.exports = 'leonardo';
}

/// <reference path="../../typings/angularjs/angular.d.ts" />
/// <reference path="leonardo.d.ts" />

import {leoActivator} from './activator.drv';
import {leoConfiguration} from './configuration.srv';
import {leoRequest} from './request.drv';
import {leoSelect} from './select.drv';
import {leoStateItem} from './state-item.drv';
import {Storage} from './storage.srv';
import {jsonFormatter} from './leo-json-formatter.drv';
import {windowBodyDirective} from './window-body.drv';

declare var sinon;
declare var window;
declare var Object;

window.Leonardo = window.Leonardo || {};
const configuration = leoConfiguration();
const storage = new Storage();
Object.assign(window.Leonardo || {}, configuration, { storage });

angular.module('leonardo', ['leonardo.templates', 'ngclipboard'])
  .directive('leoActivator', leoActivator)
  .directive('leoRequest', leoRequest)
  .directive('leoSelect', leoSelect)
  .directive('leoStateItem', leoStateItem)
  .directive('leoJsonFormatter', jsonFormatter)
  .directive('leoWindowBody', windowBodyDirective)
  .run([
    '$document',
    '$rootScope',
    '$compile',
    '$timeout',
    function ($document, $rootScope, $compile, $timeout) {
      var server = sinon.fakeServer.create({
        autoRespond: true,
        autoRespondAfter: 10
      });
      sinon.FakeXMLHttpRequest.useFilters = true;
      sinon.FakeXMLHttpRequest.addFilter(function (method, url) {
        if (url.indexOf('.html') > 0 && url.indexOf('template') >= 0) {
          return true;
        }
        var state = Leonardo.fetchStatesByUrlAndMethod(url, method);
        return !(state && state.active);
      });

      sinon.FakeXMLHttpRequest.onResponseEnd = function (xhr) {
        var res = xhr.response;
        try {
          res = JSON.parse(xhr.response);
        }
        catch (e) {
        }
        Leonardo._logRequest(xhr.method, xhr.url, res, xhr.status);
      };

      server.respondWith(function (request) {
        var state = Leonardo.fetchStatesByUrlAndMethod(request.url, request.method),
          activeOption = Leonardo.getActiveStateOption(state.name);

        if (!!activeOption) {
          var responseData = angular.isFunction(activeOption.data) ? activeOption.data(request) : activeOption.data;
          request.respond(activeOption.status, {"Content-Type": "application/json"}, JSON.stringify(responseData));
          Leonardo._logRequest(request.method, request.url, responseData, activeOption.status);
        } else {
          console.warn('could not find a state for the following request', request);
        }
      });
      Leonardo.loadSavedStates();

      var el = $compile('<div leo-activator></div>')($rootScope);
      $timeout(function() {
        var leonardoAppRoot = $document[0].querySelector('[leonardo-app]') || $document[0].body;
        leonardoAppRoot.appendChild(el[0]);
      });
    }]);

angular.element(document).ready(function() {
  var leonardoApp = document.querySelector('[leonardo-app]');
  if (!leonardoApp) {
    leonardoApp = document.createElement('div');
    leonardoApp.setAttribute('leonardo-app','leonardo-app');
    document.body.appendChild(leonardoApp);
  }
  if (Leonardo.needBootstrap) {
    angular.bootstrap(leonardoApp, ['leonardo']);
  }
});

declare var module;
declare var exports;
// Common.js package manager support (e.g. ComponentJS, WebPack)
if (typeof module !== "undefined" && typeof exports !== "undefined" && module.exports === exports) {
  module.exports = 'leonardo';
}

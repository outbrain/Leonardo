angular.module('leonardo', ['leonardo.templates'])
    .run(['leoConfiguration', '$document', '$rootScope', '$compile', function(leoConfiguration, $document, $rootScope, $compile) {
      var server = sinon.fakeServer.create({
        autoRespond: true,
        autoRespondAfter: 10
      });

      sinon.FakeXMLHttpRequest.useFilters = true;
      sinon.FakeXMLHttpRequest.addFilter(function(method, url) {
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
          var responseData = angular.isFunction(activeOption.data) ? activeOption.data() : activeOption.data;
          request.respond(activeOption.status, { "Content-Type": "application/json" }, JSON.stringify(responseData));
          leoConfiguration._logRequest(request.method, request.url, responseData, activeOption.status);
        } else {
          console.warn('could not find a state for the following request', request);
        }
      });
      leoConfiguration.loadSavedStates();

      var el = $compile( "<div leo-activator></div>" )($rootScope);
      $document[0].body.appendChild(el[0]);
    }]);

// Common.js package manager support (e.g. ComponentJS, WebPack)
if (typeof module !== "undefined" && typeof exports !== "undefined" && module.exports === exports) {
  module.exports = 'leonardo';
}

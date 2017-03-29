import Utils from './utils';
import * as sinon from 'sinon';

declare var sinon;

export class Sinon {
  constructor() {
    this.init();
  }

  private init() {
    var server = sinon.fakeServer.create({
      autoRespond: true,
      autoRespondAfterFn: this.autoRespondAfterFn.bind(this)
    });

    sinon.FakeXMLHttpRequest.useFilters = true;
    sinon.FakeXMLHttpRequest.addFilter(function (method, url) {
      var state = Leonardo.fetchStatesByUrlAndMethod(url, method);
      return !(state && state.active);
    });

    server.respondWith(function (request) {
      var state = Leonardo.fetchStatesByUrlAndMethod(request.url, request.method),
        activeOption = Leonardo.getActiveStateOption(state.name);

      if (!!activeOption) {
        var responseData = Utils.isFunction(activeOption.data) ? activeOption.data(request) : activeOption.data;
        request.respond(activeOption.status, {'Content-Type': 'application/json'}, JSON.stringify(responseData));
        Leonardo._logRequest(request.method, request.url, responseData, activeOption.status);
      } else {
        console.warn('could not find a state for the following request', request);
      }
    });
  }

  autoRespondAfterFn(request) {
      var state = Leonardo.fetchStatesByUrlAndMethod(request.url, request.method),
        activeOption = Leonardo.getActiveStateOption(state.name);
      return activeOption.delay || 10;
  }
}

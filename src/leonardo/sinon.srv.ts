import Utils from './utils';
import * as sinon from 'sinon';
import Leonardo from './leonardo';

export class Sinon {
  constructor() {
    this.init();
  }

  private init() {
    let server = sinon.fakeServer.create({
      autoRespond: true,
      autoRespondAfterFn: this.autoRespondAfterFn.bind(this)
    });

    sinon.FakeXMLHttpRequest.useFilters = true;
    sinon.FakeXMLHttpRequest.addFilter(function (method, url) {
      let state = Leonardo.fetchStatesByUrlAndMethod(url, method);
      return !(state && state.active);
    });

    sinon.FakeXMLHttpRequest.onResponseEnd = function (xhr) {
      let res = xhr.response;
      try {
        res = JSON.parse(xhr.response);
      }
      catch (e) {
      }
      Leonardo._logRequest(xhr.method,
          xhr.url, xhr.status, xhr.requestHeaders,
          xhr.requestBody, xhr.getAllResponseHeaders(), res);
    };

    server.respondWith(function (request) {
      let state = Leonardo.fetchStatesByUrlAndMethod(request.url, request.method),
        activeOption = Leonardo.getActiveStateOption(state.name);

      if (!!activeOption) {
        const resStatus = activeOption.status;
        const resData = Utils.isFunction(activeOption.data) ? activeOption.data(request) : activeOption.data;
        let resHeaders = {'Content-Type': 'application/json'};
        if (activeOption.headers) {
          resHeaders = Utils.isFunction(activeOption.headers) ? activeOption.headers(request) : activeOption.headers;
        }

        request.respond(resStatus, resHeaders, JSON.stringify(resData));
        Leonardo._logRequest(request.method, request.url,
            resStatus, request.requestHeaders,
            request.requestBody, resHeaders, resData);
      } else {
        console.warn('could not find a state for the following request', request);
      }
    });
  }

  autoRespondAfterFn(request) {
      let state = Leonardo.fetchStatesByUrlAndMethod(request.url, request.method),
        activeOption = Leonardo.getActiveStateOption(state.name);

      return activeOption && activeOption.delay || 10;
  }
}

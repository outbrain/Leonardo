import Utils from './utils';
import xhrMock, {proxy} from 'xhr-mock';
import MockRequest from 'xhr-mock/lib/MockRequest';
import MockResponse from 'xhr-mock/lib/MockResponse';

export class XhrMock {
  constructor() {
    this.init();
  }

  private init() {
    xhrMock.setup();
    xhrMock.use(async (request: MockRequest, response: MockResponse) => {
      const state = Leonardo.fetchStatesByUrlAndMethod(request.url().toString(), request.method());
      if (state && state.active) {
        const activeOption = Leonardo.getActiveStateOption(state.name);
        if (!!activeOption) {
          return this.getMockedResponse(state, activeOption, request, response);
        } else {
          console.warn('Leonardo could not find a state for the following request url', this.getRequestEventObj(request));
        }
      }
      try {
        //
        const res = await proxy(request, response);
        this.log(request, res);
        return res;
      } catch (e) {
        console.warn('Leonardo XhrMock Proxy threw an error', e);
      }
    });
  }

  getMockedResponse(state, activeOption, request, response) {
    const resStatus = parseInt(activeOption.status) || 200;
    const requestEventObj = this.getRequestEventObj(request);
    const resData = Utils.isFunction(activeOption.data) ? activeOption.data(requestEventObj) : activeOption.data;
    let resHeaders = {'Content-Type': 'application/json'};
    if (activeOption.headers) {
      resHeaders = Utils.isFunction(activeOption.headers) ? activeOption.headers(requestEventObj) : activeOption.headers;
    }
    const delay = activeOption.delay || 0;
    const deepCopy = (data: any) => {
      if (typeof data === 'object') {
        return JSON.parse(JSON.stringify(data)) 
      }

      return data
    }

    const res = response.status(resStatus).headers(resHeaders).body(deepCopy(resData));
    this.log(request, res);
    return new Promise<MockResponse>((resolve, reject) => {
      setTimeout(() => resolve(res), delay);
    });
  }

  getRequestEventObj(request: MockRequest) {
    return {
      url: request.url().toString(),
      method: request.method(),
      requestBody: request.body(),
      headers: request.headers()
    }
  }

  log(request: MockRequest, response: MockResponse) {
    Leonardo._logRequest(
      request.method(),
      request.url().toString(),
      response.status(),
      request.headers(),
      request.body(),
      response.headers(),
      response.body()
    );
  }
}

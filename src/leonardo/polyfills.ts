export function polifylls() {

  // CustomEvent
  (function () {
    function CustomEvent(event, params) {
      params = params || {bubbles: false, cancelable: false, detail: undefined};
      let evt = document.createEvent('CustomEvent');
      evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
      return evt;
    }

    CustomEvent.prototype = window['Event'].prototype;

    (window as unknown)['CustomEvent'] = CustomEvent;
  })();

  // Object.assign
  (function () {
    if (typeof (<any>Object).assign != 'function') {
      (<any>Object).assign = function (target) {
        'use strict';
        if (target == null) {
          throw new TypeError('Cannot convert undefined or null to object');
        }

        target = Object(target);
        for (let index = 1; index < arguments.length; index++) {
          let source = arguments[index];
          if (source != null) {
            for (let key in source) {
              if (Object.prototype.hasOwnProperty.call(source, key)) {
                target[key] = source[key];
              }
            }
          }
        }
        return target;
      };
    }

  })()
}


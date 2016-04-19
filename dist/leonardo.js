/**
 * Sinon.JS 1.17.2, 2015/10/21
 *
 * @author Christian Johansen (christian@cjohansen.no)
 * @author Contributors: https://github.com/cjohansen/Sinon.JS/blob/master/AUTHORS
 *
 * (The BSD License)
 *
 * Copyright (c) 2010-2014, Christian Johansen, christian@cjohansen.no
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification,
 * are permitted provided that the following conditions are met:
 *
 *     * Redistributions of source code must retain the above copyright notice,
 *       this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright notice,
 *       this list of conditions and the following disclaimer in the documentation
 *       and/or other materials provided with the distribution.
 *     * Neither the name of Christian Johansen nor the names of his contributors
 *       may be used to endorse or promote products derived from this software
 *       without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
 * THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

/**
 * Sinon core utilities. For internal use only.
 *
 * @author Christian Johansen (christian@cjohansen.no)
 * @license BSD
 *
 * Copyright (c) 2010-2013 Christian Johansen
 */
var sinon = (function () {
  "use strict";
  // eslint-disable-line no-unused-vars

  var sinonModule;
  var isNode = typeof module !== "undefined" && module.exports && typeof require === "function";
  var isAMD = typeof define === "function" && typeof define.amd === "object" && define.amd;

  function loadDependencies(require, exports, module) {
    sinonModule = module.exports = require("./sinon/util/core");
    require("./sinon/extend");
    require("./sinon/walk");
    require("./sinon/typeOf");
    require("./sinon/times_in_words");
    require("./sinon/spy");
    require("./sinon/call");
    require("./sinon/behavior");
    require("./sinon/stub");
    require("./sinon/mock");
    require("./sinon/collection");
    require("./sinon/assert");
    require("./sinon/sandbox");
    require("./sinon/test");
    require("./sinon/test_case");
    require("./sinon/match");
    require("./sinon/format");
    require("./sinon/log_error");
  }

  if (isAMD) {
    define(loadDependencies);
  } else if (isNode) {
    loadDependencies(require, module.exports, module);
    sinonModule = module.exports;
  } else {
    sinonModule = {};
  }

  return sinonModule;
}());

/**
 * @depend ../../sinon.js
 */
/**
 * Sinon core utilities. For internal use only.
 *
 * @author Christian Johansen (christian@cjohansen.no)
 * @license BSD
 *
 * Copyright (c) 2010-2013 Christian Johansen
 */
(function (sinonGlobal) {

  var div = typeof document !== "undefined" && document.createElement("div");
  var hasOwn = Object.prototype.hasOwnProperty;

  function isDOMNode(obj) {
    var success = false;

    try {
      obj.appendChild(div);
      success = div.parentNode === obj;
    } catch (e) {
      return false;
    } finally {
      try {
        obj.removeChild(div);
      } catch (e) {
        // Remove failed, not much we can do about that
      }
    }

    return success;
  }

  function isElement(obj) {
    return div && obj && obj.nodeType === 1 && isDOMNode(obj);
  }

  function isFunction(obj) {
    return typeof obj === "function" || !!(obj && obj.constructor && obj.call && obj.apply);
  }

  function isReallyNaN(val) {
    return typeof val === "number" && isNaN(val);
  }

  function mirrorProperties(target, source) {
    for (var prop in source) {
      if (!hasOwn.call(target, prop)) {
        target[prop] = source[prop];
      }
    }
  }

  function isRestorable(obj) {
    return typeof obj === "function" && typeof obj.restore === "function" && obj.restore.sinon;
  }

  // Cheap way to detect if we have ES5 support.
  var hasES5Support = "keys" in Object;

  function makeApi(sinon) {
    sinon.wrapMethod = function wrapMethod(object, property, method) {
      if (!object) {
        throw new TypeError("Should wrap property of object");
      }

      if (typeof method !== "function" && typeof method !== "object") {
        throw new TypeError("Method wrapper should be a function or a property descriptor");
      }

      function checkWrappedMethod(wrappedMethod) {
        var error;

        if (!isFunction(wrappedMethod)) {
          error = new TypeError("Attempted to wrap " + (typeof wrappedMethod) + " property " +
              property + " as function");
        } else if (wrappedMethod.restore && wrappedMethod.restore.sinon) {
          error = new TypeError("Attempted to wrap " + property + " which is already wrapped");
        } else if (wrappedMethod.calledBefore) {
          var verb = wrappedMethod.returns ? "stubbed" : "spied on";
          error = new TypeError("Attempted to wrap " + property + " which is already " + verb);
        }

        if (error) {
          if (wrappedMethod && wrappedMethod.stackTrace) {
            error.stack += "\n--------------\n" + wrappedMethod.stackTrace;
          }
          throw error;
        }
      }

      var error, wrappedMethod, i;

      // IE 8 does not support hasOwnProperty on the window object and Firefox has a problem
      // when using hasOwn.call on objects from other frames.
      var owned = object.hasOwnProperty ? object.hasOwnProperty(property) : hasOwn.call(object, property);

      if (hasES5Support) {
        var methodDesc = (typeof method === "function") ? {value: method} : method;
        var wrappedMethodDesc = sinon.getPropertyDescriptor(object, property);

        if (!wrappedMethodDesc) {
          error = new TypeError("Attempted to wrap " + (typeof wrappedMethod) + " property " +
              property + " as function");
        } else if (wrappedMethodDesc.restore && wrappedMethodDesc.restore.sinon) {
          error = new TypeError("Attempted to wrap " + property + " which is already wrapped");
        }
        if (error) {
          if (wrappedMethodDesc && wrappedMethodDesc.stackTrace) {
            error.stack += "\n--------------\n" + wrappedMethodDesc.stackTrace;
          }
          throw error;
        }

        var types = sinon.objectKeys(methodDesc);
        for (i = 0; i < types.length; i++) {
          wrappedMethod = wrappedMethodDesc[types[i]];
          checkWrappedMethod(wrappedMethod);
        }

        mirrorProperties(methodDesc, wrappedMethodDesc);
        for (i = 0; i < types.length; i++) {
          mirrorProperties(methodDesc[types[i]], wrappedMethodDesc[types[i]]);
        }
        Object.defineProperty(object, property, methodDesc);
      } else {
        wrappedMethod = object[property];
        checkWrappedMethod(wrappedMethod);
        object[property] = method;
        method.displayName = property;
      }

      method.displayName = property;

      // Set up a stack trace which can be used later to find what line of
      // code the original method was created on.
      method.stackTrace = (new Error("Stack Trace for original")).stack;

      method.restore = function () {
        // For prototype properties try to reset by delete first.
        // If this fails (ex: localStorage on mobile safari) then force a reset
        // via direct assignment.
        if (!owned) {
          // In some cases `delete` may throw an error
          try {
            delete object[property];
          } catch (e) {} // eslint-disable-line no-empty
          // For native code functions `delete` fails without throwing an error
          // on Chrome < 43, PhantomJS, etc.
        } else if (hasES5Support) {
          Object.defineProperty(object, property, wrappedMethodDesc);
        }

        // Use strict equality comparison to check failures then force a reset
        // via direct assignment.
        if (object[property] === method) {
          object[property] = wrappedMethod;
        }
      };

      method.restore.sinon = true;

      if (!hasES5Support) {
        mirrorProperties(method, wrappedMethod);
      }

      return method;
    };

    sinon.create = function create(proto) {
      var F = function () {};
      F.prototype = proto;
      return new F();
    };

    sinon.deepEqual = function deepEqual(a, b) {
      if (sinon.match && sinon.match.isMatcher(a)) {
        return a.test(b);
      }

      if (typeof a !== "object" || typeof b !== "object") {
        return isReallyNaN(a) && isReallyNaN(b) || a === b;
      }

      if (isElement(a) || isElement(b)) {
        return a === b;
      }

      if (a === b) {
        return true;
      }

      if ((a === null && b !== null) || (a !== null && b === null)) {
        return false;
      }

      if (a instanceof RegExp && b instanceof RegExp) {
        return (a.source === b.source) && (a.global === b.global) &&
            (a.ignoreCase === b.ignoreCase) && (a.multiline === b.multiline);
      }

      var aString = Object.prototype.toString.call(a);
      if (aString !== Object.prototype.toString.call(b)) {
        return false;
      }

      if (aString === "[object Date]") {
        return a.valueOf() === b.valueOf();
      }

      var prop;
      var aLength = 0;
      var bLength = 0;

      if (aString === "[object Array]" && a.length !== b.length) {
        return false;
      }

      for (prop in a) {
        if (a.hasOwnProperty(prop)) {
          aLength += 1;

          if (!(prop in b)) {
            return false;
          }

          if (!deepEqual(a[prop], b[prop])) {
            return false;
          }
        }
      }

      for (prop in b) {
        if (b.hasOwnProperty(prop)) {
          bLength += 1;
        }
      }

      return aLength === bLength;
    };

    sinon.functionName = function functionName(func) {
      var name = func.displayName || func.name;

      // Use function decomposition as a last resort to get function
      // name. Does not rely on function decomposition to work - if it
      // doesn't debugging will be slightly less informative
      // (i.e. toString will say 'spy' rather than 'myFunc').
      if (!name) {
        var matches = func.toString().match(/function ([^\s\(]+)/);
        name = matches && matches[1];
      }

      return name;
    };

    sinon.functionToString = function toString() {
      if (this.getCall && this.callCount) {
        var thisValue,
            prop;
        var i = this.callCount;

        while (i--) {
          thisValue = this.getCall(i).thisValue;

          for (prop in thisValue) {
            if (thisValue[prop] === this) {
              return prop;
            }
          }
        }
      }

      return this.displayName || "sinon fake";
    };

    sinon.objectKeys = function objectKeys(obj) {
      if (obj !== Object(obj)) {
        throw new TypeError("sinon.objectKeys called on a non-object");
      }

      var keys = [];
      var key;
      for (key in obj) {
        if (hasOwn.call(obj, key)) {
          keys.push(key);
        }
      }

      return keys;
    };

    sinon.getPropertyDescriptor = function getPropertyDescriptor(object, property) {
      var proto = object;
      var descriptor;

      while (proto && !(descriptor = Object.getOwnPropertyDescriptor(proto, property))) {
        proto = Object.getPrototypeOf(proto);
      }
      return descriptor;
    };

    sinon.getConfig = function (custom) {
      var config = {};
      custom = custom || {};
      var defaults = sinon.defaultConfig;

      for (var prop in defaults) {
        if (defaults.hasOwnProperty(prop)) {
          config[prop] = custom.hasOwnProperty(prop) ? custom[prop] : defaults[prop];
        }
      }

      return config;
    };

    sinon.defaultConfig = {
      injectIntoThis: true,
      injectInto: null,
      properties: ["spy", "stub", "mock", "clock", "server", "requests"],
      useFakeTimers: true,
      useFakeServer: true
    };

    sinon.timesInWords = function timesInWords(count) {
      return count === 1 && "once" ||
          count === 2 && "twice" ||
          count === 3 && "thrice" ||
          (count || 0) + " times";
    };

    sinon.calledInOrder = function (spies) {
      for (var i = 1, l = spies.length; i < l; i++) {
        if (!spies[i - 1].calledBefore(spies[i]) || !spies[i].called) {
          return false;
        }
      }

      return true;
    };

    sinon.orderByFirstCall = function (spies) {
      return spies.sort(function (a, b) {
        // uuid, won't ever be equal
        var aCall = a.getCall(0);
        var bCall = b.getCall(0);
        var aId = aCall && aCall.callId || -1;
        var bId = bCall && bCall.callId || -1;

        return aId < bId ? -1 : 1;
      });
    };

    sinon.createStubInstance = function (constructor) {
      if (typeof constructor !== "function") {
        throw new TypeError("The constructor should be a function.");
      }
      return sinon.stub(sinon.create(constructor.prototype));
    };

    sinon.restore = function (object) {
      if (object !== null && typeof object === "object") {
        for (var prop in object) {
          if (isRestorable(object[prop])) {
            object[prop].restore();
          }
        }
      } else if (isRestorable(object)) {
        object.restore();
      }
    };

    return sinon;
  }

  var isNode = typeof module !== "undefined" && module.exports && typeof require === "function";
  var isAMD = typeof define === "function" && typeof define.amd === "object" && define.amd;

  function loadDependencies(require, exports) {
    makeApi(exports);
  }

  if (isAMD) {
    define(loadDependencies);
    return;
  }

  if (isNode) {
    loadDependencies(require, module.exports, module);
    return;
  }

  if (sinonGlobal) {
    makeApi(sinonGlobal);
  }
}(
    typeof sinon === "object" && sinon // eslint-disable-line no-undef
));

/**
 * @depend util/core.js
 */
(function (sinonGlobal) {

  function makeApi(sinon) {

    // Adapted from https://developer.mozilla.org/en/docs/ECMAScript_DontEnum_attribute#JScript_DontEnum_Bug
    var hasDontEnumBug = (function () {
      var obj = {
        constructor: function () {
          return "0";
        },
        toString: function () {
          return "1";
        },
        valueOf: function () {
          return "2";
        },
        toLocaleString: function () {
          return "3";
        },
        prototype: function () {
          return "4";
        },
        isPrototypeOf: function () {
          return "5";
        },
        propertyIsEnumerable: function () {
          return "6";
        },
        hasOwnProperty: function () {
          return "7";
        },
        length: function () {
          return "8";
        },
        unique: function () {
          return "9";
        }
      };

      var result = [];
      for (var prop in obj) {
        if (obj.hasOwnProperty(prop)) {
          result.push(obj[prop]());
        }
      }
      return result.join("") !== "0123456789";
    })();

    /* Public: Extend target in place with all (own) properties from sources in-order. Thus, last source will
     *         override properties in previous sources.
     *
     * target - The Object to extend
     * sources - Objects to copy properties from.
     *
     * Returns the extended target
     */
    function extend(target /*, sources */) {
      var sources = Array.prototype.slice.call(arguments, 1);
      var source, i, prop;

      for (i = 0; i < sources.length; i++) {
        source = sources[i];

        for (prop in source) {
          if (source.hasOwnProperty(prop)) {
            target[prop] = source[prop];
          }
        }

        // Make sure we copy (own) toString method even when in JScript with DontEnum bug
        // See https://developer.mozilla.org/en/docs/ECMAScript_DontEnum_attribute#JScript_DontEnum_Bug
        if (hasDontEnumBug && source.hasOwnProperty("toString") && source.toString !== target.toString) {
          target.toString = source.toString;
        }
      }

      return target;
    }

    sinon.extend = extend;
    return sinon.extend;
  }

  function loadDependencies(require, exports, module) {
    var sinon = require("./util/core");
    module.exports = makeApi(sinon);
  }

  var isNode = typeof module !== "undefined" && module.exports && typeof require === "function";
  var isAMD = typeof define === "function" && typeof define.amd === "object" && define.amd;

  if (isAMD) {
    define(loadDependencies);
    return;
  }

  if (isNode) {
    loadDependencies(require, module.exports, module);
    return;
  }

  if (sinonGlobal) {
    makeApi(sinonGlobal);
  }
}(
    typeof sinon === "object" && sinon // eslint-disable-line no-undef
));

/**
 * Minimal Event interface implementation
 *
 * Original implementation by Sven Fuchs: https://gist.github.com/995028
 * Modifications and tests by Christian Johansen.
 *
 * @author Sven Fuchs (svenfuchs@artweb-design.de)
 * @author Christian Johansen (christian@cjohansen.no)
 * @license BSD
 *
 * Copyright (c) 2011 Sven Fuchs, Christian Johansen
 */
if (typeof sinon === "undefined") {
  this.sinon = {};
}

(function () {

  var push = [].push;

  function makeApi(sinon) {
    sinon.Event = function Event(type, bubbles, cancelable, target) {
      this.initEvent(type, bubbles, cancelable, target);
    };

    sinon.Event.prototype = {
      initEvent: function (type, bubbles, cancelable, target) {
        this.type = type;
        this.bubbles = bubbles;
        this.cancelable = cancelable;
        this.target = target;
      },

      stopPropagation: function () {},

      preventDefault: function () {
        this.defaultPrevented = true;
      }
    };

    sinon.ProgressEvent = function ProgressEvent(type, progressEventRaw, target) {
      this.initEvent(type, false, false, target);
      this.loaded = progressEventRaw.loaded || null;
      this.total = progressEventRaw.total || null;
      this.lengthComputable = !!progressEventRaw.total;
    };

    sinon.ProgressEvent.prototype = new sinon.Event();

    sinon.ProgressEvent.prototype.constructor = sinon.ProgressEvent;

    sinon.CustomEvent = function CustomEvent(type, customData, target) {
      this.initEvent(type, false, false, target);
      this.detail = customData.detail || null;
    };

    sinon.CustomEvent.prototype = new sinon.Event();

    sinon.CustomEvent.prototype.constructor = sinon.CustomEvent;

    sinon.EventTarget = {
      addEventListener: function addEventListener(event, listener) {
        this.eventListeners = this.eventListeners || {};
        this.eventListeners[event] = this.eventListeners[event] || [];
        push.call(this.eventListeners[event], listener);
      },

      removeEventListener: function removeEventListener(event, listener) {
        var listeners = this.eventListeners && this.eventListeners[event] || [];

        for (var i = 0, l = listeners.length; i < l; ++i) {
          if (listeners[i] === listener) {
            return listeners.splice(i, 1);
          }
        }
      },

      dispatchEvent: function dispatchEvent(event) {
        var type = event.type;
        var listeners = this.eventListeners && this.eventListeners[type] || [];

        for (var i = 0; i < listeners.length; i++) {
          if (typeof listeners[i] === "function") {
            listeners[i].call(this, event);
          } else {
            listeners[i].handleEvent(event);
          }
        }

        return !!event.defaultPrevented;
      }
    };
  }

  var isNode = typeof module !== "undefined" && module.exports && typeof require === "function";
  var isAMD = typeof define === "function" && typeof define.amd === "object" && define.amd;

  function loadDependencies(require) {
    var sinon = require("./core");
    makeApi(sinon);
  }

  if (isAMD) {
    define(loadDependencies);
  } else if (isNode) {
    loadDependencies(require);
  } else {
    makeApi(sinon); // eslint-disable-line no-undef
  }
}());

/**
 * @depend util/core.js
 */
/**
 * Logs errors
 *
 * @author Christian Johansen (christian@cjohansen.no)
 * @license BSD
 *
 * Copyright (c) 2010-2014 Christian Johansen
 */
(function (sinonGlobal) {

  // cache a reference to setTimeout, so that our reference won't be stubbed out
  // when using fake timers and errors will still get logged
  // https://github.com/cjohansen/Sinon.JS/issues/381
  var realSetTimeout = setTimeout;

  function makeApi(sinon) {

    function log() {}

    function logError(label, err) {
      var msg = label + " threw exception: ";

      function throwLoggedError() {
        err.message = msg + err.message;
        throw err;
      }

      sinon.log(msg + "[" + err.name + "] " + err.message);

      if (err.stack) {
        sinon.log(err.stack);
      }

      if (logError.useImmediateExceptions) {
        throwLoggedError();
      } else {
        logError.setTimeout(throwLoggedError, 0);
      }
    }

    // When set to true, any errors logged will be thrown immediately;
    // If set to false, the errors will be thrown in separate execution frame.
    logError.useImmediateExceptions = false;

    // wrap realSetTimeout with something we can stub in tests
    logError.setTimeout = function (func, timeout) {
      realSetTimeout(func, timeout);
    };

    var exports = {};
    exports.log = sinon.log = log;
    exports.logError = sinon.logError = logError;

    return exports;
  }

  function loadDependencies(require, exports, module) {
    var sinon = require("./util/core");
    module.exports = makeApi(sinon);
  }

  var isNode = typeof module !== "undefined" && module.exports && typeof require === "function";
  var isAMD = typeof define === "function" && typeof define.amd === "object" && define.amd;

  if (isAMD) {
    define(loadDependencies);
    return;
  }

  if (isNode) {
    loadDependencies(require, module.exports, module);
    return;
  }

  if (sinonGlobal) {
    makeApi(sinonGlobal);
  }
}(
    typeof sinon === "object" && sinon // eslint-disable-line no-undef
));

/**
 * @depend core.js
 * @depend ../extend.js
 * @depend event.js
 * @depend ../log_error.js
 */
/**
 * Fake XDomainRequest object
 */
if (typeof sinon === "undefined") {
  this.sinon = {};
}

// wrapper for global
(function (global) {

  var xdr = { XDomainRequest: global.XDomainRequest };
  xdr.GlobalXDomainRequest = global.XDomainRequest;
  xdr.supportsXDR = typeof xdr.GlobalXDomainRequest !== "undefined";
  xdr.workingXDR = xdr.supportsXDR ? xdr.GlobalXDomainRequest : false;

  function makeApi(sinon) {
    sinon.xdr = xdr;

    function FakeXDomainRequest() {
      this.readyState = FakeXDomainRequest.UNSENT;
      this.requestBody = null;
      this.requestHeaders = {};
      this.status = 0;
      this.timeout = null;

      if (typeof FakeXDomainRequest.onCreate === "function") {
        FakeXDomainRequest.onCreate(this);
      }
    }

    function verifyState(x) {
      if (x.readyState !== FakeXDomainRequest.OPENED) {
        throw new Error("INVALID_STATE_ERR");
      }

      if (x.sendFlag) {
        throw new Error("INVALID_STATE_ERR");
      }
    }

    function verifyRequestSent(x) {
      if (x.readyState === FakeXDomainRequest.UNSENT) {
        throw new Error("Request not sent");
      }
      if (x.readyState === FakeXDomainRequest.DONE) {
        throw new Error("Request done");
      }
    }

    function verifyResponseBodyType(body) {
      if (typeof body !== "string") {
        var error = new Error("Attempted to respond to fake XDomainRequest with " +
            body + ", which is not a string.");
        error.name = "InvalidBodyException";
        throw error;
      }
    }

    sinon.extend(FakeXDomainRequest.prototype, sinon.EventTarget, {
      open: function open(method, url) {
        this.method = method;
        this.url = url;

        this.responseText = null;
        this.sendFlag = false;

        this.readyStateChange(FakeXDomainRequest.OPENED);
      },

      readyStateChange: function readyStateChange(state) {
        this.readyState = state;
        var eventName = "";
        switch (this.readyState) {
          case FakeXDomainRequest.UNSENT:
            break;
          case FakeXDomainRequest.OPENED:
            break;
          case FakeXDomainRequest.LOADING:
            if (this.sendFlag) {
              //raise the progress event
              eventName = "onprogress";
            }
            break;
          case FakeXDomainRequest.DONE:
            if (this.isTimeout) {
              eventName = "ontimeout";
            } else if (this.errorFlag || (this.status < 200 || this.status > 299)) {
              eventName = "onerror";
            } else {
              eventName = "onload";
            }
            break;
        }

        // raising event (if defined)
        if (eventName) {
          if (typeof this[eventName] === "function") {
            try {
              this[eventName]();
            } catch (e) {
              sinon.logError("Fake XHR " + eventName + " handler", e);
            }
          }
        }
      },

      send: function send(data) {
        verifyState(this);

        if (!/^(get|head)$/i.test(this.method)) {
          this.requestBody = data;
        }
        this.requestHeaders["Content-Type"] = "text/plain;charset=utf-8";

        this.errorFlag = false;
        this.sendFlag = true;
        this.readyStateChange(FakeXDomainRequest.OPENED);

        if (typeof this.onSend === "function") {
          this.onSend(this);
        }
      },

      abort: function abort() {
        this.aborted = true;
        this.responseText = null;
        this.errorFlag = true;

        if (this.readyState > sinon.FakeXDomainRequest.UNSENT && this.sendFlag) {
          this.readyStateChange(sinon.FakeXDomainRequest.DONE);
          this.sendFlag = false;
        }
      },

      setResponseBody: function setResponseBody(body) {
        verifyRequestSent(this);
        verifyResponseBodyType(body);

        var chunkSize = this.chunkSize || 10;
        var index = 0;
        this.responseText = "";

        do {
          this.readyStateChange(FakeXDomainRequest.LOADING);
          this.responseText += body.substring(index, index + chunkSize);
          index += chunkSize;
        } while (index < body.length);

        this.readyStateChange(FakeXDomainRequest.DONE);
      },

      respond: function respond(status, contentType, body) {
        // content-type ignored, since XDomainRequest does not carry this
        // we keep the same syntax for respond(...) as for FakeXMLHttpRequest to ease
        // test integration across browsers
        this.status = typeof status === "number" ? status : 200;
        this.setResponseBody(body || "");
      },

      simulatetimeout: function simulatetimeout() {
        this.status = 0;
        this.isTimeout = true;
        // Access to this should actually throw an error
        this.responseText = undefined;
        this.readyStateChange(FakeXDomainRequest.DONE);
      }
    });

    sinon.extend(FakeXDomainRequest, {
      UNSENT: 0,
      OPENED: 1,
      LOADING: 3,
      DONE: 4
    });

    sinon.useFakeXDomainRequest = function useFakeXDomainRequest() {
      sinon.FakeXDomainRequest.restore = function restore(keepOnCreate) {
        if (xdr.supportsXDR) {
          global.XDomainRequest = xdr.GlobalXDomainRequest;
        }

        delete sinon.FakeXDomainRequest.restore;

        if (keepOnCreate !== true) {
          delete sinon.FakeXDomainRequest.onCreate;
        }
      };
      if (xdr.supportsXDR) {
        global.XDomainRequest = sinon.FakeXDomainRequest;
      }
      return sinon.FakeXDomainRequest;
    };

    sinon.FakeXDomainRequest = FakeXDomainRequest;
  }

  var isNode = typeof module !== "undefined" && module.exports && typeof require === "function";
  var isAMD = typeof define === "function" && typeof define.amd === "object" && define.amd;

  function loadDependencies(require, exports, module) {
    var sinon = require("./core");
    require("../extend");
    require("./event");
    require("../log_error");
    makeApi(sinon);
    module.exports = sinon;
  }

  if (isAMD) {
    define(loadDependencies);
  } else if (isNode) {
    loadDependencies(require, module.exports, module);
  } else {
    makeApi(sinon); // eslint-disable-line no-undef
  }
})(typeof global !== "undefined" ? global : self);

/**
 * @depend core.js
 * @depend ../extend.js
 * @depend event.js
 * @depend ../log_error.js
 */
/**
 * Fake XMLHttpRequest object
 *
 * @author Christian Johansen (christian@cjohansen.no)
 * @license BSD
 *
 * Copyright (c) 2010-2013 Christian Johansen
 */
(function (sinonGlobal, global) {

  function getWorkingXHR(globalScope) {
    var supportsXHR = typeof globalScope.XMLHttpRequest !== "undefined";
    if (supportsXHR) {
      return globalScope.XMLHttpRequest;
    }

    var supportsActiveX = typeof globalScope.ActiveXObject !== "undefined";
    if (supportsActiveX) {
      return function () {
        return new globalScope.ActiveXObject("MSXML2.XMLHTTP.3.0");
      };
    }

    return false;
  }

  var supportsProgress = typeof ProgressEvent !== "undefined";
  var supportsCustomEvent = typeof CustomEvent !== "undefined";
  var supportsFormData = typeof FormData !== "undefined";
  var supportsArrayBuffer = typeof ArrayBuffer !== "undefined";
  var supportsBlob = typeof Blob === "function";
  var sinonXhr = { XMLHttpRequest: global.XMLHttpRequest };
  sinonXhr.GlobalXMLHttpRequest = global.XMLHttpRequest;
  sinonXhr.GlobalActiveXObject = global.ActiveXObject;
  sinonXhr.supportsActiveX = typeof sinonXhr.GlobalActiveXObject !== "undefined";
  sinonXhr.supportsXHR = typeof sinonXhr.GlobalXMLHttpRequest !== "undefined";
  sinonXhr.workingXHR = getWorkingXHR(global);
  sinonXhr.supportsCORS = sinonXhr.supportsXHR && "withCredentials" in (new sinonXhr.GlobalXMLHttpRequest());

  var unsafeHeaders = {
    "Accept-Charset": true,
    "Accept-Encoding": true,
    Connection: true,
    "Content-Length": true,
    Cookie: true,
    Cookie2: true,
    "Content-Transfer-Encoding": true,
    Date: true,
    Expect: true,
    Host: true,
    "Keep-Alive": true,
    Referer: true,
    TE: true,
    Trailer: true,
    "Transfer-Encoding": true,
    Upgrade: true,
    "User-Agent": true,
    Via: true
  };

  // An upload object is created for each
  // FakeXMLHttpRequest and allows upload
  // events to be simulated using uploadProgress
  // and uploadError.
  function UploadProgress() {
    this.eventListeners = {
      progress: [],
      load: [],
      abort: [],
      error: []
    };
  }

  UploadProgress.prototype.addEventListener = function addEventListener(event, listener) {
    this.eventListeners[event].push(listener);
  };

  UploadProgress.prototype.removeEventListener = function removeEventListener(event, listener) {
    var listeners = this.eventListeners[event] || [];

    for (var i = 0, l = listeners.length; i < l; ++i) {
      if (listeners[i] === listener) {
        return listeners.splice(i, 1);
      }
    }
  };

  UploadProgress.prototype.dispatchEvent = function dispatchEvent(event) {
    var listeners = this.eventListeners[event.type] || [];

    for (var i = 0, listener; (listener = listeners[i]) != null; i++) {
      listener(event);
    }
  };

  // Note that for FakeXMLHttpRequest to work pre ES5
  // we lose some of the alignment with the spec.
  // To ensure as close a match as possible,
  // set responseType before calling open, send or respond;
  function FakeXMLHttpRequest() {
    this.readyState = FakeXMLHttpRequest.UNSENT;
    this.requestHeaders = {};
    this.requestBody = null;
    this.status = 0;
    this.statusText = "";
    this.upload = new UploadProgress();
    this.responseType = "";
    this.response = "";
    if (sinonXhr.supportsCORS) {
      this.withCredentials = false;
    }

    var xhr = this;
    var events = ["loadstart", "load", "abort", "loadend"];

    function addEventListener(eventName) {
      xhr.addEventListener(eventName, function (event) {
        var listener = xhr["on" + eventName];

        if (listener && typeof listener === "function") {
          listener.call(this, event);
        }
      });
    }

    for (var i = events.length - 1; i >= 0; i--) {
      addEventListener(events[i]);
    }

    if (typeof FakeXMLHttpRequest.onCreate === "function") {
      FakeXMLHttpRequest.onCreate(this);
    }
  }

  function verifyState(xhr) {
    if (xhr.readyState !== FakeXMLHttpRequest.OPENED) {
      throw new Error("INVALID_STATE_ERR");
    }

    if (xhr.sendFlag) {
      throw new Error("INVALID_STATE_ERR");
    }
  }

  function getHeader(headers, header) {
    header = header.toLowerCase();

    for (var h in headers) {
      if (h.toLowerCase() === header) {
        return h;
      }
    }

    return null;
  }

  // filtering to enable a white-list version of Sinon FakeXhr,
  // where whitelisted requests are passed through to real XHR
  function each(collection, callback) {
    if (!collection) {
      return;
    }

    for (var i = 0, l = collection.length; i < l; i += 1) {
      callback(collection[i]);
    }
  }
  function some(collection, callback) {
    for (var index = 0; index < collection.length; index++) {
      if (callback(collection[index]) === true) {
        return true;
      }
    }
    return false;
  }
  // largest arity in XHR is 5 - XHR#open
  var apply = function (obj, method, args) {
    switch (args.length) {
      case 0: return obj[method]();
      case 1: return obj[method](args[0]);
      case 2: return obj[method](args[0], args[1]);
      case 3: return obj[method](args[0], args[1], args[2]);
      case 4: return obj[method](args[0], args[1], args[2], args[3]);
      case 5: return obj[method](args[0], args[1], args[2], args[3], args[4]);
    }
  };

  FakeXMLHttpRequest.filters = [];
  FakeXMLHttpRequest.addFilter = function addFilter(fn) {
    this.filters.push(fn);
  };
  var IE6Re = /MSIE 6/;
  FakeXMLHttpRequest.onResponseEnd = function() {};
  FakeXMLHttpRequest.defake = function defake(fakeXhr, xhrArgs) {
    var xhr = new sinonXhr.workingXHR(); // eslint-disable-line new-cap

    each([
      "open",
      "setRequestHeader",
      "send",
      "abort",
      "getResponseHeader",
      "getAllResponseHeaders",
      "addEventListener",
      "overrideMimeType",
      "removeEventListener"
    ], function (method) {
      fakeXhr[method] = function () {
        return apply(xhr, method, arguments);
      };
    });

    var copyAttrs = function (args) {
      each(args, function (attr) {
        try {
          fakeXhr[attr] = xhr[attr];
        } catch (e) {
          if (!IE6Re.test(navigator.userAgent)) {
            throw e;
          }
        }
      });
    };

    var stateChange = function stateChange() {
      fakeXhr.readyState = xhr.readyState;
      if (xhr.readyState >= FakeXMLHttpRequest.HEADERS_RECEIVED) {
        copyAttrs(["status", "statusText"]);
      }
      if (xhr.readyState >= FakeXMLHttpRequest.LOADING) {
        copyAttrs(["responseText", "response"]);
      }
      if (xhr.readyState === FakeXMLHttpRequest.DONE) {
        copyAttrs(["responseXML"]);
        FakeXMLHttpRequest.onResponseEnd(fakeXhr);
      }
      if (fakeXhr.onreadystatechange) {
        fakeXhr.onreadystatechange.call(fakeXhr, { target: fakeXhr });
      }
    };

    if (xhr.addEventListener) {
      for (var event in fakeXhr.eventListeners) {
        if (fakeXhr.eventListeners.hasOwnProperty(event)) {

          /*eslint-disable no-loop-func*/
          each(fakeXhr.eventListeners[event], function (handler) {
            xhr.addEventListener(event, handler);
          });
          /*eslint-enable no-loop-func*/
        }
      }
      xhr.addEventListener("readystatechange", stateChange);
    } else {
      xhr.onreadystatechange = stateChange;
    }
    apply(xhr, "open", xhrArgs);
  };
  FakeXMLHttpRequest.useFilters = false;

  function verifyRequestOpened(xhr) {
    if (xhr.readyState !== FakeXMLHttpRequest.OPENED) {
      throw new Error("INVALID_STATE_ERR - " + xhr.readyState);
    }
  }

  function verifyRequestSent(xhr) {
    if (xhr.readyState === FakeXMLHttpRequest.DONE) {
      throw new Error("Request done");
    }
  }

  function verifyHeadersReceived(xhr) {
    if (xhr.async && xhr.readyState !== FakeXMLHttpRequest.HEADERS_RECEIVED) {
      throw new Error("No headers received");
    }
  }

  function verifyResponseBodyType(body) {
    if (typeof body !== "string") {
      var error = new Error("Attempted to respond to fake XMLHttpRequest with " +
          body + ", which is not a string.");
      error.name = "InvalidBodyException";
      throw error;
    }
  }

  function convertToArrayBuffer(body) {
    var buffer = new ArrayBuffer(body.length);
    var view = new Uint8Array(buffer);
    for (var i = 0; i < body.length; i++) {
      var charCode = body.charCodeAt(i);
      if (charCode >= 256) {
        throw new TypeError("arraybuffer or blob responseTypes require binary string, " +
            "invalid character " + body[i] + " found.");
      }
      view[i] = charCode;
    }
    return buffer;
  }

  function isXmlContentType(contentType) {
    return !contentType || /(text\/xml)|(application\/xml)|(\+xml)/.test(contentType);
  }

  function convertResponseBody(responseType, contentType, body) {
    if (responseType === "" || responseType === "text") {
      return body;
    } else if (supportsArrayBuffer && responseType === "arraybuffer") {
      return convertToArrayBuffer(body);
    } else if (responseType === "json") {
      try {
        return JSON.parse(body);
      } catch (e) {
        // Return parsing failure as null
        return null;
      }
    } else if (supportsBlob && responseType === "blob") {
      var blobOptions = {};
      if (contentType) {
        blobOptions.type = contentType;
      }
      return new Blob([convertToArrayBuffer(body)], blobOptions);
    } else if (responseType === "document") {
      if (isXmlContentType(contentType)) {
        return FakeXMLHttpRequest.parseXML(body);
      }
      return null;
    }
    throw new Error("Invalid responseType " + responseType);
  }

  function clearResponse(xhr) {
    if (xhr.responseType === "" || xhr.responseType === "text") {
      xhr.response = xhr.responseText = "";
    } else {
      xhr.response = xhr.responseText = null;
    }
    xhr.responseXML = null;
  }

  FakeXMLHttpRequest.parseXML = function parseXML(text) {
    // Treat empty string as parsing failure
    if (text !== "") {
      try {
        if (typeof DOMParser !== "undefined") {
          var parser = new DOMParser();
          return parser.parseFromString(text, "text/xml");
        }
        var xmlDoc = new window.ActiveXObject("Microsoft.XMLDOM");
        xmlDoc.async = "false";
        xmlDoc.loadXML(text);
        return xmlDoc;
      } catch (e) {
        // Unable to parse XML - no biggie
      }
    }

    return null;
  };

  FakeXMLHttpRequest.statusCodes = {
    100: "Continue",
    101: "Switching Protocols",
    200: "OK",
    201: "Created",
    202: "Accepted",
    203: "Non-Authoritative Information",
    204: "No Content",
    205: "Reset Content",
    206: "Partial Content",
    207: "Multi-Status",
    300: "Multiple Choice",
    301: "Moved Permanently",
    302: "Found",
    303: "See Other",
    304: "Not Modified",
    305: "Use Proxy",
    307: "Temporary Redirect",
    400: "Bad Request",
    401: "Unauthorized",
    402: "Payment Required",
    403: "Forbidden",
    404: "Not Found",
    405: "Method Not Allowed",
    406: "Not Acceptable",
    407: "Proxy Authentication Required",
    408: "Request Timeout",
    409: "Conflict",
    410: "Gone",
    411: "Length Required",
    412: "Precondition Failed",
    413: "Request Entity Too Large",
    414: "Request-URI Too Long",
    415: "Unsupported Media Type",
    416: "Requested Range Not Satisfiable",
    417: "Expectation Failed",
    422: "Unprocessable Entity",
    500: "Internal Server Error",
    501: "Not Implemented",
    502: "Bad Gateway",
    503: "Service Unavailable",
    504: "Gateway Timeout",
    505: "HTTP Version Not Supported"
  };

  function makeApi(sinon) {
    sinon.xhr = sinonXhr;

    sinon.extend(FakeXMLHttpRequest.prototype, sinon.EventTarget, {
      async: true,

      open: function open(method, url, async, username, password) {
        this.method = method;
        this.url = url;
        this.async = typeof async === "boolean" ? async : true;
        this.username = username;
        this.password = password;
        clearResponse(this);
        this.requestHeaders = {};
        this.sendFlag = false;

        if (FakeXMLHttpRequest.useFilters === true) {
          var xhrArgs = arguments;
          var defake = some(FakeXMLHttpRequest.filters, function (filter) {
            return filter.apply(this, xhrArgs);
          });
          if (defake) {
            return FakeXMLHttpRequest.defake(this, arguments);
          }
        }
        this.readyStateChange(FakeXMLHttpRequest.OPENED);
      },

      readyStateChange: function readyStateChange(state) {
        this.readyState = state;

        var readyStateChangeEvent = new sinon.Event("readystatechange", false, false, this);

        if (typeof this.onreadystatechange === "function") {
          try {
            this.onreadystatechange(readyStateChangeEvent);
          } catch (e) {
            sinon.logError("Fake XHR onreadystatechange handler", e);
          }
        }

        switch (this.readyState) {
          case FakeXMLHttpRequest.DONE:
            if (supportsProgress) {
              this.upload.dispatchEvent(new sinon.ProgressEvent("progress", {loaded: 100, total: 100}));
              this.dispatchEvent(new sinon.ProgressEvent("progress", {loaded: 100, total: 100}));
            }
            this.upload.dispatchEvent(new sinon.Event("load", false, false, this));
            this.dispatchEvent(new sinon.Event("load", false, false, this));
            this.dispatchEvent(new sinon.Event("loadend", false, false, this));
            break;
        }

        this.dispatchEvent(readyStateChangeEvent);
      },

      setRequestHeader: function setRequestHeader(header, value) {
        verifyState(this);

        if (unsafeHeaders[header] || /^(Sec-|Proxy-)/.test(header)) {
          throw new Error("Refused to set unsafe header \"" + header + "\"");
        }

        if (this.requestHeaders[header]) {
          this.requestHeaders[header] += "," + value;
        } else {
          this.requestHeaders[header] = value;
        }
      },

      // Helps testing
      setResponseHeaders: function setResponseHeaders(headers) {
        verifyRequestOpened(this);
        this.responseHeaders = {};

        for (var header in headers) {
          if (headers.hasOwnProperty(header)) {
            this.responseHeaders[header] = headers[header];
          }
        }

        if (this.async) {
          this.readyStateChange(FakeXMLHttpRequest.HEADERS_RECEIVED);
        } else {
          this.readyState = FakeXMLHttpRequest.HEADERS_RECEIVED;
        }
      },

      // Currently treats ALL data as a DOMString (i.e. no Document)
      send: function send(data) {
        verifyState(this);

        if (!/^(get|head)$/i.test(this.method)) {
          var contentType = getHeader(this.requestHeaders, "Content-Type");
          if (this.requestHeaders[contentType]) {
            var value = this.requestHeaders[contentType].split(";");
            this.requestHeaders[contentType] = value[0] + ";charset=utf-8";
          } else if (supportsFormData && !(data instanceof FormData)) {
            this.requestHeaders["Content-Type"] = "text/plain;charset=utf-8";
          }

          this.requestBody = data;
        }

        this.errorFlag = false;
        this.sendFlag = this.async;
        clearResponse(this);
        this.readyStateChange(FakeXMLHttpRequest.OPENED);

        if (typeof this.onSend === "function") {
          this.onSend(this);
        }

        this.dispatchEvent(new sinon.Event("loadstart", false, false, this));
      },

      abort: function abort() {
        this.aborted = true;
        clearResponse(this);
        this.errorFlag = true;
        this.requestHeaders = {};
        this.responseHeaders = {};

        if (this.readyState > FakeXMLHttpRequest.UNSENT && this.sendFlag) {
          this.readyStateChange(FakeXMLHttpRequest.DONE);
          this.sendFlag = false;
        }

        this.readyState = FakeXMLHttpRequest.UNSENT;

        this.dispatchEvent(new sinon.Event("abort", false, false, this));

        this.upload.dispatchEvent(new sinon.Event("abort", false, false, this));

        if (typeof this.onerror === "function") {
          this.onerror();
        }
      },

      getResponseHeader: function getResponseHeader(header) {
        if (this.readyState < FakeXMLHttpRequest.HEADERS_RECEIVED) {
          return null;
        }

        if (/^Set-Cookie2?$/i.test(header)) {
          return null;
        }

        header = getHeader(this.responseHeaders, header);

        return this.responseHeaders[header] || null;
      },

      getAllResponseHeaders: function getAllResponseHeaders() {
        if (this.readyState < FakeXMLHttpRequest.HEADERS_RECEIVED) {
          return "";
        }

        var headers = "";

        for (var header in this.responseHeaders) {
          if (this.responseHeaders.hasOwnProperty(header) &&
              !/^Set-Cookie2?$/i.test(header)) {
            headers += header + ": " + this.responseHeaders[header] + "\r\n";
          }
        }

        return headers;
      },

      setResponseBody: function setResponseBody(body) {
        verifyRequestSent(this);
        verifyHeadersReceived(this);
        verifyResponseBodyType(body);
        var contentType = this.getResponseHeader("Content-Type");

        var isTextResponse = this.responseType === "" || this.responseType === "text";
        clearResponse(this);
        if (this.async) {
          var chunkSize = this.chunkSize || 10;
          var index = 0;

          do {
            this.readyStateChange(FakeXMLHttpRequest.LOADING);

            if (isTextResponse) {
              this.responseText = this.response += body.substring(index, index + chunkSize);
            }
            index += chunkSize;
          } while (index < body.length);
        }

        this.response = convertResponseBody(this.responseType, contentType, body);
        if (isTextResponse) {
          this.responseText = this.response;
        }

        if (this.responseType === "document") {
          this.responseXML = this.response;
        } else if (this.responseType === "" && isXmlContentType(contentType)) {
          this.responseXML = FakeXMLHttpRequest.parseXML(this.responseText);
        }
        this.readyStateChange(FakeXMLHttpRequest.DONE);
      },

      respond: function respond(status, headers, body) {
        this.status = typeof status === "number" ? status : 200;
        this.statusText = FakeXMLHttpRequest.statusCodes[this.status];
        this.setResponseHeaders(headers || {});
        this.setResponseBody(body || "");
      },

      uploadProgress: function uploadProgress(progressEventRaw) {
        if (supportsProgress) {
          this.upload.dispatchEvent(new sinon.ProgressEvent("progress", progressEventRaw));
        }
      },

      downloadProgress: function downloadProgress(progressEventRaw) {
        if (supportsProgress) {
          this.dispatchEvent(new sinon.ProgressEvent("progress", progressEventRaw));
        }
      },

      uploadError: function uploadError(error) {
        if (supportsCustomEvent) {
          this.upload.dispatchEvent(new sinon.CustomEvent("error", {detail: error}));
        }
      }
    });

    sinon.extend(FakeXMLHttpRequest, {
      UNSENT: 0,
      OPENED: 1,
      HEADERS_RECEIVED: 2,
      LOADING: 3,
      DONE: 4
    });

    sinon.useFakeXMLHttpRequest = function () {
      FakeXMLHttpRequest.restore = function restore(keepOnCreate) {
        if (sinonXhr.supportsXHR) {
          global.XMLHttpRequest = sinonXhr.GlobalXMLHttpRequest;
        }

        if (sinonXhr.supportsActiveX) {
          global.ActiveXObject = sinonXhr.GlobalActiveXObject;
        }

        delete FakeXMLHttpRequest.restore;

        if (keepOnCreate !== true) {
          delete FakeXMLHttpRequest.onCreate;
        }
      };
      if (sinonXhr.supportsXHR) {
        global.XMLHttpRequest = FakeXMLHttpRequest;
      }

      if (sinonXhr.supportsActiveX) {
        global.ActiveXObject = function ActiveXObject(objId) {
          if (objId === "Microsoft.XMLHTTP" || /^Msxml2\.XMLHTTP/i.test(objId)) {

            return new FakeXMLHttpRequest();
          }

          return new sinonXhr.GlobalActiveXObject(objId);
        };
      }

      return FakeXMLHttpRequest;
    };

    sinon.FakeXMLHttpRequest = FakeXMLHttpRequest;
  }

  var isNode = typeof module !== "undefined" && module.exports && typeof require === "function";
  var isAMD = typeof define === "function" && typeof define.amd === "object" && define.amd;

  function loadDependencies(require, exports, module) {
    var sinon = require("./core");
    require("../extend");
    require("./event");
    require("../log_error");
    makeApi(sinon);
    module.exports = sinon;
  }

  if (isAMD) {
    define(loadDependencies);
    return;
  }

  if (isNode) {
    loadDependencies(require, module.exports, module);
    return;
  }

  if (sinonGlobal) {
    makeApi(sinonGlobal);
  }
}(
    typeof sinon === "object" && sinon, // eslint-disable-line no-undef
    typeof global !== "undefined" ? global : self
));

/**
 * @depend util/core.js
 */
/**
 * Format functions
 *
 * @author Christian Johansen (christian@cjohansen.no)
 * @license BSD
 *
 * Copyright (c) 2010-2014 Christian Johansen
 */
(function (sinonGlobal, formatio) {

  function makeApi(sinon) {
    function valueFormatter(value) {
      return "" + value;
    }

    function getFormatioFormatter() {
      var formatter = formatio.configure({
        quoteStrings: false,
        limitChildrenCount: 250
      });

      function format() {
        return formatter.ascii.apply(formatter, arguments);
      }

      return format;
    }

    function getNodeFormatter() {
      try {
        var util = require("util");
      } catch (e) {
        /* Node, but no util module - would be very old, but better safe than sorry */
      }

      function format(v) {
        var isObjectWithNativeToString = typeof v === "object" && v.toString === Object.prototype.toString;
        return isObjectWithNativeToString ? util.inspect(v) : v;
      }

      return util ? format : valueFormatter;
    }

    var isNode = typeof module !== "undefined" && module.exports && typeof require === "function";
    var formatter;

    if (isNode) {
      try {
        formatio = require("formatio");
      }
      catch (e) {} // eslint-disable-line no-empty
    }

    if (formatio) {
      formatter = getFormatioFormatter();
    } else if (isNode) {
      formatter = getNodeFormatter();
    } else {
      formatter = valueFormatter;
    }

    sinon.format = formatter;
    return sinon.format;
  }

  function loadDependencies(require, exports, module) {
    var sinon = require("./util/core");
    module.exports = makeApi(sinon);
  }

  var isNode = typeof module !== "undefined" && module.exports && typeof require === "function";
  var isAMD = typeof define === "function" && typeof define.amd === "object" && define.amd;

  if (isAMD) {
    define(loadDependencies);
    return;
  }

  if (isNode) {
    loadDependencies(require, module.exports, module);
    return;
  }

  if (sinonGlobal) {
    makeApi(sinonGlobal);
  }
}(
    typeof sinon === "object" && sinon, // eslint-disable-line no-undef
    typeof formatio === "object" && formatio // eslint-disable-line no-undef
));

/**
 * @depend fake_xdomain_request.js
 * @depend fake_xml_http_request.js
 * @depend ../format.js
 * @depend ../log_error.js
 */
/**
 * The Sinon "server" mimics a web server that receives requests from
 * sinon.FakeXMLHttpRequest and provides an API to respond to those requests,
 * both synchronously and asynchronously. To respond synchronuously, canned
 * answers have to be provided upfront.
 *
 * @author Christian Johansen (christian@cjohansen.no)
 * @license BSD
 *
 * Copyright (c) 2010-2013 Christian Johansen
 */
(function () {

  var push = [].push;

  function responseArray(handler) {
    var response = handler;

    if (Object.prototype.toString.call(handler) !== "[object Array]") {
      response = [200, {}, handler];
    }

    if (typeof response[2] !== "string") {
      throw new TypeError("Fake server response body should be string, but was " +
          typeof response[2]);
    }

    return response;
  }

  var wloc = typeof window !== "undefined" ? window.location : {};
  var rCurrLoc = new RegExp("^" + wloc.protocol + "//" + wloc.host);

  function matchOne(response, reqMethod, reqUrl) {
    var rmeth = response.method;
    var matchMethod = !rmeth || rmeth.toLowerCase() === reqMethod.toLowerCase();
    var url = response.url;
    var matchUrl = !url || url === reqUrl || (typeof url.test === "function" && url.test(reqUrl));

    return matchMethod && matchUrl;
  }

  function match(response, request) {
    var requestUrl = request.url;

    if (!/^https?:\/\//.test(requestUrl) || rCurrLoc.test(requestUrl)) {
      requestUrl = requestUrl.replace(rCurrLoc, "");
    }

    if (matchOne(response, this.getHTTPMethod(request), requestUrl)) {
      if (typeof response.response === "function") {
        var ru = response.url;
        var args = [request].concat(ru && typeof ru.exec === "function" ? ru.exec(requestUrl).slice(1) : []);
        return response.response.apply(response, args);
      }

      return true;
    }

    return false;
  }

  function makeApi(sinon) {
    var leoConfiguration = null;
    sinon.fakeServer = {
      create: function (config) {
        var server = sinon.create(this);
        server.configure(config);
        if (!sinon.xhr.supportsCORS) {
          this.xhr = sinon.useFakeXDomainRequest();
        } else {
          this.xhr = sinon.useFakeXMLHttpRequest();
        }
        server.requests = [];

        this.xhr.onCreate = function (xhrObj) {
          server.addRequest(xhrObj);
        };

        return server;
      },
      configure: function (config) {
        var whitelist = {
          "autoRespond": true,
          "autoRespondAfter": true,
          "respondImmediately": true,
          "fakeHTTPMethods": true
        };
        var setting;

        config = config || {};
        for (setting in config) {
          if (whitelist.hasOwnProperty(setting) && config.hasOwnProperty(setting)) {
            this[setting] = config[setting];
          }
        }
      },
      addRequest: function addRequest(xhrObj) {
        var server = this;
        push.call(this.requests, xhrObj);

        xhrObj.onSend = function () {
          server.handleRequest(this);

          if (server.respondImmediately) {
            server.respond();
          } else if (server.autoRespond && !server.responding) {
            var request = this;
            leoConfiguration = leoConfiguration || angular.element(document.body).injector().get('leoConfiguration');
            var state = leoConfiguration.fetchStatesByUrlAndMethod(request.url, request.method);
            var delay;
            if(state && state.activeOption && state.activeOption.hasOwnProperty('delay')) {
              delay = state.activeOption.delay;
            } else {
              delay = server.autoRespondAfter || 10;
            }

            setTimeout(function () {
              server.responding = false;
              server.respond();
            }, delay);

            server.responding = true;
          }
        };
      },

      getHTTPMethod: function getHTTPMethod(request) {
        if (this.fakeHTTPMethods && /post/i.test(request.method)) {
          var matches = (request.requestBody || "").match(/_method=([^\b;]+)/);
          return matches ? matches[1] : request.method;
        }

        return request.method;
      },

      handleRequest: function handleRequest(xhr) {
        if (xhr.async) {
          if (!this.queue) {
            this.queue = [];
          }

          push.call(this.queue, xhr);
        } else {
          this.processRequest(xhr);
        }
      },

      log: function log(response, request) {
        var str;

        str = "Request:\n" + sinon.format(request) + "\n\n";
        str += "Response:\n" + sinon.format(response) + "\n\n";

        sinon.log(str);
      },

      respondWith: function respondWith(method, url, body) {
        if (arguments.length === 1 && typeof method !== "function") {
          this.response = responseArray(method);
          return;
        }

        if (!this.responses) {
          this.responses = [];
        }

        if (arguments.length === 1) {
          body = method;
          url = method = null;
        }

        if (arguments.length === 2) {
          body = url;
          url = method;
          method = null;
        }

        push.call(this.responses, {
          method: method,
          url: url,
          response: typeof body === "function" ? body : responseArray(body)
        });
      },

      respond: function respond() {
        if (arguments.length > 0) {
          this.respondWith.apply(this, arguments);
        }

        var queue = this.queue || [];
        var requests = queue.splice(0, queue.length);

        for (var i = 0; i < requests.length; i++) {
          this.processRequest(requests[i]);
        }
      },

      processRequest: function processRequest(request) {
        try {
          if (request.aborted) {
            return;
          }

          var response = this.response || [404, {}, ""];

          if (this.responses) {
            for (var l = this.responses.length, i = l - 1; i >= 0; i--) {
              if (match.call(this, this.responses[i], request)) {
                response = this.responses[i].response;
                break;
              }
            }
          }

          if (request.readyState !== 4) {
            this.log(response, request);
            request.respond(response[0], response[1], response[2]);
          }
        } catch (e) {
          sinon.logError("Fake server request processing", e);
        }
      },

      restore: function restore() {
        return this.xhr.restore && this.xhr.restore.apply(this.xhr, arguments);
      }
    };
  }

  var isNode = typeof module !== "undefined" && module.exports && typeof require === "function";
  var isAMD = typeof define === "function" && typeof define.amd === "object" && define.amd;

  function loadDependencies(require, exports, module) {
    var sinon = require("./core");
    require("./fake_xdomain_request");
    require("./fake_xml_http_request");
    require("../format");
    makeApi(sinon);
    module.exports = sinon;
  }

  if (isAMD) {
    define(loadDependencies);
  } else if (isNode) {
    loadDependencies(require, module.exports, module);
  } else {
    makeApi(sinon); // eslint-disable-line no-undef
  }
}());

/**
 * Fake timer API
 * setTimeout
 * setInterval
 * clearTimeout
 * clearInterval
 * tick
 * reset
 * Date
 *
 * Inspired by jsUnitMockTimeOut from JsUnit
 *
 * @author Christian Johansen (christian@cjohansen.no)
 * @license BSD
 *
 * Copyright (c) 2010-2013 Christian Johansen
 */
(function () {

  function makeApi(s, lol) {
    /*global lolex */
    var llx = typeof lolex !== "undefined" ? lolex : lol;

    s.useFakeTimers = function () {
      var now;
      var methods = Array.prototype.slice.call(arguments);

      if (typeof methods[0] === "string") {
        now = 0;
      } else {
        now = methods.shift();
      }

      var clock = llx.install(now || 0, methods);
      clock.restore = clock.uninstall;
      return clock;
    };

    s.clock = {
      create: function (now) {
        return llx.createClock(now);
      }
    };

    s.timers = {
      setTimeout: setTimeout,
      clearTimeout: clearTimeout,
      setImmediate: (typeof setImmediate !== "undefined" ? setImmediate : undefined),
      clearImmediate: (typeof clearImmediate !== "undefined" ? clearImmediate : undefined),
      setInterval: setInterval,
      clearInterval: clearInterval,
      Date: Date
    };
  }

  var isNode = typeof module !== "undefined" && module.exports && typeof require === "function";
  var isAMD = typeof define === "function" && typeof define.amd === "object" && define.amd;

  function loadDependencies(require, epxorts, module, lolex) {
    var core = require("./core");
    makeApi(core, lolex);
    module.exports = core;
  }

  if (isAMD) {
    define(loadDependencies);
  } else if (isNode) {
    loadDependencies(require, module.exports, module, require("lolex"));
  } else {
    makeApi(sinon); // eslint-disable-line no-undef
  }
}());

/**
 * @depend fake_server.js
 * @depend fake_timers.js
 */
/**
 * Add-on for sinon.fakeServer that automatically handles a fake timer along with
 * the FakeXMLHttpRequest. The direct inspiration for this add-on is jQuery
 * 1.3.x, which does not use xhr object's onreadystatehandler at all - instead,
 * it polls the object for completion with setInterval. Dispite the direct
 * motivation, there is nothing jQuery-specific in this file, so it can be used
 * in any environment where the ajax implementation depends on setInterval or
 * setTimeout.
 *
 * @author Christian Johansen (christian@cjohansen.no)
 * @license BSD
 *
 * Copyright (c) 2010-2013 Christian Johansen
 */
(function () {

  function makeApi(sinon) {
    function Server() {}
    Server.prototype = sinon.fakeServer;

    sinon.fakeServerWithClock = new Server();

    sinon.fakeServerWithClock.addRequest = function addRequest(xhr) {
      if (xhr.async) {
        if (typeof setTimeout.clock === "object") {
          this.clock = setTimeout.clock;
        } else {
          this.clock = sinon.useFakeTimers();
          this.resetClock = true;
        }

        if (!this.longestTimeout) {
          var clockSetTimeout = this.clock.setTimeout;
          var clockSetInterval = this.clock.setInterval;
          var server = this;

          this.clock.setTimeout = function (fn, timeout) {
            server.longestTimeout = Math.max(timeout, server.longestTimeout || 0);

            return clockSetTimeout.apply(this, arguments);
          };

          this.clock.setInterval = function (fn, timeout) {
            server.longestTimeout = Math.max(timeout, server.longestTimeout || 0);

            return clockSetInterval.apply(this, arguments);
          };
        }
      }

      return sinon.fakeServer.addRequest.call(this, xhr);
    };

    sinon.fakeServerWithClock.respond = function respond() {
      var returnVal = sinon.fakeServer.respond.apply(this, arguments);

      if (this.clock) {
        this.clock.tick(this.longestTimeout || 0);
        this.longestTimeout = 0;

        if (this.resetClock) {
          this.clock.restore();
          this.resetClock = false;
        }
      }

      return returnVal;
    };

    sinon.fakeServerWithClock.restore = function restore() {
      if (this.clock) {
        this.clock.restore();
      }

      return sinon.fakeServer.restore.apply(this, arguments);
    };
  }

  var isNode = typeof module !== "undefined" && module.exports && typeof require === "function";
  var isAMD = typeof define === "function" && typeof define.amd === "object" && define.amd;

  function loadDependencies(require) {
    var sinon = require("./core");
    require("./fake_server");
    require("./fake_timers");
    makeApi(sinon);
  }

  if (isAMD) {
    define(loadDependencies);
  } else if (isNode) {
    loadDependencies(require);
  } else {
    makeApi(sinon); // eslint-disable-line no-undef
  }
}());

/*!
 * clipboard.js v1.5.9
 * https://zenorocha.github.io/clipboard.js
 *
 * Licensed MIT © Zeno Rocha
 */
!function(t){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=t();else if("function"==typeof define&&define.amd)define([],t);else{var e;e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:this,e.Clipboard=t()}}(function(){var t,e,n;return function t(e,n,o){function r(c,s){if(!n[c]){if(!e[c]){var a="function"==typeof require&&require;if(!s&&a)return a(c,!0);if(i)return i(c,!0);var l=new Error("Cannot find module '"+c+"'");throw l.code="MODULE_NOT_FOUND",l}var u=n[c]={exports:{}};e[c][0].call(u.exports,function(t){var n=e[c][1][t];return r(n?n:t)},u,u.exports,t,e,n,o)}return n[c].exports}for(var i="function"==typeof require&&require,c=0;c<o.length;c++)r(o[c]);return r}({1:[function(t,e,n){var o=t("matches-selector");e.exports=function(t,e,n){for(var r=n?t:t.parentNode;r&&r!==document;){if(o(r,e))return r;r=r.parentNode}}},{"matches-selector":5}],2:[function(t,e,n){function o(t,e,n,o,i){var c=r.apply(this,arguments);return t.addEventListener(n,c,i),{destroy:function(){t.removeEventListener(n,c,i)}}}function r(t,e,n,o){return function(n){n.delegateTarget=i(n.target,e,!0),n.delegateTarget&&o.call(t,n)}}var i=t("closest");e.exports=o},{closest:1}],3:[function(t,e,n){n.node=function(t){return void 0!==t&&t instanceof HTMLElement&&1===t.nodeType},n.nodeList=function(t){var e=Object.prototype.toString.call(t);return void 0!==t&&("[object NodeList]"===e||"[object HTMLCollection]"===e)&&"length"in t&&(0===t.length||n.node(t[0]))},n.string=function(t){return"string"==typeof t||t instanceof String},n.fn=function(t){var e=Object.prototype.toString.call(t);return"[object Function]"===e}},{}],4:[function(t,e,n){function o(t,e,n){if(!t&&!e&&!n)throw new Error("Missing required arguments");if(!s.string(e))throw new TypeError("Second argument must be a String");if(!s.fn(n))throw new TypeError("Third argument must be a Function");if(s.node(t))return r(t,e,n);if(s.nodeList(t))return i(t,e,n);if(s.string(t))return c(t,e,n);throw new TypeError("First argument must be a String, HTMLElement, HTMLCollection, or NodeList")}function r(t,e,n){return t.addEventListener(e,n),{destroy:function(){t.removeEventListener(e,n)}}}function i(t,e,n){return Array.prototype.forEach.call(t,function(t){t.addEventListener(e,n)}),{destroy:function(){Array.prototype.forEach.call(t,function(t){t.removeEventListener(e,n)})}}}function c(t,e,n){return a(document.body,t,e,n)}var s=t("./is"),a=t("delegate");e.exports=o},{"./is":3,delegate:2}],5:[function(t,e,n){function o(t,e){if(i)return i.call(t,e);for(var n=t.parentNode.querySelectorAll(e),o=0;o<n.length;++o)if(n[o]==t)return!0;return!1}var r=Element.prototype,i=r.matchesSelector||r.webkitMatchesSelector||r.mozMatchesSelector||r.msMatchesSelector||r.oMatchesSelector;e.exports=o},{}],6:[function(t,e,n){function o(t){var e;if("INPUT"===t.nodeName||"TEXTAREA"===t.nodeName)t.focus(),t.setSelectionRange(0,t.value.length),e=t.value;else{t.hasAttribute("contenteditable")&&t.focus();var n=window.getSelection(),o=document.createRange();o.selectNodeContents(t),n.removeAllRanges(),n.addRange(o),e=n.toString()}return e}e.exports=o},{}],7:[function(t,e,n){function o(){}o.prototype={on:function(t,e,n){var o=this.e||(this.e={});return(o[t]||(o[t]=[])).push({fn:e,ctx:n}),this},once:function(t,e,n){function o(){r.off(t,o),e.apply(n,arguments)}var r=this;return o._=e,this.on(t,o,n)},emit:function(t){var e=[].slice.call(arguments,1),n=((this.e||(this.e={}))[t]||[]).slice(),o=0,r=n.length;for(o;r>o;o++)n[o].fn.apply(n[o].ctx,e);return this},off:function(t,e){var n=this.e||(this.e={}),o=n[t],r=[];if(o&&e)for(var i=0,c=o.length;c>i;i++)o[i].fn!==e&&o[i].fn._!==e&&r.push(o[i]);return r.length?n[t]=r:delete n[t],this}},e.exports=o},{}],8:[function(e,n,o){!function(r,i){if("function"==typeof t&&t.amd)t(["module","select"],i);else if("undefined"!=typeof o)i(n,e("select"));else{var c={exports:{}};i(c,r.select),r.clipboardAction=c.exports}}(this,function(t,e){"use strict";function n(t){return t&&t.__esModule?t:{"default":t}}function o(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}var r=n(e),i="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol?"symbol":typeof t},c=function(){function t(t,e){for(var n=0;n<e.length;n++){var o=e[n];o.enumerable=o.enumerable||!1,o.configurable=!0,"value"in o&&(o.writable=!0),Object.defineProperty(t,o.key,o)}}return function(e,n,o){return n&&t(e.prototype,n),o&&t(e,o),e}}(),s=function(){function t(e){o(this,t),this.resolveOptions(e),this.initSelection()}return t.prototype.resolveOptions=function t(){var e=arguments.length<=0||void 0===arguments[0]?{}:arguments[0];this.action=e.action,this.emitter=e.emitter,this.target=e.target,this.text=e.text,this.trigger=e.trigger,this.selectedText=""},t.prototype.initSelection=function t(){if(this.text&&this.target)throw new Error('Multiple attributes declared, use either "target" or "text"');if(this.text)this.selectFake();else{if(!this.target)throw new Error('Missing required attributes, use either "target" or "text"');this.selectTarget()}},t.prototype.selectFake=function t(){var e=this,n="rtl"==document.documentElement.getAttribute("dir");this.removeFake(),this.fakeHandler=document.body.addEventListener("click",function(){return e.removeFake()}),this.fakeElem=document.createElement("textarea"),this.fakeElem.style.fontSize="12pt",this.fakeElem.style.border="0",this.fakeElem.style.padding="0",this.fakeElem.style.margin="0",this.fakeElem.style.position="fixed",this.fakeElem.style[n?"right":"left"]="-9999px",this.fakeElem.style.top=(window.pageYOffset||document.documentElement.scrollTop)+"px",this.fakeElem.setAttribute("readonly",""),this.fakeElem.value=this.text,document.body.appendChild(this.fakeElem),this.selectedText=(0,r.default)(this.fakeElem),this.copyText()},t.prototype.removeFake=function t(){this.fakeHandler&&(document.body.removeEventListener("click"),this.fakeHandler=null),this.fakeElem&&(document.body.removeChild(this.fakeElem),this.fakeElem=null)},t.prototype.selectTarget=function t(){this.selectedText=(0,r.default)(this.target),this.copyText()},t.prototype.copyText=function t(){var e=void 0;try{e=document.execCommand(this.action)}catch(n){e=!1}this.handleResult(e)},t.prototype.handleResult=function t(e){e?this.emitter.emit("success",{action:this.action,text:this.selectedText,trigger:this.trigger,clearSelection:this.clearSelection.bind(this)}):this.emitter.emit("error",{action:this.action,trigger:this.trigger,clearSelection:this.clearSelection.bind(this)})},t.prototype.clearSelection=function t(){this.target&&this.target.blur(),window.getSelection().removeAllRanges()},t.prototype.destroy=function t(){this.removeFake()},c(t,[{key:"action",set:function t(){var e=arguments.length<=0||void 0===arguments[0]?"copy":arguments[0];if(this._action=e,"copy"!==this._action&&"cut"!==this._action)throw new Error('Invalid "action" value, use either "copy" or "cut"')},get:function t(){return this._action}},{key:"target",set:function t(e){if(void 0!==e){if(!e||"object"!==("undefined"==typeof e?"undefined":i(e))||1!==e.nodeType)throw new Error('Invalid "target" value, use a valid Element');this._target=e}},get:function t(){return this._target}}]),t}();t.exports=s})},{select:6}],9:[function(e,n,o){!function(r,i){if("function"==typeof t&&t.amd)t(["module","./clipboard-action","tiny-emitter","good-listener"],i);else if("undefined"!=typeof o)i(n,e("./clipboard-action"),e("tiny-emitter"),e("good-listener"));else{var c={exports:{}};i(c,r.clipboardAction,r.tinyEmitter,r.goodListener),r.clipboard=c.exports}}(this,function(t,e,n,o){"use strict";function r(t){return t&&t.__esModule?t:{"default":t}}function i(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function c(t,e){if(!t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!e||"object"!=typeof e&&"function"!=typeof e?t:e}function s(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function, not "+typeof e);t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,enumerable:!1,writable:!0,configurable:!0}}),e&&(Object.setPrototypeOf?Object.setPrototypeOf(t,e):t.__proto__=e)}function a(t,e){var n="data-clipboard-"+t;if(e.hasAttribute(n))return e.getAttribute(n)}var l=r(e),u=r(n),f=r(o),d=function(t){function e(n,o){i(this,e);var r=c(this,t.call(this));return r.resolveOptions(o),r.listenClick(n),r}return s(e,t),e.prototype.resolveOptions=function t(){var e=arguments.length<=0||void 0===arguments[0]?{}:arguments[0];this.action="function"==typeof e.action?e.action:this.defaultAction,this.target="function"==typeof e.target?e.target:this.defaultTarget,this.text="function"==typeof e.text?e.text:this.defaultText},e.prototype.listenClick=function t(e){var n=this;this.listener=(0,f.default)(e,"click",function(t){return n.onClick(t)})},e.prototype.onClick=function t(e){var n=e.delegateTarget||e.currentTarget;this.clipboardAction&&(this.clipboardAction=null),this.clipboardAction=new l.default({action:this.action(n),target:this.target(n),text:this.text(n),trigger:n,emitter:this})},e.prototype.defaultAction=function t(e){return a("action",e)},e.prototype.defaultTarget=function t(e){var n=a("target",e);return n?document.querySelector(n):void 0},e.prototype.defaultText=function t(e){return a("text",e)},e.prototype.destroy=function t(){this.listener.destroy(),this.clipboardAction&&(this.clipboardAction.destroy(),this.clipboardAction=null)},e}(u.default);t.exports=d})},{"./clipboard-action":8,"good-listener":4,"tiny-emitter":7}]},{},[9])(9)});

/*! ngclipboard - v1.1.1 - 2016-02-26
 * https://github.com/sachinchoolur/ngclipboard
 * Copyright (c) 2016 Sachin; Licensed MIT */
(function() {
  'use strict';
  var MODULE_NAME = 'ngclipboard';
  var angular, Clipboard;

  // Check for CommonJS support
  if (typeof module === 'object' && module.exports) {
    angular = require('angular');
    Clipboard = require('clipboard');
    module.exports = MODULE_NAME;
  } else {
    angular = window.angular;
    Clipboard = window.Clipboard;
  }

  angular.module(MODULE_NAME, []).directive('ngclipboard', function() {
    return {
      restrict: 'A',
      scope: {
        ngclipboardSuccess: '&',
        ngclipboardError: '&'
      },
      link: function(scope, element) {
        var clipboard = new Clipboard(element[0]);

        clipboard.on('success', function(e) {
          scope.$apply(function () {
            scope.ngclipboardSuccess({
              e: e
            });
          });
        });

        clipboard.on('error', function(e) {
          scope.$apply(function () {
            scope.ngclipboardError({
              e: e
            });
          });
        });

      }
    };
  });
}());
(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
function leoActivator($compile) {
    return {
        restrict: 'A',
        controllerAs: 'leonardo',
        controller: LeoActivator,
        bindToController: true,
        link: function (scope, elem) {
            var el = angular.element('<div ng-click="leonardo.activate()" class="leonardo-activator" ng-if="leonardo.isLeonardoVisible"></div>');
            var win = angular.element([
                '<div class="leonardo-window" ng-if="leonardo.isLeonardoWindowVisible">',
                '<div class="leonardo-header">',
                '<div class="menu">',
                '<ul>',
                '<li>LEONARDO</li>',
                '<li ng-class="{ \'leo-selected-tab\': leonardo.activeTab === \'scenarios\' }" ng-click="leonardo.selectTab(\'scenarios\')">Scenarios</li>',
                '<li ng-class="{ \'leo-selected-tab\': leonardo.activeTab === \'recorder\' }" ng-click="leonardo.selectTab(\'recorder\')">Recorder</li>',
                '<li ng-class="{ \'leo-selected-tab\': leonardo.activeTab === \'export\' }" ng-click="leonardo.selectTab(\'export\')">Exported Code</li>',
                '</ul>',
                '</div>',
                '</div>',
                '<leo-window-body></leo-window-body>',
                '</div>',
                '</div>'
            ].join(''));
            $compile(el)(scope);
            $compile(win)(scope);
            elem.append(el);
            elem.append(win);
        }
    };
}
exports.leoActivator = leoActivator;
leoActivator.$inject = ['$compile'];
var LeoActivator = (function () {
    function LeoActivator($scope, $document, $timeout) {
        var _this = this;
        this.$document = $document;
        this.$timeout = $timeout;
        this.isLeonardoVisible = true;
        this.isLeonardoWindowVisible = false;
        this.activeTab = 'scenarios';
        $document.on('keypress', function (e) {
            if (e.shiftKey && e.ctrlKey) {
                switch (e.keyCode) {
                    case 12:
                        _this.isLeonardoVisible = !_this.isLeonardoVisible;
                        break;
                    case 11:
                        _this.activate();
                        break;
                    default:
                        break;
                }
                $scope.$apply();
            }
        });
    }
    LeoActivator.prototype.selectTab = function (name) {
        this.activeTab = name;
    };
    LeoActivator.prototype.activate = function () {
        var _this = this;
        this.isLeonardoWindowVisible = !this.isLeonardoWindowVisible;
        if (this.isLeonardoWindowVisible) {
            this.$timeout(function () {
                _this.$document[0].getElementById('filter').focus();
            }, 0);
        }
    };
    LeoActivator.$inject = ['$scope', '$document', '$timeout'];
    return LeoActivator;
})();

},{}],2:[function(require,module,exports){
leoConfiguration.$inject = ['leoStorage', '$rootScope'];
function leoConfiguration(leoStorage, $rootScope) {
    var _states = [], _scenarios = {}, _requestsLog = [], _savedStates = [];
    return {
        addState: addState,
        addStates: addStates,
        getActiveStateOption: getActiveStateOption,
        getStates: fetchStates,
        deactivateState: deactivateState,
        deactivateAllStates: deactivateAll,
        activateStateOption: activateStateOption,
        addScenario: addScenario,
        addScenarios: addScenarios,
        getScenario: getScenario,
        getScenarios: getScenarios,
        setActiveScenario: setActiveScenario,
        getRecordedStates: getRecordedStates,
        getRequestsLog: getRequestsLog,
        loadSavedStates: loadSavedStates,
        addSavedState: addSavedState,
        addOrUpdateSavedState: addOrUpdateSavedState,
        fetchStatesByUrlAndMethod: fetchStatesByUrlAndMethod,
        removeState: removeState,
        removeOption: removeOption,
        _logRequest: logRequest
    };
    function upsertOption(state, name, active) {
        var statesStatus = leoStorage.getStates();
        statesStatus[state] = {
            name: name || findStateOption(state).name,
            active: active
        };
        leoStorage.setStates(statesStatus);
    }
    function fetchStatesByUrlAndMethod(url, method) {
        return fetchStates().filter(function (state) {
            return state.url && new RegExp(state.url).test(url) && state.verb.toLowerCase() === method.toLowerCase();
        })[0];
    }
    function fetchStates() {
        var activeStates = leoStorage.getStates();
        var statesCopy = _states.map(function (state) {
            return angular.copy(state);
        });
        statesCopy.forEach(function (state) {
            var option = activeStates[state.name];
            state.active = !!option && option.active;
            state.activeOption = !!option ?
                state.options.filter(function (_option) {
                    return _option.name === option.name;
                })[0] : state.options[0];
        });
        return statesCopy;
    }
    function deactivateAll() {
        var statesStatus = leoStorage.getStates();
        Object.keys(statesStatus).forEach(function (stateKey) {
            statesStatus[stateKey].active = false;
        });
        leoStorage.setStates(statesStatus);
    }
    function findStateOption(name) {
        return fetchStates().filter(function (state) {
            return state.name === name;
        })[0].activeOption;
    }
    function getActiveStateOption(name) {
        var state = fetchStates().filter(function (state) {
            return state.name === name;
        })[0];
        return (state && state.active && findStateOption(name)) || null;
    }
    function addState(stateObj, overrideOption) {
        stateObj.options.forEach(function (option) {
            upsert({
                state: stateObj.name,
                url: stateObj.url,
                verb: stateObj.verb,
                name: option.name,
                from_local: !!overrideOption,
                status: option.status,
                data: option.data,
                delay: option.delay
            }, overrideOption);
        });
        $rootScope.$broadcast('leonardo:stateChanged', stateObj);
    }
    function addStates(statesArr, overrideOption) {
        if (overrideOption === void 0) { overrideOption = false; }
        if (angular.isArray(statesArr)) {
            statesArr.forEach(function (stateObj) {
                addState(stateObj, overrideOption);
            });
        }
        else {
            console.warn('leonardo: addStates should get an array');
        }
    }
    function upsert(configObj, overrideOption) {
        var verb = configObj.verb || 'GET', state = configObj.state, name = configObj.name, from_local = configObj.from_local, url = configObj.url, status = configObj.status || 200, data = angular.isDefined(configObj.data) ? configObj.data : {}, delay = configObj.delay || 0;
        var defaultState = {};
        var defaultOption = {};
        if (!state) {
            console.log("leonardo: cannot upsert - state is mandatory");
            return;
        }
        var stateItem = _states.filter(function (_state) {
            return _state.name === state;
        })[0] || defaultState;
        angular.extend(stateItem, {
            name: state,
            url: url || stateItem.url,
            verb: verb,
            options: stateItem.options || []
        });
        if (stateItem === defaultState) {
            _states.push(stateItem);
        }
        var option = stateItem.options.filter(function (_option) {
            return _option.name === name;
        })[0];
        if (overrideOption && option) {
            angular.extend(option, {
                name: name,
                from_local: from_local,
                status: status,
                data: data,
                delay: delay
            });
        }
        else if (!option) {
            angular.extend(defaultOption, {
                name: name,
                from_local: from_local,
                status: status,
                data: data,
                delay: delay
            });
            stateItem.options.push(defaultOption);
        }
    }
    function addScenario(scenario) {
        if (scenario && typeof scenario.name === 'string') {
            _scenarios[scenario.name] = scenario;
        }
        else {
            throw 'addScenario method expects a scenario object with name property';
        }
    }
    function addScenarios(scenarios) {
        angular.forEach(scenarios, addScenario);
    }
    function getScenarios() {
        return Object.keys(_scenarios);
    }
    function getScenario(name) {
        if (!_scenarios[name]) {
            return;
        }
        return _scenarios[name].states;
    }
    function setActiveScenario(name) {
        var scenario = getScenario(name);
        if (!scenario) {
            console.warn("leonardo: could not find scenario named " + name);
            return;
        }
        deactivateAll();
        scenario.forEach(function (state) {
            upsertOption(state.name, state.option, true);
        });
    }
    function activateStateOption(state, optionName) {
        upsertOption(state, optionName, true);
    }
    function deactivateState(state) {
        upsertOption(state, null, false);
    }
    function logRequest(method, url, data, status) {
        if (method && url && !(url.indexOf(".html") > 0)) {
            var req = {
                verb: method,
                data: data,
                url: url.trim(),
                status: status,
                timestamp: new Date()
            };
            req.state = fetchStatesByUrlAndMethod(req.url, req.verb);
            _requestsLog.push(req);
        }
    }
    function getRequestsLog() {
        return _requestsLog;
    }
    function loadSavedStates() {
        _savedStates = leoStorage.getSavedStates();
        addStates(_savedStates, true);
    }
    function addSavedState(state) {
        _savedStates.push(state);
        leoStorage.setSavedStates(_savedStates);
        addState(state, true);
    }
    function addOrUpdateSavedState(state) {
        var option = state.activeOption;
        var _savedState = _savedStates.filter(function (_state) {
            return _state.name === state.name;
        })[0];
        if (_savedState) {
            var _savedOption = _savedState.options.filter(function (_option) {
                return _option.name === option.name;
            })[0];
            if (_savedOption) {
                _savedOption.status = option.status;
                _savedOption.delay = option.delay;
                _savedOption.data = option.data;
            }
            else {
                _savedState.options.push(option);
            }
            leoStorage.setSavedStates(_savedStates);
        }
        else {
            addSavedState(state);
        }
        var _state = _states.filter(function (__state) {
            return __state.name === state.name;
        })[0];
        if (_state) {
            var _option = _state.options.filter(function (__option) {
                return __option.name === option.name;
            })[0];
            if (_option) {
                _option.status = option.status;
                _option.delay = option.delay;
                _option.data = option.data;
            }
            else {
                _state.options.push(option);
            }
            $rootScope.$broadcast('leonardo:stateChanged', _state);
        }
    }
    function removeStateByName(name) {
        var index = 0;
        _states.forEach(function (state, i) {
            if (state.name === name) {
                index = i;
            }
        });
        _states.splice(index, 1);
    }
    function removeSavedStateByName(name) {
        var index = 0;
        _savedStates.forEach(function (state, i) {
            if (state.name === name) {
                index = i;
            }
        });
        _savedStates.splice(index, 1);
    }
    function removeState(state) {
        removeStateByName(state.name);
        removeSavedStateByName(state.name);
        leoStorage.setSavedStates(_savedStates);
    }
    function removeStateOptionByName(stateName, optionName) {
        var sIndex = null;
        var oIndex = null;
        _states.forEach(function (state, i) {
            if (state.name === stateName) {
                sIndex = i;
            }
        });
        if (sIndex !== null) {
            _states[sIndex].options.forEach(function (option, i) {
                if (option.name === optionName) {
                    oIndex = i;
                }
            });
            if (oIndex !== null) {
                _states[sIndex].options.splice(oIndex, 1);
            }
        }
    }
    function removeSavedStateOptionByName(stateName, optionName) {
        var sIndex = null;
        var oIndex = null;
        _savedStates.forEach(function (state, i) {
            if (state.name === stateName) {
                sIndex = i;
            }
        });
        if (sIndex !== null) {
            _savedStates[sIndex].options.forEach(function (option, i) {
                if (option.name === optionName) {
                    oIndex = i;
                }
            });
            if (oIndex !== null) {
                _savedStates[sIndex].options.splice(oIndex, 1);
            }
        }
    }
    function removeOption(state, option) {
        removeStateOptionByName(state.name, option.name);
        removeSavedStateOptionByName(state.name, option.name);
        leoStorage.setSavedStates(_savedStates);
        activateStateOption(_states[0].name, _states[0].options[0].name);
    }
    function getRecordedStates() {
        var requestsArr = _requestsLog
            .map(function (req) {
            var state = fetchStatesByUrlAndMethod(req.url, req.verb);
            return {
                name: state ? state.name : req.verb + " " + req.url,
                verb: req.verb,
                url: req.url,
                options: [{
                        name: req.status >= 200 && req.status < 300 ? 'Success' : 'Failure',
                        status: req.status,
                        data: req.data
                    }]
            };
        });
        console.log(angular.toJson(requestsArr, true));
        return requestsArr;
    }
}
exports.leoConfiguration = leoConfiguration;

},{}],3:[function(require,module,exports){
function jsonFormatter() {
    return {
        restrict: 'E',
        scope: {
            jsonString: '=',
            onError: '&',
            onSuccess: '&'
        },
        controller: JsonFormatterCtrl,
        bindToController: true,
        controllerAs: 'leoJsonFormatterCtrl',
        template: '<textarea ng-model="leoJsonFormatterCtrl.jsonString" ng-change="leoJsonFormatterCtrl.valueChanged()" />'
    };
}
exports.jsonFormatter = jsonFormatter;
;
var JsonFormatterCtrl = (function () {
    function JsonFormatterCtrl($scope) {
        $scope.$watch('jsonString', function () {
            this.valueChanged();
        }.bind(this));
    }
    JsonFormatterCtrl.prototype.valueChanged = function () {
        try {
            JSON.parse(this.jsonString);
            this.onSuccess({ value: this.jsonString });
        }
        catch (e) {
            this.onError({ msg: e.message });
        }
    };
    ;
    JsonFormatterCtrl.$inject = ['$scope'];
    return JsonFormatterCtrl;
})();

},{}],4:[function(require,module,exports){
var LeonardoProvider = (function () {
    function LeonardoProvider() {
        this.prefix = '';
        this.$get = [function leonardoProvider() {
                var _this = this;
                return {
                    getAppPrefix: function () {
                        return _this.prefix;
                    }
                };
            }];
    }
    LeonardoProvider.prototype.setAppPrefix = function (prefix) {
        if (prefix === void 0) { prefix = ''; }
        this.prefix = prefix;
    };
    ;
    return LeonardoProvider;
})();
exports.LeonardoProvider = LeonardoProvider;

},{}],5:[function(require,module,exports){
var activator_drv_1 = require('./activator.drv');
var configuration_srv_1 = require('./configuration.srv');
var leonardo_prov_1 = require('./leonardo.prov');
var request_drv_1 = require('./request.drv');
var select_drv_1 = require('./select.drv');
var state_item_drv_1 = require('./state-item.drv');
var storage_srv_1 = require('./storage.srv');
var leo_json_formatter_drv_1 = require('./leo-json-formatter.drv');
var window_body_drv_1 = require('./window-body.drv');
angular.module('leonardo', ['leonardo.templates', 'ngclipboard'])
    .directive('leoActivator', activator_drv_1.leoActivator)
    .directive('leoRequest', request_drv_1.leoRequest)
    .directive('leoSelect', select_drv_1.leoSelect)
    .directive('leoStateItem', state_item_drv_1.leoStateItem)
    .directive('leoJsonFormatter', leo_json_formatter_drv_1.jsonFormatter)
    .directive('leoWindowBody', window_body_drv_1.windowBodyDirective)
    .service('leoStorage', storage_srv_1.Storage)
    .factory('leoConfiguration', configuration_srv_1.leoConfiguration)
    .provider('$leonardo', leonardo_prov_1.LeonardoProvider)
    .run([
    'leoConfiguration',
    '$document',
    '$rootScope',
    '$compile',
    '$timeout', function (leoConfiguration, $document, $rootScope, $compile, $timeout) {
        var server = sinon.fakeServer.create({
            autoRespond: true,
            autoRespondAfter: 10
        });
        sinon.FakeXMLHttpRequest.useFilters = true;
        sinon.FakeXMLHttpRequest.addFilter(function (method, url) {
            if (url.indexOf('.html') > 0 && url.indexOf('template') >= 0) {
                return true;
            }
            var state = leoConfiguration.fetchStatesByUrlAndMethod(url, method);
            return !(state && state.active);
        });
        sinon.FakeXMLHttpRequest.onResponseEnd = function (xhr) {
            var res = xhr.response;
            try {
                res = JSON.parse(xhr.response);
            }
            catch (e) { }
            leoConfiguration._logRequest(xhr.method, xhr.url, res, xhr.status);
        };
        server.respondWith(function (request) {
            var state = leoConfiguration.fetchStatesByUrlAndMethod(request.url, request.method), activeOption = leoConfiguration.getActiveStateOption(state.name);
            if (!!activeOption) {
                var responseData = angular.isFunction(activeOption.data) ? activeOption.data(request) : activeOption.data;
                request.respond(activeOption.status, { "Content-Type": "application/json" }, JSON.stringify(responseData));
                leoConfiguration._logRequest(request.method, request.url, responseData, activeOption.status);
            }
            else {
                console.warn('could not find a state for the following request', request);
            }
        });
        leoConfiguration.loadSavedStates();
        var el = $compile('<div leo-activator></div>')($rootScope);
        $timeout(function () {
            $document[0].body.appendChild(el[0]);
        });
    }]);
if (typeof module !== "undefined" && typeof exports !== "undefined" && module.exports === exports) {
    module.exports = 'leonardo';
}

},{"./activator.drv":1,"./configuration.srv":2,"./leo-json-formatter.drv":3,"./leonardo.prov":4,"./request.drv":6,"./select.drv":7,"./state-item.drv":8,"./storage.srv":9,"./window-body.drv":10}],6:[function(require,module,exports){
function leoRequest() {
    return {
        restrict: 'E',
        templateUrl: 'request.html',
        scope: {
            request: '=',
            onSelect: '&'
        },
        controllerAs: 'leoRequest',
        bindToController: true,
        controller: LeoRequest
    };
}
exports.leoRequest = leoRequest;
;
var LeoRequest = (function () {
    function LeoRequest() {
    }
    LeoRequest.prototype.select = function () {
        this.onSelect();
    };
    return LeoRequest;
})();

},{}],7:[function(require,module,exports){
function leoSelect() {
    return {
        restrict: 'E',
        templateUrl: 'select.html',
        scope: {
            state: '=',
            onChange: '&',
            onDelete: '&',
            disabled: '&'
        },
        controller: LeoSelectController,
        bindToController: true,
        controllerAs: 'leoSelect',
    };
}
exports.leoSelect = leoSelect;
var LeoSelectController = (function () {
    function LeoSelectController($document, $scope) {
        this.$document = $document;
        this.$scope = $scope;
        this.entityId = ++LeoSelectController.count;
        this.open = false;
        this.scope = null;
    }
    LeoSelectController.prototype.selectOption = function ($event, option) {
        $event.preventDefault();
        $event.stopPropagation();
        this.state.activeOption = option;
        this.open = false;
        this.onChange({ state: this.state });
    };
    ;
    LeoSelectController.prototype.removeOption = function ($event, option) {
        $event.preventDefault();
        $event.stopPropagation();
        this.onDelete({ state: this.state, option: option });
    };
    ;
    LeoSelectController.prototype.toggle = function ($event) {
        if (!this.disabled())
            this.open = !this.open;
        if (this.open)
            this.attachEvent();
    };
    ;
    LeoSelectController.prototype.clickEvent = function (event) {
        var _this = this;
        var className = event.target.getAttribute('class');
        if (!className || className.indexOf('leo-dropdown-entity-' + this.entityId) == -1) {
            this.$scope.$apply(function () {
                _this.open = false;
            });
            this.removeEvent();
        }
    };
    LeoSelectController.prototype.attachEvent = function () {
        this.$document.bind('click', this.clickEvent.bind(this));
    };
    ;
    LeoSelectController.prototype.removeEvent = function () {
        this.$document.unbind('click', this.clickEvent);
    };
    ;
    LeoSelectController.count = 0;
    LeoSelectController.$inject = ['$document', '$scope'];
    return LeoSelectController;
})();

},{}],8:[function(require,module,exports){
function leoStateItem() {
    return {
        restrict: 'E',
        templateUrl: 'state-item.html',
        scope: {
            state: '=',
            ajaxState: '=',
            onOptionChanged: '&',
            onRemoveState: '&',
            onRemoveOption: '&',
            onToggleClick: '&',
            onEditClick: '&'
        },
        controllerAs: 'leoStateItem',
        bindToController: true,
        controller: LeoStateItem
    };
}
exports.leoStateItem = leoStateItem;
var LeoStateItem = (function () {
    function LeoStateItem() {
    }
    LeoStateItem.prototype.toggleClick = function ($event) {
        $event.preventDefault();
        $event.stopPropagation();
        this.onToggleClick({
            state: this.state
        });
    };
    ;
    LeoStateItem.prototype.removeState = function ($event) {
        $event.preventDefault();
        $event.stopPropagation();
        this.onRemoveState({
            state: this.state
        });
    };
    ;
    LeoStateItem.prototype.removeOption = function (state, option) {
        this.onRemoveOption({
            state: state,
            option: option
        });
    };
    ;
    LeoStateItem.prototype.updateState = function (state) {
        this.onOptionChanged({
            state: state
        });
    };
    LeoStateItem.prototype.editClick = function (state$) {
        this.onEditClick({ state$: state$ });
    };
    return LeoStateItem;
})();

},{}],9:[function(require,module,exports){
var Storage = (function () {
    function Storage($rootScope, $window, $leonardo) {
        this.$rootScope = $rootScope;
        this.$window = $window;
        this.$leonardo = $leonardo;
        this.APP_PREFIX = $leonardo.getAppPrefix() + "_";
        this.STATES_STORE_KEY = this.APP_PREFIX + "leonardo-states";
        this.SAVED_STATES_KEY = this.APP_PREFIX + "leonardo-unregistered-states";
    }
    Storage.prototype._getItem = function (key) {
        var item = this.$window.localStorage.getItem(key);
        if (!item) {
            return null;
        }
        return angular.fromJson(item);
    };
    Storage.prototype._setItem = function (key, data) {
        this.$window.localStorage.setItem(key, angular.toJson(data));
    };
    Storage.prototype.getStates = function () {
        return this._getItem(this.STATES_STORE_KEY) || {};
    };
    Storage.prototype.setStates = function (states) {
        this._setItem(this.STATES_STORE_KEY, states);
        this.$rootScope.$emit('leonardo:setStates');
    };
    Storage.prototype.getSavedStates = function () {
        var states = this._getItem(this.SAVED_STATES_KEY) || [];
        states.forEach(function (state) {
            state.options.forEach(function (option) {
                option.from_local = true;
            });
        });
        return states;
    };
    Storage.prototype.setSavedStates = function (states) {
        this._setItem(this.SAVED_STATES_KEY, states);
    };
    Storage.$inject = ['$rootScope', '$window', '$leonardo'];
    return Storage;
})();
exports.Storage = Storage;
;

},{}],10:[function(require,module,exports){
windowBodyDirective.$inject = ['$http', 'leoConfiguration'];
function windowBodyDirective($http, leoConfiguration) {
    return {
        restrict: 'E',
        templateUrl: 'window-body.html',
        scope: true,
        controller: LeoWindowBody,
        bindToController: true,
        controllerAs: 'leoWindowBody',
        require: ['^leoActivator', 'leoWindowBody'],
        link: function (scope, el, attr, controllers) {
            var leoActivator = controllers[0];
            var leoWindowBody = controllers[1];
            leoWindowBody.hasActiveOption = function () {
                return this.requests.filter(function (request) {
                    return !!request.active;
                }).length;
            };
            leoWindowBody.saveUnregisteredState = function () {
                var stateName = this.detail.state;
                leoConfiguration.addSavedState({
                    name: stateName,
                    verb: leoWindowBody.detail._unregisteredState.verb,
                    url: leoWindowBody.detail._unregisteredState.url,
                    options: [
                        {
                            name: leoWindowBody.detail.option,
                            status: leoWindowBody.detail.status,
                            data: leoWindowBody.detail.value,
                            delay: leoWindowBody.detail.delay
                        }
                    ]
                });
                leoActivator.selectTab('scenarios');
            };
            leoWindowBody.test = {
                url: '',
                value: undefined
            };
            leoWindowBody.submit = function (url) {
                leoWindowBody.test.value = undefined;
                leoWindowBody.url = url;
                if (url) {
                    $http.get(url).success(function (res) {
                        leoWindowBody.test.value = res;
                    });
                }
            };
        }
    };
}
exports.windowBodyDirective = windowBodyDirective;
var LeoWindowBody = (function () {
    function LeoWindowBody($scope, leoConfiguration, $timeout) {
        var _this = this;
        this.$scope = $scope;
        this.leoConfiguration = leoConfiguration;
        this.$timeout = $timeout;
        this.detail = {
            option: 'success',
            delay: 0,
            status: 200
        };
        this.states = this.leoConfiguration.getStates();
        this.scenarios = this.leoConfiguration.getScenarios();
        this.requests = this.leoConfiguration.getRequestsLog();
        $scope.$watch('leoWindowBody.detail.value', function (value) {
            if (!value) {
                return;
            }
            try {
                _this.detail.stringValue = value ? JSON.stringify(value, null, 4) : '';
                _this.detail.error = '';
            }
            catch (e) {
                _this.detail.error = e.message;
            }
        });
        $scope.$watch('leoWindowBody.detail.stringValue', function (value) {
            try {
                _this.detail.value = value ? JSON.parse(value) : {};
                _this.detail.error = '';
            }
            catch (e) {
                _this.detail.error = e.message;
            }
        });
        $scope.$on('leonardo:stateChanged', function (event, stateObj) {
            _this.states = leoConfiguration.getStates();
            var state = _this.states.filter(function (state) {
                return state.name === stateObj.name;
            })[0];
            if (state) {
                state.highlight = true;
                $timeout(function () {
                    state.highlight = false;
                }, 3000);
            }
        });
    }
    LeoWindowBody.prototype.removeStateByName = function (name) {
        this.states = this.states.filter(function (state) {
            return state.name !== name;
        });
    };
    ;
    LeoWindowBody.prototype.removeOptionByName = function (stateName, optionName) {
        this.states.forEach(function (state, i) {
            if (state.name === stateName) {
                state.options = state.options.filter(function (option) {
                    return option.name !== optionName;
                });
            }
        });
    };
    ;
    LeoWindowBody.prototype.removeState = function (state) {
        this.leoConfiguration.removeState(state);
        this.removeStateByName(state.name);
    };
    ;
    LeoWindowBody.prototype.removeOption = function (state, option) {
        if (state.options.length === 1) {
            this.removeState(state);
        }
        else {
            this.leoConfiguration.removeOption(state, option);
            this.removeOptionByName(state.name, option.name);
            state.activeOption = state.options[0];
        }
    };
    ;
    LeoWindowBody.prototype.editState = function (state) {
        this.editedState = angular.copy(state);
        this.editedState.dataStringValue = JSON.stringify(this.editedState.activeOption.data);
    };
    ;
    LeoWindowBody.prototype.onEditOptionSuccess = function (str) {
        this.editedState.activeOption.data = JSON.parse(str);
        this.editedState.error = '';
    };
    ;
    LeoWindowBody.prototype.onEditOptionJsonError = function (msg) {
        this.editedState.error = msg;
    };
    ;
    LeoWindowBody.prototype.saveEditedState = function () {
        this.leoConfiguration.addOrUpdateSavedState(this.editedState);
        this.closeEditedState();
    };
    ;
    LeoWindowBody.prototype.closeEditedState = function () {
        this.editedState = null;
    };
    ;
    LeoWindowBody.prototype.notHasUrl = function (option) {
        return !option.url;
    };
    ;
    LeoWindowBody.prototype.hasUrl = function (option) {
        return !!option.url;
    };
    ;
    LeoWindowBody.prototype.deactivate = function () {
        this.states.forEach(function (state) {
            state.active = false;
        });
        this.leoConfiguration.deactivateAllStates();
    };
    ;
    LeoWindowBody.prototype.toggleState = function (state) {
        state.active = !state.active;
        this.updateState(state);
    };
    LeoWindowBody.prototype.updateState = function (state) {
        if (state.active) {
            this.leoConfiguration.activateStateOption(state.name, state.activeOption.name);
        }
        else {
            this.leoConfiguration.deactivateState(state.name);
        }
        if (this.selectedState === state) {
            this.editState(state);
        }
    };
    ;
    LeoWindowBody.prototype.activateScenario = function (scenario) {
        this.activeScenario = scenario;
        this.leoConfiguration.setActiveScenario(scenario);
        this.states = this.leoConfiguration.getStates();
    };
    LeoWindowBody.prototype.stateItemSelected = function (state) {
        if (state === this.selectedState) {
            this.editedState = this.selectedState = null;
        }
        else {
            this.selectedState = state;
            this.editState(state);
        }
    };
    LeoWindowBody.prototype.requestSelect = function (request) {
        var optionName;
        this.requests.forEach(function (request) {
            request.active = false;
        });
        request.active = true;
        if (request.state && request.state.name) {
            optionName = request.state.name + ' option ' + request.state.options.length;
        }
        angular.extend(this.detail, {
            state: (request.state && request.state.name) || '',
            option: optionName || '',
            delay: 0,
            status: request.status || 200,
            stateActive: !!request.state,
            value: request.data || {}
        });
        this.detail._unregisteredState = request;
    };
    LeoWindowBody.prototype.getStatesForExport = function () {
        this.exportStates = this.leoConfiguration.getStates();
    };
    LeoWindowBody.prototype.downloadCode = function () {
        this.codeWrapper = document.getElementById("exportedCode");
        var codeToStr;
        if (this.codeWrapper.innerText) {
            codeToStr = this.codeWrapper.innerText;
        }
        else if (XMLSerializer) {
            codeToStr = new XMLSerializer().serializeToString(this.codeWrapper);
        }
        window.open('data:application/octet-stream;filename=Leonardo-States.txt,' + encodeURIComponent(codeToStr), 'Leonardo-States.txt');
    };
    LeoWindowBody.$inject = ['$scope', 'leoConfiguration', '$timeout'];
    return LeoWindowBody;
})();

},{}]},{},[5])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvbGVvbmFyZG8vYWN0aXZhdG9yLmRydi50cyIsInNyYy9sZW9uYXJkby9jb25maWd1cmF0aW9uLnNydi50cyIsInNyYy9sZW9uYXJkby9sZW8tanNvbi1mb3JtYXR0ZXIuZHJ2LnRzIiwic3JjL2xlb25hcmRvL2xlb25hcmRvLnByb3YudHMiLCJzcmMvbGVvbmFyZG8vbGVvbmFyZG8udHMiLCJzcmMvbGVvbmFyZG8vcmVxdWVzdC5kcnYudHMiLCJzcmMvbGVvbmFyZG8vc2VsZWN0LmRydi50cyIsInNyYy9sZW9uYXJkby9zdGF0ZS1pdGVtLmRydi50cyIsInNyYy9sZW9uYXJkby9zdG9yYWdlLnNydi50cyIsInNyYy9sZW9uYXJkby93aW5kb3ctYm9keS5kcnYudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNNQSxzQkFBNkIsUUFBeUI7SUFFcEQsTUFBTSxDQUFDO1FBQ0wsUUFBUSxFQUFFLEdBQUc7UUFDYixZQUFZLEVBQUUsVUFBVTtRQUN4QixVQUFVLEVBQUUsWUFBWTtRQUN4QixnQkFBZ0IsRUFBRSxJQUFJO1FBQ3RCLElBQUksRUFBRSxVQUFTLEtBQWEsRUFBRSxJQUFzQjtZQUNsRCxJQUFJLEVBQUUsR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDLDBHQUEwRyxDQUFDLENBQUM7WUFDckksSUFBSSxHQUFHLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQztnQkFDMUIsd0VBQXdFO2dCQUN0RSwrQkFBK0I7Z0JBQzdCLG9CQUFvQjtnQkFDbEIsTUFBTTtnQkFDSixtQkFBbUI7Z0JBQ25CLDJJQUEySTtnQkFDM0ksd0lBQXdJO2dCQUN4SSx5SUFBeUk7Z0JBQzNJLE9BQU87Z0JBQ1QsUUFBUTtnQkFDVixRQUFRO2dCQUNSLHFDQUFxQztnQkFDckMsUUFBUTtnQkFDVixRQUFRO2FBQ1AsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUVaLFFBQVEs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TyxDQUFDLEtBQUs7WUFDNUIsS0FBSyxFQUFFLE9BQU8sQ0FBQyxJQUFJLElBQUksRUFBRTtTQUMxQixDQUFDLENBQUM7UUFDSCxJQUFJLENBQUMsTUFBTSxDQUFDLGtCQUFrQixHQUFHLE9BQU8sQ0FBQztJQUMzQyxDQUFDO0lBRUQsMENBQWtCLEdBQWxCO1FBQ0UsSUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsU0FBUyxFQUFFLENBQUM7SUFDeEQsQ0FBQztJQUVELG9DQUFZLEdBQVo7UUFDRSxJQUFJLENBQUMsV0FBVyxHQUFHLFFBQVEsQ0FBQyxjQUFjLENBQUMsY0FBYyxDQUFDLENBQUM7UUFDM0QsSUFBSSxTQUFTLENBQUM7UUFDZCxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQyxDQUFBLENBQUM7WUFDOUIsU0FBUyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUFDO1FBQ3pDLENBQUM7UUFDRCxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsYUFBYSxDQUFDLENBQUEsQ0FBQztZQUN0QixTQUFTLEdBQUcsSUFBSSxhQUFhLEVBQUUsQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDdEUsQ0FBQztRQUNELE1BQU0sQ0FBQyxJQUFJLENBQUMsNkRBQTZELEdBQUcsa0JBQWtCLENBQUMsU0FBUyxDQUFDLEVBQUUscUJBQXFCLENBQUMsQ0FBQztJQUVwSSxDQUFDO0lBbE1NLHFCQUFPLEdBQUcsQ0FBQyxRQUFRLEVBQUUsa0JBQWtCLEVBQUUsVUFBVSxDQUFDLENBQUM7SUFvTTlELG9CQUFDO0FBQUQsQ0F2TkEsQUF1TkMsSUFBQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJpbXBvcnQgSUNvbXBpbGVTZXJ2aWNlID0gYW5ndWxhci5JQ29tcGlsZVNlcnZpY2U7XG5pbXBvcnQgSURpcmVjdGl2ZSA9IGFuZ3VsYXIuSURpcmVjdGl2ZTtcbmltcG9ydCBJQXVnbWVudGVkSlF1ZXJ5ID0gYW5ndWxhci5JQXVnbWVudGVkSlF1ZXJ5O1xuaW1wb3J0IElTY29wZSA9IGFuZ3VsYXIuSVNjb3BlO1xuaW1wb3J0IElEb2N1bWVudFNlcnZpY2UgPSBhbmd1bGFyLklEb2N1bWVudFNlcnZpY2U7XG5cbmV4cG9ydCBmdW5jdGlvbiBsZW9BY3RpdmF0b3IoJGNvbXBpbGU6IElDb21waWxlU2VydmljZSk6SURpcmVjdGl2ZSB7XG5cbiAgcmV0dXJuIHtcbiAgICByZXN0cmljdDogJ0EnLFxuICAgIGNvbnRyb2xsZXJBczogJ2xlb25hcmRvJyxcbiAgICBjb250cm9sbGVyOiBMZW9BY3RpdmF0b3IsXG4gICAgYmluZFRvQ29udHJvbGxlcjogdHJ1ZSxcbiAgICBsaW5rOiBmdW5jdGlvbihzY29wZTogSVNjb3BlLCBlbGVtOiBJQXVnbWVudGVkSlF1ZXJ5KSB7XG4gICAgICB2YXIgZWwgPSBhbmd1bGFyLmVsZW1lbnQoJzxkaXYgbmctY2xpY2s9XCJsZW9uYXJkby5hY3RpdmF0ZSgpXCIgY2xhc3M9XCJsZW9uYXJkby1hY3RpdmF0b3JcIiBuZy1pZj1cImxlb25hcmRvLmlzTGVvbmFyZG9WaXNpYmxlXCI+PC9kaXY+Jyk7XG4gICAgICB2YXIgd2luID0gYW5ndWxhci5lbGVtZW50KFtcbiAgICAgICc8ZGl2IGNsYXNzPVwibGVvbmFyZG8td2luZG93XCIgbmctaWY9XCJsZW9uYXJkby5pc0xlb25hcmRvV2luZG93VmlzaWJsZVwiPicsXG4gICAgICAgICc8ZGl2IGNsYXNzPVwibGVvbmFyZG8taGVhZGVyXCI+JyxcbiAgICAgICAgICAnPGRpdiBjbGFzcz1cIm1lbnVcIj4nLFxuICAgICAgICAgICAgJzx1bD4nLFxuICAgICAgICAgICAgICAnPGxpPkxFT05BUkRPPC9saT4nLFxuICAgICAgICAgICAgICAnPGxpIG5nLWNsYXNzPVwieyBcXCdsZW8tc2VsZWN0ZWQtdGFiXFwnOiBsZW9uYXJkby5hY3RpdmVUYWIgPT09IFxcJ3NjZW5hcmlvc1xcJyB9XCIgbmctY2xpY2s9XCJsZW9uYXJkby5zZWxlY3RUYWIoXFwnc2NlbmFyaW9zXFwnKVwiPlNjZW5hcmlvczwvbGk+JyxcbiAgICAgICAgICAgICAgJzxsaSBuZy1jbGFzcz1cInsgXFwnbGVvLXNlbGVjdGVkLXRhYlxcJzogbGVvbmFyZG8uYWN0aXZlVGFiID09PSBcXCdyZWNvcmRlclxcJyB9XCIgbmctY2xpY2s9XCJsZW9uYXJkby5zZWxlY3RUYWIoXFwncmVjb3JkZXJcXCcpXCI+UmVjb3JkZXI8L2xpPicsXG4gICAgICAgICAgICAgICc8bGkgbmctY2xhc3M9XCJ7IFxcJ2xlby1zZWxlY3RlZC10YWJcXCc6IGxlb25hcmRvLmFjdGl2ZVRhYiA9PT0gXFwnZXhwb3J0XFwnIH1cIiBuZy1jbGljaz1cImxlb25hcmRvLnNlbGVjdFRhYihcXCdleHBvcnRcXCcpXCI+RXhwb3J0ZWQgQ29kZTwvbGk+JyxcbiAgICAgICAgICAgICc8L3VsPicsXG4gICAgICAgICAgJzwvZGl2PicsXG4gICAgICAgICc8L2Rpdj4nLFxuICAgICAgICAnPGxlby13aW5kb3ctYm9keT48L2xlby13aW5kb3ctYm9keT4nLFxuICAgICAgICAnPC9kaXY+JyxcbiAgICAgICc8L2Rpdj4nXG4gICAgICBdLmpvaW4oJycpKTtcblxuICAgICAgJGNvbXBpbGUoZWwpKHNjb3BlKTtcbiAgICAgICRjb21waWxlKHdpbikoc2NvcGUpO1xuXG4gICAgICBlbGVtLmFwcGVuZChlbCk7XG4gICAgICBlbGVtLmFwcGVuZCh3aW4pO1xuXG4gICAgfVxuICB9O1xufVxubGVvQWN0aXZhdG9yLiRpbmplY3QgPSBbJyRjb21waWxlJ107XG5cbmNsYXNzIExlb0FjdGl2YXRvciB7XG4gIGlzTGVvbmFyZG9WaXNpYmxlID0gdHJ1ZTtcbiAgaXNMZW9uYXJkb1dpbmRvd1Zpc2libGUgPSBmYWxzZTtcbiAgYWN0aXZlVGFiID0gJ3NjZW5hcmlvcyc7XG4gIHN0YXRpYyAkaW5qZWN0ID0gWyckc2NvcGUnLCAnJGRvY3VtZW50JywgJyR0aW1lb3V0J107XG4gIGNvbnN0cnVjdG9yICgkc2NvcGUsIHByaXZhdGUgJGRvY3VtZW50LCBwcml2YXRlICR0aW1lb3V0KSB7XG4gICAgJGRvY3VtZW50Lm9uKCdrZXlwcmVzcycsIChlKSA9PiB7XG5cbiAgICAgIGlmIChlLnNoaWZ0S2V5ICYmIGUuY3RybEtleSkge1xuICAgICAgICBzd2l0Y2ggKGUua2V5Q29kZSkge1xuICAgICAgICAgIGNhc2UgMTI6XG4gICAgICAgICAgICB0aGlzLmlzTGVvbmFyZG9WaXNpYmxlID0gIXRoaXMuaXNMZW9uYXJkb1Zpc2libGU7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDExOlxuICAgICAgICAgICAgdGhpcy5hY3RpdmF0ZSgpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgICRzY29wZS4kYXBwbHkoKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIHNlbGVjdFRhYihuYW1lKSB7XG4gICAgdGhpcy5hY3RpdmVUYWIgPSBuYW1lO1xuICB9XG5cbiAgYWN0aXZhdGUoKSB7XG4gICAgdGhpcy5pc0xlb25hcmRvV2luZG93VmlzaWJsZSA9ICF0aGlzLmlzTGVvbmFyZG9XaW5kb3dWaXNpYmxlO1xuICAgIGlmICh0aGlzLmlzTGVvbmFyZG9XaW5kb3dWaXNpYmxlKSB7XG4gICAgICB0aGlzLiR0aW1lb3V0KCgpID0+IHtcbiAgICAgICAgdGhpcy4kZG9jdW1lbnRbMF0uZ2V0RWxlbWVudEJ5SWQoJ2ZpbHRlcicpLmZvY3VzKCk7XG4gICAgICB9LCAwKTtcbiAgICB9XG4gIH1cbn1cbiIsImltcG9ydCBJUm9vdFNjb3BlU2VydmljZSA9IGFuZ3VsYXIuSVJvb3RTY29wZVNlcnZpY2U7XG5cbmxlb0NvbmZpZ3VyYXRpb24uJGluamVjdCA9IFsnbGVvU3RvcmFnZScsICckcm9vdFNjb3BlJ107XG5cbmV4cG9ydCBmdW5jdGlvbiBsZW9Db25maWd1cmF0aW9uIChsZW9TdG9yYWdlLCAkcm9vdFNjb3BlOiBhbnkpIHtcbiAgdmFyIF9zdGF0ZXMgPSBbXSxcbiAgICBfc2NlbmFyaW9zID0ge30sXG4gICAgX3JlcXVlc3RzTG9nID0gW10sXG4gICAgX3NhdmVkU3RhdGVzID0gW107XG5cbiAgLy8gQ29yZSBBUElcbiAgLy8gLS0tLS0tLS0tLS0tLS0tLVxuICByZXR1cm4ge1xuICAgIGFkZFN0YXRlOiBhZGRTdGF0ZSxcbiAgICBhZGRTdGF0ZXM6IGFkZFN0YXRlcyxcbiAgICBnZXRBY3RpdmVTdGF0ZU9wdGlvbjogZ2V0QWN0aXZlU3RhdGVPcHRpb24sXG4gICAgZ2V0U3RhdGVzOiBmZXRjaFN0YXRlcyxcbiAgICBkZWFjdGl2YXRlU3RhdGU6IGRlYWN0aXZhdGVTdGF0ZSxcbiAgICBkZWFjdGl2YXRlQWxsU3RhdGVzOiBkZWFjdGl2YXRlQWxsLFxuICAgIGFjdGl2YXRlU3RhdGVPcHRpb246IGFjdGl2YXRlU3RhdGVPcHRpb24sXG4gICAgYWRkU2NlbmFyaW86IGFkZFNjZW5hcmlvLFxuICAgIGFkZFNjZW5hcmlvczogYWRkU2NlbmFyaW9zLFxuICAgIGdldFNjZW5hcmlvOiBnZXRTY2VuYXJpbyxcbiAgICBnZXRTY2VuYXJpb3M6IGdldFNjZW5hcmlvcyxcbiAgICBzZXRBY3RpdmVTY2VuYXJpbzogc2V0QWN0aXZlU2NlbmFyaW8sXG4gICAgZ2V0UmVjb3JkZWRTdGF0ZXM6IGdldFJlY29yZGVkU3RhdGVzLFxuICAgIGdldFJlcXVlc3RzTG9nOiBnZXRSZXF1ZXN0c0xvZyxcbiAgICBsb2FkU2F2ZWRTdGF0ZXM6IGxvYWRTYXZlZFN0YXRlcyxcbiAgICBhZGRTYXZlZFN0YXRlOiBhZGRTYXZlZFN0YXRlLFxuICAgIGFkZE9yVXBkYXRlU2F2ZWRTdGF0ZTogYWRkT3JVcGRhdGVTYXZlZFN0YXRlLFxuICAgIGZldGNoU3RhdGVzQnlVcmxBbmRNZXRob2Q6IGZldGNoU3RhdGVzQnlVcmxBbmRNZXRob2QsXG4gICAgcmVtb3ZlU3RhdGU6IHJlbW92ZVN0YXRlLFxuICAgIHJlbW92ZU9wdGlvbjogcmVtb3ZlT3B0aW9uLFxuICAgIF9sb2dSZXF1ZXN0OiBsb2dSZXF1ZXN0XG4gIH07XG5cbiAgZnVuY3Rpb24gdXBzZXJ0T3B0aW9uKHN0YXRlLCBuYW1lLCBhY3RpdmUpIHtcbiAgICB2YXIgc3RhdGVzU3RhdHVzID0gbGVvU3RvcmFnZS5nZXRTdGF0ZXMoKTtcbiAgICBzdGF0ZXNTdGF0dXNbc3RhdGVdID0ge1xuICAgICAgbmFtZTogbmFtZSB8fCBmaW5kU3RhdGVPcHRpb24oc3RhdGUpLm5hbWUsXG4gICAgICBhY3RpdmU6IGFjdGl2ZVxuICAgIH07XG5cbiAgICBsZW9TdG9yYWdlLnNldFN0YXRlcyhzdGF0ZXNTdGF0dXMpO1xuICB9XG5cbiAgZnVuY3Rpb24gZmV0Y2hTdGF0ZXNCeVVybEFuZE1ldGhvZCh1cmwsIG1ldGhvZCkge1xuICAgIHJldHVybiBmZXRjaFN0YXRlcygpLmZpbHRlcihmdW5jdGlvbiAoc3RhdGUpIHtcbiAgICAgIHJldHVybiBzdGF0ZS51cmwgJiYgbmV3IFJlZ0V4cChzdGF0ZS51cmwpLnRlc3QodXJsKSAmJiBzdGF0ZS52ZXJiLnRvTG93ZXJDYXNlKCkgPT09IG1ldGhvZC50b0xvd2VyQ2FzZSgpO1xuICAgIH0pWzBdO1xuICB9XG5cbiAgZnVuY3Rpb24gZmV0Y2hTdGF0ZXMoKSB7XG4gICAgdmFyIGFjdGl2ZVN0YXRlcyA9IGxlb1N0b3JhZ2UuZ2V0U3RhdGVzKCk7XG4gICAgdmFyIHN0YXRlc0NvcHkgPSBfc3RhdGVzLm1hcChmdW5jdGlvbiAoc3RhdGUpIHtcbiAgICAgIHJldHVybiBhbmd1bGFyLmNvcHkoc3RhdGUpO1xuICAgIH0pO1xuXG4gICAgc3RhdGVzQ29weS5mb3JFYWNoKGZ1bmN0aW9uIChzdGF0ZTphbnkpIHtcbiAgICAgIHZhciBvcHRpb24gPSBhY3RpdmVTdGF0ZXNbc3RhdGUubmFtZV07XG4gICAgICBzdGF0ZS5hY3RpdmUgPSAhIW9wdGlvbiAmJiBvcHRpb24uYWN0aXZlO1xuICAgICAgc3RhdGUuYWN0aXZlT3B0aW9uID0gISFvcHRpb24gP1xuICAgICAgICBzdGF0ZS5vcHRpb25zLmZpbHRlcihmdW5jdGlvbiAoX29wdGlvbikge1xuICAgICAgICAgIHJldHVybiBfb3B0aW9uLm5hbWUgPT09IG9wdGlvbi5uYW1lO1xuICAgICAgICB9KVswXSA6IHN0YXRlLm9wdGlvbnNbMF07XG4gICAgfSk7XG5cbiAgICByZXR1cm4gc3RhdGVzQ29weTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGRlYWN0aXZhdGVBbGwoKSB7XG4gICAgdmFyIHN0YXRlc1N0YXR1cyA9IGxlb1N0b3JhZ2UuZ2V0U3RhdGVzKCk7XG4gICAgT2JqZWN0LmtleXMoc3RhdGVzU3RhdHVzKS5mb3JFYWNoKGZ1bmN0aW9uIChzdGF0ZUtleSkge1xuICAgICAgc3RhdGVzU3RhdHVzW3N0YXRlS2V5XS5hY3RpdmUgPSBmYWxzZTtcbiAgICB9KTtcbiAgICBsZW9TdG9yYWdlLnNldFN0YXRlcyhzdGF0ZXNTdGF0dXMpO1xuICB9XG5cbiAgZnVuY3Rpb24gZmluZFN0YXRlT3B0aW9uKG5hbWUpIHtcbiAgICByZXR1cm4gZmV0Y2hTdGF0ZXMoKS5maWx0ZXIoZnVuY3Rpb24gKHN0YXRlKSB7XG4gICAgICByZXR1cm4gc3RhdGUubmFtZSA9PT0gbmFtZTtcbiAgICB9KVswXS5hY3RpdmVPcHRpb247XG4gIH1cblxuICBmdW5jdGlvbiBnZXRBY3RpdmVTdGF0ZU9wdGlvbihuYW1lKSB7XG4gICAgdmFyIHN0YXRlID0gZmV0Y2hTdGF0ZXMoKS5maWx0ZXIoZnVuY3Rpb24gKHN0YXRlKSB7XG4gICAgICByZXR1cm4gc3RhdGUubmFtZSA9PT0gbmFtZVxuICAgIH0pWzBdO1xuICAgIHJldHVybiAoc3RhdGUgJiYgc3RhdGUuYWN0aXZlICYmIGZpbmRTdGF0ZU9wdGlvbihuYW1lKSkgfHwgbnVsbDtcbiAgfVxuXG4gIGZ1bmN0aW9uIGFkZFN0YXRlKHN0YXRlT2JqLCBvdmVycmlkZU9wdGlvbikge1xuXG4gICAgc3RhdGVPYmoub3B0aW9ucy5mb3JFYWNoKGZ1bmN0aW9uIChvcHRpb24pIHtcbiAgICAgIHVwc2VydCh7XG4gICAgICAgIHN0YXRlOiBzdGF0ZU9iai5uYW1lLFxuICAgICAgICB1cmw6IHN0YXRlT2JqLnVybCxcbiAgICAgICAgdmVyYjogc3RhdGVPYmoudmVyYixcbiAgICAgICAgbmFtZTogb3B0aW9uLm5hbWUsXG4gICAgICAgIGZyb21fbG9jYWw6ICEhb3ZlcnJpZGVPcHRpb24sXG4gICAgICAgIHN0YXR1czogb3B0aW9uLnN0YXR1cyxcbiAgICAgICAgZGF0YTogb3B0aW9uLmRhdGEsXG4gICAgICAgIGRlbGF5OiBvcHRpb24uZGVsYXlcbiAgICAgIH0sIG92ZXJyaWRlT3B0aW9uKTtcbiAgICB9KTtcblxuICAgICRyb290U2NvcGUuJGJyb2FkY2FzdCgnbGVvbmFyZG86c3RhdGVDaGFuZ2VkJywgc3RhdGVPYmopO1xuICB9XG5cbiAgZnVuY3Rpb24gYWRkU3RhdGVzKHN0YXRlc0Fyciwgb3ZlcnJpZGVPcHRpb24gPSBmYWxzZSkge1xuICAgIGlmIChhbmd1bGFyLmlzQXJyYXkoc3RhdGVzQXJyKSkge1xuICAgICAgc3RhdGVzQXJyLmZvckVhY2goZnVuY3Rpb24gKHN0YXRlT2JqKSB7XG4gICAgICAgIGFkZFN0YXRlKHN0YXRlT2JqLCBvdmVycmlkZU9wdGlvbik7XG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc29sZS53YXJuKCdsZW9uYXJkbzogYWRkU3RhdGVzIHNob3VsZCBnZXQgYW4gYXJyYXknKTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiB1cHNlcnQoY29uZmlnT2JqLCBvdmVycmlkZU9wdGlvbikge1xuICAgIHZhciB2ZXJiID0gY29uZmlnT2JqLnZlcmIgfHwgJ0dFVCcsXG4gICAgICBzdGF0ZSA9IGNvbmZpZ09iai5zdGF0ZSxcbiAgICAgIG5hbWUgPSBjb25maWdPYmoubmFtZSxcbiAgICAgIGZyb21fbG9jYWwgPSBjb25maWdPYmouZnJvbV9sb2NhbCxcbiAgICAgIHVybCA9IGNvbmZpZ09iai51cmwsXG4gICAgICBzdGF0dXMgPSBjb25maWdPYmouc3RhdHVzIHx8IDIwMCxcbiAgICAgIGRhdGEgPSBhbmd1bGFyLmlzRGVmaW5lZChjb25maWdPYmouZGF0YSkgPyBjb25maWdPYmouZGF0YSA6IHt9LFxuICAgICAgZGVsYXkgPSBjb25maWdPYmouZGVsYXkgfHwgMDtcbiAgICB2YXIgZGVmYXVsdFN0YXRlID0ge307XG5cbiAgICB2YXIgZGVmYXVsdE9wdGlvbiA9IHt9O1xuXG4gICAgaWYgKCFzdGF0ZSkge1xuICAgICAgY29uc29sZS5sb2coXCJsZW9uYXJkbzogY2Fubm90IHVwc2VydCAtIHN0YXRlIGlzIG1hbmRhdG9yeVwiKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB2YXIgc3RhdGVJdGVtID0gX3N0YXRlcy5maWx0ZXIoZnVuY3Rpb24gKF9zdGF0ZSkge1xuICAgICAgICByZXR1cm4gX3N0YXRlLm5hbWUgPT09IHN0YXRlO1xuICAgICAgfSlbMF0gfHwgZGVmYXVsdFN0YXRlO1xuXG4gICAgYW5ndWxhci5leHRlbmQoc3RhdGVJdGVtLCB7XG4gICAgICBuYW1lOiBzdGF0ZSxcbiAgICAgIHVybDogdXJsIHx8IHN0YXRlSXRlbS51cmwsXG4gICAgICB2ZXJiOiB2ZXJiLFxuICAgICAgb3B0aW9uczogc3RhdGVJdGVtLm9wdGlvbnMgfHwgW11cbiAgICB9KTtcblxuXG4gICAgaWYgKHN0YXRlSXRlbSA9PT0gZGVmYXVsdFN0YXRlKSB7XG4gICAgICBfc3RhdGVzLnB1c2goc3RhdGVJdGVtKTtcbiAgICB9XG5cbiAgICB2YXIgb3B0aW9uID0gc3RhdGVJdGVtLm9wdGlvbnMuZmlsdGVyKGZ1bmN0aW9uIChfb3B0aW9uKSB7XG4gICAgICAgIHJldHVybiBfb3B0aW9uLm5hbWUgPT09IG5hbWVcbiAgICAgIH0pWzBdO1xuXG4gICAgaWYgKG92ZXJyaWRlT3B0aW9uICYmIG9wdGlvbikge1xuICAgICAgYW5ndWxhci5leHRlbmQob3B0aW9uLCB7XG4gICAgICAgIG5hbWU6IG5hbWUsXG4gICAgICAgIGZyb21fbG9jYWw6IGZyb21fbG9jYWwsXG4gICAgICAgIHN0YXR1czogc3RhdHVzLFxuICAgICAgICBkYXRhOiBkYXRhLFxuICAgICAgICBkZWxheTogZGVsYXlcbiAgICAgIH0pO1xuICAgIH1cbiAgICBlbHNlIGlmICghb3B0aW9uKSB7XG4gICAgICBhbmd1bGFyLmV4dGVuZChkZWZhdWx0T3B0aW9uLCB7XG4gICAgICAgIG5hbWU6IG5hbWUsXG4gICAgICAgIGZyb21fbG9jYWw6IGZyb21fbG9jYWwsXG4gICAgICAgIHN0YXR1czogc3RhdHVzLFxuICAgICAgICBkYXRhOiBkYXRhLFxuICAgICAgICBkZWxheTogZGVsYXlcbiAgICAgIH0pO1xuXG4gICAgICBzdGF0ZUl0ZW0ub3B0aW9ucy5wdXNoKGRlZmF1bHRPcHRpb24pO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGFkZFNjZW5hcmlvKHNjZW5hcmlvKSB7XG4gICAgaWYgKHNjZW5hcmlvICYmIHR5cGVvZiBzY2VuYXJpby5uYW1lID09PSAnc3RyaW5nJykge1xuICAgICAgX3NjZW5hcmlvc1tzY2VuYXJpby5uYW1lXSA9IHNjZW5hcmlvO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyAnYWRkU2NlbmFyaW8gbWV0aG9kIGV4cGVjdHMgYSBzY2VuYXJpbyBvYmplY3Qgd2l0aCBuYW1lIHByb3BlcnR5JztcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBhZGRTY2VuYXJpb3Moc2NlbmFyaW9zKSB7XG4gICAgYW5ndWxhci5mb3JFYWNoKHNjZW5hcmlvcywgYWRkU2NlbmFyaW8pO1xuICB9XG5cbiAgZnVuY3Rpb24gZ2V0U2NlbmFyaW9zKCkge1xuICAgIHJldHVybiBPYmplY3Qua2V5cyhfc2NlbmFyaW9zKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGdldFNjZW5hcmlvKG5hbWUpIHtcbiAgICBpZiAoIV9zY2VuYXJpb3NbbmFtZV0pIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgcmV0dXJuIF9zY2VuYXJpb3NbbmFtZV0uc3RhdGVzO1xuICB9XG5cbiAgZnVuY3Rpb24gc2V0QWN0aXZlU2NlbmFyaW8obmFtZSkge1xuICAgIHZhciBzY2VuYXJpbyA9IGdldFNjZW5hcmlvKG5hbWUpO1xuICAgIGlmICghc2NlbmFyaW8pIHtcbiAgICAgIGNvbnNvbGUud2FybihcImxlb25hcmRvOiBjb3VsZCBub3QgZmluZCBzY2VuYXJpbyBuYW1lZCBcIiArIG5hbWUpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBkZWFjdGl2YXRlQWxsKCk7XG4gICAgc2NlbmFyaW8uZm9yRWFjaChmdW5jdGlvbiAoc3RhdGUpIHtcbiAgICAgIHVwc2VydE9wdGlvbihzdGF0ZS5uYW1lLCBzdGF0ZS5vcHRpb24sIHRydWUpO1xuICAgIH0pO1xuICB9XG5cbiAgZnVuY3Rpb24gYWN0aXZhdGVTdGF0ZU9wdGlvbihzdGF0ZSwgb3B0aW9uTmFtZSkge1xuICAgIHVwc2VydE9wdGlvbihzdGF0ZSwgb3B0aW9uTmFtZSwgdHJ1ZSk7XG4gIH1cblxuICBmdW5jdGlvbiBkZWFjdGl2YXRlU3RhdGUoc3RhdGUpIHtcbiAgICB1cHNlcnRPcHRpb24oc3RhdGUsIG51bGwsIGZhbHNlKTtcbiAgfVxuXG4gIGludGVyZmFjZSBJTmV0d29ya1JlcXVlc3Qge1xuICAgIHZlcmI6IEZ1bmN0aW9uO1xuICAgIGRhdGE6IGFueTtcbiAgICB1cmw/OiBzdHJpbmc7XG4gICAgc3RhdHVzOiBzdHJpbmc7XG4gICAgdGltZXN0YW1wOiBEYXRlO1xuICAgIHN0YXRlPzogc3RyaW5nO1xuICB9XG5cbiAgZnVuY3Rpb24gbG9nUmVxdWVzdChtZXRob2QsIHVybCwgZGF0YSwgc3RhdHVzKSB7XG4gICAgaWYgKG1ldGhvZCAmJiB1cmwgJiYgISh1cmwuaW5kZXhPZihcIi5odG1sXCIpID4gMCkpIHtcbiAgICAgIHZhciByZXE6IElOZXR3b3JrUmVxdWVzdCA9IHtcbiAgICAgICAgdmVyYjogbWV0aG9kLFxuICAgICAgICBkYXRhOiBkYXRhLFxuICAgICAgICB1cmw6IHVybC50cmltKCksXG4gICAgICAgIHN0YXR1czogc3RhdHVzLFxuICAgICAgICB0aW1lc3RhbXA6IG5ldyBEYXRlKClcbiAgICAgIH07XG4gICAgICByZXEuc3RhdGUgPSBmZXRjaFN0YXRlc0J5VXJsQW5kTWV0aG9kKHJlcS51cmwsIHJlcS52ZXJiKTtcbiAgICAgIF9yZXF1ZXN0c0xvZy5wdXNoKHJlcSk7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gZ2V0UmVxdWVzdHNMb2coKSB7XG4gICAgcmV0dXJuIF9yZXF1ZXN0c0xvZztcbiAgfVxuXG4gIGZ1bmN0aW9uIGxvYWRTYXZlZFN0YXRlcygpIHtcbiAgICBfc2F2ZWRTdGF0ZXMgPSBsZW9TdG9yYWdlLmdldFNhdmVkU3RhdGVzKCk7XG4gICAgYWRkU3RhdGVzKF9zYXZlZFN0YXRlcywgdHJ1ZSk7XG4gIH1cblxuICBmdW5jdGlvbiBhZGRTYXZlZFN0YXRlKHN0YXRlKSB7XG4gICAgX3NhdmVkU3RhdGVzLnB1c2goc3RhdGUpO1xuICAgIGxlb1N0b3JhZ2Uuc2V0U2F2ZWRTdGF0ZXMoX3NhdmVkU3RhdGVzKTtcbiAgICBhZGRTdGF0ZShzdGF0ZSwgdHJ1ZSk7XG4gIH1cblxuICBmdW5jdGlvbiBhZGRPclVwZGF0ZVNhdmVkU3RhdGUoc3RhdGUpIHtcbiAgICB2YXIgb3B0aW9uID0gc3RhdGUuYWN0aXZlT3B0aW9uO1xuXG4gICAgLy91cGRhdGUgbG9jYWwgc3RvcmFnZSBzdGF0ZVxuICAgIHZhciBfc2F2ZWRTdGF0ZSA9IF9zYXZlZFN0YXRlcy5maWx0ZXIoZnVuY3Rpb24oX3N0YXRlKSB7XG4gICAgICByZXR1cm4gX3N0YXRlLm5hbWUgPT09IHN0YXRlLm5hbWU7XG4gICAgfSlbMF07XG5cbiAgICBpZiAoX3NhdmVkU3RhdGUpIHtcbiAgICAgIHZhciBfc2F2ZWRPcHRpb24gPSBfc2F2ZWRTdGF0ZS5vcHRpb25zLmZpbHRlcihmdW5jdGlvbihfb3B0aW9uKSB7XG4gICAgICAgIHJldHVybiBfb3B0aW9uLm5hbWUgPT09IG9wdGlvbi5uYW1lO1xuICAgICAgfSlbMF07XG5cbiAgICAgIGlmIChfc2F2ZWRPcHRpb24pIHtcbiAgICAgICAgX3NhdmVkT3B0aW9uLnN0YXR1cyA9IG9wdGlvbi5zdGF0dXM7XG4gICAgICAgIF9zYXZlZE9wdGlvbi5kZWxheSA9IG9wdGlvbi5kZWxheTtcbiAgICAgICAgX3NhdmVkT3B0aW9uLmRhdGEgPSBvcHRpb24uZGF0YTtcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICBfc2F2ZWRTdGF0ZS5vcHRpb25zLnB1c2gob3B0aW9uKTtcbiAgICAgIH1cblxuICAgICAgbGVvU3RvcmFnZS5zZXRTYXZlZFN0YXRlcyhfc2F2ZWRTdGF0ZXMpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIGFkZFNhdmVkU3RhdGUoc3RhdGUpO1xuICAgIH1cblxuICAgIC8vdXBkYXRlIGluIG1lbW9yeSBzdGF0ZVxuICAgIHZhciBfc3RhdGUgPSBfc3RhdGVzLmZpbHRlcihmdW5jdGlvbihfX3N0YXRlKSB7XG4gICAgICByZXR1cm4gX19zdGF0ZS5uYW1lID09PSBzdGF0ZS5uYW1lO1xuICAgIH0pWzBdO1xuXG4gICAgaWYgKF9zdGF0ZSkge1xuICAgICAgdmFyIF9vcHRpb24gPSBfc3RhdGUub3B0aW9ucy5maWx0ZXIoZnVuY3Rpb24oX19vcHRpb24pIHtcbiAgICAgICAgcmV0dXJuIF9fb3B0aW9uLm5hbWUgPT09IG9wdGlvbi5uYW1lO1xuICAgICAgfSlbMF07XG5cbiAgICAgIGlmIChfb3B0aW9uKSB7XG4gICAgICAgIF9vcHRpb24uc3RhdHVzID0gb3B0aW9uLnN0YXR1cztcbiAgICAgICAgX29wdGlvbi5kZWxheSA9IG9wdGlvbi5kZWxheTtcbiAgICAgICAgX29wdGlvbi5kYXRhID0gb3B0aW9uLmRhdGE7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgX3N0YXRlLm9wdGlvbnMucHVzaChvcHRpb24pO1xuICAgICAgfVxuXG4gICAgICAkcm9vdFNjb3BlLiRicm9hZGNhc3QoJ2xlb25hcmRvOnN0YXRlQ2hhbmdlZCcsIF9zdGF0ZSk7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gcmVtb3ZlU3RhdGVCeU5hbWUobmFtZSkge1xuICAgIHZhciBpbmRleCA9IDA7XG4gICAgX3N0YXRlcy5mb3JFYWNoKGZ1bmN0aW9uIChzdGF0ZSwgaSkge1xuICAgICAgaWYgKHN0YXRlLm5hbWUgPT09IG5hbWUpIHtcbiAgICAgICAgaW5kZXggPSBpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgX3N0YXRlcy5zcGxpY2UoaW5kZXgsIDEpO1xuICB9XG5cbiAgZnVuY3Rpb24gcmVtb3ZlU2F2ZWRTdGF0ZUJ5TmFtZShuYW1lKSB7XG4gICAgdmFyIGluZGV4ID0gMDtcbiAgICBfc2F2ZWRTdGF0ZXMuZm9yRWFjaChmdW5jdGlvbiAoc3RhdGUsIGkpIHtcbiAgICAgIGlmIChzdGF0ZS5uYW1lID09PSBuYW1lKSB7XG4gICAgICAgIGluZGV4ID0gaTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIF9zYXZlZFN0YXRlcy5zcGxpY2UoaW5kZXgsIDEpO1xuICB9XG5cbiAgZnVuY3Rpb24gcmVtb3ZlU3RhdGUoc3RhdGUpIHtcblxuICAgIHJlbW92ZVN0YXRlQnlOYW1lKHN0YXRlLm5hbWUpO1xuICAgIHJlbW92ZVNhdmVkU3RhdGVCeU5hbWUoc3RhdGUubmFtZSk7XG5cbiAgICBsZW9TdG9yYWdlLnNldFNhdmVkU3RhdGVzKF9zYXZlZFN0YXRlcyk7XG4gIH1cblxuICBmdW5jdGlvbiByZW1vdmVTdGF0ZU9wdGlvbkJ5TmFtZShzdGF0ZU5hbWUsIG9wdGlvbk5hbWUpIHtcbiAgICB2YXIgc0luZGV4ID0gbnVsbDtcbiAgICB2YXIgb0luZGV4ID0gbnVsbDtcblxuICAgIF9zdGF0ZXMuZm9yRWFjaChmdW5jdGlvbiAoc3RhdGUsIGkpIHtcbiAgICAgIGlmIChzdGF0ZS5uYW1lID09PSBzdGF0ZU5hbWUpIHtcbiAgICAgICAgc0luZGV4ID0gaTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIGlmIChzSW5kZXggIT09IG51bGwpIHtcbiAgICAgIF9zdGF0ZXNbc0luZGV4XS5vcHRpb25zLmZvckVhY2goZnVuY3Rpb24gKG9wdGlvbiwgaSkge1xuICAgICAgICBpZiAob3B0aW9uLm5hbWUgPT09IG9wdGlvbk5hbWUpIHtcbiAgICAgICAgICBvSW5kZXggPSBpO1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgaWYgKG9JbmRleCAhPT0gbnVsbCkge1xuICAgICAgICBfc3RhdGVzW3NJbmRleF0ub3B0aW9ucy5zcGxpY2Uob0luZGV4LCAxKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiByZW1vdmVTYXZlZFN0YXRlT3B0aW9uQnlOYW1lKHN0YXRlTmFtZSwgb3B0aW9uTmFtZSkge1xuICAgIHZhciBzSW5kZXggPSBudWxsO1xuICAgIHZhciBvSW5kZXggPSBudWxsO1xuXG4gICAgX3NhdmVkU3RhdGVzLmZvckVhY2goZnVuY3Rpb24gKHN0YXRlLCBpKSB7XG4gICAgICBpZiAoc3RhdGUubmFtZSA9PT0gc3RhdGVOYW1lKSB7XG4gICAgICAgIHNJbmRleCA9IGk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBpZiAoc0luZGV4ICE9PSBudWxsKSB7XG4gICAgICBfc2F2ZWRTdGF0ZXNbc0luZGV4XS5vcHRpb25zLmZvckVhY2goZnVuY3Rpb24gKG9wdGlvbiwgaSkge1xuICAgICAgICBpZiAob3B0aW9uLm5hbWUgPT09IG9wdGlvbk5hbWUpIHtcbiAgICAgICAgICBvSW5kZXggPSBpO1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgaWYgKG9JbmRleCAhPT0gbnVsbCkge1xuICAgICAgICBfc2F2ZWRTdGF0ZXNbc0luZGV4XS5vcHRpb25zLnNwbGljZShvSW5kZXgsIDEpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHJlbW92ZU9wdGlvbihzdGF0ZSwgb3B0aW9uKSB7XG4gICAgcmVtb3ZlU3RhdGVPcHRpb25CeU5hbWUoc3RhdGUubmFtZSwgb3B0aW9uLm5hbWUpO1xuICAgIHJlbW92ZVNhdmVkU3RhdGVPcHRpb25CeU5hbWUoc3RhdGUubmFtZSwgb3B0aW9uLm5hbWUpO1xuXG4gICAgbGVvU3RvcmFnZS5zZXRTYXZlZFN0YXRlcyhfc2F2ZWRTdGF0ZXMpO1xuXG4gICAgYWN0aXZhdGVTdGF0ZU9wdGlvbihfc3RhdGVzWzBdLm5hbWUsIF9zdGF0ZXNbMF0ub3B0aW9uc1swXS5uYW1lKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGdldFJlY29yZGVkU3RhdGVzKCkge1xuICAgIHZhciByZXF1ZXN0c0FyciA9IF9yZXF1ZXN0c0xvZ1xuICAgICAgLm1hcChmdW5jdGlvbiAocmVxKSB7XG4gICAgICAgIHZhciBzdGF0ZSA9IGZldGNoU3RhdGVzQnlVcmxBbmRNZXRob2QocmVxLnVybCwgcmVxLnZlcmIpO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIG5hbWU6IHN0YXRlID8gc3RhdGUubmFtZSA6IHJlcS52ZXJiICsgXCIgXCIgKyByZXEudXJsLFxuICAgICAgICAgIHZlcmI6IHJlcS52ZXJiLFxuICAgICAgICAgIHVybDogcmVxLnVybCxcbiAgICAgICAgICBvcHRpb25zOiBbe1xuICAgICAgICAgICAgbmFtZTogcmVxLnN0YXR1cyA+PSAyMDAgJiYgcmVxLnN0YXR1cyA8IDMwMCA/ICdTdWNjZXNzJyA6ICdGYWlsdXJlJyxcbiAgICAgICAgICAgIHN0YXR1czogcmVxLnN0YXR1cyxcbiAgICAgICAgICAgIGRhdGE6IHJlcS5kYXRhXG4gICAgICAgICAgfV1cbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgY29uc29sZS5sb2coYW5ndWxhci50b0pzb24ocmVxdWVzdHNBcnIsIHRydWUpKTtcbiAgICByZXR1cm4gcmVxdWVzdHNBcnI7XG4gIH1cbn1cbiIsImV4cG9ydCBmdW5jdGlvbiBqc29uRm9ybWF0dGVyKCkge1xuICByZXR1cm4ge1xuICAgIHJlc3RyaWN0OiAnRScsXG4gICAgc2NvcGU6IHtcbiAgICAgIGpzb25TdHJpbmc6ICc9JyxcbiAgICAgIG9uRXJyb3I6ICcmJyxcbiAgICAgIG9uU3VjY2VzczogJyYnXG4gICAgfSxcbiAgICBjb250cm9sbGVyOiBKc29uRm9ybWF0dGVyQ3RybCxcbiAgICBiaW5kVG9Db250cm9sbGVyOiB0cnVlLFxuICAgIGNvbnRyb2xsZXJBczogJ2xlb0pzb25Gb3JtYXR0ZXJDdHJsJyxcbiAgICB0ZW1wbGF0ZTogJzx0ZXh0YXJlYSBuZy1tb2RlbD1cImxlb0pzb25Gb3JtYXR0ZXJDdHJsLmpzb25TdHJpbmdcIiBuZy1jaGFuZ2U9XCJsZW9Kc29uRm9ybWF0dGVyQ3RybC52YWx1ZUNoYW5nZWQoKVwiIC8+J1xuICB9XG59O1xuXG5cbmNsYXNzIEpzb25Gb3JtYXR0ZXJDdHJsIHtcbiAgcHJpdmF0ZSBqc29uU3RyaW5nO1xuICBwcml2YXRlIG9uU3VjY2VzczogRnVuY3Rpb247XG4gIHByaXZhdGUgb25FcnJvcjogRnVuY3Rpb247XG5cbiAgc3RhdGljICRpbmplY3QgPSBbJyRzY29wZSddO1xuICBjb25zdHJ1Y3Rvcigkc2NvcGUpIHtcbiAgICAkc2NvcGUuJHdhdGNoKCdqc29uU3RyaW5nJywgZnVuY3Rpb24gKCkge1xuICAgICAgdGhpcy52YWx1ZUNoYW5nZWQoKTtcbiAgICB9LmJpbmQodGhpcykpO1xuICB9XG5cbiAgdmFsdWVDaGFuZ2VkKCkge1xuICAgIHRyeSB7XG4gICAgICBKU09OLnBhcnNlKHRoaXMuanNvblN0cmluZyk7XG4gICAgICB0aGlzLm9uU3VjY2Vzcyh7dmFsdWU6IHRoaXMuanNvblN0cmluZ30pO1xuICAgIH1cbiAgICBjYXRjaCAoZSkge1xuICAgICAgdGhpcy5vbkVycm9yKHttc2c6IGUubWVzc2FnZX0pO1xuICAgIH1cbiAgfTtcblxufSIsImltcG9ydCBJU2VydmljZVByb3ZpZGVyID0gYW5ndWxhci5JU2VydmljZVByb3ZpZGVyO1xuXG5leHBvcnQgY2xhc3MgTGVvbmFyZG9Qcm92aWRlciBpbXBsZW1lbnRzIElTZXJ2aWNlUHJvdmlkZXIge1xuICAgIHByZWZpeCA9ICcnO1xuXG4gICAgc2V0QXBwUHJlZml4IChwcmVmaXggPSAnJykge1xuICAgICAgdGhpcy5wcmVmaXggPSBwcmVmaXg7XG4gICAgfTtcblxuICAgICRnZXQ6YW55W10gPSBbZnVuY3Rpb24gbGVvbmFyZG9Qcm92aWRlcigpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBnZXRBcHBQcmVmaXg6ICgpID0+IHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnByZWZpeDtcbiAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgfV07XG59XG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vLi4vdHlwaW5ncy9hbmd1bGFyanMvYW5ndWxhci5kLnRzXCIgLz5cbmltcG9ydCB7bGVvQWN0aXZhdG9yfSBmcm9tICcuL2FjdGl2YXRvci5kcnYnO1xuaW1wb3J0IHtsZW9Db25maWd1cmF0aW9ufSBmcm9tICcuL2NvbmZpZ3VyYXRpb24uc3J2JztcbmltcG9ydCB7TGVvbmFyZG9Qcm92aWRlcn0gZnJvbSAnLi9sZW9uYXJkby5wcm92JztcbmltcG9ydCB7bGVvUmVxdWVzdH0gZnJvbSAnLi9yZXF1ZXN0LmRydic7XG5pbXBvcnQge2xlb1NlbGVjdH0gZnJvbSAnLi9zZWxlY3QuZHJ2JztcbmltcG9ydCB7bGVvU3RhdGVJdGVtfSBmcm9tICcuL3N0YXRlLWl0ZW0uZHJ2JztcbmltcG9ydCB7U3RvcmFnZX0gZnJvbSAnLi9zdG9yYWdlLnNydic7XG5pbXBvcnQge2pzb25Gb3JtYXR0ZXJ9IGZyb20gJy4vbGVvLWpzb24tZm9ybWF0dGVyLmRydic7XG5pbXBvcnQge3dpbmRvd0JvZHlEaXJlY3RpdmV9IGZyb20gJy4vd2luZG93LWJvZHkuZHJ2JztcblxuZGVjbGFyZSB2YXIgc2lub247XG5cbmFuZ3VsYXIubW9kdWxlKCdsZW9uYXJkbycsIFsnbGVvbmFyZG8udGVtcGxhdGVzJywgJ25nY2xpcGJvYXJkJ10pXG4gIC5kaXJlY3RpdmUoJ2xlb0FjdGl2YXRvcicsIGxlb0FjdGl2YXRvcilcbiAgLmRpcmVjdGl2ZSgnbGVvUmVxdWVzdCcsIGxlb1JlcXVlc3QpXG4gIC5kaXJlY3RpdmUoJ2xlb1NlbGVjdCcsIGxlb1NlbGVjdClcbiAgLmRpcmVjdGl2ZSgnbGVvU3RhdGVJdGVtJywgbGVvU3RhdGVJdGVtKVxuICAuZGlyZWN0aXZlKCdsZW9Kc29uRm9ybWF0dGVyJywganNvbkZvcm1hdHRlcilcbiAgLmRpcmVjdGl2ZSgnbGVvV2luZG93Qm9keScsIHdpbmRvd0JvZHlEaXJlY3RpdmUpXG4gIC5zZXJ2aWNlKCdsZW9TdG9yYWdlJywgU3RvcmFnZSlcbiAgLmZhY3RvcnkoJ2xlb0NvbmZpZ3VyYXRpb24nLCBsZW9Db25maWd1cmF0aW9uKVxuICAucHJvdmlkZXIoJyRsZW9uYXJkbycsIExlb25hcmRvUHJvdmlkZXIpXG4gIC5ydW4oW1xuICAgICdsZW9Db25maWd1cmF0aW9uJyxcbiAgICAnJGRvY3VtZW50JyxcbiAgICAnJHJvb3RTY29wZScsXG4gICAgJyRjb21waWxlJyxcbiAgICAnJHRpbWVvdXQnLCBmdW5jdGlvbihsZW9Db25maWd1cmF0aW9uLCAkZG9jdW1lbnQsICRyb290U2NvcGUsICRjb21waWxlLCAkdGltZW91dCkge1xuICAgIHZhciBzZXJ2ZXIgPSBzaW5vbi5mYWtlU2VydmVyLmNyZWF0ZSh7XG4gICAgICBhdXRvUmVzcG9uZDogdHJ1ZSxcbiAgICAgIGF1dG9SZXNwb25kQWZ0ZXI6IDEwXG4gICAgfSk7XG5cbiAgICBzaW5vbi5GYWtlWE1MSHR0cFJlcXVlc3QudXNlRmlsdGVycyA9IHRydWU7XG4gICAgc2lub24uRmFrZVhNTEh0dHBSZXF1ZXN0LmFkZEZpbHRlcihmdW5jdGlvbihtZXRob2QsIHVybCkge1xuICAgICAgaWYgKHVybC5pbmRleE9mKCcuaHRtbCcpID4gMCAmJiB1cmwuaW5kZXhPZigndGVtcGxhdGUnKSA+PSAwKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgICAgdmFyIHN0YXRlID0gbGVvQ29uZmlndXJhdGlvbi5mZXRjaFN0YXRlc0J5VXJsQW5kTWV0aG9kKHVybCwgbWV0aG9kKTtcbiAgICAgIHJldHVybiAhKHN0YXRlICYmIHN0YXRlLmFjdGl2ZSk7XG4gICAgfSk7XG5cbiAgICBzaW5vbi5GYWtlWE1MSHR0cFJlcXVlc3Qub25SZXNwb25zZUVuZCA9IGZ1bmN0aW9uKHhocikge1xuICAgICAgdmFyIHJlcyA9IHhoci5yZXNwb25zZTtcbiAgICAgIHRyeSB7IHJlcyA9IEpTT04ucGFyc2UoeGhyLnJlc3BvbnNlKTsgfVxuICAgICAgY2F0Y2ggKGUpIHt9XG4gICAgICBsZW9Db25maWd1cmF0aW9uLl9sb2dSZXF1ZXN0KHhoci5tZXRob2QsIHhoci51cmwsIHJlcywgeGhyLnN0YXR1cyk7XG4gICAgfTtcblxuICAgIHNlcnZlci5yZXNwb25kV2l0aChmdW5jdGlvbihyZXF1ZXN0KSB7XG4gICAgICB2YXIgc3RhdGUgPSBsZW9Db25maWd1cmF0aW9uLmZldGNoU3RhdGVzQnlVcmxBbmRNZXRob2QocmVxdWVzdC51cmwsIHJlcXVlc3QubWV0aG9kKSxcbiAgICAgICAgICBhY3RpdmVPcHRpb24gPSBsZW9Db25maWd1cmF0aW9uLmdldEFjdGl2ZVN0YXRlT3B0aW9uKHN0YXRlLm5hbWUpO1xuXG4gICAgICBpZiAoISFhY3RpdmVPcHRpb24pIHtcbiAgICAgICAgdmFyIHJlc3BvbnNlRGF0YSA9IGFuZ3VsYXIuaXNGdW5jdGlvbihhY3RpdmVPcHRpb24uZGF0YSkgPyBhY3RpdmVPcHRpb24uZGF0YShyZXF1ZXN0KSA6IGFjdGl2ZU9wdGlvbi5kYXRhO1xuICAgICAgICByZXF1ZXN0LnJlc3BvbmQoYWN0aXZlT3B0aW9uLnN0YXR1cywgeyBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIiB9LCBKU09OLnN0cmluZ2lmeShyZXNwb25zZURhdGEpKTtcbiAgICAgICAgbGVvQ29uZmlndXJhdGlvbi5fbG9nUmVxdWVzdChyZXF1ZXN0Lm1ldGhvZCwgcmVxdWVzdC51cmwsIHJlc3BvbnNlRGF0YSwgYWN0aXZlT3B0aW9uLnN0YXR1cyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zb2xlLndhcm4oJ2NvdWxkIG5vdCBmaW5kIGEgc3RhdGUgZm9yIHRoZSBmb2xsb3dpbmcgcmVxdWVzdCcsIHJlcXVlc3QpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIGxlb0NvbmZpZ3VyYXRpb24ubG9hZFNhdmVkU3RhdGVzKCk7XG5cbiAgICB2YXIgZWwgPSAkY29tcGlsZSgnPGRpdiBsZW8tYWN0aXZhdG9yPjwvZGl2PicpKCRyb290U2NvcGUpO1xuICAgICR0aW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgJGRvY3VtZW50WzBdLmJvZHkuYXBwZW5kQ2hpbGQoZWxbMF0pO1xuICAgIH0pO1xuICB9XSk7XG5cbmRlY2xhcmUgdmFyIG1vZHVsZTtcbmRlY2xhcmUgdmFyIGV4cG9ydHM7XG4vLyBDb21tb24uanMgcGFja2FnZSBtYW5hZ2VyIHN1cHBvcnQgKGUuZy4gQ29tcG9uZW50SlMsIFdlYlBhY2spXG5pZiAodHlwZW9mIG1vZHVsZSAhPT0gXCJ1bmRlZmluZWRcIiAmJiB0eXBlb2YgZXhwb3J0cyAhPT0gXCJ1bmRlZmluZWRcIiAmJiBtb2R1bGUuZXhwb3J0cyA9PT0gZXhwb3J0cykge1xuICBtb2R1bGUuZXhwb3J0cyA9ICdsZW9uYXJkbyc7XG59XG4iLCJpbXBvcnQgSURpcmVjdGl2ZSA9IGFuZ3VsYXIuSURpcmVjdGl2ZTtcblxuZXhwb3J0IGZ1bmN0aW9uIGxlb1JlcXVlc3QgKCk6SURpcmVjdGl2ZSB7XG4gIHJldHVybiB7XG4gICAgcmVzdHJpY3Q6ICdFJyxcbiAgICB0ZW1wbGF0ZVVybDogJ3JlcXVlc3QuaHRtbCcsXG4gICAgc2NvcGU6IHtcbiAgICAgIHJlcXVlc3Q6ICc9JyxcbiAgICAgIG9uU2VsZWN0OiAnJidcbiAgICB9LFxuICAgIGNvbnRyb2xsZXJBczogJ2xlb1JlcXVlc3QnLFxuICAgIGJpbmRUb0NvbnRyb2xsZXI6IHRydWUsXG4gICAgY29udHJvbGxlcjogTGVvUmVxdWVzdFxuICB9O1xufTtcblxuY2xhc3MgTGVvUmVxdWVzdCB7XG4gIG9uU2VsZWN0OkZ1bmN0aW9uO1xuXG4gIHNlbGVjdCgpIHtcbiAgICB0aGlzLm9uU2VsZWN0KCk7XG4gIH1cbn1cbiIsImltcG9ydCBJRGlyZWN0aXZlID0gYW5ndWxhci5JRGlyZWN0aXZlO1xuXG5leHBvcnQgZnVuY3Rpb24gbGVvU2VsZWN0KCk6IElEaXJlY3RpdmUge1xuICByZXR1cm4ge1xuICAgIHJlc3RyaWN0OiAnRScsXG4gICAgdGVtcGxhdGVVcmw6ICdzZWxlY3QuaHRtbCcsXG4gICAgc2NvcGU6IHtcbiAgICAgIHN0YXRlOiAnPScsXG4gICAgICBvbkNoYW5nZTogJyYnLFxuICAgICAgb25EZWxldGU6ICcmJyxcbiAgICAgIGRpc2FibGVkOiAnJidcbiAgICB9LFxuICAgIGNvbnRyb2xsZXI6IExlb1NlbGVjdENvbnRyb2xsZXIsXG4gICAgYmluZFRvQ29udHJvbGxlcjogdHJ1ZSxcbiAgICBjb250cm9sbGVyQXM6ICdsZW9TZWxlY3QnLFxuICB9XG59XG5cbmNsYXNzIExlb1NlbGVjdENvbnRyb2xsZXIge1xuICBwcml2YXRlIGVudGl0eUlkO1xuICBwcml2YXRlIHN0YXRpYyBjb3VudCA9IDA7XG4gIHByaXZhdGUgb3BlbjtcbiAgcHJpdmF0ZSBzY29wZTtcbiAgcHJpdmF0ZSBzdGF0ZTtcbiAgb25DaGFuZ2U6IEZ1bmN0aW9uO1xuICBvbkRlbGV0ZTogRnVuY3Rpb247XG4gIGRpc2FibGVkOiBGdW5jdGlvbjtcblxuICBzdGF0aWMgJGluamVjdCA9IFsnJGRvY3VtZW50JywgJyRzY29wZSddO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgJGRvY3VtZW50LCBwcml2YXRlICRzY29wZSkge1xuICAgIHRoaXMuZW50aXR5SWQgPSArK0xlb1NlbGVjdENvbnRyb2xsZXIuY291bnQ7XG4gICAgdGhpcy5vcGVuID0gZmFsc2U7XG4gICAgdGhpcy5zY29wZSA9IG51bGw7XG4gIH1cblxuICBzZWxlY3RPcHRpb24oJGV2ZW50LCBvcHRpb24pIHtcbiAgICAkZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAkZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgdGhpcy5zdGF0ZS5hY3RpdmVPcHRpb24gPSBvcHRpb247XG4gICAgdGhpcy5vcGVuID0gZmFsc2U7XG4gICAgdGhpcy5vbkNoYW5nZSh7c3RhdGU6IHRoaXMuc3RhdGV9KTtcbiAgfTtcblxuICByZW1vdmVPcHRpb24oJGV2ZW50LCBvcHRpb24pIHtcbiAgICAkZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAkZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgdGhpcy5vbkRlbGV0ZSh7c3RhdGU6IHRoaXMuc3RhdGUsIG9wdGlvbjogb3B0aW9ufSk7XG4gIH07XG5cbiAgdG9nZ2xlKCRldmVudCkge1xuICAgIGlmICghdGhpcy5kaXNhYmxlZCgpKSB0aGlzLm9wZW4gPSAhdGhpcy5vcGVuO1xuICAgIGlmICh0aGlzLm9wZW4pIHRoaXMuYXR0YWNoRXZlbnQoKTtcbiAgfTtcblxuICBjbGlja0V2ZW50KGV2ZW50KSB7XG4gICAgdmFyIGNsYXNzTmFtZSA9IGV2ZW50LnRhcmdldC5nZXRBdHRyaWJ1dGUoJ2NsYXNzJyk7XG4gICAgaWYgKCFjbGFzc05hbWUgfHwgY2xhc3NOYW1lLmluZGV4T2YoJ2xlby1kcm9wZG93bi1lbnRpdHktJyArIHRoaXMuZW50aXR5SWQpID09IC0xKSB7XG4gICAgICB0aGlzLiRzY29wZS4kYXBwbHkoKCkgPT4ge1xuICAgICAgICB0aGlzLm9wZW4gPSBmYWxzZTtcbiAgICAgIH0pO1xuICAgICAgdGhpcy5yZW1vdmVFdmVudCgpO1xuICAgIH1cbiAgfVxuXG4gIGF0dGFjaEV2ZW50KCkge1xuICAgIHRoaXMuJGRvY3VtZW50LmJpbmQoJ2NsaWNrJywgdGhpcy5jbGlja0V2ZW50LmJpbmQodGhpcykpO1xuICB9O1xuXG4gIHJlbW92ZUV2ZW50KCkge1xuICAgIHRoaXMuJGRvY3VtZW50LnVuYmluZCgnY2xpY2snLCB0aGlzLmNsaWNrRXZlbnQpO1xuICB9O1xufVxuIiwiZXhwb3J0IGZ1bmN0aW9uIGxlb1N0YXRlSXRlbSAoKSB7XG4gIHJldHVybiB7XG4gICAgcmVzdHJpY3Q6ICdFJyxcbiAgICB0ZW1wbGF0ZVVybDogJ3N0YXRlLWl0ZW0uaHRtbCcsXG4gICAgc2NvcGU6IHtcbiAgICAgIHN0YXRlOiAnPScsXG4gICAgICBhamF4U3RhdGU6ICc9JyxcbiAgICAgIG9uT3B0aW9uQ2hhbmdlZDogJyYnLFxuICAgICAgb25SZW1vdmVTdGF0ZTogJyYnLFxuICAgICAgb25SZW1vdmVPcHRpb246ICcmJyxcbiAgICAgIG9uVG9nZ2xlQ2xpY2s6ICcmJyxcbiAgICAgIG9uRWRpdENsaWNrOiAnJidcbiAgICB9LFxuICAgIGNvbnRyb2xsZXJBczogJ2xlb1N0YXRlSXRlbScsXG4gICAgYmluZFRvQ29udHJvbGxlcjogdHJ1ZSxcbiAgICBjb250cm9sbGVyOiBMZW9TdGF0ZUl0ZW1cbiAgfTtcbn1cblxuY2xhc3MgTGVvU3RhdGVJdGVtIHtcbiAgcHJpdmF0ZSBzdGF0ZTtcbiAgcHVibGljIG9uVG9nZ2xlQ2xpY2s6IEZ1bmN0aW9uO1xuICBwdWJsaWMgb25SZW1vdmVTdGF0ZTogRnVuY3Rpb247XG4gIHB1YmxpYyBvblJlbW92ZU9wdGlvbjogRnVuY3Rpb247XG4gIHB1YmxpYyBvbk9wdGlvbkNoYW5nZWQ6IEZ1bmN0aW9uO1xuICBwdWJsaWMgb25FZGl0Q2xpY2s6IEZ1bmN0aW9uO1xuXG4gIHRvZ2dsZUNsaWNrICgkZXZlbnQpIHtcbiAgICAkZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAkZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgdGhpcy5vblRvZ2dsZUNsaWNrKHtcbiAgICAgIHN0YXRlOiB0aGlzLnN0YXRlXG4gICAgfSk7XG4gIH07XG5cbiAgcmVtb3ZlU3RhdGUgKCRldmVudCkge1xuICAgICRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICRldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICB0aGlzLm9uUmVtb3ZlU3RhdGUoe1xuICAgICAgc3RhdGU6IHRoaXMuc3RhdGVcbiAgICB9KTtcbiAgfTtcblxuICByZW1vdmVPcHRpb24gKHN0YXRlLCBvcHRpb24pIHtcbiAgICB0aGlzLm9uUmVtb3ZlT3B0aW9uKHtcbiAgICAgIHN0YXRlOiBzdGF0ZSxcbiAgICAgIG9wdGlvbjogb3B0aW9uXG4gICAgfSk7XG4gIH07XG5cbiAgdXBkYXRlU3RhdGUgKHN0YXRlKSB7XG4gICAgdGhpcy5vbk9wdGlvbkNoYW5nZWQoe1xuICAgICAgc3RhdGU6IHN0YXRlXG4gICAgfSk7XG4gIH1cblxuICBlZGl0Q2xpY2soc3RhdGUkKSB7XG4gICAgdGhpcy5vbkVkaXRDbGljayh7c3RhdGUkOiBzdGF0ZSR9KTtcbiAgfVxufVxuIiwiZXhwb3J0IGNsYXNzIFN0b3JhZ2Uge1xuICBzdGF0aWMgJGluamVjdCA9IFsnJHJvb3RTY29wZScsICckd2luZG93JywgJyRsZW9uYXJkbyddO1xuICBwcml2YXRlIEFQUF9QUkVGSVg7XG4gIHByaXZhdGUgU1RBVEVTX1NUT1JFX0tFWTtcbiAgcHJpdmF0ZSBTQVZFRF9TVEFURVNfS0VZO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgJHJvb3RTY29wZSwgcHJpdmF0ZSAkd2luZG93LCBwcml2YXRlICRsZW9uYXJkbykge1xuICAgICAgdGhpcy5BUFBfUFJFRklYID0gYCR7JGxlb25hcmRvLmdldEFwcFByZWZpeCgpfV9gO1xuICAgICAgdGhpcy5TVEFURVNfU1RPUkVfS0VZID0gYCR7dGhpcy5BUFBfUFJFRklYfWxlb25hcmRvLXN0YXRlc2A7XG4gICAgICB0aGlzLlNBVkVEX1NUQVRFU19LRVkgPSBgJHt0aGlzLkFQUF9QUkVGSVh9bGVvbmFyZG8tdW5yZWdpc3RlcmVkLXN0YXRlc2A7XG5cbiAgfVxuICBfZ2V0SXRlbSAoa2V5KSB7XG4gICAgdmFyIGl0ZW0gPSB0aGlzLiR3aW5kb3cubG9jYWxTdG9yYWdlLmdldEl0ZW0oa2V5KTtcbiAgICBpZiAoIWl0ZW0pIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICByZXR1cm4gYW5ndWxhci5mcm9tSnNvbihpdGVtKTtcbiAgfVxuXG4gIF9zZXRJdGVtKGtleSwgZGF0YSkge1xuICAgIHRoaXMuJHdpbmRvdy5sb2NhbFN0b3JhZ2Uuc2V0SXRlbShrZXksIGFuZ3VsYXIudG9Kc29uKGRhdGEpKTtcbiAgfVxuXG4gIGdldFN0YXRlcygpIHtcbiAgICByZXR1cm4gdGhpcy5fZ2V0SXRlbSh0aGlzLlNUQVRFU19TVE9SRV9LRVkpIHx8IHt9O1xuICB9XG5cbiAgc2V0U3RhdGVzKHN0YXRlcykge1xuICAgIHRoaXMuX3NldEl0ZW0odGhpcy5TVEFURVNfU1RPUkVfS0VZLCBzdGF0ZXMpO1xuICAgIHRoaXMuJHJvb3RTY29wZS4kZW1pdCgnbGVvbmFyZG86c2V0U3RhdGVzJyk7XG4gIH1cblxuICBnZXRTYXZlZFN0YXRlcygpIHtcbiAgICB2YXIgc3RhdGVzID0gdGhpcy5fZ2V0SXRlbSh0aGlzLlNBVkVEX1NUQVRFU19LRVkpIHx8IFtdO1xuICAgIHN0YXRlcy5mb3JFYWNoKGZ1bmN0aW9uKHN0YXRlKXtcbiAgICAgIHN0YXRlLm9wdGlvbnMuZm9yRWFjaChvcHRpb24gPT4ge1xuICAgICAgICBvcHRpb24uZnJvbV9sb2NhbCA9IHRydWU7XG4gICAgICB9KVxuICAgIH0pO1xuICAgIHJldHVybiBzdGF0ZXM7XG4gIH1cblxuICBzZXRTYXZlZFN0YXRlcyhzdGF0ZXMpIHtcbiAgICB0aGlzLl9zZXRJdGVtKHRoaXMuU0FWRURfU1RBVEVTX0tFWSwgc3RhdGVzKTtcbiAgfVxufTtcbiIsIndpbmRvd0JvZHlEaXJlY3RpdmUuJGluamVjdCA9IFsnJGh0dHAnLCAnbGVvQ29uZmlndXJhdGlvbiddO1xuXG5leHBvcnQgZnVuY3Rpb24gd2luZG93Qm9keURpcmVjdGl2ZSgkaHR0cCwgbGVvQ29uZmlndXJhdGlvbikge1xuICByZXR1cm4ge1xuICAgIHJlc3RyaWN0OiAnRScsXG4gICAgdGVtcGxhdGVVcmw6ICd3aW5kb3ctYm9keS5odG1sJyxcbiAgICBzY29wZTogdHJ1ZSxcbiAgICBjb250cm9sbGVyOiBMZW9XaW5kb3dCb2R5LFxuICAgIGJpbmRUb0NvbnRyb2xsZXI6IHRydWUsXG4gICAgY29udHJvbGxlckFzOiAnbGVvV2luZG93Qm9keScsXG4gICAgcmVxdWlyZTogWydebGVvQWN0aXZhdG9yJywgJ2xlb1dpbmRvd0JvZHknXSxcbiAgICBsaW5rOiBmdW5jdGlvbiAoc2NvcGUsIGVsLCBhdHRyLCBjb250cm9sbGVycykge1xuICAgICAgdmFyIGxlb0FjdGl2YXRvciA9IGNvbnRyb2xsZXJzWzBdO1xuICAgICAgdmFyIGxlb1dpbmRvd0JvZHkgPSBjb250cm9sbGVyc1sxXTtcblxuICAgICAgbGVvV2luZG93Qm9keS5oYXNBY3RpdmVPcHRpb24gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnJlcXVlc3RzLmZpbHRlcihmdW5jdGlvbiAocmVxdWVzdCkge1xuICAgICAgICAgIHJldHVybiAhIXJlcXVlc3QuYWN0aXZlO1xuICAgICAgICB9KS5sZW5ndGg7XG4gICAgICB9O1xuXG4gICAgICBsZW9XaW5kb3dCb2R5LnNhdmVVbnJlZ2lzdGVyZWRTdGF0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIHN0YXRlTmFtZSA9IHRoaXMuZGV0YWlsLnN0YXRlO1xuXG4gICAgICAgIGxlb0NvbmZpZ3VyYXRpb24uYWRkU2F2ZWRTdGF0ZSh7XG4gICAgICAgICAgbmFtZTogc3RhdGVOYW1lLFxuICAgICAgICAgIHZlcmI6IGxlb1dpbmRvd0JvZHkuZGV0YWlsLl91bnJlZ2lzdGVyZWRTdGF0ZS52ZXJiLFxuICAgICAgICAgIHVybDogbGVvV2luZG93Qm9keS5kZXRhaWwuX3VucmVnaXN0ZXJlZFN0YXRlLnVybCxcbiAgICAgICAgICBvcHRpb25zOiBbXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIG5hbWU6IGxlb1dpbmRvd0JvZHkuZGV0YWlsLm9wdGlvbixcbiAgICAgICAgICAgICAgc3RhdHVzOiBsZW9XaW5kb3dCb2R5LmRldGFpbC5zdGF0dXMsXG4gICAgICAgICAgICAgIGRhdGE6IGxlb1dpbmRvd0JvZHkuZGV0YWlsLnZhbHVlLFxuICAgICAgICAgICAgICBkZWxheTogbGVvV2luZG93Qm9keS5kZXRhaWwuZGVsYXlcbiAgICAgICAgICAgIH1cbiAgICAgICAgICBdXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGxlb0FjdGl2YXRvci5zZWxlY3RUYWIoJ3NjZW5hcmlvcycpO1xuICAgICAgfTtcblxuICAgICAgbGVvV2luZG93Qm9keS50ZXN0ID0ge1xuICAgICAgICB1cmw6ICcnLFxuICAgICAgICB2YWx1ZTogdW5kZWZpbmVkXG4gICAgICB9O1xuXG4gICAgICBsZW9XaW5kb3dCb2R5LnN1Ym1pdCA9IGZ1bmN0aW9uICh1cmwpIHtcbiAgICAgICAgbGVvV2luZG93Qm9keS50ZXN0LnZhbHVlID0gdW5kZWZpbmVkO1xuICAgICAgICBsZW9XaW5kb3dCb2R5LnVybCA9IHVybDtcbiAgICAgICAgaWYgKHVybCkge1xuICAgICAgICAgICRodHRwLmdldCh1cmwpLnN1Y2Nlc3MoZnVuY3Rpb24gKHJlcykge1xuICAgICAgICAgICAgbGVvV2luZG93Qm9keS50ZXN0LnZhbHVlID0gcmVzO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgIH1cbiAgfTtcbn1cblxuXG5jbGFzcyBMZW9XaW5kb3dCb2R5IHtcbiAgZWRpdGVkU3RhdGU6IGFueTtcbiAgc3RhdGVzOiBhbnlbXTtcbiAgcHJpdmF0ZSBkZXRhaWw6IHtcbiAgICBvcHRpb246IHN0cmluZztcbiAgICBkZWxheTogbnVtYmVyO1xuICAgIHN0YXR1czogbnVtYmVyO1xuICAgIHN0cmluZ1ZhbHVlPzogc3RyaW5nO1xuICAgIGVycm9yPzogc3RyaW5nO1xuICAgIHZhbHVlPzogc3RyaW5nO1xuICAgIF91bnJlZ2lzdGVyZWRTdGF0ZT86IGFueTtcbiAgfTtcbiAgcHJpdmF0ZSBzY2VuYXJpb3M7XG4gIHByaXZhdGUgc2VsZWN0ZWRTdGF0ZTtcbiAgcHJpdmF0ZSBhY3RpdmVTY2VuYXJpbztcbiAgcHJpdmF0ZSByZXF1ZXN0czogYW55W107XG4gIHByaXZhdGUgZXhwb3J0U3RhdGVzO1xuICBwcml2YXRlIGNvZGVXcmFwcGVyO1xuXG4gIHN0YXRpYyAkaW5qZWN0ID0gWyckc2NvcGUnLCAnbGVvQ29uZmlndXJhdGlvbicsICckdGltZW91dCddO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgJHNjb3BlLCBwcml2YXRlIGxlb0NvbmZpZ3VyYXRpb24sIHByaXZhdGUgJHRpbWVvdXQpIHtcbiAgICB0aGlzLmRldGFpbCA9IHtcbiAgICAgIG9wdGlvbjogJ3N1Y2Nlc3MnLFxuICAgICAgZGVsYXk6IDAsXG4gICAgICBzdGF0dXM6IDIwMFxuICAgIH07XG5cbiAgICB0aGlzLnN0YXRlcyA9IHRoaXMubGVvQ29uZmlndXJhdGlvbi5nZXRTdGF0ZXMoKTtcbiAgICB0aGlzLnNjZW5hcmlvcyA9IHRoaXMubGVvQ29uZmlndXJhdGlvbi5nZXRTY2VuYXJpb3MoKTtcbiAgICB0aGlzLnJlcXVlc3RzID0gdGhpcy5sZW9Db25maWd1cmF0aW9uLmdldFJlcXVlc3RzTG9nKCk7XG5cbiAgICAkc2NvcGUuJHdhdGNoKCdsZW9XaW5kb3dCb2R5LmRldGFpbC52YWx1ZScsICh2YWx1ZSkgPT4ge1xuICAgICAgaWYgKCF2YWx1ZSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICB0cnkge1xuICAgICAgICB0aGlzLmRldGFpbC5zdHJpbmdWYWx1ZSA9IHZhbHVlID8gSlNPTi5zdHJpbmdpZnkodmFsdWUsIG51bGwsIDQpIDogJyc7XG4gICAgICAgIHRoaXMuZGV0YWlsLmVycm9yID0gJyc7XG4gICAgICB9XG4gICAgICBjYXRjaCAoZSkge1xuICAgICAgICB0aGlzLmRldGFpbC5lcnJvciA9IGUubWVzc2FnZTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgICRzY29wZS4kd2F0Y2goJ2xlb1dpbmRvd0JvZHkuZGV0YWlsLnN0cmluZ1ZhbHVlJywgKHZhbHVlKSA9PiB7XG4gICAgICB0cnkge1xuICAgICAgICB0aGlzLmRldGFpbC52YWx1ZSA9IHZhbHVlID8gSlNPTi5wYXJzZSh2YWx1ZSkgOiB7fTtcbiAgICAgICAgdGhpcy5kZXRhaWwuZXJyb3IgPSAnJztcbiAgICAgIH1cbiAgICAgIGNhdGNoIChlKSB7XG4gICAgICAgIHRoaXMuZGV0YWlsLmVycm9yID0gZS5tZXNzYWdlO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgJHNjb3BlLiRvbignbGVvbmFyZG86c3RhdGVDaGFuZ2VkJywgKGV2ZW50LCBzdGF0ZU9iaikgPT4ge1xuICAgICAgdGhpcy5zdGF0ZXMgPSBsZW9Db25maWd1cmF0aW9uLmdldFN0YXRlcygpO1xuXG4gICAgICB2YXIgc3RhdGU6IGFueSA9IHRoaXMuc3RhdGVzLmZpbHRlcihmdW5jdGlvbiAoc3RhdGUpIHtcbiAgICAgICAgcmV0dXJuIHN0YXRlLm5hbWUgPT09IHN0YXRlT2JqLm5hbWU7XG4gICAgICB9KVswXTtcblxuICAgICAgaWYgKHN0YXRlKSB7XG4gICAgICAgIHN0YXRlLmhpZ2hsaWdodCA9IHRydWU7XG4gICAgICAgICR0aW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICBzdGF0ZS5oaWdobGlnaHQgPSBmYWxzZTtcbiAgICAgICAgfSwgMzAwMCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICByZW1vdmVTdGF0ZUJ5TmFtZShuYW1lKSB7XG4gICAgdGhpcy5zdGF0ZXMgPSB0aGlzLnN0YXRlcy5maWx0ZXIoZnVuY3Rpb24gKHN0YXRlKSB7XG4gICAgICByZXR1cm4gc3RhdGUubmFtZSAhPT0gbmFtZTtcbiAgICB9KTtcbiAgfTtcblxuXG4gIHJlbW92ZU9wdGlvbkJ5TmFtZShzdGF0ZU5hbWUsIG9wdGlvbk5hbWUpIHtcbiAgICB0aGlzLnN0YXRlcy5mb3JFYWNoKGZ1bmN0aW9uIChzdGF0ZTogYW55LCBpKSB7XG4gICAgICBpZiAoc3RhdGUubmFtZSA9PT0gc3RhdGVOYW1lKSB7XG4gICAgICAgIHN0YXRlLm9wdGlvbnMgPSBzdGF0ZS5vcHRpb25zLmZpbHRlcihmdW5jdGlvbiAob3B0aW9uKSB7XG4gICAgICAgICAgcmV0dXJuIG9wdGlvbi5uYW1lICE9PSBvcHRpb25OYW1lO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfTtcblxuXG4gIHJlbW92ZVN0YXRlKHN0YXRlKSB7XG4gICAgdGhpcy5sZW9Db25maWd1cmF0aW9uLnJlbW92ZVN0YXRlKHN0YXRlKTtcbiAgICB0aGlzLnJlbW92ZVN0YXRlQnlOYW1lKHN0YXRlLm5hbWUpO1xuICB9O1xuXG4gIHJlbW92ZU9wdGlvbihzdGF0ZSwgb3B0aW9uKSB7XG4gICAgaWYgKHN0YXRlLm9wdGlvbnMubGVuZ3RoID09PSAxKSB7XG4gICAgICB0aGlzLnJlbW92ZVN0YXRlKHN0YXRlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5sZW9Db25maWd1cmF0aW9uLnJlbW92ZU9wdGlvbihzdGF0ZSwgb3B0aW9uKTtcbiAgICAgIHRoaXMucmVtb3ZlT3B0aW9uQnlOYW1lKHN0YXRlLm5hbWUsIG9wdGlvbi5uYW1lKTtcbiAgICAgIHN0YXRlLmFjdGl2ZU9wdGlvbiA9IHN0YXRlLm9wdGlvbnNbMF07XG4gICAgfVxuICB9O1xuXG4gIGVkaXRTdGF0ZShzdGF0ZSkge1xuICAgIHRoaXMuZWRpdGVkU3RhdGUgPSBhbmd1bGFyLmNvcHkoc3RhdGUpO1xuICAgIHRoaXMuZWRpdGVkU3RhdGUuZGF0YVN0cmluZ1ZhbHVlID0gSlNPTi5zdHJpbmdpZnkodGhpcy5lZGl0ZWRTdGF0ZS5hY3RpdmVPcHRpb24uZGF0YSk7XG4gIH07XG5cbiAgb25FZGl0T3B0aW9uU3VjY2VzcyhzdHIpIHtcbiAgICB0aGlzLmVkaXRlZFN0YXRlLmFjdGl2ZU9wdGlvbi5kYXRhID0gSlNPTi5wYXJzZShzdHIpO1xuICAgIHRoaXMuZWRpdGVkU3RhdGUuZXJyb3IgPSAnJztcbiAgfTtcblxuICBvbkVkaXRPcHRpb25Kc29uRXJyb3IobXNnKSB7XG4gICAgdGhpcy5lZGl0ZWRTdGF0ZS5lcnJvciA9IG1zZztcbiAgfTtcblxuICBzYXZlRWRpdGVkU3RhdGUoKSB7XG4gICAgdGhpcy5sZW9Db25maWd1cmF0aW9uLmFkZE9yVXBkYXRlU2F2ZWRTdGF0ZSh0aGlzLmVkaXRlZFN0YXRlKTtcbiAgICB0aGlzLmNsb3NlRWRpdGVkU3RhdGUoKTtcbiAgfTtcblxuICBjbG9zZUVkaXRlZFN0YXRlKCkge1xuICAgIHRoaXMuZWRpdGVkU3RhdGUgPSBudWxsO1xuICB9O1xuXG4gIG5vdEhhc1VybChvcHRpb24pIHtcbiAgICByZXR1cm4gIW9wdGlvbi51cmw7XG4gIH07XG5cbiAgaGFzVXJsKG9wdGlvbikge1xuICAgIHJldHVybiAhIW9wdGlvbi51cmw7XG4gIH07XG5cbiAgZGVhY3RpdmF0ZSgpIHtcbiAgICB0aGlzLnN0YXRlcy5mb3JFYWNoKGZ1bmN0aW9uIChzdGF0ZTogYW55KSB7XG4gICAgICBzdGF0ZS5hY3RpdmUgPSBmYWxzZTtcbiAgICB9KTtcbiAgICB0aGlzLmxlb0NvbmZpZ3VyYXRpb24uZGVhY3RpdmF0ZUFsbFN0YXRlcygpO1xuICB9O1xuXG4gIHRvZ2dsZVN0YXRlKHN0YXRlKSB7XG4gICAgc3RhdGUuYWN0aXZlID0gIXN0YXRlLmFjdGl2ZTtcbiAgICB0aGlzLnVwZGF0ZVN0YXRlKHN0YXRlKTtcbiAgfVxuXG5cbiAgdXBkYXRlU3RhdGUoc3RhdGUpIHtcbiAgICBpZiAoc3RhdGUuYWN0aXZlKSB7XG4gICAgICB0aGlzLmxlb0NvbmZpZ3VyYXRpb24uYWN0aXZhdGVTdGF0ZU9wdGlvbihzdGF0ZS5uYW1lLCBzdGF0ZS5hY3RpdmVPcHRpb24ubmFtZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMubGVvQ29uZmlndXJhdGlvbi5kZWFjdGl2YXRlU3RhdGUoc3RhdGUubmFtZSk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuc2VsZWN0ZWRTdGF0ZSA9PT0gc3RhdGUpIHtcbiAgICAgIHRoaXMuZWRpdFN0YXRlKHN0YXRlKTtcbiAgICB9XG4gIH07XG5cbiAgYWN0aXZhdGVTY2VuYXJpbyhzY2VuYXJpbykge1xuICAgIHRoaXMuYWN0aXZlU2NlbmFyaW8gPSBzY2VuYXJpbztcbiAgICB0aGlzLmxlb0NvbmZpZ3VyYXRpb24uc2V0QWN0aXZlU2NlbmFyaW8oc2NlbmFyaW8pO1xuICAgIHRoaXMuc3RhdGVzID0gdGhpcy5sZW9Db25maWd1cmF0aW9uLmdldFN0YXRlcygpO1xuICB9XG5cbiAgc3RhdGVJdGVtU2VsZWN0ZWQoc3RhdGUpIHtcbiAgICBpZiAoc3RhdGUgPT09IHRoaXMuc2VsZWN0ZWRTdGF0ZSkge1xuICAgICAgdGhpcy5lZGl0ZWRTdGF0ZSA9IHRoaXMuc2VsZWN0ZWRTdGF0ZSA9IG51bGw7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuc2VsZWN0ZWRTdGF0ZSA9IHN0YXRlO1xuICAgICAgdGhpcy5lZGl0U3RhdGUoc3RhdGUpO1xuICAgIH1cbiAgfVxuXG4gIHJlcXVlc3RTZWxlY3QocmVxdWVzdDogYW55KSB7XG4gICAgdmFyIG9wdGlvbk5hbWU7XG4gICAgdGhpcy5yZXF1ZXN0cy5mb3JFYWNoKGZ1bmN0aW9uIChyZXF1ZXN0OiBhbnkpIHtcbiAgICAgIHJlcXVlc3QuYWN0aXZlID0gZmFsc2U7XG4gICAgfSk7XG5cbiAgICByZXF1ZXN0LmFjdGl2ZSA9IHRydWU7XG5cbiAgICBpZiAocmVxdWVzdC5zdGF0ZSAmJiByZXF1ZXN0LnN0YXRlLm5hbWUpIHtcbiAgICAgIG9wdGlvbk5hbWUgPSByZXF1ZXN0LnN0YXRlLm5hbWUgKyAnIG9wdGlvbiAnICsgcmVxdWVzdC5zdGF0ZS5vcHRpb25zLmxlbmd0aDtcbiAgICB9XG5cbiAgICBhbmd1bGFyLmV4dGVuZCh0aGlzLmRldGFpbCwge1xuICAgICAgc3RhdGU6IChyZXF1ZXN0LnN0YXRlICYmIHJlcXVlc3Quc3RhdGUubmFtZSkgfHwgJycsXG4gICAgICBvcHRpb246IG9wdGlvbk5hbWUgfHwgJycsXG4gICAgICBkZWxheTogMCxcbiAgICAgIHN0YXR1czogcmVxdWVzdC5zdGF0dXMgfHwgMjAwLFxuICAgICAgc3RhdGVBY3RpdmU6ICEhcmVxdWVzdC5zdGF0ZSxcbiAgICAgIHZhbHVlOiByZXF1ZXN0LmRhdGEgfHwge31cbiAgICB9KTtcbiAgICB0aGlzLmRldGFpbC5fdW5yZWdpc3RlcmVkU3RhdGUgPSByZXF1ZXN0O1xuICB9XG5cbiAgZ2V0U3RhdGVzRm9yRXhwb3J0KCkge1xuICAgIHRoaXMuZXhwb3J0U3RhdGVzID0gdGhpcy5sZW9Db25maWd1cmF0aW9uLmdldFN0YXRlcygpO1xuICB9XG5cbiAgZG93bmxvYWRDb2RlKCl7XG4gICAgdGhpcy5jb2RlV3JhcHBlciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZXhwb3J0ZWRDb2RlXCIpO1xuICAgIGxldCBjb2RlVG9TdHI7XG4gICAgaWYgKHRoaXMuY29kZVdyYXBwZXIuaW5uZXJUZXh0KXtcbiAgICAgIGNvZGVUb1N0ciA9IHRoaXMuY29kZVdyYXBwZXIuaW5uZXJUZXh0O1xuICAgIH1cbiAgICBlbHNlIGlmIChYTUxTZXJpYWxpemVyKXtcbiAgICAgIGNvZGVUb1N0ciA9IG5ldyBYTUxTZXJpYWxpemVyKCkuc2VyaWFsaXplVG9TdHJpbmcodGhpcy5jb2RlV3JhcHBlcik7XG4gICAgfVxuICAgIHdpbmRvdy5vcGVuKCdkYXRhOmFwcGxpY2F0aW9uL29jdGV0LXN0cmVhbTtmaWxlbmFtZT1MZW9uYXJkby1TdGF0ZXMudHh0LCcgKyBlbmNvZGVVUklDb21wb25lbnQoY29kZVRvU3RyKSwgJ0xlb25hcmRvLVN0YXRlcy50eHQnKTtcblxuICB9XG5cbn1cbiJdfQ==

;

(function(module) {
try {
  module = angular.module('leonardo.templates');
} catch (e) {
  module = angular.module('leonardo.templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('request.html',
    '<a href="#" class="leo-list-item" ng-click="leoRequest.select()" ng-class="{active: leoRequest.request.active}"><span class="leo-request-verb {{leoRequest.request.verb.toLowerCase()}}">{{leoRequest.request.verb}}</span> <span class="leo-request-name">{{leoRequest.request.url}}</span> <span ng-if="!!leoRequest.request.state" class="leo-request leo-request-existing">{{leoRequest.request.state.name}}</span> <span ng-if="!leoRequest.request.state" class="leo-request leo-request-new">new</span> <span ng-if="!!leoRequest.request.state && leoRequest.request.state.active" class="leo-request leo-request-mocked">mocked</span></a>');
}]);
})();

(function(module) {
try {
  module = angular.module('leonardo.templates');
} catch (e) {
  module = angular.module('leonardo.templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('select.html',
    '<div class="leo-drop-down leo-dropdown-entity-{{leoSelect.entityId}}" ng-disabled="leoSelect.disabled()"><div ng-click="leoSelect.toggle($event)" class="leo-drop-down-selected leo-dropdown-entity-{{leoSelect.entityId}}" title="{{leoSelect.state.activeOption.name}}">{{leoSelect.state.activeOption.name}} <span class="leo-drop-down-icon">+</span></div><div ng-show="leoSelect.open" class="leo-drop-down-items"><div class="leo-drop-down-item" ng-repeat="option in leoSelect.state.options" ng-click="leoSelect.selectOption($event, option)"><span class="leo-local-storage" ng-if="option.from_local"></span> <span class="leo-delete" ng-click="leoSelect.removeOption($event, option)">×</span> <span class="leo-drop-down-item-name" title="{{option.name}}">{{option.name}}</span></div></div></div>');
}]);
})();

(function(module) {
try {
  module = angular.module('leonardo.templates');
} catch (e) {
  module = angular.module('leonardo.templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('state-item.html',
    '<div><div class="onoffswitch"><input ng-checked="leoStateItem.state.active" class="onoffswitch-checkbox" id="{{leoStateItem.state.name}}" type="checkbox" name="{{leoStateItem.state.name}}" value="{{leoStateItem.state.name}}"> <label class="onoffswitch-label" for="{{leoStateItem.state.name}}" ng-click="leoStateItem.toggleClick($event)"><span class="onoffswitch-inner"></span> <span class="onoffswitch-switch"></span></label></div></div><div ng-if="!leoStateItem.ajaxState" class="leo-request-verb non-ajax">Custom</div><div ng-if="leoStateItem.ajaxState"><div class="leo-request-verb {{leoStateItem.state.verb.toLowerCase()}}">{{leoStateItem.state.verb}}</div></div><div class="leo-expand" ng-click="leoStateItem.editClick(leoStateItem.state)"><h4>{{leoStateItem.state.name}}</h4><span ng-if="leoStateItem.ajaxState" class="url">{{leoStateItem.state.url}}</span></div><div><leo-select state="leoStateItem.state" disabled="!leoStateItem.state.active" on-change="leoStateItem.updateState(state)" on-delete="leoStateItem.removeOption(state,option)"></leo-select></div><button ng-click="leoStateItem.removeState($event)" title="Remove State">Remove</button>');
}]);
})();

(function(module) {
try {
  module = angular.module('leonardo.templates');
} catch (e) {
  module = angular.module('leonardo.templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('window-body.html',
    '<div class="leonardo-window-body"><div ng-switch="leonardo.activeTab" class="leonardo-window-options"><div ng-switch-when="recorder" class="leonardo-recorder"><div class="leo-list"><div class="list-group"><leo-request ng-repeat="request in leoWindowBody.requests" request="request" on-select="leoWindowBody.requestSelect(request)"></leo-request></div></div><div class="leo-detail" ng-show="leoWindowBody.hasActiveOption()"><div class="leo-detail-header"><div ng-if="!leoWindowBody.detail.stateActive"><span>Add new state:</span> <input class="leo-detail-state" ng-model="leoWindowBody.detail.state" placeholder="Enter state name"></div><div ng-if="leoWindowBody.detail.stateActive" class="leo-detail-state">Add mocked response for "{{leoWindowBody.detail.state}}"</div></div><div class="leo-detail-option"><div>Response name: <input ng-model="leoWindowBody.detail.option"></div><div>Status code: <input ng-model="leoWindowBody.detail.status"></div><div>Delay: <input ng-model="leoWindowBody.detail.delay"></div><div class="leo-detail-option-json">Response JSON:<div class="leo-error">{{leoWindowBody.detail.error}}</div><textarea ng-model="leoWindowBody.detail.stringValue"></textarea></div></div><div class="leo-action-row"><button ng-click="leoWindowBody.saveUnregisteredState()">{{ leoWindowBody.detail.stateActive ? \'Add Option\' : \'Add State\' }}</button></div></div></div><div ng-switch-when="export" class="leonardo-export" style="padding: 30px"><button class="exportButtons" ngclipboard="" data-clipboard-target="#exportedCode">Copy To Clipboard</button> <button class="exportButtons" ng-click="leoWindowBody.downloadCode()">Download Code</button> <code contenteditable="" ng-init="leoWindowBody.getStatesForExport()">\n' +
    '\n' +
    '        <div id="exportedCode">\n' +
    '          <div>angular.module(\'leonardo\').run([\'leoConfiguration\', function(leoConfiguration) {</div>\n' +
    '          <div ng-repeat="state in leoWindowBody.exportStates">\n' +
    '            <div style="margin-left: 10px">leoConfiguration.addStates([</div>\n' +
    '            <pre style="margin-left: 20px">{{state | json}}</pre>\n' +
    '            <div style="margin-left: 10px">])</div>\n' +
    '          </div>\n' +
    '        </div>\n' +
    '\n' +
    '        <div>}])</div>\n' +
    '\n' +
    '      </code></div><div ng-switch-when="scenarios" class="leonardo-activate"><div class="leonardo-menu"><div>SCENARIOS</div><ul><li ng-class="{ \'selected\': scenario === leoWindowBody.activeScenario }" ng-repeat="scenario in leoWindowBody.scenarios" ng-click="leoWindowBody.activateScenario(scenario)">{{scenario}}</li></ul></div><ul><li><div class="states-filter-wrapper"><label for="filter" class="states-filter-label">Search for state</label> <input id="filter" class="states-filter" type="text" ng-model="leoWindowBody.filter"></div></li><li class="request-item" ng-repeat="state in nonAjaxState = (leoWindowBody.states | filter:leoWindowBody.notHasUrl | filter:{name: leoWindowBody.filter}) track by $index" ng-class="{ \'leo-highlight\': state.highlight, selected:leoWindowBody.selectedState === state}"><leo-state-item ng-class="{}" state="state" ajax-state="false" on-toggle-click="leoWindowBody.toggleState(state)" on-option-changed="leoWindowBody.updateState(state, option)" on-remove-option="leoWindowBody.removeOption(state,option)" on-remove-state="leoWindowBody.removeState(state)" on-edit-click="leoWindowBody.stateItemSelected(state$)"></leo-state-item></li><li class="request-item" ng-repeat="state in ajaxReuslts = (leoWindowBody.states | filter:leoWindowBody.hasUrl | filter:{name: leoWindowBody.filter}) track by $index" ng-class="{ \'leo-highlight\': state.highlight, selected:leoWindowBody.selectedState === state}"><leo-state-item ng-class="{}" state="state" ajax-state="true" on-toggle-click="leoWindowBody.toggleState(state)" on-option-changed="leoWindowBody.updateState(state, option)" on-remove-option="leoWindowBody.removeOption(state,option)" on-remove-state="leoWindowBody.removeState(state)" on-edit-click="leoWindowBody.stateItemSelected(state$)"></leo-state-item></li><li ng-show="!ajaxReuslts.length && !nonAjaxState.length">No Results Found</li></ul><div class="edit-state" ng-class="{visible:!!leoWindowBody.editedState}"><div class="leonardo-edit-option" ng-if="!!leoWindowBody.editedState"><div class="leo-detail"><div class="leo-detail-option"><span class="title">Edit option <b>{{leoWindowBody.editedState.activeOption.name}}</b> for state <b>{{leoWindowBody.editedState.name}}</b></span><div>Status code: <input ng-model="leoWindowBody.editedState.activeOption.status"></div><div>Delay: <input ng-model="leoWindowBody.editedState.activeOption.delay"></div><div class="leo-detail-option-json">Response JSON:<div class="leo-error">{{leoWindowBody.editedState.error}}</div><leo-json-formatter json-string="leoWindowBody.editedState.dataStringValue" on-error="leoWindowBody.onEditOptionJsonError(msg)" on-success="leoWindowBody.onEditOptionSuccess(value)"></leo-json-formatter></div></div><div class="leo-action-row"><button ng-click="leoWindowBody.saveEditedState()">Save</button> <button ng-click="leoWindowBody.closeEditedState()">Cancel</button></div></div></div></div></div><div ng-switch-when="test" class="leonardo-test"><div><label for="url"></label>URL: <input id="url" type="text" ng-model="leoWindowBody.test.url"> <input type="button" ng-click="leoWindowBody.submit(test.url)" value="submit"></div><textarea>{{leoWindowBody.test.value | json}}</textarea></div></div></div>');
}]);
})();

(function (doc, cssText) {
    var styleEl = doc.createElement("style");
    doc.getElementsByTagName("head")[0].appendChild(styleEl);
    if (styleEl.styleSheet) {
        if (!styleEl.styleSheet.disabled) {
            styleEl.styleSheet.cssText = cssText;
        }
    } else {
        try {
            styleEl.innerHTML = cssText;
        } catch (ignore) {
            styleEl.innerText = cssText;
        }
    }
}(document, ".onoffswitch {\n" +
"  transform: scale(0.8);\n" +
"  position: relative;\n" +
"  left: -8px;\n" +
"  width: 85px;\n" +
"  -webkit-user-select: none;\n" +
"  -moz-user-select: none;\n" +
"  -ms-user-select: none;\n" +
"}\n" +
".onoffswitch-checkbox {\n" +
"  display: none;\n" +
"}\n" +
".onoffswitch-label {\n" +
"  display: block;\n" +
"  overflow: hidden;\n" +
"  cursor: pointer;\n" +
"  border: 2px solid #999999;\n" +
"  border-radius: 20px;\n" +
"}\n" +
".onoffswitch-inner {\n" +
"  display: block;\n" +
"  width: 200%;\n" +
"  margin-left: -100%;\n" +
"  -moz-transition: margin 0.3s ease-in 0s;\n" +
"  -webkit-transition: margin 0.3s ease-in 0s;\n" +
"  -o-transition: margin 0.3s ease-in 0s;\n" +
"  transition: margin 0.3s ease-in 0s;\n" +
"}\n" +
".onoffswitch-inner:before,\n" +
".onoffswitch-inner:after {\n" +
"  display: block;\n" +
"  float: left;\n" +
"  width: 50%;\n" +
"  height: 30px;\n" +
"  padding: 0;\n" +
"  line-height: 30px;\n" +
"  font-size: 14px;\n" +
"  color: white;\n" +
"  font-family: Trebuchet, Arial, sans-serif;\n" +
"  font-weight: bold;\n" +
"  -moz-box-sizing: border-box;\n" +
"  -webkit-box-sizing: border-box;\n" +
"  box-sizing: border-box;\n" +
"}\n" +
".onoffswitch-inner:before {\n" +
"  content: \"ON\";\n" +
"  padding-left: 10px;\n" +
"  background-color: #2FCCFF;\n" +
"  color: #FFFFFF;\n" +
"}\n" +
".onoffswitch-inner:after {\n" +
"  content: \"OFF\";\n" +
"  padding-right: 10px;\n" +
"  background-color: #EEEEEE;\n" +
"  color: #999999;\n" +
"  text-align: right;\n" +
"}\n" +
".onoffswitch-switch {\n" +
"  display: block;\n" +
"  width: 18px;\n" +
"  margin: 6px;\n" +
"  background: #FFFFFF;\n" +
"  border: 2px solid #999999;\n" +
"  border-radius: 20px;\n" +
"  position: absolute;\n" +
"  top: 0;\n" +
"  bottom: 0;\n" +
"  right: 56px;\n" +
"  -moz-transition: all 0.3s ease-in 0s;\n" +
"  -webkit-transition: all 0.3s ease-in 0s;\n" +
"  -o-transition: all 0.3s ease-in 0s;\n" +
"  transition: all 0.3s ease-in 0s;\n" +
"}\n" +
".onoffswitch-checkbox:checked + .onoffswitch-label .onoffswitch-inner {\n" +
"  margin-left: 0;\n" +
"}\n" +
".onoffswitch-checkbox:checked + .onoffswitch-label .onoffswitch-switch {\n" +
"  right: 0px;\n" +
"}\n" +
".leonardo-activator {\n" +
"  position: fixed;\n" +
"  right: 40px;\n" +
"  bottom: 40px;\n" +
"  width: 128px;\n" +
"  cursor: pointer;\n" +
"  height: 110px;\n" +
"  z-index: 99999;\n" +
"  background-image: url('data:image/png;base64,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');\n" +
"}\n" +
"@-webkit-keyframes leo-highlight-animation {\n" +
"  0% {\n" +
"    background: none;\n" +
"  }\n" +
"  20% {\n" +
"    background: #f08222;\n" +
"  }\n" +
"  100% {\n" +
"    background: none;\n" +
"  }\n" +
"}\n" +
"@keyframes leo-highlight-animation {\n" +
"  0% {\n" +
"    background: none;\n" +
"  }\n" +
"  20% {\n" +
"    background: #f08222;\n" +
"  }\n" +
"  100% {\n" +
"    background: none;\n" +
"  }\n" +
"}\n" +
".exportButtons {\n" +
"  float: right;\n" +
"  margin-right: 30px;\n" +
"  margin-top: 30px;\n" +
"  border: 2px solid;\n" +
"  border-radius: 6px;\n" +
"  width: 180px;\n" +
"  height: 42px;\n" +
"  font-size: 110%;\n" +
"}\n" +
".leonardo-header {\n" +
"  position: absolute;\n" +
"  z-index: 1;\n" +
"  top: 0;\n" +
"  left: 0;\n" +
"  right: 0;\n" +
"  border-bottom: 1px solid #cccccc;\n" +
"  display: inline-block;\n" +
"  min-height: 44px;\n" +
"}\n" +
".leonardo-header .menu {\n" +
"  font-size: 1.5em;\n" +
"  color: #666666;\n" +
"  text-align: left;\n" +
"  font-weight: bold;\n" +
"  height: 26px;\n" +
"}\n" +
".leonardo-header .menu ul {\n" +
"  margin: 0 20px;\n" +
"  padding: 0;\n" +
"}\n" +
".leonardo-header .menu ul > li {\n" +
"  display: block;\n" +
"  line-height: 44px;\n" +
"  margin-right: 20px;\n" +
"  float: left;\n" +
"  text-align: center;\n" +
"  text-transform: uppercase;\n" +
"  font-size: 12px;\n" +
"  width: 170px;\n" +
"  cursor: pointer;\n" +
"}\n" +
".leonardo-header .menu ul > li.leo-selected-tab {\n" +
"  border-top: 3px solid #f08222;\n" +
"}\n" +
".leonardo-header .menu ul > li:first-child {\n" +
"  font-size: 20px;\n" +
"  text-align: left;\n" +
"  padding-top: 3px;\n" +
"}\n" +
".leonardo-window {\n" +
"  position: absolute;\n" +
"  top: 0;\n" +
"  right: 0;\n" +
"  left: 0;\n" +
"  height: 100%;\n" +
"  overflow: auto;\n" +
"  background-color: white;\n" +
"  z-index: 9999;\n" +
"}\n" +
".leonardo-window .leonardo-window-body {\n" +
"  padding-top: 48px;\n" +
"  height: 100%;\n" +
"  color: #666666;\n" +
"}\n" +
".leonardo-window .leonardo-window-body .leo-highlight {\n" +
"  -webkit-animation: leo-highlight-animation 1s linear 1;\n" +
"  animation: leo-highlight-animation 1s linear 1;\n" +
"}\n" +
".leonardo-window .leonardo-window-body .request-item {\n" +
"  cursor: pointer;\n" +
"}\n" +
".leonardo-window .leonardo-window-body .request-item:nth-child(even) {\n" +
"  background: #F2F2F2;\n" +
"}\n" +
".leonardo-window .leonardo-window-body .request-item:hover {\n" +
"  background: rgba(47, 204, 255, 0.32);\n" +
"}\n" +
".leonardo-window .leonardo-window-body .request-item.selected {\n" +
"  background: #A6A6A6;\n" +
"  color: white;\n" +
"}\n" +
".leonardo-window .states-filter-wrapper {\n" +
"  margin-left: 0;\n" +
"}\n" +
".leonardo-window .states-filter-wrapper .states-filter-label {\n" +
"  display: inline;\n" +
"}\n" +
".leonardo-window .states-filter-wrapper .states-filter {\n" +
"  height: 28px;\n" +
"  font-size: 16px;\n" +
"  width: 200px;\n" +
"  outline: none;\n" +
"  margin-bottom: 8px;\n" +
"}\n" +
".leonardo-window .states-filter-wrapper #filter {\n" +
"  border-width: 0 0 1px 0;\n" +
"  border-color: #666;\n" +
"}\n" +
".pull-top-closed .leonardo-window {\n" +
"  z-index: -4;\n" +
"}\n" +
".pull-top .leonardo-window {\n" +
"  position: fixed;\n" +
"  overflow: auto;\n" +
"  bottom: 0;\n" +
"  height: 100%;\n" +
"  border-bottom: 1px solid black;\n" +
"  -webkit-transition: height 1s ease 0s;\n" +
"  -moz-transition: height 1s ease 0s;\n" +
"  -o-transition: height 1s ease 0s;\n" +
"  transition: height 1s ease 0s;\n" +
"}\n" +
".pull-top .leonardo-window .leonardo-header {\n" +
"  z-index: 1;\n" +
"}\n" +
".leonardo-window .tabs {\n" +
"  width: 100%;\n" +
"  display: flex;\n" +
"  height: 100px;\n" +
"}\n" +
".leonardo-window .tabs > div {\n" +
"  display: flex;\n" +
"  justify-content: center;\n" +
"  flex-direction: column;\n" +
"  text-align: center;\n" +
"  flex-grow: 1;\n" +
"  margin: 10px;\n" +
"  border: 1px solid grey;\n" +
"  font-size: 24px;\n" +
"  cursor: pointer;\n" +
"}\n" +
".leonardo-window .tabs > div.selected {\n" +
"  background-color: grey;\n" +
"  color: white;\n" +
"  cursor: auto;\n" +
"}\n" +
".leonardo-window .leonardo-window-options {\n" +
"  height: 100%;\n" +
"}\n" +
".leonardo-window select {\n" +
"  height: 25px;\n" +
"}\n" +
".leonardo-window button,\n" +
".leonardo-window input[type=\"button\"],\n" +
".leonardo-window select {\n" +
"  background: #219161;\n" +
"  color: white;\n" +
"  border: 0;\n" +
"  font-size: 13px;\n" +
"}\n" +
".leonardo-window input [type=\"text\"],\n" +
".leonardo-window textarea {\n" +
"  border: 1px solid #dddddd;\n" +
"}\n" +
".leo-detail-option {\n" +
"  display: flex;\n" +
"  font-size: 13px;\n" +
"  flex-direction: column;\n" +
"}\n" +
".leo-detail-option div {\n" +
"  margin: 5px 0;\n" +
"}\n" +
".leo-detail-option div input {\n" +
"  width: 150px;\n" +
"}\n" +
".leo-detail-option div.leo-detail-option-json {\n" +
"  flex-direction: column;\n" +
"}\n" +
".leo-detail-option div.leo-detail-option-json textarea {\n" +
"  height: 250px;\n" +
"  width: 100%;\n" +
"  margin-top: 10px;\n" +
"  font-size: 13px;\n" +
"  border: 1px solid #eee;\n" +
"}\n" +
".leo-detail-option div.leo-detail-option-json textarea:focus {\n" +
"  outline: none;\n" +
"}\n" +
".leo-detail-option input {\n" +
"  border-width: 0 0 1px 0;\n" +
"  outline: none;\n" +
"  font-size: 13px;\n" +
"  margin-left: 5px;\n" +
"  width: 200px;\n" +
"}\n" +
".leonardo-activate {\n" +
"  display: flex;\n" +
"  height: 100%;\n" +
"}\n" +
".leonardo-activate .leonardo-menu {\n" +
"  padding: 5px;\n" +
"  flex: 0.5;\n" +
"  border-right: 1px solid #cccccc;\n" +
"}\n" +
".leonardo-activate .leonardo-menu ul {\n" +
"  margin: 0;\n" +
"  padding: 0;\n" +
"}\n" +
".leonardo-activate .leonardo-menu li {\n" +
"  border-width: 0 0 1px 0;\n" +
"  display: block;\n" +
"  cursor: pointer;\n" +
"  font-size: 13px;\n" +
"}\n" +
".leonardo-activate .leonardo-menu li:hover {\n" +
"  text-decoration: underline;\n" +
"}\n" +
".leonardo-activate > ul {\n" +
"  margin: 0;\n" +
"  flex: 3;\n" +
"  list-style: none;\n" +
"  padding: 5px;\n" +
"}\n" +
".leonardo-activate li {\n" +
"  display: flex;\n" +
"  align-items: center;\n" +
"}\n" +
".leonardo-activate li .leo-expand {\n" +
"  flex: 1;\n" +
"}\n" +
".leonardo-activate li .leo-expand .url {\n" +
"  margin-left: 10px;\n" +
"  font-size: 13px;\n" +
"}\n" +
".leonardo-activate li button {\n" +
"  padding: 5px;\n" +
"  margin-left: 10px;\n" +
"}\n" +
".leonardo-activate h4 {\n" +
"  padding: 0;\n" +
"  display: inline;\n" +
"  font-size: 14px;\n" +
"  font-weight: 600;\n" +
"}\n" +
".leonardo-activate select {\n" +
"  width: 200px;\n" +
"}\n" +
".leonardo-activate select[disabled] {\n" +
"  background: rgba(33, 145, 97, 0.5);\n" +
"}\n" +
".leonardo-recorder {\n" +
"  height: 100%;\n" +
"  display: flex;\n" +
"}\n" +
".leonardo-recorder .leo-list {\n" +
"  flex: 3;\n" +
"  border-right: 1px solid #cccccc;\n" +
"}\n" +
".leonardo-recorder .leo-list ul {\n" +
"  padding: 0;\n" +
"  margin: 0;\n" +
"}\n" +
".leonardo-recorder .leo-list leo-request:nth-child(even) a {\n" +
"  background: #F2F2F2;\n" +
"}\n" +
".leonardo-recorder .leo-list leo-request .leo-list-item {\n" +
"  display: flex;\n" +
"  border-bottom: 1px solid #cccccc;\n" +
"  text-decoration: none;\n" +
"  color: #555;\n" +
"  padding: 5px;\n" +
"  font-size: 13px;\n" +
"}\n" +
".leonardo-recorder .leo-list leo-request .leo-list-item.active {\n" +
"  background-color: #ddd !important;\n" +
"}\n" +
".leonardo-recorder .leo-list leo-request .leo-list-item:hover {\n" +
"  background-color: #f5f5f5;\n" +
"}\n" +
".leonardo-recorder .leo-detail {\n" +
"  flex: 2;\n" +
"  display: flex;\n" +
"  flex-direction: column;\n" +
"  padding: 5px;\n" +
"}\n" +
".leonardo-recorder .leo-detail .leo-detail-header {\n" +
"  border-bottom: 1px solid #cccccc;\n" +
"}\n" +
".leonardo-recorder .leo-detail .leo-detail-header > div {\n" +
"  margin-bottom: 10px;\n" +
"}\n" +
".leonardo-recorder .leo-detail input {\n" +
"  border-width: 0 0 1px 0;\n" +
"  outline: none;\n" +
"  font-size: 13px;\n" +
"  margin-left: 5px;\n" +
"  width: 200px;\n" +
"}\n" +
".leonardo-recorder .leo-detail .leo-row-flex {\n" +
"  flex-direction: column;\n" +
"  font-size: 13px;\n" +
"  padding: 20px;\n" +
"  height: 300px;\n" +
"}\n" +
".leonardo-recorder .leo-detail .leo-error {\n" +
"  color: Red;\n" +
"}\n" +
".leonardo-configure table {\n" +
"  width: 100%;\n" +
"}\n" +
".leonardo-configure table td {\n" +
"  border: 1px solid black;\n" +
"  text-align: center;\n" +
"  vertical-align: middle;\n" +
"}\n" +
".leonardo-configure table th {\n" +
"  border: 1px solid black;\n" +
"}\n" +
".leonardo-configure table td:nth-child(3) {\n" +
"  text-align: left;\n" +
"  vertical-align: middle;\n" +
"}\n" +
".leonardo-test {\n" +
"  padding: 20px;\n" +
"}\n" +
".leonardo-test > div {\n" +
"  display: table;\n" +
"}\n" +
".leonardo-test label,\n" +
".leonardo-test input {\n" +
"  display: table-cell;\n" +
"}\n" +
".leonardo-test input {\n" +
"  padding: 10px;\n" +
"  margin: 0 5px;\n" +
"}\n" +
".leonardo-test textarea {\n" +
"  display: block;\n" +
"  height: 400px;\n" +
"  width: 100%;\n" +
"  margin-top: 20px;\n" +
"}\n" +
".leo-request {\n" +
"  display: inline-block;\n" +
"  padding: 3px 10px;\n" +
"  float: right;\n" +
"  font-size: 12px;\n" +
"  margin: 0 2px;\n" +
"  color: white;\n" +
"  justify-content: flex-end;\n" +
"  white-space: nowrap;\n" +
"}\n" +
".leo-request-name {\n" +
"  flex-grow: 1;\n" +
"  white-space: nowrap;\n" +
"  overflow: hidden;\n" +
"  text-overflow: ellipsis;\n" +
"  padding-right: 5px;\n" +
"  line-height: 25px;\n" +
"}\n" +
".leo-request-verb {\n" +
"  margin-right: 10px;\n" +
"  background: #000;\n" +
"  color: #fff;\n" +
"  text-align: center;\n" +
"  width: 60px;\n" +
"  height: 25px;\n" +
"  line-height: 25px;\n" +
"  font-size: 12px;\n" +
"}\n" +
".leo-request-verb.post {\n" +
"  background: orange;\n" +
"}\n" +
".leo-request-verb.get {\n" +
"  background: green;\n" +
"}\n" +
".leo-request-verb.jsonp {\n" +
"  background: green;\n" +
"}\n" +
".leo-request-verb.delete {\n" +
"  background: red;\n" +
"}\n" +
".leo-request-verb.put {\n" +
"  background: blue;\n" +
"}\n" +
".leo-request-new {\n" +
"  background: #3b6aca;\n" +
"}\n" +
".leo-request-mocked {\n" +
"  background: #219161;\n" +
"}\n" +
".leo-request-existing {\n" +
"  background: #f08222;\n" +
"}\n" +
".leo-drop-down {\n" +
"  background: #219161;\n" +
"  color: #fff;\n" +
"  border: 0;\n" +
"  margin-left: 0;\n" +
"  position: relative;\n" +
"  cursor: default;\n" +
"  width: 200px;\n" +
"  font-size: 13px;\n" +
"}\n" +
".leo-drop-down[disabled] {\n" +
"  background: rgba(33, 145, 97, 0.5);\n" +
"}\n" +
".leo-drop-down .leo-drop-down-selected {\n" +
"  padding-left: 5px;\n" +
"  padding-right: 25px;\n" +
"  height: 26px;\n" +
"  line-height: 26px;\n" +
"  font-size: 13px;\n" +
"  white-space: nowrap;\n" +
"  overflow: hidden;\n" +
"  text-overflow: ellipsis;\n" +
"}\n" +
".leo-drop-down .leo-drop-down-icon {\n" +
"  right: 5px;\n" +
"  top: 50%;\n" +
"  transform: translateY(-50%);\n" +
"  position: absolute;\n" +
"}\n" +
".leo-drop-down .leo-drop-down-items {\n" +
"  z-index: 10;\n" +
"  margin-left: 0;\n" +
"  position: absolute;\n" +
"  left: 0;\n" +
"  border: 1px solid black;\n" +
"  width: 200px;\n" +
"  max-height: 300px;\n" +
"  overflow-y: auto;\n" +
"  padding: 4px 0;\n" +
"  background: white;\n" +
"}\n" +
".leo-drop-down .leo-drop-down-items .leo-drop-down-item {\n" +
"  position: relative;\n" +
"  display: block;\n" +
"  margin-left: 0;\n" +
"  width: 100%;\n" +
"  background: white;\n" +
"  color: black;\n" +
"  height: 26px;\n" +
"}\n" +
".leo-drop-down .leo-drop-down-items .leo-drop-down-item .leo-local-storage {\n" +
"  background-image: url(\"data:image/png;base64,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\");\n" +
"  background-size: 20px;\n" +
"  position: absolute;\n" +
"  background-repeat: no-repeat;\n" +
"  padding: 0;\n" +
"  margin-top: 12px;\n" +
"  right: 16px;\n" +
"  height: 20px;\n" +
"  width: 20px;\n" +
"  display: inline-block;\n" +
"  transform: translateY(-50%);\n" +
"}\n" +
".leo-drop-down .leo-drop-down-items .leo-drop-down-item .leo-delete {\n" +
"  position: absolute;\n" +
"  top: 50%;\n" +
"  right: 5px;\n" +
"  display: inline-block;\n" +
"  cursor: pointer;\n" +
"  transform: translateY(-50%);\n" +
"}\n" +
".leo-drop-down .leo-drop-down-items .leo-drop-down-item:hover {\n" +
"  background: #1FA76D;\n" +
"  opacity: 0.7;\n" +
"  color: #fff;\n" +
"}\n" +
".leo-drop-down .leo-drop-down-items .leo-drop-down-item .leo-drop-down-item-name {\n" +
"  padding-left: 4px;\n" +
"  padding-right: 25px;\n" +
"  display: inline-block;\n" +
"  margin-left: 0;\n" +
"  height: 26px;\n" +
"  width: 100%;\n" +
"  line-height: 26px;\n" +
"  font-size: 13px;\n" +
"  white-space: nowrap;\n" +
"  overflow: hidden;\n" +
"  text-overflow: ellipsis;\n" +
"}\n" +
".edit-state {\n" +
"  transition: width 0.3s;\n" +
"  border-left: 1px solid #ccc;\n" +
"  width: 0px;\n" +
"}\n" +
".edit-state.visible {\n" +
"  width: 300px;\n" +
"}\n" +
".leonardo-edit-option {\n" +
"  padding: 5px;\n" +
"  width: 300px;\n" +
"}\n" +
"leo-state-item {\n" +
"  width: 100%;\n" +
"  display: flex;\n" +
"  align-items: center;\n" +
"}"));

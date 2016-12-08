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
          } catch (e) {
          } // eslint-disable-line no-empty
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
      var F = function () {
      };
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

      stopPropagation: function () {
      },

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

    function log() {
    }

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

  var xdr = {XDomainRequest: global.XDomainRequest};
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
  var sinonXhr = {XMLHttpRequest: global.XMLHttpRequest};
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
      case 0:
        return obj[method]();
      case 1:
        return obj[method](args[0]);
      case 2:
        return obj[method](args[0], args[1]);
      case 3:
        return obj[method](args[0], args[1], args[2]);
      case 4:
        return obj[method](args[0], args[1], args[2], args[3]);
      case 5:
        return obj[method](args[0], args[1], args[2], args[3], args[4]);
    }
  };

  FakeXMLHttpRequest.filters = [];
  FakeXMLHttpRequest.addFilter = function addFilter(fn) {
    this.filters.push(fn);
  };
  var IE6Re = /MSIE 6/;
  FakeXMLHttpRequest.onResponseEnd = function () {
  };
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
        fakeXhr.onreadystatechange.call(fakeXhr, {target: fakeXhr});
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
          if (this.responseHeaders.hasOwnProperty(header) && !/^Set-Cookie2?$/i.test(header)) {
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
      catch (e) {
      } // eslint-disable-line no-empty
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
      throw new TypeError("Fake server response body should be string, but was " + typeof response[2]);
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
            var state = Leonardo.fetchStatesByUrlAndMethod(request.url, request.method);
            var delay;
            if (state && state.activeOption && state.activeOption.hasOwnProperty('delay')) {
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
    function Server() {
    }

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

(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
function leoConfiguration() {
    var _states = [], _scenarios = {}, _requestsLog = [], _savedStates = [], _statesChangedEvent = new CustomEvent('leonardo:setStates'), _eventsElem = document.body, _jsonpCallbacks = {};
    return {
        addState: addState,
        addStates: addStates,
        getActiveStateOption: getActiveStateOption,
        getStates: fetchStates,
        deactivateState: deactivateState,
        toggleActivateAll: toggleActivateAll,
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
        onStateChange: onSetStates,
        statesChanged: statesChanged,
        _logRequest: logRequest,
        _jsonpCallbacks: _jsonpCallbacks
    };
    function upsertOption(state, name, active) {
        var statesStatus = Leonardo.storage.getStates();
        statesStatus[state] = {
            name: name || findStateOption(state).name,
            active: active
        };
        Leonardo.storage.setStates(statesStatus);
        setupJsonpForState(state);
    }
    function setupJsonpForState(stateName) {
        var state = fetchState(stateName);
        if (state.verb && state.verb === 'JSONP') {
            var callbackName = getCallbackName(state);
            state.active ? activeJsonpState(state, callbackName) : deactivateJsonpState(state, callbackName);
        }
    }
    function activeJsonpState(state, callbackName) {
        var funcName = state.name + callbackName;
        if (_jsonpCallbacks[funcName])
            return;
        if (typeof window[callbackName] === 'function') {
            _jsonpCallbacks[funcName] = window[callbackName];
            window[callbackName] = dummyJsonpCallback;
        }
        activateJsonpMObserver();
    }
    function activateJsonpMObserver() {
        if (Leonardo._jsonpMutationObservers) {
            if (!fetchStates().some(function (state) { return state.verb === 'JSONP' && state.active; })) {
                Leonardo._jsonpMutationObservers.forEach(function (mutationObserver) { return mutationObserver && mutationObserver.disconnect(); });
                delete Leonardo._jsonpCallbacks;
                delete Leonardo._jsonpMutationObservers;
            }
            return;
        }
        var targets = [document.body, document.head].filter(function (target) { return !!target; });
        var config = { attributes: false, childList: true, characterData: false, subtree: false };
        Leonardo._jsonpMutationObservers = targets.map(function (target) {
            return new MutationObserver(function (mutations) {
                mutations.forEach(function (mutation) {
                    if (mutation.addedNodes &&
                        mutation.addedNodes[0] &&
                        mutation.addedNodes[0].tagName &&
                        mutation.addedNodes[0].tagName.toLowerCase() === 'script') {
                        var scriptNode = mutation.addedNodes[0];
                        var state = fetchStatesByUrlAndMethod(scriptNode.src, 'JSONP');
                        if (state && state.active) {
                            var callbackName = getCallbackName(state);
                            var funcName = state.name + callbackName;
                            if (!_jsonpCallbacks[funcName]) {
                                activeJsonpState(state, callbackName);
                            }
                            setTimeout(_jsonpCallbacks[funcName].bind(null, state.activeOption.data), state.activeOption.delay || 0);
                        }
                    }
                });
            });
        });
        targets.forEach(function (target, index) { return Leonardo._jsonpMutationObservers[index].observe(target, config); });
    }
    function dummyJsonpCallback() {
    }
    function deactivateJsonpState(state, callbackName) {
        var funcName = state.name + callbackName;
        if (_jsonpCallbacks[funcName]) {
            window[callbackName] = _jsonpCallbacks[funcName];
            delete _jsonpCallbacks[funcName];
        }
        activateJsonpMObserver();
    }
    function getCallbackName(state) {
        if (state.jsonpCallback) {
            return state.jsonpCallback;
        }
        var postfix = state.url.split('callback=')[1];
        return postfix.split('&')[0];
    }
    function fetchStatesByUrlAndMethod(url, method) {
        return fetchStates().filter(function (state) {
            return state.url &&
                (new RegExp(state.url).test(url) || state.url === url) &&
                state.verb.toLowerCase() === method.toLowerCase();
        })[0];
    }
    function fetchStates() {
        var activeStates = Leonardo.storage.getStates();
        var statesCopy = _states.map(function (state) {
            return Object.assign({}, state);
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
    function fetchState(name) {
        return fetchStates().filter(function (state) {
            return state.name === name;
        })[0];
    }
    function toggleActivateAll(flag) {
        var statesStatus = fetchStates();
        var statuses = statesStatus.reduce(function (obj, s) {
            var optionName = s.activeOption ? s.activeOption.name : s.options[0].name;
            obj[s.name] = { name: optionName, active: flag };
            return obj;
        }, {});
        Leonardo.storage.setStates(statuses);
        return statesStatus;
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
    }
    function addStates(statesArr, overrideOption) {
        if (overrideOption === void 0) { overrideOption = false; }
        if (Array.isArray(statesArr)) {
            statesArr.forEach(function (stateObj) {
                addState(stateObj, overrideOption);
            });
        }
        else {
            console.warn('leonardo: addStates should get an array');
        }
    }
    function upsert(configObj, overrideOption) {
        var verb = configObj.verb || 'GET', state = configObj.state, name = configObj.name, from_local = configObj.from_local, url = configObj.url, status = configObj.status || 200, data = (typeof configObj.data !== 'undefined') ? configObj.data : {}, delay = configObj.delay || 0;
        var defaultState = {};
        var defaultOption = {};
        if (!state) {
            console.log("leonardo: cannot upsert - state is mandatory");
            return;
        }
        var stateItem = _states.filter(function (_state) {
            return _state.name === state;
        })[0] || defaultState;
        Object.assign(stateItem, {
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
            Object.assign(option, {
                name: name,
                from_local: from_local,
                status: status,
                data: data,
                delay: delay
            });
        }
        else if (!option) {
            Object.assign(defaultOption, {
                name: name,
                from_local: from_local,
                status: status,
                data: data,
                delay: delay
            });
            stateItem.options.push(defaultOption);
        }
        setupJsonpForState(state);
    }
    function addScenario(scenario, fromLocal) {
        if (fromLocal === void 0) { fromLocal = false; }
        if (scenario && typeof scenario.name === 'string') {
            if (fromLocal) {
                var scenarios = Leonardo.storage.getScenarios();
                scenarios.push(scenario);
                Leonardo.storage.setScenarios(scenarios);
            }
            else {
                _scenarios[scenario.name] = scenario;
            }
        }
        else {
            throw 'addScenario method expects a scenario object with name property';
        }
    }
    function addScenarios(scenarios) {
        scenarios.forEach(function (scenario) {
            addScenario(scenario);
        });
    }
    function getScenarios() {
        var scenarios = Leonardo.storage.getScenarios().map(function (scenario) { return scenario.name; });
        return Object.keys(_scenarios).concat(scenarios);
    }
    function getScenario(name) {
        var states;
        if (_scenarios[name]) {
            states = _scenarios[name].states;
        }
        else {
            states = Leonardo.storage.getScenarios()
                .filter(function (scenario) { return scenario.name === name; })[0].states;
        }
        return states;
    }
    function setActiveScenario(name) {
        var scenario = getScenario(name);
        if (!scenario) {
            console.warn("leonardo: could not find scenario named " + name);
            return;
        }
        toggleActivateAll(false);
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
        _savedStates = Leonardo.storage.getSavedStates();
        addStates(_savedStates, true);
    }
    function addSavedState(state) {
        _savedStates.push(state);
        Leonardo.storage.setSavedStates(_savedStates);
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
            Leonardo.storage.setSavedStates(_savedStates);
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
        Leonardo.storage.setSavedStates(_savedStates);
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
        Leonardo.storage.setSavedStates(_savedStates);
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
                recorded: !!req.state,
                options: [{
                        name: req.status >= 200 && req.status < 300 ? 'Success' : 'Failure',
                        status: req.status,
                        data: req.data
                    }]
            };
        });
        return requestsArr;
    }
    function onSetStates(fn) {
        _eventsElem && _eventsElem.addEventListener('leonardo:setStates', fn, false);
    }
    function statesChanged() {
        _eventsElem && _eventsElem.dispatchEvent(_statesChangedEvent);
    }
}
exports.leoConfiguration = leoConfiguration;

},{}],2:[function(require,module,exports){
var configuration_srv_1 = require('./configuration.srv');
var storage_srv_1 = require('./storage.srv');
var polyfills_1 = require('./polyfills');
var sinon_srv_1 = require('./sinon.srv');
var ui_root_1 = require('./ui/ui-root');
polyfills_1.polifylls();
window.Leonardo = window.Leonardo || {};
var configuration = configuration_srv_1.leoConfiguration();
var storage = new storage_srv_1.Storage();
Object.assign(window.Leonardo || {}, configuration, { storage: storage });
Leonardo.loadSavedStates();
new sinon_srv_1.Sinon();
new ui_root_1.default();

},{"./configuration.srv":1,"./polyfills":3,"./sinon.srv":4,"./storage.srv":5,"./ui/ui-root":11}],3:[function(require,module,exports){
function polifylls() {
    (function () {
        function CustomEvent(event, params) {
            params = params || { bubbles: false, cancelable: false, detail: undefined };
            var evt = document.createEvent('CustomEvent');
            evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
            return evt;
        }
        CustomEvent.prototype = window['Event'].prototype;
        window['CustomEvent'] = CustomEvent;
    })();
    (function () {
        if (typeof Object.assign != 'function') {
            Object.assign = function (target) {
                'use strict';
                if (target == null) {
                    throw new TypeError('Cannot convert undefined or null to object');
                }
                target = Object(target);
                for (var index = 1; index < arguments.length; index++) {
                    var source = arguments[index];
                    if (source != null) {
                        for (var key in source) {
                            if (Object.prototype.hasOwnProperty.call(source, key)) {
                                target[key] = source[key];
                            }
                        }
                    }
                }
                return target;
            };
        }
    })();
}
exports.polifylls = polifylls;

},{}],4:[function(require,module,exports){
var utils_1 = require('./utils');
var Sinon = (function () {
    function Sinon() {
        this.init();
    }
    Sinon.prototype.init = function () {
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
            var state = Leonardo.fetchStatesByUrlAndMethod(request.url, request.method), activeOption = Leonardo.getActiveStateOption(state.name);
            if (!!activeOption) {
                var responseData = utils_1.default.isFunction(activeOption.data) ? activeOption.data(request) : activeOption.data;
                request.respond(activeOption.status, { "Content-Type": "application/json" }, JSON.stringify(responseData));
                Leonardo._logRequest(request.method, request.url, responseData, activeOption.status);
            }
            else {
                console.warn('could not find a state for the following request', request);
            }
        });
    };
    return Sinon;
})();
exports.Sinon = Sinon;

},{"./utils":27}],5:[function(require,module,exports){
var utils_1 = require('./utils');
var Storage = (function () {
    function Storage() {
        this.APP_PREFIX = Leonardo.APP_PREFIX || '';
        this.STATES_STORE_KEY = this.APP_PREFIX + "leonardo-states";
        this.SAVED_STATES_KEY = this.APP_PREFIX + "leonardo-unregistered-states";
        this.SCENARIOS_STORE_KEY = this.APP_PREFIX + "leonardo-scenarios";
        this.POSITION_KEY = this.APP_PREFIX + "leonardo-position";
    }
    Storage.prototype._getItem = function (key) {
        var item = window.localStorage.getItem(key);
        if (!item) {
            return null;
        }
        return utils_1.default.fromJson(item);
    };
    Storage.prototype._setItem = function (key, data) {
        window.localStorage.setItem(key, utils_1.default.toJson(data));
    };
    Storage.prototype.getStates = function () {
        return this._getItem(this.STATES_STORE_KEY) || {};
    };
    Storage.prototype.getScenarios = function () {
        return this._getItem(this.SCENARIOS_STORE_KEY) || [];
    };
    Storage.prototype.setStates = function (states) {
        this._setItem(this.STATES_STORE_KEY, states);
        Leonardo.statesChanged();
    };
    Storage.prototype.setScenarios = function (scenarios) {
        this._setItem(this.SCENARIOS_STORE_KEY, scenarios);
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
    Storage.prototype.setSavedPosition = function (position) {
        if (!position) {
            return;
        }
        this._setItem(this.POSITION_KEY, position);
    };
    Storage.prototype.getSavedPosition = function () {
        return this._getItem(this.POSITION_KEY);
    };
    return Storage;
})();
exports.Storage = Storage;

},{"./utils":27}],6:[function(require,module,exports){
var ui_utils_1 = require('../ui-utils');
var ui_events_1 = require('../ui-events');
var DropDown = (function () {
    function DropDown(items, activeItem, isDisabled, onSelectItem, onRemoveItem) {
        this.items = items;
        this.activeItem = activeItem;
        this.isDisabled = isDisabled;
        this.onSelectItem = onSelectItem;
        this.onRemoveItem = onRemoveItem;
        this.optionsState = false;
        this.toggleBinded = this.toggleDropDown.bind(this);
        this.closeDropDownBinded = this.closeDropDown.bind(this);
        this.randomID = ui_utils_1.default.guidGenerator();
        this.viewNode = ui_utils_1.default.getElementFromHtml("<div id=\"leonardo-dropdown-" + this.randomID + "\" class=\"leonardo-dropdown\"></div>");
        document.body.addEventListener('click', this.closeDropDownBinded, false);
        ui_events_1.default.on(ui_events_1.default.CLOSE_DROPDOWNS, this.closeDropDownBinded);
    }
    DropDown.prototype.get = function () {
        return this.viewNode;
    };
    DropDown.prototype.render = function () {
        this.viewNode.removeEventListener('click', this.toggleBinded, false);
        this.viewNode.innerHTML = "\n          <div class=\"leonardo-dropdown-selected\" " + this.isDisabledToken() + ">\n            <span class=\"leonardo-dropdown-selected-text\">" + this.activeItem.name + "</span>\n            <span class=\"leonardo-dropdown-selected-arrow\"></span>\n          </div>\n          <div class=\"leonardo-dropdown-options\">\n            <ul class=\"leonardo-dropdown-list\">" + this.getItems().join('') + "</ul>\n          </div>";
        this.viewNode.addEventListener('click', this.toggleBinded, false);
    };
    DropDown.prototype.disableDropDown = function () {
        this.isDisabled = true;
        this.viewNode.querySelector(".leonardo-dropdown-selected").setAttribute('disabled', 'disabled');
    };
    DropDown.prototype.enableDropDown = function () {
        this.isDisabled = false;
        this.viewNode.querySelector(".leonardo-dropdown-selected").removeAttribute('disabled');
    };
    DropDown.prototype.toggleDropDown = function (event) {
        if (this.isDisabled) {
            return;
        }
        if (event && event.target) {
            event.stopPropagation();
        }
        if (event.target['classList'].contains('leonardo-dropdown-item')) {
            this.setActiveItem(event.target['querySelector']('.leonardo-dropdown-item-text').innerHTML);
        }
        else if (event.target['classList'].contains('leonardo-dropdown-item-text')) {
            this.setActiveItem(event.target['innerHTML']);
        }
        else if (event.target['classList'].contains('leonardo-dropdown-item-x')) {
            this.removeItem(event.target['parentNode']);
        }
        if (this.optionsState) {
            this.closeDropDown();
            this.optionsState = false;
        }
        else {
            this.openDropDown();
            this.optionsState = true;
        }
    };
    DropDown.prototype.openDropDown = function () {
        var elem = this.viewNode.querySelector(".leonardo-dropdown-options");
        elem.style.display = 'block';
        var elemRec = elem.getBoundingClientRect();
        var isOverflowed = elemRec.top + elemRec.height > window.innerHeight;
        if (isOverflowed) {
            elem.style.top = -elemRec.height + 'px';
        }
        ui_events_1.default.dispatch(ui_events_1.default.CLOSE_DROPDOWNS, this.viewNode);
    };
    DropDown.prototype.closeDropDown = function (event) {
        var dropDown = this.viewNode.querySelector(".leonardo-dropdown-options");
        if (!dropDown || (event && event.detail === this.viewNode)) {
            return;
        }
        dropDown.style.display = 'none';
    };
    DropDown.prototype.setActiveItem = function (itemName) {
        if (this.activeItem.name === itemName) {
            return;
        }
        this.activeItem = this.getItemByName(itemName);
        this.viewNode.querySelector(".leonardo-dropdown-selected-text")['innerHTML'] = this.activeItem.name;
        this.onSelectItem(this.activeItem);
    };
    DropDown.prototype.getItemByName = function (itemName) {
        var retItem = this.activeItem;
        this.items.some(function (curItem) {
            if (curItem.name === itemName) {
                retItem = curItem;
                return true;
            }
        });
        return retItem;
    };
    DropDown.prototype.getItems = function () {
        return this.items.map(function (item) {
            return "<li class=\"leonardo-dropdown-item\"><span class=\"leonardo-dropdown-item-text\">" + item.name + "</span><span class=\"leonardo-dropdown-item-x\"></span></li>";
        });
    };
    DropDown.prototype.isDisabledToken = function () {
        return this.isDisabled ? 'disabled' : '';
    };
    DropDown.prototype.removeItem = function (item) {
        if (this.items.length <= 1) {
            return;
        }
        var removedItem;
        this.items = this.items.filter(function (curItem) {
            if (curItem.name === item.querySelector('.leonardo-dropdown-item-text')['innerHTML']) {
                removedItem = curItem;
            }
        });
        this.viewNode.querySelector('.leonardo-dropdown-list').removeChild(item);
        this.onRemoveItem(removedItem);
    };
    DropDown.prototype.onDestroy = function () {
        document.body.removeEventListener('click', this.closeDropDownBinded, false);
        this.viewNode.removeEventListener('click', this.toggleBinded, false);
    };
    return DropDown;
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = DropDown;

},{"../ui-events":10,"../ui-utils":14}],7:[function(require,module,exports){
var ui_utils_1 = require('../ui-utils');
var ui_state_srv_1 = require('../ui-state/ui-state.srv');
var HeaderView = (function () {
    function HeaderView(tabList) {
        this.tabList = tabList;
        this.onClickBinded = this.onClick.bind(this);
    }
    HeaderView.prototype.get = function () {
        var template = "<div class=\"leonardo-header-container\">\n        <span class=\"leonardo-header-label \">LEONARDO</span>\n        <span class=\"leonardo-header-tabs\">\n          <ul>\n            " + this.getTabsHtml(0) + "\n          </ul>\n      </span>\n    </div>";
        var launcher = ui_utils_1.default.getElementFromHtml(template);
        launcher.querySelector('ul').addEventListener('click', this.onClickBinded);
        return launcher;
    };
    HeaderView.prototype.getTabsHtml = function (selectedIndex) {
        return this.tabList.map(function (tab, index) {
            var selected = index === selectedIndex ? HeaderView.SELECTED_CLASS_NAME : '';
            return "<li class=\"leonardo-header-tabItem " + selected + "\" data-headertab=\"leonardo-header-" + tab.label + "\" >" + tab.label + "</li>";
        }).join('');
    };
    HeaderView.prototype.onClick = function (event) {
        this.selectTab(event.target['innerHTML']);
    };
    HeaderView.prototype.selectTab = function (tabLabel) {
        document.querySelector("." + HeaderView.SELECTED_CLASS_NAME).classList.remove("leonardo-header-tabItem-selected");
        document.querySelector("[data-headertab=\"leonardo-header-" + tabLabel + "\"]").classList.add(HeaderView.SELECTED_CLASS_NAME);
        ui_state_srv_1.default.getInstance().setCurViewState(tabLabel);
    };
    HeaderView.SELECTED_CLASS_NAME = 'leonardo-header-tabItem-selected';
    return HeaderView;
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = HeaderView;

},{"../ui-state/ui-state.srv":13,"../ui-utils":14}],8:[function(require,module,exports){
var ui_utils_1 = require('../ui-utils');
var ui_events_1 = require('../ui-events');
var Launcher = (function () {
    function Launcher() {
        ui_events_1.default.on('keydown', this.bodyKeypress.bind(this));
        ui_events_1.default.on(ui_events_1.default.TOGGLE_ICON, this.toggleLauncher.bind(this));
    }
    Launcher.prototype.get = function () {
        this.launcher = ui_utils_1.default.getElementFromHtml("<div class=\"leonardo-launcher\"></div>");
        this.launcher.addEventListener('click', this.onClick);
        return this.launcher;
    };
    Launcher.prototype.onClick = function () {
        ui_events_1.default.dispatch(ui_events_1.default.TOGGLE_LAUNCHER);
    };
    Launcher.prototype.bodyKeypress = function (e) {
        if (e.shiftKey && e.ctrlKey && e.keyCode === 76) {
            ui_events_1.default.dispatch(ui_events_1.default.TOGGLE_ICON);
        }
    };
    Launcher.prototype.toggleLauncher = function () {
        this.launcher.style.display = this.launcher.style.display === 'none' ? 'block' : 'none';
    };
    return Launcher;
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Launcher;

},{"../ui-events":10,"../ui-utils":14}],9:[function(require,module,exports){
var ui_utils_1 = require('../ui-utils');
var ui_events_1 = require('../ui-events');
var header_1 = require('../header/header');
var ui_state_data_1 = require('../ui-state/ui-state.data');
var ui_state_srv_1 = require('../ui-state/ui-state.srv');
var views_container_1 = require('../views-container/views-container');
var MainView = (function () {
    function MainView() {
        this.className = 'leonardo-main-view';
        this.hiddenClassName = this.className + "-hidden";
        ui_events_1.default.on('keydown', this.onKeyPress.bind(this));
        this.bodyView = ui_utils_1.default.getElementFromHtml("<div class=\"leonardo-main-view-body\"></div>");
        this.menuView = ui_utils_1.default.getElementFromHtml("<div class=\"leonardo-main-view-menu\"></div>");
        ui_events_1.default.on(ui_events_1.default.TOGGLE_LAUNCHER, this.toggleView.bind(this));
        ui_state_srv_1.default.getInstance().init(ui_state_data_1.UIStateList(this.menuView), ui_state_data_1.UIStateList(this.menuView)[0].name);
        this.headerView = new header_1.default(this.getTabList());
        this.viewsContainer = new views_container_1.default();
    }
    MainView.prototype.get = function () {
        this.viewNode = ui_utils_1.default.getElementFromHtml("<div class=\"" + this.className + " " + this.hiddenClassName + "\"></div>");
        return this.viewNode;
    };
    MainView.prototype.toggleView = function () {
        var el = document.querySelector("." + this.className);
        if (!el)
            return;
        if (el.classList.contains(this.hiddenClassName)) {
            el.classList.remove(this.hiddenClassName);
            if (!el.childNodes.length) {
                this.kickStart();
            }
        }
        else {
            this.closeLeo();
        }
    };
    MainView.prototype.kickStart = function () {
        this.viewNode.appendChild(this.bodyView);
        this.viewNode.appendChild(this.menuView);
        this.bodyView.appendChild(this.headerView.get());
        this.bodyView.appendChild(this.viewsContainer.get());
        this.viewsContainer.render(ui_state_srv_1.default.getInstance().getCurViewState());
    };
    MainView.prototype.getTabList = function () {
        return ui_state_srv_1.default.getInstance().getViewStates().map(function (view) {
            return { label: view.name };
        });
    };
    MainView.prototype.closeLeo = function () {
        var el = document.querySelector("." + this.className);
        el.classList.add(this.hiddenClassName);
    };
    MainView.prototype.onKeyPress = function (event) {
        if (event.which == 27) {
            this.closeLeo();
        }
    };
    return MainView;
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = MainView;

},{"../header/header":7,"../ui-events":10,"../ui-state/ui-state.data":12,"../ui-state/ui-state.srv":13,"../ui-utils":14,"../views-container/views-container":15}],10:[function(require,module,exports){
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    TOGGLE_LAUNCHER: 'leonardo:toggle:launcher',
    CHANGE_VIEW: 'leonardo:change:view',
    SCENARIO_CLICKED: 'leonardo:scenario:clicked',
    FILTER_STATES: 'leonardo:filter:states',
    CLOSE_DROPDOWNS: 'leonardo:close:dropdowns',
    TOGGLE_STATES: 'leonardo:toggle:states',
    TOGGLE_SCENARIOS: 'leonardo:toggle:scenario',
    ADD_SCENARIO: 'leonardo:add:scenario',
    TOGGLE_STATE: 'leonardo:toggle:states',
    TOGGLE_ICON: 'leonardo:toggle:icon',
    on: function (eventName, fn) {
        document.body.addEventListener(eventName, fn);
    },
    dispatch: function (eventName, details) {
        var event = new CustomEvent(eventName, { detail: details });
        document.body.dispatchEvent(event);
    }
};

},{}],11:[function(require,module,exports){
var launcher_1 = require('./launcher/launcher');
var main_view_1 = require('./main-view/main-view');
var ui_utils_1 = require('./ui-utils');
var ui_events_1 = require('./ui-events');
var UIRoot = (function () {
    function UIRoot() {
        this.initBinded = this.init.bind(this);
        switch (document.readyState) {
            default:
            case 'loading':
                document.addEventListener('DOMContentLoaded', this.initBinded, false);
                break;
            case 'interactive':
            case 'complete':
                this.init();
                break;
        }
    }
    UIRoot.prototype.init = function () {
        document.removeEventListener('DOMContentLoaded', this.initBinded, false);
        this.leonardoApp = ui_utils_1.default.getElementFromHtml("<div leonardo-app></div>");
        this.launcher = new launcher_1.default();
        this.mainView = new main_view_1.default();
        this.leonardoApp.appendChild(this.mainView.get());
        this.leonardoApp.appendChild(this.launcher.get());
        document.body.addEventListener(ui_events_1.default.TOGGLE_STATES, this.toggleAllStates.bind(this));
        document.body.appendChild(this.leonardoApp);
    };
    UIRoot.prototype.toggleAllStates = function (event) {
        Leonardo.toggleActivateAll(event.detail);
    };
    return UIRoot;
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = UIRoot;

},{"./launcher/launcher":8,"./main-view/main-view":9,"./ui-events":10,"./ui-utils":14}],12:[function(require,module,exports){
var scenarios_1 = require('../views/scenarios/scenarios');
var recorder_1 = require('../views/recorder/recorder');
var export_1 = require('../views/export/export');
var uiList;
function UIStateList(menuView) {
    if (uiList) {
        return uiList;
    }
    return uiList = [
        {
            name: 'scenarios',
            component: new scenarios_1.default()
        },
        {
            name: 'recorder',
            component: new recorder_1.default(menuView)
        },
        {
            name: 'exported code',
            component: new export_1.default()
        }
    ];
}
exports.UIStateList = UIStateList;

},{"../views/export/export":16,"../views/recorder/recorder":18,"../views/scenarios/scenarios":21}],13:[function(require,module,exports){
var ui_events_1 = require('../ui-events');
var UIStateViewService = (function () {
    function UIStateViewService() {
        if (UIStateViewService._instance) {
            throw new Error('UIStateViewService should be singleton');
        }
        UIStateViewService._instance = this;
    }
    UIStateViewService.getInstance = function () {
        return UIStateViewService._instance;
    };
    UIStateViewService.prototype.init = function (viewStateList, initViewName) {
        this.viewStateList = viewStateList;
        this.curViewState = this.getViewStateByName(initViewName);
    };
    UIStateViewService.prototype.getCurViewState = function () {
        return this.curViewState;
    };
    UIStateViewService.prototype.setCurViewState = function (stateName) {
        this.curViewState = this.getViewStateByName(stateName);
        ui_events_1.default.dispatch(ui_events_1.default.CHANGE_VIEW, this.curViewState);
    };
    UIStateViewService.prototype.getViewStates = function () {
        return this.viewStateList;
    };
    UIStateViewService.prototype.addViewState = function (viewState) {
        this.viewStateList.push(viewState);
    };
    UIStateViewService.prototype.removeViewState = function (viewStateName) {
        this.viewStateList = this.viewStateList.filter(function (view) {
            return view.name === viewStateName;
        });
    };
    UIStateViewService.prototype.getViewStateByName = function (viewStateName) {
        var retView;
        this.viewStateList.some(function (view) {
            if (viewStateName === view.name) {
                return !!(retView = view);
            }
        });
        return retView || this.curViewState;
    };
    UIStateViewService._instance = new UIStateViewService();
    return UIStateViewService;
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = UIStateViewService;

},{"../ui-events":10}],14:[function(require,module,exports){
var UiUtils = (function () {
    function UiUtils() {
    }
    UiUtils.getElementFromHtml = function (html) {
        var div = document.createElement('div');
        div.innerHTML = html;
        return div.firstChild;
    };
    UiUtils.guidGenerator = function () {
        var S4 = function () {
            return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
        };
        return (S4() + S4() + '-' + S4() + '-' + S4() + '-' + S4() + '-' + S4() + S4() + S4());
    };
    return UiUtils;
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = UiUtils;

},{}],15:[function(require,module,exports){
var ui_utils_1 = require('../ui-utils');
var ui_events_1 = require('../ui-events');
var ViewsContainer = (function () {
    function ViewsContainer() {
        ui_events_1.default.on(ui_events_1.default.CHANGE_VIEW, this.onViewChanged.bind(this));
    }
    ViewsContainer.prototype.get = function () {
        return ui_utils_1.default.getElementFromHtml("\n      <div id=\"leonardo-views-container\" class=\"leonardo-views-container\">view container</div>\n    ");
    };
    ViewsContainer.prototype.getViewNode = function () {
        return document.getElementById('leonardo-views-container');
    };
    ViewsContainer.prototype.render = function (viewState) {
        this.currentViewState = viewState;
        this.getViewNode().innerHTML = '';
        this.getViewNode().appendChild(viewState.component.get());
        viewState.component.render();
    };
    ViewsContainer.prototype.onViewChanged = function (event) {
        this.currentViewState.component.destroy();
        this.render(event.detail);
    };
    return ViewsContainer;
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ViewsContainer;

},{"../ui-events":10,"../ui-utils":14}],16:[function(require,module,exports){
var ui_utils_1 = require('../../ui-utils');
var Export = (function () {
    function Export() {
    }
    Export.prototype.get = function () {
        return this.viewNode = ui_utils_1.default.getElementFromHtml("<div id=\"leonardo-export\" class=\"leonardo-export\">\n      <button class=\"leonardo-button exportButtons\" data-clipboard-target=\"#exportedCode\"> Copy To Clipboard</button>\n      <button class=\"leonardo-button exportButtons\" > Download Code</button>\n      <code contenteditable>\n        <div id=\"exportedCode\">\n          \n        </div>\n      </code>\n    </div>");
    };
    Export.prototype.render = function () {
    };
    Export.prototype.destroy = function () {
    };
    return Export;
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Export;

},{"../../ui-utils":14}],17:[function(require,module,exports){
var ui_utils_1 = require('../../../ui-utils');
var ui_events_1 = require('../../../ui-events');
var states_detail_1 = require("../state-detail/states-detail");
var RecorderList = (function () {
    function RecorderList(menuView) {
        this.menuView = menuView;
        this.stateDetail = new states_detail_1.default();
        ui_events_1.default.on(ui_events_1.default.TOGGLE_LAUNCHER, this.render.bind(this));
    }
    RecorderList.prototype.get = function () {
        return this.viewNode = ui_utils_1.default.getElementFromHtml("<div id=\"leonardo-recorder-list\" class=\"leonardo-recorder-list\"></div>");
    };
    RecorderList.prototype.render = function () {
        if (!this.viewNode) {
            return;
        }
        var list = ui_utils_1.default.getElementFromHtml("<ul class=\"leonardo-recorder-list-container\"></ul>");
        this.getStateItems().forEach(function (item) { list.appendChild(item); });
        this.viewNode.appendChild(list);
        this.menuView.appendChild(this.stateDetail.get());
    };
    RecorderList.prototype.getStateItems = function () {
        var _this = this;
        return Leonardo.getRecordedStates().map(function (state) {
            var item = ui_utils_1.default.getElementFromHtml("<li class=\"leonardo-recorder-list-item\">");
            item.innerHTML =
                "<span class=\"leonardo-recorder-list-verb leonardo-recorder-list-verb-" + state.verb.toLowerCase() + "\">" + state.verb + "</span>\n           <span class=\"leonardo-recorder-list-url\">" + state.url.substr(0, 110) + "</span>";
            item.innerHTML += state.recorded ? "<span class=\"leonardo-recorder-list-name\">" + state.name + "</span>" :
                "<span class=\"leonardo-recorder-list-name leonardo-recorder-list-name-new\">New</span>";
            item.addEventListener('click', _this.toggleDetails.bind(_this, state));
            return item;
        });
    };
    RecorderList.prototype.toggleDetails = function (state) {
        state.activeOption = state.options[0];
        this.stateDetail.open(state);
    };
    return RecorderList;
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = RecorderList;

},{"../../../ui-events":10,"../../../ui-utils":14,"../state-detail/states-detail":19}],18:[function(require,module,exports){
var ui_utils_1 = require('../../ui-utils');
var recorder_list_1 = require('./recorder-list/recorder-list');
var Recorder = (function () {
    function Recorder(menuView) {
        this.menuView = menuView;
        this.recorderList = new recorder_list_1.default(menuView);
    }
    Recorder.prototype.get = function () {
        return this.viewNode = ui_utils_1.default.getElementFromHtml("<div id=\"leonardo-recorder\" class=\"leonardo-recorder\"</div>");
    };
    Recorder.prototype.render = function () {
        this.viewNode.appendChild(this.recorderList.get());
        this.recorderList.render();
    };
    Recorder.prototype.destroy = function () {
        this.menuView.innerHTML = '';
    };
    return Recorder;
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Recorder;

},{"../../ui-utils":14,"./recorder-list/recorder-list":17}],19:[function(require,module,exports){
var ui_utils_1 = require('../../../ui-utils');
var RecorderStateDetail = (function () {
    function RecorderStateDetail() {
        this.openState = false;
        this.onCancelBinded = this.onCancel.bind(this);
        this.onSaveBinded = this.onSave.bind(this);
        this.viewNode = ui_utils_1.default.getElementFromHtml("<div id=\"leonardo-state-detail\" class=\"leonardo-state-detail-recorder\"></div>");
    }
    RecorderStateDetail.prototype.get = function () {
        return this.viewNode;
    };
    RecorderStateDetail.prototype.render = function () {
        if (this.viewNode.innerHTML) {
            this.viewNode.querySelector('.leonardo-states-detail-cancel').removeEventListener('click', this.onCancelBinded, false);
            this.viewNode.querySelector('.leonardo-states-detail-save').removeEventListener('click', this.onSaveBinded, false);
        }
        var html;
        if (this.curState.recorded) {
            html = "<div class=\"leonardo-states-detail-header\">Add mocked response for <strong>" + this.curState.name + "</strong></div>";
        }
        else {
            html = "<h1 class=\"leonardo-states-detail-header\"/>Add new state</h1>\n              <div>State name: <input class=\"leonardo-states-detail-state-name\" value=\"" + this.curState.name + "\"/></div>";
        }
        html += "<div>URL: <input class=\"leonardo-states-detail-option-url\" value=\"" + this.curState.url + "\"/></div>\n              <div>Option name: <input class=\"leonardo-states-detail-option-name\" value=\"" + this.curState.options[0].name + "\"/></div>\n              <div>Status code: <input class=\"leonardo-states-detail-status\" value=\"" + this.curState.options[0].status + "\"/></div>\n              <div>Delay: <input class=\"leonardo-states-detail-delay\" value=\"0\"/></div>\n              <div>Response: <textarea class=\"leonardo-states-detail-json\">" + this.getResString(this.curState.options[0].data) + "</textarea></div>\n              <button class=\"leonardo-button leonardo-states-detail-save\">Save</button>\n              <button class=\"leonardo-button leonardo-states-detail-cancel\" >Cancel</button>";
        this.viewNode.innerHTML = html;
        this.viewNode.querySelector('.leonardo-states-detail-cancel').addEventListener('click', this.onCancelBinded, false);
        this.viewNode.querySelector('.leonardo-states-detail-save').addEventListener('click', this.onSaveBinded, false);
    };
    RecorderStateDetail.prototype.open = function (state) {
        this.curState = state;
        this.render();
        this.openState = true;
        this.viewNode.style.display = '';
    };
    RecorderStateDetail.prototype.close = function (state) {
        if (state && this.curState !== state) {
            this.open(state);
            return;
        }
        this.openState = false;
        this.viewNode.style.display = 'none';
    };
    RecorderStateDetail.prototype.toggle = function (state) {
        if (this.openState) {
            this.close(state);
            return;
        }
        this.open(state);
    };
    RecorderStateDetail.prototype.getResString = function (resopnse) {
        var resStr;
        try {
            resStr = JSON.stringify(resopnse, null, 4);
        }
        catch (e) {
            resStr = typeof resopnse === 'string' ? resopnse : resopnse.toString();
        }
        return resStr;
    };
    RecorderStateDetail.prototype.onCancel = function () {
        this.close();
    };
    RecorderStateDetail.prototype.onSave = function () {
        var urlVal = this.viewNode.querySelector(".leonardo-states-detail-option-url").value;
        var statusVal = this.viewNode.querySelector(".leonardo-states-detail-status").value;
        var delayVal = this.viewNode.querySelector(".leonardo-states-detail-delay").value;
        var jsonVal = this.viewNode.querySelector(".leonardo-states-detail-json").value;
        var optionNameVal = this.viewNode.querySelector(".leonardo-states-detail-option-name").value;
        this.curState.url = urlVal;
        this.curState.activeOption.status = statusVal;
        this.curState.activeOption.delay = delayVal;
        this.curState.activeOption.name = optionNameVal;
        if (!this.curState.recorded) {
            this.curState.name = this.viewNode.querySelector('.leonardo-states-detail-state-name').value;
        }
        try {
            this.curState.activeOption.data = JSON.parse(jsonVal);
        }
        catch (e) {
            this.curState.activeOption.data = jsonVal;
        }
        Leonardo.addOrUpdateSavedState(this.curState);
        this.close();
    };
    return RecorderStateDetail;
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = RecorderStateDetail;

},{"../../../ui-utils":14}],20:[function(require,module,exports){
var ui_utils_1 = require('../../../ui-utils');
var ui_events_1 = require('../../../ui-events');
var ScenariosList = (function () {
    function ScenariosList() {
        this.setScenarioBinded = this.setScenario.bind(this);
        this.viewNode = ui_utils_1.default.getElementFromHtml("<div id=\"leonardo-scenarios-list\" class=\"leonardo-scenarios-list\"></div>");
        this.viewNode.addEventListener('click', this.setScenarioBinded, false);
        ui_events_1.default.on(ui_events_1.default.ADD_SCENARIO, this.addScenario.bind(this));
    }
    ScenariosList.prototype.get = function () {
        return this.viewNode;
    };
    ScenariosList.prototype.render = function () {
        this.viewNode.innerHTML = '';
        this.viewNode.appendChild(ui_utils_1.default.getElementFromHtml("<div>Scenarios</div>"));
        var ul = ui_utils_1.default.getElementFromHtml("<ul></ul>");
        Leonardo.getScenarios()
            .map(this.getScenarioElement.bind(this))
            .forEach(function (scenarioElm) {
            ul.appendChild(scenarioElm);
        });
        this.viewNode.appendChild(ul);
    };
    ScenariosList.prototype.getScenarioElement = function (scenario) {
        var _this = this;
        var el = ui_utils_1.default.getElementFromHtml("<li>" + scenario + "</li>");
        el.addEventListener('click', function () {
            ui_events_1.default.dispatch(ui_events_1.default.SCENARIO_CLICKED, { name: scenario });
            Array.prototype.slice.call(_this.viewNode.querySelectorAll('li'), 0)
                .forEach(function (li) { return li.classList.remove(ScenariosList.SELECTED_CLASS); });
            el.classList.add(ScenariosList.SELECTED_CLASS);
        });
        return el;
    };
    ScenariosList.prototype.setScenario = function (event) {
        if (event.target['tagName'] !== 'LI') {
            return;
        }
        var scenarioName = event.target['innerHTML'];
        var states = Leonardo.getScenario(scenarioName);
        ui_events_1.default.dispatch(ui_events_1.default.TOGGLE_STATES, false);
        states.forEach(function (state) {
            ui_events_1.default.dispatch(ui_events_1.default.TOGGLE_STATES + ":" + state.name, state.option);
        });
    };
    ScenariosList.prototype.onDestroy = function () {
        this.viewNode.removeEventListener('click', this.setScenarioBinded, false);
    };
    ScenariosList.prototype.addScenario = function (event) {
        this.render();
    };
    ScenariosList.SELECTED_CLASS = 'leonardo-selected-scenario';
    return ScenariosList;
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ScenariosList;

},{"../../../ui-events":10,"../../../ui-utils":14}],21:[function(require,module,exports){
var ui_utils_1 = require('../../ui-utils');
var states_list_1 = require('./states-list/states-list');
var scenarios_list_1 = require('./scenarios-list/scenarios-list');
var Scenarios = (function () {
    function Scenarios() {
        this.stateList = new states_list_1.default();
        this.scenariosList = new scenarios_list_1.default();
    }
    Scenarios.prototype.get = function () {
        var el = ui_utils_1.default.getElementFromHtml("<div id=\"leonardo-scenarios\" class=\"leonardo-scenarios\"></div>");
        el.appendChild(this.scenariosList.get());
        el.appendChild(this.stateList.get());
        return el;
    };
    Scenarios.prototype.getViewNode = function () {
        return document.getElementById('leonardo-scenarios');
    };
    Scenarios.prototype.render = function () {
        this.stateList.render();
        this.scenariosList.render();
    };
    Scenarios.prototype.destroy = function () {
    };
    return Scenarios;
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Scenarios;

},{"../../ui-utils":14,"./scenarios-list/scenarios-list":20,"./states-list/states-list":26}],22:[function(require,module,exports){
var ui_utils_1 = require('../../../../ui-utils');
var StateDetail = (function () {
    function StateDetail(onSaveCB, onCancelCB) {
        this.onSaveCB = onSaveCB;
        this.onCancelCB = onCancelCB;
        this.openState = false;
        this.onCancelBinded = this.onCancel.bind(this);
        this.onSaveBinded = this.onSave.bind(this);
        this.viewNode = ui_utils_1.default.getElementFromHtml("<div id=\"leonardo-state-detail\" class=\"leonardo-state-detail\"></div>");
    }
    StateDetail.prototype.get = function () {
        return this.viewNode;
    };
    StateDetail.prototype.render = function () {
        if (this.viewNode.innerHTML) {
            this.viewNode.querySelector('.leonardo-states-detail-cancel').removeEventListener('click', this.onCancelBinded, false);
            this.viewNode.querySelector('.leonardo-states-detail-save').removeEventListener('click', this.onSaveBinded, false);
        }
        this.viewNode.innerHTML = "\n      <div class=\"leonardo-states-detail-header\"> \n        Edit option <strong>" + this.curState.activeOption.name + "</strong>\n        for <strong>" + this.curState.name + "</strong>\n        </div>\n        <div>Status code: <input class=\"leonardo-states-detail-status\" value=\"" + this.curState.activeOption.status + "\"/></div>\n        <div>Delay: <input class=\"leonardo-states-detail-delay\" value=\"" + this.curState.activeOption.delay + "\"/></div>\n        <div>Response JSON:\n          <textarea class=\"leonardo-states-detail-json\">" + this.getResString(this.curState.activeOption.data) + "</textarea>\n        </div>\n        <button class=\"leonardo-button leonardo-states-detail-save\">Save</button>\n        <button class=\"leonardo-button leonardo-states-detail-cancel\" >Cancel</button>";
        this.viewNode.querySelector('.leonardo-states-detail-cancel').addEventListener('click', this.onCancelBinded, false);
        this.viewNode.querySelector('.leonardo-states-detail-save').addEventListener('click', this.onSaveBinded, false);
    };
    StateDetail.prototype.open = function (state) {
        this.curState = state;
        this.render();
        this.openState = true;
        this.viewNode.style.right = '0px';
    };
    StateDetail.prototype.close = function (state) {
        if (state && this.curState !== state) {
            this.open(state);
            return;
        }
        this.openState = false;
        this.viewNode.style.right = '-400px';
    };
    StateDetail.prototype.toggle = function (state) {
        if (this.openState) {
            this.close(state);
            return;
        }
        this.open(state);
    };
    StateDetail.prototype.getResString = function (resopnse) {
        var resStr;
        try {
            resStr = JSON.stringify(resopnse, null, 4);
        }
        catch (e) {
            resStr = typeof resopnse === 'string' ? resopnse : resopnse.toString();
        }
        return resStr;
    };
    StateDetail.prototype.onCancel = function () {
        this.close();
        this.onCancelCB();
    };
    StateDetail.prototype.onSave = function () {
        var statusVal = this.viewNode.querySelector(".leonardo-states-detail-status").value;
        var delayVal = this.viewNode.querySelector(".leonardo-states-detail-delay").value;
        var jsonVal = this.viewNode.querySelector(".leonardo-states-detail-json").value;
        this.curState.activeOption.status = statusVal;
        this.curState.activeOption.delay = delayVal;
        try {
            this.curState.activeOption.data = JSON.parse(jsonVal);
        }
        catch (e) {
            this.curState.activeOption.data = jsonVal;
        }
        Leonardo.addOrUpdateSavedState(this.curState);
        this.close();
        this.onSaveCB();
    };
    return StateDetail;
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = StateDetail;

},{"../../../../ui-utils":14}],23:[function(require,module,exports){
var ui_utils_1 = require('../../../../ui-utils');
var ui_events_1 = require('../../../../ui-events');
var drop_down_1 = require('../../../../drop-down/drop-down');
var StateItem = (function () {
    function StateItem(state, onRemove) {
        this.state = state;
        this.onRemove = onRemove;
        this.toggleBinded = this.toggleState.bind(this);
        this.removeBinded = this.removeState.bind(this);
        this.viewNode = ui_utils_1.default.getElementFromHtml("<div class=\"leonardo-state-item\"></div>");
        this.randomID = ui_utils_1.default.guidGenerator();
        this.dropDown = new drop_down_1.default(this.state.options, this.state.activeOption || this.state.options[0], !this.state.active, this.changeActiveOption.bind(this), this.removeOption.bind(this));
        ui_events_1.default.on(ui_events_1.default.TOGGLE_STATES, this.toggleAllstate.bind(this));
        ui_events_1.default.on(ui_events_1.default.TOGGLE_STATES + ":" + this.state.name, this.setStateState.bind(this));
    }
    StateItem.prototype.get = function () {
        return this.viewNode;
    };
    StateItem.prototype.render = function () {
        if (this.viewNode.innerHTML) {
            this.viewNode.querySelector(".leonardo-toggle-btn").removeEventListener('click', this.toggleBinded, false);
            this.viewNode.querySelector(".leonardo-state-remove").removeEventListener('click', this.removeBinded, false);
        }
        this.viewNode.innerHTML = "\n        <input " + this.isChecked() + " id=\"leonardo-state-toggle-" + this.randomID + "\" class=\"leonardo-toggle leonardo-toggle-ios\" type=\"checkbox\"/>\n        <label class=\"leonardo-toggle-btn\" for=\"leonardo-state-toggle-" + this.randomID + "\"></label>\n        <span class=\"leonardo-state-verb leonardo-state-verb-" + this.state.verb.toLowerCase() + "\">" + this.state.verb + "</span>\n        <span class=\"leonardo-state-name\">" + this.state.name + "</span>\n        <span class=\"leonardo-state-url\">" + (this.state.url || '') + "</span>";
        this.viewNode.appendChild(this.dropDown.get());
        this.dropDown.render();
        this.viewNode.appendChild(ui_utils_1.default.getElementFromHtml("<button title=\"Remove State\" class=\"leonardo-state-remove\">Remove</button>"));
        this.viewNode.querySelector(".leonardo-toggle-btn").addEventListener('click', this.toggleBinded, false);
        this.viewNode.querySelector(".leonardo-state-remove").addEventListener('click', this.removeBinded, false);
    };
    StateItem.prototype.getName = function () {
        return this.state.name;
    };
    StateItem.prototype.getState = function () {
        return this.state;
    };
    StateItem.prototype.toggleVisible = function (show) {
        if (show) {
            this.viewNode.classList.remove('leonardo-state-item-hidden');
        }
        else {
            this.viewNode.classList.add('leonardo-state-item-hidden');
        }
    };
    StateItem.prototype.setState = function (state, setView) {
        if (setView === void 0) { setView = true; }
        this.state.active = state;
        if (state) {
            Leonardo.activateStateOption(this.state.name, this.state.activeOption.name);
            this.dropDown.enableDropDown();
            if (setView) {
                this.viewNode.querySelector('.leonardo-toggle')['checked'] = true;
            }
        }
        else {
            Leonardo.deactivateState(this.state.name);
            this.dropDown.disableDropDown();
            if (setView) {
                this.viewNode.querySelector('.leonardo-toggle')['checked'] = false;
            }
        }
    };
    StateItem.prototype.isChecked = function () {
        return this.state.active ? 'checked' : '';
    };
    StateItem.prototype.toggleState = function (event) {
        this.setState(!this.state.active, false);
    };
    StateItem.prototype.toggleAllstate = function (event) {
        this.setState(event.detail);
    };
    StateItem.prototype.setStateState = function (event) {
        var _this = this;
        this.setState(true);
        this.state.options.some(function (option) {
            if (option.name === event.detail) {
                _this.dropDown.setActiveItem(event.detail);
                _this.changeActiveOption(option);
                return true;
            }
        });
    };
    StateItem.prototype.changeActiveOption = function (option) {
        this.state.activeOption = option;
        Leonardo.activateStateOption(this.state.name, this.state.activeOption.name);
    };
    StateItem.prototype.removeState = function (event) {
        if (event) {
            event.stopPropagation();
        }
        this.onDestroy();
        this.onRemove(this.state.name, this.viewNode);
        Leonardo.removeState(this.state);
    };
    StateItem.prototype.removeOption = function (item) {
        Leonardo.removeOption(this.state, item);
    };
    StateItem.prototype.onDestroy = function () {
        this.viewNode.querySelector(".leonardo-toggle-btn").removeEventListener('click', this.toggleBinded, false);
        this.viewNode.querySelector(".leonardo-state-remove").removeEventListener('click', this.removeBinded, false);
    };
    return StateItem;
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = StateItem;

},{"../../../../drop-down/drop-down":6,"../../../../ui-events":10,"../../../../ui-utils":14}],24:[function(require,module,exports){
var ui_utils_1 = require('../../../../../ui-utils');
var ui_events_1 = require('../../../../../ui-events');
var default_1 = (function () {
    function default_1() {
        this.openState = false;
        this.onCancelBinded = this.onCancel.bind(this);
        this.onSaveBinded = this.onSave.bind(this);
        this.viewNode = ui_utils_1.default.getElementFromHtml("<div id=\"leonardo-add-scenario\" class=\"leonardo-add-scenario\"></div>");
    }
    default_1.prototype.get = function () {
        return this.viewNode;
    };
    default_1.prototype.render = function () {
        if (this.viewNode.innerHTML) {
            this.viewNode.querySelector('.leonardo-add-scenario-cancel').removeEventListener('click', this.onCancelBinded, false);
            this.viewNode.querySelector('.leonardo-add-scenario-save').removeEventListener('click', this.onSaveBinded, false);
        }
        this.viewNode.innerHTML = "\n        <div class=\"leonardo-add-scenario-box\">\n          <span>Scenario Name: </span>\n          <input class=\"leonardo-add-scenario-name\"/>\n          <button class=\"leonardo-button leonardo-add-scenario-save\">Save</button>\n          <button class=\"leonardo-button leonardo-add-scenario-cancel\">Cancel</button>\n        </div>";
        this.viewNode.querySelector('.leonardo-add-scenario-cancel').addEventListener('click', this.onCancelBinded, false);
        this.viewNode.querySelector('.leonardo-add-scenario-save').addEventListener('click', this.onSaveBinded, false);
    };
    default_1.prototype.open = function () {
        this.render();
        this.openState = true;
        this.viewNode.style.display = 'block';
    };
    default_1.prototype.close = function () {
        this.openState = false;
        this.viewNode.style.display = 'none';
    };
    default_1.prototype.toggle = function () {
        if (this.openState) {
            this.close();
            return;
        }
        this.open();
    };
    default_1.prototype.onCancel = function () {
        this.close();
    };
    default_1.prototype.onSave = function () {
        this.close();
        ui_events_1.default.dispatch(ui_events_1.default.ADD_SCENARIO, this.viewNode.querySelector('.leonardo-add-scenario-name').value);
    };
    return default_1;
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;

},{"../../../../../ui-events":10,"../../../../../ui-utils":14}],25:[function(require,module,exports){
var ui_utils_1 = require('../../../../ui-utils');
var ui_events_1 = require('../../../../ui-events');
var state_add_scenario_1 = require('./state-add-scenario/state-add-scenario');
var StatesBar = (function () {
    function StatesBar() {
        this.searchBinded = this.searchStates.bind(this);
        this.activateAllBinded = this.toggleActivateAll.bind(this);
        this.addScenarioBinded = this.onAddScenario.bind(this);
        this.activeAllState = false;
        this.addScenario = new state_add_scenario_1.default();
        this.curSearchData = '';
        this.viewNode = ui_utils_1.default.getElementFromHtml("<div class=\"leonardo-states-bar\"></div>");
    }
    StatesBar.prototype.get = function () {
        return this.viewNode;
    };
    StatesBar.prototype.render = function () {
        if (this.viewNode.innerHTML) {
            this.viewNode.querySelector('.leonardo-search-state').removeEventListener('keyup', this.searchBinded, false);
            this.viewNode.querySelector('.leonardo-activate-all').removeEventListener('click', this.activateAllBinded, false);
            this.viewNode.querySelector('.leonardo-add-scenario-btn').removeEventListener('click', this.addScenarioBinded, false);
        }
        this.viewNode.innerHTML = "\n        <input value=\"" + this.curSearchData + "\" class=\"leonardo-search-state\" name=\"leonardo-search-state\" type=\"text\" placeholder=\"Search...\" />\n        <div>\n          <span class=\"leonardo-button leonardo-activate-all\">Activate All</span>\n          <span class=\"leonardo-button leonardo-add-scenario-btn\">Add Scenario</span>\n        </div>";
        this.viewNode.appendChild(this.addScenario.get());
        this.addScenario.render();
        this.viewNode.querySelector('.leonardo-search-state').addEventListener('keyup', this.searchBinded, false);
        this.viewNode.querySelector('.leonardo-activate-all').addEventListener('click', this.activateAllBinded, false);
        this.viewNode.querySelector('.leonardo-add-scenario-btn').addEventListener('click', this.addScenarioBinded, false);
        this.searchStates({ target: { value: this.curSearchData } });
    };
    StatesBar.prototype.searchStates = function (evt) {
        this.curSearchData = evt.target.value;
        ui_events_1.default.dispatch(ui_events_1.default.FILTER_STATES, { val: this.curSearchData });
    };
    StatesBar.prototype.toggleActivateAll = function () {
        this.activeAllState = !this.activeAllState;
        Leonardo.toggleActivateAll(this.activeAllState);
        ui_events_1.default.dispatch(ui_events_1.default.TOGGLE_STATES, this.activeAllState);
        this.viewNode.querySelector('.leonardo-activate-all').innerHTML = this.activeAllState ? 'Deactivate all' : 'Activate all';
    };
    StatesBar.prototype.onAddScenario = function () {
        this.addScenario.open();
    };
    StatesBar.prototype.onDestroy = function () {
        this.viewNode.querySelector('.leonardo-search-state').removeEventListener('keyup', this.searchBinded, false);
    };
    return StatesBar;
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = StatesBar;

},{"../../../../ui-events":10,"../../../../ui-utils":14,"./state-add-scenario/state-add-scenario":24}],26:[function(require,module,exports){
var ui_utils_1 = require('../../../ui-utils');
var ui_events_1 = require('../../../ui-events');
var state_item_1 = require('./state-item/state-item');
var states_bar_1 = require('./states-bar/states-bar');
var states_detail_1 = require('./state-detail/states-detail');
var StatesList = (function () {
    function StatesList() {
        this.statesBar = new states_bar_1.default();
        this.stateDetail = new states_detail_1.default(this.onStateDetailSave.bind(this), this.clearSelected.bind(this));
        this.statesElements = [];
        this.viewNode = ui_utils_1.default.getElementFromHtml("<div id=\"leonardo-states-list\" class=\"leonardo-states-list\"></div>");
        ui_events_1.default.on(ui_events_1.default.FILTER_STATES, this.onFilterStates.bind(this));
        ui_events_1.default.on(ui_events_1.default.ADD_SCENARIO, this.addScenario.bind(this));
    }
    StatesList.prototype.get = function () {
        return this.viewNode;
    };
    StatesList.prototype.render = function () {
        var _this = this;
        this.viewNode.innerHTML = '';
        this.viewNode.appendChild(this.statesBar.get());
        this.viewNode.appendChild(this.stateDetail.get());
        this.statesElements.length = 0;
        Leonardo.getStates()
            .map(function (state) { return new state_item_1.default(state, _this.removeStateByName.bind(_this)); })
            .forEach(function (stateElm) {
            _this.statesElements.push(stateElm);
            _this.viewNode.appendChild(stateElm.get());
            stateElm.viewNode.addEventListener('click', _this.toggleDetail.bind(_this, stateElm));
            stateElm.render();
        });
        this.statesBar.render();
    };
    StatesList.prototype.onFilterStates = function (data) {
        this.statesElements.forEach(function (stateElm) {
            if (stateElm.getName().toLowerCase().indexOf(data.detail.val.toLowerCase()) >= 0) {
                stateElm.toggleVisible(true);
            }
            else {
                stateElm.toggleVisible(false);
            }
        });
    };
    StatesList.prototype.removeStateByName = function (stateName, stateView) {
        this.statesElements = this.statesElements.filter(function (state) {
            return state.getName() === stateName;
        });
        this.viewNode.removeChild(stateView);
    };
    StatesList.prototype.toggleDetail = function (stateElm, event) {
        event.stopPropagation();
        var open = stateElm.viewNode.classList.contains('leonardo-state-item-detailed');
        this.clearSelected();
        if (!open) {
            stateElm.viewNode.classList.add('leonardo-state-item-detailed');
        }
        this.stateDetail.toggle(stateElm.getState());
    };
    StatesList.prototype.clearSelected = function () {
        this.statesElements.forEach(function (curState) {
            curState.viewNode.classList.remove('leonardo-state-item-detailed');
        });
    };
    StatesList.prototype.onStateDetailSave = function () {
        this.clearSelected();
    };
    StatesList.prototype.addScenario = function (event) {
        var states = this.statesElements.map(function (stateElem) {
            return stateElem.getState();
        }).filter(function (state) { return state.active; })
            .map(function (state) {
            return {
                name: state.name,
                option: state.activeOption.name
            };
        });
        Leonardo.addScenario({
            name: event.detail,
            states: states,
            from_local: true
        }, true);
    };
    return StatesList;
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = StatesList;

},{"../../../ui-events":10,"../../../ui-utils":14,"./state-detail/states-detail":22,"./state-item/state-item":23,"./states-bar/states-bar":25}],27:[function(require,module,exports){
var Utils = (function () {
    function Utils() {
    }
    Utils.isUndefined = function (value) {
        return typeof value === 'undefined';
    };
    Utils.isNumber = function (value) {
        return typeof value === 'number';
    };
    Utils.isFunction = function (value) {
        return typeof value === 'function';
    };
    Utils.isString = function (value) {
        return typeof value === 'string';
    };
    Utils.fromJson = function (json) {
        return this.isString(json)
            ? JSON.parse(json)
            : json;
    };
    Utils.toJson = function (obj, pretty) {
        if (this.isUndefined(obj))
            return undefined;
        if (!this.isNumber(pretty)) {
            pretty = pretty ? 2 : null;
        }
        return JSON.stringify(obj, null, pretty);
    };
    return Utils;
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Utils;

},{}]},{},[2])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvbGVvbmFyZG8vY29uZmlndXJhdGlvbi5zcnYudHMiLCJzcmMvbGVvbmFyZG8vbGVvbmFyZG8udHMiLCJzcmMvbGVvbmFyZG8vcG9seWZpbGxzLnRzIiwic3JjL2xlb25hcmRvL3Npbm9uLnNydi50cyIsInNyYy9sZW9uYXJkby9zdG9yYWdlLnNydi50cyIsInNyYy9sZW9uYXJkby91aS9kcm9wLWRvd24vZHJvcC1kb3duLnRzIiwic3JjL2xlb25hcmRvL3VpL2hlYWRlci9oZWFkZXIudHMiLCJzcmMvbGVvbmFyZG8vdWkvbGF1bmNoZXIvbGF1bmNoZXIudHMiLCJzcmMvbGVvbmFyZG8vdWkvbWFpbi12aWV3L21haW4tdmlldy50cyIsInNyYy9sZW9uYXJkby91aS91aS1ldmVudHMudHMiLCJzcmMvbGVvbmFyZG8vdWkvdWktcm9vdC50cyIsInNyYy9sZW9uYXJkby91aS91aS1zdGF0ZS91aS1zdGF0ZS5kYXRhLnRzIiwic3JjL2xlb25hcmRvL3VpL3VpLXN0YXRlL3VpLXN0YXRlLnNydi50cyIsInNyYy9sZW9uYXJkby91aS91aS11dGlscy50cyIsInNyYy9sZW9uYXJkby91aS92aWV3cy1jb250YWluZXIvdmlld3MtY29udGFpbmVyLnRzIiwic3JjL2xlb25hcmRvL3VpL3ZpZXdzL2V4cG9ydC9leHBvcnQudHMiLCJzcmMvbGVvbmFyZG8vdWkvdmlld3MvcmVjb3JkZXIvcmVjb3JkZXItbGlzdC9yZWNvcmRlci1saXN0LnRzIiwic3JjL2xlb25hcmRvL3VpL3ZpZXdzL3JlY29yZGVyL3JlY29yZGVyLnRzIiwic3JjL2xlb25hcmRvL3VpL3ZpZXdzL3JlY29yZGVyL3N0YXRlLWRldGFpbC9zdGF0ZXMtZGV0YWlsLnRzIiwic3JjL2xlb25hcmRvL3VpL3ZpZXdzL3NjZW5hcmlvcy9zY2VuYXJpb3MtbGlzdC9zY2VuYXJpb3MtbGlzdC50cyIsInNyYy9sZW9uYXJkby91aS92aWV3cy9zY2VuYXJpb3Mvc2NlbmFyaW9zLnRzIiwic3JjL2xlb25hcmRvL3VpL3ZpZXdzL3NjZW5hcmlvcy9zdGF0ZXMtbGlzdC9zdGF0ZS1kZXRhaWwvc3RhdGVzLWRldGFpbC50cyIsInNyYy9sZW9uYXJkby91aS92aWV3cy9zY2VuYXJpb3Mvc3RhdGVzLWxpc3Qvc3RhdGUtaXRlbS9zdGF0ZS1pdGVtLnRzIiwic3JjL2xlb25hcmRvL3VpL3ZpZXdzL3NjZW5hcmlvcy9zdGF0ZXMtbGlzdC9zdGF0ZXMtYmFyL3N0YXRlLWFkZC1zY2VuYXJpby9zdGF0ZS1hZGQtc2NlbmFyaW8udHMiLCJzcmMvbGVvbmFyZG8vdWkvdmlld3Mvc2NlbmFyaW9zL3N0YXRlcy1saXN0L3N0YXRlcy1iYXIvc3RhdGVzLWJhci50cyIsInNyYy9sZW9uYXJkby91aS92aWV3cy9zY2VuYXJpb3Mvc3RhdGVzLWxpc3Qvc3RhdGVzLWxpc3QudHMiLCJzcmMvbGVvbmFyZG8vdXRpbHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNFQTtJQUNFLElBQUksT0FBTyxHQUFHLEVBQUUsRUFDZCxVQUFVLEdBQUcsRUFBRSxFQUNmLFlBQVksR0FBRyxFQUFFLEVBQ2pCLFlBQVksR0FBRyxFQUFFLEVBQ2pCLG1CQUFtQixHQUFHLElBQUksV0FBVyxDQUFDLG9CQUFvQixDQUFDLEVBQzNELFdBQVcsR0FBRyxRQUFRLENBQUMsSUFBSSxFQUMzQixlQUFlLEdBQUcsRUFBRSxDQUFDO0lBSXZCLE1BQU0sQ0FBQztRQUNMLFFBQVEsRUFBRSxRQUFRO1FBQ2xCLFNBQVMsRUFBRSxTQUFTO1FBQ3BCLG9CQUFvQixFQUFFLG9CQUFvQjtRQUMxQyxTQUFTLEVBQUUsV0FBVztRQUN0QixlQUFlLEVBQUUsZUFBZTtRQUNoQyxpQkFBaUIsRUFBRSxpQkFBaUI7UUFDcEMsbUJBQW1CLEVBQUUsbUJBQW1CO1FBQ3hDLFdBQVcsRUFBRSxXQUFXO1FBQ3hCLFlBQVksRUFBRSxZQUFZO1FBQzFCLFdBQVcsRUFBRSxXQUFXO1FBQ3hCLFlBQVksRUFB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QUVNLGNBQVEsR0FBZixVQUFnQixLQUFLO1FBQ25CLE1BQU0sQ0FBQyxPQUFPLEtBQUssS0FBSyxRQUFRLENBQUM7SUFDbkMsQ0FBQztJQUVNLGdCQUFVLEdBQWpCLFVBQWtCLEtBQUs7UUFDckIsTUFBTSxDQUFDLE9BQU8sS0FBSyxLQUFLLFVBQVUsQ0FBQztJQUNyQyxDQUFDO0lBRU0sY0FBUSxHQUFmLFVBQWdCLEtBQUs7UUFDbkIsTUFBTSxDQUFDLE9BQU8sS0FBSyxLQUFLLFFBQVEsQ0FBQztJQUNuQyxDQUFDO0lBRU0sY0FBUSxHQUFmLFVBQWdCLElBQUk7UUFDbEIsTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDO2NBQ3RCLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDO2NBQ2hCLElBQUksQ0FBQztJQUNYLENBQUM7SUFFTSxZQUFNLEdBQWIsVUFBYyxHQUFHLEVBQUUsTUFBTztRQUN4QixFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQztRQUM1QyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzNCLE1BQU0sR0FBRyxNQUFNLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQztRQUM3QixDQUFDO1FBQ0QsTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxFQUFFLElBQUksRUFBRSxNQUFNLENBQUMsQ0FBQztJQUMzQyxDQUFDO0lBQ0gsWUFBQztBQUFELENBakNBLEFBaUNDLElBQUE7QUFqQ0Q7dUJBaUNDLENBQUEiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cImxlb25hcmRvLmQudHNcIiAvPlxuZGVjbGFyZSB2YXIgT2JqZWN0OiBhbnk7XG5leHBvcnQgZnVuY3Rpb24gbGVvQ29uZmlndXJhdGlvbigpIHtcbiAgdmFyIF9zdGF0ZXMgPSBbXSxcbiAgICBfc2NlbmFyaW9zID0ge30sXG4gICAgX3JlcXVlc3RzTG9nID0gW10sXG4gICAgX3NhdmVkU3RhdGVzID0gW10sXG4gICAgX3N0YXRlc0NoYW5nZWRFdmVudCA9IG5ldyBDdXN0b21FdmVudCgnbGVvbmFyZG86c2V0U3RhdGVzJyksXG4gICAgX2V2ZW50c0VsZW0gPSBkb2N1bWVudC5ib2R5LFxuICAgIF9qc29ucENhbGxiYWNrcyA9IHt9O1xuXG4gIC8vIENvcmUgQVBJXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS1cbiAgcmV0dXJuIHtcbiAgICBhZGRTdGF0ZTogYWRkU3RhdGUsXG4gICAgYWRkU3RhdGVzOiBhZGRTdGF0ZXMsXG4gICAgZ2V0QWN0aXZlU3RhdGVPcHRpb246IGdldEFjdGl2ZVN0YXRlT3B0aW9uLFxuICAgIGdldFN0YXRlczogZmV0Y2hTdGF0ZXMsXG4gICAgZGVhY3RpdmF0ZVN0YXRlOiBkZWFjdGl2YXRlU3RhdGUsXG4gICAgdG9nZ2xlQWN0aXZhdGVBbGw6IHRvZ2dsZUFjdGl2YXRlQWxsLFxuICAgIGFjdGl2YXRlU3RhdGVPcHRpb246IGFjdGl2YXRlU3RhdGVPcHRpb24sXG4gICAgYWRkU2NlbmFyaW86IGFkZFNjZW5hcmlvLFxuICAgIGFkZFNjZW5hcmlvczogYWRkU2NlbmFyaW9zLFxuICAgIGdldFNjZW5hcmlvOiBnZXRTY2VuYXJpbyxcbiAgICBnZXRTY2VuYXJpb3M6IGdldFNjZW5hcmlvcyxcbiAgICBzZXRBY3RpdmVTY2VuYXJpbzogc2V0QWN0aXZlU2NlbmFyaW8sXG4gICAgZ2V0UmVjb3JkZWRTdGF0ZXM6IGdldFJlY29yZGVkU3RhdGVzLFxuICAgIGdldFJlcXVlc3RzTG9nOiBnZXRSZXF1ZXN0c0xvZyxcbiAgICBsb2FkU2F2ZWRTdGF0ZXM6IGxvYWRTYXZlZFN0YXRlcyxcbiAgICBhZGRTYXZlZFN0YXRlOiBhZGRTYXZlZFN0YXRlLFxuICAgIGFkZE9yVXBkYXRlU2F2ZWRTdGF0ZTogYWRkT3JVcGRhdGVTYXZlZFN0YXRlLFxuICAgIGZldGNoU3RhdGVzQnlVcmxBbmRNZXRob2Q6IGZldGNoU3RhdGVzQnlVcmxBbmRNZXRob2QsXG4gICAgcmVtb3ZlU3RhdGU6IHJlbW92ZVN0YXRlLFxuICAgIHJlbW92ZU9wdGlvbjogcmVtb3ZlT3B0aW9uLFxuICAgIG9uU3RhdGVDaGFuZ2U6IG9uU2V0U3RhdGVzLFxuICAgIHN0YXRlc0NoYW5nZWQ6IHN0YXRlc0NoYW5nZWQsXG4gICAgX2xvZ1JlcXVlc3Q6IGxvZ1JlcXVlc3QsXG4gICAgX2pzb25wQ2FsbGJhY2tzOiBfanNvbnBDYWxsYmFja3NcblxuICB9O1xuXG4gIGZ1bmN0aW9uIHVwc2VydE9wdGlvbihzdGF0ZSwgbmFtZSwgYWN0aXZlKSB7XG4gICAgdmFyIHN0YXRlc1N0YXR1cyA9IExlb25hcmRvLnN0b3JhZ2UuZ2V0U3RhdGVzKCk7XG4gICAgc3RhdGVzU3RhdHVzW3N0YXRlXSA9IHtcbiAgICAgIG5hbWU6IG5hbWUgfHwgZmluZFN0YXRlT3B0aW9uKHN0YXRlKS5uYW1lLFxuICAgICAgYWN0aXZlOiBhY3RpdmVcbiAgICB9O1xuXG4gICAgTGVvbmFyZG8uc3RvcmFnZS5zZXRTdGF0ZXMoc3RhdGVzU3RhdHVzKTtcbiAgICBzZXR1cEpzb25wRm9yU3RhdGUoc3RhdGUpO1xuICB9XG5cbiAgZnVuY3Rpb24gc2V0dXBKc29ucEZvclN0YXRlKHN0YXRlTmFtZSkge1xuICAgIGNvbnN0IHN0YXRlID0gZmV0Y2hTdGF0ZShzdGF0ZU5hbWUpO1xuICAgIGlmIChzdGF0ZS52ZXJiICYmIHN0YXRlLnZlcmIgPT09ICdKU09OUCcpIHtcbiAgICAgIGNvbnN0IGNhbGxiYWNrTmFtZSA9IGdldENhbGxiYWNrTmFtZShzdGF0ZSk7XG4gICAgICBzdGF0ZS5hY3RpdmUgPyBhY3RpdmVKc29ucFN0YXRlKHN0YXRlLCBjYWxsYmFja05hbWUpIDogZGVhY3RpdmF0ZUpzb25wU3RhdGUoc3RhdGUsIGNhbGxiYWNrTmFtZSk7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gYWN0aXZlSnNvbnBTdGF0ZShzdGF0ZSwgY2FsbGJhY2tOYW1lOiBzdHJpbmcpIHtcbiAgICBjb25zdCBmdW5jTmFtZSA9IHN0YXRlLm5hbWUgKyBjYWxsYmFja05hbWU7XG4gICAgaWYgKF9qc29ucENhbGxiYWNrc1tmdW5jTmFtZV0pIHJldHVybjtcbiAgICBpZiAodHlwZW9mIHdpbmRvd1tjYWxsYmFja05hbWVdID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBfanNvbnBDYWxsYmFja3NbZnVuY05hbWVdID0gd2luZG93W2NhbGxiYWNrTmFtZV07XG4gICAgICB3aW5kb3dbY2FsbGJhY2tOYW1lXSA9IGR1bW15SnNvbnBDYWxsYmFjaztcbiAgICB9XG4gICAgYWN0aXZhdGVKc29ucE1PYnNlcnZlcigpO1xuICB9XG5cbiAgZnVuY3Rpb24gYWN0aXZhdGVKc29ucE1PYnNlcnZlcigpIHtcbiAgICBpZiAoTGVvbmFyZG8uX2pzb25wTXV0YXRpb25PYnNlcnZlcnMpIHtcbiAgICAgIGlmICghZmV0Y2hTdGF0ZXMoKS5zb21lKHN0YXRlID0+IHN0YXRlLnZlcmIgPT09ICdKU09OUCcgJiYgc3RhdGUuYWN0aXZlKSkge1xuICAgICAgICBMZW9uYXJkby5fanNvbnBNdXRhdGlvbk9ic2VydmVycy5mb3JFYWNoKG11dGF0aW9uT2JzZXJ2ZXIgPT4gbXV0YXRpb25PYnNlcnZlciAmJiBtdXRhdGlvbk9ic2VydmVyLmRpc2Nvbm5lY3QoKSk7XG4gICAgICAgIGRlbGV0ZSBMZW9uYXJkby5fanNvbnBDYWxsYmFja3M7XG4gICAgICAgIGRlbGV0ZSBMZW9uYXJkby5fanNvbnBNdXRhdGlvbk9ic2VydmVycztcbiAgICAgIH1cbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3QgdGFyZ2V0cyA9IFtkb2N1bWVudC5ib2R5LCBkb2N1bWVudC5oZWFkXS5maWx0ZXIodGFyZ2V0ID0+ICEhdGFyZ2V0KTtcbiAgICBjb25zdCBjb25maWcgPSB7YXR0cmlidXRlczogZmFsc2UsIGNoaWxkTGlzdDogdHJ1ZSwgY2hhcmFjdGVyRGF0YTogZmFsc2UsIHN1YnRyZWU6IGZhbHNlfTtcblxuICAgIExlb25hcmRvLl9qc29ucE11dGF0aW9uT2JzZXJ2ZXJzID0gdGFyZ2V0cy5tYXAoKHRhcmdldCkgPT4ge1xuICAgICAgcmV0dXJuIG5ldyBNdXRhdGlvbk9ic2VydmVyKGZ1bmN0aW9uIChtdXRhdGlvbnMpIHtcbiAgICAgICAgbXV0YXRpb25zLmZvckVhY2goZnVuY3Rpb24gKG11dGF0aW9uOiBhbnkpIHtcbiAgICAgICAgICBpZiAobXV0YXRpb24uYWRkZWROb2RlcyAmJlxuICAgICAgICAgICAgbXV0YXRpb24uYWRkZWROb2Rlc1swXSAmJlxuICAgICAgICAgICAgbXV0YXRpb24uYWRkZWROb2Rlc1swXS50YWdOYW1lICYmXG4gICAgICAgICAgICBtdXRhdGlvbi5hZGRlZE5vZGVzWzBdLnRhZ05hbWUudG9Mb3dlckNhc2UoKSA9PT0gJ3NjcmlwdCcpIHtcbiAgICAgICAgICAgIGNvbnN0IHNjcmlwdE5vZGUgPSBtdXRhdGlvbi5hZGRlZE5vZGVzWzBdO1xuICAgICAgICAgICAgY29uc3Qgc3RhdGUgPSBmZXRjaFN0YXRlc0J5VXJsQW5kTWV0aG9kKHNjcmlwdE5vZGUuc3JjLCAnSlNPTlAnKTtcbiAgICAgICAgICAgIGlmIChzdGF0ZSAmJiBzdGF0ZS5hY3RpdmUpIHtcbiAgICAgICAgICAgICAgY29uc3QgY2FsbGJhY2tOYW1lID0gZ2V0Q2FsbGJhY2tOYW1lKHN0YXRlKTtcbiAgICAgICAgICAgICAgY29uc3QgZnVuY05hbWUgPSBzdGF0ZS5uYW1lICsgY2FsbGJhY2tOYW1lO1xuICAgICAgICAgICAgICBpZiAoIV9qc29ucENhbGxiYWNrc1tmdW5jTmFtZV0pIHtcbiAgICAgICAgICAgICAgICBhY3RpdmVKc29ucFN0YXRlKHN0YXRlLCBjYWxsYmFja05hbWUpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHNldFRpbWVvdXQoX2pzb25wQ2FsbGJhY2tzW2Z1bmNOYW1lXS5iaW5kKG51bGwsIHN0YXRlLmFjdGl2ZU9wdGlvbi5kYXRhKSwgc3RhdGUuYWN0aXZlT3B0aW9uLmRlbGF5IHx8IDApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgICB0YXJnZXRzLmZvckVhY2goKHRhcmdldCwgaW5kZXgpID0+IExlb25hcmRvLl9qc29ucE11dGF0aW9uT2JzZXJ2ZXJzW2luZGV4XS5vYnNlcnZlKHRhcmdldCwgY29uZmlnKSk7XG4gIH1cblxuICBmdW5jdGlvbiBkdW1teUpzb25wQ2FsbGJhY2soKSB7XG4gIH1cblxuICBmdW5jdGlvbiBkZWFjdGl2YXRlSnNvbnBTdGF0ZShzdGF0ZSwgY2FsbGJhY2tOYW1lKSB7XG4gICAgY29uc3QgZnVuY05hbWUgPSBzdGF0ZS5uYW1lICsgY2FsbGJhY2tOYW1lO1xuICAgIGlmIChfanNvbnBDYWxsYmFja3NbZnVuY05hbWVdKSB7XG4gICAgICB3aW5kb3dbY2FsbGJhY2tOYW1lXSA9IF9qc29ucENhbGxiYWNrc1tmdW5jTmFtZV07XG4gICAgICBkZWxldGUgX2pzb25wQ2FsbGJhY2tzW2Z1bmNOYW1lXTtcbiAgICB9XG4gICAgYWN0aXZhdGVKc29ucE1PYnNlcnZlcigpO1xuICB9XG5cbiAgZnVuY3Rpb24gZ2V0Q2FsbGJhY2tOYW1lKHN0YXRlKSB7XG4gICAgaWYgKHN0YXRlLmpzb25wQ2FsbGJhY2spIHtcbiAgICAgIHJldHVybiBzdGF0ZS5qc29ucENhbGxiYWNrO1xuICAgIH1cblxuICAgIGNvbnN0IHBvc3RmaXggPSBzdGF0ZS51cmwuc3BsaXQoJ2NhbGxiYWNrPScpWzFdO1xuICAgIHJldHVybiBwb3N0Zml4LnNwbGl0KCcmJylbMF07XG4gIH1cblxuICBmdW5jdGlvbiBmZXRjaFN0YXRlc0J5VXJsQW5kTWV0aG9kKHVybCwgbWV0aG9kKSB7XG4gICAgcmV0dXJuIGZldGNoU3RhdGVzKCkuZmlsdGVyKChzdGF0ZSkgPT4ge1xuICAgICAgcmV0dXJuIHN0YXRlLnVybCAmJlxuICAgICAgICAobmV3IFJlZ0V4cChzdGF0ZS51cmwpLnRlc3QodXJsKSB8fCBzdGF0ZS51cmwgPT09IHVybCkgJiZcbiAgICAgICAgc3RhdGUudmVyYi50b0xvd2VyQ2FzZSgpID09PSBtZXRob2QudG9Mb3dlckNhc2UoKTtcblxuICAgIH0pWzBdO1xuICB9XG5cbiAgZnVuY3Rpb24gZmV0Y2hTdGF0ZXMoKSB7XG4gICAgdmFyIGFjdGl2ZVN0YXRlcyA9IExlb25hcmRvLnN0b3JhZ2UuZ2V0U3RhdGVzKCk7XG4gICAgdmFyIHN0YXRlc0NvcHkgPSBfc3RhdGVzLm1hcChmdW5jdGlvbiAoc3RhdGUpIHtcbiAgICAgIHJldHVybiBPYmplY3QuYXNzaWduKHt9LCBzdGF0ZSk7XG4gICAgfSk7XG5cbiAgICBzdGF0ZXNDb3B5LmZvckVhY2goZnVuY3Rpb24gKHN0YXRlOiBhbnkpIHtcbiAgICAgIHZhciBvcHRpb24gPSBhY3RpdmVTdGF0ZXNbc3RhdGUubmFtZV07XG4gICAgICBzdGF0ZS5hY3RpdmUgPSAhIW9wdGlvbiAmJiBvcHRpb24uYWN0aXZlO1xuICAgICAgc3RhdGUuYWN0aXZlT3B0aW9uID0gISFvcHRpb24gP1xuICAgICAgICBzdGF0ZS5vcHRpb25zLmZpbHRlcihmdW5jdGlvbiAoX29wdGlvbikge1xuICAgICAgICAgIHJldHVybiBfb3B0aW9uLm5hbWUgPT09IG9wdGlvbi5uYW1lO1xuICAgICAgICB9KVswXSA6IHN0YXRlLm9wdGlvbnNbMF07XG4gICAgfSk7XG5cbiAgICByZXR1cm4gc3RhdGVzQ29weTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGZldGNoU3RhdGUobmFtZTogc3RyaW5nKSB7XG4gICAgcmV0dXJuIGZldGNoU3RhdGVzKCkuZmlsdGVyKGZ1bmN0aW9uIChzdGF0ZSkge1xuICAgICAgcmV0dXJuIHN0YXRlLm5hbWUgPT09IG5hbWU7XG4gICAgfSlbMF07XG4gIH1cblxuICBmdW5jdGlvbiB0b2dnbGVBY3RpdmF0ZUFsbChmbGFnOiBib29sZWFuKSB7XG4gICAgbGV0IHN0YXRlc1N0YXR1cyA9IGZldGNoU3RhdGVzKCk7XG4gICAgY29uc3Qgc3RhdHVzZXMgPSBzdGF0ZXNTdGF0dXMucmVkdWNlKChvYmosIHMpID0+IHtcbiAgICAgICAgdmFyIG9wdGlvbk5hbWUgPSBzLmFjdGl2ZU9wdGlvbiA/IHMuYWN0aXZlT3B0aW9uLm5hbWUgOiBzLm9wdGlvbnNbMF0ubmFtZTtcbiAgICAgICAgb2JqW3MubmFtZV0gPSB7bmFtZTogb3B0aW9uTmFtZSwgYWN0aXZlOiBmbGFnfTtcbiAgICAgICAgcmV0dXJuIG9iajtcbiAgICAgIH1cbiAgICAgICwge30pO1xuICAgIExlb25hcmRvLnN0b3JhZ2Uuc2V0U3RhdGVzKHN0YXR1c2VzKTtcbiAgICByZXR1cm4gc3RhdGVzU3RhdHVzO1xuICB9XG5cbiAgZnVuY3Rpb24gZmluZFN0YXRlT3B0aW9uKG5hbWUpIHtcbiAgICByZXR1cm4gZmV0Y2hTdGF0ZXMoKS5maWx0ZXIoZnVuY3Rpb24gKHN0YXRlKSB7XG4gICAgICByZXR1cm4gc3RhdGUubmFtZSA9PT0gbmFtZTtcbiAgICB9KVswXS5hY3RpdmVPcHRpb247XG4gIH1cblxuICBmdW5jdGlvbiBnZXRBY3RpdmVTdGF0ZU9wdGlvbihuYW1lKSB7XG4gICAgdmFyIHN0YXRlID0gZmV0Y2hTdGF0ZXMoKS5maWx0ZXIoZnVuY3Rpb24gKHN0YXRlKSB7XG4gICAgICByZXR1cm4gc3RhdGUubmFtZSA9PT0gbmFtZVxuICAgIH0pWzBdO1xuICAgIHJldHVybiAoc3RhdGUgJiYgc3RhdGUuYWN0aXZlICYmIGZpbmRTdGF0ZU9wdGlvbihuYW1lKSkgfHwgbnVsbDtcbiAgfVxuXG4gIGZ1bmN0aW9uIGFkZFN0YXRlKHN0YXRlT2JqLCBvdmVycmlkZU9wdGlvbikge1xuXG4gICAgc3RhdGVPYmoub3B0aW9ucy5mb3JFYWNoKGZ1bmN0aW9uIChvcHRpb24pIHtcbiAgICAgIHVwc2VydCh7XG4gICAgICAgIHN0YXRlOiBzdGF0ZU9iai5uYW1lLFxuICAgICAgICB1cmw6IHN0YXRlT2JqLnVybCxcbiAgICAgICAgdmVyYjogc3RhdGVPYmoudmVyYixcbiAgICAgICAgbmFtZTogb3B0aW9uLm5hbWUsXG4gICAgICAgIGZyb21fbG9jYWw6ICEhb3ZlcnJpZGVPcHRpb24sXG4gICAgICAgIHN0YXR1czogb3B0aW9uLnN0YXR1cyxcbiAgICAgICAgZGF0YTogb3B0aW9uLmRhdGEsXG4gICAgICAgIGRlbGF5OiBvcHRpb24uZGVsYXlcbiAgICAgIH0sIG92ZXJyaWRlT3B0aW9uKTtcbiAgICB9KTtcblxuICAgIC8vJHJvb3RTY29wZS4kYnJvYWRjYXN0KCdsZW9uYXJkbzpzdGF0ZUNoYW5nZWQnLCBzdGF0ZU9iaik7XG4gIH1cblxuICBmdW5jdGlvbiBhZGRTdGF0ZXMoc3RhdGVzQXJyLCBvdmVycmlkZU9wdGlvbiA9IGZhbHNlKSB7XG4gICAgaWYgKEFycmF5LmlzQXJyYXkoc3RhdGVzQXJyKSkge1xuICAgICAgc3RhdGVzQXJyLmZvckVhY2goZnVuY3Rpb24gKHN0YXRlT2JqKSB7XG4gICAgICAgIGFkZFN0YXRlKHN0YXRlT2JqLCBvdmVycmlkZU9wdGlvbik7XG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc29sZS53YXJuKCdsZW9uYXJkbzogYWRkU3RhdGVzIHNob3VsZCBnZXQgYW4gYXJyYXknKTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiB1cHNlcnQoY29uZmlnT2JqLCBvdmVycmlkZU9wdGlvbikge1xuICAgIHZhciB2ZXJiID0gY29uZmlnT2JqLnZlcmIgfHwgJ0dFVCcsXG4gICAgICBzdGF0ZSA9IGNvbmZpZ09iai5zdGF0ZSxcbiAgICAgIG5hbWUgPSBjb25maWdPYmoubmFtZSxcbiAgICAgIGZyb21fbG9jYWwgPSBjb25maWdPYmouZnJvbV9sb2NhbCxcbiAgICAgIHVybCA9IGNvbmZpZ09iai51cmwsXG4gICAgICBzdGF0dXMgPSBjb25maWdPYmouc3RhdHVzIHx8IDIwMCxcbiAgICAgIGRhdGEgPSAodHlwZW9mIGNvbmZpZ09iai5kYXRhICE9PSAndW5kZWZpbmVkJykgPyBjb25maWdPYmouZGF0YSA6IHt9LFxuICAgICAgZGVsYXkgPSBjb25maWdPYmouZGVsYXkgfHwgMDtcbiAgICB2YXIgZGVmYXVsdFN0YXRlID0ge307XG5cbiAgICB2YXIgZGVmYXVsdE9wdGlvbiA9IHt9O1xuXG4gICAgaWYgKCFzdGF0ZSkge1xuICAgICAgY29uc29sZS5sb2coXCJsZW9uYXJkbzogY2Fubm90IHVwc2VydCAtIHN0YXRlIGlzIG1hbmRhdG9yeVwiKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB2YXIgc3RhdGVJdGVtID0gX3N0YXRlcy5maWx0ZXIoZnVuY3Rpb24gKF9zdGF0ZSkge1xuICAgICAgICByZXR1cm4gX3N0YXRlLm5hbWUgPT09IHN0YXRlO1xuICAgICAgfSlbMF0gfHwgZGVmYXVsdFN0YXRlO1xuXG4gICAgT2JqZWN0LmFzc2lnbihzdGF0ZUl0ZW0sIHtcbiAgICAgIG5hbWU6IHN0YXRlLFxuICAgICAgdXJsOiB1cmwgfHwgc3RhdGVJdGVtLnVybCxcbiAgICAgIHZlcmI6IHZlcmIsXG4gICAgICBvcHRpb25zOiBzdGF0ZUl0ZW0ub3B0aW9ucyB8fCBbXVxuICAgIH0pO1xuXG5cbiAgICBpZiAoc3RhdGVJdGVtID09PSBkZWZhdWx0U3RhdGUpIHtcbiAgICAgIF9zdGF0ZXMucHVzaChzdGF0ZUl0ZW0pO1xuICAgIH1cblxuICAgIHZhciBvcHRpb24gPSBzdGF0ZUl0ZW0ub3B0aW9ucy5maWx0ZXIoZnVuY3Rpb24gKF9vcHRpb24pIHtcbiAgICAgIHJldHVybiBfb3B0aW9uLm5hbWUgPT09IG5hbWVcbiAgICB9KVswXTtcblxuICAgIGlmIChvdmVycmlkZU9wdGlvbiAmJiBvcHRpb24pIHtcbiAgICAgIE9iamVjdC5hc3NpZ24ob3B0aW9uLCB7XG4gICAgICAgIG5hbWU6IG5hbWUsXG4gICAgICAgIGZyb21fbG9jYWw6IGZyb21fbG9jYWwsXG4gICAgICAgIHN0YXR1czogc3RhdHVzLFxuICAgICAgICBkYXRhOiBkYXRhLFxuICAgICAgICBkZWxheTogZGVsYXlcbiAgICAgIH0pO1xuICAgIH1cbiAgICBlbHNlIGlmICghb3B0aW9uKSB7XG4gICAgICBPYmplY3QuYXNzaWduKGRlZmF1bHRPcHRpb24sIHtcbiAgICAgICAgbmFtZTogbmFtZSxcbiAgICAgICAgZnJvbV9sb2NhbDogZnJvbV9sb2NhbCxcbiAgICAgICAgc3RhdHVzOiBzdGF0dXMsXG4gICAgICAgIGRhdGE6IGRhdGEsXG4gICAgICAgIGRlbGF5OiBkZWxheVxuICAgICAgfSk7XG5cbiAgICAgIHN0YXRlSXRlbS5vcHRpb25zLnB1c2goZGVmYXVsdE9wdGlvbik7XG4gICAgfVxuICAgIHNldHVwSnNvbnBGb3JTdGF0ZShzdGF0ZSk7XG4gIH1cblxuICBmdW5jdGlvbiBhZGRTY2VuYXJpbyhzY2VuYXJpbywgZnJvbUxvY2FsOiBib29sZWFuID0gZmFsc2UpIHtcbiAgICBpZiAoc2NlbmFyaW8gJiYgdHlwZW9mIHNjZW5hcmlvLm5hbWUgPT09ICdzdHJpbmcnKSB7XG4gICAgICBpZiAoZnJvbUxvY2FsKSB7XG4gICAgICAgIGNvbnN0IHNjZW5hcmlvcyA9IExlb25hcmRvLnN0b3JhZ2UuZ2V0U2NlbmFyaW9zKCk7XG4gICAgICAgIHNjZW5hcmlvcy5wdXNoKHNjZW5hcmlvKTtcbiAgICAgICAgTGVvbmFyZG8uc3RvcmFnZS5zZXRTY2VuYXJpb3Moc2NlbmFyaW9zKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIF9zY2VuYXJpb3Nbc2NlbmFyaW8ubmFtZV0gPSBzY2VuYXJpbztcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgJ2FkZFNjZW5hcmlvIG1ldGhvZCBleHBlY3RzIGEgc2NlbmFyaW8gb2JqZWN0IHdpdGggbmFtZSBwcm9wZXJ0eSc7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gYWRkU2NlbmFyaW9zKHNjZW5hcmlvcykge1xuICAgIHNjZW5hcmlvcy5mb3JFYWNoKChzY2VuYXJpbykgPT4ge1xuICAgICAgYWRkU2NlbmFyaW8oc2NlbmFyaW8pO1xuICAgIH0pO1xuICB9XG5cbiAgZnVuY3Rpb24gZ2V0U2NlbmFyaW9zKCkge1xuICAgIGNvbnN0IHNjZW5hcmlvcyA9IExlb25hcmRvLnN0b3JhZ2UuZ2V0U2NlbmFyaW9zKCkubWFwKChzY2VuYXJpbzogYW55KSA9PiBzY2VuYXJpby5uYW1lKTtcbiAgICByZXR1cm4gT2JqZWN0LmtleXMoX3NjZW5hcmlvcykuY29uY2F0KHNjZW5hcmlvcyk7XG4gIH1cblxuICBmdW5jdGlvbiBnZXRTY2VuYXJpbyhuYW1lOiBzdHJpbmcpIHtcbiAgICBsZXQgc3RhdGVzO1xuICAgIGlmIChfc2NlbmFyaW9zW25hbWVdKSB7XG4gICAgICBzdGF0ZXMgPSBfc2NlbmFyaW9zW25hbWVdLnN0YXRlcztcbiAgICB9IGVsc2Uge1xuICAgICAgc3RhdGVzID0gTGVvbmFyZG8uc3RvcmFnZS5nZXRTY2VuYXJpb3MoKVxuICAgICAgICAuZmlsdGVyKChzY2VuYXJpbykgPT4gc2NlbmFyaW8ubmFtZSA9PT0gbmFtZSlbMF0uc3RhdGVzO1xuICAgIH1cblxuICAgIHJldHVybiBzdGF0ZXM7XG4gIH1cblxuICBmdW5jdGlvbiBzZXRBY3RpdmVTY2VuYXJpbyhuYW1lKSB7XG4gICAgdmFyIHNjZW5hcmlvID0gZ2V0U2NlbmFyaW8obmFtZSk7XG4gICAgaWYgKCFzY2VuYXJpbykge1xuICAgICAgY29uc29sZS53YXJuKFwibGVvbmFyZG86IGNvdWxkIG5vdCBmaW5kIHNjZW5hcmlvIG5hbWVkIFwiICsgbmFtZSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRvZ2dsZUFjdGl2YXRlQWxsKGZhbHNlKTtcbiAgICBzY2VuYXJpby5mb3JFYWNoKGZ1bmN0aW9uIChzdGF0ZSkge1xuICAgICAgdXBzZXJ0T3B0aW9uKHN0YXRlLm5hbWUsIHN0YXRlLm9wdGlvbiwgdHJ1ZSk7XG4gICAgfSk7XG4gIH1cblxuICBmdW5jdGlvbiBhY3RpdmF0ZVN0YXRlT3B0aW9uKHN0YXRlLCBvcHRpb25OYW1lKSB7XG4gICAgdXBzZXJ0T3B0aW9uKHN0YXRlLCBvcHRpb25OYW1lLCB0cnVlKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGRlYWN0aXZhdGVTdGF0ZShzdGF0ZSkge1xuICAgIHVwc2VydE9wdGlvbihzdGF0ZSwgbnVsbCwgZmFsc2UpO1xuICB9XG5cbiAgaW50ZXJmYWNlIElOZXR3b3JrUmVxdWVzdCB7XG4gICAgdmVyYjogRnVuY3Rpb247XG4gICAgZGF0YTogYW55O1xuICAgIHVybD86IHN0cmluZztcbiAgICBzdGF0dXM6IHN0cmluZztcbiAgICB0aW1lc3RhbXA6IERhdGU7XG4gICAgc3RhdGU/OiBzdHJpbmc7XG4gIH1cblxuICBmdW5jdGlvbiBsb2dSZXF1ZXN0KG1ldGhvZCwgdXJsLCBkYXRhLCBzdGF0dXMpIHtcbiAgICBpZiAobWV0aG9kICYmIHVybCAmJiAhKHVybC5pbmRleE9mKFwiLmh0bWxcIikgPiAwKSkge1xuICAgICAgdmFyIHJlcTogSU5ldHdvcmtSZXF1ZXN0ID0ge1xuICAgICAgICB2ZXJiOiBtZXRob2QsXG4gICAgICAgIGRhdGE6IGRhdGEsXG4gICAgICAgIHVybDogdXJsLnRyaW0oKSxcbiAgICAgICAgc3RhdHVzOiBzdGF0dXMsXG4gICAgICAgIHRpbWVzdGFtcDogbmV3IERhdGUoKVxuICAgICAgfTtcbiAgICAgIHJlcS5zdGF0ZSA9IGZldGNoU3RhdGVzQnlVcmxBbmRNZXRob2QocmVxLnVybCwgcmVxLnZlcmIpO1xuICAgICAgX3JlcXVlc3RzTG9nLnB1c2gocmVxKTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBnZXRSZXF1ZXN0c0xvZygpIHtcbiAgICByZXR1cm4gX3JlcXVlc3RzTG9nO1xuICB9XG5cbiAgZnVuY3Rpb24gbG9hZFNhdmVkU3RhdGVzKCkge1xuICAgIF9zYXZlZFN0YXRlcyA9IExlb25hcmRvLnN0b3JhZ2UuZ2V0U2F2ZWRTdGF0ZXMoKTtcbiAgICBhZGRTdGF0ZXMoX3NhdmVkU3RhdGVzLCB0cnVlKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGFkZFNhdmVkU3RhdGUoc3RhdGUpIHtcbiAgICBfc2F2ZWRTdGF0ZXMucHVzaChzdGF0ZSk7XG4gICAgTGVvbmFyZG8uc3RvcmFnZS5zZXRTYXZlZFN0YXRlcyhfc2F2ZWRTdGF0ZXMpO1xuICAgIGFkZFN0YXRlKHN0YXRlLCB0cnVlKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGFkZE9yVXBkYXRlU2F2ZWRTdGF0ZShzdGF0ZSkge1xuICAgIHZhciBvcHRpb24gPSBzdGF0ZS5hY3RpdmVPcHRpb247XG5cbiAgICAvL3VwZGF0ZSBsb2NhbCBzdG9yYWdlIHN0YXRlXG4gICAgdmFyIF9zYXZlZFN0YXRlID0gX3NhdmVkU3RhdGVzLmZpbHRlcihmdW5jdGlvbiAoX3N0YXRlKSB7XG4gICAgICByZXR1cm4gX3N0YXRlLm5hbWUgPT09IHN0YXRlLm5hbWU7XG4gICAgfSlbMF07XG5cbiAgICBpZiAoX3NhdmVkU3RhdGUpIHtcbiAgICAgIHZhciBfc2F2ZWRPcHRpb24gPSBfc2F2ZWRTdGF0ZS5vcHRpb25zLmZpbHRlcihmdW5jdGlvbiAoX29wdGlvbikge1xuICAgICAgICByZXR1cm4gX29wdGlvbi5uYW1lID09PSBvcHRpb24ubmFtZTtcbiAgICAgIH0pWzBdO1xuXG4gICAgICBpZiAoX3NhdmVkT3B0aW9uKSB7XG4gICAgICAgIF9zYXZlZE9wdGlvbi5zdGF0dXMgPSBvcHRpb24uc3RhdHVzO1xuICAgICAgICBfc2F2ZWRPcHRpb24uZGVsYXkgPSBvcHRpb24uZGVsYXk7XG4gICAgICAgIF9zYXZlZE9wdGlvbi5kYXRhID0gb3B0aW9uLmRhdGE7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgX3NhdmVkU3RhdGUub3B0aW9ucy5wdXNoKG9wdGlvbik7XG4gICAgICB9XG5cbiAgICAgIExlb25hcmRvLnN0b3JhZ2Uuc2V0U2F2ZWRTdGF0ZXMoX3NhdmVkU3RhdGVzKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICBhZGRTYXZlZFN0YXRlKHN0YXRlKTtcbiAgICB9XG5cbiAgICAvL3VwZGF0ZSBpbiBtZW1vcnkgc3RhdGVcbiAgICB2YXIgX3N0YXRlID0gX3N0YXRlcy5maWx0ZXIoZnVuY3Rpb24gKF9fc3RhdGUpIHtcbiAgICAgIHJldHVybiBfX3N0YXRlLm5hbWUgPT09IHN0YXRlLm5hbWU7XG4gICAgfSlbMF07XG5cbiAgICBpZiAoX3N0YXRlKSB7XG4gICAgICB2YXIgX29wdGlvbiA9IF9zdGF0ZS5vcHRpb25zLmZpbHRlcihmdW5jdGlvbiAoX19vcHRpb24pIHtcbiAgICAgICAgcmV0dXJuIF9fb3B0aW9uLm5hbWUgPT09IG9wdGlvbi5uYW1lO1xuICAgICAgfSlbMF07XG5cbiAgICAgIGlmIChfb3B0aW9uKSB7XG4gICAgICAgIF9vcHRpb24uc3RhdHVzID0gb3B0aW9uLnN0YXR1cztcbiAgICAgICAgX29wdGlvbi5kZWxheSA9IG9wdGlvbi5kZWxheTtcbiAgICAgICAgX29wdGlvbi5kYXRhID0gb3B0aW9uLmRhdGE7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgX3N0YXRlLm9wdGlvbnMucHVzaChvcHRpb24pO1xuICAgICAgfVxuXG4gICAgICAvLyRyb290U2NvcGUuJGJyb2FkY2FzdCgnbGVvbmFyZG86c3RhdGVDaGFuZ2VkJywgX3N0YXRlKTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiByZW1vdmVTdGF0ZUJ5TmFtZShuYW1lKSB7XG4gICAgdmFyIGluZGV4ID0gMDtcbiAgICBfc3RhdGVzLmZvckVhY2goZnVuY3Rpb24gKHN0YXRlLCBpKSB7XG4gICAgICBpZiAoc3RhdGUubmFtZSA9PT0gbmFtZSkge1xuICAgICAgICBpbmRleCA9IGk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBfc3RhdGVzLnNwbGljZShpbmRleCwgMSk7XG4gIH1cblxuICBmdW5jdGlvbiByZW1vdmVTYXZlZFN0YXRlQnlOYW1lKG5hbWUpIHtcbiAgICB2YXIgaW5kZXggPSAwO1xuICAgIF9zYXZlZFN0YXRlcy5mb3JFYWNoKGZ1bmN0aW9uIChzdGF0ZSwgaSkge1xuICAgICAgaWYgKHN0YXRlLm5hbWUgPT09IG5hbWUpIHtcbiAgICAgICAgaW5kZXggPSBpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgX3NhdmVkU3RhdGVzLnNwbGljZShpbmRleCwgMSk7XG4gIH1cblxuICBmdW5jdGlvbiByZW1vdmVTdGF0ZShzdGF0ZSkge1xuXG4gICAgcmVtb3ZlU3RhdGVCeU5hbWUoc3RhdGUubmFtZSk7XG4gICAgcmVtb3ZlU2F2ZWRTdGF0ZUJ5TmFtZShzdGF0ZS5uYW1lKTtcblxuICAgIExlb25hcmRvLnN0b3JhZ2Uuc2V0U2F2ZWRTdGF0ZXMoX3NhdmVkU3RhdGVzKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHJlbW92ZVN0YXRlT3B0aW9uQnlOYW1lKHN0YXRlTmFtZSwgb3B0aW9uTmFtZSkge1xuICAgIHZhciBzSW5kZXggPSBudWxsO1xuICAgIHZhciBvSW5kZXggPSBudWxsO1xuXG4gICAgX3N0YXRlcy5mb3JFYWNoKGZ1bmN0aW9uIChzdGF0ZSwgaSkge1xuICAgICAgaWYgKHN0YXRlLm5hbWUgPT09IHN0YXRlTmFtZSkge1xuICAgICAgICBzSW5kZXggPSBpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgaWYgKHNJbmRleCAhPT0gbnVsbCkge1xuICAgICAgX3N0YXRlc1tzSW5kZXhdLm9wdGlvbnMuZm9yRWFjaChmdW5jdGlvbiAob3B0aW9uLCBpKSB7XG4gICAgICAgIGlmIChvcHRpb24ubmFtZSA9PT0gb3B0aW9uTmFtZSkge1xuICAgICAgICAgIG9JbmRleCA9IGk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICBpZiAob0luZGV4ICE9PSBudWxsKSB7XG4gICAgICAgIF9zdGF0ZXNbc0luZGV4XS5vcHRpb25zLnNwbGljZShvSW5kZXgsIDEpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHJlbW92ZVNhdmVkU3RhdGVPcHRpb25CeU5hbWUoc3RhdGVOYW1lLCBvcHRpb25OYW1lKSB7XG4gICAgdmFyIHNJbmRleCA9IG51bGw7XG4gICAgdmFyIG9JbmRleCA9IG51bGw7XG5cbiAgICBfc2F2ZWRTdGF0ZXMuZm9yRWFjaChmdW5jdGlvbiAoc3RhdGUsIGkpIHtcbiAgICAgIGlmIChzdGF0ZS5uYW1lID09PSBzdGF0ZU5hbWUpIHtcbiAgICAgICAgc0luZGV4ID0gaTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIGlmIChzSW5kZXggIT09IG51bGwpIHtcbiAgICAgIF9zYXZlZFN0YXRlc1tzSW5kZXhdLm9wdGlvbnMuZm9yRWFjaChmdW5jdGlvbiAob3B0aW9uLCBpKSB7XG4gICAgICAgIGlmIChvcHRpb24ubmFtZSA9PT0gb3B0aW9uTmFtZSkge1xuICAgICAgICAgIG9JbmRleCA9IGk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICBpZiAob0luZGV4ICE9PSBudWxsKSB7XG4gICAgICAgIF9zYXZlZFN0YXRlc1tzSW5kZXhdLm9wdGlvbnMuc3BsaWNlKG9JbmRleCwgMSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gcmVtb3ZlT3B0aW9uKHN0YXRlLCBvcHRpb24pIHtcbiAgICByZW1vdmVTdGF0ZU9wdGlvbkJ5TmFtZShzdGF0ZS5uYW1lLCBvcHRpb24ubmFtZSk7XG4gICAgcmVtb3ZlU2F2ZWRTdGF0ZU9wdGlvbkJ5TmFtZShzdGF0ZS5uYW1lLCBvcHRpb24ubmFtZSk7XG5cbiAgICBMZW9uYXJkby5zdG9yYWdlLnNldFNhdmVkU3RhdGVzKF9zYXZlZFN0YXRlcyk7XG5cbiAgICBhY3RpdmF0ZVN0YXRlT3B0aW9uKF9zdGF0ZXNbMF0ubmFtZSwgX3N0YXRlc1swXS5vcHRpb25zWzBdLm5hbWUpO1xuICB9XG5cbiAgZnVuY3Rpb24gZ2V0UmVjb3JkZWRTdGF0ZXMoKSB7XG4gICAgdmFyIHJlcXVlc3RzQXJyID0gX3JlcXVlc3RzTG9nXG4gICAgICAubWFwKGZ1bmN0aW9uIChyZXEpIHtcbiAgICAgICAgdmFyIHN0YXRlID0gZmV0Y2hTdGF0ZXNCeVVybEFuZE1ldGhvZChyZXEudXJsLCByZXEudmVyYik7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgbmFtZTogc3RhdGUgPyBzdGF0ZS5uYW1lIDogcmVxLnZlcmIgKyBcIiBcIiArIHJlcS51cmwsXG4gICAgICAgICAgdmVyYjogcmVxLnZlcmIsXG4gICAgICAgICAgdXJsOiByZXEudXJsLFxuICAgICAgICAgIHJlY29yZGVkOiAhIXJlcS5zdGF0ZSxcbiAgICAgICAgICBvcHRpb25zOiBbe1xuICAgICAgICAgICAgbmFtZTogcmVxLnN0YXR1cyA+PSAyMDAgJiYgcmVxLnN0YXR1cyA8IDMwMCA/ICdTdWNjZXNzJyA6ICdGYWlsdXJlJyxcbiAgICAgICAgICAgIHN0YXR1czogcmVxLnN0YXR1cyxcbiAgICAgICAgICAgIGRhdGE6IHJlcS5kYXRhXG4gICAgICAgICAgfV1cbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgcmV0dXJuIHJlcXVlc3RzQXJyO1xuICB9XG5cbiAgZnVuY3Rpb24gb25TZXRTdGF0ZXMoZm4pIHtcbiAgICBfZXZlbnRzRWxlbSAmJiBfZXZlbnRzRWxlbS5hZGRFdmVudExpc3RlbmVyKCdsZW9uYXJkbzpzZXRTdGF0ZXMnLCBmbiwgZmFsc2UpO1xuICB9XG5cbiAgZnVuY3Rpb24gc3RhdGVzQ2hhbmdlZCgpIHtcbiAgICBfZXZlbnRzRWxlbSAmJiBfZXZlbnRzRWxlbS5kaXNwYXRjaEV2ZW50KF9zdGF0ZXNDaGFuZ2VkRXZlbnQpO1xuICB9XG59XG4iLCJpbXBvcnQge2xlb0NvbmZpZ3VyYXRpb259IGZyb20gJy4vY29uZmlndXJhdGlvbi5zcnYnO1xuaW1wb3J0IHtTdG9yYWdlfSBmcm9tICcuL3N0b3JhZ2Uuc3J2JztcbmltcG9ydCB7cG9saWZ5bGxzfSBmcm9tICcuL3BvbHlmaWxscyc7XG5pbXBvcnQge1Npbm9ufSBmcm9tICcuL3Npbm9uLnNydic7XG5pbXBvcnQgVUlSb290IGZyb20gJy4vdWkvdWktcm9vdCc7XG5cbmRlY2xhcmUgY29uc3Qgd2luZG93O1xuZGVjbGFyZSBjb25zdCBPYmplY3Q7XG5cbnBvbGlmeWxscygpO1xuXG4vL0luaXQgQ29uZmlndXJhdGlvblxud2luZG93Lkxlb25hcmRvID0gd2luZG93Lkxlb25hcmRvIHx8IHt9O1xuY29uc3QgY29uZmlndXJhdGlvbiA9IGxlb0NvbmZpZ3VyYXRpb24oKTtcbmNvbnN0IHN0b3JhZ2UgPSBuZXcgU3RvcmFnZSgpO1xuT2JqZWN0LmFzc2lnbih3aW5kb3cuTGVvbmFyZG8gfHwge30sIGNvbmZpZ3VyYXRpb24sIHtzdG9yYWdlfSk7XG5MZW9uYXJkby5sb2FkU2F2ZWRTdGF0ZXMoKTtcblxuLy8gSW5pdCBTaW5vblxubmV3IFNpbm9uKCk7XG5cbi8vSW5pdCBVSVxubmV3IFVJUm9vdCgpO1xuIiwiZXhwb3J0IGZ1bmN0aW9uIHBvbGlmeWxscygpIHtcblxuICAvLyBDdXN0b21FdmVudFxuICAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIEN1c3RvbUV2ZW50KGV2ZW50LCBwYXJhbXMpIHtcbiAgICAgIHBhcmFtcyA9IHBhcmFtcyB8fCB7YnViYmxlczogZmFsc2UsIGNhbmNlbGFibGU6IGZhbHNlLCBkZXRhaWw6IHVuZGVmaW5lZH07XG4gICAgICB2YXIgZXZ0ID0gZG9jdW1lbnQuY3JlYXRlRXZlbnQoJ0N1c3RvbUV2ZW50Jyk7XG4gICAgICBldnQuaW5pdEN1c3RvbUV2ZW50KGV2ZW50LCBwYXJhbXMuYnViYmxlcywgcGFyYW1zLmNhbmNlbGFibGUsIHBhcmFtcy5kZXRhaWwpO1xuICAgICAgcmV0dXJuIGV2dDtcbiAgICB9XG5cbiAgICBDdXN0b21FdmVudC5wcm90b3R5cGUgPSB3aW5kb3dbJ0V2ZW50J10ucHJvdG90eXBlO1xuXG4gICAgd2luZG93WydDdXN0b21FdmVudCddID0gQ3VzdG9tRXZlbnQ7XG4gIH0pKCk7XG5cbiAgLy8gT2JqZWN0LmFzc2lnblxuICAoZnVuY3Rpb24gKCkge1xuICAgIGlmICh0eXBlb2YgKDxhbnk+T2JqZWN0KS5hc3NpZ24gIT0gJ2Z1bmN0aW9uJykge1xuICAgICAgKDxhbnk+T2JqZWN0KS5hc3NpZ24gPSBmdW5jdGlvbiAodGFyZ2V0KSB7XG4gICAgICAgICd1c2Ugc3RyaWN0JztcbiAgICAgICAgaWYgKHRhcmdldCA9PSBudWxsKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignQ2Fubm90IGNvbnZlcnQgdW5kZWZpbmVkIG9yIG51bGwgdG8gb2JqZWN0Jyk7XG4gICAgICAgIH1cblxuICAgICAgICB0YXJnZXQgPSBPYmplY3QodGFyZ2V0KTtcbiAgICAgICAgZm9yICh2YXIgaW5kZXggPSAxOyBpbmRleCA8IGFyZ3VtZW50cy5sZW5ndGg7IGluZGV4KyspIHtcbiAgICAgICAgICB2YXIgc291cmNlID0gYXJndW1lbnRzW2luZGV4XTtcbiAgICAgICAgICBpZiAoc291cmNlICE9IG51bGwpIHtcbiAgICAgICAgICAgIGZvciAodmFyIGtleSBpbiBzb3VyY2UpIHtcbiAgICAgICAgICAgICAgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChzb3VyY2UsIGtleSkpIHtcbiAgICAgICAgICAgICAgICB0YXJnZXRba2V5XSA9IHNvdXJjZVtrZXldO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0YXJnZXQ7XG4gICAgICB9O1xuICAgIH1cblxuICB9KSgpXG59XG5cbiIsImltcG9ydCBVdGlscyBmcm9tICcuL3V0aWxzJztcblxuZGVjbGFyZSB2YXIgc2lub247XG5cbmV4cG9ydCBjbGFzcyBTaW5vbiB7XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5pbml0KCk7XG4gIH1cblxuICBwcml2YXRlIGluaXQoKSB7XG4gICAgdmFyIHNlcnZlciA9IHNpbm9uLmZha2VTZXJ2ZXIuY3JlYXRlKHtcbiAgICAgIGF1dG9SZXNwb25kOiB0cnVlLFxuICAgICAgYXV0b1Jlc3BvbmRBZnRlcjogMTBcbiAgICB9KTtcblxuXG4gICAgc2lub24uRmFrZVhNTEh0dHBSZXF1ZXN0LnVzZUZpbHRlcnMgPSB0cnVlO1xuICAgIHNpbm9uLkZha2VYTUxIdHRwUmVxdWVzdC5hZGRGaWx0ZXIoZnVuY3Rpb24gKG1ldGhvZCwgdXJsKSB7XG4gICAgICBpZiAodXJsLmluZGV4T2YoJy5odG1sJykgPiAwICYmIHVybC5pbmRleE9mKCd0ZW1wbGF0ZScpID49IDApIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgICB2YXIgc3RhdGUgPSBMZW9uYXJkby5mZXRjaFN0YXRlc0J5VXJsQW5kTWV0aG9kKHVybCwgbWV0aG9kKTtcbiAgICAgIHJldHVybiAhKHN0YXRlICYmIHN0YXRlLmFjdGl2ZSk7XG4gICAgfSk7XG5cbiAgICBzaW5vbi5GYWtlWE1MSHR0cFJlcXVlc3Qub25SZXNwb25zZUVuZCA9IGZ1bmN0aW9uICh4aHIpIHtcbiAgICAgIHZhciByZXMgPSB4aHIucmVzcG9uc2U7XG4gICAgICB0cnkge1xuICAgICAgICByZXMgPSBKU09OLnBhcnNlKHhoci5yZXNwb25zZSk7XG4gICAgICB9XG4gICAgICBjYXRjaCAoZSkge1xuICAgICAgfVxuICAgICAgTGVvbmFyZG8uX2xvZ1JlcXVlc3QoeGhyLm1ldGhvZCwgeGhyLnVybCwgcmVzLCB4aHIuc3RhdHVzKTtcbiAgICB9O1xuXG4gICAgc2VydmVyLnJlc3BvbmRXaXRoKGZ1bmN0aW9uIChyZXF1ZXN0KSB7XG4gICAgICB2YXIgc3RhdGUgPSBMZW9uYXJkby5mZXRjaFN0YXRlc0J5VXJsQW5kTWV0aG9kKHJlcXVlc3QudXJsLCByZXF1ZXN0Lm1ldGhvZCksXG4gICAgICAgIGFjdGl2ZU9wdGlvbiA9IExlb25hcmRvLmdldEFjdGl2ZVN0YXRlT3B0aW9uKHN0YXRlLm5hbWUpO1xuXG4gICAgICBpZiAoISFhY3RpdmVPcHRpb24pIHtcbiAgICAgICAgdmFyIHJlc3BvbnNlRGF0YSA9IFV0aWxzLmlzRnVuY3Rpb24oYWN0aXZlT3B0aW9uLmRhdGEpID8gYWN0aXZlT3B0aW9uLmRhdGEocmVxdWVzdCkgOiBhY3RpdmVPcHRpb24uZGF0YTtcbiAgICAgICAgcmVxdWVzdC5yZXNwb25kKGFjdGl2ZU9wdGlvbi5zdGF0dXMsIHtcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIn0sIEpTT04uc3RyaW5naWZ5KHJlc3BvbnNlRGF0YSkpO1xuICAgICAgICBMZW9uYXJkby5fbG9nUmVxdWVzdChyZXF1ZXN0Lm1ldGhvZCwgcmVxdWVzdC51cmwsIHJlc3BvbnNlRGF0YSwgYWN0aXZlT3B0aW9uLnN0YXR1cyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zb2xlLndhcm4oJ2NvdWxkIG5vdCBmaW5kIGEgc3RhdGUgZm9yIHRoZSBmb2xsb3dpbmcgcmVxdWVzdCcsIHJlcXVlc3QpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG59XG4iLCJpbXBvcnQgVXRpbHMgZnJvbSAnLi91dGlscyc7XG5cbmRlY2xhcmUgY29uc3Qgd2luZG93OiBhbnk7XG5cbmV4cG9ydCBjbGFzcyBTdG9yYWdlIHtcbiAgcHJpdmF0ZSBBUFBfUFJFRklYO1xuICBwcml2YXRlIFNUQVRFU19TVE9SRV9LRVk7XG4gIHByaXZhdGUgU0NFTkFSSU9TX1NUT1JFX0tFWTtcbiAgcHJpdmF0ZSBTQVZFRF9TVEFURVNfS0VZO1xuICBwcml2YXRlIFBPU0lUSU9OX0tFWTtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLkFQUF9QUkVGSVggPSBMZW9uYXJkby5BUFBfUFJFRklYIHx8ICcnO1xuICAgIHRoaXMuU1RBVEVTX1NUT1JFX0tFWSA9IGAke3RoaXMuQVBQX1BSRUZJWH1sZW9uYXJkby1zdGF0ZXNgO1xuICAgIHRoaXMuU0FWRURfU1RBVEVTX0tFWSA9IGAke3RoaXMuQVBQX1BSRUZJWH1sZW9uYXJkby11bnJlZ2lzdGVyZWQtc3RhdGVzYDtcbiAgICB0aGlzLlNDRU5BUklPU19TVE9SRV9LRVkgPSBgJHt0aGlzLkFQUF9QUkVGSVh9bGVvbmFyZG8tc2NlbmFyaW9zYDtcbiAgICB0aGlzLlBPU0lUSU9OX0tFWSA9IGAke3RoaXMuQVBQX1BSRUZJWH1sZW9uYXJkby1wb3NpdGlvbmA7XG4gIH1cblxuICBfZ2V0SXRlbShrZXkpIHtcbiAgICB2YXIgaXRlbSA9IHdpbmRvdy5sb2NhbFN0b3JhZ2UuZ2V0SXRlbShrZXkpO1xuICAgIGlmICghaXRlbSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIHJldHVybiBVdGlscy5mcm9tSnNvbihpdGVtKTtcbiAgfVxuXG4gIF9zZXRJdGVtKGtleSwgZGF0YSkge1xuICAgIHdpbmRvdy5sb2NhbFN0b3JhZ2Uuc2V0SXRlbShrZXksIFV0aWxzLnRvSnNvbihkYXRhKSk7XG4gIH1cblxuICBnZXRTdGF0ZXMoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2dldEl0ZW0odGhpcy5TVEFURVNfU1RPUkVfS0VZKSB8fCB7fTtcbiAgfVxuXG4gIGdldFNjZW5hcmlvcygpIHtcbiAgICByZXR1cm4gdGhpcy5fZ2V0SXRlbSh0aGlzLlNDRU5BUklPU19TVE9SRV9LRVkpIHx8IFtdO1xuICB9XG5cbiAgc2V0U3RhdGVzKHN0YXRlcykge1xuICAgIHRoaXMuX3NldEl0ZW0odGhpcy5TVEFURVNfU1RPUkVfS0VZLCBzdGF0ZXMpO1xuICAgIExlb25hcmRvLnN0YXRlc0NoYW5nZWQoKTtcbiAgfVxuXG4gIHNldFNjZW5hcmlvcyhzY2VuYXJpb3MpIHtcbiAgICB0aGlzLl9zZXRJdGVtKHRoaXMuU0NFTkFSSU9TX1NUT1JFX0tFWSwgc2NlbmFyaW9zKTtcbiAgfVxuXG4gIGdldFNhdmVkU3RhdGVzKCkge1xuICAgIHZhciBzdGF0ZXMgPSB0aGlzLl9nZXRJdGVtKHRoaXMuU0FWRURfU1RBVEVTX0tFWSkgfHwgW107XG4gICAgc3RhdGVzLmZvckVhY2goZnVuY3Rpb24gKHN0YXRlKSB7XG4gICAgICBzdGF0ZS5vcHRpb25zLmZvckVhY2gob3B0aW9uID0+IHtcbiAgICAgICAgb3B0aW9uLmZyb21fbG9jYWwgPSB0cnVlO1xuICAgICAgfSlcbiAgICB9KTtcbiAgICByZXR1cm4gc3RhdGVzO1xuICB9XG5cbiAgc2V0U2F2ZWRTdGF0ZXMoc3RhdGVzKSB7XG4gICAgdGhpcy5fc2V0SXRlbSh0aGlzLlNBVkVEX1NUQVRFU19LRVksIHN0YXRlcyk7XG4gIH1cblxuICBzZXRTYXZlZFBvc2l0aW9uKHBvc2l0aW9uKSB7XG4gICAgaWYgKCFwb3NpdGlvbikge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLl9zZXRJdGVtKHRoaXMuUE9TSVRJT05fS0VZLCBwb3NpdGlvbik7XG4gIH1cblxuICBnZXRTYXZlZFBvc2l0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLl9nZXRJdGVtKHRoaXMuUE9TSVRJT05fS0VZKTtcbiAgfVxufVxuIiwiaW1wb3J0IFV0aWxzIGZyb20gJy4uL3VpLXV0aWxzJztcbmltcG9ydCBFdmVudHMgZnJvbSAnLi4vdWktZXZlbnRzJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRHJvcERvd24ge1xuXG4gIHZpZXdOb2RlOiBIVE1MRWxlbWVudDtcbiAgcmFuZG9tSUQ6IHN0cmluZztcbiAgb3B0aW9uc1N0YXRlOiBib29sZWFuID0gZmFsc2U7XG4gIHRvZ2dsZUJpbmRlZDogRXZlbnRMaXN0ZW5lciA9IHRoaXMudG9nZ2xlRHJvcERvd24uYmluZCh0aGlzKTtcbiAgY2xvc2VEcm9wRG93bkJpbmRlZDogRXZlbnRMaXN0ZW5lciA9IHRoaXMuY2xvc2VEcm9wRG93bi5iaW5kKHRoaXMpO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgaXRlbXMsXG4gICAgICAgICAgICAgIHByaXZhdGUgYWN0aXZlSXRlbSxcbiAgICAgICAgICAgICAgcHJpdmF0ZSBpc0Rpc2FibGVkOiBib29sZWFuLFxuICAgICAgICAgICAgICBwcml2YXRlIG9uU2VsZWN0SXRlbTogRnVuY3Rpb24sXG4gICAgICAgICAgICAgIHByaXZhdGUgb25SZW1vdmVJdGVtOiBGdW5jdGlvbikge1xuICAgIHRoaXMucmFuZG9tSUQgPSBVdGlscy5ndWlkR2VuZXJhdG9yKCk7XG4gICAgdGhpcy52aWV3Tm9kZSA9IFV0aWxzLmdldEVsZW1lbnRGcm9tSHRtbChgPGRpdiBpZD1cImxlb25hcmRvLWRyb3Bkb3duLSR7dGhpcy5yYW5kb21JRH1cIiBjbGFzcz1cImxlb25hcmRvLWRyb3Bkb3duXCI+PC9kaXY+YCk7XG4gICAgZG9jdW1lbnQuYm9keS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMuY2xvc2VEcm9wRG93bkJpbmRlZCwgZmFsc2UpO1xuICAgIEV2ZW50cy5vbihFdmVudHMuQ0xPU0VfRFJPUERPV05TLCB0aGlzLmNsb3NlRHJvcERvd25CaW5kZWQpO1xuICB9XG5cbiAgZ2V0KCkge1xuICAgIHJldHVybiB0aGlzLnZpZXdOb2RlO1xuICB9XG5cbiAgcmVuZGVyKCkge1xuICAgIHRoaXMudmlld05vZGUucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLnRvZ2dsZUJpbmRlZCwgZmFsc2UpO1xuICAgIHRoaXMudmlld05vZGUuaW5uZXJIVE1MID0gYFxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJsZW9uYXJkby1kcm9wZG93bi1zZWxlY3RlZFwiICR7dGhpcy5pc0Rpc2FibGVkVG9rZW4oKX0+XG4gICAgICAgICAgICA8c3BhbiBjbGFzcz1cImxlb25hcmRvLWRyb3Bkb3duLXNlbGVjdGVkLXRleHRcIj4ke3RoaXMuYWN0aXZlSXRlbS5uYW1lfTwvc3Bhbj5cbiAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwibGVvbmFyZG8tZHJvcGRvd24tc2VsZWN0ZWQtYXJyb3dcIj48L3NwYW4+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPGRpdiBjbGFzcz1cImxlb25hcmRvLWRyb3Bkb3duLW9wdGlvbnNcIj5cbiAgICAgICAgICAgIDx1bCBjbGFzcz1cImxlb25hcmRvLWRyb3Bkb3duLWxpc3RcIj4ke3RoaXMuZ2V0SXRlbXMoKS5qb2luKCcnKX08L3VsPlxuICAgICAgICAgIDwvZGl2PmA7XG4gICAgdGhpcy52aWV3Tm9kZS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMudG9nZ2xlQmluZGVkLCBmYWxzZSk7XG4gIH1cblxuICBkaXNhYmxlRHJvcERvd24oKSB7XG4gICAgdGhpcy5pc0Rpc2FibGVkID0gdHJ1ZTtcbiAgICB0aGlzLnZpZXdOb2RlLnF1ZXJ5U2VsZWN0b3IoYC5sZW9uYXJkby1kcm9wZG93bi1zZWxlY3RlZGApLnNldEF0dHJpYnV0ZSgnZGlzYWJsZWQnLCAnZGlzYWJsZWQnKTtcbiAgfVxuXG4gIGVuYWJsZURyb3BEb3duKCkge1xuICAgIHRoaXMuaXNEaXNhYmxlZCA9IGZhbHNlO1xuICAgIHRoaXMudmlld05vZGUucXVlcnlTZWxlY3RvcihgLmxlb25hcmRvLWRyb3Bkb3duLXNlbGVjdGVkYCkucmVtb3ZlQXR0cmlidXRlKCdkaXNhYmxlZCcpO1xuICB9XG5cbiAgdG9nZ2xlRHJvcERvd24oZXZlbnQ6IE1vdXNlRXZlbnQpIHtcbiAgICBpZiAodGhpcy5pc0Rpc2FibGVkKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmIChldmVudCAmJiBldmVudC50YXJnZXQpIHtcbiAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgIH1cbiAgICBpZiAoZXZlbnQudGFyZ2V0WydjbGFzc0xpc3QnXS5jb250YWlucygnbGVvbmFyZG8tZHJvcGRvd24taXRlbScpKSB7XG4gICAgICB0aGlzLnNldEFjdGl2ZUl0ZW0oZXZlbnQudGFyZ2V0WydxdWVyeVNlbGVjdG9yJ10oJy5sZW9uYXJkby1kcm9wZG93bi1pdGVtLXRleHQnKS5pbm5lckhUTUwpO1xuICAgIH1cbiAgICBlbHNlIGlmIChldmVudC50YXJnZXRbJ2NsYXNzTGlzdCddLmNvbnRhaW5zKCdsZW9uYXJkby1kcm9wZG93bi1pdGVtLXRleHQnKSkge1xuICAgICAgdGhpcy5zZXRBY3RpdmVJdGVtKGV2ZW50LnRhcmdldFsnaW5uZXJIVE1MJ10pO1xuICAgIH1cbiAgICBlbHNlIGlmIChldmVudC50YXJnZXRbJ2NsYXNzTGlzdCddLmNvbnRhaW5zKCdsZW9uYXJkby1kcm9wZG93bi1pdGVtLXgnKSkge1xuICAgICAgdGhpcy5yZW1vdmVJdGVtKDxIVE1MRWxlbWVudD5ldmVudC50YXJnZXRbJ3BhcmVudE5vZGUnXSk7XG4gICAgfVxuICAgIGlmICh0aGlzLm9wdGlvbnNTdGF0ZSkge1xuICAgICAgdGhpcy5jbG9zZURyb3BEb3duKCk7XG4gICAgICB0aGlzLm9wdGlvbnNTdGF0ZSA9IGZhbHNlO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHRoaXMub3BlbkRyb3BEb3duKCk7XG4gICAgICB0aGlzLm9wdGlvbnNTdGF0ZSA9IHRydWU7XG4gICAgfVxuICB9XG5cbiAgb3BlbkRyb3BEb3duKCkge1xuICAgIGNvbnN0IGVsZW06IEhUTUxFbGVtZW50ID0gPEhUTUxFbGVtZW50PnRoaXMudmlld05vZGUucXVlcnlTZWxlY3RvcihgLmxlb25hcmRvLWRyb3Bkb3duLW9wdGlvbnNgKTtcbiAgICBlbGVtLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xuICAgIGNvbnN0IGVsZW1SZWM6IENsaWVudFJlY3QgPSBlbGVtLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgIGNvbnN0IGlzT3ZlcmZsb3dlZDogYm9vbGVhbiA9IGVsZW1SZWMudG9wICsgZWxlbVJlYy5oZWlnaHQgPiB3aW5kb3cuaW5uZXJIZWlnaHQ7XG4gICAgaWYgKGlzT3ZlcmZsb3dlZCkge1xuICAgICAgZWxlbS5zdHlsZS50b3AgPSAtZWxlbVJlYy5oZWlnaHQgKyAncHgnO1xuICAgIH1cbiAgICBFdmVudHMuZGlzcGF0Y2goRXZlbnRzLkNMT1NFX0RST1BET1dOUywgdGhpcy52aWV3Tm9kZSk7XG4gIH1cblxuICBjbG9zZURyb3BEb3duKGV2ZW50PzogQ3VzdG9tRXZlbnQpIHtcbiAgICBjb25zdCBkcm9wRG93bjogSFRNTEVsZW1lbnQgPSA8SFRNTEVsZW1lbnQ+dGhpcy52aWV3Tm9kZS5xdWVyeVNlbGVjdG9yKGAubGVvbmFyZG8tZHJvcGRvd24tb3B0aW9uc2ApO1xuICAgIGlmICghZHJvcERvd24gfHwgKGV2ZW50ICYmIGV2ZW50LmRldGFpbCA9PT0gdGhpcy52aWV3Tm9kZSkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgZHJvcERvd24uc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgfVxuXG4gIHNldEFjdGl2ZUl0ZW0oaXRlbU5hbWU6IHN0cmluZykge1xuICAgIGlmICh0aGlzLmFjdGl2ZUl0ZW0ubmFtZSA9PT0gaXRlbU5hbWUpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5hY3RpdmVJdGVtID0gdGhpcy5nZXRJdGVtQnlOYW1lKGl0ZW1OYW1lKTtcbiAgICB0aGlzLnZpZXdOb2RlLnF1ZXJ5U2VsZWN0b3IoYC5sZW9uYXJkby1kcm9wZG93bi1zZWxlY3RlZC10ZXh0YClbJ2lubmVySFRNTCddID0gdGhpcy5hY3RpdmVJdGVtLm5hbWU7XG4gICAgdGhpcy5vblNlbGVjdEl0ZW0odGhpcy5hY3RpdmVJdGVtKTtcbiAgfVxuXG4gIHByaXZhdGUgZ2V0SXRlbUJ5TmFtZShpdGVtTmFtZTogc3RyaW5nKSB7XG4gICAgbGV0IHJldEl0ZW0gPSB0aGlzLmFjdGl2ZUl0ZW07XG4gICAgdGhpcy5pdGVtcy5zb21lKChjdXJJdGVtKSA9PiB7XG4gICAgICBpZiAoY3VySXRlbS5uYW1lID09PSBpdGVtTmFtZSkge1xuICAgICAgICByZXRJdGVtID0gY3VySXRlbTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIHJldEl0ZW07XG4gIH1cblxuICBwcml2YXRlIGdldEl0ZW1zKCkge1xuICAgIHJldHVybiB0aGlzLml0ZW1zLm1hcCgoaXRlbToge25hbWU6IHN0cmluZ30pID0+IHtcbiAgICAgIHJldHVybiBgPGxpIGNsYXNzPVwibGVvbmFyZG8tZHJvcGRvd24taXRlbVwiPjxzcGFuIGNsYXNzPVwibGVvbmFyZG8tZHJvcGRvd24taXRlbS10ZXh0XCI+JHtpdGVtLm5hbWV9PC9zcGFuPjxzcGFuIGNsYXNzPVwibGVvbmFyZG8tZHJvcGRvd24taXRlbS14XCI+PC9zcGFuPjwvbGk+YFxuICAgIH0pXG4gIH1cblxuICBwcml2YXRlIGlzRGlzYWJsZWRUb2tlbigpIHtcbiAgICByZXR1cm4gdGhpcy5pc0Rpc2FibGVkID8gJ2Rpc2FibGVkJyA6ICcnO1xuICB9XG5cbiAgcHJpdmF0ZSByZW1vdmVJdGVtKGl0ZW06IEhUTUxFbGVtZW50KSB7XG4gICAgaWYgKHRoaXMuaXRlbXMubGVuZ3RoIDw9IDEpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgbGV0IHJlbW92ZWRJdGVtO1xuICAgIHRoaXMuaXRlbXMgPSB0aGlzLml0ZW1zLmZpbHRlcigoY3VySXRlbSkgPT4ge1xuICAgICAgaWYgKGN1ckl0ZW0ubmFtZSA9PT0gaXRlbS5xdWVyeVNlbGVjdG9yKCcubGVvbmFyZG8tZHJvcGRvd24taXRlbS10ZXh0JylbJ2lubmVySFRNTCddKSB7XG4gICAgICAgIHJlbW92ZWRJdGVtID0gY3VySXRlbTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICB0aGlzLnZpZXdOb2RlLnF1ZXJ5U2VsZWN0b3IoJy5sZW9uYXJkby1kcm9wZG93bi1saXN0JykucmVtb3ZlQ2hpbGQoaXRlbSk7XG4gICAgdGhpcy5vblJlbW92ZUl0ZW0ocmVtb3ZlZEl0ZW0pO1xuXG4gIH1cblxuICBwcml2YXRlIG9uRGVzdHJveSgpIHtcbiAgICBkb2N1bWVudC5ib2R5LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy5jbG9zZURyb3BEb3duQmluZGVkLCBmYWxzZSk7XG4gICAgdGhpcy52aWV3Tm9kZS5yZW1vdmVFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMudG9nZ2xlQmluZGVkLCBmYWxzZSk7XG4gIH1cbn1cbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi8uLi9sZW9uYXJkby5kLnRzXCIgLz5cbmltcG9ydCBVdGlscyBmcm9tICcuLi91aS11dGlscyc7XG5pbXBvcnQgRXZlbnRzIGZyb20gJy4uL3VpLWV2ZW50cyc7XG5pbXBvcnQge0hlYWRlclRhYkl0ZW19IGZyb20gJy4vaGVhZGVyLm1vZGVsJztcbmltcG9ydCBVSVN0YXRlVmlld1NlcnZpY2UgZnJvbSAnLi4vdWktc3RhdGUvdWktc3RhdGUuc3J2JztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgSGVhZGVyVmlldyB7XG4gIFxuICBzdGF0aWMgU0VMRUNURURfQ0xBU1NfTkFNRTogc3RyaW5nID0gJ2xlb25hcmRvLWhlYWRlci10YWJJdGVtLXNlbGVjdGVkJztcblxuICBwcml2YXRlIG9uQ2xpY2tCaW5kZWQ6IEV2ZW50TGlzdGVuZXJPYmplY3QgPSB0aGlzLm9uQ2xpY2suYmluZCh0aGlzKTtcblxuICBcbiAgY29uc3RydWN0b3IocHJpdmF0ZSB0YWJMaXN0OiBBcnJheTxIZWFkZXJUYWJJdGVtPikge1xuICB9XG5cbiAgZ2V0KCkge1xuICAgIGNvbnN0IHRlbXBsYXRlID0gYDxkaXYgY2xhc3M9XCJsZW9uYXJkby1oZWFkZXItY29udGFpbmVyXCI+XG4gICAgICAgIDxzcGFuIGNsYXNzPVwibGVvbmFyZG8taGVhZGVyLWxhYmVsIFwiPkxFT05BUkRPPC9zcGFuPlxuICAgICAgICA8c3BhbiBjbGFzcz1cImxlb25hcmRvLWhlYWRlci10YWJzXCI+XG4gICAgICAgICAgPHVsPlxuICAgICAgICAgICAgJHt0aGlzLmdldFRhYnNIdG1sKDApfVxuICAgICAgICAgIDwvdWw+XG4gICAgICA8L3NwYW4+XG4gICAgPC9kaXY+YDtcbiAgICBjb25zdCBsYXVuY2hlciA9IFV0aWxzLmdldEVsZW1lbnRGcm9tSHRtbCh0ZW1wbGF0ZSk7XG4gICAgbGF1bmNoZXIucXVlcnlTZWxlY3RvcigndWwnKS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMub25DbGlja0JpbmRlZCk7XG4gICAgcmV0dXJuIGxhdW5jaGVyO1xuICB9XG5cbiAgcHJpdmF0ZSBnZXRUYWJzSHRtbChzZWxlY3RlZEluZGV4OiBudW1iZXIpIHtcbiAgICByZXR1cm4gdGhpcy50YWJMaXN0Lm1hcCgodGFiOiBIZWFkZXJUYWJJdGVtLCBpbmRleDogbnVtYmVyKSA9PiB7XG4gICAgICBjb25zdCBzZWxlY3RlZDogc3RyaW5nID0gaW5kZXggPT09IHNlbGVjdGVkSW5kZXggPyBIZWFkZXJWaWV3LlNFTEVDVEVEX0NMQVNTX05BTUUgOiAnJztcbiAgICAgIHJldHVybiBgPGxpIGNsYXNzPVwibGVvbmFyZG8taGVhZGVyLXRhYkl0ZW0gJHtzZWxlY3RlZH1cIiBkYXRhLWhlYWRlcnRhYj1cImxlb25hcmRvLWhlYWRlci0ke3RhYi5sYWJlbH1cIiA+JHt0YWIubGFiZWx9PC9saT5gO1xuICAgIH0pLmpvaW4oJycpO1xuICB9XG5cbiAgb25DbGljayhldmVudDogTW91c2VFdmVudCkge1xuICAgIHRoaXMuc2VsZWN0VGFiKGV2ZW50LnRhcmdldFsnaW5uZXJIVE1MJ10pO1xuICB9XG5cbiAgc2VsZWN0VGFiKHRhYkxhYmVsOiBzdHJpbmcpe1xuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYC4ke0hlYWRlclZpZXcuU0VMRUNURURfQ0xBU1NfTkFNRX1gKS5jbGFzc0xpc3QucmVtb3ZlKGBsZW9uYXJkby1oZWFkZXItdGFiSXRlbS1zZWxlY3RlZGApO1xuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYFtkYXRhLWhlYWRlcnRhYj1cImxlb25hcmRvLWhlYWRlci0ke3RhYkxhYmVsfVwiXWApLmNsYXNzTGlzdC5hZGQoSGVhZGVyVmlldy5TRUxFQ1RFRF9DTEFTU19OQU1FKTtcbiAgICBVSVN0YXRlVmlld1NlcnZpY2UuZ2V0SW5zdGFuY2UoKS5zZXRDdXJWaWV3U3RhdGUodGFiTGFiZWwpO1xuICB9XG5cbiAgLy8kKGRvY3VtZW50KS5vbigna2V5cHJlc3MnLCAoZSkgPT4ge1xuICAvLyAgaWYgKGUuc2hpZnRLZXkgJiYgZS5jdHJsS2V5KSB7XG4gIC8vICAgIHN3aXRjaCAoZS5rZXlDb2RlKSB7XG4gIC8vICAgICAgY2FzZSAxMjpcbiAgLy8gICAgICAgICQoJy5sZW9uYXJkby1hY3RpdmF0b3InKS50b2dnbGUoKTtcbiAgLy8gICAgICAgIGJyZWFrO1xuICAvLyAgICAgIGNhc2UgMTE6XG4gIC8vICAgICAgICB0b2dnbGVXaW5kb3coKTtcbiAgLy8gICAgICAgIGJyZWFrO1xuICAvLyAgICAgIGRlZmF1bHQ6XG4gIC8vICAgICAgICBicmVhaztcbiAgLy8gICAgfVxuICAvLyAgfVxuICAvL30pO1xufVxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uLy4uL2xlb25hcmRvLmQudHNcIiAvPlxuaW1wb3J0IFV0aWxzIGZyb20gJy4uL3VpLXV0aWxzJztcbmltcG9ydCBFdmVudHMgZnJvbSAnLi4vdWktZXZlbnRzJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTGF1bmNoZXIge1xuICBsYXVuY2hlcjogSFRNTEVsZW1lbnQ7XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgRXZlbnRzLm9uKCdrZXlkb3duJywgdGhpcy5ib2R5S2V5cHJlc3MuYmluZCh0aGlzKSk7XG4gICAgRXZlbnRzLm9uKEV2ZW50cy5UT0dHTEVfSUNPTiwgdGhpcy50b2dnbGVMYXVuY2hlci5iaW5kKHRoaXMpKVxuICB9XG5cbiAgZ2V0KCk6IEhUTUxFbGVtZW50IHtcbiAgICB0aGlzLmxhdW5jaGVyID0gVXRpbHMuZ2V0RWxlbWVudEZyb21IdG1sKGA8ZGl2IGNsYXNzPVwibGVvbmFyZG8tbGF1bmNoZXJcIj48L2Rpdj5gKTtcbiAgICB0aGlzLmxhdW5jaGVyLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy5vbkNsaWNrKTtcbiAgICByZXR1cm4gdGhpcy5sYXVuY2hlcjtcbiAgfVxuXG4gIG9uQ2xpY2soKSB7XG4gICAgRXZlbnRzLmRpc3BhdGNoKEV2ZW50cy5UT0dHTEVfTEFVTkNIRVIpO1xuICB9XG5cbiAgYm9keUtleXByZXNzKGU6IEtleWJvYXJkRXZlbnQpIHtcbiAgICBpZiAoZS5zaGlmdEtleSAmJiBlLmN0cmxLZXkgJiYgZS5rZXlDb2RlID09PSA3Nikge1xuICAgICAgRXZlbnRzLmRpc3BhdGNoKEV2ZW50cy5UT0dHTEVfSUNPTik7XG4gICAgfVxuICB9XG5cbiAgdG9nZ2xlTGF1bmNoZXIoKSB7XG4gICAgdGhpcy5sYXVuY2hlci5zdHlsZS5kaXNwbGF5ID0gdGhpcy5sYXVuY2hlci5zdHlsZS5kaXNwbGF5ID09PSAnbm9uZScgPyAnYmxvY2snIDogJ25vbmUnO1xuICB9XG59XG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vLi4vbGVvbmFyZG8uZC50c1wiIC8+XG5pbXBvcnQgVXRpbHMgZnJvbSAnLi4vdWktdXRpbHMnO1xuaW1wb3J0IEV2ZW50cyBmcm9tICcuLi91aS1ldmVudHMnO1xuaW1wb3J0IEhlYWRlclZpZXcgZnJvbSAnLi4vaGVhZGVyL2hlYWRlcic7XG5pbXBvcnQge0hlYWRlclRhYkl0ZW19IGZyb20gJy4uL2hlYWRlci9oZWFkZXIubW9kZWwnO1xuaW1wb3J0IHtVSVN0YXRlTGlzdH0gZnJvbSAnLi4vdWktc3RhdGUvdWktc3RhdGUuZGF0YSc7XG5pbXBvcnQgVUlTdGF0ZVZpZXdTZXJ2aWNlIGZyb20gJy4uL3VpLXN0YXRlL3VpLXN0YXRlLnNydic7XG5pbXBvcnQge1VJVmlld1N0YXRlfSBmcm9tICcuLi91aS1zdGF0ZS91aS1zdGF0ZS5tb2RlbCc7XG5pbXBvcnQgVmlld3NDb250YWluZXIgZnJvbSAnLi4vdmlld3MtY29udGFpbmVyL3ZpZXdzLWNvbnRhaW5lcic7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE1haW5WaWV3IHtcbiAgY2xhc3NOYW1lID0gJ2xlb25hcmRvLW1haW4tdmlldyc7XG4gIGhpZGRlbkNsYXNzTmFtZSA9IGAke3RoaXMuY2xhc3NOYW1lfS1oaWRkZW5gO1xuICBoZWFkZXJWaWV3OiBIZWFkZXJWaWV3O1xuICB2aWV3c0NvbnRhaW5lcjogVmlld3NDb250YWluZXI7XG4gIHZpZXdOb2RlOiBOb2RlO1xuICBib2R5VmlldzogTm9kZTtcbiAgbWVudVZpZXc6IEhUTUxFbGVtZW50O1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIEV2ZW50cy5vbigna2V5ZG93bicsIHRoaXMub25LZXlQcmVzcy5iaW5kKHRoaXMpKTtcbiAgICB0aGlzLmJvZHlWaWV3ID0gVXRpbHMuZ2V0RWxlbWVudEZyb21IdG1sKGA8ZGl2IGNsYXNzPVwibGVvbmFyZG8tbWFpbi12aWV3LWJvZHlcIj48L2Rpdj5gKTtcbiAgICB0aGlzLm1lbnVWaWV3ID0gVXRpbHMuZ2V0RWxlbWVudEZyb21IdG1sKGA8ZGl2IGNsYXNzPVwibGVvbmFyZG8tbWFpbi12aWV3LW1lbnVcIj48L2Rpdj5gKTtcblxuICAgIEV2ZW50cy5vbihFdmVudHMuVE9HR0xFX0xBVU5DSEVSLCB0aGlzLnRvZ2dsZVZpZXcuYmluZCh0aGlzKSk7XG4gICAgVUlTdGF0ZVZpZXdTZXJ2aWNlLmdldEluc3RhbmNlKCkuaW5pdChVSVN0YXRlTGlzdCh0aGlzLm1lbnVWaWV3KSwgVUlTdGF0ZUxpc3QodGhpcy5tZW51VmlldylbMF0ubmFtZSk7XG4gICAgdGhpcy5oZWFkZXJWaWV3ID0gbmV3IEhlYWRlclZpZXcodGhpcy5nZXRUYWJMaXN0KCkpO1xuICAgIHRoaXMudmlld3NDb250YWluZXIgPSBuZXcgVmlld3NDb250YWluZXIoKTtcbiAgfVxuXG4gIGdldCgpOiBOb2RlIHtcbiAgICB0aGlzLnZpZXdOb2RlID0gVXRpbHMuZ2V0RWxlbWVudEZyb21IdG1sKGA8ZGl2IGNsYXNzPVwiJHt0aGlzLmNsYXNzTmFtZX0gJHt0aGlzLmhpZGRlbkNsYXNzTmFtZX1cIj48L2Rpdj5gKTtcbiAgICByZXR1cm4gdGhpcy52aWV3Tm9kZTtcbiAgfVxuXG4gIHRvZ2dsZVZpZXcoKSB7XG4gICAgY29uc3QgZWwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGAuJHt0aGlzLmNsYXNzTmFtZX1gKTtcbiAgICBpZiAoIWVsKSByZXR1cm47XG4gICAgaWYgKGVsLmNsYXNzTGlzdC5jb250YWlucyh0aGlzLmhpZGRlbkNsYXNzTmFtZSkpIHtcbiAgICAgIGVsLmNsYXNzTGlzdC5yZW1vdmUodGhpcy5oaWRkZW5DbGFzc05hbWUpO1xuICAgICAgaWYgKCFlbC5jaGlsZE5vZGVzLmxlbmd0aCkge1xuICAgICAgICB0aGlzLmtpY2tTdGFydCgpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmNsb3NlTGVvKCk7XG4gICAgfVxuICB9XG5cbiAga2lja1N0YXJ0KCkge1xuICAgIHRoaXMudmlld05vZGUuYXBwZW5kQ2hpbGQodGhpcy5ib2R5Vmlldyk7XG4gICAgdGhpcy52aWV3Tm9kZS5hcHBlbmRDaGlsZCh0aGlzLm1lbnVWaWV3KTtcblxuICAgIHRoaXMuYm9keVZpZXcuYXBwZW5kQ2hpbGQodGhpcy5oZWFkZXJWaWV3LmdldCgpKTtcbiAgICB0aGlzLmJvZHlWaWV3LmFwcGVuZENoaWxkKHRoaXMudmlld3NDb250YWluZXIuZ2V0KCkpO1xuICAgIHRoaXMudmlld3NDb250YWluZXIucmVuZGVyKFVJU3RhdGVWaWV3U2VydmljZS5nZXRJbnN0YW5jZSgpLmdldEN1clZpZXdTdGF0ZSgpKTtcbiAgfVxuXG4gIHByaXZhdGUgZ2V0VGFiTGlzdCgpOiBBcnJheTxIZWFkZXJUYWJJdGVtPiB7XG4gICAgcmV0dXJuIFVJU3RhdGVWaWV3U2VydmljZS5nZXRJbnN0YW5jZSgpLmdldFZpZXdTdGF0ZXMoKS5tYXAoKHZpZXc6IFVJVmlld1N0YXRlKSA9PiB7XG4gICAgICByZXR1cm4ge2xhYmVsOiB2aWV3Lm5hbWV9XG4gICAgfSk7XG4gIH1cblxuICBwcml2YXRlIGNsb3NlTGVvKCkge1xuICAgIGNvbnN0IGVsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgLiR7dGhpcy5jbGFzc05hbWV9YCk7XG4gICAgZWwuY2xhc3NMaXN0LmFkZCh0aGlzLmhpZGRlbkNsYXNzTmFtZSk7XG4gIH1cblxuICBwcml2YXRlIG9uS2V5UHJlc3MoZXZlbnQ6IE1vdXNlRXZlbnQpIHtcbiAgICBpZiAoZXZlbnQud2hpY2ggPT0gMjcpIHtcbiAgICAgIHRoaXMuY2xvc2VMZW8oKTtcbiAgICB9XG4gIH1cbn1cbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9sZW9uYXJkby5kLnRzXCIgLz5cblxuZXhwb3J0IGRlZmF1bHQge1xuICBUT0dHTEVfTEFVTkNIRVI6ICdsZW9uYXJkbzp0b2dnbGU6bGF1bmNoZXInLFxuICBDSEFOR0VfVklFVzogJ2xlb25hcmRvOmNoYW5nZTp2aWV3JyxcbiAgU0NFTkFSSU9fQ0xJQ0tFRDogJ2xlb25hcmRvOnNjZW5hcmlvOmNsaWNrZWQnLFxuICBGSUxURVJfU1RBVEVTOiAnbGVvbmFyZG86ZmlsdGVyOnN0YXRlcycsXG4gIENMT1NFX0RST1BET1dOUzogJ2xlb25hcmRvOmNsb3NlOmRyb3Bkb3ducycsXG4gIFRPR0dMRV9TVEFURVM6ICdsZW9uYXJkbzp0b2dnbGU6c3RhdGVzJyxcbiAgVE9HR0xFX1NDRU5BUklPUzogJ2xlb25hcmRvOnRvZ2dsZTpzY2VuYXJpbycsXG4gIEFERF9TQ0VOQVJJTzogJ2xlb25hcmRvOmFkZDpzY2VuYXJpbycsXG4gIFRPR0dMRV9TVEFURTogJ2xlb25hcmRvOnRvZ2dsZTpzdGF0ZXMnLFxuICBUT0dHTEVfSUNPTjogJ2xlb25hcmRvOnRvZ2dsZTppY29uJyxcblxuICBvbjogKGV2ZW50TmFtZTogc3RyaW5nLCBmbjogRXZlbnRMaXN0ZW5lck9yRXZlbnRMaXN0ZW5lck9iamVjdCkgPT4ge1xuICAgIGRvY3VtZW50LmJvZHkuYWRkRXZlbnRMaXN0ZW5lcihldmVudE5hbWUsIGZuKTtcbiAgfSxcbiAgZGlzcGF0Y2g6IChldmVudE5hbWU6IHN0cmluZywgZGV0YWlscz86IGFueSkgPT4ge1xuICAgIGNvbnN0IGV2ZW50ID0gbmV3IEN1c3RvbUV2ZW50KGV2ZW50TmFtZSwge2RldGFpbDogZGV0YWlsc30pO1xuICAgIGRvY3VtZW50LmJvZHkuZGlzcGF0Y2hFdmVudChldmVudCk7XG4gIH1cbn1cbiIsImltcG9ydCBMYXVuY2hlciBmcm9tICcuL2xhdW5jaGVyL2xhdW5jaGVyJztcbmltcG9ydCBNYWluVmlldyBmcm9tICcuL21haW4tdmlldy9tYWluLXZpZXcnO1xuaW1wb3J0IFV0aWxzIGZyb20gJy4vdWktdXRpbHMnO1xuaW1wb3J0IEV2ZW50cyBmcm9tICcuL3VpLWV2ZW50cyc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFVJUm9vdCB7XG4gIGxlb25hcmRvQXBwOiBOb2RlO1xuICBsYXVuY2hlcjogTGF1bmNoZXI7XG4gIG1haW5WaWV3OiBNYWluVmlldztcbiAgaW5pdEJpbmRlZDogRXZlbnRMaXN0ZW5lciA9IHRoaXMuaW5pdC5iaW5kKHRoaXMpO1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN3aXRjaCAoZG9jdW1lbnQucmVhZHlTdGF0ZSkge1xuICAgICAgZGVmYXVsdDpcbiAgICAgIGNhc2UgJ2xvYWRpbmcnOlxuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgdGhpcy5pbml0QmluZGVkLCBmYWxzZSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnaW50ZXJhY3RpdmUnOlxuICAgICAgY2FzZSAnY29tcGxldGUnOlxuICAgICAgICB0aGlzLmluaXQoKTtcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG5cbiAgaW5pdCgpIHtcbiAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgdGhpcy5pbml0QmluZGVkLCBmYWxzZSk7XG4gICAgdGhpcy5sZW9uYXJkb0FwcCA9IFV0aWxzLmdldEVsZW1lbnRGcm9tSHRtbChgPGRpdiBsZW9uYXJkby1hcHA+PC9kaXY+YCk7XG4gICAgdGhpcy5sYXVuY2hlciA9IG5ldyBMYXVuY2hlcigpO1xuICAgIHRoaXMubWFpblZpZXcgPSBuZXcgTWFpblZpZXcoKTtcbiAgICB0aGlzLmxlb25hcmRvQXBwLmFwcGVuZENoaWxkKHRoaXMubWFpblZpZXcuZ2V0KCkpO1xuICAgIHRoaXMubGVvbmFyZG9BcHAuYXBwZW5kQ2hpbGQodGhpcy5sYXVuY2hlci5nZXQoKSk7XG4gICAgZG9jdW1lbnQuYm9keS5hZGRFdmVudExpc3RlbmVyKEV2ZW50cy5UT0dHTEVfU1RBVEVTLCB0aGlzLnRvZ2dsZUFsbFN0YXRlcy5iaW5kKHRoaXMpKTtcbiAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHRoaXMubGVvbmFyZG9BcHApO1xuICB9XG5cbiAgcHJpdmF0ZSB0b2dnbGVBbGxTdGF0ZXMoZXZlbnQ6IEN1c3RvbUV2ZW50KSB7XG4gICAgTGVvbmFyZG8udG9nZ2xlQWN0aXZhdGVBbGwoZXZlbnQuZGV0YWlsKTtcbiAgfVxufSIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi8uLi9sZW9uYXJkby5kLnRzXCIgLz5cblxuaW1wb3J0IHtVSVZpZXdTdGF0ZX0gZnJvbSAnLi91aS1zdGF0ZS5tb2RlbCc7XG5pbXBvcnQgU2NlbmFyaW9zIGZyb20gJy4uL3ZpZXdzL3NjZW5hcmlvcy9zY2VuYXJpb3MnO1xuaW1wb3J0IFJlY29yZGVyIGZyb20gJy4uL3ZpZXdzL3JlY29yZGVyL3JlY29yZGVyJztcbmltcG9ydCBFeHBvcnQgZnJvbSAnLi4vdmlld3MvZXhwb3J0L2V4cG9ydCc7XG5cbmxldCB1aUxpc3Q6IEFycmF5PFVJVmlld1N0YXRlPjtcblxuZXhwb3J0IGZ1bmN0aW9uIFVJU3RhdGVMaXN0KG1lbnVWaWV3OiBIVE1MRWxlbWVudCk6IEFycmF5PFVJVmlld1N0YXRlPiB7XG4gIGlmKHVpTGlzdCl7XG4gICAgcmV0dXJuIHVpTGlzdDtcbiAgfVxuICByZXR1cm4gdWlMaXN0ID0gW1xuICAgIHtcbiAgICAgIG5hbWU6ICdzY2VuYXJpb3MnLFxuICAgICAgY29tcG9uZW50OiBuZXcgU2NlbmFyaW9zKClcbiAgICB9LFxuICAgIHtcbiAgICAgIG5hbWU6ICdyZWNvcmRlcicsXG4gICAgICBjb21wb25lbnQ6IG5ldyBSZWNvcmRlcihtZW51VmlldylcblxuICAgIH0sXG4gICAge1xuICAgICAgbmFtZTogJ2V4cG9ydGVkIGNvZGUnLFxuICAgICAgY29tcG9uZW50OiBuZXcgRXhwb3J0KClcbiAgICB9XG4gIF07XG59XG5cblxuXG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vLi4vbGVvbmFyZG8uZC50c1wiIC8+XG5cbmltcG9ydCB7VUlWaWV3U3RhdGV9IGZyb20gJy4vdWktc3RhdGUubW9kZWwnO1xuaW1wb3J0IEV2ZW50cyBmcm9tICcuLi91aS1ldmVudHMnO1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVUlTdGF0ZVZpZXdTZXJ2aWNlIHtcblxuICBwcml2YXRlIHN0YXRpYyBfaW5zdGFuY2U6IFVJU3RhdGVWaWV3U2VydmljZSA9IG5ldyBVSVN0YXRlVmlld1NlcnZpY2UoKTtcbiAgcHJpdmF0ZSBjdXJWaWV3U3RhdGU6IFVJVmlld1N0YXRlO1xuICBwcml2YXRlIHZpZXdTdGF0ZUxpc3Q6IEFycmF5PFVJVmlld1N0YXRlPjtcblxuICBzdGF0aWMgZ2V0SW5zdGFuY2UoKTogVUlTdGF0ZVZpZXdTZXJ2aWNlIHtcbiAgICByZXR1cm4gVUlTdGF0ZVZpZXdTZXJ2aWNlLl9pbnN0YW5jZTtcbiAgfVxuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIGlmIChVSVN0YXRlVmlld1NlcnZpY2UuX2luc3RhbmNlKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1VJU3RhdGVWaWV3U2VydmljZSBzaG91bGQgYmUgc2luZ2xldG9uJyk7XG4gICAgfVxuICAgIFVJU3RhdGVWaWV3U2VydmljZS5faW5zdGFuY2UgPSB0aGlzO1xuICB9XG5cblxuXG4gIGluaXQodmlld1N0YXRlTGlzdDogQXJyYXk8VUlWaWV3U3RhdGU+LCBpbml0Vmlld05hbWU6IHN0cmluZykge1xuICAgIHRoaXMudmlld1N0YXRlTGlzdCA9IHZpZXdTdGF0ZUxpc3Q7XG4gICAgdGhpcy5jdXJWaWV3U3RhdGUgPSB0aGlzLmdldFZpZXdTdGF0ZUJ5TmFtZShpbml0Vmlld05hbWUpO1xuICB9XG5cbiAgZ2V0Q3VyVmlld1N0YXRlKCl7XG4gICAgcmV0dXJuIHRoaXMuY3VyVmlld1N0YXRlO1xuICB9XG5cbiAgc2V0Q3VyVmlld1N0YXRlKHN0YXRlTmFtZTogc3RyaW5nKXtcbiAgICB0aGlzLmN1clZpZXdTdGF0ZSA9IHRoaXMuZ2V0Vmlld1N0YXRlQnlOYW1lKHN0YXRlTmFtZSk7XG4gICAgRXZlbnRzLmRpc3BhdGNoKEV2ZW50cy5DSEFOR0VfVklFVywgdGhpcy5jdXJWaWV3U3RhdGUpO1xuICB9XG5cbiAgZ2V0Vmlld1N0YXRlcygpe1xuICAgIHJldHVybiB0aGlzLnZpZXdTdGF0ZUxpc3Q7XG4gIH1cblxuICBhZGRWaWV3U3RhdGUodmlld1N0YXRlOiBVSVZpZXdTdGF0ZSl7XG4gICAgdGhpcy52aWV3U3RhdGVMaXN0LnB1c2godmlld1N0YXRlKTtcbiAgfVxuXG4gIHJlbW92ZVZpZXdTdGF0ZSh2aWV3U3RhdGVOYW1lOiBzdHJpbmcpe1xuICAgIHRoaXMudmlld1N0YXRlTGlzdCA9IHRoaXMudmlld1N0YXRlTGlzdC5maWx0ZXIoKHZpZXc6IFVJVmlld1N0YXRlKSA9PiB7XG4gICAgICByZXR1cm4gdmlldy5uYW1lID09PSB2aWV3U3RhdGVOYW1lO1xuICAgIH0pXG4gIH1cblxuICBwcml2YXRlIGdldFZpZXdTdGF0ZUJ5TmFtZSh2aWV3U3RhdGVOYW1lOiBzdHJpbmcpOiBVSVZpZXdTdGF0ZXtcbiAgICBsZXQgcmV0VmlldzogVUlWaWV3U3RhdGU7XG4gICAgdGhpcy52aWV3U3RhdGVMaXN0LnNvbWUoKHZpZXc6IFVJVmlld1N0YXRlKSA9PiB7XG4gICAgICBpZih2aWV3U3RhdGVOYW1lID09PSB2aWV3Lm5hbWUpe1xuICAgICAgICByZXR1cm4gISEocmV0VmlldyA9IHZpZXcpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiByZXRWaWV3IHx8IHRoaXMuY3VyVmlld1N0YXRlO1xuICB9XG5cbn0iLCJleHBvcnQgZGVmYXVsdCBjbGFzcyBVaVV0aWxzIHtcbiAgY29uc3RydWN0b3IoKSB7XG4gIH1cblxuICBzdGF0aWMgZ2V0RWxlbWVudEZyb21IdG1sKGh0bWw6IHN0cmluZyk6IEhUTUxFbGVtZW50IHtcbiAgICBjb25zdCBkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBkaXYuaW5uZXJIVE1MID0gaHRtbDtcbiAgICByZXR1cm4gPEhUTUxFbGVtZW50PmRpdi5maXJzdENoaWxkO1xuICB9XG5cbiAgc3RhdGljIGd1aWRHZW5lcmF0b3IoKSB7XG4gICAgdmFyIFM0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuICgoKDEgKyBNYXRoLnJhbmRvbSgpKSAqIDB4MTAwMDApIHwgMCkudG9TdHJpbmcoMTYpLnN1YnN0cmluZygxKTtcbiAgICB9O1xuICAgIHJldHVybiAoUzQoKSArIFM0KCkgKyAnLScgKyBTNCgpICsgJy0nICsgUzQoKSArICctJyArIFM0KCkgKyAnLScgKyBTNCgpICsgUzQoKSArIFM0KCkpO1xuICB9XG59XG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vLi4vbGVvbmFyZG8uZC50c1wiIC8+XG5pbXBvcnQgVXRpbHMgZnJvbSAnLi4vdWktdXRpbHMnO1xuaW1wb3J0IEV2ZW50cyBmcm9tICcuLi91aS1ldmVudHMnO1xuaW1wb3J0IHtVSVZpZXdTdGF0ZX0gZnJvbSAnLi4vdWktc3RhdGUvdWktc3RhdGUubW9kZWwnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBWaWV3c0NvbnRhaW5lciB7XG5cbiAgY3VycmVudFZpZXdTdGF0ZTogVUlWaWV3U3RhdGU7XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgRXZlbnRzLm9uKEV2ZW50cy5DSEFOR0VfVklFVywgdGhpcy5vblZpZXdDaGFuZ2VkLmJpbmQodGhpcykpO1xuICB9XG5cbiAgZ2V0KCkge1xuICAgIHJldHVybiBVdGlscy5nZXRFbGVtZW50RnJvbUh0bWwoYFxuICAgICAgPGRpdiBpZD1cImxlb25hcmRvLXZpZXdzLWNvbnRhaW5lclwiIGNsYXNzPVwibGVvbmFyZG8tdmlld3MtY29udGFpbmVyXCI+dmlldyBjb250YWluZXI8L2Rpdj5cbiAgICBgKTtcbiAgfVxuXG4gIGdldFZpZXdOb2RlKCkge1xuICAgIHJldHVybiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbGVvbmFyZG8tdmlld3MtY29udGFpbmVyJyk7XG4gIH1cblxuICByZW5kZXIodmlld1N0YXRlOiBVSVZpZXdTdGF0ZSkge1xuICAgIHRoaXMuY3VycmVudFZpZXdTdGF0ZSA9IHZpZXdTdGF0ZTtcbiAgICB0aGlzLmdldFZpZXdOb2RlKCkuaW5uZXJIVE1MID0gJyc7XG4gICAgdGhpcy5nZXRWaWV3Tm9kZSgpLmFwcGVuZENoaWxkKHZpZXdTdGF0ZS5jb21wb25lbnQuZ2V0KCkpO1xuICAgIHZpZXdTdGF0ZS5jb21wb25lbnQucmVuZGVyKCk7XG4gIH1cblxuICBvblZpZXdDaGFuZ2VkKGV2ZW50OiBDdXN0b21FdmVudCkge1xuICAgIHRoaXMuY3VycmVudFZpZXdTdGF0ZS5jb21wb25lbnQuZGVzdHJveSgpO1xuICAgIHRoaXMucmVuZGVyKGV2ZW50LmRldGFpbCk7XG4gIH1cbn1cbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi8uLi8uLi9sZW9uYXJkby5kLnRzXCIgLz5cbmltcG9ydCBVdGlscyBmcm9tICcuLi8uLi91aS11dGlscyc7XG5pbXBvcnQgRXZlbnRzIGZyb20gJy4uLy4uL3VpLWV2ZW50cyc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEV4cG9ydCB7XG5cbiAgdmlld05vZGU6IEhUTUxFbGVtZW50O1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICB9XG5cbiAgZ2V0KCkge1xuICAgIHJldHVybiB0aGlzLnZpZXdOb2RlID0gVXRpbHMuZ2V0RWxlbWVudEZyb21IdG1sKGA8ZGl2IGlkPVwibGVvbmFyZG8tZXhwb3J0XCIgY2xhc3M9XCJsZW9uYXJkby1leHBvcnRcIj5cbiAgICAgIDxidXR0b24gY2xhc3M9XCJsZW9uYXJkby1idXR0b24gZXhwb3J0QnV0dG9uc1wiIGRhdGEtY2xpcGJvYXJkLXRhcmdldD1cIiNleHBvcnRlZENvZGVcIj4gQ29weSBUbyBDbGlwYm9hcmQ8L2J1dHRvbj5cbiAgICAgIDxidXR0b24gY2xhc3M9XCJsZW9uYXJkby1idXR0b24gZXhwb3J0QnV0dG9uc1wiID4gRG93bmxvYWQgQ29kZTwvYnV0dG9uPlxuICAgICAgPGNvZGUgY29udGVudGVkaXRhYmxlPlxuICAgICAgICA8ZGl2IGlkPVwiZXhwb3J0ZWRDb2RlXCI+XG4gICAgICAgICAgXG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9jb2RlPlxuICAgIDwvZGl2PmApO1xuICB9XG5cbiAgcmVuZGVyKCkge1xuXG4gIH1cblxuICBkZXN0cm95KCkge1xuXG4gIH1cblxufVxuIiwiaW1wb3J0IFV0aWxzIGZyb20gJy4uLy4uLy4uL3VpLXV0aWxzJztcbmltcG9ydCBFdmVudHMgZnJvbSAnLi4vLi4vLi4vdWktZXZlbnRzJztcbmltcG9ydCBSZWNvcmRlclN0YXRlRGV0YWlsIGZyb20gXCIuLi9zdGF0ZS1kZXRhaWwvc3RhdGVzLWRldGFpbFwiO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBSZWNvcmRlckxpc3Qge1xuXG4gIHZpZXdOb2RlOiBIVE1MRWxlbWVudDtcbiAgc3RhdGVEZXRhaWw6IFJlY29yZGVyU3RhdGVEZXRhaWwgPSBuZXcgUmVjb3JkZXJTdGF0ZURldGFpbCgpO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgbWVudVZpZXc6IE5vZGUpIHtcbiAgICBFdmVudHMub24oRXZlbnRzLlRPR0dMRV9MQVVOQ0hFUiwgdGhpcy5yZW5kZXIuYmluZCh0aGlzKSlcbiAgfVxuXG4gIGdldCgpIHtcbiAgICByZXR1cm4gdGhpcy52aWV3Tm9kZSA9IFV0aWxzLmdldEVsZW1lbnRGcm9tSHRtbChgPGRpdiBpZD1cImxlb25hcmRvLXJlY29yZGVyLWxpc3RcIiBjbGFzcz1cImxlb25hcmRvLXJlY29yZGVyLWxpc3RcIj48L2Rpdj5gKTtcbiAgfVxuXG4gIHJlbmRlcigpIHtcbiAgICBpZighdGhpcy52aWV3Tm9kZSl7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IGxpc3QgPSBVdGlscy5nZXRFbGVtZW50RnJvbUh0bWwoYDx1bCBjbGFzcz1cImxlb25hcmRvLXJlY29yZGVyLWxpc3QtY29udGFpbmVyXCI+PC91bD5gKTtcbiAgICB0aGlzLmdldFN0YXRlSXRlbXMoKS5mb3JFYWNoKChpdGVtKSA9PiB7bGlzdC5hcHBlbmRDaGlsZChpdGVtKX0pO1xuICAgIHRoaXMudmlld05vZGUuYXBwZW5kQ2hpbGQobGlzdCk7XG4gICAgdGhpcy5tZW51Vmlldy5hcHBlbmRDaGlsZCh0aGlzLnN0YXRlRGV0YWlsLmdldCgpKTtcbiAgfVxuXG4gIHByaXZhdGUgZ2V0U3RhdGVJdGVtcygpOiBBcnJheTxhbnk+IHtcbiAgICByZXR1cm4gTGVvbmFyZG8uZ2V0UmVjb3JkZWRTdGF0ZXMoKS5tYXAoKHN0YXRlKSA9PiB7XG4gICAgICBjb25zdCBpdGVtID0gVXRpbHMuZ2V0RWxlbWVudEZyb21IdG1sKGA8bGkgY2xhc3M9XCJsZW9uYXJkby1yZWNvcmRlci1saXN0LWl0ZW1cIj5gKTtcbiAgICAgIGl0ZW0uaW5uZXJIVE1MID1cbiAgICAgICAgICBgPHNwYW4gY2xhc3M9XCJsZW9uYXJkby1yZWNvcmRlci1saXN0LXZlcmIgbGVvbmFyZG8tcmVjb3JkZXItbGlzdC12ZXJiLSR7c3RhdGUudmVyYi50b0xvd2VyQ2FzZSgpfVwiPiR7c3RhdGUudmVyYn08L3NwYW4+XG4gICAgICAgICAgIDxzcGFuIGNsYXNzPVwibGVvbmFyZG8tcmVjb3JkZXItbGlzdC11cmxcIj4ke3N0YXRlLnVybC5zdWJzdHIoMCwxMTApfTwvc3Bhbj5gO1xuICAgICAgaXRlbS5pbm5lckhUTUwgKz0gc3RhdGUucmVjb3JkZWQgPyBgPHNwYW4gY2xhc3M9XCJsZW9uYXJkby1yZWNvcmRlci1saXN0LW5hbWVcIj4ke3N0YXRlLm5hbWV9PC9zcGFuPmAgOlxuICAgICAgICBgPHNwYW4gY2xhc3M9XCJsZW9uYXJkby1yZWNvcmRlci1saXN0LW5hbWUgbGVvbmFyZG8tcmVjb3JkZXItbGlzdC1uYW1lLW5ld1wiPk5ldzwvc3Bhbj5gXG4gICAgICBpdGVtLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy50b2dnbGVEZXRhaWxzLmJpbmQodGhpcywgc3RhdGUpKTtcbiAgICAgIHJldHVybiBpdGVtO1xuICAgIH0pXG4gIH1cblxuICB0b2dnbGVEZXRhaWxzKHN0YXRlKXtcbiAgICBzdGF0ZS5hY3RpdmVPcHRpb24gPSBzdGF0ZS5vcHRpb25zWzBdO1xuICAgIHRoaXMuc3RhdGVEZXRhaWwub3BlbihzdGF0ZSk7XG4gIH1cblxuXG59XG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vLi4vLi4vbGVvbmFyZG8uZC50c1wiIC8+XG5pbXBvcnQgVXRpbHMgZnJvbSAnLi4vLi4vdWktdXRpbHMnO1xuaW1wb3J0IEV2ZW50cyBmcm9tICcuLi8uLi91aS1ldmVudHMnO1xuaW1wb3J0IFJlY29yZGVyTGlzdCBmcm9tICcuL3JlY29yZGVyLWxpc3QvcmVjb3JkZXItbGlzdCc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFJlY29yZGVyIHtcblxuICB2aWV3Tm9kZTogSFRNTEVsZW1lbnQ7XG4gIHJlY29yZGVyTGlzdDogUmVjb3JkZXJMaXN0O1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgbWVudVZpZXc6IEhUTUxFbGVtZW50KSB7XG4gICAgdGhpcy5yZWNvcmRlckxpc3QgPSBuZXcgUmVjb3JkZXJMaXN0KG1lbnVWaWV3KTtcbiAgfVxuXG4gIGdldCgpIHtcbiAgICByZXR1cm4gdGhpcy52aWV3Tm9kZSA9IFV0aWxzLmdldEVsZW1lbnRGcm9tSHRtbChgPGRpdiBpZD1cImxlb25hcmRvLXJlY29yZGVyXCIgY2xhc3M9XCJsZW9uYXJkby1yZWNvcmRlclwiPC9kaXY+YCk7XG4gIH1cblxuICByZW5kZXIoKSB7XG4gICAgdGhpcy52aWV3Tm9kZS5hcHBlbmRDaGlsZCh0aGlzLnJlY29yZGVyTGlzdC5nZXQoKSk7XG4gICAgdGhpcy5yZWNvcmRlckxpc3QucmVuZGVyKCk7XG4gIH1cblxuICBkZXN0cm95KCkge1xuICAgIHRoaXMubWVudVZpZXcuaW5uZXJIVE1MID0gJyc7XG4gIH1cbn1cbiIsImltcG9ydCBVdGlscyBmcm9tICcuLi8uLi8uLi91aS11dGlscyc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFJlY29yZGVyU3RhdGVEZXRhaWwge1xuICB2aWV3Tm9kZTogYW55O1xuICBvcGVuU3RhdGU6IGJvb2xlYW4gPSBmYWxzZTtcbiAgY3VyU3RhdGU7XG4gIG9uQ2FuY2VsQmluZGVkOiBFdmVudExpc3RlbmVyID0gdGhpcy5vbkNhbmNlbC5iaW5kKHRoaXMpO1xuICBvblNhdmVCaW5kZWQ6IEV2ZW50TGlzdGVuZXIgPSB0aGlzLm9uU2F2ZS5iaW5kKHRoaXMpO1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMudmlld05vZGUgPSBVdGlscy5nZXRFbGVtZW50RnJvbUh0bWwoYDxkaXYgaWQ9XCJsZW9uYXJkby1zdGF0ZS1kZXRhaWxcIiBjbGFzcz1cImxlb25hcmRvLXN0YXRlLWRldGFpbC1yZWNvcmRlclwiPjwvZGl2PmApO1xuICB9XG5cbiAgZ2V0KCkge1xuICAgIHJldHVybiB0aGlzLnZpZXdOb2RlO1xuICB9XG5cbiAgcmVuZGVyKCkge1xuICAgIGlmICh0aGlzLnZpZXdOb2RlLmlubmVySFRNTCkge1xuICAgICAgdGhpcy52aWV3Tm9kZS5xdWVyeVNlbGVjdG9yKCcubGVvbmFyZG8tc3RhdGVzLWRldGFpbC1jYW5jZWwnKS5yZW1vdmVFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMub25DYW5jZWxCaW5kZWQsIGZhbHNlKTtcbiAgICAgIHRoaXMudmlld05vZGUucXVlcnlTZWxlY3RvcignLmxlb25hcmRvLXN0YXRlcy1kZXRhaWwtc2F2ZScpLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy5vblNhdmVCaW5kZWQsIGZhbHNlKTtcbiAgICB9XG5cbiAgICBsZXQgaHRtbDtcblxuICAgIC8vVE9ETyBjb25ncmF0dWxhdGUgb3Vyc2VsdmVzIG9uIGJlaW5nIGF3ZXNvbWUhIVxuICAgIGlmICh0aGlzLmN1clN0YXRlLnJlY29yZGVkKSB7XG4gICAgICBodG1sID0gYDxkaXYgY2xhc3M9XCJsZW9uYXJkby1zdGF0ZXMtZGV0YWlsLWhlYWRlclwiPkFkZCBtb2NrZWQgcmVzcG9uc2UgZm9yIDxzdHJvbmc+JHt0aGlzLmN1clN0YXRlLm5hbWV9PC9zdHJvbmc+PC9kaXY+YDtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICBodG1sID0gYDxoMSBjbGFzcz1cImxlb25hcmRvLXN0YXRlcy1kZXRhaWwtaGVhZGVyXCIvPkFkZCBuZXcgc3RhdGU8L2gxPlxuICAgICAgICAgICAgICA8ZGl2PlN0YXRlIG5hbWU6IDxpbnB1dCBjbGFzcz1cImxlb25hcmRvLXN0YXRlcy1kZXRhaWwtc3RhdGUtbmFtZVwiIHZhbHVlPVwiJHt0aGlzLmN1clN0YXRlLm5hbWV9XCIvPjwvZGl2PmA7XG4gICAgfVxuXG4gICAgaHRtbCArPSAgIGA8ZGl2PlVSTDogPGlucHV0IGNsYXNzPVwibGVvbmFyZG8tc3RhdGVzLWRldGFpbC1vcHRpb24tdXJsXCIgdmFsdWU9XCIke3RoaXMuY3VyU3RhdGUudXJsfVwiLz48L2Rpdj5cbiAgICAgICAgICAgICAgPGRpdj5PcHRpb24gbmFtZTogPGlucHV0IGNsYXNzPVwibGVvbmFyZG8tc3RhdGVzLWRldGFpbC1vcHRpb24tbmFtZVwiIHZhbHVlPVwiJHt0aGlzLmN1clN0YXRlLm9wdGlvbnNbMF0ubmFtZX1cIi8+PC9kaXY+XG4gICAgICAgICAgICAgIDxkaXY+U3RhdHVzIGNvZGU6IDxpbnB1dCBjbGFzcz1cImxlb25hcmRvLXN0YXRlcy1kZXRhaWwtc3RhdHVzXCIgdmFsdWU9XCIke3RoaXMuY3VyU3RhdGUub3B0aW9uc1swXS5zdGF0dXN9XCIvPjwvZGl2PlxuICAgICAgICAgICAgICA8ZGl2PkRlbGF5OiA8aW5wdXQgY2xhc3M9XCJsZW9uYXJkby1zdGF0ZXMtZGV0YWlsLWRlbGF5XCIgdmFsdWU9XCIwXCIvPjwvZGl2PlxuICAgICAgICAgICAgICA8ZGl2PlJlc3BvbnNlOiA8dGV4dGFyZWEgY2xhc3M9XCJsZW9uYXJkby1zdGF0ZXMtZGV0YWlsLWpzb25cIj4ke3RoaXMuZ2V0UmVzU3RyaW5nKHRoaXMuY3VyU3RhdGUub3B0aW9uc1swXS5kYXRhKX08L3RleHRhcmVhPjwvZGl2PlxuICAgICAgICAgICAgICA8YnV0dG9uIGNsYXNzPVwibGVvbmFyZG8tYnV0dG9uIGxlb25hcmRvLXN0YXRlcy1kZXRhaWwtc2F2ZVwiPlNhdmU8L2J1dHRvbj5cbiAgICAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz1cImxlb25hcmRvLWJ1dHRvbiBsZW9uYXJkby1zdGF0ZXMtZGV0YWlsLWNhbmNlbFwiID5DYW5jZWw8L2J1dHRvbj5gO1xuXG4gICAgdGhpcy52aWV3Tm9kZS5pbm5lckhUTUwgPSBodG1sO1xuICAgIHRoaXMudmlld05vZGUucXVlcnlTZWxlY3RvcignLmxlb25hcmRvLXN0YXRlcy1kZXRhaWwtY2FuY2VsJykuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLm9uQ2FuY2VsQmluZGVkLCBmYWxzZSk7XG4gICAgdGhpcy52aWV3Tm9kZS5xdWVyeVNlbGVjdG9yKCcubGVvbmFyZG8tc3RhdGVzLWRldGFpbC1zYXZlJykuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLm9uU2F2ZUJpbmRlZCwgZmFsc2UpO1xuICB9XG5cbiAgb3BlbihzdGF0ZSkge1xuICAgIHRoaXMuY3VyU3RhdGUgPSBzdGF0ZTtcbiAgICB0aGlzLnJlbmRlcigpO1xuICAgIHRoaXMub3BlblN0YXRlID0gdHJ1ZTtcbiAgICB0aGlzLnZpZXdOb2RlLnN0eWxlLmRpc3BsYXkgPSAnJztcbiAgfVxuXG4gIGNsb3NlKHN0YXRlPykge1xuICAgIGlmIChzdGF0ZSAmJiB0aGlzLmN1clN0YXRlICE9PSBzdGF0ZSkge1xuICAgICAgdGhpcy5vcGVuKHN0YXRlKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5vcGVuU3RhdGUgPSBmYWxzZTtcbiAgICB0aGlzLnZpZXdOb2RlLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gIH1cblxuICB0b2dnbGUoc3RhdGUpIHtcbiAgICBpZiAodGhpcy5vcGVuU3RhdGUpIHtcbiAgICAgIHRoaXMuY2xvc2Uoc3RhdGUpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLm9wZW4oc3RhdGUpO1xuICB9XG4gIFxuICBwcml2YXRlIGdldFJlc1N0cmluZyhyZXNvcG5zZTogc3RyaW5nKTogc3RyaW5nIHtcbiAgICBsZXQgcmVzU3RyOiBzdHJpbmc7XG4gICAgdHJ5IHtcbiAgICAgIHJlc1N0ciA9IEpTT04uc3RyaW5naWZ5KHJlc29wbnNlLCBudWxsLCA0KTtcbiAgICB9XG4gICAgY2F0Y2goZSl7XG4gICAgICAgcmVzU3RyID0gdHlwZW9mIHJlc29wbnNlID09PSAnc3RyaW5nJyA/IHJlc29wbnNlIDogcmVzb3Buc2UudG9TdHJpbmcoKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc1N0cjtcbiAgfVxuXG4gIHByaXZhdGUgb25DYW5jZWwoKSB7XG4gICAgdGhpcy5jbG9zZSgpO1xuICB9XG5cbiAgcHJpdmF0ZSBvblNhdmUoKSB7XG4gICAgY29uc3QgdXJsVmFsOiBzdHJpbmcgPSB0aGlzLnZpZXdOb2RlLnF1ZXJ5U2VsZWN0b3IoXCIubGVvbmFyZG8tc3RhdGVzLWRldGFpbC1vcHRpb24tdXJsXCIpLnZhbHVlO1xuICAgIGNvbnN0IHN0YXR1c1ZhbDogc3RyaW5nID0gdGhpcy52aWV3Tm9kZS5xdWVyeVNlbGVjdG9yKFwiLmxlb25hcmRvLXN0YXRlcy1kZXRhaWwtc3RhdHVzXCIpLnZhbHVlO1xuICAgIGNvbnN0IGRlbGF5VmFsOiBzdHJpbmcgPSB0aGlzLnZpZXdOb2RlLnF1ZXJ5U2VsZWN0b3IoXCIubGVvbmFyZG8tc3RhdGVzLWRldGFpbC1kZWxheVwiKS52YWx1ZTtcbiAgICBjb25zdCBqc29uVmFsOiBzdHJpbmcgPSB0aGlzLnZpZXdOb2RlLnF1ZXJ5U2VsZWN0b3IoXCIubGVvbmFyZG8tc3RhdGVzLWRldGFpbC1qc29uXCIpLnZhbHVlO1xuICAgIGNvbnN0IG9wdGlvbk5hbWVWYWw6IHN0cmluZyA9IHRoaXMudmlld05vZGUucXVlcnlTZWxlY3RvcihcIi5sZW9uYXJkby1zdGF0ZXMtZGV0YWlsLW9wdGlvbi1uYW1lXCIpLnZhbHVlO1xuICAgIHRoaXMuY3VyU3RhdGUudXJsID0gdXJsVmFsO1xuICAgIHRoaXMuY3VyU3RhdGUuYWN0aXZlT3B0aW9uLnN0YXR1cyA9IHN0YXR1c1ZhbDtcbiAgICB0aGlzLmN1clN0YXRlLmFjdGl2ZU9wdGlvbi5kZWxheSA9IGRlbGF5VmFsO1xuICAgIHRoaXMuY3VyU3RhdGUuYWN0aXZlT3B0aW9uLm5hbWUgPSBvcHRpb25OYW1lVmFsO1xuICAgIGlmKCF0aGlzLmN1clN0YXRlLnJlY29yZGVkKXtcbiAgICAgIHRoaXMuY3VyU3RhdGUubmFtZSA9IHRoaXMudmlld05vZGUucXVlcnlTZWxlY3RvcignLmxlb25hcmRvLXN0YXRlcy1kZXRhaWwtc3RhdGUtbmFtZScpLnZhbHVlO1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgdGhpcy5jdXJTdGF0ZS5hY3RpdmVPcHRpb24uZGF0YSA9IEpTT04ucGFyc2UoanNvblZhbCk7XG4gICAgfVxuICAgIGNhdGNoIChlKSB7XG4gICAgICB0aGlzLmN1clN0YXRlLmFjdGl2ZU9wdGlvbi5kYXRhID0ganNvblZhbDtcbiAgICB9XG5cbiAgICBMZW9uYXJkby5hZGRPclVwZGF0ZVNhdmVkU3RhdGUodGhpcy5jdXJTdGF0ZSk7XG4gICAgdGhpcy5jbG9zZSgpO1xuICB9XG59XG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vLi4vLi4vLi4vbGVvbmFyZG8uZC50c1wiIC8+XG5pbXBvcnQgVXRpbHMgZnJvbSAnLi4vLi4vLi4vdWktdXRpbHMnO1xuaW1wb3J0IEV2ZW50cyBmcm9tICcuLi8uLi8uLi91aS1ldmVudHMnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTY2VuYXJpb3NMaXN0IHtcblxuICB2aWV3Tm9kZTogSFRNTEVsZW1lbnQ7XG4gIHNldFNjZW5hcmlvQmluZGVkOiBFdmVudExpc3RlbmVyID0gdGhpcy5zZXRTY2VuYXJpby5iaW5kKHRoaXMpO1xuICBzdGF0aWMgU0VMRUNURURfQ0xBU1MgPSAnbGVvbmFyZG8tc2VsZWN0ZWQtc2NlbmFyaW8nO1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMudmlld05vZGUgPSBVdGlscy5nZXRFbGVtZW50RnJvbUh0bWwoYDxkaXYgaWQ9XCJsZW9uYXJkby1zY2VuYXJpb3MtbGlzdFwiIGNsYXNzPVwibGVvbmFyZG8tc2NlbmFyaW9zLWxpc3RcIj48L2Rpdj5gKTtcbiAgICB0aGlzLnZpZXdOb2RlLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy5zZXRTY2VuYXJpb0JpbmRlZCwgZmFsc2UpO1xuICAgIEV2ZW50cy5vbihFdmVudHMuQUREX1NDRU5BUklPLCB0aGlzLmFkZFNjZW5hcmlvLmJpbmQodGhpcykpO1xuICB9XG5cbiAgZ2V0KCkge1xuICAgIHJldHVybiB0aGlzLnZpZXdOb2RlO1xuICB9XG5cbiAgcmVuZGVyKCkge1xuICAgIHRoaXMudmlld05vZGUuaW5uZXJIVE1MID0gJyc7XG4gICAgdGhpcy52aWV3Tm9kZS5hcHBlbmRDaGlsZChVdGlscy5nZXRFbGVtZW50RnJvbUh0bWwoYDxkaXY+U2NlbmFyaW9zPC9kaXY+YCkpO1xuICAgIGNvbnN0IHVsID0gVXRpbHMuZ2V0RWxlbWVudEZyb21IdG1sKGA8dWw+PC91bD5gKTtcbiAgICBMZW9uYXJkby5nZXRTY2VuYXJpb3MoKVxuICAgICAgLm1hcCh0aGlzLmdldFNjZW5hcmlvRWxlbWVudC5iaW5kKHRoaXMpKVxuICAgICAgLmZvckVhY2goKHNjZW5hcmlvRWxtKSA9PiB7XG4gICAgICAgIHVsLmFwcGVuZENoaWxkKHNjZW5hcmlvRWxtKTtcbiAgICAgIH0pO1xuICAgIHRoaXMudmlld05vZGUuYXBwZW5kQ2hpbGQodWwpO1xuXG4gIH1cblxuICBnZXRTY2VuYXJpb0VsZW1lbnQoc2NlbmFyaW8pIHtcbiAgICBjb25zdCBlbCA9IFV0aWxzLmdldEVsZW1lbnRGcm9tSHRtbChgPGxpPiR7c2NlbmFyaW99PC9saT5gKTtcbiAgICBlbC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICAgIEV2ZW50cy5kaXNwYXRjaChFdmVudHMuU0NFTkFSSU9fQ0xJQ0tFRCwge25hbWU6IHNjZW5hcmlvfSk7XG4gICAgICBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbCh0aGlzLnZpZXdOb2RlLnF1ZXJ5U2VsZWN0b3JBbGwoJ2xpJyksIDApXG4gICAgICAgIC5mb3JFYWNoKGxpID0+IGxpLmNsYXNzTGlzdC5yZW1vdmUoU2NlbmFyaW9zTGlzdC5TRUxFQ1RFRF9DTEFTUykpO1xuICAgICAgZWwuY2xhc3NMaXN0LmFkZChTY2VuYXJpb3NMaXN0LlNFTEVDVEVEX0NMQVNTKTtcbiAgICB9KTtcbiAgICByZXR1cm4gZWw7XG4gIH1cblxuICBwcml2YXRlIHNldFNjZW5hcmlvKGV2ZW50OiBNb3VzZUV2ZW50KSB7XG4gICAgaWYgKGV2ZW50LnRhcmdldFsndGFnTmFtZSddICE9PSAnTEknKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3Qgc2NlbmFyaW9OYW1lOiBzdHJpbmcgPSBldmVudC50YXJnZXRbJ2lubmVySFRNTCddO1xuICAgIGNvbnN0IHN0YXRlczogQXJyYXk8YW55PiA9IExlb25hcmRvLmdldFNjZW5hcmlvKHNjZW5hcmlvTmFtZSk7XG4gICAgRXZlbnRzLmRpc3BhdGNoKEV2ZW50cy5UT0dHTEVfU1RBVEVTLCBmYWxzZSk7XG4gICAgc3RhdGVzLmZvckVhY2goKHN0YXRlKT0+IHtcbiAgICAgIEV2ZW50cy5kaXNwYXRjaChgJHtFdmVudHMuVE9HR0xFX1NUQVRFU306JHtzdGF0ZS5uYW1lfWAsIHN0YXRlLm9wdGlvbik7XG4gICAgfSk7XG4gIH1cblxuICBvbkRlc3Ryb3koKSB7XG4gICAgdGhpcy52aWV3Tm9kZS5yZW1vdmVFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMuc2V0U2NlbmFyaW9CaW5kZWQsIGZhbHNlKTtcbiAgfVxuXG4gIHByaXZhdGUgYWRkU2NlbmFyaW8oZXZlbnQ6IEN1c3RvbUV2ZW50KSB7XG4gICAgdGhpcy5yZW5kZXIoKTtcbiAgfVxufVxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uLy4uLy4uL2xlb25hcmRvLmQudHNcIiAvPlxuaW1wb3J0IFV0aWxzIGZyb20gJy4uLy4uL3VpLXV0aWxzJztcbmltcG9ydCBFdmVudHMgZnJvbSAnLi4vLi4vdWktZXZlbnRzJztcbmltcG9ydCBTdGF0ZXNMaXN0IGZyb20gJy4vc3RhdGVzLWxpc3Qvc3RhdGVzLWxpc3QnO1xuaW1wb3J0IFNjZW5hcmlvc0xpc3QgZnJvbSAnLi9zY2VuYXJpb3MtbGlzdC9zY2VuYXJpb3MtbGlzdCc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNjZW5hcmlvcyB7XG5cbiAgc3RhdGVMaXN0OiBTdGF0ZXNMaXN0O1xuICBzY2VuYXJpb3NMaXN0OiBTY2VuYXJpb3NMaXN0O1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLnN0YXRlTGlzdCA9IG5ldyBTdGF0ZXNMaXN0KCk7XG4gICAgdGhpcy5zY2VuYXJpb3NMaXN0ID0gbmV3IFNjZW5hcmlvc0xpc3QoKTtcbiAgfVxuXG4gIGdldCgpIHtcbiAgICBjb25zdCBlbCA9IFV0aWxzLmdldEVsZW1lbnRGcm9tSHRtbChgPGRpdiBpZD1cImxlb25hcmRvLXNjZW5hcmlvc1wiIGNsYXNzPVwibGVvbmFyZG8tc2NlbmFyaW9zXCI+PC9kaXY+YCk7XG4gICAgZWwuYXBwZW5kQ2hpbGQodGhpcy5zY2VuYXJpb3NMaXN0LmdldCgpKTtcbiAgICBlbC5hcHBlbmRDaGlsZCh0aGlzLnN0YXRlTGlzdC5nZXQoKSk7XG4gICAgcmV0dXJuIGVsO1xuICB9XG5cbiAgZ2V0Vmlld05vZGUoKSB7XG4gICAgcmV0dXJuIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdsZW9uYXJkby1zY2VuYXJpb3MnKTtcbiAgfVxuXG4gIHJlbmRlcigpIHtcbiAgICB0aGlzLnN0YXRlTGlzdC5yZW5kZXIoKTtcbiAgICB0aGlzLnNjZW5hcmlvc0xpc3QucmVuZGVyKCk7XG4gIH1cblxuICBkZXN0cm95KCkge1xuXG4gIH1cbn1cbiIsImltcG9ydCBVdGlscyBmcm9tICcuLi8uLi8uLi8uLi91aS11dGlscyc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFN0YXRlRGV0YWlsIHtcbiAgdmlld05vZGU6IGFueTtcbiAgb3BlblN0YXRlOiBib29sZWFuID0gZmFsc2U7XG4gIGN1clN0YXRlO1xuICBvbkNhbmNlbEJpbmRlZDogRXZlbnRMaXN0ZW5lciA9IHRoaXMub25DYW5jZWwuYmluZCh0aGlzKTtcbiAgb25TYXZlQmluZGVkOiBFdmVudExpc3RlbmVyID0gdGhpcy5vblNhdmUuYmluZCh0aGlzKTtcbiAgY29uc3RydWN0b3IocHJpdmF0ZSBvblNhdmVDQiwgcHJpdmF0ZSBvbkNhbmNlbENCKSB7XG4gICAgdGhpcy52aWV3Tm9kZSA9IFV0aWxzLmdldEVsZW1lbnRGcm9tSHRtbChgPGRpdiBpZD1cImxlb25hcmRvLXN0YXRlLWRldGFpbFwiIGNsYXNzPVwibGVvbmFyZG8tc3RhdGUtZGV0YWlsXCI+PC9kaXY+YCk7XG4gIH1cblxuICBnZXQoKSB7XG4gICAgcmV0dXJuIHRoaXMudmlld05vZGU7XG4gIH1cblxuICByZW5kZXIoKSB7XG4gICAgaWYodGhpcy52aWV3Tm9kZS5pbm5lckhUTUwpe1xuICAgICAgdGhpcy52aWV3Tm9kZS5xdWVyeVNlbGVjdG9yKCcubGVvbmFyZG8tc3RhdGVzLWRldGFpbC1jYW5jZWwnKS5yZW1vdmVFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMub25DYW5jZWxCaW5kZWQsIGZhbHNlKTtcbiAgICAgIHRoaXMudmlld05vZGUucXVlcnlTZWxlY3RvcignLmxlb25hcmRvLXN0YXRlcy1kZXRhaWwtc2F2ZScpLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy5vblNhdmVCaW5kZWQsIGZhbHNlKTtcbiAgICB9XG4gICAgdGhpcy52aWV3Tm9kZS5pbm5lckhUTUwgPSBgXG4gICAgICA8ZGl2IGNsYXNzPVwibGVvbmFyZG8tc3RhdGVzLWRldGFpbC1oZWFkZXJcIj4gXG4gICAgICAgIEVkaXQgb3B0aW9uIDxzdHJvbmc+JHt0aGlzLmN1clN0YXRlLmFjdGl2ZU9wdGlvbi5uYW1lfTwvc3Ryb25nPlxuICAgICAgICBmb3IgPHN0cm9uZz4ke3RoaXMuY3VyU3RhdGUubmFtZX08L3N0cm9uZz5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXY+U3RhdHVzIGNvZGU6IDxpbnB1dCBjbGFzcz1cImxlb25hcmRvLXN0YXRlcy1kZXRhaWwtc3RhdHVzXCIgdmFsdWU9XCIke3RoaXMuY3VyU3RhdGUuYWN0aXZlT3B0aW9uLnN0YXR1c31cIi8+PC9kaXY+XG4gICAgICAgIDxkaXY+RGVsYXk6IDxpbnB1dCBjbGFzcz1cImxlb25hcmRvLXN0YXRlcy1kZXRhaWwtZGVsYXlcIiB2YWx1ZT1cIiR7dGhpcy5jdXJTdGF0ZS5hY3RpdmVPcHRpb24uZGVsYXl9XCIvPjwvZGl2PlxuICAgICAgICA8ZGl2PlJlc3BvbnNlIEpTT046XG4gICAgICAgICAgPHRleHRhcmVhIGNsYXNzPVwibGVvbmFyZG8tc3RhdGVzLWRldGFpbC1qc29uXCI+JHt0aGlzLmdldFJlc1N0cmluZyh0aGlzLmN1clN0YXRlLmFjdGl2ZU9wdGlvbi5kYXRhKX08L3RleHRhcmVhPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGJ1dHRvbiBjbGFzcz1cImxlb25hcmRvLWJ1dHRvbiBsZW9uYXJkby1zdGF0ZXMtZGV0YWlsLXNhdmVcIj5TYXZlPC9idXR0b24+XG4gICAgICAgIDxidXR0b24gY2xhc3M9XCJsZW9uYXJkby1idXR0b24gbGVvbmFyZG8tc3RhdGVzLWRldGFpbC1jYW5jZWxcIiA+Q2FuY2VsPC9idXR0b24+YDtcbiAgICAgICAgdGhpcy52aWV3Tm9kZS5xdWVyeVNlbGVjdG9yKCcubGVvbmFyZG8tc3RhdGVzLWRldGFpbC1jYW5jZWwnKS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMub25DYW5jZWxCaW5kZWQsIGZhbHNlKTtcbiAgICAgICAgdGhpcy52aWV3Tm9kZS5xdWVyeVNlbGVjdG9yKCcubGVvbmFyZG8tc3RhdGVzLWRldGFpbC1zYXZlJykuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLm9uU2F2ZUJpbmRlZCwgZmFsc2UpO1xuICB9XG5cbiAgb3BlbihzdGF0ZSkge1xuICAgIHRoaXMuY3VyU3RhdGUgPSBzdGF0ZTtcbiAgICB0aGlzLnJlbmRlcigpO1xuICAgIHRoaXMub3BlblN0YXRlID0gdHJ1ZTtcbiAgICB0aGlzLnZpZXdOb2RlLnN0eWxlLnJpZ2h0ID0gJzBweCc7XG4gIH1cblxuICBjbG9zZShzdGF0ZT8pIHtcbiAgICBpZihzdGF0ZSAmJiB0aGlzLmN1clN0YXRlICE9PSBzdGF0ZSl7XG4gICAgICB0aGlzLm9wZW4oc3RhdGUpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLm9wZW5TdGF0ZSA9IGZhbHNlO1xuICAgIHRoaXMudmlld05vZGUuc3R5bGUucmlnaHQgPSAnLTQwMHB4JztcbiAgfVxuXG4gIHRvZ2dsZShzdGF0ZSkge1xuICAgIGlmKHRoaXMub3BlblN0YXRlKXtcbiAgICAgIHRoaXMuY2xvc2Uoc3RhdGUpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLm9wZW4oc3RhdGUpO1xuICB9XG5cbiAgcHJpdmF0ZSBnZXRSZXNTdHJpbmcocmVzb3Buc2U6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgbGV0IHJlc1N0cjogc3RyaW5nO1xuICAgIHRyeSB7XG4gICAgICByZXNTdHIgPSBKU09OLnN0cmluZ2lmeShyZXNvcG5zZSwgbnVsbCwgNCk7XG4gICAgfVxuICAgIGNhdGNoKGUpe1xuICAgICAgcmVzU3RyID0gdHlwZW9mIHJlc29wbnNlID09PSAnc3RyaW5nJyA/IHJlc29wbnNlIDogcmVzb3Buc2UudG9TdHJpbmcoKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc1N0cjtcbiAgfVxuXG4gIHByaXZhdGUgb25DYW5jZWwoKSB7XG4gICAgdGhpcy5jbG9zZSgpO1xuICAgIHRoaXMub25DYW5jZWxDQigpO1xuICB9XG5cbiAgcHJpdmF0ZSBvblNhdmUoKSB7XG4gICAgY29uc3Qgc3RhdHVzVmFsOnN0cmluZyA9IHRoaXMudmlld05vZGUucXVlcnlTZWxlY3RvcihcIi5sZW9uYXJkby1zdGF0ZXMtZGV0YWlsLXN0YXR1c1wiKS52YWx1ZTtcbiAgICBjb25zdCBkZWxheVZhbDpzdHJpbmcgPSB0aGlzLnZpZXdOb2RlLnF1ZXJ5U2VsZWN0b3IoXCIubGVvbmFyZG8tc3RhdGVzLWRldGFpbC1kZWxheVwiKS52YWx1ZTtcbiAgICBjb25zdCBqc29uVmFsOnN0cmluZyA9IHRoaXMudmlld05vZGUucXVlcnlTZWxlY3RvcihcIi5sZW9uYXJkby1zdGF0ZXMtZGV0YWlsLWpzb25cIikudmFsdWU7XG5cbiAgICB0aGlzLmN1clN0YXRlLmFjdGl2ZU9wdGlvbi5zdGF0dXMgPSBzdGF0dXNWYWw7XG4gICAgdGhpcy5jdXJTdGF0ZS5hY3RpdmVPcHRpb24uZGVsYXkgPSBkZWxheVZhbDtcbiAgICB0cnl7XG4gICAgICB0aGlzLmN1clN0YXRlLmFjdGl2ZU9wdGlvbi5kYXRhID0gSlNPTi5wYXJzZShqc29uVmFsKTtcbiAgICB9XG4gICAgY2F0Y2goZSkge1xuICAgICAgdGhpcy5jdXJTdGF0ZS5hY3RpdmVPcHRpb24uZGF0YSA9IGpzb25WYWw7XG4gICAgfVxuXG4gICAgTGVvbmFyZG8uYWRkT3JVcGRhdGVTYXZlZFN0YXRlKHRoaXMuY3VyU3RhdGUpO1xuICAgIHRoaXMuY2xvc2UoKTtcbiAgICB0aGlzLm9uU2F2ZUNCKCk7XG4gIH1cbn1cbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi8uLi8uLi8uLi8uLi9sZW9uYXJkby5kLnRzXCIgLz5cbmltcG9ydCBVdGlscyBmcm9tICcuLi8uLi8uLi8uLi91aS11dGlscyc7XG5pbXBvcnQgRXZlbnRzIGZyb20gJy4uLy4uLy4uLy4uL3VpLWV2ZW50cyc7XG5pbXBvcnQgRHJvcERvd24gZnJvbSAnLi4vLi4vLi4vLi4vZHJvcC1kb3duL2Ryb3AtZG93bic7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFN0YXRlSXRlbSB7XG5cbiAgdmlld05vZGU6IEhUTUxFbGVtZW50O1xuICByYW5kb21JRDogc3RyaW5nO1xuICBkcm9wRG93bjogRHJvcERvd247XG4gIHRvZ2dsZUJpbmRlZDogRXZlbnRMaXN0ZW5lciA9IHRoaXMudG9nZ2xlU3RhdGUuYmluZCh0aGlzKTtcbiAgcmVtb3ZlQmluZGVkOiBFdmVudExpc3RlbmVyID0gdGhpcy5yZW1vdmVTdGF0ZS5iaW5kKHRoaXMpO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgc3RhdGUsIHByaXZhdGUgb25SZW1vdmU6IEZ1bmN0aW9uKSB7XG4gICAgdGhpcy52aWV3Tm9kZSA9IFV0aWxzLmdldEVsZW1lbnRGcm9tSHRtbChgPGRpdiBjbGFzcz1cImxlb25hcmRvLXN0YXRlLWl0ZW1cIj48L2Rpdj5gKTtcbiAgICB0aGlzLnJhbmRvbUlEID0gVXRpbHMuZ3VpZEdlbmVyYXRvcigpO1xuICAgIHRoaXMuZHJvcERvd24gPSBuZXcgRHJvcERvd24odGhpcy5zdGF0ZS5vcHRpb25zLCB0aGlzLnN0YXRlLmFjdGl2ZU9wdGlvbiB8fCB0aGlzLnN0YXRlLm9wdGlvbnNbMF0sICF0aGlzLnN0YXRlLmFjdGl2ZSwgdGhpcy5jaGFuZ2VBY3RpdmVPcHRpb24uYmluZCh0aGlzKSwgdGhpcy5yZW1vdmVPcHRpb24uYmluZCh0aGlzKSk7XG4gICAgRXZlbnRzLm9uKEV2ZW50cy5UT0dHTEVfU1RBVEVTLCB0aGlzLnRvZ2dsZUFsbHN0YXRlLmJpbmQodGhpcykpO1xuICAgIEV2ZW50cy5vbihgJHtFdmVudHMuVE9HR0xFX1NUQVRFU306JHt0aGlzLnN0YXRlLm5hbWV9YCwgdGhpcy5zZXRTdGF0ZVN0YXRlLmJpbmQodGhpcykpO1xuICB9XG5cbiAgZ2V0KCkge1xuICAgIHJldHVybiB0aGlzLnZpZXdOb2RlO1xuICB9XG5cbiAgcmVuZGVyKCkge1xuICAgIGlmICh0aGlzLnZpZXdOb2RlLmlubmVySFRNTCkge1xuICAgICAgdGhpcy52aWV3Tm9kZS5xdWVyeVNlbGVjdG9yKGAubGVvbmFyZG8tdG9nZ2xlLWJ0bmApLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy50b2dnbGVCaW5kZWQsIGZhbHNlKTtcbiAgICAgIHRoaXMudmlld05vZGUucXVlcnlTZWxlY3RvcihgLmxlb25hcmRvLXN0YXRlLXJlbW92ZWApLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy5yZW1vdmVCaW5kZWQsIGZhbHNlKTtcbiAgICB9XG4gICAgdGhpcy52aWV3Tm9kZS5pbm5lckhUTUwgPSBgXG4gICAgICAgIDxpbnB1dCAke3RoaXMuaXNDaGVja2VkKCl9IGlkPVwibGVvbmFyZG8tc3RhdGUtdG9nZ2xlLSR7dGhpcy5yYW5kb21JRH1cIiBjbGFzcz1cImxlb25hcmRvLXRvZ2dsZSBsZW9uYXJkby10b2dnbGUtaW9zXCIgdHlwZT1cImNoZWNrYm94XCIvPlxuICAgICAgICA8bGFiZWwgY2xhc3M9XCJsZW9uYXJkby10b2dnbGUtYnRuXCIgZm9yPVwibGVvbmFyZG8tc3RhdGUtdG9nZ2xlLSR7dGhpcy5yYW5kb21JRCB9XCI+PC9sYWJlbD5cbiAgICAgICAgPHNwYW4gY2xhc3M9XCJsZW9uYXJkby1zdGF0ZS12ZXJiIGxlb25hcmRvLXN0YXRlLXZlcmItJHt0aGlzLnN0YXRlLnZlcmIudG9Mb3dlckNhc2UoKX1cIj4ke3RoaXMuc3RhdGUudmVyYn08L3NwYW4+XG4gICAgICAgIDxzcGFuIGNsYXNzPVwibGVvbmFyZG8tc3RhdGUtbmFtZVwiPiR7dGhpcy5zdGF0ZS5uYW1lfTwvc3Bhbj5cbiAgICAgICAgPHNwYW4gY2xhc3M9XCJsZW9uYXJkby1zdGF0ZS11cmxcIj4ke3RoaXMuc3RhdGUudXJsIHx8ICcnfTwvc3Bhbj5gO1xuICAgIHRoaXMudmlld05vZGUuYXBwZW5kQ2hpbGQodGhpcy5kcm9wRG93bi5nZXQoKSk7XG4gICAgdGhpcy5kcm9wRG93bi5yZW5kZXIoKTtcbiAgICB0aGlzLnZpZXdOb2RlLmFwcGVuZENoaWxkKFV0aWxzLmdldEVsZW1lbnRGcm9tSHRtbChgPGJ1dHRvbiB0aXRsZT1cIlJlbW92ZSBTdGF0ZVwiIGNsYXNzPVwibGVvbmFyZG8tc3RhdGUtcmVtb3ZlXCI+UmVtb3ZlPC9idXR0b24+YCkpO1xuICAgIHRoaXMudmlld05vZGUucXVlcnlTZWxlY3RvcihgLmxlb25hcmRvLXRvZ2dsZS1idG5gKS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMudG9nZ2xlQmluZGVkLCBmYWxzZSk7XG4gICAgdGhpcy52aWV3Tm9kZS5xdWVyeVNlbGVjdG9yKGAubGVvbmFyZG8tc3RhdGUtcmVtb3ZlYCkuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLnJlbW92ZUJpbmRlZCwgZmFsc2UpO1xuICB9XG5cbiAgZ2V0TmFtZSgpIHtcbiAgICByZXR1cm4gdGhpcy5zdGF0ZS5uYW1lO1xuICB9XG5cbiAgZ2V0U3RhdGUoKSB7XG4gICAgcmV0dXJuIHRoaXMuc3RhdGU7XG4gIH1cblxuICB0b2dnbGVWaXNpYmxlKHNob3c6IGJvb2xlYW4pIHtcbiAgICBpZiAoc2hvdykge1xuICAgICAgdGhpcy52aWV3Tm9kZS5jbGFzc0xpc3QucmVtb3ZlKCdsZW9uYXJkby1zdGF0ZS1pdGVtLWhpZGRlbicpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnZpZXdOb2RlLmNsYXNzTGlzdC5hZGQoJ2xlb25hcmRvLXN0YXRlLWl0ZW0taGlkZGVuJyk7XG4gICAgfVxuICB9XG5cbiAgc2V0U3RhdGUoc3RhdGU6IEJvb2xlYW4sIHNldFZpZXc6IGJvb2xlYW4gPSB0cnVlKSB7XG4gICAgdGhpcy5zdGF0ZS5hY3RpdmUgPSBzdGF0ZTtcbiAgICBpZiAoc3RhdGUpIHtcbiAgICAgIExlb25hcmRvLmFjdGl2YXRlU3RhdGVPcHRpb24odGhpcy5zdGF0ZS5uYW1lLCB0aGlzLnN0YXRlLmFjdGl2ZU9wdGlvbi5uYW1lKTtcbiAgICAgIHRoaXMuZHJvcERvd24uZW5hYmxlRHJvcERvd24oKTtcbiAgICAgIGlmIChzZXRWaWV3KSB7XG4gICAgICAgIHRoaXMudmlld05vZGUucXVlcnlTZWxlY3RvcignLmxlb25hcmRvLXRvZ2dsZScpWydjaGVja2VkJ10gPSB0cnVlO1xuICAgICAgfVxuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIExlb25hcmRvLmRlYWN0aXZhdGVTdGF0ZSh0aGlzLnN0YXRlLm5hbWUpO1xuICAgICAgdGhpcy5kcm9wRG93bi5kaXNhYmxlRHJvcERvd24oKTtcbiAgICAgIGlmIChzZXRWaWV3KSB7XG4gICAgICAgIHRoaXMudmlld05vZGUucXVlcnlTZWxlY3RvcignLmxlb25hcmRvLXRvZ2dsZScpWydjaGVja2VkJ10gPSBmYWxzZTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGlzQ2hlY2tlZCgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLnN0YXRlLmFjdGl2ZSA/ICdjaGVja2VkJyA6ICcnO1xuICB9XG5cbiAgcHJpdmF0ZSB0b2dnbGVTdGF0ZShldmVudDogRXZlbnQpIHtcbiAgICB0aGlzLnNldFN0YXRlKCF0aGlzLnN0YXRlLmFjdGl2ZSwgZmFsc2UpO1xuICB9XG5cbiAgcHJpdmF0ZSB0b2dnbGVBbGxzdGF0ZShldmVudDogQ3VzdG9tRXZlbnQpIHtcbiAgICB0aGlzLnNldFN0YXRlKGV2ZW50LmRldGFpbCk7XG4gIH1cblxuICBwcml2YXRlIHNldFN0YXRlU3RhdGUoZXZlbnQ6IEN1c3RvbUV2ZW50KSB7XG4gICAgdGhpcy5zZXRTdGF0ZSh0cnVlKTtcbiAgICB0aGlzLnN0YXRlLm9wdGlvbnMuc29tZSgob3B0aW9uKSA9PiB7XG4gICAgICBpZiAob3B0aW9uLm5hbWUgPT09IGV2ZW50LmRldGFpbCkge1xuICAgICAgICB0aGlzLmRyb3BEb3duLnNldEFjdGl2ZUl0ZW0oZXZlbnQuZGV0YWlsKTtcbiAgICAgICAgdGhpcy5jaGFuZ2VBY3RpdmVPcHRpb24ob3B0aW9uKTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgfSlcbiAgfVxuXG4gIHByaXZhdGUgY2hhbmdlQWN0aXZlT3B0aW9uKG9wdGlvbikge1xuICAgIHRoaXMuc3RhdGUuYWN0aXZlT3B0aW9uID0gb3B0aW9uO1xuICAgIExlb25hcmRvLmFjdGl2YXRlU3RhdGVPcHRpb24odGhpcy5zdGF0ZS5uYW1lLCB0aGlzLnN0YXRlLmFjdGl2ZU9wdGlvbi5uYW1lKVxuICB9XG5cbiAgcHJpdmF0ZSByZW1vdmVTdGF0ZShldmVudDogRXZlbnQpIHtcbiAgICBpZiAoZXZlbnQpIHtcbiAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgIH1cbiAgICB0aGlzLm9uRGVzdHJveSgpO1xuICAgIHRoaXMub25SZW1vdmUodGhpcy5zdGF0ZS5uYW1lLCB0aGlzLnZpZXdOb2RlKTtcbiAgICBMZW9uYXJkby5yZW1vdmVTdGF0ZSh0aGlzLnN0YXRlKTtcbiAgfVxuXG4gIHByaXZhdGUgcmVtb3ZlT3B0aW9uKGl0ZW0pIHtcbiAgICBMZW9uYXJkby5yZW1vdmVPcHRpb24odGhpcy5zdGF0ZSwgaXRlbSk7XG4gIH1cblxuICBvbkRlc3Ryb3koKSB7XG4gICAgdGhpcy52aWV3Tm9kZS5xdWVyeVNlbGVjdG9yKGAubGVvbmFyZG8tdG9nZ2xlLWJ0bmApLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy50b2dnbGVCaW5kZWQsIGZhbHNlKTtcbiAgICB0aGlzLnZpZXdOb2RlLnF1ZXJ5U2VsZWN0b3IoYC5sZW9uYXJkby1zdGF0ZS1yZW1vdmVgKS5yZW1vdmVFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMucmVtb3ZlQmluZGVkLCBmYWxzZSk7XG4gIH1cblxufVxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uLy4uLy4uLy4uLy4uLy4uL2xlb25hcmRvLmQudHNcIiAvPlxuaW1wb3J0IFV0aWxzIGZyb20gJy4uLy4uLy4uLy4uLy4uL3VpLXV0aWxzJztcbmltcG9ydCBFdmVudHMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vdWktZXZlbnRzJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgIHtcbiAgdmlld05vZGU6IGFueTtcbiAgb3BlblN0YXRlOiBib29sZWFuID0gZmFsc2U7XG4gIG9uQ2FuY2VsQmluZGVkOiBFdmVudExpc3RlbmVyID0gdGhpcy5vbkNhbmNlbC5iaW5kKHRoaXMpO1xuICBvblNhdmVCaW5kZWQ6IEV2ZW50TGlzdGVuZXIgPSB0aGlzLm9uU2F2ZS5iaW5kKHRoaXMpO1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMudmlld05vZGUgPSBVdGlscy5nZXRFbGVtZW50RnJvbUh0bWwoYDxkaXYgaWQ9XCJsZW9uYXJkby1hZGQtc2NlbmFyaW9cIiBjbGFzcz1cImxlb25hcmRvLWFkZC1zY2VuYXJpb1wiPjwvZGl2PmApO1xuICB9XG5cbiAgZ2V0KCkge1xuICAgIHJldHVybiB0aGlzLnZpZXdOb2RlO1xuICB9XG5cbiAgcmVuZGVyKCkge1xuICAgIGlmKHRoaXMudmlld05vZGUuaW5uZXJIVE1MKXtcbiAgICAgIHRoaXMudmlld05vZGUucXVlcnlTZWxlY3RvcignLmxlb25hcmRvLWFkZC1zY2VuYXJpby1jYW5jZWwnKS5yZW1vdmVFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMub25DYW5jZWxCaW5kZWQsIGZhbHNlKTtcbiAgICAgIHRoaXMudmlld05vZGUucXVlcnlTZWxlY3RvcignLmxlb25hcmRvLWFkZC1zY2VuYXJpby1zYXZlJykucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLm9uU2F2ZUJpbmRlZCwgZmFsc2UpO1xuICAgIH1cbiAgICB0aGlzLnZpZXdOb2RlLmlubmVySFRNTCA9IGBcbiAgICAgICAgPGRpdiBjbGFzcz1cImxlb25hcmRvLWFkZC1zY2VuYXJpby1ib3hcIj5cbiAgICAgICAgICA8c3Bhbj5TY2VuYXJpbyBOYW1lOiA8L3NwYW4+XG4gICAgICAgICAgPGlucHV0IGNsYXNzPVwibGVvbmFyZG8tYWRkLXNjZW5hcmlvLW5hbWVcIi8+XG4gICAgICAgICAgPGJ1dHRvbiBjbGFzcz1cImxlb25hcmRvLWJ1dHRvbiBsZW9uYXJkby1hZGQtc2NlbmFyaW8tc2F2ZVwiPlNhdmU8L2J1dHRvbj5cbiAgICAgICAgICA8YnV0dG9uIGNsYXNzPVwibGVvbmFyZG8tYnV0dG9uIGxlb25hcmRvLWFkZC1zY2VuYXJpby1jYW5jZWxcIj5DYW5jZWw8L2J1dHRvbj5cbiAgICAgICAgPC9kaXY+YDtcbiAgICB0aGlzLnZpZXdOb2RlLnF1ZXJ5U2VsZWN0b3IoJy5sZW9uYXJkby1hZGQtc2NlbmFyaW8tY2FuY2VsJykuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLm9uQ2FuY2VsQmluZGVkLCBmYWxzZSk7XG4gICAgdGhpcy52aWV3Tm9kZS5xdWVyeVNlbGVjdG9yKCcubGVvbmFyZG8tYWRkLXNjZW5hcmlvLXNhdmUnKS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMub25TYXZlQmluZGVkLCBmYWxzZSk7XG4gIH1cblxuICBvcGVuKCkge1xuICAgIHRoaXMucmVuZGVyKCk7XG4gICAgdGhpcy5vcGVuU3RhdGUgPSB0cnVlO1xuICAgIHRoaXMudmlld05vZGUuc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XG4gIH1cblxuICBjbG9zZSgpIHtcbiAgICB0aGlzLm9wZW5TdGF0ZSA9IGZhbHNlO1xuICAgIHRoaXMudmlld05vZGUuc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgfVxuXG4gIHRvZ2dsZSgpIHtcbiAgICBpZih0aGlzLm9wZW5TdGF0ZSl7XG4gICAgICB0aGlzLmNsb3NlKCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMub3BlbigpO1xuICB9XG5cbiAgcHJpdmF0ZSBvbkNhbmNlbCgpIHtcbiAgICB0aGlzLmNsb3NlKCk7XG5cbiAgfVxuXG4gIHByaXZhdGUgb25TYXZlKCkge1xuICAgIHRoaXMuY2xvc2UoKTtcbiAgICBFdmVudHMuZGlzcGF0Y2goRXZlbnRzLkFERF9TQ0VOQVJJTywgdGhpcy52aWV3Tm9kZS5xdWVyeVNlbGVjdG9yKCcubGVvbmFyZG8tYWRkLXNjZW5hcmlvLW5hbWUnKS52YWx1ZSk7XG4gIH1cbn1cbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi8uLi8uLi8uLi8uLi9sZW9uYXJkby5kLnRzXCIgLz5cbmltcG9ydCBVdGlscyBmcm9tICcuLi8uLi8uLi8uLi91aS11dGlscyc7XG5pbXBvcnQgRXZlbnRzIGZyb20gJy4uLy4uLy4uLy4uL3VpLWV2ZW50cyc7XG5pbXBvcnQgQWRkU2NlbmFyaW8gZnJvbSAnLi9zdGF0ZS1hZGQtc2NlbmFyaW8vc3RhdGUtYWRkLXNjZW5hcmlvJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU3RhdGVzQmFyIHtcbiAgdmlld05vZGU6IGFueTtcbiAgc2VhcmNoQmluZGVkOiBFdmVudExpc3RlbmVyID0gdGhpcy5zZWFyY2hTdGF0ZXMuYmluZCh0aGlzKTtcbiAgYWN0aXZhdGVBbGxCaW5kZWQ6IEV2ZW50TGlzdGVuZXIgPSB0aGlzLnRvZ2dsZUFjdGl2YXRlQWxsLmJpbmQodGhpcyk7XG4gIGFkZFNjZW5hcmlvQmluZGVkOiBFdmVudExpc3RlbmVyID0gdGhpcy5vbkFkZFNjZW5hcmlvLmJpbmQodGhpcyk7XG4gIGFjdGl2ZUFsbFN0YXRlOiBib29sZWFuID0gZmFsc2U7XG4gIGFkZFNjZW5hcmlvOiBBZGRTY2VuYXJpbyA9IG5ldyBBZGRTY2VuYXJpbygpO1xuICBjdXJTZWFyY2hEYXRhOiBzdHJpbmcgPSAnJztcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy52aWV3Tm9kZSA9IFV0aWxzLmdldEVsZW1lbnRGcm9tSHRtbChgPGRpdiBjbGFzcz1cImxlb25hcmRvLXN0YXRlcy1iYXJcIj48L2Rpdj5gKTtcbiAgfVxuXG4gIGdldCgpIHtcbiAgICByZXR1cm4gdGhpcy52aWV3Tm9kZTtcbiAgfVxuXG4gIHJlbmRlcigpIHtcbiAgICBpZih0aGlzLnZpZXdOb2RlLmlubmVySFRNTCl7XG4gICAgICB0aGlzLnZpZXdOb2RlLnF1ZXJ5U2VsZWN0b3IoJy5sZW9uYXJkby1zZWFyY2gtc3RhdGUnKS5yZW1vdmVFdmVudExpc3RlbmVyKCdrZXl1cCcsIHRoaXMuc2VhcmNoQmluZGVkLCBmYWxzZSk7XG4gICAgICB0aGlzLnZpZXdOb2RlLnF1ZXJ5U2VsZWN0b3IoJy5sZW9uYXJkby1hY3RpdmF0ZS1hbGwnKS5yZW1vdmVFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMuYWN0aXZhdGVBbGxCaW5kZWQsIGZhbHNlKTtcbiAgICAgIHRoaXMudmlld05vZGUucXVlcnlTZWxlY3RvcignLmxlb25hcmRvLWFkZC1zY2VuYXJpby1idG4nKS5yZW1vdmVFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMuYWRkU2NlbmFyaW9CaW5kZWQsIGZhbHNlKTtcbiAgICB9XG4gICAgdGhpcy52aWV3Tm9kZS5pbm5lckhUTUwgPSBgXG4gICAgICAgIDxpbnB1dCB2YWx1ZT1cIiR7dGhpcy5jdXJTZWFyY2hEYXRhfVwiIGNsYXNzPVwibGVvbmFyZG8tc2VhcmNoLXN0YXRlXCIgbmFtZT1cImxlb25hcmRvLXNlYXJjaC1zdGF0ZVwiIHR5cGU9XCJ0ZXh0XCIgcGxhY2Vob2xkZXI9XCJTZWFyY2guLi5cIiAvPlxuICAgICAgICA8ZGl2PlxuICAgICAgICAgIDxzcGFuIGNsYXNzPVwibGVvbmFyZG8tYnV0dG9uIGxlb25hcmRvLWFjdGl2YXRlLWFsbFwiPkFjdGl2YXRlIEFsbDwvc3Bhbj5cbiAgICAgICAgICA8c3BhbiBjbGFzcz1cImxlb25hcmRvLWJ1dHRvbiBsZW9uYXJkby1hZGQtc2NlbmFyaW8tYnRuXCI+QWRkIFNjZW5hcmlvPC9zcGFuPlxuICAgICAgICA8L2Rpdj5gO1xuICAgIHRoaXMudmlld05vZGUuYXBwZW5kQ2hpbGQodGhpcy5hZGRTY2VuYXJpby5nZXQoKSk7XG4gICAgdGhpcy5hZGRTY2VuYXJpby5yZW5kZXIoKTtcbiAgICB0aGlzLnZpZXdOb2RlLnF1ZXJ5U2VsZWN0b3IoJy5sZW9uYXJkby1zZWFyY2gtc3RhdGUnKS5hZGRFdmVudExpc3RlbmVyKCdrZXl1cCcsIHRoaXMuc2VhcmNoQmluZGVkLCBmYWxzZSk7XG4gICAgdGhpcy52aWV3Tm9kZS5xdWVyeVNlbGVjdG9yKCcubGVvbmFyZG8tYWN0aXZhdGUtYWxsJykuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLmFjdGl2YXRlQWxsQmluZGVkLCBmYWxzZSk7XG4gICAgdGhpcy52aWV3Tm9kZS5xdWVyeVNlbGVjdG9yKCcubGVvbmFyZG8tYWRkLXNjZW5hcmlvLWJ0bicpLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy5hZGRTY2VuYXJpb0JpbmRlZCwgZmFsc2UpO1xuICAgIHRoaXMuc2VhcmNoU3RhdGVzKHt0YXJnZXQ6IHt2YWx1ZTogdGhpcy5jdXJTZWFyY2hEYXRhfX0pO1xuICB9XG5cbiAgc2VhcmNoU3RhdGVzKGV2dCkge1xuICAgIHRoaXMuY3VyU2VhcmNoRGF0YSA9IGV2dC50YXJnZXQudmFsdWU7XG4gICAgRXZlbnRzLmRpc3BhdGNoKEV2ZW50cy5GSUxURVJfU1RBVEVTLCB7IHZhbDogdGhpcy5jdXJTZWFyY2hEYXRhfSk7XG4gIH1cblxuICB0b2dnbGVBY3RpdmF0ZUFsbCgpIHtcbiAgICB0aGlzLmFjdGl2ZUFsbFN0YXRlID0gIXRoaXMuYWN0aXZlQWxsU3RhdGU7XG4gICAgTGVvbmFyZG8udG9nZ2xlQWN0aXZhdGVBbGwodGhpcy5hY3RpdmVBbGxTdGF0ZSk7XG4gICAgRXZlbnRzLmRpc3BhdGNoKEV2ZW50cy5UT0dHTEVfU1RBVEVTLCB0aGlzLmFjdGl2ZUFsbFN0YXRlKTtcbiAgICB0aGlzLnZpZXdOb2RlLnF1ZXJ5U2VsZWN0b3IoJy5sZW9uYXJkby1hY3RpdmF0ZS1hbGwnKS5pbm5lckhUTUwgPSB0aGlzLmFjdGl2ZUFsbFN0YXRlID8gJ0RlYWN0aXZhdGUgYWxsJyA6ICdBY3RpdmF0ZSBhbGwnO1xuICB9XG5cbiAgb25BZGRTY2VuYXJpbygpe1xuICAgIHRoaXMuYWRkU2NlbmFyaW8ub3BlbigpO1xuICB9XG5cbiAgb25EZXN0cm95KCl7XG4gICAgdGhpcy52aWV3Tm9kZS5xdWVyeVNlbGVjdG9yKCcubGVvbmFyZG8tc2VhcmNoLXN0YXRlJykucmVtb3ZlRXZlbnRMaXN0ZW5lcigna2V5dXAnLCB0aGlzLnNlYXJjaEJpbmRlZCwgZmFsc2UpO1xuICB9XG5cbn1cbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi8uLi8uLi8uLi9sZW9uYXJkby5kLnRzXCIgLz5cbmltcG9ydCBVdGlscyBmcm9tICcuLi8uLi8uLi91aS11dGlscyc7XG5pbXBvcnQgRXZlbnRzIGZyb20gJy4uLy4uLy4uL3VpLWV2ZW50cyc7XG5pbXBvcnQgU3RhdGVJdGVtIGZyb20gJy4vc3RhdGUtaXRlbS9zdGF0ZS1pdGVtJztcbmltcG9ydCBTdGF0ZXNCYXIgZnJvbSAnLi9zdGF0ZXMtYmFyL3N0YXRlcy1iYXInO1xuaW1wb3J0IFN0YXRlRGV0YWlsIGZyb20gJy4vc3RhdGUtZGV0YWlsL3N0YXRlcy1kZXRhaWwnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTdGF0ZXNMaXN0IHtcbiAgdmlld05vZGU6IGFueTtcbiAgc3RhdGVzQmFyID0gbmV3IFN0YXRlc0JhcigpO1xuICBzdGF0ZURldGFpbCA9IG5ldyBTdGF0ZURldGFpbCh0aGlzLm9uU3RhdGVEZXRhaWxTYXZlLmJpbmQodGhpcyksIHRoaXMuY2xlYXJTZWxlY3RlZC5iaW5kKHRoaXMpKTtcbiAgc3RhdGVzRWxlbWVudHM6IFN0YXRlSXRlbVtdID0gW107XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy52aWV3Tm9kZSA9IFV0aWxzLmdldEVsZW1lbnRGcm9tSHRtbChgPGRpdiBpZD1cImxlb25hcmRvLXN0YXRlcy1saXN0XCIgY2xhc3M9XCJsZW9uYXJkby1zdGF0ZXMtbGlzdFwiPjwvZGl2PmApO1xuICAgIEV2ZW50cy5vbihFdmVudHMuRklMVEVSX1NUQVRFUywgdGhpcy5vbkZpbHRlclN0YXRlcy5iaW5kKHRoaXMpKTtcbiAgICBFdmVudHMub24oRXZlbnRzLkFERF9TQ0VOQVJJTywgdGhpcy5hZGRTY2VuYXJpby5iaW5kKHRoaXMpKTsgICAgXG4gIH1cblxuICBnZXQoKSB7XG4gICAgcmV0dXJuIHRoaXMudmlld05vZGU7XG4gIH1cblxuICByZW5kZXIoKSB7XG4gICAgdGhpcy52aWV3Tm9kZS5pbm5lckhUTUwgPSAnJztcbiAgICB0aGlzLnZpZXdOb2RlLmFwcGVuZENoaWxkKHRoaXMuc3RhdGVzQmFyLmdldCgpKTtcbiAgICB0aGlzLnZpZXdOb2RlLmFwcGVuZENoaWxkKHRoaXMuc3RhdGVEZXRhaWwuZ2V0KCkpO1xuICAgIHRoaXMuc3RhdGVzRWxlbWVudHMubGVuZ3RoID0gMDtcbiAgICBMZW9uYXJkby5nZXRTdGF0ZXMoKVxuICAgICAgLm1hcCgoc3RhdGUpID0+IG5ldyBTdGF0ZUl0ZW0oc3RhdGUsIHRoaXMucmVtb3ZlU3RhdGVCeU5hbWUuYmluZCh0aGlzKSkpXG4gICAgICAuZm9yRWFjaCgoc3RhdGVFbG0pID0+IHtcbiAgICAgICAgdGhpcy5zdGF0ZXNFbGVtZW50cy5wdXNoKHN0YXRlRWxtKTtcbiAgICAgICAgdGhpcy52aWV3Tm9kZS5hcHBlbmRDaGlsZChzdGF0ZUVsbS5nZXQoKSk7XG4gICAgICAgIHN0YXRlRWxtLnZpZXdOb2RlLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy50b2dnbGVEZXRhaWwuYmluZCh0aGlzLCBzdGF0ZUVsbSkpO1xuICAgICAgICBzdGF0ZUVsbS5yZW5kZXIoKTtcbiAgICAgIH0pO1xuICAgIHRoaXMuc3RhdGVzQmFyLnJlbmRlcigpO1xuICB9XG5cbiAgb25GaWx0ZXJTdGF0ZXMoZGF0YTogQ3VzdG9tRXZlbnQpIHtcbiAgICB0aGlzLnN0YXRlc0VsZW1lbnRzLmZvckVhY2goKHN0YXRlRWxtOiBTdGF0ZUl0ZW0pID0+IHtcbiAgICAgIGlmIChzdGF0ZUVsbS5nZXROYW1lKCkudG9Mb3dlckNhc2UoKS5pbmRleE9mKGRhdGEuZGV0YWlsLnZhbC50b0xvd2VyQ2FzZSgpKSA+PSAwKSB7XG4gICAgICAgIHN0YXRlRWxtLnRvZ2dsZVZpc2libGUodHJ1ZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzdGF0ZUVsbS50b2dnbGVWaXNpYmxlKGZhbHNlKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIHJlbW92ZVN0YXRlQnlOYW1lKHN0YXRlTmFtZTogc3RyaW5nLCBzdGF0ZVZpZXc6IEhUTUxFbGVtZW50KSB7XG4gICAgdGhpcy5zdGF0ZXNFbGVtZW50cyA9IHRoaXMuc3RhdGVzRWxlbWVudHMuZmlsdGVyKChzdGF0ZSkgPT4ge1xuICAgICAgcmV0dXJuIHN0YXRlLmdldE5hbWUoKSA9PT0gc3RhdGVOYW1lO1xuICAgIH0pO1xuICAgIHRoaXMudmlld05vZGUucmVtb3ZlQ2hpbGQoc3RhdGVWaWV3KTtcbiAgfVxuXG4gIHByaXZhdGUgdG9nZ2xlRGV0YWlsKHN0YXRlRWxtOiBTdGF0ZUl0ZW0sIGV2ZW50OiBFdmVudCkge1xuICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgIGNvbnN0IG9wZW46IGJvb2xlYW4gPSBzdGF0ZUVsbS52aWV3Tm9kZS5jbGFzc0xpc3QuY29udGFpbnMoJ2xlb25hcmRvLXN0YXRlLWl0ZW0tZGV0YWlsZWQnKTtcbiAgICB0aGlzLmNsZWFyU2VsZWN0ZWQoKTtcbiAgICBpZighb3Blbil7XG4gICAgICBzdGF0ZUVsbS52aWV3Tm9kZS5jbGFzc0xpc3QuYWRkKCdsZW9uYXJkby1zdGF0ZS1pdGVtLWRldGFpbGVkJyk7XG4gICAgfVxuXG4gICAgdGhpcy5zdGF0ZURldGFpbC50b2dnbGUoc3RhdGVFbG0uZ2V0U3RhdGUoKSk7XG4gIH1cblxuICBwcml2YXRlIGNsZWFyU2VsZWN0ZWQoKXtcbiAgICB0aGlzLnN0YXRlc0VsZW1lbnRzLmZvckVhY2goKGN1clN0YXRlKSA9PiB7XG4gICAgICBjdXJTdGF0ZS52aWV3Tm9kZS5jbGFzc0xpc3QucmVtb3ZlKCdsZW9uYXJkby1zdGF0ZS1pdGVtLWRldGFpbGVkJyk7XG4gICAgfSk7XG4gIH1cblxuICBwcml2YXRlIG9uU3RhdGVEZXRhaWxTYXZlKCl7XG4gICAgdGhpcy5jbGVhclNlbGVjdGVkKCk7XG4gIH1cblxuICBwcml2YXRlIGFkZFNjZW5hcmlvKGV2ZW50OiBDdXN0b21FdmVudCkge1xuICAgIGNvbnN0IHN0YXRlczogQXJyYXk8YW55PiA9IHRoaXMuc3RhdGVzRWxlbWVudHMubWFwKChzdGF0ZUVsZW06IFN0YXRlSXRlbSkgPT4ge1xuICAgICAgcmV0dXJuIHN0YXRlRWxlbS5nZXRTdGF0ZSgpO1xuICAgIH0pLmZpbHRlcigoc3RhdGUpID0+IHN0YXRlLmFjdGl2ZSlcbiAgICAgIC5tYXAoKHN0YXRlOiBhbnkpID0+IHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBuYW1lOiBzdGF0ZS5uYW1lLFxuICAgICAgICAgIG9wdGlvbjogc3RhdGUuYWN0aXZlT3B0aW9uLm5hbWVcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgTGVvbmFyZG8uYWRkU2NlbmFyaW8oe1xuICAgICAgbmFtZTogZXZlbnQuZGV0YWlsLFxuICAgICAgc3RhdGVzOiBzdGF0ZXMsXG4gICAgICBmcm9tX2xvY2FsOiB0cnVlXG4gICAgfSwgdHJ1ZSk7XG4gIH1cblxufVxuIiwiZXhwb3J0IGRlZmF1bHQgY2xhc3MgVXRpbHMge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgfVxuXG4gIHN0YXRpYyBpc1VuZGVmaW5lZCh2YWx1ZSkge1xuICAgIHJldHVybiB0eXBlb2YgdmFsdWUgPT09ICd1bmRlZmluZWQnO1xuICB9XG5cbiAgc3RhdGljIGlzTnVtYmVyKHZhbHVlKSB7XG4gICAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcic7XG4gIH1cblxuICBzdGF0aWMgaXNGdW5jdGlvbih2YWx1ZSkge1xuICAgIHJldHVybiB0eXBlb2YgdmFsdWUgPT09ICdmdW5jdGlvbic7XG4gIH1cblxuICBzdGF0aWMgaXNTdHJpbmcodmFsdWUpIHtcbiAgICByZXR1cm4gdHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJztcbiAgfVxuXG4gIHN0YXRpYyBmcm9tSnNvbihqc29uKSB7XG4gICAgcmV0dXJuIHRoaXMuaXNTdHJpbmcoanNvbilcbiAgICAgID8gSlNPTi5wYXJzZShqc29uKVxuICAgICAgOiBqc29uO1xuICB9XG5cbiAgc3RhdGljIHRvSnNvbihvYmosIHByZXR0eT8pIHtcbiAgICBpZiAodGhpcy5pc1VuZGVmaW5lZChvYmopKSByZXR1cm4gdW5kZWZpbmVkO1xuICAgIGlmICghdGhpcy5pc051bWJlcihwcmV0dHkpKSB7XG4gICAgICBwcmV0dHkgPSBwcmV0dHkgPyAyIDogbnVsbDtcbiAgICB9XG4gICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KG9iaiwgbnVsbCwgcHJldHR5KTtcbiAgfVxufVxuIl19

;

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
}(document, ".leonardo-launcher {\n" +
"  position: fixed;\n" +
"  right: 40px;\n" +
"  bottom: 40px;\n" +
"  width: 70px;\n" +
"  cursor: pointer;\n" +
"  height: 70px;\n" +
"  z-index: 99999999999999999999999999;\n" +
"  background-size: contain;\n" +
"  background-repeat: no-repeat;\n" +
"  background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAAACXBIWXMAAABIAAAASABGyWs+AAAACXZwQWcAAACAAAAAgAAw4TGaAAAABmJLR0QA/wD/AP+gvaeTAAA5EklEQVR42u29eXxkV3nn/T3n3K2qtEvdknpVL+52e21sbNOhjcFgwjKQDBlCCBgYyAIkwxpDMnnnzcuE5AVDMplkXvIOk0lCSIYhITMJQ9gmYbNJg7devLTd7kW9a2lJpaWq7nKW+ePeKpXUbWPjts2i0x99Sq0q1VXd53d+z/4c4ZxjZf34LrlyC1YAsLJ+jJd3Md5ky2XvpZHERFHE/Gmfq377G8QTFYSUSCGQUi5+ieJnnoewIH2JcAJwVCodDPUOceT0EQIvwDjLQE8/RmeEUYnIL9FI6hhrqZTLGGOQUjI1PYXyFFIqrLUICfML86RpSkdHBw6o12okacJCbYEsy3BC4ClJpjOEEzjncMLhjMM5i3UOa8E5jbMO6xzO2tYjQGlwgft/+2XQkYLwge9TndYSdr94Bwu15NkBwJot7/y+38A5RzmKVrbSDzMDnDnyiafMACvrhxgAKwywwgArDLDCACsMsMIAKwywwgArDLDCACsMsMIAKwywwgArDLDCACsM8Myt+fn5Zy8UvMIAz/KyC/zaB/8NZycXVhjgx3J19nPrv3wfcBcQrTDAj+XqGYDqNiBcYYAfy1UtM/Lvv0I61bvCAD+uK50okU2VVxhgZa0wwMpaYYAfvxX0N0gm7QoD/Hi6gtOMfuh3uPQ3/oBksmeFAX481xRdwzGz1dIzBwAhxFN+k8073nNR/ygp5E8Zay6zzl2qte6y1l5ljbVGGeecXe+ci5y1OOew7Y+IomLXYazBOYsx5pADaYxB60waow8YYxakUp8FvvCDxQKz3PWuDzD8zt95xtxBD2B48zueEgM8peXosdb+inXmFq311bVGrWfL+i1EYUToh2hrEM5iHdiiHNw5h3EOZw3WWYaGBjHG5aXdRUl3d2d3XtqN3eaMo7cnv6FCis21Wp3JyfE3Tk5NxAhxtxLqXcC+HwwUzOH3xGST4pkDwNmjf/zMM4BzPda5PzCZed2aVWui9cMb8D0PbTTWWZy1JFmCxSKcxAmLw2G1Bemw1uAsRZ0+WAxOO5y0WOtwgNUmr/Uvfs9Jh8ssnidZM7yO9es3RmfHztx45szJvVJ6dwBvAkafbVvgxO9+hA2/+evUH13zI8sAtyZp8sn+nv5ox8gOpCcxxpKkSb6LyZsvhJQooXDOYK2DonnDWodzEofJX+tYbOywTSZwCFE0dDiHEKJQFxacJHMpaEd/Xx/9/f0cPnrkxoX5uYOe8n4LuP3ZBcGjnPidZwYEzwYD3NZI4tt3bL6UtYPrSbMEkxlAglwUnud5OAvGmmWCd61d3RK2yNngws8tBYUTAoNFGoeRjizTOAlbN29mfHw8OnXq1EeDwN8NvPrHAQTPNAPc1ogbt1+1/SoG+1cTJ41c8DiQDuyi8HOjrqDvpkCFwxmBEEWLVvOflQhhsCYXsHO27bm2lq8CDMI5rMgNxubP4iyhr78fIRXHjx97VRAEdwA3/qiD4JlkgNuSNLl984bNrOpdRZwmLSsQHM5YlHB4np9Tuyso37mlfXviAjtbGJyh9ZxwTeovwNL8PSFyOBmX2wPLWCJzGd09XWxkI6PHju32g+hHHgTPFAPcmqTJ7cMDw2xes5lYx7ncpSTvwLQ4KRCeh7a69Z6L+xicFbkhuFx4haCdAGcsTtJSGc44rFhkCtFs8myCh2Xqwjkyk9HZ1cWGDRs4fuLEbt/3fqRB8EwwwM7MZJ8c6h/iyu1X0ogbhbMPWIsAMqvpLfdSCcpY65hpzBCnMUJKRC7PnNaX7/zmv3aWsAbrZP564Yrfa/t/264XVuQeh2h7P2vIsHR2dzOwejXnxid2e566DfjYjyIInm4GGLHW7gn9MLrskh00GnG+n6VEWocTltQYtg1eQuQHGGMxGDqjDozTHJ84zkJSIwhCkDJ385YYeiKPESwRrMQ5s7jrhciNx6b+b7cpcAgs1so2gAmcydXB4PBq0kbM3Nzs7VIp8aPoHTxNDCAAepw1e0BEu6/dTZJlOEy++a3FCki15oo1O3DO0dBpvnuNxUqLM7BuYD1Tc1OcnDhKGJTxy2VsZhZ3/DJhNum8ZQMIB1agszrKDwshF4wgbGEgikV2aFMvRjpckrJu03oOHYzJ0uRDUoivPusBo4sMgovOAAJBZlKsjb5lrBm68bk3tgI6OJBILI7UZFwyuBVtNcaaQmAW6yxW54GdJLGUowprBzcxeuoQXlyj3NUDjvPoPBdeYdkXAAFIkjomzZB+2OSEHDZ20UPIASPaQJF7JFo4bJqyeesmHn34UGSN2YMQO579YNHFA8FFiTdu3vGe1oSQpG5euekX7/qFhRn70zdcvYvezh60y5BOYoVDGLDC0hl1MtQ7RKZTaIZ2HVini+kctvgehBAsNBY4efowOOgcGABE8RqLtRZjDcblqVRRqAKEZX78HB2rBsiydDFvIABbmJlLYgyF2amXGpog0Trj6MFDCOWNCeF2CCGqvVeOcdev/sxTnxDy/a75S54yCMTFYIByFFFrND4o4Nd9W+npfdXdXL5zPZtWX0IjS1HC4pC44oIGw8b+jYV+Not07SyZzke8ZMYgMGgD1lmEdFQXqpwbP4m1jp6BIZwA7TSBCOir9FIOyszUZpiuz5A5y9TxY/SuX4dONeUgohx14KyhnsbU0hpZloFkcQSMK0bCuMKOKIAphEM4RZI2OPLwYQI/uCNcNfeCh373X0BlAYT37ADgIoDgKTPA8OZ39KRxcvC6510zNLxmLVNTM/zTl7/ErbdvZdVmSTxvMdrlN9qAw1EpdyAF9JZ7McZgXNPvt2jX3NVNNrBYbO7iAbP1WWbGz2CtoW/NBtKswdbVl9BIG4UqsSihOD52lIX5WUp9PXT4HXjKx9gUbRzWGay11NM6mc6aSMZKh5DgjAMFCNMKM1tn8T2P6Zkpxk6cwov4+CO///zbqLhnFwBPEQQC4F2/+dXv67odnR381Z995uxLXn7zUJYadKZRnsfJ0RN89847GLmui5veuIrBLRE6sWSZo1IqIYTEOEPZL+N7PlobjC4E7xZpPYlzAOAsuogMpjajsTBHdWIM5Yd0Dw8zEPaAELk94RwCOPrgXsL1w3SoEkoqMpMhPIsxBjyHLtLFGg3SgnAkC4aJRxoIZVkYS5k7axCFa4l01MahPuWTNDJECbKJgf8MQQW/cgfS/+SzBoCnAIKnxABveuff/ObMTPXDvT09ZJkGXD65S/kgBPvv2s/okYcQfkbvhhIbruxAOdXSxcYZfHwGNpZYvb6CsTn9Iixpqrnspn6y1KGzDG0MaWrQWmM0zIxNsDA7Rbmrl75Vw5RVRGbz7N/c+AQT02cYumQrpUBipEWFhke+NYMXOQ5/exbhWWbPxNTGMxpTDZyNkLICGDxvGOcMUjicUIRRb2v6mJMQhiHXXLWRzVsGAPjT//pVMlXe9Kwbh/OXMPz2/4dsuu/JAeCNb//s92tB7BdOXKUzg+crkjjLXTPncotfSaTymavOMT8zz4nR47kV7sxiBM9ZrLYYaxEo5uaOk/Mv6GwGo6uElRJBucLaKzvpHi6x5XndDF/WyYkDj9JYWKBv/RZ6om4MBuE5Tj14H52bB5k/Xub+r57h9L4qWS1Eqgjl9YIzDKwaRAUlvKBMUIro660wU10gjjPq9RgpRMsGwLa5ns6RZYae7oi3vHE3w8NdHDx4mj/8oy/9JUF4a25dPluqoI/uX/0P+BNrnhkGeMMv/fdjODEiPcF39uzl+buvo7ZQz61x07x5eeJFFJdzzmGsBSeKR1f8LLfChVAYbUDCxnX9rFvThU0toydOcMcdDzM1cYI0nkSFGc9/2wYajTEuvWmAjv61EAsOffsYB756hukjHsKuIqysZfPWzQys7qC7u0S57CGBNNVobch0htYOrTOsdggBBw+NEcdpy8ht5heccGgtkMJSn2/wup97HpdsGWTLyGp+/tbfP6Ci0tXaVUCGzw4I5hLe9opb+dOBXfTXnxgIPID3/F9f+76uNz01/ceZzj7qtGDD+iG+8Hdf5pZXvASSlNRpwjBEIHNAWJEbezaPBxhnscZiigIQW1T0GJPQ2RGyY9tqQBDXG3ihYvv2jVx/ww4OHppkz3dHSWtV9vzXhzG6i3s+lWLMvXheF1KV6Oi+jm1XbmXD2g6GBjvQ2pCmmjRLma3Guc1hHTrTGFO4kSYvMjHGEUU+9UaCEHnNgShiF86SJ5eEA0+ysJCQJBohBQ49oa0CYXNr99kAgDNMle/iJQe+yDeueQXlTOI3hp4+Bth46bt27nr+DXucI4qiEn/3P75AUltg94tvYu269fz1X/4FjfmxAmf5VFqpPIKgC88v0bt6mPWb1tFRKpFkGUbnYBjZ0A8OlBL4nsRTCj+Q+IGiqxJy7MQ0ew+cBhxhWOaR/d/EWkP/8Ca6+9eSNGJ2Xb+RNMlIYoM2GcYItMkFngvdoAvQJUlGvZGRpoY0sxhtsE5grQZrWjZLM1QsrKMRx9zyoit5zs71bFzfz6++649pNDhG1PMaRLDv2WKAn37tZZwZn8PO9MH8AAdf9jpKU2u+BwDCn3ry6l+ws9JR2fPKV78yypneEQYBf/3pT5NlCWtHtnH62MOgwsWcv2mwYdM6PvDel9LZUWL/Ayf51Ke+ST2WbNh6Ges3rCNJEjxPUC4FBL5CKYEXKHzl4XuCIPAIA4+vfP0gjblJwnIXxx+9D195JGmdTZfuplLx2bSxn7iRFUIXGKPRxW632pFqzXwtpV7PwEESLzA3M45LFzB6sgBrN92DOxDSx+gUR5F7KAJV2jgGBzr51XfczLo1fdy55zD/6T99ISZa9djRwtnuVgr8oi41BSbhp392J2fG52g0Eqx16OOXMPZzb8EfX3MRGSD8qZ6Nmzae/cmXvzSqzs7ijMXgkEgajZgv/d3nsMYH3wOb5pcxMTe+8Go+86l3MjMzDwjC0Kerq8J3vnuYX3nPXzJ29gTbr3whq1b3Uq8nRJFHueTjKUUQSJRShKEiTTV77x+nMXsSPywzfvIRhKcwWtPRvYru/s1sWt+Nw6EzS2Y1NrNomxtwC/WEOLFYnTJ1+lF0ehpnp9myeSe7d1/KTS+8ApNlPPDQcT7xiU/h2Ebn0KXgsjY2yMPOaZIw0N/FRz78s2xY18MXvvwQH/+9r9yJF+Qp5IX+NoF38ZL/8jHS6X6kvHhxA9cxRfDXH0b1VknqllojbgGgESdkR7ZQe/s7kKfXPAYAglue+NXSmN6hrQde/ZpXXtmIE6wB40xu7DmHkopUZ3zxb/8uj7ZKCVnM+o1D3P3PH2FycnLp8GgpKZdDKpUuPvs3d/Ku9/4hMMTl11yB73lY4Yg8D9+X+IFHqaTYe2CCMPSYOLUfqXwaczN5ttBm+GGFtZueQ6PRYKCvjBSCTOfuY5JYkswxOzPJwrkH8dQcO6++np/92Rt57c/8BAhHrRZTrzcwxiAERJHHTTe9n5nZlN41N2Btii6ykE21kNZqvPtd/4LnXruJ66/dxKVX/dtqpLb1JtU+Lv/oOzDzg3iehycljclelFIo5XGxzmpwHVP4X3wfqmeG0PPOA0ASpzQOj+D92vuwJ9acbwSS/u8nfjX/5pe96JYXXpmmGRTTtKWjiOXnVv7pE6fo7O1ldnoqB7lQVKfncA46Oztzel0GgjRNufUNL+RnX/sC3vi2P+Ef/tfX2bjtGoaHelgo3LIoUoyejJmcTrjskgrH6/NEYQUnHNIZHIL6wjRz1WlKpTIzs0nhWQiscRiTceboPWzeNMTHPvR+Xv9zN+OcJY7r1GoxaZrinMT3Q5Sy+VRxp/jIR3+ZX/rFDzM7foDOVVciXJp7Bc6BECAV+x88wXOu3sD4RJWdV1/bc3LXOxgy/cwd2opUKhe6lMhnaUC/XH+IhY//Dt0f/E2yY2uWAmDDewZQSiCEQCiFkoJg1QKjH3gL3sBc68WNeoNrr3vOR/r6+4jjGKEcyvhom2ETg3MZUkY8+sgjLMxMgIpA5Pn/+fkZ/sMf/gP/92++jnq9vkT4nue1vu/sUHz+r9/N3//DC3nNaz9OdX4j2zf3k6aaBw4tUJ817Li0k5npcZw2xHYKpUp5oMY5pFRkcZWpiTEQljAMcQ6SxjxpfYLNWzZz8IE/yVPQjQbGWITwKJfL+L6PtbngtdYEQYCSgrVrBwGHtXmiqpVuRiCsBiEZn5hFSkkYhFyyRnFyYvhjmey8Tf0AncjgDR5h7KP/jtLbfxsz833YAJ0Db+jp710702jUydKscNsy+gZ6uOqaqwjLJXSqqVZnOHj//UycOZGXcys/fwMzxonRLzI02IO1dgkILtSh1Lvhg1QnGyBDhOejfMn2SzrwPMWhA98mTcYJwl6cU63CEGstaM2GHbuJazVmZ88hACEU89On6e4MOHv6c0RRLmxrLVprsiwj7x7SrUfnHJVKhZe/7H189+776Fh1LVKV854El8cMnIMk0dy8ewf9vRW++JVDZKW7GbjlBEIHx3zPv1kqNbrIAPJZUQFJkpKmKXPjk7z9F36DanVuEQBDb9iAlAUDSNn6PuifzxlBCfzujDN/9dydsvf4XusyLr/0MgQS6VmO3ec4ubeOp7rZtHUb2664DN/3SOKEvXffxaljD4GIwDkGB/sZPfKnRFHwmB+oOtvgFa/5I76z51FWrxsGmdsAq3ojrBMce/i7xI1ZssZJoo5tWLJWRbFwDoPBZSmrN+4kKvdhbYZzeQ74zOEDDPQL9t73KYYGe5dkNZuClzKvImo0El56y7u55749dA6+GCEV1uh85wuJM4Z4bhZrppCRpbR9nv4dVfo6S4xcsZ1HHnqE2sJ8HIal31JK3f6DAoA3/OLPMzMz++QYYOvbL9vp/Pjr6WnTc8M1z8sjZ0XixQsFYafk6N0Zh76dUT1Ro7t3M9ft3kWl0smRw4/w8L67WbvpUo49ci9DQ2vY8+0/oDpby6lJSR44eIo7v32Iv/2f9zI+fpzOgW1s3zqMsQatMxr1BWamxpmdPIlzBpMdxQsvAaGK5L7IQSBc4btnSClZt+2F6CzDOQ1IhPSYnZpgYeqb/MzPvJ4/+sN3LwECwNmzU/z73/5T/uzP/oQs66Vj8LpmYSIIj7hWRddPgppi1fUePdsSVNmgY4fNBF6vT09fP5tWj3BuYpJHDj1MpaPjTiXljT+QAHgsBhC0/v+BNEs+NDywNrr2imtJTEIQBfnNNlCfrzM3OUdXuUTQ4dNY0Oz52yon7p2gq2sH2666jMGhNaRpwgP79zF5doKkcawV8wcIwmH8sJ+BoVWsWTtAmmZ50MZZhFMszE+TxvNFy1edqDKYewAL0wghWZidKGo8NH7YQRh1U+pcRZrUlsTxRWG4WSdzFzA7QujD1Vc/j7GxKY4fvwvwEaKTsGsHUecQVqcI4ZHUqiQLj9KxcYZV1yoqGyBr5J6ujBR+2UeVFNpabJYhpeLqjVdhteHue+8mjMIxpdQOpVT1h4YBNv3i9j+P48abd155DVs2biZOYhC0KNU5UJ6gr3cAnWrmqwvUpucIIoHwJHs+N8Whb07ge6u4/Npd9K8abOlXZzJM4TkYo/OkkDF5YkjIPOomJPW5eZJ6nerUBHG9jjbzWJthsqnFIBPg+UMIKYnK3YSlTjw/IOzsxZqsSFCZVk+hcwVrCElSW6A2O47D4ochQdiDDMtYneWAi1NqsweobJhl48t9VCTJ6hblS1TFR0Qqz2loh20VlFiMM0ineN6269CZZs+9eyiF0Zjy1A6lvOoPOgP04Pi8NtmNu577fAYGBkjTtOlU5FYxhtCP6OzozIs5hUUiEZ6gVq0zP1XFD0B4grs+V+Xhb4zhqUHWjWxnYGg1UVQhM3pxhxqLELCwUGf8xDHmZifR2RRBn6F/JKBjwKd/s4cXCPo2+3nDpxNYZxBKMHU0oT6lmT6eUT2eEc8Y0vkE6fUhZYDndRNWulF+RFDpxhqdq40CyM4WTadFTSDKpzZxFoJ72fHWDmTgSGvgdXioko+QRS2itWhHK2HU3megjcFXipt2vACdpXzrnjsoheUxpdQO56jmBY5Pwb3rmcFWpvA/++GLxwAb3rqlxzp3MM2yoZe/6GUEYYTWCUiV3xjyZE65FNFZ6cp3dPHBEfmNROa1fHE9oT5bQ5BR6vE48MUqh/bMUj25gDUKPxjIdSsWRESmPUqDhrWXK4a3x6y9OiRrGEwGRmuMdliTl5hJrxl/yGv6bJohirSDUIBwyABmjqY0ZgwzxzLmTmriGUO2kCBlD0J1IGSJUscqnJAEYTdJPIOO62TxcYZunGftjQGNWUfQGaBClfcSFLWNy+sHl/QoaIeQjkwbfOnxsqtvIc0yvnHXNyiFpTHlq2ElJMJX3xcIZM8Ms3/wfoLV86ieGZSSTxoA3gUYYERrsycMgqFXvfRVJGlGlqUgRd7FAxhj6O3qJgzCRTpvlWGzpI3LCzx6hrpJ44zaTI0tuypsu6kD5UukLzh69xxSCayxrN7mE4SQaomNDZn2aMyADBTK9/AqESiZ/ymtugOHMwYjABw6yd04GxvSLMPGhlKPIuwX9G/zsDIHqRdI6qcEWTVj+tgCZ/YfBR/S2IGVdGwSrL8lQAUB2nhEq3ywDuPsYhm6XbrjhWgWkebl6Aiw1iCFpJHFfOfwPbz4spvYtfP5fHvfHUOdXufnLe7Vouh8ftLLOuiahs45vt8jID2Asb86AcDaN43sNDrbE4ZR9NKbX0YjjvMPJPOqKSfAGktvdy++75PlRX7LbgJLb4xw2MwhPUnnYCcmMySNhLiWoXXG4JZS3iwiHDoGYwRS+ngdisD3QdjFwlHrWu6abd9tDmxRZCKUQEmF9AXS+TiX9yLoNLcx0Jos1WQNA52G/lVdDF/Rxc7XDFLPGkwvzJD3KkpMbJFRiPCKDqL23sRm+3mzl8AJjGUxRNxWqi6Mw1ceJ84d54FTD/GczTvZtmE7x8eOvyoKwluBTz9rwaE2BthpjNkTBrnw4yQXvoRiEENeqz/QtxpZ1PS1U35T4Nbl1Lv4s7b/5zXeBJWQsCMsmjto7Rrn8nZwR07z1uniprM44KG9F6C9PewCfX5WFMWkziGkyA+p9HxkyWu9pmESIq8EKHr8Cr09A4zXJ5luzBD1Rq3MX6vRtO3a1ha7vtjBuQ3AYqOqKPoRi+/DoMTdR+/h0uFtXLfjWk5MnMTiPqmc+19A9UkJrm8W0VV9ygBo8kaPMfZLYRhEL33xT+aWPjZvoSg+YGoz+noGcuFbs6SBon23O+fOYwDanrMUhSBFUUb+aLA6t/6tzp+3tO24tjbuCwk6b+6wrVxEqw2sWY1ki+s2C05N8eUszsKMnsMvBciKJOyO2L7xUq4euZI0S3GmKAcTFmsFFELNr8V5DSXONsvIcxVl29rYcA6pPL6w90v4XsBLn/ti6o1aBO5TuSjEE/ry+uY4+eF3cu73343qrV4UAHw+jutDP3HDbrI0yY9ItQ7tRD6kwVl6OntQnsqF3yZoI84XuGuj68d6DcWMn+bPzDKguLbdtcSwWm5oFWBY3u/viukgeRtaU2jLWssLBtNZxnR9Jk8YWU2c1ugIO9i19XpSk5eN26KXsShuoln7l3cZiaXXxWHJy+BcoTpF8XpPSMbmJjh17iSDfYOs7luNMfrV4EaeiPCD/jn8vjm8vllUz0VggME3rBsxJrtx06atlMvlvFyaZm+9xlqL5+XJEmPMUnpfJuhFT2CZwJYDpAmK5b/fLBYVPIagmze67dFd4Bptv6dte4u4WGq8tY2Pma3NklmdD5uygsTGKOlx7cg1xDpu/uZ57COa4BKiSA6dz1qttvSioihUAd85cg842LllJ40kxmH/MB9589hfle2jPPgbb2H0Q7+E3zd7cbKEON5gtGXt8Noi/ZlTW4723Pgpl3LhO1EUby4DAcsEbZ6AWljynFi8OfkN1ue/T/vObVLuhZhBLBWUFA5bfI6WmmgJra0/UAiqtWmssPmgKuNIs5SBzn46g85i7Nz517AFwJpzDqxo7vpFFtOtzwbOWpRSHDrzKLONObas2UTkR2hjblxsXj3/y++f4d5//V46t5++aMJvAuBSC3iewjqa/bZtdGYJo3BJM+XyR/MEBM1jsMXS9zGLLd4Xeo1buvOW7EjaWKJNULmhVoBZLFL2crWEkNTiWq5OaM4dzCeVrekfxhibRyZbgyYEwpELtrnb27qTc94XbYaiRTQDTMIR+gEHjj+A1oZt67ahje4BrheicMfbvqLV84QD8wRtqfmL5gU4mBHOIkXRMl1Y/lbmas7ZvNQrE1khBLE4uqWw8pcagywKyBZ03toli/9ffA1LBd0a57J0rk/rvZszQ+z508Ha28Jdc17QBQw0W/xuXiiSexdYR1q0ljk0ysm8jcyzbXRuW7GH1gSyJv23AdQURuDi52fxus3XAtrkU9GkkmiT4Sk1uFxA3Zef5s43/wqdfQ3Kg/MXv1AE+H2lPA4fPYwn1XnDlRBQi2uL/r4z51H+hWjd2Cf4msczIkVhHC6j+ryb2BazA0WLASzLbIXlRl9TCLSNohPF+JnCf7fOIozFYrBOI5xgujaDdKIQYlHhdx4jiaLjuKgMb/885GooB0MOJgF50qjoaLbWYa2VzRqFcNUcXTtO8vU3/wo9m88QPg27H0BOfObUqJTy6Nkzp/ObIih2a55eFUAjjpf4+xeifB5Pt38vl9FdwNpv/52Wtd12/abgnb2ALWCXjoRZru+b71MwhhAWi0BJibYaXbiqzsFCUuNsdRwh2+hcnB9/sE2WEIvziGhSfuFGtv9MW81g12oclrNTZ4sJp3Z/aWie3qtO8+3b/hX//MtvpHfDmac/ECSEeKcV7suPHnqELVu35W3TwrbCkwuNeTo6OtpAwHmU3wrLtgFlOeXb9lCxXRY6bhOKXKb38yCLxArdCrKI5XMDC3XRGgFDUzeL8+cLFSAwTb8gn0Obh7aNQXiqNV5m38n9BMpvtbEt/l05I2AERhqEE8vmE4oiEkgr0bRkFgGO7Wu2keqUh44dpLe7d2zouedGv/z61wIplYExgshrlW0+bbWCxeNXPOkdO3T4UF7k2CZoByihmJvPLc8lrp5tc9nEY7iDT8RlbP+/W8Yg5GrA2GK0i10MTp03C9C1u1sXCCK1GYi23RMgbxmPvAjjNM4ahJDsO3GA1KT5/WhOJW0CCFt4ABbRet9CTbDsuku8AEh1ynM3XkNqEvY8+F2C0MOS/bsvv/5n8LonCQeeuePjJMD4Z04hhHyNRLJ33734vr90BwL1uE6mi9j/Ev1tHlt/fz8uYztIzgOMWerCXUBlLJkVdN717aIR1h6+thbPC3N9bCEzGQ+feYTMZoiin1EIUeh2FmcUL7l+ESrOO81bRm6rJ6DZT0Be83D1xivR1nDPw3dBWuLg//+C/0L57KM4+/c49zYEI88YAAZfvx5gn/K8z585eYrZ2SpCySU6TiCYnasihHhCId+n4jK2v0Y8hqDNctevPSHlFtVJa/e1WfKL4Cm8BJHPNsJZFpIap6ZPo63OhV+woC0iii2dviyimIeK20EoCvVYgKb4V4/rvOjym/B8n7//xufxK3VO/9NPQNSFV1mz1SuvfrXvd/yJ9LxjxugZ5+zfgfvFp5kBTjL+mZMAbw6jaOzuu+7Ky8TbumORkOmUWqOe6zvhioICgfK9PAMX+AR+QBAFBEFAGIT52PcwIggDfM/HC3ykkAglWiBAPLYRaC9E9e2Cdq4Y67LoYrWrCNGiY9EWXm66hzl9CyexLqNan2O2MYeTAumWhaKLz4sSIPNqpzzrmNf8C08iPJlHbFVRoqjyzd+0GZIsY+vgVtYNrOW+h+7j9MxhZu69nmxyAOlZPOXj+yXCjn4qPevp6t/YU+nq/SkpvE8aoxs5GNj5VIXe09tNp91Ip91YVAT9/Pr2pr+dRuu9g0NDXHX11cRxvFh1JcFkhv7+fEhTktaJawnHj4+ilMfsbJWZ2RmEE0gBC7X5vEzbQLm/k67uLnAwsnkzge+zemiILCumhOn8UTeTL23W/aJeX0wQWecQRQu6E+C0KQw+09LxzYIMU5RrLc8lNKeD4Qy6PWBVpLXzpo8i764ESSNjYWoWJFRPTeVsaPO/qfl9b3cfzljqKkEqRdgdIn2JNY6yX+IlV76I6bkZvvT1f8Cfv4zZPT+JKNUIAx/pe0S+h+f7rU6owFMEoY8nHWk8T71WRUl5JAj8P/U8+bueUihPopR8QgUhSZKSVAU97/80+txjVAQNv3HDbWmS3n7pZTtYv35DqxRMCIHBgJX0r+pjdqJKEAWsXr06d5uEI/RKhJ6PkgpSR5qkdJQ62Hv/PXhBwIGD+zg3NcXceJV0LiVaG9G5qpf1I+tZu34D5UqZTGuyNM0nhhSRueZZAE1BNhs0WjS/ZAagKYo3ckC0Xld4C4u9/vmQale4u0IInAThSRam5qmemWJhah6zkJKdzIhWRfT39lPqLrFh/UakJxnsG0SXLPW4jhSKibkJaJaHIbCpYWFhnulwlhu3P5800Xz1618k9LqZ+cqtEKT4nocfefgyfwx9lXdE+0VXtFIEgUcQKMIgJI7nmJ2axGGrURB+RPnyo08GAKbaw9B7/gw91XNBBigcAXFHI27sfu5119PT3YN2Ondhi7y9UpKevl5MpgsLvWlNF/V1zbCMEFhj6O/sJ1AeXaUuOqIKXUEX83Oz3P/wAR49+iiHjjxC7WwN2anoGeln09bNjGzZRJIkpJnGtCqPyM8PEG3j3JzLGUDKYk5gM6gjcjAUgjZ26TDpXAkKhJIk9ZiZsSmmjo2RnUrxSz6rBgdZt2Et69dvYHjDWqayGRo6pp7UGK9OUEvqzDfmCzsvp3lZ5Ahb00+cQQmP6zY/lyxN+OY3/glPdjD/9beBl+EFuQoNfQ/f9/B9H98X+IHCV6pggqI72heEgSLwPKJSSK02y7nxCRy2GobBa5WS//hEAdD/q/8ZPdX7+FXBa27deEeWZbt3Pf8n8P2AzBmEtYDCoQn8kI7OClrb8317Ft0wIURO7UXyxGBxxtBR6mCgs5+OUheDXQPY2PDgwQf57t7vcuShQ2RJRs+lA2y/YgcDQ6tJ0wSdGix6MQbQVhWU2wLNZJYBLdDCLPbxuXxIBTIP+jhhOXXwBFMPj+NmLZW+Clc95zls27aNroFuxuqTnD53hrlalalGFVXYEbSMRpHPu24CUbcNnhSgM01HVGHz0CZmz1XZv/8+xPQW4odeAypBKfA8me96r6D+QOIrWex+D1+J/PsWEBa/D32fUjlg5twUZ86M4fnqWOh5N8dJOvr4KqDCi/78q0ztHXhcBsg/qBN3ZFm2+3m7d+H5ft41W5SLWKsJwpBKRwWjzXmFoa2dgF0aNyiMsWbdv8WijSHyI1Z19TPYtZoev5vxs2N86R+/wCP3PYI34LHhys2s37KRMApJsiwvInEmtwuaY+O1KCqH7FJ9r/ISc+kp5maqHNt3mORwjY5Vndy4+0auuuo5xFHGsbGjHD07ytTcFJ7IdbeUEj8K8nL1ZaCD80PC+ewATWepg+FVazj50CinDh9HzG2oZg9e04NaQHjdqLCHsHstgbR4fiF05RH6zZkITSA81vc5QKIoIAw9Dj96lKlz1VhK+YlGI3n/YwFAAHF1gJd+4jtPrDNozRs33qGN3n3DT+zCD3y0ySNyqHymnh/4eb1Ay09n0RJvloXh2nL5ts36Z3HidwEEU0wJjfyInSM76TYVvnbn1/jOvf/M3PE5gqGAoR3rWbV2Nd0DvVhj8mydta3HRcNVYKVl+vQk48fOUj8yhyd9rrjyCq6//gYGNg6y98QBRsePMN+o5+1uyCKZY4ujasirgbEFwOySKGV7dNC6POvX2dmNnc8YvesQ1roxVfJfLhdW74sPXDUC/LwU3IKwzxNCRFHHEN0DmwnDEKXMefq/+X2oFJ7v4QdimXrI5yYEvs/ZsWkefOBhnON+Y+wL4iStXggAWbWb9b/1/z0BBmiOdxLijkYS7778qitZtWqApNkjIMHpvPp3EQQsi/tTlGW5Vp3BeaHiZni2VVJtMcKidQZCcMnQJWzpHyHMfPY+uI8HH72fw4cOkc5nuLLDHwiRvkfPQA8qCGjM1ZifmCabypCxpKevm8svv4JtWy9l89YtjM6f5MFTDzI6fhxf+kglcDqvg7BZ/ndicxqXSiI9UaSA7dJoY3txiAPhK5wxnLt/guRcPZYl9QnPV+93UYacWUd89y4Ia0gE0pc9UshfBvceZ5KhSvca1my+Gl+BFO48/f9YTBAEHp4SxKlBZ5Y4zjiw/37iRlJ18KIkTvctBwBAXN3w5LqD171588fSNPm1jZtG2DCykThLW/kC5xzKU5SKY93akzdLUsYsHunSyq61s4VejNrllr5AO402mszkrLBl1QjDPUMMdAzQWepk5tw5BIqzZ05zbvocUgi0c4ys20hXdzee8hjX55icmeDk9GkOjT2KL4qWdCcLlUE+ENJaTBEdNDb3GrxALKZ1XVucoTD0BLmbiBBUj4yzcGweFP8opHqt7ciqygcbghjvxn73FYsACAq2EQIp5UsC3/ubRqPWs2bjDtaNbMeZJLcR2pngArZA4CkynQs+STRpZnFOcejQw1TPTcUO8cokSb+2HACLnUFPjAGaz92cpfofevp7oksv34F2Ji+3pmi3UoJSVCkOA7GtDON5+YPCRmB5LV+bW2dFDgDTKszMj3/TTuczf6whM5r1vWvRLo/fK0GrTsAYzdjcBEmWIosCDYlAKnnBuIArikCsdi0gYC2y5BfZwUX3s1nRLATIyGP++BTVg1PIpIfOmVuQafmfPNv5EqU80niBru61lLrgwQe/BoTIMFoCACEEUVQiSxq/p41+Z6nSGV2768UImR+lE/rqgnZBGHoY44iTLJ+AkmQkqSZJNBaPk6OHmZ4cx6E+kKbJxy4IgCe7NrxlS4+xZq9UcmT7FTsoVSqFm5bHPi0QRRGe7+XC4wJFI02DEXteQUVTBVjR3GVmmcW/yBBOCLRJW/1+S04XcYsf8IJVRW1ZTCPy1rRmbsBZhzEOqfKBl7n+dy0DEyFRgSSeqTO57wzMRQxkr6XsRrBenfr8WYxJ7/S84MYsrdHRlQ+ZKJcjwnKJA3v+GYIyQVhaAoA0qSOlN2Kd3WPSZGj3La+ks7MCzi6zCzyCIG/jixtNoRuSTJPGmkZiSdIMbQTVqXOMnz6MkPKDcZze/lQZoPWcE+73dJq9c3DtmmjdyDqsIXfRCr9YKUUYRYuFFq2qmPaUcZHAdYsxftEu4CYAmru1JYR8Lt4Fgz3nuYgXbtty0oFejACa5oGTxhQRPosMvIIZimwfDhEokpk6kw+exk4pesyL6Uyvx3l1hMpr/gAW5saxOrnfYV9QrvRVwaGkwAlBuVwm8AP2f/cuCCKiUtQGAL/IKIk7sizZfc0Nu9i8dRNWm5YtECiJ5yvSRBNnmiS2pElGI23OQspI4pwJMiOZGjvGwtxE7JzchXP7LsqcQICNb9s6Yqz9e0/Jq9Zu3EDfqv5iNJtpBYfCKELKfNgi2KUMsIwRbDNjqMFKU6RwlzKAcW0gEQKnTR7ytcsYo1kn0F5HaNujh7liz8EFGNPS/864PBVfGLQA0pcYbZl84DjxSUNH+nx60xdhVQ2hTGvaiZISlMSTkoW5SZKkNhYE5ZdLKfc1AaBEXnNQLpcJIp+9/3wP5Z4e0rhOVKrkAMjjk7cl9YXbn/+iF3HJtk0YqwlUrgK0NsSxJU0zGokmKYDQrgaSggkyLZmZOIyOZ2Mh1Q4Qo0KGT40BEG0/h1uyTP9FpasyNLxhHZXOct432Iy+SYHv+0VlTREpbHXOLDKC1YspY9tq9jBLhGlawswHOjajgzkLiOIgyeWh4rahTtphZNHZ5NpK0Ck8APK0rvLyjKjwJEZrzh04Q+NEg1J2Nb3ZSxASUClC5bpcSon0JKDwJa3hUAvz08SNhdjz/E8oKd7fDgAlFU44olIEFsLIZ/+9D1Hp6saauHmTb0tqc7e/8KW3sO3SzXkUxjnihqHRttOTtBB+poufLTJBnGQgQhYm7wdnx5DBcDK37+KcGLLxFy7J3ygv6/6gMfrXyx2dPWvWDxNV8pk6WlvAojwP5amit9GeVxXUPoTJtvL3i2xy3mkeLeq3CO0wsijLdsWodyMwwixSfvOE0VaVUFvQyhRFHtaglEJ6Eq0Nk/efpX58LhYl8anuE2/oF1b+q0pfP5BHAoUsAOBLJAopQXq5hyF9hef56DRmeuosSohjQqmblVCj7QDIB3LkA7Pm5k5x+sg/0bvmdWTJOZACZ8VtJkluv/Vtr6Ojo8T8Qrp0p2eWpPACkqYaKJ6P46w4iCM/hW1+8gGEDD6V1Q695WIyQKuaqBie9G+tMW8tVSpbVq0ZoNLdlbd3u9yYUr5CKtlSQs2aumZYNRemvaAKWKIG2o57KZIQxa4vwKWLOZVucbDT8tDtUk/AoYIcoFOHJpl9dDJG8FmUeI/zTbXn0JtAZTN+VOmpVPrI9brMT0KTYhEIom0KmpQI5eF5HtWpsyzU5vCU/+dCiPcqqarLATAzc4qJUwew+hR9a99Kmo4X94HbTFq//a2//BbiJKORpIs7PS2E38YEaaapN3Qxyl8U008DsrhKsjBOVj/ynIvOAE0AgGhO/tppnPmPnlIv6BsaoKOzE+WrvAMHjRMSmfvBebWMc230vTTD124E2rbCjOZxL8KZ4jwghylyAzjRRv95p5B4DONQ+AoBzDw6zszD50BwB55onSjuAsPgwdvIwrMvsc78787u1QRBOf/YTQAsm3/oybxOIAeEwA98nLFMTpwmrtdjqbyvSiXfLYQYPQ8AVoOdoG/9vyapjyOEJE2zOwJf7r71rW9kYmLqPIMvySxpXNgETXfQ5jOapSoRz58iW3iYeO5OoDT6tDFAGwBAgXCixzn7dm3tL3R1d2wpd3VS6e4oqLfwEqTKa+2KlmojzOMygGwWmurimDdrWgJvnUP0PQY4OJl7Kwg4d2iM6sFzIAvBu6Xzfl1gWH3wfehwAiH5PNa8qn9oSx4qlnmhyPlCbwJBITyHFD6el9tDRmdMT53j3OQknu/tVVJ9Tgg+MT8/UW0CIJ9Gdpbu4ddjdR1jDElt/uymbVuHrrn+Bmar8ySpJk0WXb+kMAjjhsltGb9CY3aU2sTXcPYM4O+F8ucQ+hPPBAM0AVCARiCEGLHW/hsEP1/p6hgqdVaodFbygkxtlxaa2vMF1iwe1W1BGeuWxuax+fOyvaDELY02SiHBE5x7eIzqI+dipPvvKPGh1qBnt3wWj2H1/veRBeNIBSDPesobGhjalIPPE/hOIgoV4EmJkxLPy4daeNJHKIGUAqUknvLxgryyaG62yvzcHI1GxvS50bHx0w/styb5DIhPOVsj7HkFNpto3tcRHc8evPGlr44Cv0wtTs5jgjg1GCNxRjNz4vM4cwjw7gD/TRCOggci5ZlkgHYAtBIsRpsRZ+27rXU3lbrKO0pRGKlKROB7xdyhvJS21QXcOm7GtUa3La8AaqaKEQ5tCo+hDTzCWUTgk9VSjn/tENaYMRHIXcDoEqG7pbt/44O/R6Pz/tZzDrfTObOno6s/6updDc60TT+VefZxGSOo5qPK3UWpwPcDOjs6mTo3yZ47vsrMuZMxLv2fjuxDwCP5UQCThD2vxJlanl7Xye9Jl73v5le9kemp6lKDMDVoG1KfOUJt4m+B+Bh4N4M/mn+oiCUAeBYYoAUArU1RdeXo7OuiVl241mF/0lp3falSukL4oiycHJaBxA+CfFqHzkO2ps0OoM3l4wK7vckA0pOoMGD8wHGm759ElOXnEby5NaDhcQCw5tEPkAXjS4sqpfiA0dlHB9duIYiivBywjf6bQBBS4rWEvgiAIAqxxvGdO/+RidOPxgjvs0Kq95h0uurIWsabszWinhfjTB2EwJgYEy8cXTOyY9Pwxsuo1estgzCzPjOn7iZb+ArgPg7RbZAAzZNMFgHgXRQGuIjLWnuv9OS9AotSEicFnvSYm579daR4txf6Q0EU4IVe/je45rictuJNd357m/QkyveYPjrJxP7T2MwcFRX5TuArT+XvFXC78oNXTZw9tnv9yHak7yOEWBR8ses9IRGq6RFIPE9RikpMTkzw7a99ASc5Jv3oZqwbzSddLT+fQZE1ZnAubhXjSi+4+ezxB44NrL0sH4ufObRTzI0/RLbwpRi8V4L72veeEfTfTj5lBnjal3UfkYH3EZPpkXojfbfF3eRF/g7le5FUAuWrYgiERPlNt1KgPMn8xCzVE9PMH5muOtz9BOJdIpBP+gzg9iNpF0lC4OBGqdTZ0ycPD12yfWd+zIwQLWGrQvhKFUzgKYIw5NixUfZ+50tYl348ClfflqTzj03JLkFID+HawSFGrZN/fuSBO94yOHIdWmfEtRrxzP8gFz7f8yygHzgGeAJrVAjxXiFAeYq0Fo8g2GGNeYMK/NQZu/nMfcfXhT2RcEJ8ff7wdEgovo4Q9/td3t1pI/v+9J6DMAwQvn8hZOAQO5y1B48efmBo22U7weUgUMtpX0mCIODRhw/x0P5vxNbWd0kVPj4YXQLh8zB65gKF/eK9CzNHfq5r8IpIU2bu9KcB+ymQT+ggqB8eBnise2PdqPDEKEJ8SRQ3WghQoQdC4pRFKK+oSnqK17oAA7TPuJZKvdwas+fwwX3RZVdfi7MgpcWTXs4AniMMS4ydOsvDD3wzdra+yzn7BJkoJY89n6ccqkJEnz13av+bo+51OHu6CvItT25K2A8XA/wgr31SyV3a2D0P7d8b7bzu+lZRrFIOX4XMz83xyMF70cn8Lwn5BNWQkJA2gOwxnhfvSWsTr8NORyD+3yXGEZAbgLroWFE/WgzwgwgCJdUuo/WefffeE12/a1drDkGpHHJg3/1MTxy5AyE+vXiWkEDIx+kCFiIft79MeIuGqKg6F381XXjw1YhVn7xwR3E+Fxl7doUBnhEm8LxdJtV79nzrzuiG599ApaODqXPTzEyfREjxJkFuS3iej3MZ8cIxhD9Q7NSlwnfagnjg8cwTIHg3zF6PGKjissf2WZBLgLTCAE8rCOQwjoPf/Nq3hq597nPQxiCFvzdtVEeVX1ru5oDRoDOU753PAATf43L+KMh7sEd4fKQoYAxYt8IAT/fyvLA6PXlsh5Le5/fet//GrDFJEEVfX7PpeY/l66I8n9PHR/Ps5pO+tfZV4D+B160wwDO2dBZXg47+F8QLY2/Ksvn/2Khn37JGfw/geMigj3jhNEj/6QXpCgM8M0sI8RdSyr+wTg4qL/jee9mkhJVhpPRozJ/gQtHBi/J3XaxTK1bWD+eSK7dgBQArawUAK2sFACtrBQArawUAK2sFACtrBQArawUAK2sFACtrBQArawUAK2sFACtrBQArawUAK2sFACtrBQArawUAK2sFACtrBQArawUAK2sFACvrh3z9H/nMV6sjRy1xAAAAJXRFWHRkYXRlOmNyZWF0ZQAyMDEwLTAyLTExVDEzOjIxOjE0LTA2OjAwe7/E5wAAACV0RVh0ZGF0ZTptb2RpZnkAMjAwNS0wNy0xMlQxNzowNDozOC0wNTowMCSWgvMAAAAASUVORK5CYII=');\n" +
"}\n" +
".leonardo-main-view {\n" +
"  position: fixed;\n" +
"  display: flex;\n" +
"  top: 0;\n" +
"  right: 0;\n" +
"  left: 0;\n" +
"  height: 100%;\n" +
"  overflow: hidden;\n" +
"  background-color: white;\n" +
"  z-index: 9999999999999999999999999;\n" +
"}\n" +
".leonardo-main-view-hidden {\n" +
"  display: none;\n" +
"}\n" +
".leonardo-main-view-body {\n" +
"  flex: 1;\n" +
"}\n" +
".leonardo-header-container {\n" +
"  width: 100%;\n" +
"  z-index: 1;\n" +
"  border-bottom: 1px solid #ccc;\n" +
"  display: inline-block;\n" +
"  min-height: 44px;\n" +
"}\n" +
".leonardo-header-container .leonardo-header-label {\n" +
"  display: inline-block;\n" +
"  font-size: 20px;\n" +
"  text-align: left;\n" +
"  padding: 3px 25px 0 15px;\n" +
"  line-height: 44px;\n" +
"  float: left;\n" +
"  text-transform: uppercase;\n" +
"  width: 170px;\n" +
"  font-weight: bold;\n" +
"  cursor: pointer;\n" +
"  color: #666666;\n" +
"}\n" +
".leonardo-header-container .leonardo-header-tabs {\n" +
"  display: inline-block;\n" +
"  font-size: 1.5em;\n" +
"  color: #666666;\n" +
"  text-align: left;\n" +
"  font-weight: bold;\n" +
"  height: 26px;\n" +
"}\n" +
".leonardo-header-container .leonardo-header-tabs > ul {\n" +
"  margin: 0 20px;\n" +
"  padding: 0;\n" +
"}\n" +
".leonardo-header-container .leonardo-header-tabs > ul .leonardo-header-tabItem {\n" +
"  display: inline-block;\n" +
"  line-height: 44px;\n" +
"  margin-right: 20px;\n" +
"  float: left;\n" +
"  text-align: center;\n" +
"  text-transform: uppercase;\n" +
"  font-size: 12px;\n" +
"  width: 170px;\n" +
"  cursor: pointer;\n" +
"}\n" +
".leonardo-header-container .leonardo-header-tabs > ul .leonardo-header-tabItem-selected {\n" +
"  border-top: 3px solid #f08222;\n" +
"}\n" +
".leonardo-dropdown {\n" +
"  position: relative;\n" +
"  font-size: 13px;\n" +
"}\n" +
".leonardo-dropdown .leonardo-dropdown-selected {\n" +
"  padding: 0 10px;\n" +
"  height: 26px;\n" +
"  line-height: 26px;\n" +
"  white-space: nowrap;\n" +
"  overflow: hidden;\n" +
"  text-overflow: ellipsis;\n" +
"  background: #219161;\n" +
"  color: #fff;\n" +
"  border: 0;\n" +
"  margin-left: 0;\n" +
"  position: relative;\n" +
"  width: 200px;\n" +
"  cursor: pointer;\n" +
"}\n" +
".leonardo-dropdown .leonardo-dropdown-selected[disabled] {\n" +
"  background: rgba(33, 145, 97, 0.5);\n" +
"  cursor: default;\n" +
"}\n" +
".leonardo-dropdown .leonardo-dropdown-selected:hover {\n" +
"  color: lightblue;\n" +
"}\n" +
".leonardo-dropdown .leonardo-dropdown-selected:hover .leonardo-dropdown-selected-arrow {\n" +
"  border-top: 7px solid lightblue;\n" +
"}\n" +
".leonardo-dropdown .leonardo-dropdown-selected .leonardo-dropdown-selected-arrow {\n" +
"  position: absolute;\n" +
"  right: 5px;\n" +
"  top: 50%;\n" +
"  transform: translateY(-50%);\n" +
"  border-left: 7px solid transparent;\n" +
"  border-right: 7px solid transparent;\n" +
"  border-top: 7px solid aliceblue;\n" +
"}\n" +
".leonardo-dropdown .leonardo-dropdown-options {\n" +
"  position: absolute;\n" +
"  display: none;\n" +
"  z-index: 10;\n" +
"  margin-left: 0;\n" +
"  left: 0;\n" +
"  border: 1px solid black;\n" +
"  width: 200px;\n" +
"  max-height: 300px;\n" +
"  overflow-y: auto;\n" +
"  padding: 0;\n" +
"  background: white;\n" +
"}\n" +
".leonardo-dropdown .leonardo-dropdown-options .leonardo-dropdown-list {\n" +
"  list-style: none;\n" +
"  margin: 0;\n" +
"  padding: 0;\n" +
"}\n" +
".leonardo-dropdown .leonardo-dropdown-options .leonardo-dropdown-list .leonardo-dropdown-item {\n" +
"  padding: 10px 5px;\n" +
"}\n" +
".leonardo-dropdown .leonardo-dropdown-options .leonardo-dropdown-list .leonardo-dropdown-item:hover {\n" +
"  background: lightblue;\n" +
"  cursor: pointer;\n" +
"}\n" +
".leonardo-dropdown .leonardo-dropdown-options .leonardo-dropdown-list .leonardo-dropdown-item .leonardo-dropdown-item-text {\n" +
"  display: inline-block;\n" +
"  width: 100%;\n" +
"  height: 100%;\n" +
"}\n" +
".leonardo-dropdown .leonardo-dropdown-options .leonardo-dropdown-list .leonardo-dropdown-item .leonardo-dropdown-item-x {\n" +
"  position: absolute;\n" +
"  right: 5px;\n" +
"  display: inline-block;\n" +
"  width: 12px;\n" +
"  height: 12px;\n" +
"  overflow: hidden;\n" +
"}\n" +
".leonardo-dropdown .leonardo-dropdown-options .leonardo-dropdown-list .leonardo-dropdown-item .leonardo-dropdown-item-x:hover::before,\n" +
".leonardo-dropdown .leonardo-dropdown-options .leonardo-dropdown-list .leonardo-dropdown-item .leonardo-dropdown-item-x:hover::after {\n" +
"  background: darkgray;\n" +
"}\n" +
".leonardo-dropdown .leonardo-dropdown-options .leonardo-dropdown-list .leonardo-dropdown-item .leonardo-dropdown-item-x::before,\n" +
".leonardo-dropdown .leonardo-dropdown-options .leonardo-dropdown-list .leonardo-dropdown-item .leonardo-dropdown-item-x::after {\n" +
"  content: '';\n" +
"  position: absolute;\n" +
"  height: 1px;\n" +
"  width: 100%;\n" +
"  top: 50%;\n" +
"  left: 0;\n" +
"  background: #000;\n" +
"  border-radius: 5px;\n" +
"}\n" +
".leonardo-dropdown .leonardo-dropdown-options .leonardo-dropdown-list .leonardo-dropdown-item .leonardo-dropdown-item-x::before {\n" +
"  transform: rotate(45deg);\n" +
"}\n" +
".leonardo-dropdown .leonardo-dropdown-options .leonardo-dropdown-list .leonardo-dropdown-item .leonardo-dropdown-item-x::after {\n" +
"  transform: rotate(-45deg);\n" +
"}\n" +
".leonardo-views-container {\n" +
"  width: 100%;\n" +
"  height: 100%;\n" +
"}\n" +
".leonardo-scenarios {\n" +
"  display: flex;\n" +
"  position: absolute;\n" +
"  top: 48px;\n" +
"  bottom: 0;\n" +
"  left: 0;\n" +
"  right: 0;\n" +
"}\n" +
".leonardo-states-list {\n" +
"  flex-grow: 1;\n" +
"  padding-left: 10px;\n" +
"  padding-top: 10px;\n" +
"  overflow: auto;\n" +
"}\n" +
".leonardo-states-list .leonardo-state-item:nth-child(2n+3) {\n" +
"  background: #eee;\n" +
"}\n" +
".leonardo-states-list .leonardo-state-item:hover {\n" +
"  cursor: pointer;\n" +
"  background: rgba(47, 204, 255, 0.32);\n" +
"}\n" +
".leonardo-states-list .leonardo-state-item-detailed {\n" +
"  background: #999966!important;\n" +
"}\n" +
".leonardo-states-list .leonardo-state-item-detailed:hover {\n" +
"  background: #ccccb3!important;\n" +
"}\n" +
".leonardo-states-bar {\n" +
"  display: flex;\n" +
"  justify-content: space-between;\n" +
"  margin-bottom: 10px;\n" +
"  padding-right: 1px;\n" +
"}\n" +
".leonardo-states-bar .leonardo-search-state {\n" +
"  border: 1px solid #ccc;\n" +
"  border-width: 0 0 1px 0;\n" +
"  width: 200px;\n" +
"  outline: none;\n" +
"  font-size: 15px;\n" +
"}\n" +
"::-webkit-input-placeholder {\n" +
"  color: #ccc !important;\n" +
"}\n" +
".leonardo-add-scenario {\n" +
"  display: none;\n" +
"  position: absolute;\n" +
"  right: 0;\n" +
"  top: 0;\n" +
"}\n" +
".leonardo-add-scenario .leonardo-add-scenario-box {\n" +
"  position: absolute;\n" +
"  display: flex;\n" +
"  height: 50px;\n" +
"  width: 425px;\n" +
"  right: 25px;\n" +
"  bottom: -90px;\n" +
"  border: 1px solid black;\n" +
"  background: white;\n" +
"  box-shadow: 4px 3px 5px 0 rgba(0, 0, 0, 0.75);\n" +
"  z-index: 1;\n" +
"  justify-content: space-between;\n" +
"  align-items: center;\n" +
"  padding: 5px;\n" +
"}\n" +
".leonardo-add-scenario .leonardo-add-scenario-box > input {\n" +
"  flex: 1;\n" +
"  height: 25px;\n" +
"  margin-left: 5px;\n" +
"}\n" +
".leonardo-add-scenario .leonardo-add-scenario-box > button {\n" +
"  margin-left: 5px;\n" +
"}\n" +
".leonardo-scenarios-list {\n" +
"  width: 200px;\n" +
"  padding-left: 15px;\n" +
"  padding-top: 10px;\n" +
"  border-right: 1px solid #ccc;\n" +
"  overflow: auto;\n" +
"}\n" +
".leonardo-scenarios-list > div {\n" +
"  font-weight: 500;\n" +
"}\n" +
".leonardo-scenarios-list ul {\n" +
"  margin: 0;\n" +
"  padding-top: 5px;\n" +
"  padding-left: 5px;\n" +
"  font-size: 0.9rem;\n" +
"}\n" +
".leonardo-scenarios-list ul li {\n" +
"  list-style: none;\n" +
"  cursor: pointer;\n" +
"  max-width: calc(100% - 10px);\n" +
"  overflow: hidden;\n" +
"  text-overflow: ellipsis;\n" +
"  white-space: nowrap;\n" +
"  margin-bottom: 2px;\n" +
"}\n" +
".leonardo-scenarios-list ul li:hover {\n" +
"  text-decoration: underline;\n" +
"}\n" +
".leonardo-state-item {\n" +
"  display: flex;\n" +
"  margin-bottom: 3px;\n" +
"}\n" +
".leonardo-state-item .leonardo-state-verb {\n" +
"  margin-right: 10px;\n" +
"  background: #000;\n" +
"  color: #fff;\n" +
"  text-align: center;\n" +
"  width: 60px;\n" +
"  height: 25px;\n" +
"  line-height: 25px;\n" +
"  font-size: 12px;\n" +
"}\n" +
".leonardo-state-item .leonardo-toggle-btn {\n" +
"  margin-right: 15px;\n" +
"  align-self: center;\n" +
"}\n" +
".leonardo-state-item .leonardo-state-verb-get {\n" +
"  background: green;\n" +
"}\n" +
".leonardo-state-item .leonardo-state-verb-custom {\n" +
"  background: black;\n" +
"}\n" +
".leonardo-state-item .leonardo-state-verb-post {\n" +
"  background: orange;\n" +
"}\n" +
".leonardo-state-item .leonardo-state-verb-put {\n" +
"  background: blue;\n" +
"}\n" +
".leonardo-state-item .leonardo-state-verb-delete {\n" +
"  background: brown;\n" +
"}\n" +
".leonardo-state-item .leonardo-state-name {\n" +
"  font-size: 0.9rem;\n" +
"  align-self: center;\n" +
"}\n" +
".leonardo-state-item .leonardo-state-url {\n" +
"  flex: 1;\n" +
"  font-size: 0.7rem;\n" +
"  align-self: center;\n" +
"  margin-left: 10px;\n" +
"  color: grey;\n" +
"}\n" +
".leonardo-state-item .leonardo-state-remove {\n" +
"  background: #219161;\n" +
"  color: white;\n" +
"  border: 0;\n" +
"  font-size: 13px;\n" +
"  cursor: pointer;\n" +
"  padding: 5px;\n" +
"  border-radius: 2px;\n" +
"  margin-left: 5px;\n" +
"}\n" +
".leonardo-state-item.leonardo-state-item-hidden {\n" +
"  display: none;\n" +
"}\n" +
".leonardo-state-detail {\n" +
"  position: fixed;\n" +
"  transition: right 200ms ease-out;\n" +
"  top: 0;\n" +
"  bottom: 0;\n" +
"  right: -400px;\n" +
"  width: 400px;\n" +
"  border: 1px solid #ccc;\n" +
"  border-top: none;\n" +
"  background: white;\n" +
"  z-index: 100;\n" +
"  font-size: 13px;\n" +
"  padding: 5px;\n" +
"}\n" +
".leonardo-state-detail div {\n" +
"  margin-top: 10px;\n" +
"}\n" +
".leonardo-state-detail textarea {\n" +
"  display: block;\n" +
"  width: 100%;\n" +
"  height: 200px;\n" +
"}\n" +
".leonardo-state-detail button {\n" +
"  margin-top: 10px;\n" +
"}\n" +
".leonardo-state-detail-recorder {\n" +
"  border: 1px solid #ccc;\n" +
"  border-top: none;\n" +
"  background: white;\n" +
"  z-index: 100;\n" +
"  height: 100%;\n" +
"  font-size: 13px;\n" +
"  padding: 5px;\n" +
"}\n" +
".leonardo-state-detail-recorder div {\n" +
"  margin-top: 10px;\n" +
"}\n" +
".leonardo-state-detail-recorder textarea {\n" +
"  display: block;\n" +
"  width: 400px;\n" +
"  height: 200px;\n" +
"}\n" +
".leonardo-state-detail-recorder button {\n" +
"  margin-top: 10px;\n" +
"}\n" +
".leonardo-recorder {\n" +
"  height: 100%;\n" +
"}\n" +
".leonardo-recorder-list {\n" +
"  height: 100%;\n" +
"  overflow: auto;\n" +
"  position: relative;\n" +
"  top: 0;\n" +
"  bottom: 0;\n" +
"}\n" +
".leonardo-recorder-list .leonardo-recorder-list-container {\n" +
"  text-decoration: none;\n" +
"  padding: 0;\n" +
"  margin: 0;\n" +
"  overflow: auto;\n" +
"}\n" +
".leonardo-recorder-list .leonardo-recorder-list-container .leonardo-recorder-list-item {\n" +
"  display: flex;\n" +
"  border-bottom: 1px solid #ccc;\n" +
"  text-decoration: none;\n" +
"  color: #555;\n" +
"  padding: 5px;\n" +
"  font-size: 13px;\n" +
"  cursor: pointer;\n" +
"}\n" +
".leonardo-recorder-list .leonardo-recorder-list-container .leonardo-recorder-list-item:hover {\n" +
"  background: #ddd !important;\n" +
"}\n" +
".leonardo-recorder-list .leonardo-recorder-list-container .leonardo-recorder-list-item .leonardo-recorder-list-url {\n" +
"  flex-grow: 1;\n" +
"  white-space: nowrap;\n" +
"  overflow: hidden;\n" +
"  text-overflow: ellipsis;\n" +
"  padding-right: 5px;\n" +
"  line-height: 25px;\n" +
"  font-size: 13px;\n" +
"  color: #555;\n" +
"}\n" +
".leonardo-recorder-list .leonardo-recorder-list-container .leonardo-recorder-list-item .leonardo-recorder-list-name {\n" +
"  background: #f08222;\n" +
"  display: inline-block;\n" +
"  padding: 5px 10px;\n" +
"  font-size: 12px;\n" +
"  margin: 0 2px;\n" +
"  color: white;\n" +
"  justify-content: flex-end;\n" +
"  white-space: nowrap;\n" +
"  max-width: 200px;\n" +
"  overflow: hidden;\n" +
"  text-overflow: ellipsis;\n" +
"}\n" +
".leonardo-recorder-list .leonardo-recorder-list-container .leonardo-recorder-list-item .leonardo-recorder-list-name-new {\n" +
"  background: blue;\n" +
"}\n" +
".leonardo-recorder-list .leonardo-recorder-list-container .leonardo-recorder-list-item .leonardo-recorder-list-verb {\n" +
"  margin-right: 10px;\n" +
"  background: #000;\n" +
"  color: #fff;\n" +
"  text-align: center;\n" +
"  width: 60px;\n" +
"  height: 25px;\n" +
"  line-height: 25px;\n" +
"  font-size: 12px;\n" +
"}\n" +
".leonardo-recorder-list .leonardo-recorder-list-container .leonardo-recorder-list-item .leonardo-recorder-list-verb-get {\n" +
"  background: green;\n" +
"}\n" +
".leonardo-recorder-list .leonardo-recorder-list-container .leonardo-recorder-list-item .leonardo-recorder-list-verb-custom {\n" +
"  background: black;\n" +
"}\n" +
".leonardo-recorder-list .leonardo-recorder-list-container .leonardo-recorder-list-item .leonardo-recorder-list-verb-post {\n" +
"  background: orange;\n" +
"}\n" +
".leonardo-recorder-list .leonardo-recorder-list-container .leonardo-recorder-list-item .leonardo-recorder-list-verb-put {\n" +
"  background: blue;\n" +
"}\n" +
".leonardo-recorder-list .leonardo-recorder-list-container .leonardo-recorder-list-item .leonardo-recorder-list-verb-delete {\n" +
"  background: brown;\n" +
"}\n" +
".leonardo-recorder-list .leonardo-recorder-list-container .leonardo-recorder-list-item:nth-child(even) {\n" +
"  background: #F2F2F2;\n" +
"}\n" +
".leonardo-export {\n" +
"  overflow: auto;\n" +
"}\n" +
".leonardo-export .exportButtons {\n" +
"  float: right;\n" +
"  margin-right: 30px;\n" +
"  margin-top: 30px;\n" +
"  border: 2px solid;\n" +
"  border-radius: 6px;\n" +
"  width: 180px;\n" +
"  height: 42px;\n" +
"  font-size: 110%;\n" +
"}\n" +
".leonardo-toggle {\n" +
"  display: none!important;\n" +
"}\n" +
".leonardo-toggle,\n" +
".leonardo-toggle:after,\n" +
".leonardo-toggle:before,\n" +
".leonardo-toggle *,\n" +
".leonardo-toggle *:after,\n" +
".leonardo-toggle *:before,\n" +
".leonardo-toggle + .leonardo-toggle-btn {\n" +
"  box-sizing: border-box;\n" +
"}\n" +
".leonardo-toggle::selection,\n" +
".leonardo-toggle:after::selection,\n" +
".leonardo-toggle:before::selection,\n" +
".leonardo-toggle *::selection,\n" +
".leonardo-toggle *:after::selection,\n" +
".leonardo-toggle *:before::selection,\n" +
".leonardo-toggle + .leonardo-toggle-btn::selection {\n" +
"  background: none;\n" +
"}\n" +
".leonardo-toggle + .leonardo-toggle-btn {\n" +
"  outline: 0;\n" +
"  display: block;\n" +
"  width: 3em;\n" +
"  height: 1.5em;\n" +
"  position: relative;\n" +
"  cursor: pointer;\n" +
"  user-select: none;\n" +
"}\n" +
".leonardo-toggle + .leonardo-toggle-btn:after,\n" +
".leonardo-toggle + .leonardo-toggle-btn:before {\n" +
"  position: relative;\n" +
"  display: block;\n" +
"  content: \"\";\n" +
"  width: 50%;\n" +
"  height: 100%;\n" +
"}\n" +
".leonardo-toggle + .leonardo-toggle-btn:after {\n" +
"  left: 0;\n" +
"}\n" +
".leonardo-toggle + .leonardo-toggle-btn:before {\n" +
"  display: none;\n" +
"}\n" +
".leonardo-toggle:checked + .leonardo-toggle-btn:after {\n" +
"  left: 50%;\n" +
"}\n" +
".leonardo-toggle-ios + .leonardo-toggle-btn {\n" +
"  background: #fbfbfb;\n" +
"  border-radius: 2em;\n" +
"  padding: 2px;\n" +
"  transition: all .4s ease;\n" +
"  border: 1px solid #e8eae9;\n" +
"}\n" +
".leonardo-toggle-ios + .leonardo-toggle-btn:after {\n" +
"  border-radius: 2em;\n" +
"  background: #fbfbfb;\n" +
"  transition: left 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), padding 0.3s ease, margin 0.3s ease;\n" +
"  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.1), 0 4px 0 rgba(0, 0, 0, 0.08);\n" +
"}\n" +
".leonardo-toggle-ios + .leonardo-toggle-btn:hover:after {\n" +
"  will-change: padding;\n" +
"}\n" +
".leonardo-toggle-ios + .leonardo-toggle-btn:active {\n" +
"  box-shadow: inset 0 0 0 2em #e8eae9;\n" +
"}\n" +
".leonardo-toggle-ios + .leonardo-toggle-btn:active:after {\n" +
"  padding-right: .8em;\n" +
"}\n" +
".leonardo-toggle-ios:checked + .leonardo-toggle-btn {\n" +
"  background: #86d993;\n" +
"}\n" +
".leonardo-toggle-ios:checked + .leonardo-toggle-btn:active {\n" +
"  box-shadow: none;\n" +
"}\n" +
".leonardo-toggle-ios:checked + .leonardo-toggle-btn:active:after {\n" +
"  margin-left: -0.8em;\n" +
"}\n" +
".leonardo-button {\n" +
"  background: #219161;\n" +
"  color: white;\n" +
"  border: 0;\n" +
"  font-size: 13px;\n" +
"  cursor: pointer;\n" +
"  padding: 5px 10px;\n" +
"  border-radius: 2px;\n" +
"}"));

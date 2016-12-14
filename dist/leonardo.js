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

},{"./configuration.srv":1,"./polyfills":3,"./sinon.srv":4,"./storage.srv":5,"./ui/ui-root":13}],3:[function(require,module,exports){
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
                request.respond(activeOption.status, { 'Content-Type': 'application/json' }, JSON.stringify(responseData));
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

},{"./utils":28}],5:[function(require,module,exports){
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

},{"./utils":28}],6:[function(require,module,exports){
var ui_events_1 = require('./ui-events');
var ui_utils_1 = require('./ui-utils');
var DOMElement = (function () {
    function DOMElement(viewString) {
        if (viewString === void 0) { viewString = ''; }
        this.viewString = viewString;
        this.eventSubs = [];
        this.bodyEventsSubs = [];
        this.viewNode = ui_utils_1.default.getElementFromHtml(this.viewString);
    }
    DOMElement.prototype.get = function () {
        return this.viewNode;
    };
    DOMElement.prototype.render = function () {
        if (!this.viewNode) {
            return;
        }
        this.viewNode.innerHTML = '';
    };
    DOMElement.prototype.onItem = function (node, eventType, cb) {
        var eventSub = ui_events_1.default.onItem(node, eventType, cb);
        this.eventSubs.push(eventSub);
        return eventSub;
    };
    DOMElement.prototype.clearEventSubs = function () {
        this.clearSetEventSubs(this.eventSubs);
    };
    DOMElement.prototype.clearSetEventSubs = function (list) {
        list.forEach(function (listener) {
            listener.off();
        });
    };
    DOMElement.prototype.destroy = function () {
        this.clearSetEventSubs(this.bodyEventsSubs);
        this.clearEventSubs();
        this.viewNode = null;
    };
    return DOMElement;
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = DOMElement;

},{"./ui-events":12,"./ui-utils":16}],7:[function(require,module,exports){
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var ui_events_1 = require('../ui-events');
var DOMElement_1 = require('../DOMElement');
var DropDown = (function (_super) {
    __extends(DropDown, _super);
    function DropDown(items, activeItem, isDisabled, onSelectItem, onRemoveItem) {
        _super.call(this, "<div class=\"leonardo-dropdown\"></div>");
        this.items = items;
        this.activeItem = activeItem;
        this.isDisabled = isDisabled;
        this.onSelectItem = onSelectItem;
        this.onRemoveItem = onRemoveItem;
        this.optionsState = false;
        this.bodyEventsSubs.push(ui_events_1.default.on('click', this.closeDropDown.bind(this)));
        this.bodyEventsSubs.push(ui_events_1.default.on(ui_events_1.default.CLOSE_DROPDOWNS, this.closeDropDown.bind(this)));
    }
    DropDown.prototype.render = function () {
        _super.prototype.render.call(this);
        this.clearEventSubs();
        this.viewNode.innerHTML = "\n          <div class=\"leonardo-dropdown-selected\" " + this.isDisabledToken() + ">\n            <span class=\"leonardo-dropdown-selected-text\">" + this.activeItem.name + "</span>\n            <span class=\"leonardo-dropdown-selected-arrow\"></span>\n          </div>\n          <div class=\"leonardo-dropdown-options\">\n            <ul class=\"leonardo-dropdown-list\">" + this.getItems().join('') + "</ul>\n          </div>";
        this.onItem(this.viewNode, 'click', this.toggleDropDown.bind(this));
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
            elem.style.borderTop = '1px solid #212121';
            elem.style.borderBottom = 'none';
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
            return "<li class=\"leonardo-dropdown-item\"><span class=\"leonardo-dropdown-item-text\">" + item.name + "</span><span class=\"leonardo-x-btn leonardo-dropdown-item-x\"></span></li>";
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
    return DropDown;
})(DOMElement_1.default);
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = DropDown;

},{"../DOMElement":6,"../ui-events":12}],8:[function(require,module,exports){
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var ui_state_srv_1 = require('../ui-state/ui-state.srv');
var DOMElement_1 = require('../DOMElement');
var HeaderView = (function (_super) {
    __extends(HeaderView, _super);
    function HeaderView(tabList) {
        _super.call(this, "<div class=\"leonardo-header-container\">");
        this.tabList = tabList;
    }
    HeaderView.prototype.render = function () {
        _super.prototype.render.call(this);
        this.viewNode.innerHTML = "<div class=\"leonardo-header-container\">\n        <span class=\"leonardo-header-label \">LEONARDO</span>\n        <span class=\"leonardo-header-tabs\">\n          <ul>\n            " + this.getTabsHtml(0) + "\n          </ul>\n      </span>\n    </div>";
        this.onItem(this.viewNode.querySelector('ul'), 'click', this.onClick.bind(this));
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
})(DOMElement_1.default);
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = HeaderView;

},{"../DOMElement":6,"../ui-state/ui-state.srv":15}],9:[function(require,module,exports){
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var ui_events_1 = require('../ui-events');
var DOMElement_1 = require('../DOMElement');
var Launcher = (function (_super) {
    __extends(Launcher, _super);
    function Launcher() {
        _super.call(this, "<div class=\"leonardo-launcher\"></div>");
        this.eventSubs.push(ui_events_1.default.on('keydown', this.bodyKeypress.bind(this)));
        this.eventSubs.push(ui_events_1.default.on(ui_events_1.default.TOGGLE_ICON, this.toggleLauncher.bind(this)));
        this.onItem(this.viewNode, 'click', this.onClick.bind(this));
    }
    Launcher.prototype.onClick = function () {
        ui_events_1.default.dispatch(ui_events_1.default.TOGGLE_LAUNCHER);
    };
    Launcher.prototype.bodyKeypress = function (e) {
        if (e.shiftKey && e.ctrlKey && e.keyCode === 76) {
            ui_events_1.default.dispatch(ui_events_1.default.TOGGLE_ICON);
        }
    };
    Launcher.prototype.toggleLauncher = function () {
        this.viewNode.style.display = this.viewNode.style.display === 'none' ? 'block' : 'none';
    };
    return Launcher;
})(DOMElement_1.default);
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Launcher;

},{"../DOMElement":6,"../ui-events":12}],10:[function(require,module,exports){
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var ui_utils_1 = require('../ui-utils');
var ui_events_1 = require('../ui-events');
var header_1 = require('../header/header');
var ui_state_data_1 = require('../ui-state/ui-state.data');
var ui_state_srv_1 = require('../ui-state/ui-state.srv');
var views_container_1 = require('./views-container/views-container');
var DOMElement_1 = require('../DOMElement');
var MainView = (function (_super) {
    __extends(MainView, _super);
    function MainView() {
        _super.call(this, "<div class=\"leonardo-main-view leonardo-main-view-hidden\"></div>");
        this.className = 'leonardo-main-view';
        this.hiddenClassName = this.className + "-hidden";
        this.menuState = false;
        this.eventSubs.push(ui_events_1.default.on('keydown', this.onKeyPress.bind(this)));
        this.eventSubs.push(ui_events_1.default.on(ui_events_1.default.TOGGLE_LAUNCHER, this.toggleView.bind(this)));
        this.eventSubs.push(ui_events_1.default.on(ui_events_1.default.ATTACH_MENU_ITEM, this.attachMenu.bind(this)));
        this.eventSubs.push(ui_events_1.default.on(ui_events_1.default.OPEN_MENU, this.openMenu.bind(this)));
        this.eventSubs.push(ui_events_1.default.on(ui_events_1.default.CLOSE_MENU, this.closeMenu.bind(this)));
        this.eventSubs.push(ui_events_1.default.on(ui_events_1.default.CHANGE_VIEW, this.closeMenu.bind(this)));
        this.bodyView = ui_utils_1.default.getElementFromHtml("<div class=\"leonardo-main-view-body\"></div>");
        this.menuView = ui_utils_1.default.getElementFromHtml("<div class=\"leonardo-main-view-menu\"></div>");
        ui_state_srv_1.default.getInstance().init(ui_state_data_1.UIStateList(), ui_state_data_1.UIStateList()[0].name);
        this.headerView = new header_1.default(this.getTabList());
        this.viewsContainer = new views_container_1.default();
    }
    MainView.prototype.toggleView = function () {
        var el = document.querySelector("." + this.className);
        if (!el)
            return;
        if (el.classList.contains(this.hiddenClassName)) {
            el.classList.remove(this.hiddenClassName);
            if (!el.childNodes.length) {
                this.render();
            }
        }
        else {
            this.closeLeo();
        }
    };
    MainView.prototype.render = function () {
        _super.prototype.render.call(this);
        this.menuState = false;
        this.viewNode.appendChild(this.bodyView);
        this.viewNode.appendChild(this.menuView);
        this.bodyView.appendChild(this.headerView.get());
        this.bodyView.appendChild(this.viewsContainer.get());
        this.headerView.render();
        this.viewsContainer.setView(ui_state_srv_1.default.getInstance().getCurViewState());
        this.viewsContainer.render();
    };
    MainView.prototype.attachMenu = function (event) {
        this.menuView.innerHTML = '';
        this.closeMenu(null);
        this.menuView.appendChild(event.detail);
    };
    MainView.prototype.openMenu = function (event) {
        if (this.menuState) {
            return;
        }
        this.menuState = true;
        this.menuView.style.transform = 'translateX(0)';
        this.bodyView.style.width = (this.bodyView.getBoundingClientRect().width - this.menuView.getBoundingClientRect().width) + 'px';
    };
    MainView.prototype.closeMenu = function (event) {
        if (!this.menuState) {
            return;
        }
        this.menuState = false;
        this.menuView.style.transform = 'translateX(100%)';
        this.bodyView.style.width = (this.bodyView.getBoundingClientRect().width + this.menuView.getBoundingClientRect().width) + 'px';
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
})(DOMElement_1.default);
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = MainView;

},{"../DOMElement":6,"../header/header":8,"../ui-events":12,"../ui-state/ui-state.data":14,"../ui-state/ui-state.srv":15,"../ui-utils":16,"./views-container/views-container":11}],11:[function(require,module,exports){
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var ui_events_1 = require('../../ui-events');
var DOMElement_1 = require('../../DOMElement');
var ViewsContainer = (function (_super) {
    __extends(ViewsContainer, _super);
    function ViewsContainer() {
        _super.call(this, "<div id=\"leonardo-views-container\" class=\"leonardo-views-container\">view container</div>");
        this.eventSubs.push(ui_events_1.default.on(ui_events_1.default.CHANGE_VIEW, this.onViewChanged.bind(this)));
    }
    ViewsContainer.prototype.render = function () {
        _super.prototype.render.call(this);
        this.viewNode.appendChild(this.currentViewState.component.get());
        this.currentViewState.component.render();
    };
    ViewsContainer.prototype.setView = function (curView) {
        this.currentViewState = curView;
    };
    ViewsContainer.prototype.onViewChanged = function (event) {
        this.currentViewState.component.destroy();
        this.setView(this.currentViewState = event.detail);
        this.render();
    };
    return ViewsContainer;
})(DOMElement_1.default);
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ViewsContainer;

},{"../../DOMElement":6,"../../ui-events":12}],12:[function(require,module,exports){
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    TOGGLE_LAUNCHER: 'leonardo:toggle:launcher',
    CHANGE_VIEW: 'leonardo:change:view',
    FILTER_STATES: 'leonardo:filter:states',
    CLOSE_DROPDOWNS: 'leonardo:close:dropdowns',
    TOGGLE_STATES: 'leonardo:toggle:states',
    TOGGLE_SCENARIOS: 'leonardo:toggle:scenario',
    ADD_SCENARIO: 'leonardo:add:scenario',
    TOGGLE_STATE: 'leonardo:toggle:states',
    TOGGLE_ICON: 'leonardo:toggle:icon',
    ATTACH_MENU_ITEM: 'leonardo:attach:menu',
    OPEN_MENU: 'leonardo:menu:open',
    CLOSE_MENU: 'leonardo:menu:close',
    on: function (eventName, fn) {
        return this.onItem(document.body, eventName, fn);
    },
    onOnce: function (eventName, fn) {
        this.onItemOnce(document.body, eventName, fn);
    },
    dispatch: function (eventName, details) {
        var event = new CustomEvent(eventName, { detail: details });
        document.body.dispatchEvent(event);
    },
    onItemOnce: function (node, type, callback) {
        node.addEventListener(type, function (e) {
            e.target.removeEventListener(e.type, arguments.callee);
            return callback.apply(callback, arguments);
        });
    },
    onItem: function (node, type, callback) {
        node.addEventListener(type, callback, false);
        return {
            off: function () { return node.removeEventListener(type, callback, false); }
        };
    }
};

},{}],13:[function(require,module,exports){
var launcher_1 = require('./launcher/launcher');
var main_view_1 = require('./main-view/main-view');
var ui_utils_1 = require('./ui-utils');
var ui_events_1 = require('./ui-events');
var UIRoot = (function () {
    function UIRoot() {
        switch (document.readyState) {
            default:
            case 'loading':
                ui_events_1.default.onItemOnce(document, 'DOMContentLoaded', this.init.bind(this));
                break;
            case 'interactive':
            case 'complete':
                this.init();
                break;
        }
    }
    UIRoot.prototype.init = function () {
        this.leonardoApp = ui_utils_1.default.getElementFromHtml("<div leonardo-app></div>");
        this.launcher = new launcher_1.default();
        this.mainView = new main_view_1.default();
        this.leonardoApp.appendChild(this.mainView.get());
        this.leonardoApp.appendChild(this.launcher.get());
        ui_events_1.default.on(ui_events_1.default.TOGGLE_STATES, this.toggleAllStates.bind(this));
        document.body.appendChild(this.leonardoApp);
    };
    UIRoot.prototype.toggleAllStates = function (event) {
        Leonardo.toggleActivateAll(event.detail);
    };
    return UIRoot;
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = UIRoot;

},{"./launcher/launcher":9,"./main-view/main-view":10,"./ui-events":12,"./ui-utils":16}],14:[function(require,module,exports){
var scenarios_1 = require('../views/scenarios/scenarios');
var recorder_1 = require('../views/recorder/recorder');
var export_1 = require('../views/export/export');
var uiList;
function UIStateList() {
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
            component: new recorder_1.default()
        },
        {
            name: 'exported code',
            component: new export_1.default()
        }
    ];
}
exports.UIStateList = UIStateList;

},{"../views/export/export":17,"../views/recorder/recorder":19,"../views/scenarios/scenarios":22}],15:[function(require,module,exports){
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

},{"../ui-events":12}],16:[function(require,module,exports){
var UiUtils = (function () {
    function UiUtils() {
    }
    UiUtils.getElementFromHtml = function (html) {
        var div = document.createElement('div');
        div.innerHTML = html.trim();
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

},{}],17:[function(require,module,exports){
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var DOMElement_1 = require('../../DOMElement');
var Export = (function (_super) {
    __extends(Export, _super);
    function Export() {
        _super.call(this, "<div id=\"leonardo-export\" class=\"leonardo-export\">");
    }
    Export.prototype.render = function () {
        _super.prototype.render.call(this);
        this.viewNode.innerHTML = "\n      <button class=\"leonardo-button leonardo-export-buttons\" data-clipboard-target=\"#leonardo-exported-code\"> Copy To Clipboard</button>\n      <button class=\"leonardo-button leonardo-export-buttons\"> Download Code</button>\n      <div class=\"leonardo-spacer\"></div>\n      <code contenteditable>\n        <div id=\"leonardo-exported-code\" class=\"leonardo-exported-code\">\n            " + JSON.stringify(Leonardo.getStates(), null, 4) + "      \n        </div>\n      </code>\n    </div>";
    };
    Export.prototype.destroy = function () {
    };
    return Export;
})(DOMElement_1.default);
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Export;

},{"../../DOMElement":6}],18:[function(require,module,exports){
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var ui_utils_1 = require('../../../ui-utils');
var ui_events_1 = require('../../../ui-events');
var states_detail_1 = require("../state-detail/states-detail");
var DOMElement_1 = require('../../../DOMElement');
var RecorderList = (function (_super) {
    __extends(RecorderList, _super);
    function RecorderList() {
        _super.call(this, "<div id=\"leonardo-recorder-list\" class=\"leonardo-recorder-list\"></div>");
        this.stateDetail = new states_detail_1.default();
    }
    RecorderList.prototype.render = function () {
        _super.prototype.render.call(this);
        this.clearEventSubs();
        var list = ui_utils_1.default.getElementFromHtml("<ul class=\"leonardo-recorder-list-container\"></ul>");
        this.getStateItems().forEach(function (item) { list.appendChild(item); });
        this.viewNode.appendChild(list);
        ui_events_1.default.dispatch(ui_events_1.default.ATTACH_MENU_ITEM, this.stateDetail.get());
    };
    RecorderList.prototype.getStateItems = function () {
        var _this = this;
        return Leonardo.getRecordedStates().map(function (state) {
            var item = ui_utils_1.default.getElementFromHtml("<li class=\"leonardo-recorder-list-item\">");
            item.innerHTML =
                "<span class=\"leonardo-recorder-list-verb leonardo-recorder-list-verb-" + state.verb.toLowerCase() + "\">" + state.verb + "</span>\n           <span class=\"leonardo-recorder-list-url\">" + state.url.substr(0, 110) + "</span>";
            item.innerHTML += state.recorded ? "<span class=\"leonardo-recorder-list-name\">" + state.name + "</span>" :
                "<span class=\"leonardo-recorder-list-name leonardo-recorder-list-name-new\">New</span>";
            _this.onItem(item, 'click', _this.toggleDetails.bind(_this, state));
            return item;
        });
    };
    RecorderList.prototype.toggleDetails = function (state) {
        state.activeOption = state.options[0];
        this.stateDetail.open(state);
    };
    return RecorderList;
})(DOMElement_1.default);
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = RecorderList;

},{"../../../DOMElement":6,"../../../ui-events":12,"../../../ui-utils":16,"../state-detail/states-detail":20}],19:[function(require,module,exports){
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var recorder_list_1 = require('./recorder-list/recorder-list');
var DOMElement_1 = require('../../DOMElement');
var Recorder = (function (_super) {
    __extends(Recorder, _super);
    function Recorder() {
        _super.call(this, "<div id=\"leonardo-recorder\" class=\"leonardo-recorder\"</div>");
        this.recorderList = new recorder_list_1.default();
    }
    Recorder.prototype.render = function () {
        _super.prototype.render.call(this);
        this.viewNode.appendChild(this.recorderList.get());
        this.recorderList.render();
    };
    Recorder.prototype.destroy = function () {
    };
    return Recorder;
})(DOMElement_1.default);
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Recorder;

},{"../../DOMElement":6,"./recorder-list/recorder-list":18}],20:[function(require,module,exports){
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var ui_events_1 = require('../../../ui-events');
var DOMElement_1 = require('../../../DOMElement');
var RecorderStateDetail = (function (_super) {
    __extends(RecorderStateDetail, _super);
    function RecorderStateDetail() {
        _super.call(this, "<div id=\"leonardo-state-detail\" class=\"leonardo-state-detail-recorder\"></div>");
        this.openState = false;
    }
    RecorderStateDetail.prototype.render = function () {
        _super.prototype.render.call(this);
        var html;
        if (this.curState.recorded) {
            html = "<div class=\"leonardo-states-detail-top\">Add mocked response for <strong>" + this.curState.name + "</strong></div>";
        }
        else {
            html = "<h1 class=\"leonardo-states-detail-top\"/>Add new state</h1>\n              <div class=\"leonardo-states-detail-input\">State name: <input class=\"leonardo-states-detail-state-name\" value=\"" + this.curState.name + "\"/></div>";
        }
        html += "<div class=\"leonardo-states-detail-input\"><div>URL: </div><input class=\"leonardo-states-detail-option-url\" value=\"" + this.curState.url + "\"/></div>\n              <div class=\"leonardo-states-detail-input\"><div>Option name: </div><input class=\"leonardo-states-detail-option-name\" value=\"" + this.curState.options[0].name + "\"/></div>\n              <div class=\"leonardo-states-detail-input\"><div>Status code: </div><input class=\"leonardo-states-detail-status\" value=\"" + this.curState.options[0].status + "\"/></div>\n              <div class=\"leonardo-states-detail-input\"><div>Delay: </div><input class=\"leonardo-states-detail-delay\" value=\"0\"/></div>\n              <br/>\n              <p>Response:</p> <textarea class=\"leonardo-states-detail-json\">" + this.getResString(this.curState.options[0].data) + "</textarea></p>\n              <div class=\"leonardo-states-detail-buttons\">\n                <button class=\"leonardo-button leonardo-states-detail-save\">Save</button>\n                <button class=\"leonardo-button leonardo-states-detail-cancel\" >Cancel</button>\n              </div>";
        this.viewNode.innerHTML = html;
        ui_events_1.default.onItemOnce(this.viewNode.querySelector('.leonardo-states-detail-cancel'), 'click', this.onCancel.bind(this));
        ui_events_1.default.onItemOnce(this.viewNode.querySelector('.leonardo-states-detail-save'), 'click', this.onSave.bind(this));
    };
    RecorderStateDetail.prototype.open = function (state) {
        this.curState = state;
        this.render();
        this.openState = true;
        ui_events_1.default.dispatch(ui_events_1.default.OPEN_MENU);
    };
    RecorderStateDetail.prototype.close = function (state) {
        if (state && this.curState !== state) {
            this.open(state);
            return;
        }
        this.openState = false;
        ui_events_1.default.dispatch(ui_events_1.default.CLOSE_MENU);
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
    RecorderStateDetail.prototype.onCancel = function (event) {
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
})(DOMElement_1.default);
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = RecorderStateDetail;

},{"../../../DOMElement":6,"../../../ui-events":12}],21:[function(require,module,exports){
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var ui_utils_1 = require('../../../ui-utils');
var ui_events_1 = require('../../../ui-events');
var DOMElement_1 = require('../../../DOMElement');
var ScenariosList = (function (_super) {
    __extends(ScenariosList, _super);
    function ScenariosList() {
        _super.call(this, "<div id=\"leonardo-scenarios-list\" class=\"leonardo-scenarios-list\"></div>");
        this.bodyEventsSubs.push(ui_events_1.default.on(ui_events_1.default.ADD_SCENARIO, this.addScenario.bind(this)));
    }
    ScenariosList.prototype.render = function () {
        _super.prototype.render.call(this);
        this.clearEventSubs();
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
        var el = ui_utils_1.default.getElementFromHtml("<li>" + scenario + "</li>");
        this.onItem(el, 'click', this.setScenario.bind(this, scenario, el));
        return el;
    };
    ScenariosList.prototype.setScenario = function (scenario, el) {
        var states = Leonardo.getScenario(scenario);
        ui_events_1.default.dispatch(ui_events_1.default.TOGGLE_STATES, false);
        states.forEach(function (state) {
            ui_events_1.default.dispatch(ui_events_1.default.TOGGLE_STATES + ":" + state.name, state.option);
        });
        Array.prototype.slice.call(this.viewNode.querySelectorAll('li'), 0)
            .forEach(function (li) { return li.classList.remove(ScenariosList.SELECTED_CLASS); });
        el.classList.add(ScenariosList.SELECTED_CLASS);
    };
    ScenariosList.prototype.addScenario = function (event) {
        this.render();
    };
    ScenariosList.SELECTED_CLASS = 'leonardo-selected-scenario';
    return ScenariosList;
})(DOMElement_1.default);
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ScenariosList;

},{"../../../DOMElement":6,"../../../ui-events":12,"../../../ui-utils":16}],22:[function(require,module,exports){
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var states_list_1 = require('./states-list/states-list');
var scenarios_list_1 = require('./scenarios-list/scenarios-list');
var DOMElement_1 = require('../../DOMElement');
var Scenarios = (function (_super) {
    __extends(Scenarios, _super);
    function Scenarios() {
        _super.call(this, "<div id=\"leonardo-scenarios\" class=\"leonardo-scenarios\"></div>");
        this.stateList = new states_list_1.default();
        this.scenariosList = new scenarios_list_1.default();
        this.viewNode.appendChild(this.scenariosList.get());
        this.viewNode.appendChild(this.stateList.get());
    }
    Scenarios.prototype.render = function () {
        this.stateList.render();
        this.scenariosList.render();
    };
    Scenarios.prototype.destroy = function () {
    };
    return Scenarios;
})(DOMElement_1.default);
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Scenarios;

},{"../../DOMElement":6,"./scenarios-list/scenarios-list":21,"./states-list/states-list":27}],23:[function(require,module,exports){
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var ui_events_1 = require('../../../../ui-events');
var DOMElement_1 = require('../../../../DOMElement');
var StateDetail = (function (_super) {
    __extends(StateDetail, _super);
    function StateDetail(onSaveCB, onCancelCB) {
        _super.call(this, "<div id=\"leonardo-state-detail\" class=\"leonardo-state-detail\"></div>");
        this.onSaveCB = onSaveCB;
        this.onCancelCB = onCancelCB;
        this.openState = false;
    }
    StateDetail.prototype.render = function () {
        _super.prototype.render.call(this);
        this.viewNode.innerHTML = "\n      <div class=\"leonardo-states-detail-container\"> \n        <div class=\"leonardo-states-detail-top\">Edit option <strong>" + this.curState.activeOption.name + "</strong>\n        for <strong>" + this.curState.name + "</strong>\n        </div>\n        <div class=\"leonardo-states-detail-input\"><div>Status code: </div><input class=\"leonardo-states-detail-status\" value=\"" + this.curState.activeOption.status + "\"/></div>\n        <div class=\"leonardo-states-detail-input\"><div>Delay: </div><input class=\"leonardo-states-detail-delay\" value=\"" + this.curState.activeOption.delay + "\"/></div>\n        <div>\n          <br/> \n          <p>Response:</p>          \n          <textarea class=\"leonardo-states-detail-json\">" + this.getResString(this.curState.activeOption.data) + "</textarea>\n        </div>\n        <div class=\"leonardo-states-detail-buttons\">\n          <button class=\"leonardo-button leonardo-states-detail-save\">Save</button>\n          <button class=\"leonardo-button leonardo-states-detail-cancel\" >Cancel</button>\n        </div>";
        ui_events_1.default.onItemOnce(this.viewNode.querySelector('.leonardo-states-detail-cancel'), 'click', this.onCancel.bind(this));
        ui_events_1.default.onItemOnce(this.viewNode.querySelector('.leonardo-states-detail-save'), 'click', this.onSave.bind(this));
    };
    StateDetail.prototype.open = function (state) {
        this.curState = state;
        this.render();
        this.openState = true;
        ui_events_1.default.dispatch(ui_events_1.default.OPEN_MENU);
    };
    StateDetail.prototype.close = function (state) {
        if (state && this.curState !== state) {
            this.open(state);
            return;
        }
        this.openState = false;
        ui_events_1.default.dispatch(ui_events_1.default.CLOSE_MENU);
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
})(DOMElement_1.default);
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = StateDetail;

},{"../../../../DOMElement":6,"../../../../ui-events":12}],24:[function(require,module,exports){
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var ui_utils_1 = require('../../../../ui-utils');
var ui_events_1 = require('../../../../ui-events');
var drop_down_1 = require('../../../../drop-down/drop-down');
var DOMElement_1 = require('../../../../DOMElement');
var StateItem = (function (_super) {
    __extends(StateItem, _super);
    function StateItem(state, onRemove) {
        _super.call(this, "<div class=\"leonardo-state-item\"></div>");
        this.state = state;
        this.onRemove = onRemove;
        this.randomID = ui_utils_1.default.guidGenerator();
        this.dropDown = new drop_down_1.default(this.state.options, this.state.activeOption || this.state.options[0], !this.state.active, this.changeActiveOption.bind(this), this.removeOption.bind(this));
        this.bodyEventsSubs.push(ui_events_1.default.on(ui_events_1.default.TOGGLE_STATES, this.toggleAllstate.bind(this)));
        this.bodyEventsSubs.push(ui_events_1.default.on(ui_events_1.default.TOGGLE_STATES + ":" + this.state.name, this.setStateState.bind(this)));
    }
    StateItem.prototype.render = function () {
        _super.prototype.render.call(this);
        this.viewNode.innerHTML = "\n        <input " + this.isChecked() + " id=\"leonardo-state-toggle-" + this.randomID + "\" class=\"leonardo-toggle leonardo-toggle-ios\" type=\"checkbox\"/>\n        <label class=\"leonardo-toggle-btn\" for=\"leonardo-state-toggle-" + this.randomID + "\"></label>\n        <span class=\"leonardo-state-verb leonardo-state-verb-" + this.state.verb.toLowerCase() + "\">" + this.state.verb + "</span>\n        <span class=\"leonardo-state-name\">" + this.state.name + "</span>\n        <span class=\"leonardo-state-url\">" + (this.state.url || '') + "</span>";
        this.viewNode.appendChild(this.dropDown.get());
        this.dropDown.render();
        this.viewNode.appendChild(ui_utils_1.default.getElementFromHtml("<div title=\"Remove State\" class=\"leonardo-x-btn leonardo-state-remove\"></div>"));
        this.onItem(this.viewNode.querySelector(".leonardo-toggle-btn"), 'click', this.toggleState.bind(this));
        ui_events_1.default.onItemOnce(this.viewNode.querySelector(".leonardo-state-remove"), 'click', this.removeState.bind(this));
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
        this.onRemove(this.state.name, this.viewNode);
        Leonardo.removeState(this.state);
        this.destroy();
    };
    StateItem.prototype.removeOption = function (item) {
        Leonardo.removeOption(this.state, item);
    };
    return StateItem;
})(DOMElement_1.default);
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = StateItem;

},{"../../../../DOMElement":6,"../../../../drop-down/drop-down":7,"../../../../ui-events":12,"../../../../ui-utils":16}],25:[function(require,module,exports){
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var ui_events_1 = require('../../../../../ui-events');
var DOMElement_1 = require('../../../../../DOMElement');
var AddScenario = (function (_super) {
    __extends(AddScenario, _super);
    function AddScenario() {
        _super.call(this, "<div id=\"leonardo-add-scenario\" class=\"leonardo-add-scenario\"></div>");
        this.openState = false;
    }
    AddScenario.prototype.render = function () {
        _super.prototype.render.call(this);
        this.clearEventSubs();
        this.viewNode.innerHTML = "\n        <div class=\"leonardo-add-scenario-box\">\n          <span>Scenario Name: </span>\n          <input class=\"leonardo-add-scenario-name\"/>\n          <button class=\"leonardo-button leonardo-add-scenario-save\">Save</button>\n          <button class=\"leonardo-button leonardo-add-scenario-cancel\">Cancel</button>\n        </div>";
        this.onItem(this.viewNode.querySelector('.leonardo-add-scenario-cancel'), 'click', this.onCancel.bind(this));
        this.onItem(this.viewNode.querySelector('.leonardo-add-scenario-save'), 'click', this.onSave.bind(this));
    };
    AddScenario.prototype.open = function () {
        this.render();
        this.openState = true;
        this.viewNode.style.display = 'block';
    };
    AddScenario.prototype.close = function () {
        this.openState = false;
        this.viewNode.style.display = 'none';
    };
    AddScenario.prototype.toggle = function () {
        if (this.openState) {
            this.close();
            return;
        }
        this.open();
    };
    AddScenario.prototype.onCancel = function () {
        this.close();
    };
    AddScenario.prototype.onSave = function () {
        this.close();
        ui_events_1.default.dispatch(ui_events_1.default.ADD_SCENARIO, this.viewNode.querySelector('.leonardo-add-scenario-name').value);
    };
    return AddScenario;
})(DOMElement_1.default);
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = AddScenario;

},{"../../../../../DOMElement":6,"../../../../../ui-events":12}],26:[function(require,module,exports){
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var ui_events_1 = require('../../../../ui-events');
var state_add_scenario_1 = require('./state-add-scenario/state-add-scenario');
var DOMElement_1 = require('../../../../DOMElement');
var StatesBar = (function (_super) {
    __extends(StatesBar, _super);
    function StatesBar() {
        _super.call(this, "<div class=\"leonardo-states-bar\"></div>");
        this.activeAllState = false;
        this.addScenario = new state_add_scenario_1.default();
        this.curSearchData = '';
    }
    StatesBar.prototype.render = function () {
        _super.prototype.render.call(this);
        this.clearEventSubs();
        this.viewNode.innerHTML = "\n        <input value=\"" + this.curSearchData + "\" class=\"leonardo-search-state\" name=\"leonardo-search-state\" type=\"text\" placeholder=\"Search...\" />\n        <div>\n          <span class=\"leonardo-button leonardo-activate-all\">Activate All</span>\n          <span class=\"leonardo-button leonardo-add-scenario-btn\">Add Scenario</span>\n        </div>";
        this.viewNode.appendChild(this.addScenario.get());
        this.addScenario.render();
        this.onItem(this.viewNode.querySelector('.leonardo-search-state'), 'keyup', this.searchStates.bind(this));
        this.onItem(this.viewNode.querySelector('.leonardo-activate-all'), 'click', this.toggleActivateAll.bind(this));
        this.onItem(this.viewNode.querySelector('.leonardo-add-scenario-btn'), 'click', this.onAddScenario.bind(this));
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
        this.viewNode.querySelector('.leonardo-activate-all')['innerHTML'] = this.activeAllState ? 'Deactivate all' : 'Activate all';
    };
    StatesBar.prototype.onAddScenario = function () {
        this.addScenario.open();
    };
    return StatesBar;
})(DOMElement_1.default);
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = StatesBar;

},{"../../../../DOMElement":6,"../../../../ui-events":12,"./state-add-scenario/state-add-scenario":25}],27:[function(require,module,exports){
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var ui_events_1 = require('../../../ui-events');
var state_item_1 = require('./state-item/state-item');
var states_bar_1 = require('./states-bar/states-bar');
var states_detail_1 = require('./state-detail/states-detail');
var DOMElement_1 = require('../../../DOMElement');
var StatesList = (function (_super) {
    __extends(StatesList, _super);
    function StatesList() {
        _super.call(this, "<div id=\"leonardo-states-list\" class=\"leonardo-states-list\"></div>");
        this.statesBar = new states_bar_1.default();
        this.stateDetail = new states_detail_1.default(this.onStateDetailSave.bind(this), this.clearSelected.bind(this));
        this.statesElements = [];
        this.bodyEventSubs = [];
        this.bodyEventSubs.push(ui_events_1.default.on(ui_events_1.default.FILTER_STATES, this.onFilterStates.bind(this)));
        this.bodyEventSubs.push(ui_events_1.default.on(ui_events_1.default.ADD_SCENARIO, this.addScenario.bind(this)));
    }
    StatesList.prototype.render = function () {
        var _this = this;
        _super.prototype.render.call(this);
        this.clearEventSubs();
        this.viewNode.appendChild(this.statesBar.get());
        ui_events_1.default.dispatch(ui_events_1.default.ATTACH_MENU_ITEM, this.stateDetail.get());
        this.statesElements.length = 0;
        Leonardo.getStates()
            .map(function (state) { return new state_item_1.default(state, _this.removeStateByName.bind(_this)); })
            .forEach(function (stateElm) {
            _this.statesElements.push(stateElm);
            _this.viewNode.appendChild(stateElm.get());
            _this.onItem(stateElm.get(), 'click', _this.toggleDetail.bind(_this, stateElm));
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
            return state.getName() !== stateName;
        });
        this.viewNode.removeChild(stateView);
    };
    StatesList.prototype.toggleDetail = function (stateElm, event) {
        event.stopPropagation();
        var open = stateElm.get().classList.contains('leonardo-state-item-detailed');
        this.clearSelected();
        if (!open) {
            stateElm.get().classList.add('leonardo-state-item-detailed');
        }
        this.stateDetail.toggle(stateElm.getState());
    };
    StatesList.prototype.clearSelected = function () {
        this.statesElements.forEach(function (curState) {
            curState.get().classList.remove('leonardo-state-item-detailed');
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
    StatesList.prototype.destroy = function () {
        this.clearSetEventSubs(this.bodyEventSubs);
    };
    return StatesList;
})(DOMElement_1.default);
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = StatesList;

},{"../../../DOMElement":6,"../../../ui-events":12,"./state-detail/states-detail":23,"./state-item/state-item":24,"./states-bar/states-bar":26}],28:[function(require,module,exports){
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvbGVvbmFyZG8vY29uZmlndXJhdGlvbi5zcnYudHMiLCJzcmMvbGVvbmFyZG8vbGVvbmFyZG8udHMiLCJzcmMvbGVvbmFyZG8vcG9seWZpbGxzLnRzIiwic3JjL2xlb25hcmRvL3Npbm9uLnNydi50cyIsInNyYy9sZW9uYXJkby9zdG9yYWdlLnNydi50cyIsInNyYy9sZW9uYXJkby91aS9ET01FbGVtZW50LnRzIiwic3JjL2xlb25hcmRvL3VpL2Ryb3AtZG93bi9kcm9wLWRvd24udHMiLCJzcmMvbGVvbmFyZG8vdWkvaGVhZGVyL2hlYWRlci50cyIsInNyYy9sZW9uYXJkby91aS9sYXVuY2hlci9sYXVuY2hlci50cyIsInNyYy9sZW9uYXJkby91aS9tYWluLXZpZXcvbWFpbi12aWV3LnRzIiwic3JjL2xlb25hcmRvL3VpL21haW4tdmlldy92aWV3cy1jb250YWluZXIvdmlld3MtY29udGFpbmVyLnRzIiwic3JjL2xlb25hcmRvL3VpL3VpLWV2ZW50cy50cyIsInNyYy9sZW9uYXJkby91aS91aS1yb290LnRzIiwic3JjL2xlb25hcmRvL3VpL3VpLXN0YXRlL3VpLXN0YXRlLmRhdGEudHMiLCJzcmMvbGVvbmFyZG8vdWkvdWktc3RhdGUvdWktc3RhdGUuc3J2LnRzIiwic3JjL2xlb25hcmRvL3VpL3VpLXV0aWxzLnRzIiwic3JjL2xlb25hcmRvL3VpL3ZpZXdzL2V4cG9ydC9leHBvcnQudHMiLCJzcmMvbGVvbmFyZG8vdWkvdmlld3MvcmVjb3JkZXIvcmVjb3JkZXItbGlzdC9yZWNvcmRlci1saXN0LnRzIiwic3JjL2xlb25hcmRvL3VpL3ZpZXdzL3JlY29yZGVyL3JlY29yZGVyLnRzIiwic3JjL2xlb25hcmRvL3VpL3ZpZXdzL3JlY29yZGVyL3N0YXRlLWRldGFpbC9zdGF0ZXMtZGV0YWlsLnRzIiwic3JjL2xlb25hcmRvL3VpL3ZpZXdzL3NjZW5hcmlvcy9zY2VuYXJpb3MtbGlzdC9zY2VuYXJpb3MtbGlzdC50cyIsInNyYy9sZW9uYXJkby91aS92aWV3cy9zY2VuYXJpb3Mvc2NlbmFyaW9zLnRzIiwic3JjL2xlb25hcmRvL3VpL3ZpZXdzL3NjZW5hcmlvcy9zdGF0ZXMtbGlzdC9zdGF0ZS1kZXRhaWwvc3RhdGVzLWRldGFpbC50cyIsInNyYy9sZW9uYXJkby91aS92aWV3cy9zY2VuYXJpb3Mvc3RhdGVzLWxpc3Qvc3RhdGUtaXRlbS9zdGF0ZS1pdGVtLnRzIiwic3JjL2xlb25hcmRvL3VpL3ZpZXdzL3NjZW5hcmlvcy9zdGF0ZXMtbGlzdC9zdGF0ZXMtYmFyL3N0YXRlLWFkZC1zY2VuYXJpby9zdGF0ZS1hZGQtc2NlbmFyaW8udHMiLCJzcmMvbGVvbmFyZG8vdWkvdmlld3Mvc2NlbmFyaW9zL3N0YXRlcy1saXN0L3N0YXRlcy1iYXIvc3RhdGVzLWJhci50cyIsInNyYy9sZW9uYXJkby91aS92aWV3cy9zY2VuYXJpb3Mvc3RhdGVzLWxpc3Qvc3RhdGVzLWxpc3QudHMiLCJzcmMvbGVvbmFyZG8vdXRpbHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNFQTtJQUNFLElBQUksT0FBTyxHQUFHLEVBQUUsRUFDZCxVQUFVLEdBQUcsRUFBRSxFQUNmLFlBQVksR0FBRyxFQUFFLEVBQ2pCLFlBQVksR0FBRyxFQUFFLEVBQ2pCLG1CQUFtQixHQUFHLElBQUksV0FBVyxDQUFDLG9CQUFvQixDQUFDLEVBQzNELFdBQVcsR0FBRyxRQUFRLENBQUMsSUFBSSxFQUMzQixlQUFlLEdBQUcsRUFBRSxDQUFDO0lBSXZCLE1BQU0sQ0FBQztRQUNMLFFBQVEsRUFBRSxRQUFRO1FBQ2xCLFNBQVMsRUFBRSxTQUFTO1FBQ3BCLG9CQUFvQixFQUFFLG9CQUFvQjtRQUMxQyxTQUFTLEVBQUUsV0FBVztRQUN0QixlQUFlLEVBQUUsZUFBZTtRQUNoQyxpQkFBaUIsRUFBRSxpQkFBaUI7UUFDcEMsbUJBQW1CLEVBQUUsbUJBQW1CO1FBQ3hDLFdBQVcsRUFBRSxXQUFXO1FBQ3hCLFlBQVksRUFB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QUcsRUFBRSxJQUFJLEVBQUUsTUFBTSxDQUFDLENBQUM7SUFDM0MsQ0FBQztJQUNILFlBQUM7QUFBRCxDQWpDQSxBQWlDQyxJQUFBO0FBakNEO3VCQWlDQyxDQUFBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJsZW9uYXJkby5kLnRzXCIgLz5cbmRlY2xhcmUgdmFyIE9iamVjdDogYW55O1xuZXhwb3J0IGZ1bmN0aW9uIGxlb0NvbmZpZ3VyYXRpb24oKSB7XG4gIHZhciBfc3RhdGVzID0gW10sXG4gICAgX3NjZW5hcmlvcyA9IHt9LFxuICAgIF9yZXF1ZXN0c0xvZyA9IFtdLFxuICAgIF9zYXZlZFN0YXRlcyA9IFtdLFxuICAgIF9zdGF0ZXNDaGFuZ2VkRXZlbnQgPSBuZXcgQ3VzdG9tRXZlbnQoJ2xlb25hcmRvOnNldFN0YXRlcycpLFxuICAgIF9ldmVudHNFbGVtID0gZG9jdW1lbnQuYm9keSxcbiAgICBfanNvbnBDYWxsYmFja3MgPSB7fTtcblxuICAvLyBDb3JlIEFQSVxuICAvLyAtLS0tLS0tLS0tLS0tLS0tXG4gIHJldHVybiB7XG4gICAgYWRkU3RhdGU6IGFkZFN0YXRlLFxuICAgIGFkZFN0YXRlczogYWRkU3RhdGVzLFxuICAgIGdldEFjdGl2ZVN0YXRlT3B0aW9uOiBnZXRBY3RpdmVTdGF0ZU9wdGlvbixcbiAgICBnZXRTdGF0ZXM6IGZldGNoU3RhdGVzLFxuICAgIGRlYWN0aXZhdGVTdGF0ZTogZGVhY3RpdmF0ZVN0YXRlLFxuICAgIHRvZ2dsZUFjdGl2YXRlQWxsOiB0b2dnbGVBY3RpdmF0ZUFsbCxcbiAgICBhY3RpdmF0ZVN0YXRlT3B0aW9uOiBhY3RpdmF0ZVN0YXRlT3B0aW9uLFxuICAgIGFkZFNjZW5hcmlvOiBhZGRTY2VuYXJpbyxcbiAgICBhZGRTY2VuYXJpb3M6IGFkZFNjZW5hcmlvcyxcbiAgICBnZXRTY2VuYXJpbzogZ2V0U2NlbmFyaW8sXG4gICAgZ2V0U2NlbmFyaW9zOiBnZXRTY2VuYXJpb3MsXG4gICAgc2V0QWN0aXZlU2NlbmFyaW86IHNldEFjdGl2ZVNjZW5hcmlvLFxuICAgIGdldFJlY29yZGVkU3RhdGVzOiBnZXRSZWNvcmRlZFN0YXRlcyxcbiAgICBnZXRSZXF1ZXN0c0xvZzogZ2V0UmVxdWVzdHNMb2csXG4gICAgbG9hZFNhdmVkU3RhdGVzOiBsb2FkU2F2ZWRTdGF0ZXMsXG4gICAgYWRkU2F2ZWRTdGF0ZTogYWRkU2F2ZWRTdGF0ZSxcbiAgICBhZGRPclVwZGF0ZVNhdmVkU3RhdGU6IGFkZE9yVXBkYXRlU2F2ZWRTdGF0ZSxcbiAgICBmZXRjaFN0YXRlc0J5VXJsQW5kTWV0aG9kOiBmZXRjaFN0YXRlc0J5VXJsQW5kTWV0aG9kLFxuICAgIHJlbW92ZVN0YXRlOiByZW1vdmVTdGF0ZSxcbiAgICByZW1vdmVPcHRpb246IHJlbW92ZU9wdGlvbixcbiAgICBvblN0YXRlQ2hhbmdlOiBvblNldFN0YXRlcyxcbiAgICBzdGF0ZXNDaGFuZ2VkOiBzdGF0ZXNDaGFuZ2VkLFxuICAgIF9sb2dSZXF1ZXN0OiBsb2dSZXF1ZXN0LFxuICAgIF9qc29ucENhbGxiYWNrczogX2pzb25wQ2FsbGJhY2tzXG5cbiAgfTtcblxuICBmdW5jdGlvbiB1cHNlcnRPcHRpb24oc3RhdGUsIG5hbWUsIGFjdGl2ZSkge1xuICAgIHZhciBzdGF0ZXNTdGF0dXMgPSBMZW9uYXJkby5zdG9yYWdlLmdldFN0YXRlcygpO1xuICAgIHN0YXRlc1N0YXR1c1tzdGF0ZV0gPSB7XG4gICAgICBuYW1lOiBuYW1lIHx8IGZpbmRTdGF0ZU9wdGlvbihzdGF0ZSkubmFtZSxcbiAgICAgIGFjdGl2ZTogYWN0aXZlXG4gICAgfTtcblxuICAgIExlb25hcmRvLnN0b3JhZ2Uuc2V0U3RhdGVzKHN0YXRlc1N0YXR1cyk7XG4gICAgc2V0dXBKc29ucEZvclN0YXRlKHN0YXRlKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHNldHVwSnNvbnBGb3JTdGF0ZShzdGF0ZU5hbWUpIHtcbiAgICBjb25zdCBzdGF0ZSA9IGZldGNoU3RhdGUoc3RhdGVOYW1lKTtcbiAgICBpZiAoc3RhdGUudmVyYiAmJiBzdGF0ZS52ZXJiID09PSAnSlNPTlAnKSB7XG4gICAgICBjb25zdCBjYWxsYmFja05hbWUgPSBnZXRDYWxsYmFja05hbWUoc3RhdGUpO1xuICAgICAgc3RhdGUuYWN0aXZlID8gYWN0aXZlSnNvbnBTdGF0ZShzdGF0ZSwgY2FsbGJhY2tOYW1lKSA6IGRlYWN0aXZhdGVKc29ucFN0YXRlKHN0YXRlLCBjYWxsYmFja05hbWUpO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGFjdGl2ZUpzb25wU3RhdGUoc3RhdGUsIGNhbGxiYWNrTmFtZTogc3RyaW5nKSB7XG4gICAgY29uc3QgZnVuY05hbWUgPSBzdGF0ZS5uYW1lICsgY2FsbGJhY2tOYW1lO1xuICAgIGlmIChfanNvbnBDYWxsYmFja3NbZnVuY05hbWVdKSByZXR1cm47XG4gICAgaWYgKHR5cGVvZiB3aW5kb3dbY2FsbGJhY2tOYW1lXSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgX2pzb25wQ2FsbGJhY2tzW2Z1bmNOYW1lXSA9IHdpbmRvd1tjYWxsYmFja05hbWVdO1xuICAgICAgd2luZG93W2NhbGxiYWNrTmFtZV0gPSBkdW1teUpzb25wQ2FsbGJhY2s7XG4gICAgfVxuICAgIGFjdGl2YXRlSnNvbnBNT2JzZXJ2ZXIoKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGFjdGl2YXRlSnNvbnBNT2JzZXJ2ZXIoKSB7XG4gICAgaWYgKExlb25hcmRvLl9qc29ucE11dGF0aW9uT2JzZXJ2ZXJzKSB7XG4gICAgICBpZiAoIWZldGNoU3RhdGVzKCkuc29tZShzdGF0ZSA9PiBzdGF0ZS52ZXJiID09PSAnSlNPTlAnICYmIHN0YXRlLmFjdGl2ZSkpIHtcbiAgICAgICAgTGVvbmFyZG8uX2pzb25wTXV0YXRpb25PYnNlcnZlcnMuZm9yRWFjaChtdXRhdGlvbk9ic2VydmVyID0+IG11dGF0aW9uT2JzZXJ2ZXIgJiYgbXV0YXRpb25PYnNlcnZlci5kaXNjb25uZWN0KCkpO1xuICAgICAgICBkZWxldGUgTGVvbmFyZG8uX2pzb25wQ2FsbGJhY2tzO1xuICAgICAgICBkZWxldGUgTGVvbmFyZG8uX2pzb25wTXV0YXRpb25PYnNlcnZlcnM7XG4gICAgICB9XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IHRhcmdldHMgPSBbZG9jdW1lbnQuYm9keSwgZG9jdW1lbnQuaGVhZF0uZmlsdGVyKHRhcmdldCA9PiAhIXRhcmdldCk7XG4gICAgY29uc3QgY29uZmlnID0ge2F0dHJpYnV0ZXM6IGZhbHNlLCBjaGlsZExpc3Q6IHRydWUsIGNoYXJhY3RlckRhdGE6IGZhbHNlLCBzdWJ0cmVlOiBmYWxzZX07XG5cbiAgICBMZW9uYXJkby5fanNvbnBNdXRhdGlvbk9ic2VydmVycyA9IHRhcmdldHMubWFwKCh0YXJnZXQpID0+IHtcbiAgICAgIHJldHVybiBuZXcgTXV0YXRpb25PYnNlcnZlcihmdW5jdGlvbiAobXV0YXRpb25zKSB7XG4gICAgICAgIG11dGF0aW9ucy5mb3JFYWNoKGZ1bmN0aW9uIChtdXRhdGlvbjogYW55KSB7XG4gICAgICAgICAgaWYgKG11dGF0aW9uLmFkZGVkTm9kZXMgJiZcbiAgICAgICAgICAgIG11dGF0aW9uLmFkZGVkTm9kZXNbMF0gJiZcbiAgICAgICAgICAgIG11dGF0aW9uLmFkZGVkTm9kZXNbMF0udGFnTmFtZSAmJlxuICAgICAgICAgICAgbXV0YXRpb24uYWRkZWROb2Rlc1swXS50YWdOYW1lLnRvTG93ZXJDYXNlKCkgPT09ICdzY3JpcHQnKSB7XG4gICAgICAgICAgICBjb25zdCBzY3JpcHROb2RlID0gbXV0YXRpb24uYWRkZWROb2Rlc1swXTtcbiAgICAgICAgICAgIGNvbnN0IHN0YXRlID0gZmV0Y2hTdGF0ZXNCeVVybEFuZE1ldGhvZChzY3JpcHROb2RlLnNyYywgJ0pTT05QJyk7XG4gICAgICAgICAgICBpZiAoc3RhdGUgJiYgc3RhdGUuYWN0aXZlKSB7XG4gICAgICAgICAgICAgIGNvbnN0IGNhbGxiYWNrTmFtZSA9IGdldENhbGxiYWNrTmFtZShzdGF0ZSk7XG4gICAgICAgICAgICAgIGNvbnN0IGZ1bmNOYW1lID0gc3RhdGUubmFtZSArIGNhbGxiYWNrTmFtZTtcbiAgICAgICAgICAgICAgaWYgKCFfanNvbnBDYWxsYmFja3NbZnVuY05hbWVdKSB7XG4gICAgICAgICAgICAgICAgYWN0aXZlSnNvbnBTdGF0ZShzdGF0ZSwgY2FsbGJhY2tOYW1lKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBzZXRUaW1lb3V0KF9qc29ucENhbGxiYWNrc1tmdW5jTmFtZV0uYmluZChudWxsLCBzdGF0ZS5hY3RpdmVPcHRpb24uZGF0YSksIHN0YXRlLmFjdGl2ZU9wdGlvbi5kZWxheSB8fCAwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfSk7XG4gICAgdGFyZ2V0cy5mb3JFYWNoKCh0YXJnZXQsIGluZGV4KSA9PiBMZW9uYXJkby5fanNvbnBNdXRhdGlvbk9ic2VydmVyc1tpbmRleF0ub2JzZXJ2ZSh0YXJnZXQsIGNvbmZpZykpO1xuICB9XG5cbiAgZnVuY3Rpb24gZHVtbXlKc29ucENhbGxiYWNrKCkge1xuICB9XG5cbiAgZnVuY3Rpb24gZGVhY3RpdmF0ZUpzb25wU3RhdGUoc3RhdGUsIGNhbGxiYWNrTmFtZSkge1xuICAgIGNvbnN0IGZ1bmNOYW1lID0gc3RhdGUubmFtZSArIGNhbGxiYWNrTmFtZTtcbiAgICBpZiAoX2pzb25wQ2FsbGJhY2tzW2Z1bmNOYW1lXSkge1xuICAgICAgd2luZG93W2NhbGxiYWNrTmFtZV0gPSBfanNvbnBDYWxsYmFja3NbZnVuY05hbWVdO1xuICAgICAgZGVsZXRlIF9qc29ucENhbGxiYWNrc1tmdW5jTmFtZV07XG4gICAgfVxuICAgIGFjdGl2YXRlSnNvbnBNT2JzZXJ2ZXIoKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGdldENhbGxiYWNrTmFtZShzdGF0ZSkge1xuICAgIGlmIChzdGF0ZS5qc29ucENhbGxiYWNrKSB7XG4gICAgICByZXR1cm4gc3RhdGUuanNvbnBDYWxsYmFjaztcbiAgICB9XG5cbiAgICBjb25zdCBwb3N0Zml4ID0gc3RhdGUudXJsLnNwbGl0KCdjYWxsYmFjaz0nKVsxXTtcbiAgICByZXR1cm4gcG9zdGZpeC5zcGxpdCgnJicpWzBdO1xuICB9XG5cbiAgZnVuY3Rpb24gZmV0Y2hTdGF0ZXNCeVVybEFuZE1ldGhvZCh1cmwsIG1ldGhvZCkge1xuICAgIHJldHVybiBmZXRjaFN0YXRlcygpLmZpbHRlcigoc3RhdGUpID0+IHtcbiAgICAgIHJldHVybiBzdGF0ZS51cmwgJiZcbiAgICAgICAgKG5ldyBSZWdFeHAoc3RhdGUudXJsKS50ZXN0KHVybCkgfHwgc3RhdGUudXJsID09PSB1cmwpICYmXG4gICAgICAgIHN0YXRlLnZlcmIudG9Mb3dlckNhc2UoKSA9PT0gbWV0aG9kLnRvTG93ZXJDYXNlKCk7XG5cbiAgICB9KVswXTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGZldGNoU3RhdGVzKCkge1xuICAgIHZhciBhY3RpdmVTdGF0ZXMgPSBMZW9uYXJkby5zdG9yYWdlLmdldFN0YXRlcygpO1xuICAgIHZhciBzdGF0ZXNDb3B5ID0gX3N0YXRlcy5tYXAoZnVuY3Rpb24gKHN0YXRlKSB7XG4gICAgICByZXR1cm4gT2JqZWN0LmFzc2lnbih7fSwgc3RhdGUpO1xuICAgIH0pO1xuXG4gICAgc3RhdGVzQ29weS5mb3JFYWNoKGZ1bmN0aW9uIChzdGF0ZTogYW55KSB7XG4gICAgICB2YXIgb3B0aW9uID0gYWN0aXZlU3RhdGVzW3N0YXRlLm5hbWVdO1xuICAgICAgc3RhdGUuYWN0aXZlID0gISFvcHRpb24gJiYgb3B0aW9uLmFjdGl2ZTtcbiAgICAgIHN0YXRlLmFjdGl2ZU9wdGlvbiA9ICEhb3B0aW9uID9cbiAgICAgICAgc3RhdGUub3B0aW9ucy5maWx0ZXIoZnVuY3Rpb24gKF9vcHRpb24pIHtcbiAgICAgICAgICByZXR1cm4gX29wdGlvbi5uYW1lID09PSBvcHRpb24ubmFtZTtcbiAgICAgICAgfSlbMF0gOiBzdGF0ZS5vcHRpb25zWzBdO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIHN0YXRlc0NvcHk7XG4gIH1cblxuICBmdW5jdGlvbiBmZXRjaFN0YXRlKG5hbWU6IHN0cmluZykge1xuICAgIHJldHVybiBmZXRjaFN0YXRlcygpLmZpbHRlcihmdW5jdGlvbiAoc3RhdGUpIHtcbiAgICAgIHJldHVybiBzdGF0ZS5uYW1lID09PSBuYW1lO1xuICAgIH0pWzBdO1xuICB9XG5cbiAgZnVuY3Rpb24gdG9nZ2xlQWN0aXZhdGVBbGwoZmxhZzogYm9vbGVhbikge1xuICAgIGxldCBzdGF0ZXNTdGF0dXMgPSBmZXRjaFN0YXRlcygpO1xuICAgIGNvbnN0IHN0YXR1c2VzID0gc3RhdGVzU3RhdHVzLnJlZHVjZSgob2JqLCBzKSA9PiB7XG4gICAgICAgIHZhciBvcHRpb25OYW1lID0gcy5hY3RpdmVPcHRpb24gPyBzLmFjdGl2ZU9wdGlvbi5uYW1lIDogcy5vcHRpb25zWzBdLm5hbWU7XG4gICAgICAgIG9ialtzLm5hbWVdID0ge25hbWU6IG9wdGlvbk5hbWUsIGFjdGl2ZTogZmxhZ307XG4gICAgICAgIHJldHVybiBvYmo7XG4gICAgICB9XG4gICAgICAsIHt9KTtcbiAgICBMZW9uYXJkby5zdG9yYWdlLnNldFN0YXRlcyhzdGF0dXNlcyk7XG4gICAgcmV0dXJuIHN0YXRlc1N0YXR1cztcbiAgfVxuXG4gIGZ1bmN0aW9uIGZpbmRTdGF0ZU9wdGlvbihuYW1lKSB7XG4gICAgcmV0dXJuIGZldGNoU3RhdGVzKCkuZmlsdGVyKGZ1bmN0aW9uIChzdGF0ZSkge1xuICAgICAgcmV0dXJuIHN0YXRlLm5hbWUgPT09IG5hbWU7XG4gICAgfSlbMF0uYWN0aXZlT3B0aW9uO1xuICB9XG5cbiAgZnVuY3Rpb24gZ2V0QWN0aXZlU3RhdGVPcHRpb24obmFtZSkge1xuICAgIHZhciBzdGF0ZSA9IGZldGNoU3RhdGVzKCkuZmlsdGVyKGZ1bmN0aW9uIChzdGF0ZSkge1xuICAgICAgcmV0dXJuIHN0YXRlLm5hbWUgPT09IG5hbWVcbiAgICB9KVswXTtcbiAgICByZXR1cm4gKHN0YXRlICYmIHN0YXRlLmFjdGl2ZSAmJiBmaW5kU3RhdGVPcHRpb24obmFtZSkpIHx8IG51bGw7XG4gIH1cblxuICBmdW5jdGlvbiBhZGRTdGF0ZShzdGF0ZU9iaiwgb3ZlcnJpZGVPcHRpb24pIHtcblxuICAgIHN0YXRlT2JqLm9wdGlvbnMuZm9yRWFjaChmdW5jdGlvbiAob3B0aW9uKSB7XG4gICAgICB1cHNlcnQoe1xuICAgICAgICBzdGF0ZTogc3RhdGVPYmoubmFtZSxcbiAgICAgICAgdXJsOiBzdGF0ZU9iai51cmwsXG4gICAgICAgIHZlcmI6IHN0YXRlT2JqLnZlcmIsXG4gICAgICAgIG5hbWU6IG9wdGlvbi5uYW1lLFxuICAgICAgICBmcm9tX2xvY2FsOiAhIW92ZXJyaWRlT3B0aW9uLFxuICAgICAgICBzdGF0dXM6IG9wdGlvbi5zdGF0dXMsXG4gICAgICAgIGRhdGE6IG9wdGlvbi5kYXRhLFxuICAgICAgICBkZWxheTogb3B0aW9uLmRlbGF5XG4gICAgICB9LCBvdmVycmlkZU9wdGlvbik7XG4gICAgfSk7XG5cbiAgICAvLyRyb290U2NvcGUuJGJyb2FkY2FzdCgnbGVvbmFyZG86c3RhdGVDaGFuZ2VkJywgc3RhdGVPYmopO1xuICB9XG5cbiAgZnVuY3Rpb24gYWRkU3RhdGVzKHN0YXRlc0Fyciwgb3ZlcnJpZGVPcHRpb24gPSBmYWxzZSkge1xuICAgIGlmIChBcnJheS5pc0FycmF5KHN0YXRlc0FycikpIHtcbiAgICAgIHN0YXRlc0Fyci5mb3JFYWNoKGZ1bmN0aW9uIChzdGF0ZU9iaikge1xuICAgICAgICBhZGRTdGF0ZShzdGF0ZU9iaiwgb3ZlcnJpZGVPcHRpb24pO1xuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnNvbGUud2FybignbGVvbmFyZG86IGFkZFN0YXRlcyBzaG91bGQgZ2V0IGFuIGFycmF5Jyk7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gdXBzZXJ0KGNvbmZpZ09iaiwgb3ZlcnJpZGVPcHRpb24pIHtcbiAgICB2YXIgdmVyYiA9IGNvbmZpZ09iai52ZXJiIHx8ICdHRVQnLFxuICAgICAgc3RhdGUgPSBjb25maWdPYmouc3RhdGUsXG4gICAgICBuYW1lID0gY29uZmlnT2JqLm5hbWUsXG4gICAgICBmcm9tX2xvY2FsID0gY29uZmlnT2JqLmZyb21fbG9jYWwsXG4gICAgICB1cmwgPSBjb25maWdPYmoudXJsLFxuICAgICAgc3RhdHVzID0gY29uZmlnT2JqLnN0YXR1cyB8fCAyMDAsXG4gICAgICBkYXRhID0gKHR5cGVvZiBjb25maWdPYmouZGF0YSAhPT0gJ3VuZGVmaW5lZCcpID8gY29uZmlnT2JqLmRhdGEgOiB7fSxcbiAgICAgIGRlbGF5ID0gY29uZmlnT2JqLmRlbGF5IHx8IDA7XG4gICAgdmFyIGRlZmF1bHRTdGF0ZSA9IHt9O1xuXG4gICAgdmFyIGRlZmF1bHRPcHRpb24gPSB7fTtcblxuICAgIGlmICghc3RhdGUpIHtcbiAgICAgIGNvbnNvbGUubG9nKFwibGVvbmFyZG86IGNhbm5vdCB1cHNlcnQgLSBzdGF0ZSBpcyBtYW5kYXRvcnlcIik7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdmFyIHN0YXRlSXRlbSA9IF9zdGF0ZXMuZmlsdGVyKGZ1bmN0aW9uIChfc3RhdGUpIHtcbiAgICAgICAgcmV0dXJuIF9zdGF0ZS5uYW1lID09PSBzdGF0ZTtcbiAgICAgIH0pWzBdIHx8IGRlZmF1bHRTdGF0ZTtcblxuICAgIE9iamVjdC5hc3NpZ24oc3RhdGVJdGVtLCB7XG4gICAgICBuYW1lOiBzdGF0ZSxcbiAgICAgIHVybDogdXJsIHx8IHN0YXRlSXRlbS51cmwsXG4gICAgICB2ZXJiOiB2ZXJiLFxuICAgICAgb3B0aW9uczogc3RhdGVJdGVtLm9wdGlvbnMgfHwgW11cbiAgICB9KTtcblxuXG4gICAgaWYgKHN0YXRlSXRlbSA9PT0gZGVmYXVsdFN0YXRlKSB7XG4gICAgICBfc3RhdGVzLnB1c2goc3RhdGVJdGVtKTtcbiAgICB9XG5cbiAgICB2YXIgb3B0aW9uID0gc3RhdGVJdGVtLm9wdGlvbnMuZmlsdGVyKGZ1bmN0aW9uIChfb3B0aW9uKSB7XG4gICAgICByZXR1cm4gX29wdGlvbi5uYW1lID09PSBuYW1lXG4gICAgfSlbMF07XG5cbiAgICBpZiAob3ZlcnJpZGVPcHRpb24gJiYgb3B0aW9uKSB7XG4gICAgICBPYmplY3QuYXNzaWduKG9wdGlvbiwge1xuICAgICAgICBuYW1lOiBuYW1lLFxuICAgICAgICBmcm9tX2xvY2FsOiBmcm9tX2xvY2FsLFxuICAgICAgICBzdGF0dXM6IHN0YXR1cyxcbiAgICAgICAgZGF0YTogZGF0YSxcbiAgICAgICAgZGVsYXk6IGRlbGF5XG4gICAgICB9KTtcbiAgICB9XG4gICAgZWxzZSBpZiAoIW9wdGlvbikge1xuICAgICAgT2JqZWN0LmFzc2lnbihkZWZhdWx0T3B0aW9uLCB7XG4gICAgICAgIG5hbWU6IG5hbWUsXG4gICAgICAgIGZyb21fbG9jYWw6IGZyb21fbG9jYWwsXG4gICAgICAgIHN0YXR1czogc3RhdHVzLFxuICAgICAgICBkYXRhOiBkYXRhLFxuICAgICAgICBkZWxheTogZGVsYXlcbiAgICAgIH0pO1xuXG4gICAgICBzdGF0ZUl0ZW0ub3B0aW9ucy5wdXNoKGRlZmF1bHRPcHRpb24pO1xuICAgIH1cbiAgICBzZXR1cEpzb25wRm9yU3RhdGUoc3RhdGUpO1xuICB9XG5cbiAgZnVuY3Rpb24gYWRkU2NlbmFyaW8oc2NlbmFyaW8sIGZyb21Mb2NhbDogYm9vbGVhbiA9IGZhbHNlKSB7XG4gICAgaWYgKHNjZW5hcmlvICYmIHR5cGVvZiBzY2VuYXJpby5uYW1lID09PSAnc3RyaW5nJykge1xuICAgICAgaWYgKGZyb21Mb2NhbCkge1xuICAgICAgICBjb25zdCBzY2VuYXJpb3MgPSBMZW9uYXJkby5zdG9yYWdlLmdldFNjZW5hcmlvcygpO1xuICAgICAgICBzY2VuYXJpb3MucHVzaChzY2VuYXJpbyk7XG4gICAgICAgIExlb25hcmRvLnN0b3JhZ2Uuc2V0U2NlbmFyaW9zKHNjZW5hcmlvcyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBfc2NlbmFyaW9zW3NjZW5hcmlvLm5hbWVdID0gc2NlbmFyaW87XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93ICdhZGRTY2VuYXJpbyBtZXRob2QgZXhwZWN0cyBhIHNjZW5hcmlvIG9iamVjdCB3aXRoIG5hbWUgcHJvcGVydHknO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGFkZFNjZW5hcmlvcyhzY2VuYXJpb3MpIHtcbiAgICBzY2VuYXJpb3MuZm9yRWFjaCgoc2NlbmFyaW8pID0+IHtcbiAgICAgIGFkZFNjZW5hcmlvKHNjZW5hcmlvKTtcbiAgICB9KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGdldFNjZW5hcmlvcygpIHtcbiAgICBjb25zdCBzY2VuYXJpb3MgPSBMZW9uYXJkby5zdG9yYWdlLmdldFNjZW5hcmlvcygpLm1hcCgoc2NlbmFyaW86IGFueSkgPT4gc2NlbmFyaW8ubmFtZSk7XG4gICAgcmV0dXJuIE9iamVjdC5rZXlzKF9zY2VuYXJpb3MpLmNvbmNhdChzY2VuYXJpb3MpO1xuICB9XG5cbiAgZnVuY3Rpb24gZ2V0U2NlbmFyaW8obmFtZTogc3RyaW5nKSB7XG4gICAgbGV0IHN0YXRlcztcbiAgICBpZiAoX3NjZW5hcmlvc1tuYW1lXSkge1xuICAgICAgc3RhdGVzID0gX3NjZW5hcmlvc1tuYW1lXS5zdGF0ZXM7XG4gICAgfSBlbHNlIHtcbiAgICAgIHN0YXRlcyA9IExlb25hcmRvLnN0b3JhZ2UuZ2V0U2NlbmFyaW9zKClcbiAgICAgICAgLmZpbHRlcigoc2NlbmFyaW8pID0+IHNjZW5hcmlvLm5hbWUgPT09IG5hbWUpWzBdLnN0YXRlcztcbiAgICB9XG5cbiAgICByZXR1cm4gc3RhdGVzO1xuICB9XG5cbiAgZnVuY3Rpb24gc2V0QWN0aXZlU2NlbmFyaW8obmFtZSkge1xuICAgIHZhciBzY2VuYXJpbyA9IGdldFNjZW5hcmlvKG5hbWUpO1xuICAgIGlmICghc2NlbmFyaW8pIHtcbiAgICAgIGNvbnNvbGUud2FybihcImxlb25hcmRvOiBjb3VsZCBub3QgZmluZCBzY2VuYXJpbyBuYW1lZCBcIiArIG5hbWUpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0b2dnbGVBY3RpdmF0ZUFsbChmYWxzZSk7XG4gICAgc2NlbmFyaW8uZm9yRWFjaChmdW5jdGlvbiAoc3RhdGUpIHtcbiAgICAgIHVwc2VydE9wdGlvbihzdGF0ZS5uYW1lLCBzdGF0ZS5vcHRpb24sIHRydWUpO1xuICAgIH0pO1xuICB9XG5cbiAgZnVuY3Rpb24gYWN0aXZhdGVTdGF0ZU9wdGlvbihzdGF0ZSwgb3B0aW9uTmFtZSkge1xuICAgIHVwc2VydE9wdGlvbihzdGF0ZSwgb3B0aW9uTmFtZSwgdHJ1ZSk7XG4gIH1cblxuICBmdW5jdGlvbiBkZWFjdGl2YXRlU3RhdGUoc3RhdGUpIHtcbiAgICB1cHNlcnRPcHRpb24oc3RhdGUsIG51bGwsIGZhbHNlKTtcbiAgfVxuXG4gIGludGVyZmFjZSBJTmV0d29ya1JlcXVlc3Qge1xuICAgIHZlcmI6IEZ1bmN0aW9uO1xuICAgIGRhdGE6IGFueTtcbiAgICB1cmw/OiBzdHJpbmc7XG4gICAgc3RhdHVzOiBzdHJpbmc7XG4gICAgdGltZXN0YW1wOiBEYXRlO1xuICAgIHN0YXRlPzogc3RyaW5nO1xuICB9XG5cbiAgZnVuY3Rpb24gbG9nUmVxdWVzdChtZXRob2QsIHVybCwgZGF0YSwgc3RhdHVzKSB7XG4gICAgaWYgKG1ldGhvZCAmJiB1cmwgJiYgISh1cmwuaW5kZXhPZihcIi5odG1sXCIpID4gMCkpIHtcbiAgICAgIHZhciByZXE6IElOZXR3b3JrUmVxdWVzdCA9IHtcbiAgICAgICAgdmVyYjogbWV0aG9kLFxuICAgICAgICBkYXRhOiBkYXRhLFxuICAgICAgICB1cmw6IHVybC50cmltKCksXG4gICAgICAgIHN0YXR1czogc3RhdHVzLFxuICAgICAgICB0aW1lc3RhbXA6IG5ldyBEYXRlKClcbiAgICAgIH07XG4gICAgICByZXEuc3RhdGUgPSBmZXRjaFN0YXRlc0J5VXJsQW5kTWV0aG9kKHJlcS51cmwsIHJlcS52ZXJiKTtcbiAgICAgIF9yZXF1ZXN0c0xvZy5wdXNoKHJlcSk7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gZ2V0UmVxdWVzdHNMb2coKSB7XG4gICAgcmV0dXJuIF9yZXF1ZXN0c0xvZztcbiAgfVxuXG4gIGZ1bmN0aW9uIGxvYWRTYXZlZFN0YXRlcygpIHtcbiAgICBfc2F2ZWRTdGF0ZXMgPSBMZW9uYXJkby5zdG9yYWdlLmdldFNhdmVkU3RhdGVzKCk7XG4gICAgYWRkU3RhdGVzKF9zYXZlZFN0YXRlcywgdHJ1ZSk7XG4gIH1cblxuICBmdW5jdGlvbiBhZGRTYXZlZFN0YXRlKHN0YXRlKSB7XG4gICAgX3NhdmVkU3RhdGVzLnB1c2goc3RhdGUpO1xuICAgIExlb25hcmRvLnN0b3JhZ2Uuc2V0U2F2ZWRTdGF0ZXMoX3NhdmVkU3RhdGVzKTtcbiAgICBhZGRTdGF0ZShzdGF0ZSwgdHJ1ZSk7XG4gIH1cblxuICBmdW5jdGlvbiBhZGRPclVwZGF0ZVNhdmVkU3RhdGUoc3RhdGUpIHtcbiAgICB2YXIgb3B0aW9uID0gc3RhdGUuYWN0aXZlT3B0aW9uO1xuXG4gICAgLy91cGRhdGUgbG9jYWwgc3RvcmFnZSBzdGF0ZVxuICAgIHZhciBfc2F2ZWRTdGF0ZSA9IF9zYXZlZFN0YXRlcy5maWx0ZXIoZnVuY3Rpb24gKF9zdGF0ZSkge1xuICAgICAgcmV0dXJuIF9zdGF0ZS5uYW1lID09PSBzdGF0ZS5uYW1lO1xuICAgIH0pWzBdO1xuXG4gICAgaWYgKF9zYXZlZFN0YXRlKSB7XG4gICAgICB2YXIgX3NhdmVkT3B0aW9uID0gX3NhdmVkU3RhdGUub3B0aW9ucy5maWx0ZXIoZnVuY3Rpb24gKF9vcHRpb24pIHtcbiAgICAgICAgcmV0dXJuIF9vcHRpb24ubmFtZSA9PT0gb3B0aW9uLm5hbWU7XG4gICAgICB9KVswXTtcblxuICAgICAgaWYgKF9zYXZlZE9wdGlvbikge1xuICAgICAgICBfc2F2ZWRPcHRpb24uc3RhdHVzID0gb3B0aW9uLnN0YXR1cztcbiAgICAgICAgX3NhdmVkT3B0aW9uLmRlbGF5ID0gb3B0aW9uLmRlbGF5O1xuICAgICAgICBfc2F2ZWRPcHRpb24uZGF0YSA9IG9wdGlvbi5kYXRhO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIF9zYXZlZFN0YXRlLm9wdGlvbnMucHVzaChvcHRpb24pO1xuICAgICAgfVxuXG4gICAgICBMZW9uYXJkby5zdG9yYWdlLnNldFNhdmVkU3RhdGVzKF9zYXZlZFN0YXRlcyk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgYWRkU2F2ZWRTdGF0ZShzdGF0ZSk7XG4gICAgfVxuXG4gICAgLy91cGRhdGUgaW4gbWVtb3J5IHN0YXRlXG4gICAgdmFyIF9zdGF0ZSA9IF9zdGF0ZXMuZmlsdGVyKGZ1bmN0aW9uIChfX3N0YXRlKSB7XG4gICAgICByZXR1cm4gX19zdGF0ZS5uYW1lID09PSBzdGF0ZS5uYW1lO1xuICAgIH0pWzBdO1xuXG4gICAgaWYgKF9zdGF0ZSkge1xuICAgICAgdmFyIF9vcHRpb24gPSBfc3RhdGUub3B0aW9ucy5maWx0ZXIoZnVuY3Rpb24gKF9fb3B0aW9uKSB7XG4gICAgICAgIHJldHVybiBfX29wdGlvbi5uYW1lID09PSBvcHRpb24ubmFtZTtcbiAgICAgIH0pWzBdO1xuXG4gICAgICBpZiAoX29wdGlvbikge1xuICAgICAgICBfb3B0aW9uLnN0YXR1cyA9IG9wdGlvbi5zdGF0dXM7XG4gICAgICAgIF9vcHRpb24uZGVsYXkgPSBvcHRpb24uZGVsYXk7XG4gICAgICAgIF9vcHRpb24uZGF0YSA9IG9wdGlvbi5kYXRhO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIF9zdGF0ZS5vcHRpb25zLnB1c2gob3B0aW9uKTtcbiAgICAgIH1cblxuICAgICAgLy8kcm9vdFNjb3BlLiRicm9hZGNhc3QoJ2xlb25hcmRvOnN0YXRlQ2hhbmdlZCcsIF9zdGF0ZSk7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gcmVtb3ZlU3RhdGVCeU5hbWUobmFtZSkge1xuICAgIHZhciBpbmRleCA9IDA7XG4gICAgX3N0YXRlcy5mb3JFYWNoKGZ1bmN0aW9uIChzdGF0ZSwgaSkge1xuICAgICAgaWYgKHN0YXRlLm5hbWUgPT09IG5hbWUpIHtcbiAgICAgICAgaW5kZXggPSBpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgX3N0YXRlcy5zcGxpY2UoaW5kZXgsIDEpO1xuICB9XG5cbiAgZnVuY3Rpb24gcmVtb3ZlU2F2ZWRTdGF0ZUJ5TmFtZShuYW1lKSB7XG4gICAgdmFyIGluZGV4ID0gMDtcbiAgICBfc2F2ZWRTdGF0ZXMuZm9yRWFjaChmdW5jdGlvbiAoc3RhdGUsIGkpIHtcbiAgICAgIGlmIChzdGF0ZS5uYW1lID09PSBuYW1lKSB7XG4gICAgICAgIGluZGV4ID0gaTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIF9zYXZlZFN0YXRlcy5zcGxpY2UoaW5kZXgsIDEpO1xuICB9XG5cbiAgZnVuY3Rpb24gcmVtb3ZlU3RhdGUoc3RhdGUpIHtcblxuICAgIHJlbW92ZVN0YXRlQnlOYW1lKHN0YXRlLm5hbWUpO1xuICAgIHJlbW92ZVNhdmVkU3RhdGVCeU5hbWUoc3RhdGUubmFtZSk7XG5cbiAgICBMZW9uYXJkby5zdG9yYWdlLnNldFNhdmVkU3RhdGVzKF9zYXZlZFN0YXRlcyk7XG4gIH1cblxuICBmdW5jdGlvbiByZW1vdmVTdGF0ZU9wdGlvbkJ5TmFtZShzdGF0ZU5hbWUsIG9wdGlvbk5hbWUpIHtcbiAgICB2YXIgc0luZGV4ID0gbnVsbDtcbiAgICB2YXIgb0luZGV4ID0gbnVsbDtcblxuICAgIF9zdGF0ZXMuZm9yRWFjaChmdW5jdGlvbiAoc3RhdGUsIGkpIHtcbiAgICAgIGlmIChzdGF0ZS5uYW1lID09PSBzdGF0ZU5hbWUpIHtcbiAgICAgICAgc0luZGV4ID0gaTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIGlmIChzSW5kZXggIT09IG51bGwpIHtcbiAgICAgIF9zdGF0ZXNbc0luZGV4XS5vcHRpb25zLmZvckVhY2goZnVuY3Rpb24gKG9wdGlvbiwgaSkge1xuICAgICAgICBpZiAob3B0aW9uLm5hbWUgPT09IG9wdGlvbk5hbWUpIHtcbiAgICAgICAgICBvSW5kZXggPSBpO1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgaWYgKG9JbmRleCAhPT0gbnVsbCkge1xuICAgICAgICBfc3RhdGVzW3NJbmRleF0ub3B0aW9ucy5zcGxpY2Uob0luZGV4LCAxKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiByZW1vdmVTYXZlZFN0YXRlT3B0aW9uQnlOYW1lKHN0YXRlTmFtZSwgb3B0aW9uTmFtZSkge1xuICAgIHZhciBzSW5kZXggPSBudWxsO1xuICAgIHZhciBvSW5kZXggPSBudWxsO1xuXG4gICAgX3NhdmVkU3RhdGVzLmZvckVhY2goZnVuY3Rpb24gKHN0YXRlLCBpKSB7XG4gICAgICBpZiAoc3RhdGUubmFtZSA9PT0gc3RhdGVOYW1lKSB7XG4gICAgICAgIHNJbmRleCA9IGk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBpZiAoc0luZGV4ICE9PSBudWxsKSB7XG4gICAgICBfc2F2ZWRTdGF0ZXNbc0luZGV4XS5vcHRpb25zLmZvckVhY2goZnVuY3Rpb24gKG9wdGlvbiwgaSkge1xuICAgICAgICBpZiAob3B0aW9uLm5hbWUgPT09IG9wdGlvbk5hbWUpIHtcbiAgICAgICAgICBvSW5kZXggPSBpO1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgaWYgKG9JbmRleCAhPT0gbnVsbCkge1xuICAgICAgICBfc2F2ZWRTdGF0ZXNbc0luZGV4XS5vcHRpb25zLnNwbGljZShvSW5kZXgsIDEpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHJlbW92ZU9wdGlvbihzdGF0ZSwgb3B0aW9uKSB7XG4gICAgcmVtb3ZlU3RhdGVPcHRpb25CeU5hbWUoc3RhdGUubmFtZSwgb3B0aW9uLm5hbWUpO1xuICAgIHJlbW92ZVNhdmVkU3RhdGVPcHRpb25CeU5hbWUoc3RhdGUubmFtZSwgb3B0aW9uLm5hbWUpO1xuXG4gICAgTGVvbmFyZG8uc3RvcmFnZS5zZXRTYXZlZFN0YXRlcyhfc2F2ZWRTdGF0ZXMpO1xuXG4gICAgYWN0aXZhdGVTdGF0ZU9wdGlvbihfc3RhdGVzWzBdLm5hbWUsIF9zdGF0ZXNbMF0ub3B0aW9uc1swXS5uYW1lKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGdldFJlY29yZGVkU3RhdGVzKCkge1xuICAgIHZhciByZXF1ZXN0c0FyciA9IF9yZXF1ZXN0c0xvZ1xuICAgICAgLm1hcChmdW5jdGlvbiAocmVxKSB7XG4gICAgICAgIHZhciBzdGF0ZSA9IGZldGNoU3RhdGVzQnlVcmxBbmRNZXRob2QocmVxLnVybCwgcmVxLnZlcmIpO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIG5hbWU6IHN0YXRlID8gc3RhdGUubmFtZSA6IHJlcS52ZXJiICsgXCIgXCIgKyByZXEudXJsLFxuICAgICAgICAgIHZlcmI6IHJlcS52ZXJiLFxuICAgICAgICAgIHVybDogcmVxLnVybCxcbiAgICAgICAgICByZWNvcmRlZDogISFyZXEuc3RhdGUsXG4gICAgICAgICAgb3B0aW9uczogW3tcbiAgICAgICAgICAgIG5hbWU6IHJlcS5zdGF0dXMgPj0gMjAwICYmIHJlcS5zdGF0dXMgPCAzMDAgPyAnU3VjY2VzcycgOiAnRmFpbHVyZScsXG4gICAgICAgICAgICBzdGF0dXM6IHJlcS5zdGF0dXMsXG4gICAgICAgICAgICBkYXRhOiByZXEuZGF0YVxuICAgICAgICAgIH1dXG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIHJldHVybiByZXF1ZXN0c0FycjtcbiAgfVxuXG4gIGZ1bmN0aW9uIG9uU2V0U3RhdGVzKGZuKSB7XG4gICAgX2V2ZW50c0VsZW0gJiYgX2V2ZW50c0VsZW0uYWRkRXZlbnRMaXN0ZW5lcignbGVvbmFyZG86c2V0U3RhdGVzJywgZm4sIGZhbHNlKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHN0YXRlc0NoYW5nZWQoKSB7XG4gICAgX2V2ZW50c0VsZW0gJiYgX2V2ZW50c0VsZW0uZGlzcGF0Y2hFdmVudChfc3RhdGVzQ2hhbmdlZEV2ZW50KTtcbiAgfVxufVxuIiwiaW1wb3J0IHtsZW9Db25maWd1cmF0aW9ufSBmcm9tICcuL2NvbmZpZ3VyYXRpb24uc3J2JztcbmltcG9ydCB7U3RvcmFnZX0gZnJvbSAnLi9zdG9yYWdlLnNydic7XG5pbXBvcnQge3BvbGlmeWxsc30gZnJvbSAnLi9wb2x5ZmlsbHMnO1xuaW1wb3J0IHtTaW5vbn0gZnJvbSAnLi9zaW5vbi5zcnYnO1xuaW1wb3J0IFVJUm9vdCBmcm9tICcuL3VpL3VpLXJvb3QnO1xuXG5kZWNsYXJlIGNvbnN0IHdpbmRvdztcbmRlY2xhcmUgY29uc3QgT2JqZWN0O1xuXG5wb2xpZnlsbHMoKTtcblxuLy9Jbml0IENvbmZpZ3VyYXRpb25cbndpbmRvdy5MZW9uYXJkbyA9IHdpbmRvdy5MZW9uYXJkbyB8fCB7fTtcbmNvbnN0IGNvbmZpZ3VyYXRpb24gPSBsZW9Db25maWd1cmF0aW9uKCk7XG5jb25zdCBzdG9yYWdlID0gbmV3IFN0b3JhZ2UoKTtcbk9iamVjdC5hc3NpZ24od2luZG93Lkxlb25hcmRvIHx8IHt9LCBjb25maWd1cmF0aW9uLCB7c3RvcmFnZX0pO1xuTGVvbmFyZG8ubG9hZFNhdmVkU3RhdGVzKCk7XG5cbi8vIEluaXQgU2lub25cbm5ldyBTaW5vbigpO1xuXG4vL0luaXQgVUlcbm5ldyBVSVJvb3QoKTtcbiIsImV4cG9ydCBmdW5jdGlvbiBwb2xpZnlsbHMoKSB7XG5cbiAgLy8gQ3VzdG9tRXZlbnRcbiAgKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBDdXN0b21FdmVudChldmVudCwgcGFyYW1zKSB7XG4gICAgICBwYXJhbXMgPSBwYXJhbXMgfHwge2J1YmJsZXM6IGZhbHNlLCBjYW5jZWxhYmxlOiBmYWxzZSwgZGV0YWlsOiB1bmRlZmluZWR9O1xuICAgICAgdmFyIGV2dCA9IGRvY3VtZW50LmNyZWF0ZUV2ZW50KCdDdXN0b21FdmVudCcpO1xuICAgICAgZXZ0LmluaXRDdXN0b21FdmVudChldmVudCwgcGFyYW1zLmJ1YmJsZXMsIHBhcmFtcy5jYW5jZWxhYmxlLCBwYXJhbXMuZGV0YWlsKTtcbiAgICAgIHJldHVybiBldnQ7XG4gICAgfVxuXG4gICAgQ3VzdG9tRXZlbnQucHJvdG90eXBlID0gd2luZG93WydFdmVudCddLnByb3RvdHlwZTtcblxuICAgIHdpbmRvd1snQ3VzdG9tRXZlbnQnXSA9IEN1c3RvbUV2ZW50O1xuICB9KSgpO1xuXG4gIC8vIE9iamVjdC5hc3NpZ25cbiAgKGZ1bmN0aW9uICgpIHtcbiAgICBpZiAodHlwZW9mICg8YW55Pk9iamVjdCkuYXNzaWduICE9ICdmdW5jdGlvbicpIHtcbiAgICAgICg8YW55Pk9iamVjdCkuYXNzaWduID0gZnVuY3Rpb24gKHRhcmdldCkge1xuICAgICAgICAndXNlIHN0cmljdCc7XG4gICAgICAgIGlmICh0YXJnZXQgPT0gbnVsbCkge1xuICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0Nhbm5vdCBjb252ZXJ0IHVuZGVmaW5lZCBvciBudWxsIHRvIG9iamVjdCcpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGFyZ2V0ID0gT2JqZWN0KHRhcmdldCk7XG4gICAgICAgIGZvciAodmFyIGluZGV4ID0gMTsgaW5kZXggPCBhcmd1bWVudHMubGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICAgICAgdmFyIHNvdXJjZSA9IGFyZ3VtZW50c1tpbmRleF07XG4gICAgICAgICAgaWYgKHNvdXJjZSAhPSBudWxsKSB7XG4gICAgICAgICAgICBmb3IgKHZhciBrZXkgaW4gc291cmNlKSB7XG4gICAgICAgICAgICAgIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoc291cmNlLCBrZXkpKSB7XG4gICAgICAgICAgICAgICAgdGFyZ2V0W2tleV0gPSBzb3VyY2Vba2V5XTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGFyZ2V0O1xuICAgICAgfTtcbiAgICB9XG5cbiAgfSkoKVxufVxuXG4iLCJpbXBvcnQgVXRpbHMgZnJvbSAnLi91dGlscyc7XG5cbmRlY2xhcmUgdmFyIHNpbm9uO1xuXG5leHBvcnQgY2xhc3MgU2lub24ge1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuaW5pdCgpO1xuICB9XG5cbiAgcHJpdmF0ZSBpbml0KCkge1xuICAgIHZhciBzZXJ2ZXIgPSBzaW5vbi5mYWtlU2VydmVyLmNyZWF0ZSh7XG4gICAgICBhdXRvUmVzcG9uZDogdHJ1ZSxcbiAgICAgIGF1dG9SZXNwb25kQWZ0ZXI6IDEwXG4gICAgfSk7XG5cbiAgICBzaW5vbi5GYWtlWE1MSHR0cFJlcXVlc3QudXNlRmlsdGVycyA9IHRydWU7XG4gICAgc2lub24uRmFrZVhNTEh0dHBSZXF1ZXN0LmFkZEZpbHRlcihmdW5jdGlvbiAobWV0aG9kLCB1cmwpIHtcbiAgICAgIGlmICh1cmwuaW5kZXhPZignLmh0bWwnKSA+IDAgJiYgdXJsLmluZGV4T2YoJ3RlbXBsYXRlJykgPj0gMCkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cbiAgICAgIHZhciBzdGF0ZSA9IExlb25hcmRvLmZldGNoU3RhdGVzQnlVcmxBbmRNZXRob2QodXJsLCBtZXRob2QpO1xuICAgICAgcmV0dXJuICEoc3RhdGUgJiYgc3RhdGUuYWN0aXZlKTtcbiAgICB9KTtcblxuICAgIHNpbm9uLkZha2VYTUxIdHRwUmVxdWVzdC5vblJlc3BvbnNlRW5kID0gZnVuY3Rpb24gKHhocikge1xuICAgICAgdmFyIHJlcyA9IHhoci5yZXNwb25zZTtcbiAgICAgIHRyeSB7XG4gICAgICAgIHJlcyA9IEpTT04ucGFyc2UoeGhyLnJlc3BvbnNlKTtcbiAgICAgIH1cbiAgICAgIGNhdGNoIChlKSB7XG4gICAgICB9XG4gICAgICBMZW9uYXJkby5fbG9nUmVxdWVzdCh4aHIubWV0aG9kLCB4aHIudXJsLCByZXMsIHhoci5zdGF0dXMpO1xuICAgIH07XG5cbiAgICBzZXJ2ZXIucmVzcG9uZFdpdGgoZnVuY3Rpb24gKHJlcXVlc3QpIHtcbiAgICAgIHZhciBzdGF0ZSA9IExlb25hcmRvLmZldGNoU3RhdGVzQnlVcmxBbmRNZXRob2QocmVxdWVzdC51cmwsIHJlcXVlc3QubWV0aG9kKSxcbiAgICAgICAgYWN0aXZlT3B0aW9uID0gTGVvbmFyZG8uZ2V0QWN0aXZlU3RhdGVPcHRpb24oc3RhdGUubmFtZSk7XG5cbiAgICAgIGlmICghIWFjdGl2ZU9wdGlvbikge1xuICAgICAgICB2YXIgcmVzcG9uc2VEYXRhID0gVXRpbHMuaXNGdW5jdGlvbihhY3RpdmVPcHRpb24uZGF0YSkgPyBhY3RpdmVPcHRpb24uZGF0YShyZXF1ZXN0KSA6IGFjdGl2ZU9wdGlvbi5kYXRhO1xuICAgICAgICByZXF1ZXN0LnJlc3BvbmQoYWN0aXZlT3B0aW9uLnN0YXR1cywgeydDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbid9LCBKU09OLnN0cmluZ2lmeShyZXNwb25zZURhdGEpKTtcbiAgICAgICAgTGVvbmFyZG8uX2xvZ1JlcXVlc3QocmVxdWVzdC5tZXRob2QsIHJlcXVlc3QudXJsLCByZXNwb25zZURhdGEsIGFjdGl2ZU9wdGlvbi5zdGF0dXMpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc29sZS53YXJuKCdjb3VsZCBub3QgZmluZCBhIHN0YXRlIGZvciB0aGUgZm9sbG93aW5nIHJlcXVlc3QnLCByZXF1ZXN0KTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxufVxuIiwiaW1wb3J0IFV0aWxzIGZyb20gJy4vdXRpbHMnO1xuXG5kZWNsYXJlIGNvbnN0IHdpbmRvdzogYW55O1xuXG5leHBvcnQgY2xhc3MgU3RvcmFnZSB7XG4gIHByaXZhdGUgQVBQX1BSRUZJWDtcbiAgcHJpdmF0ZSBTVEFURVNfU1RPUkVfS0VZO1xuICBwcml2YXRlIFNDRU5BUklPU19TVE9SRV9LRVk7XG4gIHByaXZhdGUgU0FWRURfU1RBVEVTX0tFWTtcbiAgcHJpdmF0ZSBQT1NJVElPTl9LRVk7XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5BUFBfUFJFRklYID0gTGVvbmFyZG8uQVBQX1BSRUZJWCB8fCAnJztcbiAgICB0aGlzLlNUQVRFU19TVE9SRV9LRVkgPSBgJHt0aGlzLkFQUF9QUkVGSVh9bGVvbmFyZG8tc3RhdGVzYDtcbiAgICB0aGlzLlNBVkVEX1NUQVRFU19LRVkgPSBgJHt0aGlzLkFQUF9QUkVGSVh9bGVvbmFyZG8tdW5yZWdpc3RlcmVkLXN0YXRlc2A7XG4gICAgdGhpcy5TQ0VOQVJJT1NfU1RPUkVfS0VZID0gYCR7dGhpcy5BUFBfUFJFRklYfWxlb25hcmRvLXNjZW5hcmlvc2A7XG4gICAgdGhpcy5QT1NJVElPTl9LRVkgPSBgJHt0aGlzLkFQUF9QUkVGSVh9bGVvbmFyZG8tcG9zaXRpb25gO1xuICB9XG5cbiAgX2dldEl0ZW0oa2V5KSB7XG4gICAgdmFyIGl0ZW0gPSB3aW5kb3cubG9jYWxTdG9yYWdlLmdldEl0ZW0oa2V5KTtcbiAgICBpZiAoIWl0ZW0pIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICByZXR1cm4gVXRpbHMuZnJvbUpzb24oaXRlbSk7XG4gIH1cblxuICBfc2V0SXRlbShrZXksIGRhdGEpIHtcbiAgICB3aW5kb3cubG9jYWxTdG9yYWdlLnNldEl0ZW0oa2V5LCBVdGlscy50b0pzb24oZGF0YSkpO1xuICB9XG5cbiAgZ2V0U3RhdGVzKCkge1xuICAgIHJldHVybiB0aGlzLl9nZXRJdGVtKHRoaXMuU1RBVEVTX1NUT1JFX0tFWSkgfHwge307XG4gIH1cblxuICBnZXRTY2VuYXJpb3MoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2dldEl0ZW0odGhpcy5TQ0VOQVJJT1NfU1RPUkVfS0VZKSB8fCBbXTtcbiAgfVxuXG4gIHNldFN0YXRlcyhzdGF0ZXMpIHtcbiAgICB0aGlzLl9zZXRJdGVtKHRoaXMuU1RBVEVTX1NUT1JFX0tFWSwgc3RhdGVzKTtcbiAgICBMZW9uYXJkby5zdGF0ZXNDaGFuZ2VkKCk7XG4gIH1cblxuICBzZXRTY2VuYXJpb3Moc2NlbmFyaW9zKSB7XG4gICAgdGhpcy5fc2V0SXRlbSh0aGlzLlNDRU5BUklPU19TVE9SRV9LRVksIHNjZW5hcmlvcyk7XG4gIH1cblxuICBnZXRTYXZlZFN0YXRlcygpIHtcbiAgICB2YXIgc3RhdGVzID0gdGhpcy5fZ2V0SXRlbSh0aGlzLlNBVkVEX1NUQVRFU19LRVkpIHx8IFtdO1xuICAgIHN0YXRlcy5mb3JFYWNoKGZ1bmN0aW9uIChzdGF0ZSkge1xuICAgICAgc3RhdGUub3B0aW9ucy5mb3JFYWNoKG9wdGlvbiA9PiB7XG4gICAgICAgIG9wdGlvbi5mcm9tX2xvY2FsID0gdHJ1ZTtcbiAgICAgIH0pXG4gICAgfSk7XG4gICAgcmV0dXJuIHN0YXRlcztcbiAgfVxuXG4gIHNldFNhdmVkU3RhdGVzKHN0YXRlcykge1xuICAgIHRoaXMuX3NldEl0ZW0odGhpcy5TQVZFRF9TVEFURVNfS0VZLCBzdGF0ZXMpO1xuICB9XG5cbiAgc2V0U2F2ZWRQb3NpdGlvbihwb3NpdGlvbikge1xuICAgIGlmICghcG9zaXRpb24pIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5fc2V0SXRlbSh0aGlzLlBPU0lUSU9OX0tFWSwgcG9zaXRpb24pO1xuICB9XG5cbiAgZ2V0U2F2ZWRQb3NpdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5fZ2V0SXRlbSh0aGlzLlBPU0lUSU9OX0tFWSk7XG4gIH1cbn1cbiIsImltcG9ydCB7RXZlbnRTdWJ9IGZyb20gJy4vdWktZXZlbnRzJztcbmltcG9ydCBFdmVudHMgZnJvbSAnLi91aS1ldmVudHMnO1xuaW1wb3J0IFVpVXRpbHMgZnJvbSAnLi91aS11dGlscyc7XG5leHBvcnQgZGVmYXVsdCBjbGFzcyBET01FbGVtZW50IHtcbiAgcHJvdGVjdGVkIHZpZXdOb2RlOiBhbnk7XG4gIHByb3RlY3RlZCBldmVudFN1YnM6IEFycmF5PEV2ZW50U3ViPiA9IFtdO1xuICBwcm90ZWN0ZWQgYm9keUV2ZW50c1N1YnM6QXJyYXk8RXZlbnRTdWI+ID0gW107XG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgdmlld1N0cmluZzogc3RyaW5nID0gJycpIHtcbiAgICB0aGlzLnZpZXdOb2RlID0gVWlVdGlscy5nZXRFbGVtZW50RnJvbUh0bWwodGhpcy52aWV3U3RyaW5nKTtcbiAgfVxuXG4gIGdldCgpOiBIVE1MRWxlbWVudCB7XG4gICAgcmV0dXJuIHRoaXMudmlld05vZGU7XG4gIH1cblxuICBwcm90ZWN0ZWQgcmVuZGVyKCl7XG4gICAgaWYoIXRoaXMudmlld05vZGUpe1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLnZpZXdOb2RlLmlubmVySFRNTCA9ICcnO1xuICB9XG5cbiAgcHJvdGVjdGVkIG9uSXRlbShub2RlOiBIVE1MRWxlbWVudCwgZXZlbnRUeXBlOiBzdHJpbmcsIGNiOiBFdmVudExpc3RlbmVyKTogRXZlbnRTdWIge1xuICAgIGNvbnN0IGV2ZW50U3ViOiBFdmVudFN1YiA9ICBFdmVudHMub25JdGVtKG5vZGUsIGV2ZW50VHlwZSwgY2IpO1xuICAgIHRoaXMuZXZlbnRTdWJzLnB1c2goZXZlbnRTdWIpO1xuICAgIHJldHVybiBldmVudFN1YjtcbiAgfVxuXG5cbiAgcHJvdGVjdGVkIGNsZWFyRXZlbnRTdWJzKCkge1xuICAgIHRoaXMuY2xlYXJTZXRFdmVudFN1YnModGhpcy5ldmVudFN1YnMpO1xuICB9XG5cbiAgcHJvdGVjdGVkIGNsZWFyU2V0RXZlbnRTdWJzKGxpc3Q6IEFycmF5PEV2ZW50U3ViPikge1xuICAgIGxpc3QuZm9yRWFjaCgobGlzdGVuZXI6IEV2ZW50U3ViKT0+IHtcbiAgICAgIGxpc3RlbmVyLm9mZigpO1xuICAgIH0pXG4gIH1cblxuICBkZXN0cm95KCkge1xuICAgIHRoaXMuY2xlYXJTZXRFdmVudFN1YnModGhpcy5ib2R5RXZlbnRzU3Vicyk7XG4gICAgdGhpcy5jbGVhckV2ZW50U3VicygpO1xuICAgIHRoaXMudmlld05vZGUgPSBudWxsO1xuICB9XG59XG4iLCJpbXBvcnQgRXZlbnRzIGZyb20gJy4uL3VpLWV2ZW50cyc7XG5pbXBvcnQgRE9NRWxlbWVudCBmcm9tICcuLi9ET01FbGVtZW50JztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRHJvcERvd24gZXh0ZW5kcyBET01FbGVtZW50e1xuXG4gIG9wdGlvbnNTdGF0ZTogYm9vbGVhbiA9IGZhbHNlO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgaXRlbXMsXG4gICAgICAgICAgICAgIHByaXZhdGUgYWN0aXZlSXRlbSxcbiAgICAgICAgICAgICAgcHJpdmF0ZSBpc0Rpc2FibGVkOiBib29sZWFuLFxuICAgICAgICAgICAgICBwcml2YXRlIG9uU2VsZWN0SXRlbTogRnVuY3Rpb24sXG4gICAgICAgICAgICAgIHByaXZhdGUgb25SZW1vdmVJdGVtOiBGdW5jdGlvbikge1xuICAgIHN1cGVyKGA8ZGl2IGNsYXNzPVwibGVvbmFyZG8tZHJvcGRvd25cIj48L2Rpdj5gKTtcbiAgICB0aGlzLmJvZHlFdmVudHNTdWJzLnB1c2goRXZlbnRzLm9uKCdjbGljaycsIHRoaXMuY2xvc2VEcm9wRG93bi5iaW5kKHRoaXMpKSk7XG4gICAgdGhpcy5ib2R5RXZlbnRzU3Vicy5wdXNoKEV2ZW50cy5vbihFdmVudHMuQ0xPU0VfRFJPUERPV05TLCB0aGlzLmNsb3NlRHJvcERvd24uYmluZCh0aGlzKSkpO1xuICB9XG5cbiAgcmVuZGVyKCkge1xuICAgIHN1cGVyLnJlbmRlcigpO1xuICAgIHRoaXMuY2xlYXJFdmVudFN1YnMoKTtcbiAgICB0aGlzLnZpZXdOb2RlLmlubmVySFRNTCA9IGBcbiAgICAgICAgICA8ZGl2IGNsYXNzPVwibGVvbmFyZG8tZHJvcGRvd24tc2VsZWN0ZWRcIiAke3RoaXMuaXNEaXNhYmxlZFRva2VuKCl9PlxuICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJsZW9uYXJkby1kcm9wZG93bi1zZWxlY3RlZC10ZXh0XCI+JHt0aGlzLmFjdGl2ZUl0ZW0ubmFtZX08L3NwYW4+XG4gICAgICAgICAgICA8c3BhbiBjbGFzcz1cImxlb25hcmRvLWRyb3Bkb3duLXNlbGVjdGVkLWFycm93XCI+PC9zcGFuPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJsZW9uYXJkby1kcm9wZG93bi1vcHRpb25zXCI+XG4gICAgICAgICAgICA8dWwgY2xhc3M9XCJsZW9uYXJkby1kcm9wZG93bi1saXN0XCI+JHt0aGlzLmdldEl0ZW1zKCkuam9pbignJyl9PC91bD5cbiAgICAgICAgICA8L2Rpdj5gO1xuICAgIHRoaXMub25JdGVtKHRoaXMudmlld05vZGUsICdjbGljaycsIHRoaXMudG9nZ2xlRHJvcERvd24uYmluZCh0aGlzKSk7XG5cbiAgfVxuXG4gIGRpc2FibGVEcm9wRG93bigpIHtcbiAgICB0aGlzLmlzRGlzYWJsZWQgPSB0cnVlO1xuICAgIHRoaXMudmlld05vZGUucXVlcnlTZWxlY3RvcihgLmxlb25hcmRvLWRyb3Bkb3duLXNlbGVjdGVkYCkuc2V0QXR0cmlidXRlKCdkaXNhYmxlZCcsICdkaXNhYmxlZCcpO1xuICB9XG5cbiAgZW5hYmxlRHJvcERvd24oKSB7XG4gICAgdGhpcy5pc0Rpc2FibGVkID0gZmFsc2U7XG4gICAgdGhpcy52aWV3Tm9kZS5xdWVyeVNlbGVjdG9yKGAubGVvbmFyZG8tZHJvcGRvd24tc2VsZWN0ZWRgKS5yZW1vdmVBdHRyaWJ1dGUoJ2Rpc2FibGVkJyk7XG4gIH1cblxuICB0b2dnbGVEcm9wRG93bihldmVudDogTW91c2VFdmVudCkge1xuICAgIGlmICh0aGlzLmlzRGlzYWJsZWQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKGV2ZW50ICYmIGV2ZW50LnRhcmdldCkge1xuICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgfVxuICAgIGlmIChldmVudC50YXJnZXRbJ2NsYXNzTGlzdCddLmNvbnRhaW5zKCdsZW9uYXJkby1kcm9wZG93bi1pdGVtJykpIHtcbiAgICAgIHRoaXMuc2V0QWN0aXZlSXRlbShldmVudC50YXJnZXRbJ3F1ZXJ5U2VsZWN0b3InXSgnLmxlb25hcmRvLWRyb3Bkb3duLWl0ZW0tdGV4dCcpLmlubmVySFRNTCk7XG4gICAgfVxuICAgIGVsc2UgaWYgKGV2ZW50LnRhcmdldFsnY2xhc3NMaXN0J10uY29udGFpbnMoJ2xlb25hcmRvLWRyb3Bkb3duLWl0ZW0tdGV4dCcpKSB7XG4gICAgICB0aGlzLnNldEFjdGl2ZUl0ZW0oZXZlbnQudGFyZ2V0Wydpbm5lckhUTUwnXSk7XG4gICAgfVxuICAgIGVsc2UgaWYgKGV2ZW50LnRhcmdldFsnY2xhc3NMaXN0J10uY29udGFpbnMoJ2xlb25hcmRvLWRyb3Bkb3duLWl0ZW0teCcpKSB7XG4gICAgICB0aGlzLnJlbW92ZUl0ZW0oPEhUTUxFbGVtZW50PmV2ZW50LnRhcmdldFsncGFyZW50Tm9kZSddKTtcbiAgICB9XG4gICAgaWYgKHRoaXMub3B0aW9uc1N0YXRlKSB7XG4gICAgICB0aGlzLmNsb3NlRHJvcERvd24oKTtcbiAgICAgIHRoaXMub3B0aW9uc1N0YXRlID0gZmFsc2U7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgdGhpcy5vcGVuRHJvcERvd24oKTtcbiAgICAgIHRoaXMub3B0aW9uc1N0YXRlID0gdHJ1ZTtcbiAgICB9XG4gIH1cblxuICBvcGVuRHJvcERvd24oKSB7XG4gICAgY29uc3QgZWxlbTogSFRNTEVsZW1lbnQgPSA8SFRNTEVsZW1lbnQ+dGhpcy52aWV3Tm9kZS5xdWVyeVNlbGVjdG9yKGAubGVvbmFyZG8tZHJvcGRvd24tb3B0aW9uc2ApO1xuICAgIGVsZW0uc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XG4gICAgY29uc3QgZWxlbVJlYzogQ2xpZW50UmVjdCA9IGVsZW0uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgY29uc3QgaXNPdmVyZmxvd2VkOiBib29sZWFuID0gZWxlbVJlYy50b3AgKyBlbGVtUmVjLmhlaWdodCA+IHdpbmRvdy5pbm5lckhlaWdodDtcbiAgICBpZiAoaXNPdmVyZmxvd2VkKSB7XG4gICAgICBlbGVtLnN0eWxlLnRvcCA9IC1lbGVtUmVjLmhlaWdodCArICdweCc7XG4gICAgICBlbGVtLnN0eWxlLmJvcmRlclRvcCA9ICcxcHggc29saWQgIzIxMjEyMSc7XG4gICAgICBlbGVtLnN0eWxlLmJvcmRlckJvdHRvbSA9ICdub25lJztcbiAgICB9XG4gICAgRXZlbnRzLmRpc3BhdGNoKEV2ZW50cy5DTE9TRV9EUk9QRE9XTlMsIHRoaXMudmlld05vZGUpO1xuICB9XG5cbiAgY2xvc2VEcm9wRG93bihldmVudD86IEN1c3RvbUV2ZW50KSB7XG4gICAgY29uc3QgZHJvcERvd246IEhUTUxFbGVtZW50ID0gPEhUTUxFbGVtZW50PnRoaXMudmlld05vZGUucXVlcnlTZWxlY3RvcihgLmxlb25hcmRvLWRyb3Bkb3duLW9wdGlvbnNgKTtcbiAgICBpZiAoIWRyb3BEb3duIHx8IChldmVudCAmJiBldmVudC5kZXRhaWwgPT09IHRoaXMudmlld05vZGUpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGRyb3BEb3duLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gIH1cblxuICBzZXRBY3RpdmVJdGVtKGl0ZW1OYW1lOiBzdHJpbmcpIHtcbiAgICBpZiAodGhpcy5hY3RpdmVJdGVtLm5hbWUgPT09IGl0ZW1OYW1lKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuYWN0aXZlSXRlbSA9IHRoaXMuZ2V0SXRlbUJ5TmFtZShpdGVtTmFtZSk7XG4gICAgdGhpcy52aWV3Tm9kZS5xdWVyeVNlbGVjdG9yKGAubGVvbmFyZG8tZHJvcGRvd24tc2VsZWN0ZWQtdGV4dGApWydpbm5lckhUTUwnXSA9IHRoaXMuYWN0aXZlSXRlbS5uYW1lO1xuICAgIHRoaXMub25TZWxlY3RJdGVtKHRoaXMuYWN0aXZlSXRlbSk7XG4gIH1cblxuICBwcml2YXRlIGdldEl0ZW1CeU5hbWUoaXRlbU5hbWU6IHN0cmluZykge1xuICAgIGxldCByZXRJdGVtID0gdGhpcy5hY3RpdmVJdGVtO1xuICAgIHRoaXMuaXRlbXMuc29tZSgoY3VySXRlbSkgPT4ge1xuICAgICAgaWYgKGN1ckl0ZW0ubmFtZSA9PT0gaXRlbU5hbWUpIHtcbiAgICAgICAgcmV0SXRlbSA9IGN1ckl0ZW07XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiByZXRJdGVtO1xuICB9XG5cbiAgcHJpdmF0ZSBnZXRJdGVtcygpIHtcbiAgICByZXR1cm4gdGhpcy5pdGVtcy5tYXAoKGl0ZW06IHtuYW1lOiBzdHJpbmd9KSA9PiB7XG4gICAgICByZXR1cm4gYDxsaSBjbGFzcz1cImxlb25hcmRvLWRyb3Bkb3duLWl0ZW1cIj48c3BhbiBjbGFzcz1cImxlb25hcmRvLWRyb3Bkb3duLWl0ZW0tdGV4dFwiPiR7aXRlbS5uYW1lfTwvc3Bhbj48c3BhbiBjbGFzcz1cImxlb25hcmRvLXgtYnRuIGxlb25hcmRvLWRyb3Bkb3duLWl0ZW0teFwiPjwvc3Bhbj48L2xpPmBcbiAgICB9KVxuICB9XG5cbiAgcHJpdmF0ZSBpc0Rpc2FibGVkVG9rZW4oKSB7XG4gICAgcmV0dXJuIHRoaXMuaXNEaXNhYmxlZCA/ICdkaXNhYmxlZCcgOiAnJztcbiAgfVxuXG4gIHByaXZhdGUgcmVtb3ZlSXRlbShpdGVtOiBIVE1MRWxlbWVudCkge1xuICAgIGlmICh0aGlzLml0ZW1zLmxlbmd0aCA8PSAxKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGxldCByZW1vdmVkSXRlbTtcbiAgICB0aGlzLml0ZW1zID0gdGhpcy5pdGVtcy5maWx0ZXIoKGN1ckl0ZW0pID0+IHtcbiAgICAgIGlmIChjdXJJdGVtLm5hbWUgPT09IGl0ZW0ucXVlcnlTZWxlY3RvcignLmxlb25hcmRvLWRyb3Bkb3duLWl0ZW0tdGV4dCcpWydpbm5lckhUTUwnXSkge1xuICAgICAgICByZW1vdmVkSXRlbSA9IGN1ckl0ZW07XG4gICAgICB9XG4gICAgfSk7XG4gICAgdGhpcy52aWV3Tm9kZS5xdWVyeVNlbGVjdG9yKCcubGVvbmFyZG8tZHJvcGRvd24tbGlzdCcpLnJlbW92ZUNoaWxkKGl0ZW0pO1xuICAgIHRoaXMub25SZW1vdmVJdGVtKHJlbW92ZWRJdGVtKTtcblxuICB9XG59XG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vLi4vbGVvbmFyZG8uZC50c1wiIC8+XG5pbXBvcnQgVXRpbHMgZnJvbSAnLi4vdWktdXRpbHMnO1xuaW1wb3J0IEV2ZW50cyBmcm9tICcuLi91aS1ldmVudHMnO1xuaW1wb3J0IHtIZWFkZXJUYWJJdGVtfSBmcm9tICcuL2hlYWRlci5tb2RlbCc7XG5pbXBvcnQgVUlTdGF0ZVZpZXdTZXJ2aWNlIGZyb20gJy4uL3VpLXN0YXRlL3VpLXN0YXRlLnNydic7XG5pbXBvcnQgRE9NRWxlbWVudCBmcm9tICcuLi9ET01FbGVtZW50JztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgSGVhZGVyVmlldyBleHRlbmRzIERPTUVsZW1lbnR7XG4gIFxuICBzdGF0aWMgU0VMRUNURURfQ0xBU1NfTkFNRTogc3RyaW5nID0gJ2xlb25hcmRvLWhlYWRlci10YWJJdGVtLXNlbGVjdGVkJztcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIHRhYkxpc3Q6IEFycmF5PEhlYWRlclRhYkl0ZW0+KSB7XG4gICAgc3VwZXIoYDxkaXYgY2xhc3M9XCJsZW9uYXJkby1oZWFkZXItY29udGFpbmVyXCI+YCk7XG4gIH1cblxuICByZW5kZXIoKSB7XG4gICAgc3VwZXIucmVuZGVyKCk7XG4gICAgdGhpcy52aWV3Tm9kZS5pbm5lckhUTUwgPSBgPGRpdiBjbGFzcz1cImxlb25hcmRvLWhlYWRlci1jb250YWluZXJcIj5cbiAgICAgICAgPHNwYW4gY2xhc3M9XCJsZW9uYXJkby1oZWFkZXItbGFiZWwgXCI+TEVPTkFSRE88L3NwYW4+XG4gICAgICAgIDxzcGFuIGNsYXNzPVwibGVvbmFyZG8taGVhZGVyLXRhYnNcIj5cbiAgICAgICAgICA8dWw+XG4gICAgICAgICAgICAke3RoaXMuZ2V0VGFic0h0bWwoMCl9XG4gICAgICAgICAgPC91bD5cbiAgICAgIDwvc3Bhbj5cbiAgICA8L2Rpdj5gO1xuICAgIHRoaXMub25JdGVtKHRoaXMudmlld05vZGUucXVlcnlTZWxlY3RvcigndWwnKSwgJ2NsaWNrJywgdGhpcy5vbkNsaWNrLmJpbmQodGhpcykpO1xuICB9XG5cbiAgcHJpdmF0ZSBnZXRUYWJzSHRtbChzZWxlY3RlZEluZGV4OiBudW1iZXIpIHtcbiAgICByZXR1cm4gdGhpcy50YWJMaXN0Lm1hcCgodGFiOiBIZWFkZXJUYWJJdGVtLCBpbmRleDogbnVtYmVyKSA9PiB7XG4gICAgICBjb25zdCBzZWxlY3RlZDogc3RyaW5nID0gaW5kZXggPT09IHNlbGVjdGVkSW5kZXggPyBIZWFkZXJWaWV3LlNFTEVDVEVEX0NMQVNTX05BTUUgOiAnJztcbiAgICAgIHJldHVybiBgPGxpIGNsYXNzPVwibGVvbmFyZG8taGVhZGVyLXRhYkl0ZW0gJHtzZWxlY3RlZH1cIiBkYXRhLWhlYWRlcnRhYj1cImxlb25hcmRvLWhlYWRlci0ke3RhYi5sYWJlbH1cIiA+JHt0YWIubGFiZWx9PC9saT5gO1xuICAgIH0pLmpvaW4oJycpO1xuICB9XG5cbiAgb25DbGljayhldmVudDogTW91c2VFdmVudCkge1xuICAgIHRoaXMuc2VsZWN0VGFiKGV2ZW50LnRhcmdldFsnaW5uZXJIVE1MJ10pO1xuICB9XG5cbiAgc2VsZWN0VGFiKHRhYkxhYmVsOiBzdHJpbmcpe1xuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYC4ke0hlYWRlclZpZXcuU0VMRUNURURfQ0xBU1NfTkFNRX1gKS5jbGFzc0xpc3QucmVtb3ZlKGBsZW9uYXJkby1oZWFkZXItdGFiSXRlbS1zZWxlY3RlZGApO1xuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYFtkYXRhLWhlYWRlcnRhYj1cImxlb25hcmRvLWhlYWRlci0ke3RhYkxhYmVsfVwiXWApLmNsYXNzTGlzdC5hZGQoSGVhZGVyVmlldy5TRUxFQ1RFRF9DTEFTU19OQU1FKTtcbiAgICBVSVN0YXRlVmlld1NlcnZpY2UuZ2V0SW5zdGFuY2UoKS5zZXRDdXJWaWV3U3RhdGUodGFiTGFiZWwpO1xuICB9XG5cbiAgLy8kKGRvY3VtZW50KS5vbigna2V5cHJlc3MnLCAoZSkgPT4ge1xuICAvLyAgaWYgKGUuc2hpZnRLZXkgJiYgZS5jdHJsS2V5KSB7XG4gIC8vICAgIHN3aXRjaCAoZS5rZXlDb2RlKSB7XG4gIC8vICAgICAgY2FzZSAxMjpcbiAgLy8gICAgICAgICQoJy5sZW9uYXJkby1hY3RpdmF0b3InKS50b2dnbGUoKTtcbiAgLy8gICAgICAgIGJyZWFrO1xuICAvLyAgICAgIGNhc2UgMTE6XG4gIC8vICAgICAgICB0b2dnbGVXaW5kb3coKTtcbiAgLy8gICAgICAgIGJyZWFrO1xuICAvLyAgICAgIGRlZmF1bHQ6XG4gIC8vICAgICAgICBicmVhaztcbiAgLy8gICAgfVxuICAvLyAgfVxuICAvL30pO1xufVxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uLy4uL2xlb25hcmRvLmQudHNcIiAvPlxuaW1wb3J0IFV0aWxzIGZyb20gJy4uL3VpLXV0aWxzJztcbmltcG9ydCBFdmVudHMgZnJvbSAnLi4vdWktZXZlbnRzJztcbmltcG9ydCBET01FbGVtZW50IGZyb20gJy4uL0RPTUVsZW1lbnQnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBMYXVuY2hlciBleHRlbmRzIERPTUVsZW1lbnQge1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKGA8ZGl2IGNsYXNzPVwibGVvbmFyZG8tbGF1bmNoZXJcIj48L2Rpdj5gKTtcbiAgICB0aGlzLmV2ZW50U3Vicy5wdXNoKEV2ZW50cy5vbigna2V5ZG93bicsIHRoaXMuYm9keUtleXByZXNzLmJpbmQodGhpcykpKTtcbiAgICB0aGlzLmV2ZW50U3Vicy5wdXNoKEV2ZW50cy5vbihFdmVudHMuVE9HR0xFX0lDT04sIHRoaXMudG9nZ2xlTGF1bmNoZXIuYmluZCh0aGlzKSkpO1xuICAgIHRoaXMub25JdGVtKHRoaXMudmlld05vZGUsICdjbGljaycsIHRoaXMub25DbGljay5iaW5kKHRoaXMpKTtcbiAgfVxuXG4gIG9uQ2xpY2soKSB7XG4gICAgRXZlbnRzLmRpc3BhdGNoKEV2ZW50cy5UT0dHTEVfTEFVTkNIRVIpO1xuICB9XG5cbiAgYm9keUtleXByZXNzKGU6IEtleWJvYXJkRXZlbnQpIHtcbiAgICBpZiAoZS5zaGlmdEtleSAmJiBlLmN0cmxLZXkgJiYgZS5rZXlDb2RlID09PSA3Nikge1xuICAgICAgRXZlbnRzLmRpc3BhdGNoKEV2ZW50cy5UT0dHTEVfSUNPTik7XG4gICAgfVxuICB9XG5cbiAgdG9nZ2xlTGF1bmNoZXIoKSB7XG4gICAgdGhpcy52aWV3Tm9kZS5zdHlsZS5kaXNwbGF5ID0gdGhpcy52aWV3Tm9kZS5zdHlsZS5kaXNwbGF5ID09PSAnbm9uZScgPyAnYmxvY2snIDogJ25vbmUnO1xuICB9XG59XG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vLi4vbGVvbmFyZG8uZC50c1wiIC8+XG5pbXBvcnQgVXRpbHMgZnJvbSAnLi4vdWktdXRpbHMnO1xuaW1wb3J0IEV2ZW50cyBmcm9tICcuLi91aS1ldmVudHMnO1xuaW1wb3J0IEhlYWRlclZpZXcgZnJvbSAnLi4vaGVhZGVyL2hlYWRlcic7XG5pbXBvcnQge0hlYWRlclRhYkl0ZW19IGZyb20gJy4uL2hlYWRlci9oZWFkZXIubW9kZWwnO1xuaW1wb3J0IHtVSVN0YXRlTGlzdH0gZnJvbSAnLi4vdWktc3RhdGUvdWktc3RhdGUuZGF0YSc7XG5pbXBvcnQgVUlTdGF0ZVZpZXdTZXJ2aWNlIGZyb20gJy4uL3VpLXN0YXRlL3VpLXN0YXRlLnNydic7XG5pbXBvcnQge1VJVmlld1N0YXRlfSBmcm9tICcuLi91aS1zdGF0ZS91aS1zdGF0ZS5tb2RlbCc7XG5pbXBvcnQgVmlld3NDb250YWluZXIgZnJvbSAnLi92aWV3cy1jb250YWluZXIvdmlld3MtY29udGFpbmVyJztcbmltcG9ydCBET01FbGVtZW50IGZyb20gJy4uL0RPTUVsZW1lbnQnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBNYWluVmlldyBleHRlbmRzIERPTUVsZW1lbnR7XG4gIGNsYXNzTmFtZSA9ICdsZW9uYXJkby1tYWluLXZpZXcnO1xuICBoaWRkZW5DbGFzc05hbWUgPSBgJHt0aGlzLmNsYXNzTmFtZX0taGlkZGVuYDtcbiAgaGVhZGVyVmlldzogSGVhZGVyVmlldztcbiAgdmlld3NDb250YWluZXI6IFZpZXdzQ29udGFpbmVyO1xuICBib2R5VmlldzogSFRNTEVsZW1lbnQ7XG4gIG1lbnVWaWV3OiBIVE1MRWxlbWVudDtcbiAgbWVudVN0YXRlOiBib29sZWFuID0gZmFsc2U7XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoYDxkaXYgY2xhc3M9XCJsZW9uYXJkby1tYWluLXZpZXcgbGVvbmFyZG8tbWFpbi12aWV3LWhpZGRlblwiPjwvZGl2PmApO1xuICAgIHRoaXMuZXZlbnRTdWJzLnB1c2goRXZlbnRzLm9uKCdrZXlkb3duJywgdGhpcy5vbktleVByZXNzLmJpbmQodGhpcykpKTtcbiAgICB0aGlzLmV2ZW50U3Vicy5wdXNoKEV2ZW50cy5vbihFdmVudHMuVE9HR0xFX0xBVU5DSEVSLCB0aGlzLnRvZ2dsZVZpZXcuYmluZCh0aGlzKSkpO1xuICAgIHRoaXMuZXZlbnRTdWJzLnB1c2goRXZlbnRzLm9uKEV2ZW50cy5BVFRBQ0hfTUVOVV9JVEVNLCB0aGlzLmF0dGFjaE1lbnUuYmluZCh0aGlzKSkpO1xuICAgIHRoaXMuZXZlbnRTdWJzLnB1c2goRXZlbnRzLm9uKEV2ZW50cy5PUEVOX01FTlUsIHRoaXMub3Blbk1lbnUuYmluZCh0aGlzKSkpO1xuICAgIHRoaXMuZXZlbnRTdWJzLnB1c2goRXZlbnRzLm9uKEV2ZW50cy5DTE9TRV9NRU5VLCB0aGlzLmNsb3NlTWVudS5iaW5kKHRoaXMpKSk7XG4gICAgdGhpcy5ldmVudFN1YnMucHVzaChFdmVudHMub24oRXZlbnRzLkNIQU5HRV9WSUVXLCB0aGlzLmNsb3NlTWVudS5iaW5kKHRoaXMpKSk7XG4gICAgdGhpcy5ib2R5VmlldyA9IFV0aWxzLmdldEVsZW1lbnRGcm9tSHRtbChgPGRpdiBjbGFzcz1cImxlb25hcmRvLW1haW4tdmlldy1ib2R5XCI+PC9kaXY+YCk7XG4gICAgdGhpcy5tZW51VmlldyA9IFV0aWxzLmdldEVsZW1lbnRGcm9tSHRtbChgPGRpdiBjbGFzcz1cImxlb25hcmRvLW1haW4tdmlldy1tZW51XCI+PC9kaXY+YCk7XG4gICAgVUlTdGF0ZVZpZXdTZXJ2aWNlLmdldEluc3RhbmNlKCkuaW5pdChVSVN0YXRlTGlzdCgpLCBVSVN0YXRlTGlzdCgpWzBdLm5hbWUpO1xuICAgIHRoaXMuaGVhZGVyVmlldyA9IG5ldyBIZWFkZXJWaWV3KHRoaXMuZ2V0VGFiTGlzdCgpKTtcbiAgICB0aGlzLnZpZXdzQ29udGFpbmVyID0gbmV3IFZpZXdzQ29udGFpbmVyKCk7XG4gIH1cblxuICB0b2dnbGVWaWV3KCkge1xuICAgIGNvbnN0IGVsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgLiR7dGhpcy5jbGFzc05hbWV9YCk7XG4gICAgaWYgKCFlbCkgcmV0dXJuO1xuICAgIGlmIChlbC5jbGFzc0xpc3QuY29udGFpbnModGhpcy5oaWRkZW5DbGFzc05hbWUpKSB7XG4gICAgICBlbC5jbGFzc0xpc3QucmVtb3ZlKHRoaXMuaGlkZGVuQ2xhc3NOYW1lKTtcbiAgICAgIGlmICghZWwuY2hpbGROb2Rlcy5sZW5ndGgpIHtcbiAgICAgICAgdGhpcy5yZW5kZXIoKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5jbG9zZUxlbygpO1xuICAgIH1cbiAgfVxuXG4gIHJlbmRlcigpIHtcbiAgICBzdXBlci5yZW5kZXIoKTtcbiAgICB0aGlzLm1lbnVTdGF0ZSA9IGZhbHNlO1xuICAgIHRoaXMudmlld05vZGUuYXBwZW5kQ2hpbGQodGhpcy5ib2R5Vmlldyk7XG4gICAgdGhpcy52aWV3Tm9kZS5hcHBlbmRDaGlsZCh0aGlzLm1lbnVWaWV3KTtcbiAgICB0aGlzLmJvZHlWaWV3LmFwcGVuZENoaWxkKHRoaXMuaGVhZGVyVmlldy5nZXQoKSk7XG4gICAgdGhpcy5ib2R5Vmlldy5hcHBlbmRDaGlsZCh0aGlzLnZpZXdzQ29udGFpbmVyLmdldCgpKTtcbiAgICB0aGlzLmhlYWRlclZpZXcucmVuZGVyKCk7XG4gICAgdGhpcy52aWV3c0NvbnRhaW5lci5zZXRWaWV3KFVJU3RhdGVWaWV3U2VydmljZS5nZXRJbnN0YW5jZSgpLmdldEN1clZpZXdTdGF0ZSgpKTtcbiAgICB0aGlzLnZpZXdzQ29udGFpbmVyLnJlbmRlcigpO1xuICB9XG5cbiAgcHJpdmF0ZSBhdHRhY2hNZW51KGV2ZW50OiBDdXN0b21FdmVudCl7XG4gICAgdGhpcy5tZW51Vmlldy5pbm5lckhUTUwgPSAnJztcbiAgICB0aGlzLmNsb3NlTWVudShudWxsKTtcbiAgICB0aGlzLm1lbnVWaWV3LmFwcGVuZENoaWxkKGV2ZW50LmRldGFpbCk7XG4gIH1cblxuICBwcml2YXRlIG9wZW5NZW51KGV2ZW50OiBDdXN0b21FdmVudCl7XG4gICAgaWYodGhpcy5tZW51U3RhdGUpe1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLm1lbnVTdGF0ZSA9IHRydWU7XG4gICAgdGhpcy5tZW51Vmlldy5zdHlsZS50cmFuc2Zvcm0gPSAndHJhbnNsYXRlWCgwKSc7XG4gICAgdGhpcy5ib2R5Vmlldy5zdHlsZS53aWR0aCA9ICh0aGlzLmJvZHlWaWV3LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLndpZHRoIC0gdGhpcy5tZW51Vmlldy5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS53aWR0aCkgKyAncHgnXG4gIH1cblxuICBwcml2YXRlIGNsb3NlTWVudShldmVudDogQ3VzdG9tRXZlbnQpe1xuICAgIGlmKCF0aGlzLm1lbnVTdGF0ZSl7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMubWVudVN0YXRlID0gZmFsc2U7XG4gICAgdGhpcy5tZW51Vmlldy5zdHlsZS50cmFuc2Zvcm0gPSAndHJhbnNsYXRlWCgxMDAlKSc7XG4gICAgdGhpcy5ib2R5Vmlldy5zdHlsZS53aWR0aCA9ICh0aGlzLmJvZHlWaWV3LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLndpZHRoICsgdGhpcy5tZW51Vmlldy5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS53aWR0aCkgKyAncHgnXG4gIH1cblxuICBwcml2YXRlIGdldFRhYkxpc3QoKTogQXJyYXk8SGVhZGVyVGFiSXRlbT4ge1xuICAgIHJldHVybiBVSVN0YXRlVmlld1NlcnZpY2UuZ2V0SW5zdGFuY2UoKS5nZXRWaWV3U3RhdGVzKCkubWFwKCh2aWV3OiBVSVZpZXdTdGF0ZSkgPT4ge1xuICAgICAgcmV0dXJuIHtsYWJlbDogdmlldy5uYW1lfVxuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBjbG9zZUxlbygpIHtcbiAgICBjb25zdCBlbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYC4ke3RoaXMuY2xhc3NOYW1lfWApO1xuICAgIGVsLmNsYXNzTGlzdC5hZGQodGhpcy5oaWRkZW5DbGFzc05hbWUpO1xuICB9XG5cbiAgcHJpdmF0ZSBvbktleVByZXNzKGV2ZW50OiBNb3VzZUV2ZW50KSB7XG4gICAgaWYgKGV2ZW50LndoaWNoID09IDI3KSB7XG4gICAgICB0aGlzLmNsb3NlTGVvKCk7XG4gICAgfVxuICB9XG59XG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vLi4vLi4vbGVvbmFyZG8uZC50c1wiIC8+XG5pbXBvcnQgVXRpbHMgZnJvbSAnLi4vLi4vdWktdXRpbHMnO1xuaW1wb3J0IEV2ZW50cyBmcm9tICcuLi8uLi91aS1ldmVudHMnO1xuaW1wb3J0IHtVSVZpZXdTdGF0ZX0gZnJvbSAnLi4vLi4vdWktc3RhdGUvdWktc3RhdGUubW9kZWwnO1xuaW1wb3J0IERPTUVsZW1lbnQgZnJvbSAnLi4vLi4vRE9NRWxlbWVudCc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFZpZXdzQ29udGFpbmVyIGV4dGVuZHMgRE9NRWxlbWVudHtcblxuICBjdXJyZW50Vmlld1N0YXRlOiBVSVZpZXdTdGF0ZTtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcihgPGRpdiBpZD1cImxlb25hcmRvLXZpZXdzLWNvbnRhaW5lclwiIGNsYXNzPVwibGVvbmFyZG8tdmlld3MtY29udGFpbmVyXCI+dmlldyBjb250YWluZXI8L2Rpdj5gKTtcbiAgICB0aGlzLmV2ZW50U3Vicy5wdXNoKEV2ZW50cy5vbihFdmVudHMuQ0hBTkdFX1ZJRVcsIHRoaXMub25WaWV3Q2hhbmdlZC5iaW5kKHRoaXMpKSk7XG4gIH1cblxuICByZW5kZXIoKSB7XG4gICAgc3VwZXIucmVuZGVyKCk7XG4gICAgdGhpcy52aWV3Tm9kZS5hcHBlbmRDaGlsZCh0aGlzLmN1cnJlbnRWaWV3U3RhdGUuY29tcG9uZW50LmdldCgpKTtcbiAgICB0aGlzLmN1cnJlbnRWaWV3U3RhdGUuY29tcG9uZW50LnJlbmRlcigpO1xuICB9XG5cbiAgc2V0VmlldyhjdXJWaWV3OiBVSVZpZXdTdGF0ZSl7XG4gICAgdGhpcy5jdXJyZW50Vmlld1N0YXRlID0gY3VyVmlldztcbiAgfVxuXG4gIG9uVmlld0NoYW5nZWQoZXZlbnQ6IEN1c3RvbUV2ZW50KSB7XG4gICAgdGhpcy5jdXJyZW50Vmlld1N0YXRlLmNvbXBvbmVudC5kZXN0cm95KCk7XG4gICAgdGhpcy5zZXRWaWV3KHRoaXMuY3VycmVudFZpZXdTdGF0ZSA9IGV2ZW50LmRldGFpbCk7XG4gICAgdGhpcy5yZW5kZXIoKTtcbiAgfVxufVxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL2xlb25hcmRvLmQudHNcIiAvPlxuZXhwb3J0IGludGVyZmFjZSBFdmVudFN1YiB7XG4gIG9mZjogRnVuY3Rpb25cbn1cblxuXG5leHBvcnQgZGVmYXVsdCB7XG4gIFRPR0dMRV9MQVVOQ0hFUjogJ2xlb25hcmRvOnRvZ2dsZTpsYXVuY2hlcicsXG4gIENIQU5HRV9WSUVXOiAnbGVvbmFyZG86Y2hhbmdlOnZpZXcnLFxuICBGSUxURVJfU1RBVEVTOiAnbGVvbmFyZG86ZmlsdGVyOnN0YXRlcycsXG4gIENMT1NFX0RST1BET1dOUzogJ2xlb25hcmRvOmNsb3NlOmRyb3Bkb3ducycsXG4gIFRPR0dMRV9TVEFURVM6ICdsZW9uYXJkbzp0b2dnbGU6c3RhdGVzJyxcbiAgVE9HR0xFX1NDRU5BUklPUzogJ2xlb25hcmRvOnRvZ2dsZTpzY2VuYXJpbycsXG4gIEFERF9TQ0VOQVJJTzogJ2xlb25hcmRvOmFkZDpzY2VuYXJpbycsXG4gIFRPR0dMRV9TVEFURTogJ2xlb25hcmRvOnRvZ2dsZTpzdGF0ZXMnLFxuICBUT0dHTEVfSUNPTjogJ2xlb25hcmRvOnRvZ2dsZTppY29uJyxcbiAgQVRUQUNIX01FTlVfSVRFTTogJ2xlb25hcmRvOmF0dGFjaDptZW51JyxcbiAgT1BFTl9NRU5VOiAnbGVvbmFyZG86bWVudTpvcGVuJyxcbiAgQ0xPU0VfTUVOVTogJ2xlb25hcmRvOm1lbnU6Y2xvc2UnLFxuXG4gIC8vV2Ugd2FudCB0byBtYWludGFpbiBzY29wZSBoZXJlXG4gIG9uOiBmdW5jdGlvbihldmVudE5hbWU6IHN0cmluZywgZm46IEV2ZW50TGlzdGVuZXJPckV2ZW50TGlzdGVuZXJPYmplY3QpIHtcbiAgICByZXR1cm4gdGhpcy5vbkl0ZW0oZG9jdW1lbnQuYm9keSwgZXZlbnROYW1lLCBmbik7XG4gIH0sXG4gIG9uT25jZTogZnVuY3Rpb24oZXZlbnROYW1lOiBzdHJpbmcsIGZuOiBFdmVudExpc3RlbmVyT3JFdmVudExpc3RlbmVyT2JqZWN0KXtcbiAgICB0aGlzLm9uSXRlbU9uY2UoZG9jdW1lbnQuYm9keSwgZXZlbnROYW1lLCBmbik7XG4gIH0sXG4gIGRpc3BhdGNoOiAoZXZlbnROYW1lOiBzdHJpbmcsIGRldGFpbHM/OiBhbnkpID0+IHtcbiAgICBjb25zdCBldmVudCA9IG5ldyBDdXN0b21FdmVudChldmVudE5hbWUsIHtkZXRhaWw6IGRldGFpbHN9KTtcbiAgICBkb2N1bWVudC5ib2R5LmRpc3BhdGNoRXZlbnQoZXZlbnQpO1xuICB9LFxuICBvbkl0ZW1PbmNlOiAobm9kZTogYW55LCB0eXBlOiBzdHJpbmcsIGNhbGxiYWNrOiBGdW5jdGlvbikgPT4ge1xuICAgIG5vZGUuYWRkRXZlbnRMaXN0ZW5lcih0eXBlLCBmdW5jdGlvbiAoZSkge1xuICAgICAgZS50YXJnZXQucmVtb3ZlRXZlbnRMaXN0ZW5lcihlLnR5cGUsIDxFdmVudExpc3RlbmVyPmFyZ3VtZW50cy5jYWxsZWUpO1xuICAgICAgcmV0dXJuIGNhbGxiYWNrLmFwcGx5KGNhbGxiYWNrLCBhcmd1bWVudHMpO1xuICAgIH0pO1xuICB9LFxuICBvbkl0ZW06IChub2RlOiBhbnksIHR5cGU6IHN0cmluZywgY2FsbGJhY2s6IEV2ZW50TGlzdGVuZXIpID0+IHtcbiAgICBub2RlLmFkZEV2ZW50TGlzdGVuZXIodHlwZSwgY2FsbGJhY2ssIGZhbHNlKTtcbiAgICByZXR1cm4ge1xuICAgICAgb2ZmOiAoKSA9PiB7cmV0dXJuIG5vZGUucmVtb3ZlRXZlbnRMaXN0ZW5lcih0eXBlLCBjYWxsYmFjaywgZmFsc2UpfVxuICAgIH1cbiAgfVxuXG59XG4iLCJpbXBvcnQgTGF1bmNoZXIgZnJvbSAnLi9sYXVuY2hlci9sYXVuY2hlcic7XG5pbXBvcnQgTWFpblZpZXcgZnJvbSAnLi9tYWluLXZpZXcvbWFpbi12aWV3JztcbmltcG9ydCBVdGlscyBmcm9tICcuL3VpLXV0aWxzJztcbmltcG9ydCBFdmVudHMgZnJvbSAnLi91aS1ldmVudHMnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBVSVJvb3Qge1xuICBsZW9uYXJkb0FwcDogTm9kZTtcbiAgbGF1bmNoZXI6IExhdW5jaGVyO1xuICBtYWluVmlldzogTWFpblZpZXc7ICBcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzd2l0Y2ggKGRvY3VtZW50LnJlYWR5U3RhdGUpIHtcbiAgICAgIGRlZmF1bHQ6XG4gICAgICBjYXNlICdsb2FkaW5nJzpcbiAgICAgICAgRXZlbnRzLm9uSXRlbU9uY2UoZG9jdW1lbnQsICdET01Db250ZW50TG9hZGVkJywgdGhpcy5pbml0LmJpbmQodGhpcykpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ2ludGVyYWN0aXZlJzpcbiAgICAgIGNhc2UgJ2NvbXBsZXRlJzpcbiAgICAgICAgdGhpcy5pbml0KCk7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIGluaXQoKSB7XG5cbiAgICB0aGlzLmxlb25hcmRvQXBwID0gVXRpbHMuZ2V0RWxlbWVudEZyb21IdG1sKGA8ZGl2IGxlb25hcmRvLWFwcD48L2Rpdj5gKTtcbiAgICB0aGlzLmxhdW5jaGVyID0gbmV3IExhdW5jaGVyKCk7XG4gICAgdGhpcy5tYWluVmlldyA9IG5ldyBNYWluVmlldygpO1xuICAgIHRoaXMubGVvbmFyZG9BcHAuYXBwZW5kQ2hpbGQodGhpcy5tYWluVmlldy5nZXQoKSk7XG4gICAgdGhpcy5sZW9uYXJkb0FwcC5hcHBlbmRDaGlsZCh0aGlzLmxhdW5jaGVyLmdldCgpKTtcbiAgICBFdmVudHMub24oRXZlbnRzLlRPR0dMRV9TVEFURVMsIHRoaXMudG9nZ2xlQWxsU3RhdGVzLmJpbmQodGhpcykpO1xuICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQodGhpcy5sZW9uYXJkb0FwcCk7XG4gIH1cblxuICBwcml2YXRlIHRvZ2dsZUFsbFN0YXRlcyhldmVudDogQ3VzdG9tRXZlbnQpIHtcbiAgICBMZW9uYXJkby50b2dnbGVBY3RpdmF0ZUFsbChldmVudC5kZXRhaWwpO1xuICB9XG59IiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uLy4uL2xlb25hcmRvLmQudHNcIiAvPlxuXG5pbXBvcnQge1VJVmlld1N0YXRlfSBmcm9tICcuL3VpLXN0YXRlLm1vZGVsJztcbmltcG9ydCBTY2VuYXJpb3MgZnJvbSAnLi4vdmlld3Mvc2NlbmFyaW9zL3NjZW5hcmlvcyc7XG5pbXBvcnQgUmVjb3JkZXIgZnJvbSAnLi4vdmlld3MvcmVjb3JkZXIvcmVjb3JkZXInO1xuaW1wb3J0IEV4cG9ydCBmcm9tICcuLi92aWV3cy9leHBvcnQvZXhwb3J0JztcblxubGV0IHVpTGlzdDogQXJyYXk8VUlWaWV3U3RhdGU+O1xuXG5leHBvcnQgZnVuY3Rpb24gVUlTdGF0ZUxpc3QoKTogQXJyYXk8VUlWaWV3U3RhdGU+IHtcbiAgaWYodWlMaXN0KXtcbiAgICByZXR1cm4gdWlMaXN0O1xuICB9XG4gIHJldHVybiB1aUxpc3QgPSBbXG4gICAge1xuICAgICAgbmFtZTogJ3NjZW5hcmlvcycsXG4gICAgICBjb21wb25lbnQ6IG5ldyBTY2VuYXJpb3MoKVxuICAgIH0sXG4gICAge1xuICAgICAgbmFtZTogJ3JlY29yZGVyJyxcbiAgICAgIGNvbXBvbmVudDogbmV3IFJlY29yZGVyKClcblxuICAgIH0sXG4gICAge1xuICAgICAgbmFtZTogJ2V4cG9ydGVkIGNvZGUnLFxuICAgICAgY29tcG9uZW50OiBuZXcgRXhwb3J0KClcbiAgICB9XG4gIF07XG59XG5cblxuXG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vLi4vbGVvbmFyZG8uZC50c1wiIC8+XG5cbmltcG9ydCB7VUlWaWV3U3RhdGV9IGZyb20gJy4vdWktc3RhdGUubW9kZWwnO1xuaW1wb3J0IEV2ZW50cyBmcm9tICcuLi91aS1ldmVudHMnO1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVUlTdGF0ZVZpZXdTZXJ2aWNlIHtcblxuICBwcml2YXRlIHN0YXRpYyBfaW5zdGFuY2U6IFVJU3RhdGVWaWV3U2VydmljZSA9IG5ldyBVSVN0YXRlVmlld1NlcnZpY2UoKTtcbiAgcHJpdmF0ZSBjdXJWaWV3U3RhdGU6IFVJVmlld1N0YXRlO1xuICBwcml2YXRlIHZpZXdTdGF0ZUxpc3Q6IEFycmF5PFVJVmlld1N0YXRlPjtcblxuICBzdGF0aWMgZ2V0SW5zdGFuY2UoKTogVUlTdGF0ZVZpZXdTZXJ2aWNlIHtcbiAgICByZXR1cm4gVUlTdGF0ZVZpZXdTZXJ2aWNlLl9pbnN0YW5jZTtcbiAgfVxuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIGlmIChVSVN0YXRlVmlld1NlcnZpY2UuX2luc3RhbmNlKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1VJU3RhdGVWaWV3U2VydmljZSBzaG91bGQgYmUgc2luZ2xldG9uJyk7XG4gICAgfVxuICAgIFVJU3RhdGVWaWV3U2VydmljZS5faW5zdGFuY2UgPSB0aGlzO1xuICB9XG5cblxuXG4gIGluaXQodmlld1N0YXRlTGlzdDogQXJyYXk8VUlWaWV3U3RhdGU+LCBpbml0Vmlld05hbWU6IHN0cmluZykge1xuICAgIHRoaXMudmlld1N0YXRlTGlzdCA9IHZpZXdTdGF0ZUxpc3Q7XG4gICAgdGhpcy5jdXJWaWV3U3RhdGUgPSB0aGlzLmdldFZpZXdTdGF0ZUJ5TmFtZShpbml0Vmlld05hbWUpO1xuICB9XG5cbiAgZ2V0Q3VyVmlld1N0YXRlKCl7XG4gICAgcmV0dXJuIHRoaXMuY3VyVmlld1N0YXRlO1xuICB9XG5cbiAgc2V0Q3VyVmlld1N0YXRlKHN0YXRlTmFtZTogc3RyaW5nKXtcbiAgICB0aGlzLmN1clZpZXdTdGF0ZSA9IHRoaXMuZ2V0Vmlld1N0YXRlQnlOYW1lKHN0YXRlTmFtZSk7XG4gICAgRXZlbnRzLmRpc3BhdGNoKEV2ZW50cy5DSEFOR0VfVklFVywgdGhpcy5jdXJWaWV3U3RhdGUpO1xuICB9XG5cbiAgZ2V0Vmlld1N0YXRlcygpe1xuICAgIHJldHVybiB0aGlzLnZpZXdTdGF0ZUxpc3Q7XG4gIH1cblxuICBhZGRWaWV3U3RhdGUodmlld1N0YXRlOiBVSVZpZXdTdGF0ZSl7XG4gICAgdGhpcy52aWV3U3RhdGVMaXN0LnB1c2godmlld1N0YXRlKTtcbiAgfVxuXG4gIHJlbW92ZVZpZXdTdGF0ZSh2aWV3U3RhdGVOYW1lOiBzdHJpbmcpe1xuICAgIHRoaXMudmlld1N0YXRlTGlzdCA9IHRoaXMudmlld1N0YXRlTGlzdC5maWx0ZXIoKHZpZXc6IFVJVmlld1N0YXRlKSA9PiB7XG4gICAgICByZXR1cm4gdmlldy5uYW1lID09PSB2aWV3U3RhdGVOYW1lO1xuICAgIH0pXG4gIH1cblxuICBwcml2YXRlIGdldFZpZXdTdGF0ZUJ5TmFtZSh2aWV3U3RhdGVOYW1lOiBzdHJpbmcpOiBVSVZpZXdTdGF0ZXtcbiAgICBsZXQgcmV0VmlldzogVUlWaWV3U3RhdGU7XG4gICAgdGhpcy52aWV3U3RhdGVMaXN0LnNvbWUoKHZpZXc6IFVJVmlld1N0YXRlKSA9PiB7XG4gICAgICBpZih2aWV3U3RhdGVOYW1lID09PSB2aWV3Lm5hbWUpe1xuICAgICAgICByZXR1cm4gISEocmV0VmlldyA9IHZpZXcpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiByZXRWaWV3IHx8IHRoaXMuY3VyVmlld1N0YXRlO1xuICB9XG5cbn0iLCJleHBvcnQgZGVmYXVsdCBjbGFzcyBVaVV0aWxzIHtcbiAgY29uc3RydWN0b3IoKSB7XG4gIH1cblxuICBzdGF0aWMgZ2V0RWxlbWVudEZyb21IdG1sKGh0bWw6IHN0cmluZyk6IEhUTUxFbGVtZW50IHtcbiAgICBjb25zdCBkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBkaXYuaW5uZXJIVE1MID0gaHRtbC50cmltKCk7XG4gICAgcmV0dXJuIDxIVE1MRWxlbWVudD5kaXYuZmlyc3RDaGlsZDtcbiAgfVxuXG4gIHN0YXRpYyBndWlkR2VuZXJhdG9yKCkge1xuICAgIHZhciBTNCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiAoKCgxICsgTWF0aC5yYW5kb20oKSkgKiAweDEwMDAwKSB8IDApLnRvU3RyaW5nKDE2KS5zdWJzdHJpbmcoMSk7XG4gICAgfTtcbiAgICByZXR1cm4gKFM0KCkgKyBTNCgpICsgJy0nICsgUzQoKSArICctJyArIFM0KCkgKyAnLScgKyBTNCgpICsgJy0nICsgUzQoKSArIFM0KCkgKyBTNCgpKTtcbiAgfVxufVxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uLy4uLy4uL2xlb25hcmRvLmQudHNcIiAvPlxuaW1wb3J0IFV0aWxzIGZyb20gJy4uLy4uL3VpLXV0aWxzJztcbmltcG9ydCBFdmVudHMgZnJvbSAnLi4vLi4vdWktZXZlbnRzJztcbmltcG9ydCBET01FbGVtZW50IGZyb20gJy4uLy4uL0RPTUVsZW1lbnQnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBFeHBvcnQgZXh0ZW5kcyBET01FbGVtZW50IHtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcihgPGRpdiBpZD1cImxlb25hcmRvLWV4cG9ydFwiIGNsYXNzPVwibGVvbmFyZG8tZXhwb3J0XCI+YCk7XG4gIH1cblxuICByZW5kZXIoKSB7XG4gICAgc3VwZXIucmVuZGVyKCk7XG4gICAgdGhpcy52aWV3Tm9kZS5pbm5lckhUTUwgPSBgXG4gICAgICA8YnV0dG9uIGNsYXNzPVwibGVvbmFyZG8tYnV0dG9uIGxlb25hcmRvLWV4cG9ydC1idXR0b25zXCIgZGF0YS1jbGlwYm9hcmQtdGFyZ2V0PVwiI2xlb25hcmRvLWV4cG9ydGVkLWNvZGVcIj4gQ29weSBUbyBDbGlwYm9hcmQ8L2J1dHRvbj5cbiAgICAgIDxidXR0b24gY2xhc3M9XCJsZW9uYXJkby1idXR0b24gbGVvbmFyZG8tZXhwb3J0LWJ1dHRvbnNcIj4gRG93bmxvYWQgQ29kZTwvYnV0dG9uPlxuICAgICAgPGRpdiBjbGFzcz1cImxlb25hcmRvLXNwYWNlclwiPjwvZGl2PlxuICAgICAgPGNvZGUgY29udGVudGVkaXRhYmxlPlxuICAgICAgICA8ZGl2IGlkPVwibGVvbmFyZG8tZXhwb3J0ZWQtY29kZVwiIGNsYXNzPVwibGVvbmFyZG8tZXhwb3J0ZWQtY29kZVwiPlxuICAgICAgICAgICAgJHtKU09OLnN0cmluZ2lmeShMZW9uYXJkby5nZXRTdGF0ZXMoKSwgbnVsbCwgIDQpfSAgICAgIFxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvY29kZT5cbiAgICA8L2Rpdj5gO1xuICB9XG5cbiAgLy8gT3ZlcnJpZGUgYmFzZSBzbyB3ZSBkb250IGNsZWFyIHZpZXdOb2RlXG4gIGRlc3Ryb3koKSB7XG5cbiAgfVxuXG59XG4iLCJpbXBvcnQgVXRpbHMgZnJvbSAnLi4vLi4vLi4vdWktdXRpbHMnO1xuaW1wb3J0IEV2ZW50cyBmcm9tICcuLi8uLi8uLi91aS1ldmVudHMnO1xuaW1wb3J0IFJlY29yZGVyU3RhdGVEZXRhaWwgZnJvbSBcIi4uL3N0YXRlLWRldGFpbC9zdGF0ZXMtZGV0YWlsXCI7XG5pbXBvcnQgRE9NRWxlbWVudCBmcm9tICcuLi8uLi8uLi9ET01FbGVtZW50JztcbmltcG9ydCB7RXZlbnRTdWJ9IGZyb20gJy4uLy4uLy4uL3VpLWV2ZW50cyc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFJlY29yZGVyTGlzdCBleHRlbmRzIERPTUVsZW1lbnQge1xuXG4gIHN0YXRlRGV0YWlsOiBSZWNvcmRlclN0YXRlRGV0YWlsID0gbmV3IFJlY29yZGVyU3RhdGVEZXRhaWwoKTtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcihgPGRpdiBpZD1cImxlb25hcmRvLXJlY29yZGVyLWxpc3RcIiBjbGFzcz1cImxlb25hcmRvLXJlY29yZGVyLWxpc3RcIj48L2Rpdj5gKTtcblxuICB9XG5cbiAgcmVuZGVyKCkge1xuICAgIHN1cGVyLnJlbmRlcigpO1xuICAgIHRoaXMuY2xlYXJFdmVudFN1YnMoKTtcbiAgICBjb25zdCBsaXN0ID0gVXRpbHMuZ2V0RWxlbWVudEZyb21IdG1sKGA8dWwgY2xhc3M9XCJsZW9uYXJkby1yZWNvcmRlci1saXN0LWNvbnRhaW5lclwiPjwvdWw+YCk7XG4gICAgdGhpcy5nZXRTdGF0ZUl0ZW1zKCkuZm9yRWFjaCgoaXRlbSkgPT4ge2xpc3QuYXBwZW5kQ2hpbGQoaXRlbSl9KTtcbiAgICB0aGlzLnZpZXdOb2RlLmFwcGVuZENoaWxkKGxpc3QpO1xuICAgIEV2ZW50cy5kaXNwYXRjaChFdmVudHMuQVRUQUNIX01FTlVfSVRFTSwgdGhpcy5zdGF0ZURldGFpbC5nZXQoKSk7XG4gIH1cblxuICBwcml2YXRlIGdldFN0YXRlSXRlbXMoKTogQXJyYXk8YW55PiB7XG4gICAgcmV0dXJuIExlb25hcmRvLmdldFJlY29yZGVkU3RhdGVzKCkubWFwKChzdGF0ZSkgPT4ge1xuICAgICAgY29uc3QgaXRlbSA9IFV0aWxzLmdldEVsZW1lbnRGcm9tSHRtbChgPGxpIGNsYXNzPVwibGVvbmFyZG8tcmVjb3JkZXItbGlzdC1pdGVtXCI+YCk7XG4gICAgICBpdGVtLmlubmVySFRNTCA9XG4gICAgICAgICAgYDxzcGFuIGNsYXNzPVwibGVvbmFyZG8tcmVjb3JkZXItbGlzdC12ZXJiIGxlb25hcmRvLXJlY29yZGVyLWxpc3QtdmVyYi0ke3N0YXRlLnZlcmIudG9Mb3dlckNhc2UoKX1cIj4ke3N0YXRlLnZlcmJ9PC9zcGFuPlxuICAgICAgICAgICA8c3BhbiBjbGFzcz1cImxlb25hcmRvLXJlY29yZGVyLWxpc3QtdXJsXCI+JHtzdGF0ZS51cmwuc3Vic3RyKDAsMTEwKX08L3NwYW4+YDtcbiAgICAgIGl0ZW0uaW5uZXJIVE1MICs9IHN0YXRlLnJlY29yZGVkID8gYDxzcGFuIGNsYXNzPVwibGVvbmFyZG8tcmVjb3JkZXItbGlzdC1uYW1lXCI+JHtzdGF0ZS5uYW1lfTwvc3Bhbj5gIDpcbiAgICAgICAgYDxzcGFuIGNsYXNzPVwibGVvbmFyZG8tcmVjb3JkZXItbGlzdC1uYW1lIGxlb25hcmRvLXJlY29yZGVyLWxpc3QtbmFtZS1uZXdcIj5OZXc8L3NwYW4+YDtcbiAgICAgIHRoaXMub25JdGVtKGl0ZW0sICdjbGljaycsIHRoaXMudG9nZ2xlRGV0YWlscy5iaW5kKHRoaXMsIHN0YXRlKSk7XG4gICAgICByZXR1cm4gaXRlbTtcbiAgICB9KVxuICB9XG5cbiAgdG9nZ2xlRGV0YWlscyhzdGF0ZSl7XG4gICAgc3RhdGUuYWN0aXZlT3B0aW9uID0gc3RhdGUub3B0aW9uc1swXTtcbiAgICB0aGlzLnN0YXRlRGV0YWlsLm9wZW4oc3RhdGUpO1xuICB9XG5cbn1cbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi8uLi8uLi9sZW9uYXJkby5kLnRzXCIgLz5cbmltcG9ydCBVdGlscyBmcm9tICcuLi8uLi91aS11dGlscyc7XG5pbXBvcnQgRXZlbnRzIGZyb20gJy4uLy4uL3VpLWV2ZW50cyc7XG5pbXBvcnQgUmVjb3JkZXJMaXN0IGZyb20gJy4vcmVjb3JkZXItbGlzdC9yZWNvcmRlci1saXN0JztcbmltcG9ydCBET01FbGVtZW50IGZyb20gJy4uLy4uL0RPTUVsZW1lbnQnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBSZWNvcmRlciBleHRlbmRzIERPTUVsZW1lbnQge1xuXG4gIHJlY29yZGVyTGlzdDogUmVjb3JkZXJMaXN0O1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKGA8ZGl2IGlkPVwibGVvbmFyZG8tcmVjb3JkZXJcIiBjbGFzcz1cImxlb25hcmRvLXJlY29yZGVyXCI8L2Rpdj5gKTtcbiAgICB0aGlzLnJlY29yZGVyTGlzdCA9IG5ldyBSZWNvcmRlckxpc3QoKTtcbiAgfVxuXG4gIHJlbmRlcigpIHtcbiAgICBzdXBlci5yZW5kZXIoKTtcbiAgICB0aGlzLnZpZXdOb2RlLmFwcGVuZENoaWxkKHRoaXMucmVjb3JkZXJMaXN0LmdldCgpKTtcbiAgICB0aGlzLnJlY29yZGVyTGlzdC5yZW5kZXIoKTtcbiAgfVxuXG4gIC8vIE92ZXJyaWRlIGJhc2Ugc28gd2UgZG9udCBjbGVhciB2aWV3Tm9kZVxuICBkZXN0cm95KCkge1xuXG4gIH1cbn1cbiIsImltcG9ydCBVdGlscyBmcm9tICcuLi8uLi8uLi91aS11dGlscyc7XG5pbXBvcnQgRXZlbnRzIGZyb20gJy4uLy4uLy4uL3VpLWV2ZW50cyc7XG5pbXBvcnQgRE9NRWxlbWVudCBmcm9tICcuLi8uLi8uLi9ET01FbGVtZW50JztcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFJlY29yZGVyU3RhdGVEZXRhaWwgZXh0ZW5kcyBET01FbGVtZW50IHtcbiAgb3BlblN0YXRlOiBib29sZWFuID0gZmFsc2U7XG4gIGN1clN0YXRlO1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKGA8ZGl2IGlkPVwibGVvbmFyZG8tc3RhdGUtZGV0YWlsXCIgY2xhc3M9XCJsZW9uYXJkby1zdGF0ZS1kZXRhaWwtcmVjb3JkZXJcIj48L2Rpdj5gKTtcbiAgICAgIH1cblxuICByZW5kZXIoKSB7XG4gICAgc3VwZXIucmVuZGVyKCk7XG4gICAgbGV0IGh0bWw7XG5cbiAgICAvL1RPRE8gY29uZ3JhdHVsYXRlIG91cnNlbHZlcyBvbiBiZWluZyBhd2Vzb21lISFcbiAgICBpZiAodGhpcy5jdXJTdGF0ZS5yZWNvcmRlZCkge1xuICAgICAgaHRtbCA9IGA8ZGl2IGNsYXNzPVwibGVvbmFyZG8tc3RhdGVzLWRldGFpbC10b3BcIj5BZGQgbW9ja2VkIHJlc3BvbnNlIGZvciA8c3Ryb25nPiR7dGhpcy5jdXJTdGF0ZS5uYW1lfTwvc3Ryb25nPjwvZGl2PmA7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgaHRtbCA9IGA8aDEgY2xhc3M9XCJsZW9uYXJkby1zdGF0ZXMtZGV0YWlsLXRvcFwiLz5BZGQgbmV3IHN0YXRlPC9oMT5cbiAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImxlb25hcmRvLXN0YXRlcy1kZXRhaWwtaW5wdXRcIj5TdGF0ZSBuYW1lOiA8aW5wdXQgY2xhc3M9XCJsZW9uYXJkby1zdGF0ZXMtZGV0YWlsLXN0YXRlLW5hbWVcIiB2YWx1ZT1cIiR7dGhpcy5jdXJTdGF0ZS5uYW1lfVwiLz48L2Rpdj5gO1xuICAgIH1cblxuICAgIGh0bWwgKz0gICBgPGRpdiBjbGFzcz1cImxlb25hcmRvLXN0YXRlcy1kZXRhaWwtaW5wdXRcIj48ZGl2PlVSTDogPC9kaXY+PGlucHV0IGNsYXNzPVwibGVvbmFyZG8tc3RhdGVzLWRldGFpbC1vcHRpb24tdXJsXCIgdmFsdWU9XCIke3RoaXMuY3VyU3RhdGUudXJsfVwiLz48L2Rpdj5cbiAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImxlb25hcmRvLXN0YXRlcy1kZXRhaWwtaW5wdXRcIj48ZGl2Pk9wdGlvbiBuYW1lOiA8L2Rpdj48aW5wdXQgY2xhc3M9XCJsZW9uYXJkby1zdGF0ZXMtZGV0YWlsLW9wdGlvbi1uYW1lXCIgdmFsdWU9XCIke3RoaXMuY3VyU3RhdGUub3B0aW9uc1swXS5uYW1lfVwiLz48L2Rpdj5cbiAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImxlb25hcmRvLXN0YXRlcy1kZXRhaWwtaW5wdXRcIj48ZGl2PlN0YXR1cyBjb2RlOiA8L2Rpdj48aW5wdXQgY2xhc3M9XCJsZW9uYXJkby1zdGF0ZXMtZGV0YWlsLXN0YXR1c1wiIHZhbHVlPVwiJHt0aGlzLmN1clN0YXRlLm9wdGlvbnNbMF0uc3RhdHVzfVwiLz48L2Rpdj5cbiAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImxlb25hcmRvLXN0YXRlcy1kZXRhaWwtaW5wdXRcIj48ZGl2PkRlbGF5OiA8L2Rpdj48aW5wdXQgY2xhc3M9XCJsZW9uYXJkby1zdGF0ZXMtZGV0YWlsLWRlbGF5XCIgdmFsdWU9XCIwXCIvPjwvZGl2PlxuICAgICAgICAgICAgICA8YnIvPlxuICAgICAgICAgICAgICA8cD5SZXNwb25zZTo8L3A+IDx0ZXh0YXJlYSBjbGFzcz1cImxlb25hcmRvLXN0YXRlcy1kZXRhaWwtanNvblwiPiR7dGhpcy5nZXRSZXNTdHJpbmcodGhpcy5jdXJTdGF0ZS5vcHRpb25zWzBdLmRhdGEpfTwvdGV4dGFyZWE+PC9wPlxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwibGVvbmFyZG8tc3RhdGVzLWRldGFpbC1idXR0b25zXCI+XG4gICAgICAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz1cImxlb25hcmRvLWJ1dHRvbiBsZW9uYXJkby1zdGF0ZXMtZGV0YWlsLXNhdmVcIj5TYXZlPC9idXR0b24+XG4gICAgICAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz1cImxlb25hcmRvLWJ1dHRvbiBsZW9uYXJkby1zdGF0ZXMtZGV0YWlsLWNhbmNlbFwiID5DYW5jZWw8L2J1dHRvbj5cbiAgICAgICAgICAgICAgPC9kaXY+YDtcblxuICAgIHRoaXMudmlld05vZGUuaW5uZXJIVE1MID0gaHRtbDtcbiAgICBFdmVudHMub25JdGVtT25jZSh0aGlzLnZpZXdOb2RlLnF1ZXJ5U2VsZWN0b3IoJy5sZW9uYXJkby1zdGF0ZXMtZGV0YWlsLWNhbmNlbCcpLCdjbGljaycsIHRoaXMub25DYW5jZWwuYmluZCh0aGlzKSk7XG4gICAgRXZlbnRzLm9uSXRlbU9uY2UodGhpcy52aWV3Tm9kZS5xdWVyeVNlbGVjdG9yKCcubGVvbmFyZG8tc3RhdGVzLWRldGFpbC1zYXZlJyksICdjbGljaycsIHRoaXMub25TYXZlLmJpbmQodGhpcykpO1xuICB9XG5cbiAgb3BlbihzdGF0ZSkge1xuICAgIHRoaXMuY3VyU3RhdGUgPSBzdGF0ZTtcbiAgICB0aGlzLnJlbmRlcigpO1xuICAgIHRoaXMub3BlblN0YXRlID0gdHJ1ZTtcbiAgICBFdmVudHMuZGlzcGF0Y2goRXZlbnRzLk9QRU5fTUVOVSk7XG4gIH1cblxuICBjbG9zZShzdGF0ZT8pIHtcbiAgICBpZiAoc3RhdGUgJiYgdGhpcy5jdXJTdGF0ZSAhPT0gc3RhdGUpIHtcbiAgICAgIHRoaXMub3BlbihzdGF0ZSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMub3BlblN0YXRlID0gZmFsc2U7XG4gICAgRXZlbnRzLmRpc3BhdGNoKEV2ZW50cy5DTE9TRV9NRU5VKTtcbiAgfVxuXG4gIHRvZ2dsZShzdGF0ZSkge1xuICAgIGlmICh0aGlzLm9wZW5TdGF0ZSkge1xuICAgICAgdGhpcy5jbG9zZShzdGF0ZSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMub3BlbihzdGF0ZSk7XG4gIH1cbiAgXG4gIHByaXZhdGUgZ2V0UmVzU3RyaW5nKHJlc29wbnNlOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIGxldCByZXNTdHI6IHN0cmluZztcbiAgICB0cnkge1xuICAgICAgcmVzU3RyID0gSlNPTi5zdHJpbmdpZnkocmVzb3Buc2UsIG51bGwsIDQpO1xuICAgIH1cbiAgICBjYXRjaChlKXtcbiAgICAgICByZXNTdHIgPSB0eXBlb2YgcmVzb3Buc2UgPT09ICdzdHJpbmcnID8gcmVzb3Buc2UgOiByZXNvcG5zZS50b1N0cmluZygpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzU3RyO1xuICB9XG5cbiAgcHJpdmF0ZSBvbkNhbmNlbChldmVudDogRXZlbnQpIHtcbiAgICB0aGlzLmNsb3NlKCk7XG4gIH1cblxuICBwcml2YXRlIG9uU2F2ZSgpIHtcbiAgICBjb25zdCB1cmxWYWw6IHN0cmluZyA9IHRoaXMudmlld05vZGUucXVlcnlTZWxlY3RvcihcIi5sZW9uYXJkby1zdGF0ZXMtZGV0YWlsLW9wdGlvbi11cmxcIikudmFsdWU7XG4gICAgY29uc3Qgc3RhdHVzVmFsOiBzdHJpbmcgPSB0aGlzLnZpZXdOb2RlLnF1ZXJ5U2VsZWN0b3IoXCIubGVvbmFyZG8tc3RhdGVzLWRldGFpbC1zdGF0dXNcIikudmFsdWU7XG4gICAgY29uc3QgZGVsYXlWYWw6IHN0cmluZyA9IHRoaXMudmlld05vZGUucXVlcnlTZWxlY3RvcihcIi5sZW9uYXJkby1zdGF0ZXMtZGV0YWlsLWRlbGF5XCIpLnZhbHVlO1xuICAgIGNvbnN0IGpzb25WYWw6IHN0cmluZyA9IHRoaXMudmlld05vZGUucXVlcnlTZWxlY3RvcihcIi5sZW9uYXJkby1zdGF0ZXMtZGV0YWlsLWpzb25cIikudmFsdWU7XG4gICAgY29uc3Qgb3B0aW9uTmFtZVZhbDogc3RyaW5nID0gdGhpcy52aWV3Tm9kZS5xdWVyeVNlbGVjdG9yKFwiLmxlb25hcmRvLXN0YXRlcy1kZXRhaWwtb3B0aW9uLW5hbWVcIikudmFsdWU7XG4gICAgdGhpcy5jdXJTdGF0ZS51cmwgPSB1cmxWYWw7XG4gICAgdGhpcy5jdXJTdGF0ZS5hY3RpdmVPcHRpb24uc3RhdHVzID0gc3RhdHVzVmFsO1xuICAgIHRoaXMuY3VyU3RhdGUuYWN0aXZlT3B0aW9uLmRlbGF5ID0gZGVsYXlWYWw7XG4gICAgdGhpcy5jdXJTdGF0ZS5hY3RpdmVPcHRpb24ubmFtZSA9IG9wdGlvbk5hbWVWYWw7XG4gICAgaWYoIXRoaXMuY3VyU3RhdGUucmVjb3JkZWQpe1xuICAgICAgdGhpcy5jdXJTdGF0ZS5uYW1lID0gdGhpcy52aWV3Tm9kZS5xdWVyeVNlbGVjdG9yKCcubGVvbmFyZG8tc3RhdGVzLWRldGFpbC1zdGF0ZS1uYW1lJykudmFsdWU7XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICB0aGlzLmN1clN0YXRlLmFjdGl2ZU9wdGlvbi5kYXRhID0gSlNPTi5wYXJzZShqc29uVmFsKTtcbiAgICB9XG4gICAgY2F0Y2ggKGUpIHtcbiAgICAgIHRoaXMuY3VyU3RhdGUuYWN0aXZlT3B0aW9uLmRhdGEgPSBqc29uVmFsO1xuICAgIH1cblxuICAgIExlb25hcmRvLmFkZE9yVXBkYXRlU2F2ZWRTdGF0ZSh0aGlzLmN1clN0YXRlKTtcbiAgICB0aGlzLmNsb3NlKCk7XG4gIH1cbn1cbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi8uLi8uLi8uLi9sZW9uYXJkby5kLnRzXCIgLz5cbmltcG9ydCBVdGlscyBmcm9tICcuLi8uLi8uLi91aS11dGlscyc7XG5pbXBvcnQgRXZlbnRzIGZyb20gJy4uLy4uLy4uL3VpLWV2ZW50cyc7XG5pbXBvcnQgRE9NRWxlbWVudCBmcm9tICcuLi8uLi8uLi9ET01FbGVtZW50JztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU2NlbmFyaW9zTGlzdCBleHRlbmRzIERPTUVsZW1lbnQge1xuXG4gIHN0YXRpYyBTRUxFQ1RFRF9DTEFTUyA9ICdsZW9uYXJkby1zZWxlY3RlZC1zY2VuYXJpbyc7XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoYDxkaXYgaWQ9XCJsZW9uYXJkby1zY2VuYXJpb3MtbGlzdFwiIGNsYXNzPVwibGVvbmFyZG8tc2NlbmFyaW9zLWxpc3RcIj48L2Rpdj5gKTtcbiAgICB0aGlzLmJvZHlFdmVudHNTdWJzLnB1c2goRXZlbnRzLm9uKEV2ZW50cy5BRERfU0NFTkFSSU8sIHRoaXMuYWRkU2NlbmFyaW8uYmluZCh0aGlzKSkpO1xuICB9XG5cbiAgcmVuZGVyKCkge1xuICAgIHN1cGVyLnJlbmRlcigpO1xuICAgIHRoaXMuY2xlYXJFdmVudFN1YnMoKTtcbiAgICB0aGlzLnZpZXdOb2RlLmFwcGVuZENoaWxkKFV0aWxzLmdldEVsZW1lbnRGcm9tSHRtbChgPGRpdj5TY2VuYXJpb3M8L2Rpdj5gKSk7XG4gICAgY29uc3QgdWwgPSBVdGlscy5nZXRFbGVtZW50RnJvbUh0bWwoYDx1bD48L3VsPmApO1xuICAgIExlb25hcmRvLmdldFNjZW5hcmlvcygpXG4gICAgICAubWFwKHRoaXMuZ2V0U2NlbmFyaW9FbGVtZW50LmJpbmQodGhpcykpXG4gICAgICAuZm9yRWFjaCgoc2NlbmFyaW9FbG0pID0+IHtcbiAgICAgICAgdWwuYXBwZW5kQ2hpbGQoc2NlbmFyaW9FbG0pO1xuICAgICAgfSk7XG4gICAgdGhpcy52aWV3Tm9kZS5hcHBlbmRDaGlsZCh1bCk7XG5cbiAgfVxuXG4gIGdldFNjZW5hcmlvRWxlbWVudChzY2VuYXJpbykge1xuICAgIGNvbnN0IGVsID0gVXRpbHMuZ2V0RWxlbWVudEZyb21IdG1sKGA8bGk+JHtzY2VuYXJpb308L2xpPmApO1xuICAgIHRoaXMub25JdGVtKGVsLCAnY2xpY2snLCB0aGlzLnNldFNjZW5hcmlvLmJpbmQodGhpcywgc2NlbmFyaW8sIGVsKSk7XG4gICAgcmV0dXJuIGVsO1xuICB9XG5cbiAgcHJpdmF0ZSBzZXRTY2VuYXJpbyhzY2VuYXJpbzogc3RyaW5nLCBlbDogSFRNTEVsZW1lbnQpIHtcbiAgICBjb25zdCBzdGF0ZXM6IEFycmF5PGFueT4gPSBMZW9uYXJkby5nZXRTY2VuYXJpbyhzY2VuYXJpbyk7XG4gICAgRXZlbnRzLmRpc3BhdGNoKEV2ZW50cy5UT0dHTEVfU1RBVEVTLCBmYWxzZSk7XG4gICAgc3RhdGVzLmZvckVhY2goKHN0YXRlKT0+IHtcbiAgICAgIEV2ZW50cy5kaXNwYXRjaChgJHtFdmVudHMuVE9HR0xFX1NUQVRFU306JHtzdGF0ZS5uYW1lfWAsIHN0YXRlLm9wdGlvbik7XG4gICAgfSk7XG4gICAgQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwodGhpcy52aWV3Tm9kZS5xdWVyeVNlbGVjdG9yQWxsKCdsaScpLCAwKVxuICAgICAgLmZvckVhY2gobGkgPT4gbGkuY2xhc3NMaXN0LnJlbW92ZShTY2VuYXJpb3NMaXN0LlNFTEVDVEVEX0NMQVNTKSk7XG4gICAgZWwuY2xhc3NMaXN0LmFkZChTY2VuYXJpb3NMaXN0LlNFTEVDVEVEX0NMQVNTKTtcblxuICB9XG5cbiAgcHJpdmF0ZSBhZGRTY2VuYXJpbyhldmVudDogQ3VzdG9tRXZlbnQpIHtcbiAgICB0aGlzLnJlbmRlcigpO1xuICB9XG59XG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vLi4vLi4vbGVvbmFyZG8uZC50c1wiIC8+XG5pbXBvcnQgVXRpbHMgZnJvbSAnLi4vLi4vdWktdXRpbHMnO1xuaW1wb3J0IEV2ZW50cyBmcm9tICcuLi8uLi91aS1ldmVudHMnO1xuaW1wb3J0IFN0YXRlc0xpc3QgZnJvbSAnLi9zdGF0ZXMtbGlzdC9zdGF0ZXMtbGlzdCc7XG5pbXBvcnQgU2NlbmFyaW9zTGlzdCBmcm9tICcuL3NjZW5hcmlvcy1saXN0L3NjZW5hcmlvcy1saXN0JztcbmltcG9ydCBET01FbGVtZW50IGZyb20gJy4uLy4uL0RPTUVsZW1lbnQnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTY2VuYXJpb3MgZXh0ZW5kcyBET01FbGVtZW50e1xuXG4gIHN0YXRlTGlzdDogU3RhdGVzTGlzdDtcbiAgc2NlbmFyaW9zTGlzdDogU2NlbmFyaW9zTGlzdDtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcihgPGRpdiBpZD1cImxlb25hcmRvLXNjZW5hcmlvc1wiIGNsYXNzPVwibGVvbmFyZG8tc2NlbmFyaW9zXCI+PC9kaXY+YCk7XG4gICAgdGhpcy5zdGF0ZUxpc3QgPSBuZXcgU3RhdGVzTGlzdCgpO1xuICAgIHRoaXMuc2NlbmFyaW9zTGlzdCA9IG5ldyBTY2VuYXJpb3NMaXN0KCk7XG4gICAgdGhpcy52aWV3Tm9kZS5hcHBlbmRDaGlsZCh0aGlzLnNjZW5hcmlvc0xpc3QuZ2V0KCkpO1xuICAgIHRoaXMudmlld05vZGUuYXBwZW5kQ2hpbGQodGhpcy5zdGF0ZUxpc3QuZ2V0KCkpO1xuICB9XG5cbiAgcmVuZGVyKCkge1xuICAgIHRoaXMuc3RhdGVMaXN0LnJlbmRlcigpO1xuICAgIHRoaXMuc2NlbmFyaW9zTGlzdC5yZW5kZXIoKTtcbiAgfVxuXG4gIC8vIE92ZXJyaWRlIGJhc2Ugc28gd2UgZG9udCBjbGVhciB2aWV3Tm9kZVxuICBkZXN0cm95KCkge1xuXG4gIH1cbn1cbiIsImltcG9ydCBVdGlscyBmcm9tICcuLi8uLi8uLi8uLi91aS11dGlscyc7XG5pbXBvcnQgRXZlbnRzIGZyb20gJy4uLy4uLy4uLy4uL3VpLWV2ZW50cyc7XG5pbXBvcnQgRE9NRWxlbWVudCBmcm9tICcuLi8uLi8uLi8uLi9ET01FbGVtZW50JztcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFN0YXRlRGV0YWlsIGV4dGVuZHMgRE9NRWxlbWVudCB7XG5cbiAgb3BlblN0YXRlOiBib29sZWFuID0gZmFsc2U7XG4gIGN1clN0YXRlO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgb25TYXZlQ0IsIHByaXZhdGUgb25DYW5jZWxDQikge1xuICAgIHN1cGVyKGA8ZGl2IGlkPVwibGVvbmFyZG8tc3RhdGUtZGV0YWlsXCIgY2xhc3M9XCJsZW9uYXJkby1zdGF0ZS1kZXRhaWxcIj48L2Rpdj5gKTtcbiAgfVxuXG4gIHJlbmRlcigpIHtcbiAgICBzdXBlci5yZW5kZXIoKTtcbiAgICB0aGlzLnZpZXdOb2RlLmlubmVySFRNTCA9IGBcbiAgICAgIDxkaXYgY2xhc3M9XCJsZW9uYXJkby1zdGF0ZXMtZGV0YWlsLWNvbnRhaW5lclwiPiBcbiAgICAgICAgPGRpdiBjbGFzcz1cImxlb25hcmRvLXN0YXRlcy1kZXRhaWwtdG9wXCI+RWRpdCBvcHRpb24gPHN0cm9uZz4ke3RoaXMuY3VyU3RhdGUuYWN0aXZlT3B0aW9uLm5hbWV9PC9zdHJvbmc+XG4gICAgICAgIGZvciA8c3Ryb25nPiR7dGhpcy5jdXJTdGF0ZS5uYW1lfTwvc3Ryb25nPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz1cImxlb25hcmRvLXN0YXRlcy1kZXRhaWwtaW5wdXRcIj48ZGl2PlN0YXR1cyBjb2RlOiA8L2Rpdj48aW5wdXQgY2xhc3M9XCJsZW9uYXJkby1zdGF0ZXMtZGV0YWlsLXN0YXR1c1wiIHZhbHVlPVwiJHt0aGlzLmN1clN0YXRlLmFjdGl2ZU9wdGlvbi5zdGF0dXN9XCIvPjwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPVwibGVvbmFyZG8tc3RhdGVzLWRldGFpbC1pbnB1dFwiPjxkaXY+RGVsYXk6IDwvZGl2PjxpbnB1dCBjbGFzcz1cImxlb25hcmRvLXN0YXRlcy1kZXRhaWwtZGVsYXlcIiB2YWx1ZT1cIiR7dGhpcy5jdXJTdGF0ZS5hY3RpdmVPcHRpb24uZGVsYXl9XCIvPjwvZGl2PlxuICAgICAgICA8ZGl2PlxuICAgICAgICAgIDxici8+IFxuICAgICAgICAgIDxwPlJlc3BvbnNlOjwvcD4gICAgICAgICAgXG4gICAgICAgICAgPHRleHRhcmVhIGNsYXNzPVwibGVvbmFyZG8tc3RhdGVzLWRldGFpbC1qc29uXCI+JHt0aGlzLmdldFJlc1N0cmluZyh0aGlzLmN1clN0YXRlLmFjdGl2ZU9wdGlvbi5kYXRhKX08L3RleHRhcmVhPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz1cImxlb25hcmRvLXN0YXRlcy1kZXRhaWwtYnV0dG9uc1wiPlxuICAgICAgICAgIDxidXR0b24gY2xhc3M9XCJsZW9uYXJkby1idXR0b24gbGVvbmFyZG8tc3RhdGVzLWRldGFpbC1zYXZlXCI+U2F2ZTwvYnV0dG9uPlxuICAgICAgICAgIDxidXR0b24gY2xhc3M9XCJsZW9uYXJkby1idXR0b24gbGVvbmFyZG8tc3RhdGVzLWRldGFpbC1jYW5jZWxcIiA+Q2FuY2VsPC9idXR0b24+XG4gICAgICAgIDwvZGl2PmA7XG5cbiAgICAgICAgRXZlbnRzLm9uSXRlbU9uY2UodGhpcy52aWV3Tm9kZS5xdWVyeVNlbGVjdG9yKCcubGVvbmFyZG8tc3RhdGVzLWRldGFpbC1jYW5jZWwnKSwnY2xpY2snLCB0aGlzLm9uQ2FuY2VsLmJpbmQodGhpcykpO1xuICAgICAgICBFdmVudHMub25JdGVtT25jZSh0aGlzLnZpZXdOb2RlLnF1ZXJ5U2VsZWN0b3IoJy5sZW9uYXJkby1zdGF0ZXMtZGV0YWlsLXNhdmUnKSwgJ2NsaWNrJywgdGhpcy5vblNhdmUuYmluZCh0aGlzKSk7XG4gIH1cblxuICBvcGVuKHN0YXRlKSB7XG4gICAgdGhpcy5jdXJTdGF0ZSA9IHN0YXRlO1xuICAgIHRoaXMucmVuZGVyKCk7XG4gICAgdGhpcy5vcGVuU3RhdGUgPSB0cnVlO1xuICAgIEV2ZW50cy5kaXNwYXRjaChFdmVudHMuT1BFTl9NRU5VKTtcbiAgfVxuXG4gIGNsb3NlKHN0YXRlPykge1xuICAgIGlmKHN0YXRlICYmIHRoaXMuY3VyU3RhdGUgIT09IHN0YXRlKXtcbiAgICAgIHRoaXMub3BlbihzdGF0ZSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5vcGVuU3RhdGUgPSBmYWxzZTtcbiAgICBFdmVudHMuZGlzcGF0Y2goRXZlbnRzLkNMT1NFX01FTlUpO1xuICB9XG5cbiAgdG9nZ2xlKHN0YXRlKSB7XG4gICAgaWYodGhpcy5vcGVuU3RhdGUpe1xuICAgICAgdGhpcy5jbG9zZShzdGF0ZSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMub3BlbihzdGF0ZSk7XG4gIH1cblxuICBwcml2YXRlIGdldFJlc1N0cmluZyhyZXNvcG5zZTogc3RyaW5nKTogc3RyaW5nIHtcbiAgICBsZXQgcmVzU3RyOiBzdHJpbmc7XG4gICAgdHJ5IHtcbiAgICAgIHJlc1N0ciA9IEpTT04uc3RyaW5naWZ5KHJlc29wbnNlLCBudWxsLCA0KTtcbiAgICB9XG4gICAgY2F0Y2goZSl7XG4gICAgICByZXNTdHIgPSB0eXBlb2YgcmVzb3Buc2UgPT09ICdzdHJpbmcnID8gcmVzb3Buc2UgOiByZXNvcG5zZS50b1N0cmluZygpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzU3RyO1xuICB9XG5cbiAgcHJpdmF0ZSBvbkNhbmNlbCgpIHtcbiAgICB0aGlzLmNsb3NlKCk7XG4gICAgdGhpcy5vbkNhbmNlbENCKCk7XG4gIH1cblxuICBwcml2YXRlIG9uU2F2ZSgpIHtcbiAgICBjb25zdCBzdGF0dXNWYWw6c3RyaW5nID0gdGhpcy52aWV3Tm9kZS5xdWVyeVNlbGVjdG9yKFwiLmxlb25hcmRvLXN0YXRlcy1kZXRhaWwtc3RhdHVzXCIpLnZhbHVlO1xuICAgIGNvbnN0IGRlbGF5VmFsOnN0cmluZyA9IHRoaXMudmlld05vZGUucXVlcnlTZWxlY3RvcihcIi5sZW9uYXJkby1zdGF0ZXMtZGV0YWlsLWRlbGF5XCIpLnZhbHVlO1xuICAgIGNvbnN0IGpzb25WYWw6c3RyaW5nID0gdGhpcy52aWV3Tm9kZS5xdWVyeVNlbGVjdG9yKFwiLmxlb25hcmRvLXN0YXRlcy1kZXRhaWwtanNvblwiKS52YWx1ZTtcblxuICAgIHRoaXMuY3VyU3RhdGUuYWN0aXZlT3B0aW9uLnN0YXR1cyA9IHN0YXR1c1ZhbDtcbiAgICB0aGlzLmN1clN0YXRlLmFjdGl2ZU9wdGlvbi5kZWxheSA9IGRlbGF5VmFsO1xuICAgIHRyeXtcbiAgICAgIHRoaXMuY3VyU3RhdGUuYWN0aXZlT3B0aW9uLmRhdGEgPSBKU09OLnBhcnNlKGpzb25WYWwpO1xuICAgIH1cbiAgICBjYXRjaChlKSB7XG4gICAgICB0aGlzLmN1clN0YXRlLmFjdGl2ZU9wdGlvbi5kYXRhID0ganNvblZhbDtcbiAgICB9XG5cbiAgICBMZW9uYXJkby5hZGRPclVwZGF0ZVNhdmVkU3RhdGUodGhpcy5jdXJTdGF0ZSk7XG4gICAgdGhpcy5jbG9zZSgpO1xuICAgIHRoaXMub25TYXZlQ0IoKTtcbiAgfVxufVxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uLy4uLy4uLy4uLy4uL2xlb25hcmRvLmQudHNcIiAvPlxuaW1wb3J0IFV0aWxzIGZyb20gJy4uLy4uLy4uLy4uL3VpLXV0aWxzJztcbmltcG9ydCBFdmVudHMgZnJvbSAnLi4vLi4vLi4vLi4vdWktZXZlbnRzJztcbmltcG9ydCBEcm9wRG93biBmcm9tICcuLi8uLi8uLi8uLi9kcm9wLWRvd24vZHJvcC1kb3duJztcbmltcG9ydCBET01FbGVtZW50IGZyb20gJy4uLy4uLy4uLy4uL0RPTUVsZW1lbnQnO1xuaW1wb3J0IHtFdmVudFN1Yn0gZnJvbSAnLi4vLi4vLi4vLi4vdWktZXZlbnRzJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU3RhdGVJdGVtIGV4dGVuZHMgRE9NRWxlbWVudCB7XG5cbiAgcmFuZG9tSUQ6IHN0cmluZztcbiAgZHJvcERvd246IERyb3BEb3duO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgc3RhdGUsIHByaXZhdGUgb25SZW1vdmU6IEZ1bmN0aW9uKSB7XG4gICAgc3VwZXIoYDxkaXYgY2xhc3M9XCJsZW9uYXJkby1zdGF0ZS1pdGVtXCI+PC9kaXY+YCk7XG5cbiAgICB0aGlzLnJhbmRvbUlEID0gVXRpbHMuZ3VpZEdlbmVyYXRvcigpO1xuICAgIHRoaXMuZHJvcERvd24gPSBuZXcgRHJvcERvd24odGhpcy5zdGF0ZS5vcHRpb25zLCB0aGlzLnN0YXRlLmFjdGl2ZU9wdGlvbiB8fCB0aGlzLnN0YXRlLm9wdGlvbnNbMF0sICF0aGlzLnN0YXRlLmFjdGl2ZSwgdGhpcy5jaGFuZ2VBY3RpdmVPcHRpb24uYmluZCh0aGlzKSwgdGhpcy5yZW1vdmVPcHRpb24uYmluZCh0aGlzKSk7XG4gICAgdGhpcy5ib2R5RXZlbnRzU3Vicy5wdXNoKEV2ZW50cy5vbihFdmVudHMuVE9HR0xFX1NUQVRFUywgdGhpcy50b2dnbGVBbGxzdGF0ZS5iaW5kKHRoaXMpKSk7XG4gICAgdGhpcy5ib2R5RXZlbnRzU3Vicy5wdXNoKEV2ZW50cy5vbihgJHtFdmVudHMuVE9HR0xFX1NUQVRFU306JHt0aGlzLnN0YXRlLm5hbWV9YCwgdGhpcy5zZXRTdGF0ZVN0YXRlLmJpbmQodGhpcykpKTtcbiAgfVxuXG4gIHJlbmRlcigpIHtcbiAgICBzdXBlci5yZW5kZXIoKTtcbiAgICB0aGlzLnZpZXdOb2RlLmlubmVySFRNTCA9IGBcbiAgICAgICAgPGlucHV0ICR7dGhpcy5pc0NoZWNrZWQoKX0gaWQ9XCJsZW9uYXJkby1zdGF0ZS10b2dnbGUtJHt0aGlzLnJhbmRvbUlEfVwiIGNsYXNzPVwibGVvbmFyZG8tdG9nZ2xlIGxlb25hcmRvLXRvZ2dsZS1pb3NcIiB0eXBlPVwiY2hlY2tib3hcIi8+XG4gICAgICAgIDxsYWJlbCBjbGFzcz1cImxlb25hcmRvLXRvZ2dsZS1idG5cIiBmb3I9XCJsZW9uYXJkby1zdGF0ZS10b2dnbGUtJHt0aGlzLnJhbmRvbUlEIH1cIj48L2xhYmVsPlxuICAgICAgICA8c3BhbiBjbGFzcz1cImxlb25hcmRvLXN0YXRlLXZlcmIgbGVvbmFyZG8tc3RhdGUtdmVyYi0ke3RoaXMuc3RhdGUudmVyYi50b0xvd2VyQ2FzZSgpfVwiPiR7dGhpcy5zdGF0ZS52ZXJifTwvc3Bhbj5cbiAgICAgICAgPHNwYW4gY2xhc3M9XCJsZW9uYXJkby1zdGF0ZS1uYW1lXCI+JHt0aGlzLnN0YXRlLm5hbWV9PC9zcGFuPlxuICAgICAgICA8c3BhbiBjbGFzcz1cImxlb25hcmRvLXN0YXRlLXVybFwiPiR7dGhpcy5zdGF0ZS51cmwgfHwgJyd9PC9zcGFuPmA7XG4gICAgdGhpcy52aWV3Tm9kZS5hcHBlbmRDaGlsZCh0aGlzLmRyb3BEb3duLmdldCgpKTtcbiAgICB0aGlzLmRyb3BEb3duLnJlbmRlcigpO1xuICAgIHRoaXMudmlld05vZGUuYXBwZW5kQ2hpbGQoVXRpbHMuZ2V0RWxlbWVudEZyb21IdG1sKGA8ZGl2IHRpdGxlPVwiUmVtb3ZlIFN0YXRlXCIgY2xhc3M9XCJsZW9uYXJkby14LWJ0biBsZW9uYXJkby1zdGF0ZS1yZW1vdmVcIj48L2Rpdj5gKSk7XG4gICAgdGhpcy5vbkl0ZW0odGhpcy52aWV3Tm9kZS5xdWVyeVNlbGVjdG9yKGAubGVvbmFyZG8tdG9nZ2xlLWJ0bmApLCAnY2xpY2snLCB0aGlzLnRvZ2dsZVN0YXRlLmJpbmQodGhpcykpO1xuICAgIEV2ZW50cy5vbkl0ZW1PbmNlKHRoaXMudmlld05vZGUucXVlcnlTZWxlY3RvcihgLmxlb25hcmRvLXN0YXRlLXJlbW92ZWApLCAnY2xpY2snLCB0aGlzLnJlbW92ZVN0YXRlLmJpbmQodGhpcykpO1xuICB9XG5cbiAgZ2V0TmFtZSgpIHtcbiAgICByZXR1cm4gdGhpcy5zdGF0ZS5uYW1lO1xuICB9XG5cbiAgZ2V0U3RhdGUoKSB7XG4gICAgcmV0dXJuIHRoaXMuc3RhdGU7XG4gIH1cblxuICB0b2dnbGVWaXNpYmxlKHNob3c6IGJvb2xlYW4pIHtcbiAgICBpZiAoc2hvdykge1xuICAgICAgdGhpcy52aWV3Tm9kZS5jbGFzc0xpc3QucmVtb3ZlKCdsZW9uYXJkby1zdGF0ZS1pdGVtLWhpZGRlbicpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnZpZXdOb2RlLmNsYXNzTGlzdC5hZGQoJ2xlb25hcmRvLXN0YXRlLWl0ZW0taGlkZGVuJyk7XG4gICAgfVxuICB9XG5cbiAgc2V0U3RhdGUoc3RhdGU6IEJvb2xlYW4sIHNldFZpZXc6IGJvb2xlYW4gPSB0cnVlKSB7XG4gICAgdGhpcy5zdGF0ZS5hY3RpdmUgPSBzdGF0ZTtcbiAgICBpZiAoc3RhdGUpIHtcbiAgICAgIExlb25hcmRvLmFjdGl2YXRlU3RhdGVPcHRpb24odGhpcy5zdGF0ZS5uYW1lLCB0aGlzLnN0YXRlLmFjdGl2ZU9wdGlvbi5uYW1lKTtcbiAgICAgIHRoaXMuZHJvcERvd24uZW5hYmxlRHJvcERvd24oKTtcbiAgICAgIGlmIChzZXRWaWV3KSB7XG4gICAgICAgIHRoaXMudmlld05vZGUucXVlcnlTZWxlY3RvcignLmxlb25hcmRvLXRvZ2dsZScpWydjaGVja2VkJ10gPSB0cnVlO1xuICAgICAgfVxuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIExlb25hcmRvLmRlYWN0aXZhdGVTdGF0ZSh0aGlzLnN0YXRlLm5hbWUpO1xuICAgICAgdGhpcy5kcm9wRG93bi5kaXNhYmxlRHJvcERvd24oKTtcbiAgICAgIGlmIChzZXRWaWV3KSB7XG4gICAgICAgIHRoaXMudmlld05vZGUucXVlcnlTZWxlY3RvcignLmxlb25hcmRvLXRvZ2dsZScpWydjaGVja2VkJ10gPSBmYWxzZTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGlzQ2hlY2tlZCgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLnN0YXRlLmFjdGl2ZSA/ICdjaGVja2VkJyA6ICcnO1xuICB9XG5cbiAgcHJpdmF0ZSB0b2dnbGVTdGF0ZShldmVudDogRXZlbnQpIHtcbiAgICB0aGlzLnNldFN0YXRlKCF0aGlzLnN0YXRlLmFjdGl2ZSwgZmFsc2UpO1xuICB9XG5cbiAgcHJpdmF0ZSB0b2dnbGVBbGxzdGF0ZShldmVudDogQ3VzdG9tRXZlbnQpIHtcbiAgICB0aGlzLnNldFN0YXRlKGV2ZW50LmRldGFpbCk7XG4gIH1cblxuICBwcml2YXRlIHNldFN0YXRlU3RhdGUoZXZlbnQ6IEN1c3RvbUV2ZW50KSB7XG4gICAgdGhpcy5zZXRTdGF0ZSh0cnVlKTtcbiAgICB0aGlzLnN0YXRlLm9wdGlvbnMuc29tZSgob3B0aW9uKSA9PiB7XG4gICAgICBpZiAob3B0aW9uLm5hbWUgPT09IGV2ZW50LmRldGFpbCkge1xuICAgICAgICB0aGlzLmRyb3BEb3duLnNldEFjdGl2ZUl0ZW0oZXZlbnQuZGV0YWlsKTtcbiAgICAgICAgdGhpcy5jaGFuZ2VBY3RpdmVPcHRpb24ob3B0aW9uKTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgfSlcbiAgfVxuXG4gIHByaXZhdGUgY2hhbmdlQWN0aXZlT3B0aW9uKG9wdGlvbikge1xuICAgIHRoaXMuc3RhdGUuYWN0aXZlT3B0aW9uID0gb3B0aW9uO1xuICAgIExlb25hcmRvLmFjdGl2YXRlU3RhdGVPcHRpb24odGhpcy5zdGF0ZS5uYW1lLCB0aGlzLnN0YXRlLmFjdGl2ZU9wdGlvbi5uYW1lKVxuICB9XG5cbiAgcHJpdmF0ZSByZW1vdmVTdGF0ZShldmVudDogRXZlbnQpIHtcbiAgICBpZiAoZXZlbnQpIHtcbiAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgIH1cbiAgICB0aGlzLm9uUmVtb3ZlKHRoaXMuc3RhdGUubmFtZSwgdGhpcy52aWV3Tm9kZSk7XG4gICAgTGVvbmFyZG8ucmVtb3ZlU3RhdGUodGhpcy5zdGF0ZSk7XG4gICAgdGhpcy5kZXN0cm95KCk7XG4gIH1cblxuICBwcml2YXRlIHJlbW92ZU9wdGlvbihpdGVtKSB7XG4gICAgTGVvbmFyZG8ucmVtb3ZlT3B0aW9uKHRoaXMuc3RhdGUsIGl0ZW0pO1xuICB9XG5cbn1cbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi8uLi8uLi8uLi8uLi8uLi9sZW9uYXJkby5kLnRzXCIgLz5cbmltcG9ydCBVdGlscyBmcm9tICcuLi8uLi8uLi8uLi8uLi91aS11dGlscyc7XG5pbXBvcnQgRXZlbnRzIGZyb20gJy4uLy4uLy4uLy4uLy4uL3VpLWV2ZW50cyc7XG5pbXBvcnQgRE9NRWxlbWVudCBmcm9tICcuLi8uLi8uLi8uLi8uLi9ET01FbGVtZW50JztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQWRkU2NlbmFyaW8gZXh0ZW5kcyBET01FbGVtZW50e1xuXG4gIG9wZW5TdGF0ZTogYm9vbGVhbiA9IGZhbHNlO1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKGA8ZGl2IGlkPVwibGVvbmFyZG8tYWRkLXNjZW5hcmlvXCIgY2xhc3M9XCJsZW9uYXJkby1hZGQtc2NlbmFyaW9cIj48L2Rpdj5gKTtcbiAgfVxuXG4gIHJlbmRlcigpIHtcbiAgICBzdXBlci5yZW5kZXIoKTtcbiAgICB0aGlzLmNsZWFyRXZlbnRTdWJzKCk7XG4gICAgdGhpcy52aWV3Tm9kZS5pbm5lckhUTUwgPSBgXG4gICAgICAgIDxkaXYgY2xhc3M9XCJsZW9uYXJkby1hZGQtc2NlbmFyaW8tYm94XCI+XG4gICAgICAgICAgPHNwYW4+U2NlbmFyaW8gTmFtZTogPC9zcGFuPlxuICAgICAgICAgIDxpbnB1dCBjbGFzcz1cImxlb25hcmRvLWFkZC1zY2VuYXJpby1uYW1lXCIvPlxuICAgICAgICAgIDxidXR0b24gY2xhc3M9XCJsZW9uYXJkby1idXR0b24gbGVvbmFyZG8tYWRkLXNjZW5hcmlvLXNhdmVcIj5TYXZlPC9idXR0b24+XG4gICAgICAgICAgPGJ1dHRvbiBjbGFzcz1cImxlb25hcmRvLWJ1dHRvbiBsZW9uYXJkby1hZGQtc2NlbmFyaW8tY2FuY2VsXCI+Q2FuY2VsPC9idXR0b24+XG4gICAgICAgIDwvZGl2PmA7XG4gICAgdGhpcy5vbkl0ZW0oPEhUTUxFbGVtZW50PnRoaXMudmlld05vZGUucXVlcnlTZWxlY3RvcignLmxlb25hcmRvLWFkZC1zY2VuYXJpby1jYW5jZWwnKSwgJ2NsaWNrJywgdGhpcy5vbkNhbmNlbC5iaW5kKHRoaXMpKTtcbiAgICB0aGlzLm9uSXRlbSg8SFRNTEVsZW1lbnQ+dGhpcy52aWV3Tm9kZS5xdWVyeVNlbGVjdG9yKCcubGVvbmFyZG8tYWRkLXNjZW5hcmlvLXNhdmUnKSwgJ2NsaWNrJywgdGhpcy5vblNhdmUuYmluZCh0aGlzKSk7XG4gIH1cblxuICBvcGVuKCkge1xuICAgIHRoaXMucmVuZGVyKCk7XG4gICAgdGhpcy5vcGVuU3RhdGUgPSB0cnVlO1xuICAgIHRoaXMudmlld05vZGUuc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XG4gIH1cblxuICBjbG9zZSgpIHtcbiAgICB0aGlzLm9wZW5TdGF0ZSA9IGZhbHNlO1xuICAgIHRoaXMudmlld05vZGUuc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgfVxuXG4gIHRvZ2dsZSgpIHtcbiAgICBpZih0aGlzLm9wZW5TdGF0ZSl7XG4gICAgICB0aGlzLmNsb3NlKCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMub3BlbigpO1xuICB9XG5cbiAgcHJpdmF0ZSBvbkNhbmNlbCgpIHtcbiAgICB0aGlzLmNsb3NlKCk7XG4gIH1cblxuICBwcml2YXRlIG9uU2F2ZSgpIHtcbiAgICB0aGlzLmNsb3NlKCk7XG4gICAgRXZlbnRzLmRpc3BhdGNoKEV2ZW50cy5BRERfU0NFTkFSSU8sIHRoaXMudmlld05vZGUucXVlcnlTZWxlY3RvcignLmxlb25hcmRvLWFkZC1zY2VuYXJpby1uYW1lJykudmFsdWUpO1xuICB9XG59XG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vLi4vLi4vLi4vLi4vbGVvbmFyZG8uZC50c1wiIC8+XG5pbXBvcnQgVXRpbHMgZnJvbSAnLi4vLi4vLi4vLi4vdWktdXRpbHMnO1xuaW1wb3J0IEV2ZW50cyBmcm9tICcuLi8uLi8uLi8uLi91aS1ldmVudHMnO1xuaW1wb3J0IEFkZFNjZW5hcmlvIGZyb20gJy4vc3RhdGUtYWRkLXNjZW5hcmlvL3N0YXRlLWFkZC1zY2VuYXJpbyc7XG5pbXBvcnQgRE9NRWxlbWVudCBmcm9tICcuLi8uLi8uLi8uLi9ET01FbGVtZW50JztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU3RhdGVzQmFyIGV4dGVuZHMgRE9NRWxlbWVudHtcbiAgYWN0aXZlQWxsU3RhdGU6IGJvb2xlYW4gPSBmYWxzZTtcbiAgYWRkU2NlbmFyaW86IEFkZFNjZW5hcmlvID0gbmV3IEFkZFNjZW5hcmlvKCk7XG4gIGN1clNlYXJjaERhdGE6IHN0cmluZyA9ICcnO1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKGA8ZGl2IGNsYXNzPVwibGVvbmFyZG8tc3RhdGVzLWJhclwiPjwvZGl2PmApO1xuICB9XG5cbiAgcmVuZGVyKCkge1xuICAgIHN1cGVyLnJlbmRlcigpO1xuICAgIHRoaXMuY2xlYXJFdmVudFN1YnMoKTtcbiAgICB0aGlzLnZpZXdOb2RlLmlubmVySFRNTCA9IGBcbiAgICAgICAgPGlucHV0IHZhbHVlPVwiJHt0aGlzLmN1clNlYXJjaERhdGF9XCIgY2xhc3M9XCJsZW9uYXJkby1zZWFyY2gtc3RhdGVcIiBuYW1lPVwibGVvbmFyZG8tc2VhcmNoLXN0YXRlXCIgdHlwZT1cInRleHRcIiBwbGFjZWhvbGRlcj1cIlNlYXJjaC4uLlwiIC8+XG4gICAgICAgIDxkaXY+XG4gICAgICAgICAgPHNwYW4gY2xhc3M9XCJsZW9uYXJkby1idXR0b24gbGVvbmFyZG8tYWN0aXZhdGUtYWxsXCI+QWN0aXZhdGUgQWxsPC9zcGFuPlxuICAgICAgICAgIDxzcGFuIGNsYXNzPVwibGVvbmFyZG8tYnV0dG9uIGxlb25hcmRvLWFkZC1zY2VuYXJpby1idG5cIj5BZGQgU2NlbmFyaW88L3NwYW4+XG4gICAgICAgIDwvZGl2PmA7XG4gICAgdGhpcy52aWV3Tm9kZS5hcHBlbmRDaGlsZCh0aGlzLmFkZFNjZW5hcmlvLmdldCgpKTtcbiAgICB0aGlzLmFkZFNjZW5hcmlvLnJlbmRlcigpO1xuICAgIHRoaXMub25JdGVtKDxIVE1MRWxlbWVudD50aGlzLnZpZXdOb2RlLnF1ZXJ5U2VsZWN0b3IoJy5sZW9uYXJkby1zZWFyY2gtc3RhdGUnKSwgJ2tleXVwJywgdGhpcy5zZWFyY2hTdGF0ZXMuYmluZCh0aGlzKSk7XG4gICAgdGhpcy5vbkl0ZW0oPEhUTUxFbGVtZW50PnRoaXMudmlld05vZGUucXVlcnlTZWxlY3RvcignLmxlb25hcmRvLWFjdGl2YXRlLWFsbCcpLCAnY2xpY2snLCB0aGlzLnRvZ2dsZUFjdGl2YXRlQWxsLmJpbmQodGhpcykpO1xuICAgIHRoaXMub25JdGVtKDxIVE1MRWxlbWVudD50aGlzLnZpZXdOb2RlLnF1ZXJ5U2VsZWN0b3IoJy5sZW9uYXJkby1hZGQtc2NlbmFyaW8tYnRuJyksICdjbGljaycsIHRoaXMub25BZGRTY2VuYXJpby5iaW5kKHRoaXMpKTtcbiAgICB0aGlzLnNlYXJjaFN0YXRlcyh7dGFyZ2V0OiB7dmFsdWU6IHRoaXMuY3VyU2VhcmNoRGF0YX19KTtcbiAgfVxuXG4gIHNlYXJjaFN0YXRlcyhldnQpIHtcbiAgICB0aGlzLmN1clNlYXJjaERhdGEgPSBldnQudGFyZ2V0LnZhbHVlO1xuICAgIEV2ZW50cy5kaXNwYXRjaChFdmVudHMuRklMVEVSX1NUQVRFUywge3ZhbDogdGhpcy5jdXJTZWFyY2hEYXRhfSk7XG4gIH1cblxuICB0b2dnbGVBY3RpdmF0ZUFsbCgpIHtcbiAgICB0aGlzLmFjdGl2ZUFsbFN0YXRlID0gIXRoaXMuYWN0aXZlQWxsU3RhdGU7XG4gICAgTGVvbmFyZG8udG9nZ2xlQWN0aXZhdGVBbGwodGhpcy5hY3RpdmVBbGxTdGF0ZSk7XG4gICAgRXZlbnRzLmRpc3BhdGNoKEV2ZW50cy5UT0dHTEVfU1RBVEVTLCB0aGlzLmFjdGl2ZUFsbFN0YXRlKTtcbiAgICB0aGlzLnZpZXdOb2RlLnF1ZXJ5U2VsZWN0b3IoJy5sZW9uYXJkby1hY3RpdmF0ZS1hbGwnKVsnaW5uZXJIVE1MJ10gPSB0aGlzLmFjdGl2ZUFsbFN0YXRlID8gJ0RlYWN0aXZhdGUgYWxsJyA6ICdBY3RpdmF0ZSBhbGwnO1xuICB9XG5cbiAgb25BZGRTY2VuYXJpbygpIHtcbiAgICB0aGlzLmFkZFNjZW5hcmlvLm9wZW4oKTtcbiAgfVxuXG59XG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vLi4vLi4vLi4vbGVvbmFyZG8uZC50c1wiIC8+XG5pbXBvcnQgVXRpbHMgZnJvbSAnLi4vLi4vLi4vdWktdXRpbHMnO1xuaW1wb3J0IEV2ZW50cyBmcm9tICcuLi8uLi8uLi91aS1ldmVudHMnO1xuaW1wb3J0IFN0YXRlSXRlbSBmcm9tICcuL3N0YXRlLWl0ZW0vc3RhdGUtaXRlbSc7XG5pbXBvcnQgU3RhdGVzQmFyIGZyb20gJy4vc3RhdGVzLWJhci9zdGF0ZXMtYmFyJztcbmltcG9ydCBTdGF0ZURldGFpbCBmcm9tICcuL3N0YXRlLWRldGFpbC9zdGF0ZXMtZGV0YWlsJztcbmltcG9ydCBET01FbGVtZW50IGZyb20gJy4uLy4uLy4uL0RPTUVsZW1lbnQnO1xuaW1wb3J0IHtFdmVudFN1Yn0gZnJvbSAnLi4vLi4vLi4vdWktZXZlbnRzJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU3RhdGVzTGlzdCBleHRlbmRzIERPTUVsZW1lbnQge1xuICBzdGF0ZXNCYXIgPSBuZXcgU3RhdGVzQmFyKCk7XG4gIHN0YXRlRGV0YWlsID0gbmV3IFN0YXRlRGV0YWlsKHRoaXMub25TdGF0ZURldGFpbFNhdmUuYmluZCh0aGlzKSwgdGhpcy5jbGVhclNlbGVjdGVkLmJpbmQodGhpcykpO1xuICBzdGF0ZXNFbGVtZW50czogU3RhdGVJdGVtW10gPSBbXTtcbiAgYm9keUV2ZW50U3ViczogQXJyYXk8RXZlbnRTdWI+ID0gW107XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoYDxkaXYgaWQ9XCJsZW9uYXJkby1zdGF0ZXMtbGlzdFwiIGNsYXNzPVwibGVvbmFyZG8tc3RhdGVzLWxpc3RcIj48L2Rpdj5gKTtcbiAgICB0aGlzLmJvZHlFdmVudFN1YnMucHVzaChFdmVudHMub24oRXZlbnRzLkZJTFRFUl9TVEFURVMsIHRoaXMub25GaWx0ZXJTdGF0ZXMuYmluZCh0aGlzKSkpO1xuICAgIHRoaXMuYm9keUV2ZW50U3Vicy5wdXNoKEV2ZW50cy5vbihFdmVudHMuQUREX1NDRU5BUklPLCB0aGlzLmFkZFNjZW5hcmlvLmJpbmQodGhpcykpKTtcbiAgfVxuXG4gIHJlbmRlcigpIHtcbiAgICBzdXBlci5yZW5kZXIoKTtcbiAgICB0aGlzLmNsZWFyRXZlbnRTdWJzKCk7XG4gICAgdGhpcy52aWV3Tm9kZS5hcHBlbmRDaGlsZCh0aGlzLnN0YXRlc0Jhci5nZXQoKSk7XG4gICAgRXZlbnRzLmRpc3BhdGNoKEV2ZW50cy5BVFRBQ0hfTUVOVV9JVEVNLCB0aGlzLnN0YXRlRGV0YWlsLmdldCgpKTtcbiAgICB0aGlzLnN0YXRlc0VsZW1lbnRzLmxlbmd0aCA9IDA7XG4gICAgTGVvbmFyZG8uZ2V0U3RhdGVzKClcbiAgICAgIC5tYXAoKHN0YXRlKSA9PiBuZXcgU3RhdGVJdGVtKHN0YXRlLCB0aGlzLnJlbW92ZVN0YXRlQnlOYW1lLmJpbmQodGhpcykpKVxuICAgICAgLmZvckVhY2goKHN0YXRlRWxtKSA9PiB7XG4gICAgICAgIHRoaXMuc3RhdGVzRWxlbWVudHMucHVzaChzdGF0ZUVsbSk7XG4gICAgICAgIHRoaXMudmlld05vZGUuYXBwZW5kQ2hpbGQoc3RhdGVFbG0uZ2V0KCkpO1xuICAgICAgICB0aGlzLm9uSXRlbShzdGF0ZUVsbS5nZXQoKSwgJ2NsaWNrJywgdGhpcy50b2dnbGVEZXRhaWwuYmluZCh0aGlzLCBzdGF0ZUVsbSkpO1xuICAgICAgICBzdGF0ZUVsbS5yZW5kZXIoKTtcbiAgICAgIH0pO1xuICAgIHRoaXMuc3RhdGVzQmFyLnJlbmRlcigpO1xuICB9XG5cbiAgb25GaWx0ZXJTdGF0ZXMoZGF0YTogQ3VzdG9tRXZlbnQpIHtcbiAgICB0aGlzLnN0YXRlc0VsZW1lbnRzLmZvckVhY2goKHN0YXRlRWxtOiBTdGF0ZUl0ZW0pID0+IHtcbiAgICAgIGlmIChzdGF0ZUVsbS5nZXROYW1lKCkudG9Mb3dlckNhc2UoKS5pbmRleE9mKGRhdGEuZGV0YWlsLnZhbC50b0xvd2VyQ2FzZSgpKSA+PSAwKSB7XG4gICAgICAgIHN0YXRlRWxtLnRvZ2dsZVZpc2libGUodHJ1ZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzdGF0ZUVsbS50b2dnbGVWaXNpYmxlKGZhbHNlKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIHJlbW92ZVN0YXRlQnlOYW1lKHN0YXRlTmFtZTogc3RyaW5nLCBzdGF0ZVZpZXc6IEhUTUxFbGVtZW50KSB7XG4gICAgdGhpcy5zdGF0ZXNFbGVtZW50cyA9IHRoaXMuc3RhdGVzRWxlbWVudHMuZmlsdGVyKChzdGF0ZSkgPT4ge1xuICAgICAgcmV0dXJuIHN0YXRlLmdldE5hbWUoKSAhPT0gc3RhdGVOYW1lO1xuICAgIH0pO1xuICAgIHRoaXMudmlld05vZGUucmVtb3ZlQ2hpbGQoc3RhdGVWaWV3KTtcbiAgfVxuXG4gIHByaXZhdGUgdG9nZ2xlRGV0YWlsKHN0YXRlRWxtOiBTdGF0ZUl0ZW0sIGV2ZW50OiBFdmVudCkge1xuICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgIGNvbnN0IG9wZW46IGJvb2xlYW4gPSBzdGF0ZUVsbS5nZXQoKS5jbGFzc0xpc3QuY29udGFpbnMoJ2xlb25hcmRvLXN0YXRlLWl0ZW0tZGV0YWlsZWQnKTtcbiAgICB0aGlzLmNsZWFyU2VsZWN0ZWQoKTtcbiAgICBpZighb3Blbil7XG4gICAgICBzdGF0ZUVsbS5nZXQoKS5jbGFzc0xpc3QuYWRkKCdsZW9uYXJkby1zdGF0ZS1pdGVtLWRldGFpbGVkJyk7XG4gICAgfVxuXG4gICAgdGhpcy5zdGF0ZURldGFpbC50b2dnbGUoc3RhdGVFbG0uZ2V0U3RhdGUoKSk7XG4gIH1cblxuICBwcml2YXRlIGNsZWFyU2VsZWN0ZWQoKXtcbiAgICB0aGlzLnN0YXRlc0VsZW1lbnRzLmZvckVhY2goKGN1clN0YXRlKSA9PiB7XG4gICAgICBjdXJTdGF0ZS5nZXQoKS5jbGFzc0xpc3QucmVtb3ZlKCdsZW9uYXJkby1zdGF0ZS1pdGVtLWRldGFpbGVkJyk7XG4gICAgfSk7XG4gIH1cblxuICBwcml2YXRlIG9uU3RhdGVEZXRhaWxTYXZlKCl7XG4gICAgdGhpcy5jbGVhclNlbGVjdGVkKCk7XG4gIH1cblxuICBwcml2YXRlIGFkZFNjZW5hcmlvKGV2ZW50OiBDdXN0b21FdmVudCkge1xuICAgIGNvbnN0IHN0YXRlczogQXJyYXk8YW55PiA9IHRoaXMuc3RhdGVzRWxlbWVudHMubWFwKChzdGF0ZUVsZW06IFN0YXRlSXRlbSkgPT4ge1xuICAgICAgcmV0dXJuIHN0YXRlRWxlbS5nZXRTdGF0ZSgpO1xuICAgIH0pLmZpbHRlcigoc3RhdGUpID0+IHN0YXRlLmFjdGl2ZSlcbiAgICAgIC5tYXAoKHN0YXRlOiBhbnkpID0+IHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBuYW1lOiBzdGF0ZS5uYW1lLFxuICAgICAgICAgIG9wdGlvbjogc3RhdGUuYWN0aXZlT3B0aW9uLm5hbWVcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgTGVvbmFyZG8uYWRkU2NlbmFyaW8oe1xuICAgICAgbmFtZTogZXZlbnQuZGV0YWlsLFxuICAgICAgc3RhdGVzOiBzdGF0ZXMsXG4gICAgICBmcm9tX2xvY2FsOiB0cnVlXG4gICAgfSwgdHJ1ZSk7XG4gIH1cbiAgXG4gIGRlc3Ryb3koKXtcbiAgICB0aGlzLmNsZWFyU2V0RXZlbnRTdWJzKHRoaXMuYm9keUV2ZW50U3Vicyk7XG4gIH1cblxufVxuIiwiZXhwb3J0IGRlZmF1bHQgY2xhc3MgVXRpbHMge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgfVxuXG4gIHN0YXRpYyBpc1VuZGVmaW5lZCh2YWx1ZSkge1xuICAgIHJldHVybiB0eXBlb2YgdmFsdWUgPT09ICd1bmRlZmluZWQnO1xuICB9XG5cbiAgc3RhdGljIGlzTnVtYmVyKHZhbHVlKSB7XG4gICAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcic7XG4gIH1cblxuICBzdGF0aWMgaXNGdW5jdGlvbih2YWx1ZSkge1xuICAgIHJldHVybiB0eXBlb2YgdmFsdWUgPT09ICdmdW5jdGlvbic7XG4gIH1cblxuICBzdGF0aWMgaXNTdHJpbmcodmFsdWUpIHtcbiAgICByZXR1cm4gdHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJztcbiAgfVxuXG4gIHN0YXRpYyBmcm9tSnNvbihqc29uKSB7XG4gICAgcmV0dXJuIHRoaXMuaXNTdHJpbmcoanNvbilcbiAgICAgID8gSlNPTi5wYXJzZShqc29uKVxuICAgICAgOiBqc29uO1xuICB9XG5cbiAgc3RhdGljIHRvSnNvbihvYmosIHByZXR0eT8pIHtcbiAgICBpZiAodGhpcy5pc1VuZGVmaW5lZChvYmopKSByZXR1cm4gdW5kZWZpbmVkO1xuICAgIGlmICghdGhpcy5pc051bWJlcihwcmV0dHkpKSB7XG4gICAgICBwcmV0dHkgPSBwcmV0dHkgPyAyIDogbnVsbDtcbiAgICB9XG4gICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KG9iaiwgbnVsbCwgcHJldHR5KTtcbiAgfVxufVxuIl19

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
"  background-image: url('data:image/png;base64,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');\n" +
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
"  transition: width 200ms ease-in;\n" +
"  max-width: 100%;\n" +
"  width: 100%;\n" +
"  height: calc(100% - 47px);\n" +
"  will-change: width;\n" +
"}\n" +
".leonardo-main-view-menu {\n" +
"  position: absolute;\n" +
"  right: 0;\n" +
"  top: 0;\n" +
"  bottom: 0;\n" +
"  transition: transform 200ms ease-in;\n" +
"  will-change: transform;\n" +
"  transform: translateX(100%);\n" +
"  padding-top: 47px;\n" +
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
"  background: #43A047;\n" +
"  color: #fff;\n" +
"  border: 0;\n" +
"  margin-left: 0;\n" +
"  position: relative;\n" +
"  width: 200px;\n" +
"  cursor: pointer;\n" +
"}\n" +
".leonardo-dropdown .leonardo-dropdown-selected[disabled] {\n" +
"  cursor: default;\n" +
"  opacity: 0.6;\n" +
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
"  border: 1px solid #212121;\n" +
"  border-top: none;\n" +
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
"  padding: 7px 5px;\n" +
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
"  height: 100%;\n" +
"  display: flex;\n" +
"}\n" +
".leonardo-states-list {\n" +
"  width: 100%;\n" +
"  height: 100%;\n" +
"  padding-left: 10px;\n" +
"  padding-top: 10px;\n" +
"  overflow: auto;\n" +
"  transition: width 200ms ease-out;\n" +
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
"  padding-left: 0;\n" +
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
"  background: #43A047;\n" +
"}\n" +
".leonardo-state-item .leonardo-state-verb-custom {\n" +
"  background: #212121;\n" +
"}\n" +
".leonardo-state-item .leonardo-state-verb-post {\n" +
"  background: #F57C00;\n" +
"}\n" +
".leonardo-state-item .leonardo-state-verb-put {\n" +
"  background: #0066cc;\n" +
"}\n" +
".leonardo-state-item .leonardo-state-verb-delete {\n" +
"  background: #003366;\n" +
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
"  margin: 0 5px;\n" +
"  align-self: center;\n" +
"  border: 1px inset #E0E0E0;\n" +
"  padding: 10px;\n" +
"  border-radius: 5px;\n" +
"}\n" +
".leonardo-state-item .leonardo-state-remove:active {\n" +
"  border: 1px solid #E0E0E0;\n" +
"}\n" +
".leonardo-state-item.leonardo-state-item-hidden {\n" +
"  display: none;\n" +
"}\n" +
".leonardo-state-detail {\n" +
"  height: 100%;\n" +
"  border: 1px solid #ccc;\n" +
"  border-top: none;\n" +
"  background: white;\n" +
"  z-index: 100;\n" +
"  border-top: 2px solid #ccc;\n" +
"  padding: 10px;\n" +
"  color: #212121;\n" +
"  width: 400px;\n" +
"}\n" +
".leonardo-state-detail .leonardo-states-detail-container {\n" +
"  margin-top: 0;\n" +
"}\n" +
".leonardo-state-detail .leonardo-states-detail-top {\n" +
"  font-size: 19px;\n" +
"  padding-bottom: 20px;\n" +
"  border-bottom: 1px solid #ccc;\n" +
"}\n" +
".leonardo-state-detail .leonardo-states-detail-input {\n" +
"  margin-right: 10px;\n" +
"  font-size: 14px;\n" +
"  display: inline-block;\n" +
"}\n" +
".leonardo-state-detail .leonardo-states-detail-input input {\n" +
"  display: inline-block;\n" +
"  width: 150px;\n" +
"  color: #78788c;\n" +
"  padding: 10px;\n" +
"  box-sizing: border-box;\n" +
"  background: none;\n" +
"  outline: none;\n" +
"  resize: none;\n" +
"  border: 0;\n" +
"  transition: all .3s;\n" +
"  border-bottom: 1px solid #bebed2;\n" +
"  font-size: 14px;\n" +
"}\n" +
".leonardo-state-detail .leonardo-states-detail-input input:focus {\n" +
"  border-bottom: 1px solid #78788c;\n" +
"}\n" +
".leonardo-state-detail div {\n" +
"  margin-top: 20px;\n" +
"}\n" +
".leonardo-state-detail textarea {\n" +
"  display: block;\n" +
"  height: 200px;\n" +
"  width: 100%;\n" +
"  border: 1px solid #bebed2;\n" +
"}\n" +
".leonardo-state-detail .leonardo-states-detail-buttons {\n" +
"  margin: auto;\n" +
"}\n" +
".leonardo-state-detail .leonardo-states-detail-buttons button {\n" +
"  background: #0066cc;\n" +
"  color: white;\n" +
"  margin-top: 10px;\n" +
"  width: 49%;\n" +
"  height: 35px;\n" +
"}\n" +
".leonardo-state-detail-recorder {\n" +
"  height: 100%;\n" +
"  border: 1px solid #ccc;\n" +
"  border-top: none;\n" +
"  background: white;\n" +
"  z-index: 100;\n" +
"  border-top: 2px solid #ccc;\n" +
"  padding: 10px;\n" +
"  color: #212121;\n" +
"  width: 400px;\n" +
"}\n" +
".leonardo-state-detail-recorder .leonardo-states-detail-container {\n" +
"  margin-top: 0;\n" +
"}\n" +
".leonardo-state-detail-recorder .leonardo-states-detail-top {\n" +
"  font-size: 19px;\n" +
"  padding-bottom: 20px;\n" +
"  border-bottom: 1px solid #ccc;\n" +
"}\n" +
".leonardo-state-detail-recorder .leonardo-states-detail-input {\n" +
"  margin-right: 10px;\n" +
"  font-size: 14px;\n" +
"  display: inline-block;\n" +
"}\n" +
".leonardo-state-detail-recorder .leonardo-states-detail-input input {\n" +
"  display: inline-block;\n" +
"  width: 150px;\n" +
"  color: #78788c;\n" +
"  padding: 10px;\n" +
"  box-sizing: border-box;\n" +
"  background: none;\n" +
"  outline: none;\n" +
"  resize: none;\n" +
"  border: 0;\n" +
"  transition: all .3s;\n" +
"  border-bottom: 1px solid #bebed2;\n" +
"  font-size: 14px;\n" +
"}\n" +
".leonardo-state-detail-recorder .leonardo-states-detail-input input:focus {\n" +
"  border-bottom: 1px solid #78788c;\n" +
"}\n" +
".leonardo-state-detail-recorder div {\n" +
"  margin-top: 20px;\n" +
"}\n" +
".leonardo-state-detail-recorder textarea {\n" +
"  display: block;\n" +
"  height: 200px;\n" +
"  width: 100%;\n" +
"  border: 1px solid #bebed2;\n" +
"}\n" +
".leonardo-state-detail-recorder .leonardo-states-detail-buttons {\n" +
"  margin: auto;\n" +
"}\n" +
".leonardo-state-detail-recorder .leonardo-states-detail-buttons button {\n" +
"  background: #0066cc;\n" +
"  color: white;\n" +
"  margin-top: 10px;\n" +
"  width: 49%;\n" +
"  height: 35px;\n" +
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
"  height: 100%;\n" +
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
"  flex-grow: 10;\n" +
"  white-space: nowrap;\n" +
"  overflow: hidden;\n" +
"  text-overflow: ellipsis;\n" +
"  padding-right: 5px;\n" +
"  line-height: 25px;\n" +
"  font-size: 13px;\n" +
"  color: #555;\n" +
"}\n" +
".leonardo-recorder-list .leonardo-recorder-list-container .leonardo-recorder-list-item .leonardo-recorder-list-name {\n" +
"  background: #53131E;\n" +
"  display: inline-block;\n" +
"  padding: 5px 10px;\n" +
"  font-size: 12px;\n" +
"  margin: 0 2px;\n" +
"  color: white;\n" +
"  justify-content: flex-end;\n" +
"  align-self: flex-end;\n" +
"  white-space: nowrap;\n" +
"  text-align: center;\n" +
"  width: 150px;\n" +
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
"  background: #43A047;\n" +
"}\n" +
".leonardo-recorder-list .leonardo-recorder-list-container .leonardo-recorder-list-item .leonardo-recorder-list-verb-custom {\n" +
"  background: #212121;\n" +
"}\n" +
".leonardo-recorder-list .leonardo-recorder-list-container .leonardo-recorder-list-item .leonardo-recorder-list-verb-post {\n" +
"  background: #F57C00;\n" +
"}\n" +
".leonardo-recorder-list .leonardo-recorder-list-container .leonardo-recorder-list-item .leonardo-recorder-list-verb-put {\n" +
"  background: #0066cc;\n" +
"}\n" +
".leonardo-recorder-list .leonardo-recorder-list-container .leonardo-recorder-list-item .leonardo-recorder-list-verb-delete {\n" +
"  background: #003366;\n" +
"}\n" +
".leonardo-recorder-list .leonardo-recorder-list-container .leonardo-recorder-list-item:nth-child(even) {\n" +
"  background: #F2F2F2;\n" +
"}\n" +
".leonardo-export {\n" +
"  overflow: auto;\n" +
"}\n" +
".leonardo-export .leonardo-export-buttons {\n" +
"  float: right;\n" +
"  margin-right: 30px;\n" +
"  margin-top: 30px;\n" +
"  border: 2px solid;\n" +
"  border-radius: 6px;\n" +
"  width: 180px;\n" +
"  height: 42px;\n" +
"  font-size: 110%;\n" +
"}\n" +
".leonardo-export .leonardo-exported-code {\n" +
"  width: 95%;\n" +
"  margin: auto;\n" +
"  border: 1px solid gray;\n" +
"  border-radius: 5px;\n" +
"}\n" +
".leonardo-export .leonardo-spacer {\n" +
"  height: 100px;\n" +
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
"  background: #43A047;\n" +
"}\n" +
".leonardo-toggle-ios:checked + .leonardo-toggle-btn:active {\n" +
"  box-shadow: none;\n" +
"}\n" +
".leonardo-toggle-ios:checked + .leonardo-toggle-btn:active:after {\n" +
"  margin-left: -0.8em;\n" +
"}\n" +
".leonardo-button {\n" +
"  background: white;\n" +
"  color: #212121;\n" +
"  border: 1px solid #E0E0E0;\n" +
"  font-size: 12px;\n" +
"  cursor: pointer;\n" +
"  padding: 5px 10px;\n" +
"  border-radius: 2px;\n" +
"}\n" +
".leonardo-button:hover {\n" +
"  background: #E0E0E0;\n" +
"}\n" +
".leonardo-x-btn {\n" +
"  overflow: hidden;\n" +
"  position: relative;\n" +
"  width: 12px;\n" +
"  height: 12px;\n" +
"}\n" +
".leonardo-x-btn:hover::before,\n" +
".leonardo-x-btn:hover::after {\n" +
"  background: darkgray;\n" +
"}\n" +
".leonardo-x-btn::before,\n" +
".leonardo-x-btn::after {\n" +
"  content: '';\n" +
"  position: absolute;\n" +
"  height: 1px;\n" +
"  width: 100%;\n" +
"  top: 50%;\n" +
"  left: 0;\n" +
"  background: #000;\n" +
"  border-radius: 5px;\n" +
"}\n" +
".leonardo-x-btn::before {\n" +
"  transform: rotate(45deg);\n" +
"}\n" +
".leonardo-x-btn::after {\n" +
"  transform: rotate(-45deg);\n" +
"}"));

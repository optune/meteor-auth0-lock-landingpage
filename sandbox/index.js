// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"utils/Random.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Random = void 0;

// Source: https://github.com/RebelMail/meteor-random
// No dependency to nodes's crypto for bundle size reasons
// We use cryptographically strong PRNGs (crypto.getRandomBytes() on the server,
// window.crypto.getRandomValues() in the browser) when available. If these
// PRNGs fail, we fall back to the Alea PRNG, which is not cryptographically
// strong, and we seed it with various sources such as the date, Math.random,
// and window size on the client.  When using crypto.getRandomValues(), our
// primitive is hexString(), from which we construct fraction(). When using
// window.crypto.getRandomValues() or alea, the primitive is fraction and we use
// that to construct hex string.
// see http://baagoe.org/en/wiki/Better_random_numbers_for_javascript
// for a full discussion and Alea implementation.
var Alea = function Alea() {
  function Mash() {
    var n = 0xefc8249d;

    var mash = function mash(data) {
      data = data.toString();

      for (var i = 0; i < data.length; i++) {
        n += data.charCodeAt(i);
        var h = 0.02519603282416938 * n;
        n = h >>> 0;
        h -= n;
        h *= n;
        n = h >>> 0;
        h -= n;
        n += h * 0x100000000; // 2^32
      }

      return (n >>> 0) * 2.3283064365386963e-10; // 2^-32
    };

    mash.version = 'Mash 0.9';
    return mash;
  }

  return function (args) {
    var s0 = 0;
    var s1 = 0;
    var s2 = 0;
    var c = 1;

    if (args.length == 0) {
      args = [+new Date()];
    }

    var mash = Mash();
    s0 = mash(' ');
    s1 = mash(' ');
    s2 = mash(' ');

    for (var i = 0; i < args.length; i++) {
      s0 -= mash(args[i]);

      if (s0 < 0) {
        s0 += 1;
      }

      s1 -= mash(args[i]);

      if (s1 < 0) {
        s1 += 1;
      }

      s2 -= mash(args[i]);

      if (s2 < 0) {
        s2 += 1;
      }
    }

    mash = null;

    var random = function random() {
      var t = 2091639 * s0 + c * 2.3283064365386963e-10; // 2^-32

      s0 = s1;
      s1 = s2;
      return s2 = t - (c = t | 0);
    };

    random.uint32 = function () {
      return random() * 0x100000000; // 2^32
    };

    random.fract53 = function () {
      return random() + (random() * 0x200000 | 0) * 1.1102230246251565e-16; // 2^-53
    };

    random.version = 'Alea 0.9';
    random.args = args;
    return random;
  }(Array.prototype.slice.call(arguments));
};

var UNMISTAKABLE_CHARS = '23456789ABCDEFGHJKLMNPQRSTWXYZabcdefghijkmnopqrstuvwxyz';
var BASE64_CHARS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ' + '0123456789-_'; // If seeds are provided, then the alea PRNG will be used, since cryptographic
// PRNGs (Node crypto and window.crypto.getRandomValues) don't allow us to
// specify seeds. The caller is responsible for making sure to provide a seed
// for alea if a csprng is not available.

var RandomGenerator = function RandomGenerator(seedArray) {
  var self = this;
  if (seedArray !== undefined) self.alea = Alea.apply(null, seedArray);
};

RandomGenerator.prototype.fraction = function () {
  var self = this;

  if (self.alea) {
    return self.alea();
  } else if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    var array = new Uint32Array(1);
    window.crypto.getRandomValues(array);
    return array[0] * 2.3283064365386963e-10; // 2^-32
  } else {
    throw new Error('No random generator available');
  }
};

RandomGenerator.prototype.hexString = function (digits) {
  var self = this;
  var hexDigits = [];

  for (var i = 0; i < digits; ++i) {
    hexDigits.push(self.choice('0123456789abcdef'));
  }

  return hexDigits.join('');
};

RandomGenerator.prototype._randomString = function (charsCount, alphabet) {
  var self = this;
  var digits = [];

  for (var i = 0; i < charsCount; i++) {
    digits[i] = self.choice(alphabet);
  }

  return digits.join('');
};

RandomGenerator.prototype.id = function (charsCount) {
  var self = this; // 17 characters is around 96 bits of entropy, which is the amount of
  // state in the Alea PRNG.

  if (charsCount === undefined) charsCount = 17;
  return self._randomString(charsCount, UNMISTAKABLE_CHARS);
};

RandomGenerator.prototype.secret = function (charsCount) {
  var self = this; // Default to 256 bits of entropy, or 43 characters at 6 bits per
  // character.

  if (charsCount === undefined) charsCount = 43;
  return self._randomString(charsCount, BASE64_CHARS);
};

RandomGenerator.prototype.choice = function (arrayOrString) {
  var index = Math.floor(this.fraction() * arrayOrString.length);
  if (typeof arrayOrString === 'string') return arrayOrString.substr(index, 1);else return arrayOrString[index];
}; // instantiate RNG.  Heuristically collect entropy from various sources when a
// cryptographic PRNG isn't available.
// client sources


var height = typeof window !== 'undefined' && window.innerHeight || typeof document !== 'undefined' && document.documentElement && document.documentElement.clientHeight || typeof document !== 'undefined' && document.body && document.body.clientHeight || 1;
var width = typeof window !== 'undefined' && window.innerWidth || typeof document !== 'undefined' && document.documentElement && document.documentElement.clientWidth || typeof document !== 'undefined' && document.body && document.body.clientWidth || 1;
var agent = typeof navigator !== 'undefined' && navigator.userAgent || '';
var RandomInstance;

if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
  RandomInstance = new RandomGenerator();
} else {
  RandomInstance = new RandomGenerator([new Date(), height, width, agent, Math.random()]);
}

RandomInstance.createWithSeeds = function () {
  if (arguments.length === 0) {
    throw new Error('No seeds were provided');
  }

  return new RandomGenerator(arguments);
};

var Random = RandomInstance;
exports.Random = Random;
},{}],"utils/Base64.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Base64 = void 0;
// Source: https://github.com/meteor/meteor/blob/master/packages/base64/base64.js
// Base 64 encoding
var BASE_64_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
var BASE_64_VALS = Object.create(null);

var getChar = function getChar(val) {
  return BASE_64_CHARS.charAt(val);
};

var getVal = function getVal(ch) {
  return ch === '=' ? -1 : BASE_64_VALS[ch];
};

for (var i = 0; i < BASE_64_CHARS.length; i++) {
  BASE_64_VALS[getChar(i)] = i;
}

var encode = function encode(array) {
  if (typeof array === 'string') {
    var str = array;
    array = newBinary(str.length);

    for (var _i = 0; _i < str.length; _i++) {
      var ch = str.charCodeAt(_i);

      if (ch > 0xff) {
        throw new Error('Not ascii. Base64.encode can only take ascii strings.');
      }

      array[_i] = ch;
    }
  }

  var answer = [];
  var a = null;
  var b = null;
  var c = null;
  var d = null;

  for (var _i2 = 0; _i2 < array.length; _i2++) {
    switch (_i2 % 3) {
      case 0:
        a = array[_i2] >> 2 & 0x3f;
        b = (array[_i2] & 0x03) << 4;
        break;

      case 1:
        b = b | array[_i2] >> 4 & 0xf;
        c = (array[_i2] & 0xf) << 2;
        break;

      case 2:
        c = c | array[_i2] >> 6 & 0x03;
        d = array[_i2] & 0x3f;
        answer.push(getChar(a));
        answer.push(getChar(b));
        answer.push(getChar(c));
        answer.push(getChar(d));
        a = null;
        b = null;
        c = null;
        d = null;
        break;
    }
  }

  if (a != null) {
    answer.push(getChar(a));
    answer.push(getChar(b));

    if (c == null) {
      answer.push('=');
    } else {
      answer.push(getChar(c));
    }

    if (d == null) {
      answer.push('=');
    }
  }

  return answer.join('');
}; // XXX This is a weird place for this to live, but it's used both by
// this package and 'ejson', and we can't put it in 'ejson' without
// introducing a circular dependency. It should probably be in its own
// package or as a helper in a package that both 'base64' and 'ejson'
// use.


var newBinary = function newBinary(len) {
  if (typeof Uint8Array === 'undefined' || typeof ArrayBuffer === 'undefined') {
    var ret = [];

    for (var _i3 = 0; _i3 < len; _i3++) {
      ret.push(0);
    }

    ret.$Uint8ArrayPolyfill = true;
    return ret;
  }

  return new Uint8Array(new ArrayBuffer(len));
};

var Base64 = {
  encode: encode
};
exports.Base64 = Base64;
},{}],"index.js":[function(require,module,exports) {
"use strict";

var _Random = require("./utils/Random");

var _Base = require("./utils/Base64");

Auth0 = {};
var auht0Lock;
var Auth0ClientId = "ho1SNBhB97YLmVZPZcbfdtvsH6EVNT5c";
var Auth0Domain = "auth-dev.onescreener.com";
var LoginUrl = "https://sandbox.onescreener.com";
var theme = {
  logo: 'https://res.cloudinary.com/optune-me/image/upload/c_pad,h_58,w_200/v1558014130/onescreener-v2/app/logo-onescreener.png',
  primaryColor: '#27E200'
}; // Source: https://github.com/meteor/meteor/blob/master/packages/reload/reload.js
//
// This logic for sessionStorage detection is based on browserstate/history.js

var KEY_NAME = 'Meteor_Reload'; // Source: https://github.com/meteor/meteor/blob/master/packages/oauth/oauth_client.js

Auth0._getCookie = function (_ref) {
  var migrationData = _ref.migrationData;
  var cookie = "".concat(KEY_NAME, "=").concat(encodeURIComponent(JSON.stringify(migrationData)), "; domain=").concat(".onescreener.com", "; max-age=").concat(5 * 60, "; path=/;");
  return cookie;
};

Auth0._saveDataForRedirect = function (_ref2) {
  var credentialToken = _ref2.credentialToken;
  if (credentialToken === undefined || credentialToken === null) return false;
  var migrationData = {
    oauth: {
      loginService: 'auth0',
      credentialToken: credentialToken
    }
  };

  try {
    document.cookie = Auth0._getCookie({
      migrationData: migrationData
    });
  } catch (err) {
    // We should have already checked this, but just log - don't throw
    console.error(err);
    throw "Couldn't save data for migration to cookie";
  }

  return true;
}; // Source: https://github.com/meteor/meteor/blob/master/packages/oauth/oauth_client.js


Auth0._stateParam = function (credentialToken, redirectUrl) {
  var state = {
    loginStyle: 'redirect',
    credentialToken: credentialToken,
    isCordova: false
  };
  console.log(state);
  state.redirectUrl = redirectUrl || '' + window.location; // Encode base64 as not all login services URI-encode the state
  // parameter when they pass it back to us.
  // Use the 'base64' package here because 'btoa' isn't supported in IE8/9.

  return _Base.Base64.encode(JSON.stringify(state));
}; // @params type: Can be 'login' or 'signup'
// @params loginUrl: Login base url
// @params containerId: Id of the html element the lock widget shall be shown inline. If not set a overlay will be shown


Auth0.showLock = function () {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {
    type: 'login'
  };

  var credentialToken = _Random.Random.secret();

  Auth0._saveDataForRedirect({
    credentialToken: credentialToken
  });

  var isLogin = options.type === 'login';
  var isSignup = options.type === 'signup';
  var redirectUrl = "".concat(LoginUrl, "/_oauth/auth0");

  if (options.type) {
    redirectUrl = "".concat(redirectUrl, "#").concat(options.type);
  }

  var languageDictionary = {
    title: isLogin && 'Log in',
    signUpTitle: 'Get started for free'
  }; // Combine lock options

  var lockOptions = {
    auth: {
      redirectUrl: redirectUrl,
      params: {
        state: Auth0._stateParam(credentialToken, "".concat(LoginUrl, "/"))
      }
    },
    allowedConnections: isSignup && ['Username-Password-Authentication'] || null,
    rememberLastLogin: true,
    languageDictionary: languageDictionary,
    theme: theme,
    closable: true,
    container: options.containerId,
    allowLogin: isLogin,
    allowSignUp: isSignup
  }; // Initialize lock

  auht0Lock = new Auth0Lock(Auth0ClientId, Auth0Domain, lockOptions); // Show lock

  auht0Lock.show();
};

Auth0.closeLock = function () {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  auht0Lock = null;

  if (options.containerId) {
    // Get the container element
    var container = document.getElementById(options.containerId); // As long as <ul> has a child node, remove it

    if (container.hasChildNodes()) {
      container.removeChild(container.firstChild);
    }
  }
};
},{"./utils/Random":"utils/Random.js","./utils/Base64":"utils/Base64.js"}],"../node_modules/parcel-bundler/src/builtins/hmr-runtime.js":[function(require,module,exports) {
var global = arguments[3];
var OVERLAY_ID = '__parcel__error__overlay__';
var OldModule = module.bundle.Module;

function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    data: module.bundle.hotData,
    _acceptCallbacks: [],
    _disposeCallbacks: [],
    accept: function (fn) {
      this._acceptCallbacks.push(fn || function () {});
    },
    dispose: function (fn) {
      this._disposeCallbacks.push(fn);
    }
  };
  module.bundle.hotData = null;
}

module.bundle.Module = Module;
var checkedAssets, assetsToAccept;
var parent = module.bundle.parent;

if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = "" || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "60703" + '/');

  ws.onmessage = function (event) {
    checkedAssets = {};
    assetsToAccept = [];
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      var handled = false;
      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          var didAccept = hmrAcceptCheck(global.parcelRequire, asset.id);

          if (didAccept) {
            handled = true;
          }
        }
      }); // Enable HMR for CSS by default.

      handled = handled || data.assets.every(function (asset) {
        return asset.type === 'css' && asset.generated.js;
      });

      if (handled) {
        console.clear();
        data.assets.forEach(function (asset) {
          hmrApply(global.parcelRequire, asset);
        });
        assetsToAccept.forEach(function (v) {
          hmrAcceptRun(v[0], v[1]);
        });
      } else if (location.reload) {
        // `location` global exists in a web worker context but lacks `.reload()` function.
        location.reload();
      }
    }

    if (data.type === 'reload') {
      ws.close();

      ws.onclose = function () {
        location.reload();
      };
    }

    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');
      removeErrorOverlay();
    }

    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + data.error.stack);
      removeErrorOverlay();
      var overlay = createErrorOverlay(data);
      document.body.appendChild(overlay);
    }
  };
}

function removeErrorOverlay() {
  var overlay = document.getElementById(OVERLAY_ID);

  if (overlay) {
    overlay.remove();
  }
}

function createErrorOverlay(data) {
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID; // html encode message and stack trace

  var message = document.createElement('div');
  var stackTrace = document.createElement('pre');
  message.innerText = data.error.message;
  stackTrace.innerText = data.error.stack;
  overlay.innerHTML = '<div style="background: black; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; opacity: 0.85; font-family: Menlo, Consolas, monospace; z-index: 9999;">' + '<span style="background: red; padding: 2px 4px; border-radius: 2px;">ERROR</span>' + '<span style="top: 2px; margin-left: 5px; position: relative;">🚨</span>' + '<div style="font-size: 18px; font-weight: bold; margin-top: 20px;">' + message.innerHTML + '</div>' + '<pre>' + stackTrace.innerHTML + '</pre>' + '</div>';
  return overlay;
}

function getParents(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];

      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push(k);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAcceptCheck(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAcceptCheck(bundle.parent, id);
  }

  if (checkedAssets[id]) {
    return;
  }

  checkedAssets[id] = true;
  var cached = bundle.cache[id];
  assetsToAccept.push([bundle, id]);

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    return true;
  }

  return getParents(global.parcelRequire, id).some(function (id) {
    return hmrAcceptCheck(global.parcelRequire, id);
  });
}

function hmrAcceptRun(bundle, id) {
  var cached = bundle.cache[id];
  bundle.hotData = {};

  if (cached) {
    cached.hot.data = bundle.hotData;
  }

  if (cached && cached.hot && cached.hot._disposeCallbacks.length) {
    cached.hot._disposeCallbacks.forEach(function (cb) {
      cb(bundle.hotData);
    });
  }

  delete bundle.cache[id];
  bundle(id);
  cached = bundle.cache[id];

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    cached.hot._acceptCallbacks.forEach(function (cb) {
      cb();
    });

    return true;
  }
}
},{}]},{},["../node_modules/parcel-bundler/src/builtins/hmr-runtime.js","index.js"], null)
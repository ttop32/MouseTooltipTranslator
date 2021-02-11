"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _exportNames = {
  colors: true
};
Object.defineProperty(exports, "colors", {
  enumerable: true,
  get: function get() {
    return _colors.default;
  }
});
Object.defineProperty(exports, "default", {
  enumerable: true,
  get: function get() {
    return _framework.default;
  }
});

var _components = require("./components");

Object.keys(_components).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _components[key];
    }
  });
});

var _directives = require("./directives");

Object.keys(_directives).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _directives[key];
    }
  });
});

var _colors = _interopRequireDefault(require("./util/colors"));

var _framework = _interopRequireDefault(require("./framework"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
//# sourceMappingURL=entry-lib.js.map
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.inject = inject;
exports.provide = provide;

var _vue = _interopRequireDefault(require("vue"));

var _console = require("../../util/console");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function generateWarning(child, parent) {
  return function () {
    return (0, _console.consoleWarn)("The ".concat(child, " component must be used inside a ").concat(parent));
  };
}

function inject(namespace, child, parent) {
  var defaultImpl = child && parent ? {
    register: generateWarning(child, parent),
    unregister: generateWarning(child, parent)
  } : null;
  return _vue.default.extend({
    name: 'registrable-inject',
    inject: _defineProperty({}, namespace, {
      default: defaultImpl
    })
  });
}

function provide(namespace) {
  var self = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
  return _vue.default.extend({
    name: 'registrable-provide',
    provide: function provide() {
      return _defineProperty({}, namespace, self ? this : {
        register: this.register,
        unregister: this.unregister
      });
    }
  });
}
//# sourceMappingURL=index.js.map
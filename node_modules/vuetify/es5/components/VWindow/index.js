"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "VWindow", {
  enumerable: true,
  get: function get() {
    return _VWindow.default;
  }
});
Object.defineProperty(exports, "VWindowItem", {
  enumerable: true,
  get: function get() {
    return _VWindowItem.default;
  }
});
exports.default = void 0;

var _VWindow = _interopRequireDefault(require("./VWindow"));

var _VWindowItem = _interopRequireDefault(require("./VWindowItem"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default = {
  $_vuetify_subcomponents: {
    VWindow: _VWindow.default,
    VWindowItem: _VWindowItem.default
  }
};
exports.default = _default;
//# sourceMappingURL=index.js.map
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = mixins;

var _vue = _interopRequireDefault(require("vue"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint-disable max-len, import/export, no-use-before-define */
function mixins() {
  for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  return _vue.default.extend({
    mixins: args
  });
}
//# sourceMappingURL=mixins.js.map
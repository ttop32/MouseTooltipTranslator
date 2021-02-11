"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _vue = _interopRequireDefault(require("vue"));

var _helpers = require("../../util/helpers");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default = _vue.default.extend({
  name: 'comparable',
  props: {
    valueComparator: {
      type: Function,
      default: _helpers.deepEqual
    }
  }
});

exports.default = _default;
//# sourceMappingURL=index.js.map
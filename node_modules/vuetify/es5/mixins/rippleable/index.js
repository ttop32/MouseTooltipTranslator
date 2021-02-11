"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _ripple = _interopRequireDefault(require("../../directives/ripple"));

var _vue = _interopRequireDefault(require("vue"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Directives
// Types
var _default = _vue.default.extend({
  name: 'rippleable',
  directives: {
    ripple: _ripple.default
  },
  props: {
    ripple: {
      type: [Boolean, Object],
      default: true
    }
  },
  methods: {
    genRipple: function genRipple() {
      var data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      if (!this.ripple) return null;
      data.staticClass = 'v-input--selection-controls__ripple';
      data.directives = data.directives || [];
      data.directives.push({
        name: 'ripple',
        value: {
          center: true
        }
      });
      return this.$createElement('div', data);
    }
  }
});

exports.default = _default;
//# sourceMappingURL=index.js.map
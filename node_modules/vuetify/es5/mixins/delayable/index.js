"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _vue = _interopRequireDefault(require("vue"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Delayable
 *
 * @mixin
 *
 * Changes the open or close delay time for elements
 */
var _default = _vue.default.extend().extend({
  name: 'delayable',
  props: {
    openDelay: {
      type: [Number, String],
      default: 0
    },
    closeDelay: {
      type: [Number, String],
      default: 0
    }
  },
  data: function data() {
    return {
      openTimeout: undefined,
      closeTimeout: undefined
    };
  },
  methods: {
    /**
     * Clear any pending delay timers from executing
     */
    clearDelay: function clearDelay() {
      clearTimeout(this.openTimeout);
      clearTimeout(this.closeTimeout);
    },

    /**
     * Runs callback after a specified delay
     */
    runDelay: function runDelay(type, cb) {
      var _this = this;

      this.clearDelay();
      var delay = parseInt(this["".concat(type, "Delay")], 10);
      this["".concat(type, "Timeout")] = setTimeout(cb || function () {
        _this.isActive = {
          open: true,
          close: false
        }[type];
      }, delay);
    }
  }
});

exports.default = _default;
//# sourceMappingURL=index.js.map
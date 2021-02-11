"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _delayable = _interopRequireDefault(require("../../mixins/delayable"));

var _toggleable = _interopRequireDefault(require("../../mixins/toggleable"));

var _mixins = _interopRequireDefault(require("../../util/mixins"));

var _console = require("../../util/console");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Mixins
// Utilities
var _default = (0, _mixins.default)(_delayable.default, _toggleable.default
/* @vue/component */
).extend({
  name: 'v-hover',
  props: {
    disabled: {
      type: Boolean,
      default: false
    },
    value: {
      type: Boolean,
      default: undefined
    }
  },
  methods: {
    onMouseEnter: function onMouseEnter() {
      this.runDelay('open');
    },
    onMouseLeave: function onMouseLeave() {
      this.runDelay('close');
    }
  },
  render: function render() {
    if (!this.$scopedSlots.default && this.value === undefined) {
      (0, _console.consoleWarn)('v-hover is missing a default scopedSlot or bound value', this);
      return null;
    }

    var element;
    /* istanbul ignore else */

    if (this.$scopedSlots.default) {
      element = this.$scopedSlots.default({
        hover: this.isActive
      });
    }

    if (Array.isArray(element) && element.length === 1) {
      element = element[0];
    }

    if (!element || Array.isArray(element) || !element.tag) {
      (0, _console.consoleWarn)('v-hover should only contain a single element', this);
      return element;
    }

    if (!this.disabled) {
      element.data = element.data || {};

      this._g(element.data, {
        mouseenter: this.onMouseEnter,
        mouseleave: this.onMouseLeave
      });
    }

    return element;
  }
});

exports.default = _default;
//# sourceMappingURL=VHover.js.map
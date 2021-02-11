"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("../../../src/components/VDivider/VDivider.sass");

var _themeable = _interopRequireDefault(require("../../mixins/themeable"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _default = _themeable.default.extend({
  name: 'v-divider',
  props: {
    inset: Boolean,
    vertical: Boolean
  },
  render: function render(h) {
    // WAI-ARIA attributes
    var orientation;

    if (!this.$attrs.role || this.$attrs.role === 'separator') {
      orientation = this.vertical ? 'vertical' : 'horizontal';
    }

    return h('hr', {
      class: _objectSpread({
        'v-divider': true,
        'v-divider--inset': this.inset,
        'v-divider--vertical': this.vertical
      }, this.themeClasses),
      attrs: _objectSpread({
        role: 'separator',
        'aria-orientation': orientation
      }, this.$attrs),
      on: this.$listeners
    });
  }
});

exports.default = _default;
//# sourceMappingURL=VDivider.js.map
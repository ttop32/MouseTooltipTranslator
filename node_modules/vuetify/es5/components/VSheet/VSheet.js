"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("../../../src/components/VSheet/VSheet.sass");

var _bindsAttrs = _interopRequireDefault(require("../../mixins/binds-attrs"));

var _colorable = _interopRequireDefault(require("../../mixins/colorable"));

var _elevatable = _interopRequireDefault(require("../../mixins/elevatable"));

var _measurable = _interopRequireDefault(require("../../mixins/measurable"));

var _roundable = _interopRequireDefault(require("../../mixins/roundable"));

var _themeable = _interopRequireDefault(require("../../mixins/themeable"));

var _mixins = _interopRequireDefault(require("../../util/mixins"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/* @vue/component */
var _default = (0, _mixins.default)(_bindsAttrs.default, _colorable.default, _elevatable.default, _measurable.default, _roundable.default, _themeable.default).extend({
  name: 'v-sheet',
  props: {
    outlined: Boolean,
    shaped: Boolean,
    tag: {
      type: String,
      default: 'div'
    }
  },
  computed: {
    classes: function classes() {
      return _objectSpread({
        'v-sheet': true,
        'v-sheet--outlined': this.outlined,
        'v-sheet--shaped': this.shaped
      }, this.themeClasses, {}, this.elevationClasses, {}, this.roundedClasses);
    },
    styles: function styles() {
      return this.measurableStyles;
    }
  },
  render: function render(h) {
    var data = {
      class: this.classes,
      style: this.styles,
      on: this.listeners$
    };
    return h(this.tag, this.setBackgroundColor(this.color, data), this.$slots.default);
  }
});

exports.default = _default;
//# sourceMappingURL=VSheet.js.map
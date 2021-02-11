"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("../../../src/components/VTimeline/VTimeline.sass");

var _mixins = _interopRequireDefault(require("../../util/mixins"));

var _themeable = _interopRequireDefault(require("../../mixins/themeable"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _default = (0, _mixins.default)(_themeable.default
/* @vue/component */
).extend({
  name: 'v-timeline',
  provide: function provide() {
    return {
      timeline: this
    };
  },
  props: {
    alignTop: Boolean,
    dense: Boolean,
    reverse: Boolean
  },
  computed: {
    classes: function classes() {
      return _objectSpread({
        'v-timeline--align-top': this.alignTop,
        'v-timeline--dense': this.dense,
        'v-timeline--reverse': this.reverse
      }, this.themeClasses);
    }
  },
  render: function render(h) {
    return h('div', {
      staticClass: 'v-timeline',
      class: this.classes
    }, this.$slots.default);
  }
});

exports.default = _default;
//# sourceMappingURL=VTimeline.js.map
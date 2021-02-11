"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("../../../src/components/VSystemBar/VSystemBar.sass");

var _applicationable = _interopRequireDefault(require("../../mixins/applicationable"));

var _colorable = _interopRequireDefault(require("../../mixins/colorable"));

var _themeable = _interopRequireDefault(require("../../mixins/themeable"));

var _mixins = _interopRequireDefault(require("../../util/mixins"));

var _helpers = require("../../util/helpers");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _default = (0, _mixins.default)((0, _applicationable.default)('bar', ['height', 'window']), _colorable.default, _themeable.default
/* @vue/component */
).extend({
  name: 'v-system-bar',
  props: {
    height: [Number, String],
    lightsOut: Boolean,
    window: Boolean
  },
  computed: {
    classes: function classes() {
      return _objectSpread({
        'v-system-bar--lights-out': this.lightsOut,
        'v-system-bar--absolute': this.absolute,
        'v-system-bar--fixed': !this.absolute && (this.app || this.fixed),
        'v-system-bar--window': this.window
      }, this.themeClasses);
    },
    computedHeight: function computedHeight() {
      if (this.height) {
        return isNaN(parseInt(this.height)) ? this.height : parseInt(this.height);
      }

      return this.window ? 32 : 24;
    },
    styles: function styles() {
      return {
        height: (0, _helpers.convertToUnit)(this.computedHeight)
      };
    }
  },
  methods: {
    updateApplication: function updateApplication() {
      return this.$el ? this.$el.clientHeight : this.computedHeight;
    }
  },
  render: function render(h) {
    var data = {
      staticClass: 'v-system-bar',
      class: this.classes,
      style: this.styles,
      on: this.$listeners
    };
    return h('div', this.setBackgroundColor(this.color, data), (0, _helpers.getSlot)(this));
  }
});

exports.default = _default;
//# sourceMappingURL=VSystemBar.js.map
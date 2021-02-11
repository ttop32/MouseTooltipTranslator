"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("../../../src/components/VOverlay/VOverlay.sass");

var _colorable = _interopRequireDefault(require("./../../mixins/colorable"));

var _themeable = _interopRequireDefault(require("../../mixins/themeable"));

var _toggleable = _interopRequireDefault(require("./../../mixins/toggleable"));

var _mixins = _interopRequireDefault(require("../../util/mixins"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/* @vue/component */
var _default = (0, _mixins.default)(_colorable.default, _themeable.default, _toggleable.default).extend({
  name: 'v-overlay',
  props: {
    absolute: Boolean,
    color: {
      type: String,
      default: '#212121'
    },
    dark: {
      type: Boolean,
      default: true
    },
    opacity: {
      type: [Number, String],
      default: 0.46
    },
    value: {
      default: true
    },
    zIndex: {
      type: [Number, String],
      default: 5
    }
  },
  computed: {
    __scrim: function __scrim() {
      var data = this.setBackgroundColor(this.color, {
        staticClass: 'v-overlay__scrim',
        style: {
          opacity: this.computedOpacity
        }
      });
      return this.$createElement('div', data);
    },
    classes: function classes() {
      return _objectSpread({
        'v-overlay--absolute': this.absolute,
        'v-overlay--active': this.isActive
      }, this.themeClasses);
    },
    computedOpacity: function computedOpacity() {
      return Number(this.isActive ? this.opacity : 0);
    },
    styles: function styles() {
      return {
        zIndex: this.zIndex
      };
    }
  },
  methods: {
    genContent: function genContent() {
      return this.$createElement('div', {
        staticClass: 'v-overlay__content'
      }, this.$slots.default);
    }
  },
  render: function render(h) {
    var children = [this.__scrim];
    if (this.isActive) children.push(this.genContent());
    return h('div', {
      staticClass: 'v-overlay',
      class: this.classes,
      style: this.styles
    }, children);
  }
});

exports.default = _default;
//# sourceMappingURL=VOverlay.js.map
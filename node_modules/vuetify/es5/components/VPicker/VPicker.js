"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("../../../src/components/VPicker/VPicker.sass");

require("../../../src/components/VCard/VCard.sass");

var _colorable = _interopRequireDefault(require("../../mixins/colorable"));

var _elevatable = _interopRequireDefault(require("../../mixins/elevatable"));

var _themeable = _interopRequireDefault(require("../../mixins/themeable"));

var _helpers = require("../../util/helpers");

var _mixins = _interopRequireDefault(require("../../util/mixins"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/* @vue/component */
var _default = (0, _mixins.default)(_colorable.default, _elevatable.default, _themeable.default).extend({
  name: 'v-picker',
  props: {
    flat: Boolean,
    fullWidth: Boolean,
    landscape: Boolean,
    noTitle: Boolean,
    transition: {
      type: String,
      default: 'fade-transition'
    },
    width: {
      type: [Number, String],
      default: 290
    }
  },
  computed: {
    computedTitleColor: function computedTitleColor() {
      var defaultTitleColor = this.isDark ? false : this.color || 'primary';
      return this.color || defaultTitleColor;
    }
  },
  methods: {
    genTitle: function genTitle() {
      return this.$createElement('div', this.setBackgroundColor(this.computedTitleColor, {
        staticClass: 'v-picker__title',
        class: {
          'v-picker__title--landscape': this.landscape
        }
      }), this.$slots.title);
    },
    genBodyTransition: function genBodyTransition() {
      return this.$createElement('transition', {
        props: {
          name: this.transition
        }
      }, this.$slots.default);
    },
    genBody: function genBody() {
      return this.$createElement('div', {
        staticClass: 'v-picker__body',
        class: _objectSpread({
          'v-picker__body--no-title': this.noTitle
        }, this.themeClasses),
        style: this.fullWidth ? undefined : {
          width: (0, _helpers.convertToUnit)(this.width)
        }
      }, [this.genBodyTransition()]);
    },
    genActions: function genActions() {
      return this.$createElement('div', {
        staticClass: 'v-picker__actions v-card__actions',
        class: {
          'v-picker__actions--no-title': this.noTitle
        }
      }, this.$slots.actions);
    }
  },
  render: function render(h) {
    return h('div', {
      staticClass: 'v-picker v-card',
      class: _objectSpread({
        'v-picker--flat': this.flat,
        'v-picker--landscape': this.landscape,
        'v-picker--full-width': this.fullWidth
      }, this.themeClasses, {}, this.elevationClasses)
    }, [this.$slots.title ? this.genTitle() : null, this.genBody(), this.$slots.actions ? this.genActions() : null]);
  }
});

exports.default = _default;
//# sourceMappingURL=VPicker.js.map
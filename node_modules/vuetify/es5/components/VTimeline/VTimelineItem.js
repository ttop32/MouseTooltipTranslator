"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _mixins = _interopRequireDefault(require("../../util/mixins"));

var _VIcon = _interopRequireDefault(require("../VIcon"));

var _themeable = _interopRequireDefault(require("../../mixins/themeable"));

var _colorable = _interopRequireDefault(require("../../mixins/colorable"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var baseMixins = (0, _mixins.default)(_colorable.default, _themeable.default
/* @vue/component */
);

var _default = baseMixins.extend().extend({
  name: 'v-timeline-item',
  inject: ['timeline'],
  props: {
    color: {
      type: String,
      default: 'primary'
    },
    fillDot: Boolean,
    hideDot: Boolean,
    icon: String,
    iconColor: String,
    large: Boolean,
    left: Boolean,
    right: Boolean,
    small: Boolean
  },
  computed: {
    hasIcon: function hasIcon() {
      return !!this.icon || !!this.$slots.icon;
    }
  },
  methods: {
    genBody: function genBody() {
      return this.$createElement('div', {
        staticClass: 'v-timeline-item__body'
      }, this.$slots.default);
    },
    genIcon: function genIcon() {
      if (this.$slots.icon) {
        return this.$slots.icon;
      }

      return this.$createElement(_VIcon.default, {
        props: {
          color: this.iconColor,
          dark: !this.theme.isDark,
          small: this.small
        }
      }, this.icon);
    },
    genInnerDot: function genInnerDot() {
      var data = this.setBackgroundColor(this.color);
      return this.$createElement('div', _objectSpread({
        staticClass: 'v-timeline-item__inner-dot'
      }, data), [this.hasIcon && this.genIcon()]);
    },
    genDot: function genDot() {
      return this.$createElement('div', {
        staticClass: 'v-timeline-item__dot',
        class: {
          'v-timeline-item__dot--small': this.small,
          'v-timeline-item__dot--large': this.large
        }
      }, [this.genInnerDot()]);
    },
    genDivider: function genDivider() {
      var children = [];
      if (!this.hideDot) children.push(this.genDot());
      return this.$createElement('div', {
        staticClass: 'v-timeline-item__divider'
      }, children);
    },
    genOpposite: function genOpposite() {
      return this.$createElement('div', {
        staticClass: 'v-timeline-item__opposite'
      }, this.$slots.opposite);
    }
  },
  render: function render(h) {
    var children = [this.genBody(), this.genDivider()];
    if (this.$slots.opposite) children.push(this.genOpposite());
    return h('div', {
      staticClass: 'v-timeline-item',
      class: _objectSpread({
        'v-timeline-item--fill-dot': this.fillDot,
        'v-timeline-item--before': this.timeline.reverse ? this.right : this.left,
        'v-timeline-item--after': this.timeline.reverse ? this.left : this.right
      }, this.themeClasses)
    }, children);
  }
});

exports.default = _default;
//# sourceMappingURL=VTimelineItem.js.map
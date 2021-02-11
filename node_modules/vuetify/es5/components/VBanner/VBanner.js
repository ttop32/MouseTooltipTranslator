"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("../../../src/components/VBanner/VBanner.sass");

var _VSheet = _interopRequireDefault(require("../VSheet"));

var _VAvatar = _interopRequireDefault(require("../VAvatar"));

var _VIcon = _interopRequireDefault(require("../VIcon"));

var _transitions = require("../transitions");

var _mobile = _interopRequireDefault(require("../../mixins/mobile"));

var _toggleable = _interopRequireDefault(require("../../mixins/toggleable"));

var _mixins = _interopRequireDefault(require("../../util/mixins"));

var _helpers = require("../../util/helpers");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/* @vue/component */
var _default = (0, _mixins.default)(_VSheet.default, _mobile.default, _toggleable.default).extend({
  name: 'v-banner',
  inheritAttrs: false,
  props: {
    app: Boolean,
    icon: String,
    iconColor: String,
    singleLine: Boolean,
    sticky: Boolean,
    value: {
      type: Boolean,
      default: true
    }
  },
  computed: {
    classes: function classes() {
      return _objectSpread({}, _VSheet.default.options.computed.classes.call(this), {
        'v-banner--has-icon': this.hasIcon,
        'v-banner--is-mobile': this.isMobile,
        'v-banner--single-line': this.singleLine,
        'v-banner--sticky': this.isSticky
      });
    },
    hasIcon: function hasIcon() {
      return Boolean(this.icon || this.$slots.icon);
    },
    isSticky: function isSticky() {
      return this.sticky || this.app;
    },
    styles: function styles() {
      var styles = _objectSpread({}, _VSheet.default.options.computed.styles.call(this));

      if (this.isSticky) {
        var top = !this.app ? 0 : this.$vuetify.application.bar + this.$vuetify.application.top;
        styles.top = (0, _helpers.convertToUnit)(top);
        styles.position = 'sticky';
        styles.zIndex = 1;
      }

      return styles;
    }
  },
  methods: {
    /** @public */
    toggle: function toggle() {
      this.isActive = !this.isActive;
    },
    iconClick: function iconClick(e) {
      this.$emit('click:icon', e);
    },
    genIcon: function genIcon() {
      if (!this.hasIcon) return undefined;
      var content;

      if (this.icon) {
        content = this.$createElement(_VIcon.default, {
          props: {
            color: this.iconColor,
            size: 28
          }
        }, [this.icon]);
      } else {
        content = this.$slots.icon;
      }

      return this.$createElement(_VAvatar.default, {
        staticClass: 'v-banner__icon',
        props: {
          color: this.color,
          size: 40
        },
        on: {
          click: this.iconClick
        }
      }, [content]);
    },
    genText: function genText() {
      return this.$createElement('div', {
        staticClass: 'v-banner__text'
      }, this.$slots.default);
    },
    genActions: function genActions() {
      var _this = this;

      var children = (0, _helpers.getSlot)(this, 'actions', {
        dismiss: function dismiss() {
          return _this.isActive = false;
        }
      });
      if (!children) return undefined;
      return this.$createElement('div', {
        staticClass: 'v-banner__actions'
      }, children);
    },
    genContent: function genContent() {
      return this.$createElement('div', {
        staticClass: 'v-banner__content'
      }, [this.genIcon(), this.genText()]);
    },
    genWrapper: function genWrapper() {
      return this.$createElement('div', {
        staticClass: 'v-banner__wrapper'
      }, [this.genContent(), this.genActions()]);
    }
  },
  render: function render(h) {
    return h(_transitions.VExpandTransition, [h('div', this.setBackgroundColor(this.color, {
      staticClass: 'v-banner',
      attrs: this.attrs$,
      class: this.classes,
      style: this.styles,
      directives: [{
        name: 'show',
        value: this.isActive
      }]
    }), [this.genWrapper()])]);
  }
});

exports.default = _default;
//# sourceMappingURL=VBanner.js.map
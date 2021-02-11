"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("../../../src/components/VAlert/VAlert.sass");

var _VSheet = _interopRequireDefault(require("../VSheet"));

var _VBtn = _interopRequireDefault(require("../VBtn"));

var _VIcon = _interopRequireDefault(require("../VIcon"));

var _toggleable = _interopRequireDefault(require("../../mixins/toggleable"));

var _themeable = _interopRequireDefault(require("../../mixins/themeable"));

var _transitionable = _interopRequireDefault(require("../../mixins/transitionable"));

var _mixins = _interopRequireDefault(require("../../util/mixins"));

var _console = require("../../util/console");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/* @vue/component */
var _default = (0, _mixins.default)(_VSheet.default, _toggleable.default, _transitionable.default).extend({
  name: 'v-alert',
  props: {
    border: {
      type: String,
      validator: function validator(val) {
        return ['top', 'right', 'bottom', 'left'].includes(val);
      }
    },
    closeLabel: {
      type: String,
      default: '$vuetify.close'
    },
    coloredBorder: Boolean,
    dense: Boolean,
    dismissible: Boolean,
    closeIcon: {
      type: String,
      default: '$cancel'
    },
    icon: {
      default: '',
      type: [Boolean, String],
      validator: function validator(val) {
        return typeof val === 'string' || val === false;
      }
    },
    outlined: Boolean,
    prominent: Boolean,
    text: Boolean,
    type: {
      type: String,
      validator: function validator(val) {
        return ['info', 'error', 'success', 'warning'].includes(val);
      }
    },
    value: {
      type: Boolean,
      default: true
    }
  },
  computed: {
    __cachedBorder: function __cachedBorder() {
      if (!this.border) return null;
      var data = {
        staticClass: 'v-alert__border',
        class: _defineProperty({}, "v-alert__border--".concat(this.border), true)
      };

      if (this.coloredBorder) {
        data = this.setBackgroundColor(this.computedColor, data);
        data.class['v-alert__border--has-color'] = true;
      }

      return this.$createElement('div', data);
    },
    __cachedDismissible: function __cachedDismissible() {
      var _this = this;

      if (!this.dismissible) return null;
      var color = this.iconColor;
      return this.$createElement(_VBtn.default, {
        staticClass: 'v-alert__dismissible',
        props: {
          color: color,
          icon: true,
          small: true
        },
        attrs: {
          'aria-label': this.$vuetify.lang.t(this.closeLabel)
        },
        on: {
          click: function click() {
            return _this.isActive = false;
          }
        }
      }, [this.$createElement(_VIcon.default, {
        props: {
          color: color
        }
      }, this.closeIcon)]);
    },
    __cachedIcon: function __cachedIcon() {
      if (!this.computedIcon) return null;
      return this.$createElement(_VIcon.default, {
        staticClass: 'v-alert__icon',
        props: {
          color: this.iconColor
        }
      }, this.computedIcon);
    },
    classes: function classes() {
      var classes = _objectSpread({}, _VSheet.default.options.computed.classes.call(this), {
        'v-alert--border': Boolean(this.border),
        'v-alert--dense': this.dense,
        'v-alert--outlined': this.outlined,
        'v-alert--prominent': this.prominent,
        'v-alert--text': this.text
      });

      if (this.border) {
        classes["v-alert--border-".concat(this.border)] = true;
      }

      return classes;
    },
    computedColor: function computedColor() {
      return this.color || this.type;
    },
    computedIcon: function computedIcon() {
      if (this.icon === false) return false;
      if (typeof this.icon === 'string' && this.icon) return this.icon;
      if (!['error', 'info', 'success', 'warning'].includes(this.type)) return false;
      return "$".concat(this.type);
    },
    hasColoredIcon: function hasColoredIcon() {
      return this.hasText || Boolean(this.border) && this.coloredBorder;
    },
    hasText: function hasText() {
      return this.text || this.outlined;
    },
    iconColor: function iconColor() {
      return this.hasColoredIcon ? this.computedColor : undefined;
    },
    isDark: function isDark() {
      if (this.type && !this.coloredBorder && !this.outlined) return true;
      return _themeable.default.options.computed.isDark.call(this);
    }
  },
  created: function created() {
    /* istanbul ignore next */
    if (this.$attrs.hasOwnProperty('outline')) {
      (0, _console.breaking)('outline', 'outlined', this);
    }
  },
  methods: {
    genWrapper: function genWrapper() {
      var children = [this.$slots.prepend || this.__cachedIcon, this.genContent(), this.__cachedBorder, this.$slots.append, this.$scopedSlots.close ? this.$scopedSlots.close({
        toggle: this.toggle
      }) : this.__cachedDismissible];
      var data = {
        staticClass: 'v-alert__wrapper'
      };
      return this.$createElement('div', data, children);
    },
    genContent: function genContent() {
      return this.$createElement('div', {
        staticClass: 'v-alert__content'
      }, this.$slots.default);
    },
    genAlert: function genAlert() {
      var data = {
        staticClass: 'v-alert',
        attrs: {
          role: 'alert'
        },
        on: this.listeners$,
        class: this.classes,
        style: this.styles,
        directives: [{
          name: 'show',
          value: this.isActive
        }]
      };

      if (!this.coloredBorder) {
        var setColor = this.hasText ? this.setTextColor : this.setBackgroundColor;
        data = setColor(this.computedColor, data);
      }

      return this.$createElement('div', data, [this.genWrapper()]);
    },

    /** @public */
    toggle: function toggle() {
      this.isActive = !this.isActive;
    }
  },
  render: function render(h) {
    var render = this.genAlert();
    if (!this.transition) return render;
    return h('transition', {
      props: {
        name: this.transition,
        origin: this.origin,
        mode: this.mode
      }
    }, [render]);
  }
});

exports.default = _default;
//# sourceMappingURL=VAlert.js.map
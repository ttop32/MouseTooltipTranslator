"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("../../../src/components/VSnackbar/VSnackbar.sass");

var _VSheet = _interopRequireDefault(require("../VSheet/VSheet"));

var _colorable = _interopRequireDefault(require("../../mixins/colorable"));

var _themeable = _interopRequireDefault(require("../../mixins/themeable"));

var _toggleable = _interopRequireDefault(require("../../mixins/toggleable"));

var _positionable = require("../../mixins/positionable");

var _mixins = _interopRequireDefault(require("../../util/mixins"));

var _helpers = require("../../util/helpers");

var _console = require("../../util/console");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _default = (0, _mixins.default)(_VSheet.default, _colorable.default, _toggleable.default, (0, _positionable.factory)(['absolute', 'bottom', 'left', 'right', 'top'])
/* @vue/component */
).extend({
  name: 'v-snackbar',
  props: {
    app: Boolean,
    centered: Boolean,
    contentClass: {
      type: String,
      default: ''
    },
    multiLine: Boolean,
    text: Boolean,
    timeout: {
      type: [Number, String],
      default: 5000
    },
    transition: {
      type: [Boolean, String],
      default: 'v-snack-transition',
      validator: function validator(v) {
        return typeof v === 'string' || v === false;
      }
    },
    vertical: Boolean
  },
  data: function data() {
    return {
      activeTimeout: -1
    };
  },
  computed: {
    classes: function classes() {
      return {
        'v-snack--absolute': this.absolute,
        'v-snack--active': this.isActive,
        'v-snack--bottom': this.bottom || !this.top,
        'v-snack--centered': this.centered,
        'v-snack--has-background': this.hasBackground,
        'v-snack--left': this.left,
        'v-snack--multi-line': this.multiLine && !this.vertical,
        'v-snack--right': this.right,
        'v-snack--text': this.text,
        'v-snack--top': this.top,
        'v-snack--vertical': this.vertical
      };
    },
    // Text and outlined styles both
    // use transparent backgrounds
    hasBackground: function hasBackground() {
      return !this.text && !this.outlined;
    },
    // Snackbar is dark by default
    // override themeable logic.
    isDark: function isDark() {
      return this.hasBackground ? !this.light : _themeable.default.options.computed.isDark.call(this);
    },
    styles: function styles() {
      // Styles are not needed when
      // using the absolute prop.
      if (this.absolute) return {};
      var _this$$vuetify$applic = this.$vuetify.application,
          bar = _this$$vuetify$applic.bar,
          bottom = _this$$vuetify$applic.bottom,
          footer = _this$$vuetify$applic.footer,
          insetFooter = _this$$vuetify$applic.insetFooter,
          left = _this$$vuetify$applic.left,
          right = _this$$vuetify$applic.right,
          top = _this$$vuetify$applic.top; // Should always move for y-axis
      // applicationable components.

      return {
        paddingBottom: (0, _helpers.convertToUnit)(bottom + footer + insetFooter),
        paddingLeft: !this.app ? undefined : (0, _helpers.convertToUnit)(left),
        paddingRight: !this.app ? undefined : (0, _helpers.convertToUnit)(right),
        paddingTop: (0, _helpers.convertToUnit)(bar + top)
      };
    }
  },
  watch: {
    isActive: 'setTimeout',
    timeout: 'setTimeout'
  },
  mounted: function mounted() {
    if (this.isActive) this.setTimeout();
  },
  created: function created() {
    /* istanbul ignore next */
    if (this.$attrs.hasOwnProperty('auto-height')) {
      (0, _console.removed)('auto-height', this);
    }
    /* istanbul ignore next */
    // eslint-disable-next-line eqeqeq


    if (this.timeout == 0) {
      (0, _console.deprecate)('timeout="0"', '-1', this);
    }
  },
  methods: {
    genActions: function genActions() {
      return this.$createElement('div', {
        staticClass: 'v-snack__action '
      }, [(0, _helpers.getSlot)(this, 'action', {
        attrs: {
          class: 'v-snack__btn'
        }
      })]);
    },
    genContent: function genContent() {
      return this.$createElement('div', {
        staticClass: 'v-snack__content',
        class: _defineProperty({}, this.contentClass, true),
        attrs: {
          role: 'status',
          'aria-live': 'polite'
        }
      }, [(0, _helpers.getSlot)(this)]);
    },
    genWrapper: function genWrapper() {
      var _this = this;

      var setColor = this.hasBackground ? this.setBackgroundColor : this.setTextColor;
      var data = setColor(this.color, {
        staticClass: 'v-snack__wrapper',
        class: _VSheet.default.options.computed.classes.call(this),
        directives: [{
          name: 'show',
          value: this.isActive
        }],
        on: {
          mouseenter: function mouseenter() {
            return window.clearTimeout(_this.activeTimeout);
          },
          mouseleave: this.setTimeout
        }
      });
      return this.$createElement('div', data, [this.genContent(), this.genActions()]);
    },
    genTransition: function genTransition() {
      return this.$createElement('transition', {
        props: {
          name: this.transition
        }
      }, [this.genWrapper()]);
    },
    setTimeout: function setTimeout() {
      var _this2 = this;

      window.clearTimeout(this.activeTimeout);
      var timeout = Number(this.timeout);

      if (!this.isActive || // TODO: remove 0 in v3
      [0, -1].includes(timeout)) {
        return;
      }

      this.activeTimeout = window.setTimeout(function () {
        _this2.isActive = false;
      }, timeout);
    }
  },
  render: function render(h) {
    return h('div', {
      staticClass: 'v-snack',
      class: this.classes,
      style: this.styles
    }, [this.transition !== false ? this.genTransition() : this.genWrapper()]);
  }
});

exports.default = _default;
//# sourceMappingURL=VSnackbar.js.map
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("../../../src/components/VProgressLinear/VProgressLinear.sass");

var _transitions = require("../transitions");

var _colorable = _interopRequireDefault(require("../../mixins/colorable"));

var _positionable = require("../../mixins/positionable");

var _proxyable = _interopRequireDefault(require("../../mixins/proxyable"));

var _themeable = _interopRequireDefault(require("../../mixins/themeable"));

var _helpers = require("../../util/helpers");

var _mixins = _interopRequireDefault(require("../../util/mixins"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var baseMixins = (0, _mixins.default)(_colorable.default, (0, _positionable.factory)(['absolute', 'fixed', 'top', 'bottom']), _proxyable.default, _themeable.default);
/* @vue/component */

var _default = baseMixins.extend({
  name: 'v-progress-linear',
  props: {
    active: {
      type: Boolean,
      default: true
    },
    backgroundColor: {
      type: String,
      default: null
    },
    backgroundOpacity: {
      type: [Number, String],
      default: null
    },
    bufferValue: {
      type: [Number, String],
      default: 100
    },
    color: {
      type: String,
      default: 'primary'
    },
    height: {
      type: [Number, String],
      default: 4
    },
    indeterminate: Boolean,
    query: Boolean,
    reverse: Boolean,
    rounded: Boolean,
    stream: Boolean,
    striped: Boolean,
    value: {
      type: [Number, String],
      default: 0
    }
  },
  data: function data() {
    return {
      internalLazyValue: this.value || 0
    };
  },
  computed: {
    __cachedBackground: function __cachedBackground() {
      return this.$createElement('div', this.setBackgroundColor(this.backgroundColor || this.color, {
        staticClass: 'v-progress-linear__background',
        style: this.backgroundStyle
      }));
    },
    __cachedBar: function __cachedBar() {
      return this.$createElement(this.computedTransition, [this.__cachedBarType]);
    },
    __cachedBarType: function __cachedBarType() {
      return this.indeterminate ? this.__cachedIndeterminate : this.__cachedDeterminate;
    },
    __cachedBuffer: function __cachedBuffer() {
      return this.$createElement('div', {
        staticClass: 'v-progress-linear__buffer',
        style: this.styles
      });
    },
    __cachedDeterminate: function __cachedDeterminate() {
      return this.$createElement('div', this.setBackgroundColor(this.color, {
        staticClass: "v-progress-linear__determinate",
        style: {
          width: (0, _helpers.convertToUnit)(this.normalizedValue, '%')
        }
      }));
    },
    __cachedIndeterminate: function __cachedIndeterminate() {
      return this.$createElement('div', {
        staticClass: 'v-progress-linear__indeterminate',
        class: {
          'v-progress-linear__indeterminate--active': this.active
        }
      }, [this.genProgressBar('long'), this.genProgressBar('short')]);
    },
    __cachedStream: function __cachedStream() {
      if (!this.stream) return null;
      return this.$createElement('div', this.setTextColor(this.color, {
        staticClass: 'v-progress-linear__stream',
        style: {
          width: (0, _helpers.convertToUnit)(100 - this.normalizedBuffer, '%')
        }
      }));
    },
    backgroundStyle: function backgroundStyle() {
      var _ref;

      var backgroundOpacity = this.backgroundOpacity == null ? this.backgroundColor ? 1 : 0.3 : parseFloat(this.backgroundOpacity);
      return _ref = {
        opacity: backgroundOpacity
      }, _defineProperty(_ref, this.isReversed ? 'right' : 'left', (0, _helpers.convertToUnit)(this.normalizedValue, '%')), _defineProperty(_ref, "width", (0, _helpers.convertToUnit)(this.normalizedBuffer - this.normalizedValue, '%')), _ref;
    },
    classes: function classes() {
      return _objectSpread({
        'v-progress-linear--absolute': this.absolute,
        'v-progress-linear--fixed': this.fixed,
        'v-progress-linear--query': this.query,
        'v-progress-linear--reactive': this.reactive,
        'v-progress-linear--reverse': this.isReversed,
        'v-progress-linear--rounded': this.rounded,
        'v-progress-linear--striped': this.striped
      }, this.themeClasses);
    },
    computedTransition: function computedTransition() {
      return this.indeterminate ? _transitions.VFadeTransition : _transitions.VSlideXTransition;
    },
    isReversed: function isReversed() {
      return this.$vuetify.rtl !== this.reverse;
    },
    normalizedBuffer: function normalizedBuffer() {
      return this.normalize(this.bufferValue);
    },
    normalizedValue: function normalizedValue() {
      return this.normalize(this.internalLazyValue);
    },
    reactive: function reactive() {
      return Boolean(this.$listeners.change);
    },
    styles: function styles() {
      var styles = {};

      if (!this.active) {
        styles.height = 0;
      }

      if (!this.indeterminate && parseFloat(this.normalizedBuffer) !== 100) {
        styles.width = (0, _helpers.convertToUnit)(this.normalizedBuffer, '%');
      }

      return styles;
    }
  },
  methods: {
    genContent: function genContent() {
      var slot = (0, _helpers.getSlot)(this, 'default', {
        value: this.internalLazyValue
      });
      if (!slot) return null;
      return this.$createElement('div', {
        staticClass: 'v-progress-linear__content'
      }, slot);
    },
    genListeners: function genListeners() {
      var listeners = this.$listeners;

      if (this.reactive) {
        listeners.click = this.onClick;
      }

      return listeners;
    },
    genProgressBar: function genProgressBar(name) {
      return this.$createElement('div', this.setBackgroundColor(this.color, {
        staticClass: 'v-progress-linear__indeterminate',
        class: _defineProperty({}, name, true)
      }));
    },
    onClick: function onClick(e) {
      if (!this.reactive) return;

      var _this$$el$getBounding = this.$el.getBoundingClientRect(),
          width = _this$$el$getBounding.width;

      this.internalValue = e.offsetX / width * 100;
    },
    normalize: function normalize(value) {
      if (value < 0) return 0;
      if (value > 100) return 100;
      return parseFloat(value);
    }
  },
  render: function render(h) {
    var data = {
      staticClass: 'v-progress-linear',
      attrs: {
        role: 'progressbar',
        'aria-valuemin': 0,
        'aria-valuemax': this.normalizedBuffer,
        'aria-valuenow': this.indeterminate ? undefined : this.normalizedValue
      },
      class: this.classes,
      style: {
        bottom: this.bottom ? 0 : undefined,
        height: this.active ? (0, _helpers.convertToUnit)(this.height) : 0,
        top: this.top ? 0 : undefined
      },
      on: this.genListeners()
    };
    return h('div', data, [this.__cachedStream, this.__cachedBackground, this.__cachedBuffer, this.__cachedBar, this.genContent()]);
  }
});

exports.default = _default;
//# sourceMappingURL=VProgressLinear.js.map
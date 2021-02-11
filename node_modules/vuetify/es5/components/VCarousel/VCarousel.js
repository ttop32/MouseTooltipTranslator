"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("../../../src/components/VCarousel/VCarousel.sass");

var _VWindow = _interopRequireDefault(require("../VWindow/VWindow"));

var _VBtn = _interopRequireDefault(require("../VBtn"));

var _VIcon = _interopRequireDefault(require("../VIcon"));

var _VProgressLinear = _interopRequireDefault(require("../VProgressLinear"));

var _buttonGroup = _interopRequireDefault(require("../../mixins/button-group"));

var _helpers = require("../../util/helpers");

var _console = require("../../util/console");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _default = _VWindow.default.extend({
  name: 'v-carousel',
  props: {
    continuous: {
      type: Boolean,
      default: true
    },
    cycle: Boolean,
    delimiterIcon: {
      type: String,
      default: '$delimiter'
    },
    height: {
      type: [Number, String],
      default: 500
    },
    hideDelimiters: Boolean,
    hideDelimiterBackground: Boolean,
    interval: {
      type: [Number, String],
      default: 6000,
      validator: function validator(value) {
        return value > 0;
      }
    },
    mandatory: {
      type: Boolean,
      default: true
    },
    progress: Boolean,
    progressColor: String,
    showArrows: {
      type: Boolean,
      default: true
    },
    verticalDelimiters: {
      type: String,
      default: undefined
    }
  },
  data: function data() {
    return {
      internalHeight: this.height,
      slideTimeout: undefined
    };
  },
  computed: {
    classes: function classes() {
      return _objectSpread({}, _VWindow.default.options.computed.classes.call(this), {
        'v-carousel': true,
        'v-carousel--hide-delimiter-background': this.hideDelimiterBackground,
        'v-carousel--vertical-delimiters': this.isVertical
      });
    },
    isDark: function isDark() {
      return this.dark || !this.light;
    },
    isVertical: function isVertical() {
      return this.verticalDelimiters != null;
    }
  },
  watch: {
    internalValue: 'restartTimeout',
    interval: 'restartTimeout',
    height: function height(val, oldVal) {
      if (val === oldVal || !val) return;
      this.internalHeight = val;
    },
    cycle: function cycle(val) {
      if (val) {
        this.restartTimeout();
      } else {
        clearTimeout(this.slideTimeout);
        this.slideTimeout = undefined;
      }
    }
  },
  created: function created() {
    /* istanbul ignore next */
    if (this.$attrs.hasOwnProperty('hide-controls')) {
      (0, _console.breaking)('hide-controls', ':show-arrows="false"', this);
    }
  },
  mounted: function mounted() {
    this.startTimeout();
  },
  methods: {
    genControlIcons: function genControlIcons() {
      if (this.isVertical) return null;
      return _VWindow.default.options.methods.genControlIcons.call(this);
    },
    genDelimiters: function genDelimiters() {
      return this.$createElement('div', {
        staticClass: 'v-carousel__controls',
        style: {
          left: this.verticalDelimiters === 'left' && this.isVertical ? 0 : 'auto',
          right: this.verticalDelimiters === 'right' ? 0 : 'auto'
        }
      }, [this.genItems()]);
    },
    genItems: function genItems() {
      var _this = this;

      var length = this.items.length;
      var children = [];

      for (var i = 0; i < length; i++) {
        var child = this.$createElement(_VBtn.default, {
          staticClass: 'v-carousel__controls__item',
          attrs: {
            'aria-label': this.$vuetify.lang.t('$vuetify.carousel.ariaLabel.delimiter', i + 1, length)
          },
          props: {
            icon: true,
            small: true,
            value: this.getValue(this.items[i], i)
          }
        }, [this.$createElement(_VIcon.default, {
          props: {
            size: 18
          }
        }, this.delimiterIcon)]);
        children.push(child);
      }

      return this.$createElement(_buttonGroup.default, {
        props: {
          value: this.internalValue,
          mandatory: this.mandatory
        },
        on: {
          change: function change(val) {
            _this.internalValue = val;
          }
        }
      }, children);
    },
    genProgress: function genProgress() {
      return this.$createElement(_VProgressLinear.default, {
        staticClass: 'v-carousel__progress',
        props: {
          color: this.progressColor,
          value: (this.internalIndex + 1) / this.items.length * 100
        }
      });
    },
    restartTimeout: function restartTimeout() {
      this.slideTimeout && clearTimeout(this.slideTimeout);
      this.slideTimeout = undefined;
      window.requestAnimationFrame(this.startTimeout);
    },
    startTimeout: function startTimeout() {
      if (!this.cycle) return;
      this.slideTimeout = window.setTimeout(this.next, +this.interval > 0 ? +this.interval : 6000);
    }
  },
  render: function render(h) {
    var render = _VWindow.default.options.render.call(this, h);

    render.data.style = "height: ".concat((0, _helpers.convertToUnit)(this.height), ";");
    /* istanbul ignore else */

    if (!this.hideDelimiters) {
      render.children.push(this.genDelimiters());
    }
    /* istanbul ignore else */


    if (this.progress || this.progressColor) {
      render.children.push(this.genProgress());
    }

    return render;
  }
});

exports.default = _default;
//# sourceMappingURL=VCarousel.js.map
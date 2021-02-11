"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("../../../src/components/VSlider/VSlider.sass");

var _VInput = _interopRequireDefault(require("../VInput"));

var _transitions = require("../transitions");

var _mixins = _interopRequireDefault(require("../../util/mixins"));

var _loadable = _interopRequireDefault(require("../../mixins/loadable"));

var _clickOutside = _interopRequireDefault(require("../../directives/click-outside"));

var _helpers = require("../../util/helpers");

var _console = require("../../util/console");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _default2 = (0, _mixins.default)(_VInput.default, _loadable.default
/* @vue/component */
).extend({
  name: 'v-slider',
  directives: {
    ClickOutside: _clickOutside.default
  },
  mixins: [_loadable.default],
  props: {
    disabled: Boolean,
    inverseLabel: Boolean,
    max: {
      type: [Number, String],
      default: 100
    },
    min: {
      type: [Number, String],
      default: 0
    },
    step: {
      type: [Number, String],
      default: 1
    },
    thumbColor: String,
    thumbLabel: {
      type: [Boolean, String],
      default: undefined,
      validator: function validator(v) {
        return typeof v === 'boolean' || v === 'always';
      }
    },
    thumbSize: {
      type: [Number, String],
      default: 32
    },
    tickLabels: {
      type: Array,
      default: function _default() {
        return [];
      }
    },
    ticks: {
      type: [Boolean, String],
      default: false,
      validator: function validator(v) {
        return typeof v === 'boolean' || v === 'always';
      }
    },
    tickSize: {
      type: [Number, String],
      default: 2
    },
    trackColor: String,
    trackFillColor: String,
    value: [Number, String],
    vertical: Boolean
  },
  data: function data() {
    return {
      app: null,
      oldValue: null,
      keyPressed: 0,
      isFocused: false,
      isActive: false,
      noClick: false
    };
  },
  computed: {
    classes: function classes() {
      return _objectSpread({}, _VInput.default.options.computed.classes.call(this), {
        'v-input__slider': true,
        'v-input__slider--vertical': this.vertical,
        'v-input__slider--inverse-label': this.inverseLabel
      });
    },
    internalValue: {
      get: function get() {
        return this.lazyValue;
      },
      set: function set(val) {
        val = isNaN(val) ? this.minValue : val; // Round value to ensure the
        // entire slider range can
        // be selected with step

        var value = this.roundValue(Math.min(Math.max(val, this.minValue), this.maxValue));
        if (value === this.lazyValue) return;
        this.lazyValue = value;
        this.$emit('input', value);
      }
    },
    trackTransition: function trackTransition() {
      return this.keyPressed >= 2 ? 'none' : '';
    },
    minValue: function minValue() {
      return parseFloat(this.min);
    },
    maxValue: function maxValue() {
      return parseFloat(this.max);
    },
    stepNumeric: function stepNumeric() {
      return this.step > 0 ? parseFloat(this.step) : 0;
    },
    inputWidth: function inputWidth() {
      return (this.roundValue(this.internalValue) - this.minValue) / (this.maxValue - this.minValue) * 100;
    },
    trackFillStyles: function trackFillStyles() {
      var _ref;

      var startDir = this.vertical ? 'bottom' : 'left';
      var endDir = this.vertical ? 'top' : 'right';
      var valueDir = this.vertical ? 'height' : 'width';
      var start = this.$vuetify.rtl ? 'auto' : '0';
      var end = this.$vuetify.rtl ? '0' : 'auto';
      var value = this.isDisabled ? "calc(".concat(this.inputWidth, "% - 10px)") : "".concat(this.inputWidth, "%");
      return _ref = {
        transition: this.trackTransition
      }, _defineProperty(_ref, startDir, start), _defineProperty(_ref, endDir, end), _defineProperty(_ref, valueDir, value), _ref;
    },
    trackStyles: function trackStyles() {
      var _ref2;

      var startDir = this.vertical ? this.$vuetify.rtl ? 'bottom' : 'top' : this.$vuetify.rtl ? 'left' : 'right';
      var endDir = this.vertical ? 'height' : 'width';
      var start = '0px';
      var end = this.isDisabled ? "calc(".concat(100 - this.inputWidth, "% - 10px)") : "calc(".concat(100 - this.inputWidth, "%)");
      return _ref2 = {
        transition: this.trackTransition
      }, _defineProperty(_ref2, startDir, start), _defineProperty(_ref2, endDir, end), _ref2;
    },
    showTicks: function showTicks() {
      return this.tickLabels.length > 0 || !!(!this.isDisabled && this.stepNumeric && this.ticks);
    },
    numTicks: function numTicks() {
      return Math.ceil((this.maxValue - this.minValue) / this.stepNumeric);
    },
    showThumbLabel: function showThumbLabel() {
      return !this.isDisabled && !!(this.thumbLabel || this.$scopedSlots['thumb-label']);
    },
    computedTrackColor: function computedTrackColor() {
      if (this.isDisabled) return undefined;
      if (this.trackColor) return this.trackColor;
      if (this.isDark) return this.validationState;
      return this.validationState || 'primary lighten-3';
    },
    computedTrackFillColor: function computedTrackFillColor() {
      if (this.isDisabled) return undefined;
      if (this.trackFillColor) return this.trackFillColor;
      return this.validationState || this.computedColor;
    },
    computedThumbColor: function computedThumbColor() {
      if (this.thumbColor) return this.thumbColor;
      return this.validationState || this.computedColor;
    }
  },
  watch: {
    min: function min(val) {
      var parsed = parseFloat(val);
      parsed > this.internalValue && this.$emit('input', parsed);
    },
    max: function max(val) {
      var parsed = parseFloat(val);
      parsed < this.internalValue && this.$emit('input', parsed);
    },
    value: {
      handler: function handler(v) {
        this.internalValue = v;
      }
    }
  },
  // If done in as immediate in
  // value watcher, causes issues
  // with vue-test-utils
  beforeMount: function beforeMount() {
    this.internalValue = this.value;
  },
  mounted: function mounted() {
    // Without a v-app, iOS does not work with body selectors
    this.app = document.querySelector('[data-app]') || (0, _console.consoleWarn)('Missing v-app or a non-body wrapping element with the [data-app] attribute', this);
  },
  methods: {
    genDefaultSlot: function genDefaultSlot() {
      var children = [this.genLabel()];
      var slider = this.genSlider();
      this.inverseLabel ? children.unshift(slider) : children.push(slider);
      children.push(this.genProgress());
      return children;
    },
    genSlider: function genSlider() {
      return this.$createElement('div', {
        class: _objectSpread({
          'v-slider': true,
          'v-slider--horizontal': !this.vertical,
          'v-slider--vertical': this.vertical,
          'v-slider--focused': this.isFocused,
          'v-slider--active': this.isActive,
          'v-slider--disabled': this.isDisabled,
          'v-slider--readonly': this.isReadonly
        }, this.themeClasses),
        directives: [{
          name: 'click-outside',
          value: this.onBlur
        }],
        on: {
          click: this.onSliderClick,
          mousedown: this.onSliderMouseDown
        }
      }, this.genChildren());
    },
    genChildren: function genChildren() {
      return [this.genInput(), this.genTrackContainer(), this.genSteps(), this.genThumbContainer(this.internalValue, this.inputWidth, this.isActive, this.isFocused, this.onSliderMouseDown, this.onFocus, this.onBlur)];
    },
    genInput: function genInput() {
      return this.$createElement('input', {
        attrs: _objectSpread({
          value: this.internalValue,
          id: this.computedId,
          disabled: true,
          readonly: true,
          tabindex: -1
        }, this.$attrs)
      });
    },
    genTrackContainer: function genTrackContainer() {
      var children = [this.$createElement('div', this.setBackgroundColor(this.computedTrackColor, {
        staticClass: 'v-slider__track-background',
        style: this.trackStyles
      })), this.$createElement('div', this.setBackgroundColor(this.computedTrackFillColor, {
        staticClass: 'v-slider__track-fill',
        style: this.trackFillStyles
      }))];
      return this.$createElement('div', {
        staticClass: 'v-slider__track-container',
        ref: 'track'
      }, children);
    },
    genSteps: function genSteps() {
      var _this = this;

      if (!this.step || !this.showTicks) return null;
      var tickSize = parseFloat(this.tickSize);
      var range = (0, _helpers.createRange)(this.numTicks + 1);
      var direction = this.vertical ? 'bottom' : this.$vuetify.rtl ? 'right' : 'left';
      var offsetDirection = this.vertical ? this.$vuetify.rtl ? 'left' : 'right' : 'top';
      if (this.vertical) range.reverse();
      var ticks = range.map(function (index) {
        var _style;

        var children = [];

        if (_this.tickLabels[index]) {
          children.push(_this.$createElement('div', {
            staticClass: 'v-slider__tick-label'
          }, _this.tickLabels[index]));
        }

        var width = index * (100 / _this.numTicks);
        var filled = _this.$vuetify.rtl ? 100 - _this.inputWidth < width : width < _this.inputWidth;
        return _this.$createElement('span', {
          key: index,
          staticClass: 'v-slider__tick',
          class: {
            'v-slider__tick--filled': filled
          },
          style: (_style = {
            width: "".concat(tickSize, "px"),
            height: "".concat(tickSize, "px")
          }, _defineProperty(_style, direction, "calc(".concat(width, "% - ").concat(tickSize / 2, "px)")), _defineProperty(_style, offsetDirection, "calc(50% - ".concat(tickSize / 2, "px)")), _style)
        }, children);
      });
      return this.$createElement('div', {
        staticClass: 'v-slider__ticks-container',
        class: {
          'v-slider__ticks-container--always-show': this.ticks === 'always' || this.tickLabels.length > 0
        }
      }, ticks);
    },
    genThumbContainer: function genThumbContainer(value, valueWidth, isActive, isFocused, onDrag, onFocus, onBlur) {
      var ref = arguments.length > 7 && arguments[7] !== undefined ? arguments[7] : 'thumb';
      var children = [this.genThumb()];
      var thumbLabelContent = this.genThumbLabelContent(value);
      this.showThumbLabel && children.push(this.genThumbLabel(thumbLabelContent));
      return this.$createElement('div', this.setTextColor(this.computedThumbColor, {
        ref: ref,
        key: ref,
        staticClass: 'v-slider__thumb-container',
        class: {
          'v-slider__thumb-container--active': isActive,
          'v-slider__thumb-container--focused': isFocused,
          'v-slider__thumb-container--show-label': this.showThumbLabel
        },
        style: this.getThumbContainerStyles(valueWidth),
        attrs: _objectSpread({
          role: 'slider',
          tabindex: this.isDisabled ? -1 : this.$attrs.tabindex ? this.$attrs.tabindex : 0,
          'aria-label': this.label,
          'aria-valuemin': this.min,
          'aria-valuemax': this.max,
          'aria-valuenow': this.internalValue,
          'aria-readonly': String(this.isReadonly),
          'aria-orientation': this.vertical ? 'vertical' : 'horizontal'
        }, this.$attrs),
        on: {
          focus: onFocus,
          blur: onBlur,
          keydown: this.onKeyDown,
          keyup: this.onKeyUp,
          touchstart: onDrag,
          mousedown: onDrag
        }
      }), children);
    },
    genThumbLabelContent: function genThumbLabelContent(value) {
      return this.$scopedSlots['thumb-label'] ? this.$scopedSlots['thumb-label']({
        value: value
      }) : [this.$createElement('span', [String(value)])];
    },
    genThumbLabel: function genThumbLabel(content) {
      var size = (0, _helpers.convertToUnit)(this.thumbSize);
      var transform = this.vertical ? "translateY(20%) translateY(".concat(Number(this.thumbSize) / 3 - 1, "px) translateX(55%) rotate(135deg)") : "translateY(-20%) translateY(-12px) translateX(-50%) rotate(45deg)";
      return this.$createElement(_transitions.VScaleTransition, {
        props: {
          origin: 'bottom center'
        }
      }, [this.$createElement('div', {
        staticClass: 'v-slider__thumb-label-container',
        directives: [{
          name: 'show',
          value: this.isFocused || this.isActive || this.thumbLabel === 'always'
        }]
      }, [this.$createElement('div', this.setBackgroundColor(this.computedThumbColor, {
        staticClass: 'v-slider__thumb-label',
        style: {
          height: size,
          width: size,
          transform: transform
        }
      }), [this.$createElement('div', content)])])]);
    },
    genThumb: function genThumb() {
      return this.$createElement('div', this.setBackgroundColor(this.computedThumbColor, {
        staticClass: 'v-slider__thumb'
      }));
    },
    getThumbContainerStyles: function getThumbContainerStyles(width) {
      var direction = this.vertical ? 'top' : 'left';
      var value = this.$vuetify.rtl ? 100 - width : width;
      value = this.vertical ? 100 - value : value;
      return _defineProperty({
        transition: this.trackTransition
      }, direction, "".concat(value, "%"));
    },
    onSliderMouseDown: function onSliderMouseDown(e) {
      e.preventDefault();
      this.oldValue = this.internalValue;
      this.keyPressed = 2;
      this.isActive = true;
      var mouseUpOptions = _helpers.passiveSupported ? {
        passive: true,
        capture: true
      } : true;
      var mouseMoveOptions = _helpers.passiveSupported ? {
        passive: true
      } : false;

      if ('touches' in e) {
        this.app.addEventListener('touchmove', this.onMouseMove, mouseMoveOptions);
        (0, _helpers.addOnceEventListener)(this.app, 'touchend', this.onSliderMouseUp, mouseUpOptions);
      } else {
        this.onMouseMove(e);
        this.app.addEventListener('mousemove', this.onMouseMove, mouseMoveOptions);
        (0, _helpers.addOnceEventListener)(this.app, 'mouseup', this.onSliderMouseUp, mouseUpOptions);
      }

      this.$emit('start', this.internalValue);
    },
    onSliderMouseUp: function onSliderMouseUp(e) {
      e.stopPropagation();
      this.keyPressed = 0;
      var mouseMoveOptions = _helpers.passiveSupported ? {
        passive: true
      } : false;
      this.app.removeEventListener('touchmove', this.onMouseMove, mouseMoveOptions);
      this.app.removeEventListener('mousemove', this.onMouseMove, mouseMoveOptions);
      this.$emit('mouseup', e);
      this.$emit('end', this.internalValue);

      if (!(0, _helpers.deepEqual)(this.oldValue, this.internalValue)) {
        this.$emit('change', this.internalValue);
        this.noClick = true;
      }

      this.isActive = false;
    },
    onMouseMove: function onMouseMove(e) {
      var _this$parseMouseMove = this.parseMouseMove(e),
          value = _this$parseMouseMove.value;

      this.internalValue = value;
    },
    onKeyDown: function onKeyDown(e) {
      if (!this.isInteractive) return;
      var value = this.parseKeyDown(e, this.internalValue);
      if (value == null || value < this.minValue || value > this.maxValue) return;
      this.internalValue = value;
      this.$emit('change', value);
    },
    onKeyUp: function onKeyUp() {
      this.keyPressed = 0;
    },
    onSliderClick: function onSliderClick(e) {
      if (this.noClick) {
        this.noClick = false;
        return;
      }

      var thumb = this.$refs.thumb;
      thumb.focus();
      this.onMouseMove(e);
      this.$emit('change', this.internalValue);
    },
    onBlur: function onBlur(e) {
      this.isFocused = false;
      this.$emit('blur', e);
    },
    onFocus: function onFocus(e) {
      this.isFocused = true;
      this.$emit('focus', e);
    },
    parseMouseMove: function parseMouseMove(e) {
      var start = this.vertical ? 'top' : 'left';
      var length = this.vertical ? 'height' : 'width';
      var click = this.vertical ? 'clientY' : 'clientX';

      var _this$$refs$track$get = this.$refs.track.getBoundingClientRect(),
          trackStart = _this$$refs$track$get[start],
          trackLength = _this$$refs$track$get[length];

      var clickOffset = 'touches' in e ? e.touches[0][click] : e[click]; // Can we get rid of any here?
      // It is possible for left to be NaN, force to number

      var clickPos = Math.min(Math.max((clickOffset - trackStart) / trackLength, 0), 1) || 0;
      if (this.vertical) clickPos = 1 - clickPos;
      if (this.$vuetify.rtl) clickPos = 1 - clickPos;
      var isInsideTrack = clickOffset >= trackStart && clickOffset <= trackStart + trackLength;
      var value = parseFloat(this.min) + clickPos * (this.maxValue - this.minValue);
      return {
        value: value,
        isInsideTrack: isInsideTrack
      };
    },
    parseKeyDown: function parseKeyDown(e, value) {
      if (!this.isInteractive) return;
      var pageup = _helpers.keyCodes.pageup,
          pagedown = _helpers.keyCodes.pagedown,
          end = _helpers.keyCodes.end,
          home = _helpers.keyCodes.home,
          left = _helpers.keyCodes.left,
          right = _helpers.keyCodes.right,
          down = _helpers.keyCodes.down,
          up = _helpers.keyCodes.up;
      if (![pageup, pagedown, end, home, left, right, down, up].includes(e.keyCode)) return;
      e.preventDefault();
      var step = this.stepNumeric || 1;
      var steps = (this.maxValue - this.minValue) / step;

      if ([left, right, down, up].includes(e.keyCode)) {
        this.keyPressed += 1;
        var increase = this.$vuetify.rtl ? [left, up] : [right, up];
        var direction = increase.includes(e.keyCode) ? 1 : -1;
        var multiplier = e.shiftKey ? 3 : e.ctrlKey ? 2 : 1;
        value = value + direction * step * multiplier;
      } else if (e.keyCode === home) {
        value = this.minValue;
      } else if (e.keyCode === end) {
        value = this.maxValue;
      } else {
        var _direction = e.keyCode === pagedown ? 1 : -1;

        value = value - _direction * step * (steps > 100 ? steps / 10 : 10);
      }

      return value;
    },
    roundValue: function roundValue(value) {
      if (!this.stepNumeric) return value; // Format input value using the same number
      // of decimals places as in the step prop

      var trimmedStep = this.step.toString().trim();
      var decimals = trimmedStep.indexOf('.') > -1 ? trimmedStep.length - trimmedStep.indexOf('.') - 1 : 0;
      var offset = this.minValue % this.stepNumeric;
      var newValue = Math.round((value - offset) / this.stepNumeric) * this.stepNumeric + offset;
      return parseFloat(Math.min(newValue, this.maxValue).toFixed(decimals));
    }
  }
});

exports.default = _default2;
//# sourceMappingURL=VSlider.js.map
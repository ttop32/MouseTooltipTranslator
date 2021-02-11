"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("../../../src/components/VRangeSlider/VRangeSlider.sass");

var _VSlider = _interopRequireDefault(require("../VSlider"));

var _helpers = require("../../util/helpers");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/* @vue/component */
var _default2 = _VSlider.default.extend({
  name: 'v-range-slider',
  props: {
    value: {
      type: Array,
      default: function _default() {
        return [0, 0];
      }
    }
  },
  data: function data() {
    return {
      activeThumb: null,
      lazyValue: this.value
    };
  },
  computed: {
    classes: function classes() {
      return _objectSpread({}, _VSlider.default.options.computed.classes.call(this), {
        'v-input--range-slider': true
      });
    },
    internalValue: {
      get: function get() {
        return this.lazyValue;
      },
      set: function set(val) {
        var _this = this;

        // Round value to ensure the
        // entire slider range can
        // be selected with step
        var value = val.map(function () {
          var v = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
          return _this.roundValue(Math.min(Math.max(v, _this.minValue), _this.maxValue));
        }); // Switch values if range and wrong order

        if (value[0] > value[1] || value[1] < value[0]) {
          if (this.activeThumb !== null) {
            var toFocus = this.activeThumb === 1 ? 0 : 1;
            var el = this.$refs["thumb_".concat(toFocus)];
            el.focus();
          }

          value = [value[1], value[0]];
        }

        this.lazyValue = value;
        if (!(0, _helpers.deepEqual)(value, this.value)) this.$emit('input', value);
        this.validate();
      }
    },
    inputWidth: function inputWidth() {
      var _this2 = this;

      return this.internalValue.map(function (v) {
        return (_this2.roundValue(v) - _this2.minValue) / (_this2.maxValue - _this2.minValue) * 100;
      });
    }
  },
  methods: {
    getTrackStyle: function getTrackStyle(startLength, endLength) {
      var _ref;

      var startPadding = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
      var endPadding = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;
      var startDir = this.vertical ? this.$vuetify.rtl ? 'top' : 'bottom' : this.$vuetify.rtl ? 'right' : 'left';
      var endDir = this.vertical ? 'height' : 'width';
      var start = "calc(".concat(startLength, "% + ").concat(startPadding, "px)");
      var end = "calc(".concat(endLength, "% + ").concat(endPadding, "px)");
      return _ref = {
        transition: this.trackTransition
      }, _defineProperty(_ref, startDir, start), _defineProperty(_ref, endDir, end), _ref;
    },
    getIndexOfClosestValue: function getIndexOfClosestValue(arr, v) {
      if (Math.abs(arr[0] - v) < Math.abs(arr[1] - v)) return 0;else return 1;
    },
    genInput: function genInput() {
      var _this3 = this;

      return (0, _helpers.createRange)(2).map(function (i) {
        var input = _VSlider.default.options.methods.genInput.call(_this3);

        input.data = input.data || {};
        input.data.attrs = input.data.attrs || {};
        input.data.attrs.value = _this3.internalValue[i];
        input.data.attrs.id = "input-".concat(i ? 'max' : 'min', "-").concat(_this3._uid);
        return input;
      });
    },
    genTrackContainer: function genTrackContainer() {
      var _this4 = this;

      var children = [];
      var padding = this.isDisabled ? 10 : 0;
      var sections = [{
        class: 'v-slider__track-background',
        color: this.computedTrackColor,
        styles: [0, this.inputWidth[0], 0, -padding]
      }, {
        class: this.isDisabled ? 'v-slider__track-background' : 'v-slider__track-fill',
        color: this.isDisabled ? this.computedTrackColor : this.computedTrackFillColor,
        styles: [this.inputWidth[0], Math.abs(this.inputWidth[1] - this.inputWidth[0]), padding, padding * -2]
      }, {
        class: 'v-slider__track-background',
        color: this.computedTrackColor,
        styles: [this.inputWidth[1], Math.abs(100 - this.inputWidth[1]), padding, -padding]
      }];
      if (this.$vuetify.rtl) sections.reverse();
      children.push.apply(children, _toConsumableArray(sections.map(function (section) {
        return _this4.$createElement('div', _this4.setBackgroundColor(section.color, {
          staticClass: section.class,
          style: _this4.getTrackStyle.apply(_this4, _toConsumableArray(section.styles))
        }));
      })));
      return this.$createElement('div', {
        staticClass: 'v-slider__track-container',
        ref: 'track'
      }, children);
    },
    genChildren: function genChildren() {
      var _this5 = this;

      return [this.genInput(), this.genTrackContainer(), this.genSteps(), (0, _helpers.createRange)(2).map(function (index) {
        var value = _this5.internalValue[index];

        var onDrag = function onDrag(e) {
          _this5.isActive = true;
          _this5.activeThumb = index;

          _this5.onSliderMouseDown(e);
        };

        var onFocus = function onFocus(e) {
          _this5.isFocused = true;
          _this5.activeThumb = index;

          _this5.$emit('focus', e);
        };

        var onBlur = function onBlur(e) {
          _this5.isFocused = false;
          _this5.activeThumb = null;

          _this5.$emit('blur', e);
        };

        var valueWidth = _this5.inputWidth[index];
        var isActive = _this5.isActive && _this5.activeThumb === index;
        var isFocused = _this5.isFocused && _this5.activeThumb === index;
        return _this5.genThumbContainer(value, valueWidth, isActive, isFocused, onDrag, onFocus, onBlur, "thumb_".concat(index));
      })];
    },
    reevaluateSelected: function reevaluateSelected(value) {
      this.activeThumb = this.getIndexOfClosestValue(this.internalValue, value);
      var refName = "thumb_".concat(this.activeThumb);
      var thumbRef = this.$refs[refName];
      thumbRef.focus();
    },
    onSliderMouseDown: function onSliderMouseDown(e) {
      var _this$parseMouseMove = this.parseMouseMove(e),
          value = _this$parseMouseMove.value;

      this.reevaluateSelected(value);
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
    onSliderClick: function onSliderClick(e) {
      if (!this.isActive) {
        if (this.noClick) {
          this.noClick = false;
          return;
        }

        var _this$parseMouseMove2 = this.parseMouseMove(e),
            value = _this$parseMouseMove2.value,
            isInsideTrack = _this$parseMouseMove2.isInsideTrack;

        if (isInsideTrack) {
          this.reevaluateSelected(value);
        }

        this.setInternalValue(value);
        this.$emit('change', this.internalValue);
      }
    },
    onMouseMove: function onMouseMove(e) {
      var _this$parseMouseMove3 = this.parseMouseMove(e),
          value = _this$parseMouseMove3.value,
          isInsideTrack = _this$parseMouseMove3.isInsideTrack;

      if (isInsideTrack && this.activeThumb === null) {
        this.activeThumb = this.getIndexOfClosestValue(this.internalValue, value);
      }

      this.setInternalValue(value);
    },
    onKeyDown: function onKeyDown(e) {
      if (this.activeThumb === null) return;
      var value = this.parseKeyDown(e, this.internalValue[this.activeThumb]);
      if (value == null) return;
      this.setInternalValue(value);
      this.$emit('change', this.internalValue);
    },
    setInternalValue: function setInternalValue(value) {
      var _this6 = this;

      this.internalValue = this.internalValue.map(function (v, i) {
        if (i === _this6.activeThumb) return value;else return Number(v);
      });
    }
  }
});

exports.default = _default2;
//# sourceMappingURL=VRangeSlider.js.map
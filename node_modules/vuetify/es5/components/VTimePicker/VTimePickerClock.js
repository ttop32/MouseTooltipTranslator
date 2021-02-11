"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("../../../src/components/VTimePicker/VTimePickerClock.sass");

var _colorable = _interopRequireDefault(require("../../mixins/colorable"));

var _themeable = _interopRequireDefault(require("../../mixins/themeable"));

var _mixins = _interopRequireDefault(require("../../util/mixins"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _default2 = (0, _mixins.default)(_colorable.default, _themeable.default
/* @vue/component */
).extend({
  name: 'v-time-picker-clock',
  props: {
    allowedValues: Function,
    ampm: Boolean,
    disabled: Boolean,
    double: Boolean,
    format: {
      type: Function,
      default: function _default(val) {
        return val;
      }
    },
    max: {
      type: Number,
      required: true
    },
    min: {
      type: Number,
      required: true
    },
    scrollable: Boolean,
    readonly: Boolean,
    rotate: {
      type: Number,
      default: 0
    },
    step: {
      type: Number,
      default: 1
    },
    value: Number
  },
  data: function data() {
    return {
      inputValue: this.value,
      isDragging: false,
      valueOnMouseDown: null,
      valueOnMouseUp: null
    };
  },
  computed: {
    count: function count() {
      return this.max - this.min + 1;
    },
    degreesPerUnit: function degreesPerUnit() {
      return 360 / this.roundCount;
    },
    degrees: function degrees() {
      return this.degreesPerUnit * Math.PI / 180;
    },
    displayedValue: function displayedValue() {
      return this.value == null ? this.min : this.value;
    },
    innerRadiusScale: function innerRadiusScale() {
      return 0.62;
    },
    roundCount: function roundCount() {
      return this.double ? this.count / 2 : this.count;
    }
  },
  watch: {
    value: function value(_value) {
      this.inputValue = _value;
    }
  },
  methods: {
    wheel: function wheel(e) {
      e.preventDefault();
      var delta = Math.sign(-e.deltaY || 1);
      var value = this.displayedValue;

      do {
        value = value + delta;
        value = (value - this.min + this.count) % this.count + this.min;
      } while (!this.isAllowed(value) && value !== this.displayedValue);

      if (value !== this.displayedValue) {
        this.update(value);
      }
    },
    isInner: function isInner(value) {
      return this.double && value - this.min >= this.roundCount;
    },
    handScale: function handScale(value) {
      return this.isInner(value) ? this.innerRadiusScale : 1;
    },
    isAllowed: function isAllowed(value) {
      return !this.allowedValues || this.allowedValues(value);
    },
    genValues: function genValues() {
      var children = [];

      for (var value = this.min; value <= this.max; value = value + this.step) {
        var color = value === this.value && (this.color || 'accent');
        children.push(this.$createElement('span', this.setBackgroundColor(color, {
          staticClass: 'v-time-picker-clock__item',
          class: {
            'v-time-picker-clock__item--active': value === this.displayedValue,
            'v-time-picker-clock__item--disabled': this.disabled || !this.isAllowed(value)
          },
          style: this.getTransform(value),
          domProps: {
            innerHTML: "<span>".concat(this.format(value), "</span>")
          }
        })));
      }

      return children;
    },
    genHand: function genHand() {
      var scale = "scaleY(".concat(this.handScale(this.displayedValue), ")");
      var angle = this.rotate + this.degreesPerUnit * (this.displayedValue - this.min);
      var color = this.value != null && (this.color || 'accent');
      return this.$createElement('div', this.setBackgroundColor(color, {
        staticClass: 'v-time-picker-clock__hand',
        class: {
          'v-time-picker-clock__hand--inner': this.isInner(this.value)
        },
        style: {
          transform: "rotate(".concat(angle, "deg) ").concat(scale)
        }
      }));
    },
    getTransform: function getTransform(i) {
      var _this$getPosition = this.getPosition(i),
          x = _this$getPosition.x,
          y = _this$getPosition.y;

      return {
        left: "".concat(50 + x * 50, "%"),
        top: "".concat(50 + y * 50, "%")
      };
    },
    getPosition: function getPosition(value) {
      var rotateRadians = this.rotate * Math.PI / 180;
      return {
        x: Math.sin((value - this.min) * this.degrees + rotateRadians) * this.handScale(value),
        y: -Math.cos((value - this.min) * this.degrees + rotateRadians) * this.handScale(value)
      };
    },
    onMouseDown: function onMouseDown(e) {
      e.preventDefault();
      this.valueOnMouseDown = null;
      this.valueOnMouseUp = null;
      this.isDragging = true;
      this.onDragMove(e);
    },
    onMouseUp: function onMouseUp(e) {
      e.stopPropagation();
      this.isDragging = false;

      if (this.valueOnMouseUp !== null && this.isAllowed(this.valueOnMouseUp)) {
        this.$emit('change', this.valueOnMouseUp);
      }
    },
    onDragMove: function onDragMove(e) {
      e.preventDefault();
      if (!this.isDragging && e.type !== 'click') return;

      var _this$$refs$clock$get = this.$refs.clock.getBoundingClientRect(),
          width = _this$$refs$clock$get.width,
          top = _this$$refs$clock$get.top,
          left = _this$$refs$clock$get.left;

      var _this$$refs$innerCloc = this.$refs.innerClock.getBoundingClientRect(),
          innerWidth = _this$$refs$innerCloc.width;

      var _ref = 'touches' in e ? e.touches[0] : e,
          clientX = _ref.clientX,
          clientY = _ref.clientY;

      var center = {
        x: width / 2,
        y: -width / 2
      };
      var coords = {
        x: clientX - left,
        y: top - clientY
      };
      var handAngle = Math.round(this.angle(center, coords) - this.rotate + 360) % 360;
      var insideClick = this.double && this.euclidean(center, coords) < (innerWidth + innerWidth * this.innerRadiusScale) / 4;
      var checksCount = Math.ceil(15 / this.degreesPerUnit);
      var value;

      for (var i = 0; i < checksCount; i++) {
        value = this.angleToValue(handAngle + i * this.degreesPerUnit, insideClick);
        if (this.isAllowed(value)) return this.setMouseDownValue(value);
        value = this.angleToValue(handAngle - i * this.degreesPerUnit, insideClick);
        if (this.isAllowed(value)) return this.setMouseDownValue(value);
      }
    },
    angleToValue: function angleToValue(angle, insideClick) {
      var value = (Math.round(angle / this.degreesPerUnit) + (insideClick ? this.roundCount : 0)) % this.count + this.min; // Necessary to fix edge case when selecting left part of the value(s) at 12 o'clock

      if (angle < 360 - this.degreesPerUnit / 2) return value;
      return insideClick ? this.max - this.roundCount + 1 : this.min;
    },
    setMouseDownValue: function setMouseDownValue(value) {
      if (this.valueOnMouseDown === null) {
        this.valueOnMouseDown = value;
      }

      this.valueOnMouseUp = value;
      this.update(value);
    },
    update: function update(value) {
      if (this.inputValue !== value) {
        this.inputValue = value;
        this.$emit('input', value);
      }
    },
    euclidean: function euclidean(p0, p1) {
      var dx = p1.x - p0.x;
      var dy = p1.y - p0.y;
      return Math.sqrt(dx * dx + dy * dy);
    },
    angle: function angle(center, p1) {
      var value = 2 * Math.atan2(p1.y - center.y - this.euclidean(center, p1), p1.x - center.x);
      return Math.abs(value * 180 / Math.PI);
    }
  },
  render: function render(h) {
    var _this = this;

    var data = {
      staticClass: 'v-time-picker-clock',
      class: _objectSpread({
        'v-time-picker-clock--indeterminate': this.value == null
      }, this.themeClasses),
      on: this.readonly || this.disabled ? undefined : {
        mousedown: this.onMouseDown,
        mouseup: this.onMouseUp,
        mouseleave: function mouseleave(e) {
          return _this.isDragging && _this.onMouseUp(e);
        },
        touchstart: this.onMouseDown,
        touchend: this.onMouseUp,
        mousemove: this.onDragMove,
        touchmove: this.onDragMove
      },
      ref: 'clock'
    };

    if (this.scrollable && data.on) {
      data.on.wheel = this.wheel;
    }

    return h('div', data, [h('div', {
      staticClass: 'v-time-picker-clock__inner',
      ref: 'innerClock'
    }, [this.genHand(), this.genValues()])]);
  }
});

exports.default = _default2;
//# sourceMappingURL=VTimePickerClock.js.map
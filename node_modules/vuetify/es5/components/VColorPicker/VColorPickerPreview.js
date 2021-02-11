"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("../../../src/components/VColorPicker/VColorPickerPreview.sass");

var _VSlider = _interopRequireDefault(require("../VSlider/VSlider"));

var _colorUtils = require("../../util/colorUtils");

var _vue = _interopRequireDefault(require("vue"));

var _util = require("./util");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _default = _vue.default.extend({
  name: 'v-color-picker-preview',
  props: {
    color: Object,
    disabled: Boolean,
    hideAlpha: Boolean
  },
  methods: {
    genAlpha: function genAlpha() {
      var _this = this;

      return this.genTrack({
        staticClass: 'v-color-picker__alpha',
        props: {
          thumbColor: 'grey lighten-2',
          hideDetails: true,
          value: this.color.alpha,
          step: 0,
          min: 0,
          max: 1
        },
        style: {
          backgroundImage: this.disabled ? undefined : "linear-gradient(to ".concat(this.$vuetify.rtl ? 'left' : 'right', ", transparent, ").concat((0, _colorUtils.RGBtoCSS)(this.color.rgba), ")")
        },
        on: {
          input: function input(val) {
            return _this.color.alpha !== val && _this.$emit('update:color', (0, _util.fromHSVA)(_objectSpread({}, _this.color.hsva, {
              a: val
            })));
          }
        }
      });
    },
    genSliders: function genSliders() {
      return this.$createElement('div', {
        staticClass: 'v-color-picker__sliders'
      }, [this.genHue(), !this.hideAlpha && this.genAlpha()]);
    },
    genDot: function genDot() {
      return this.$createElement('div', {
        staticClass: 'v-color-picker__dot'
      }, [this.$createElement('div', {
        style: {
          background: (0, _colorUtils.RGBAtoCSS)(this.color.rgba)
        }
      })]);
    },
    genHue: function genHue() {
      var _this2 = this;

      return this.genTrack({
        staticClass: 'v-color-picker__hue',
        props: {
          thumbColor: 'grey lighten-2',
          hideDetails: true,
          value: this.color.hue,
          step: 0,
          min: 0,
          max: 360
        },
        on: {
          input: function input(val) {
            return _this2.color.hue !== val && _this2.$emit('update:color', (0, _util.fromHSVA)(_objectSpread({}, _this2.color.hsva, {
              h: val
            })));
          }
        }
      });
    },
    genTrack: function genTrack(options) {
      return this.$createElement(_VSlider.default, _objectSpread({
        class: 'v-color-picker__track'
      }, options, {
        props: _objectSpread({
          disabled: this.disabled
        }, options.props)
      }));
    }
  },
  render: function render(h) {
    return h('div', {
      staticClass: 'v-color-picker__preview',
      class: {
        'v-color-picker__preview--hide-alpha': this.hideAlpha
      }
    }, [this.genDot(), this.genSliders()]);
  }
});

exports.default = _default;
//# sourceMappingURL=VColorPickerPreview.js.map
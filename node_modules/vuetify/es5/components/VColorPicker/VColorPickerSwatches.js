"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("../../../src/components/VColorPicker/VColorPickerSwatches.sass");

var _VIcon = _interopRequireDefault(require("../VIcon"));

var _colors = _interopRequireDefault(require("../../util/colors"));

var _util = require("./util");

var _helpers = require("../../util/helpers");

var _mixins = _interopRequireDefault(require("../../util/mixins"));

var _themeable = _interopRequireDefault(require("../../mixins/themeable"));

var _colorUtils = require("../../util/colorUtils");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Styles
// Components
// Helpers
function parseDefaultColors(colors) {
  return Object.keys(colors).map(function (key) {
    var color = colors[key];
    return color.base ? [color.base, color.darken4, color.darken3, color.darken2, color.darken1, color.lighten1, color.lighten2, color.lighten3, color.lighten4, color.lighten5] : [color.black, color.white, color.transparent];
  });
}

var white = (0, _util.fromHex)('#FFFFFF').rgba;
var black = (0, _util.fromHex)('#000000').rgba;

var _default2 = (0, _mixins.default)(_themeable.default).extend({
  name: 'v-color-picker-swatches',
  props: {
    swatches: {
      type: Array,
      default: function _default() {
        return parseDefaultColors(_colors.default);
      }
    },
    color: Object,
    maxWidth: [Number, String],
    maxHeight: [Number, String]
  },
  methods: {
    genColor: function genColor(color) {
      var _this = this;

      var content = this.$createElement('div', {
        style: {
          background: color
        }
      }, [(0, _helpers.deepEqual)(this.color, (0, _util.parseColor)(color, null)) && this.$createElement(_VIcon.default, {
        props: {
          small: true,
          dark: (0, _colorUtils.contrastRatio)(this.color.rgba, white) > 2 && this.color.alpha > 0.5,
          light: (0, _colorUtils.contrastRatio)(this.color.rgba, black) > 2 && this.color.alpha > 0.5
        }
      }, '$success')]);
      return this.$createElement('div', {
        staticClass: 'v-color-picker__color',
        on: {
          // TODO: Less hacky way of catching transparent
          click: function click() {
            return _this.$emit('update:color', (0, _util.fromHex)(color === 'transparent' ? '#00000000' : color));
          }
        }
      }, [content]);
    },
    genSwatches: function genSwatches() {
      var _this2 = this;

      return this.swatches.map(function (swatch) {
        var colors = swatch.map(_this2.genColor);
        return _this2.$createElement('div', {
          staticClass: 'v-color-picker__swatch'
        }, colors);
      });
    }
  },
  render: function render(h) {
    return h('div', {
      staticClass: 'v-color-picker__swatches',
      style: {
        maxWidth: (0, _helpers.convertToUnit)(this.maxWidth),
        maxHeight: (0, _helpers.convertToUnit)(this.maxHeight)
      }
    }, [this.$createElement('div', this.genSwatches())]);
  }
});

exports.default = _default2;
//# sourceMappingURL=VColorPickerSwatches.js.map
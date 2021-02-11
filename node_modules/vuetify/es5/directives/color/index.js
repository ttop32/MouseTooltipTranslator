"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.Color = void 0;

var _colorUtils = require("../../util/colorUtils");

var _colors = _interopRequireDefault(require("../../util/colors"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Utilities
function setTextColor(el, color, currentTheme) {
  var cssColor = !(0, _colorUtils.isCssColor)(color) ? (0, _colorUtils.classToHex)(color, _colors.default, currentTheme) : color;
  el.style.color = cssColor;
  el.style.caretColor = cssColor;
}

function setBackgroundColor(el, color, currentTheme) {
  var cssColor = !(0, _colorUtils.isCssColor)(color) ? (0, _colorUtils.classToHex)(color, _colors.default, currentTheme) : color;
  el.style.backgroundColor = cssColor;
  el.style.borderColor = cssColor;
}

function setBorderColor(el, color, currentTheme, modifiers) {
  var cssColor = !(0, _colorUtils.isCssColor)(color) ? (0, _colorUtils.classToHex)(color, _colors.default, currentTheme) : color;

  if (!modifiers || !Object.keys(modifiers).length) {
    el.style.borderColor = cssColor;
    return;
  }

  if (modifiers.top) el.style.borderTopColor = cssColor;
  if (modifiers.right) el.style.borderRightColor = cssColor;
  if (modifiers.bottom) el.style.borderBottomColor = cssColor;
  if (modifiers.left) el.style.borderLeftColor = cssColor;
}

function setGradientColor(el, gradient, currentTheme) {
  el.style.backgroundImage = "linear-gradient(".concat((0, _colorUtils.parseGradient)(gradient, _colors.default, currentTheme), ")");
}

function updateColor(el, binding, node) {
  var currentTheme = node.context.$vuetify.theme.currentTheme;

  if (binding.arg === undefined) {
    setBackgroundColor(el, binding.value, currentTheme);
  } else if (binding.arg === 'text') {
    setTextColor(el, binding.value, currentTheme);
  } else if (binding.arg === 'border') {
    setBorderColor(el, binding.value, currentTheme, binding.modifiers);
  } else if (binding.arg === 'gradient') {
    setGradientColor(el, binding.value, currentTheme);
  }
}

function update(el, binding, node) {
  if (binding.value === binding.oldValue) return;
  updateColor(el, binding, node);
}

var Color = {
  bind: updateColor,
  update: update
};
exports.Color = Color;
var _default = Color;
exports.default = _default;
//# sourceMappingURL=index.js.map
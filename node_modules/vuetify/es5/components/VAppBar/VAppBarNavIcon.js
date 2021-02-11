"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _VIcon = _interopRequireDefault(require("../VIcon"));

var _VBtn = _interopRequireDefault(require("../VBtn/VBtn"));

var _vue = _interopRequireDefault(require("vue"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/* @vue/component */
var _default = _vue.default.extend({
  name: 'v-app-bar-nav-icon',
  functional: true,
  render: function render(h, _ref) {
    var slots = _ref.slots,
        listeners = _ref.listeners,
        props = _ref.props,
        data = _ref.data;
    var d = Object.assign(data, {
      staticClass: "v-app-bar__nav-icon ".concat(data.staticClass || '').trim(),
      props: _objectSpread({}, props, {
        icon: true
      }),
      on: listeners
    });
    var defaultSlot = slots().default;
    return h(_VBtn.default, d, defaultSlot || [h(_VIcon.default, '$menu')]);
  }
});

exports.default = _default;
//# sourceMappingURL=VAppBarNavIcon.js.map
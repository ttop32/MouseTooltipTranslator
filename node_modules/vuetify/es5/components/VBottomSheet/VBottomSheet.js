"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("../../../src/components/VBottomSheet/VBottomSheet.sass");

var _VDialog = _interopRequireDefault(require("../VDialog/VDialog"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/* @vue/component */
var _default = _VDialog.default.extend({
  name: 'v-bottom-sheet',
  props: {
    inset: Boolean,
    maxWidth: {
      type: [String, Number],
      default: 'auto'
    },
    transition: {
      type: String,
      default: 'bottom-sheet-transition'
    }
  },
  computed: {
    classes: function classes() {
      return _objectSpread({}, _VDialog.default.options.computed.classes.call(this), {
        'v-bottom-sheet': true,
        'v-bottom-sheet--inset': this.inset
      });
    }
  }
});

exports.default = _default;
//# sourceMappingURL=VBottomSheet.js.map
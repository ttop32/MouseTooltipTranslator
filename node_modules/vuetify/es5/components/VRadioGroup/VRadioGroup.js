"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("../../../src/styles/components/_selection-controls.sass");

require("../../../src/components/VRadioGroup/VRadioGroup.sass");

var _VInput = _interopRequireDefault(require("../VInput"));

var _VItemGroup = require("../VItemGroup/VItemGroup");

var _comparable = _interopRequireDefault(require("../../mixins/comparable"));

var _mixins = _interopRequireDefault(require("../../util/mixins"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var baseMixins = (0, _mixins.default)(_comparable.default, _VItemGroup.BaseItemGroup, _VInput.default);
/* @vue/component */

var _default = baseMixins.extend({
  name: 'v-radio-group',
  provide: function provide() {
    return {
      radioGroup: this
    };
  },
  props: {
    column: {
      type: Boolean,
      default: true
    },
    height: {
      type: [Number, String],
      default: 'auto'
    },
    name: String,
    row: Boolean,
    // If no value set on VRadio
    // will match valueComparator
    // force default to null
    value: null
  },
  computed: {
    classes: function classes() {
      return _objectSpread({}, _VInput.default.options.computed.classes.call(this), {
        'v-input--selection-controls v-input--radio-group': true,
        'v-input--radio-group--column': this.column && !this.row,
        'v-input--radio-group--row': this.row
      });
    }
  },
  methods: {
    genDefaultSlot: function genDefaultSlot() {
      return this.$createElement('div', {
        staticClass: 'v-input--radio-group__input',
        attrs: {
          id: this.id,
          role: 'radiogroup',
          'aria-labelledby': this.computedId
        }
      }, _VInput.default.options.methods.genDefaultSlot.call(this));
    },
    genInputSlot: function genInputSlot() {
      var render = _VInput.default.options.methods.genInputSlot.call(this);

      delete render.data.on.click;
      return render;
    },
    genLabel: function genLabel() {
      var label = _VInput.default.options.methods.genLabel.call(this);

      if (!label) return null;
      label.data.attrs.id = this.computedId; // WAI considers this an orphaned label

      delete label.data.attrs.for;
      label.tag = 'legend';
      return label;
    },
    onClick: _VItemGroup.BaseItemGroup.options.methods.onClick
  }
});

exports.default = _default;
//# sourceMappingURL=VRadioGroup.js.map
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("../../../src/components/VOverflowBtn/VOverflowBtn.sass");

var _VSelect = _interopRequireDefault(require("../VSelect/VSelect"));

var _VAutocomplete = _interopRequireDefault(require("../VAutocomplete"));

var _VTextField = _interopRequireDefault(require("../VTextField/VTextField"));

var _VBtn = _interopRequireDefault(require("../VBtn"));

var _console = require("../../util/console");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/* @vue/component */
var _default = _VAutocomplete.default.extend({
  name: 'v-overflow-btn',
  props: {
    editable: Boolean,
    segmented: Boolean
  },
  computed: {
    classes: function classes() {
      return _objectSpread({}, _VAutocomplete.default.options.computed.classes.call(this), {
        'v-overflow-btn': true,
        'v-overflow-btn--segmented': this.segmented,
        'v-overflow-btn--editable': this.editable
      });
    },
    isAnyValueAllowed: function isAnyValueAllowed() {
      return this.editable || _VAutocomplete.default.options.computed.isAnyValueAllowed.call(this);
    },
    isSingle: function isSingle() {
      return true;
    },
    computedItems: function computedItems() {
      return this.segmented ? this.allItems : this.filteredItems;
    }
  },
  methods: {
    genSelections: function genSelections() {
      return this.editable ? _VAutocomplete.default.options.methods.genSelections.call(this) : _VSelect.default.options.methods.genSelections.call(this); // Override v-autocomplete's override
    },
    genCommaSelection: function genCommaSelection(item, index, last) {
      return this.segmented ? this.genSegmentedBtn(item) : _VSelect.default.options.methods.genCommaSelection.call(this, item, index, last);
    },
    genInput: function genInput() {
      var input = _VTextField.default.options.methods.genInput.call(this);

      input.data = input.data || {};
      input.data.domProps.value = this.editable ? this.internalSearch : '';
      input.data.attrs.readonly = !this.isAnyValueAllowed;
      return input;
    },
    genLabel: function genLabel() {
      if (this.editable && this.isFocused) return null;

      var label = _VTextField.default.options.methods.genLabel.call(this);

      if (!label) return label;
      label.data = label.data || {}; // Reset previously set styles from parent

      label.data.style = {};
      return label;
    },
    genSegmentedBtn: function genSegmentedBtn(item) {
      var _this = this;

      var itemValue = this.getValue(item);
      var itemObj = this.computedItems.find(function (i) {
        return _this.getValue(i) === itemValue;
      }) || item;

      if (!itemObj.text || !itemObj.callback) {
        (0, _console.consoleWarn)('When using "segmented" prop without a selection slot, items must contain both a text and callback property', this);
        return null;
      }

      return this.$createElement(_VBtn.default, {
        props: {
          text: true
        },
        on: {
          click: function click(e) {
            e.stopPropagation();
            itemObj.callback(e);
          }
        }
      }, [itemObj.text]);
    },
    updateValue: function updateValue(val) {
      if (val) {
        this.initialValue = this.lazyValue;
      } else if (this.initialValue !== this.lazyValue) {
        this.$emit('change', this.lazyValue);
      }
    }
  }
});

exports.default = _default;
//# sourceMappingURL=VOverflowBtn.js.map
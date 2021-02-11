"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("../../../src/components/VTextarea/VTextarea.sass");

var _VTextField = _interopRequireDefault(require("../VTextField/VTextField"));

var _mixins = _interopRequireDefault(require("../../util/mixins"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var baseMixins = (0, _mixins.default)(_VTextField.default);
/* @vue/component */

var _default = baseMixins.extend({
  name: 'v-textarea',
  props: {
    autoGrow: Boolean,
    noResize: Boolean,
    rowHeight: {
      type: [Number, String],
      default: 24,
      validator: function validator(v) {
        return !isNaN(parseFloat(v));
      }
    },
    rows: {
      type: [Number, String],
      default: 5,
      validator: function validator(v) {
        return !isNaN(parseInt(v, 10));
      }
    }
  },
  computed: {
    classes: function classes() {
      return _objectSpread({
        'v-textarea': true,
        'v-textarea--auto-grow': this.autoGrow,
        'v-textarea--no-resize': this.noResizeHandle
      }, _VTextField.default.options.computed.classes.call(this));
    },
    noResizeHandle: function noResizeHandle() {
      return this.noResize || this.autoGrow;
    }
  },
  watch: {
    lazyValue: function lazyValue() {
      this.autoGrow && this.$nextTick(this.calculateInputHeight);
    },
    rowHeight: function rowHeight() {
      this.autoGrow && this.$nextTick(this.calculateInputHeight);
    }
  },
  mounted: function mounted() {
    var _this = this;

    setTimeout(function () {
      _this.autoGrow && _this.calculateInputHeight();
    }, 0);
  },
  methods: {
    calculateInputHeight: function calculateInputHeight() {
      var input = this.$refs.input;
      if (!input) return;
      input.style.height = '0';
      var height = input.scrollHeight;
      var minHeight = parseInt(this.rows, 10) * parseFloat(this.rowHeight); // This has to be done ASAP, waiting for Vue
      // to update the DOM causes ugly layout jumping

      input.style.height = Math.max(minHeight, height) + 'px';
    },
    genInput: function genInput() {
      var input = _VTextField.default.options.methods.genInput.call(this);

      input.tag = 'textarea';
      delete input.data.attrs.type;
      input.data.attrs.rows = this.rows;
      return input;
    },
    onInput: function onInput(e) {
      _VTextField.default.options.methods.onInput.call(this, e);

      this.autoGrow && this.calculateInputHeight();
    },
    onKeyDown: function onKeyDown(e) {
      // Prevents closing of a
      // dialog when pressing
      // enter
      if (this.isFocused && e.keyCode === 13) {
        e.stopPropagation();
      }

      this.$emit('keydown', e);
    }
  }
});

exports.default = _default;
//# sourceMappingURL=VTextarea.js.map
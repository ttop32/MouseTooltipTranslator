"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("../../../src/styles/components/_selection-controls.sass");

require("../../../src/components/VSwitch/VSwitch.sass");

var _selectable = _interopRequireDefault(require("../../mixins/selectable"));

var _VInput = _interopRequireDefault(require("../VInput"));

var _touch = _interopRequireDefault(require("../../directives/touch"));

var _transitions = require("../transitions");

var _VProgressCircular = _interopRequireDefault(require("../VProgressCircular/VProgressCircular"));

var _helpers = require("../../util/helpers");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/* @vue/component */
var _default = _selectable.default.extend({
  name: 'v-switch',
  directives: {
    Touch: _touch.default
  },
  props: {
    inset: Boolean,
    loading: {
      type: [Boolean, String],
      default: false
    },
    flat: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    classes: function classes() {
      return _objectSpread({}, _VInput.default.options.computed.classes.call(this), {
        'v-input--selection-controls v-input--switch': true,
        'v-input--switch--flat': this.flat,
        'v-input--switch--inset': this.inset
      });
    },
    attrs: function attrs() {
      return {
        'aria-checked': String(this.isActive),
        'aria-disabled': String(this.isDisabled),
        role: 'switch'
      };
    },
    // Do not return undefined if disabled,
    // according to spec, should still show
    // a color when disabled and active
    validationState: function validationState() {
      if (this.hasError && this.shouldValidate) return 'error';
      if (this.hasSuccess) return 'success';
      if (this.hasColor !== null) return this.computedColor;
      return undefined;
    },
    switchData: function switchData() {
      return this.setTextColor(this.loading ? undefined : this.validationState, {
        class: this.themeClasses
      });
    }
  },
  methods: {
    genDefaultSlot: function genDefaultSlot() {
      return [this.genSwitch(), this.genLabel()];
    },
    genSwitch: function genSwitch() {
      return this.$createElement('div', {
        staticClass: 'v-input--selection-controls__input'
      }, [this.genInput('checkbox', _objectSpread({}, this.attrs, {}, this.attrs$)), this.genRipple(this.setTextColor(this.validationState, {
        directives: [{
          name: 'touch',
          value: {
            left: this.onSwipeLeft,
            right: this.onSwipeRight
          }
        }]
      })), this.$createElement('div', _objectSpread({
        staticClass: 'v-input--switch__track'
      }, this.switchData)), this.$createElement('div', _objectSpread({
        staticClass: 'v-input--switch__thumb'
      }, this.switchData), [this.genProgress()])]);
    },
    genProgress: function genProgress() {
      return this.$createElement(_transitions.VFabTransition, {}, [this.loading === false ? null : this.$slots.progress || this.$createElement(_VProgressCircular.default, {
        props: {
          color: this.loading === true || this.loading === '' ? this.color || 'primary' : this.loading,
          size: 16,
          width: 2,
          indeterminate: true
        }
      })]);
    },
    onSwipeLeft: function onSwipeLeft() {
      if (this.isActive) this.onChange();
    },
    onSwipeRight: function onSwipeRight() {
      if (!this.isActive) this.onChange();
    },
    onKeydown: function onKeydown(e) {
      if (e.keyCode === _helpers.keyCodes.left && this.isActive || e.keyCode === _helpers.keyCodes.right && !this.isActive) this.onChange();
    }
  }
});

exports.default = _default;
//# sourceMappingURL=VSwitch.js.map
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("../../../src/components/VRadioGroup/VRadio.sass");

var _VLabel = _interopRequireDefault(require("../VLabel"));

var _VIcon = _interopRequireDefault(require("../VIcon"));

var _VInput = _interopRequireDefault(require("../VInput"));

var _bindsAttrs = _interopRequireDefault(require("../../mixins/binds-attrs"));

var _colorable = _interopRequireDefault(require("../../mixins/colorable"));

var _groupable = require("../../mixins/groupable");

var _rippleable = _interopRequireDefault(require("../../mixins/rippleable"));

var _themeable = _interopRequireDefault(require("../../mixins/themeable"));

var _selectable = _interopRequireWildcard(require("../../mixins/selectable"));

var _helpers = require("../../util/helpers");

var _mixins = _interopRequireDefault(require("../../util/mixins"));

var _mergeData = require("../../util/mergeData");

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var baseMixins = (0, _mixins.default)(_bindsAttrs.default, _colorable.default, _rippleable.default, (0, _groupable.factory)('radioGroup'), _themeable.default);
/* @vue/component */

var _default = baseMixins.extend().extend({
  name: 'v-radio',
  inheritAttrs: false,
  props: {
    disabled: Boolean,
    id: String,
    label: String,
    name: String,
    offIcon: {
      type: String,
      default: '$radioOff'
    },
    onIcon: {
      type: String,
      default: '$radioOn'
    },
    readonly: Boolean,
    value: {
      default: null
    }
  },
  data: function data() {
    return {
      isFocused: false
    };
  },
  computed: {
    classes: function classes() {
      return _objectSpread({
        'v-radio--is-disabled': this.isDisabled,
        'v-radio--is-focused': this.isFocused
      }, this.themeClasses, {}, this.groupClasses);
    },
    computedColor: function computedColor() {
      return _selectable.default.options.computed.computedColor.call(this);
    },
    computedIcon: function computedIcon() {
      return this.isActive ? this.onIcon : this.offIcon;
    },
    computedId: function computedId() {
      return _VInput.default.options.computed.computedId.call(this);
    },
    hasLabel: _VInput.default.options.computed.hasLabel,
    hasState: function hasState() {
      return (this.radioGroup || {}).hasState;
    },
    isDisabled: function isDisabled() {
      return this.disabled || !!this.radioGroup && this.radioGroup.isDisabled;
    },
    isReadonly: function isReadonly() {
      return this.readonly || !!this.radioGroup && this.radioGroup.isReadonly;
    },
    computedName: function computedName() {
      if (this.name || !this.radioGroup) {
        return this.name;
      }

      return this.radioGroup.name || "radio-".concat(this.radioGroup._uid);
    },
    rippleState: function rippleState() {
      return _selectable.default.options.computed.rippleState.call(this);
    },
    validationState: function validationState() {
      return (this.radioGroup || {}).validationState || this.computedColor;
    }
  },
  methods: {
    genInput: function genInput(args) {
      // We can't actually use the mixin directly because
      // it's made for standalone components, but its
      // genInput method is exactly what we need
      return _selectable.default.options.methods.genInput.call(this, 'radio', args);
    },
    genLabel: function genLabel() {
      if (!this.hasLabel) return null;
      return this.$createElement(_VLabel.default, {
        on: {
          // Label shouldn't cause the input to focus
          click: _selectable.prevent
        },
        attrs: {
          for: this.computedId
        },
        props: {
          color: this.validationState,
          focused: this.hasState
        }
      }, (0, _helpers.getSlot)(this, 'label') || this.label);
    },
    genRadio: function genRadio() {
      return this.$createElement('div', {
        staticClass: 'v-input--selection-controls__input'
      }, [this.$createElement(_VIcon.default, this.setTextColor(this.validationState, {
        props: {
          dense: this.radioGroup && this.radioGroup.dense
        }
      }), this.computedIcon), this.genInput(_objectSpread({
        name: this.computedName,
        value: this.value
      }, this.attrs$)), this.genRipple(this.setTextColor(this.rippleState))]);
    },
    onFocus: function onFocus(e) {
      this.isFocused = true;
      this.$emit('focus', e);
    },
    onBlur: function onBlur(e) {
      this.isFocused = false;
      this.$emit('blur', e);
    },
    onChange: function onChange() {
      if (this.isDisabled || this.isReadonly || this.isActive) return;
      this.toggle();
    },
    onKeydown: function onKeydown() {}
  },
  render: function render(h) {
    var data = {
      staticClass: 'v-radio',
      class: this.classes,
      on: (0, _mergeData.mergeListeners)({
        click: this.onChange
      }, this.listeners$)
    };
    return h('div', data, [this.genRadio(), this.genLabel()]);
  }
});

exports.default = _default;
//# sourceMappingURL=VRadio.js.map
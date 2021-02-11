"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("../../../src/components/VCheckbox/VSimpleCheckbox.sass");

var _ripple2 = _interopRequireDefault(require("../../directives/ripple"));

var _vue = _interopRequireDefault(require("vue"));

var _VIcon = require("../VIcon");

var _colorable = _interopRequireDefault(require("../../mixins/colorable"));

var _themeable = _interopRequireDefault(require("../../mixins/themeable"));

var _mergeData = _interopRequireDefault(require("../../util/mergeData"));

var _helpers = require("../../util/helpers");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _default = _vue.default.extend({
  name: 'v-simple-checkbox',
  functional: true,
  directives: {
    ripple: _ripple2.default
  },
  props: _objectSpread({}, _colorable.default.options.props, {}, _themeable.default.options.props, {
    disabled: Boolean,
    ripple: {
      type: Boolean,
      default: true
    },
    value: Boolean,
    indeterminate: Boolean,
    indeterminateIcon: {
      type: String,
      default: '$checkboxIndeterminate'
    },
    onIcon: {
      type: String,
      default: '$checkboxOn'
    },
    offIcon: {
      type: String,
      default: '$checkboxOff'
    }
  }),
  render: function render(h, _ref) {
    var props = _ref.props,
        data = _ref.data,
        listeners = _ref.listeners;
    var children = [];

    if (props.ripple && !props.disabled) {
      var _ripple = h('div', _colorable.default.options.methods.setTextColor(props.color, {
        staticClass: 'v-input--selection-controls__ripple',
        directives: [{
          name: 'ripple',
          value: {
            center: true
          }
        }]
      }));

      children.push(_ripple);
    }

    var icon = props.offIcon;
    if (props.indeterminate) icon = props.indeterminateIcon;else if (props.value) icon = props.onIcon;
    children.push(h(_VIcon.VIcon, _colorable.default.options.methods.setTextColor(props.value && props.color, {
      props: {
        disabled: props.disabled,
        dark: props.dark,
        light: props.light
      }
    }), icon));
    var classes = {
      'v-simple-checkbox': true,
      'v-simple-checkbox--disabled': props.disabled
    };
    return h('div', (0, _mergeData.default)(data, {
      class: classes,
      on: {
        click: function click(e) {
          e.stopPropagation();

          if (data.on && data.on.input && !props.disabled) {
            (0, _helpers.wrapInArray)(data.on.input).forEach(function (f) {
              return f(!props.value);
            });
          }
        }
      }
    }), children);
  }
});

exports.default = _default;
//# sourceMappingURL=VSimpleCheckbox.js.map
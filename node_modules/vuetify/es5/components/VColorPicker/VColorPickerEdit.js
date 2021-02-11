"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.modes = void 0;

require("../../../src/components/VColorPicker/VColorPickerEdit.sass");

var _VBtn = _interopRequireDefault(require("../VBtn"));

var _VIcon = _interopRequireDefault(require("../VIcon"));

var _colorUtils = require("../../util/colorUtils");

var _vue = _interopRequireDefault(require("vue"));

var _util = require("./util");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

var modes = {
  rgba: {
    inputs: [['r', 255, 'int'], ['g', 255, 'int'], ['b', 255, 'int'], ['a', 1, 'float']],
    from: _util.fromRGBA
  },
  hsla: {
    inputs: [['h', 360, 'int'], ['s', 1, 'float'], ['l', 1, 'float'], ['a', 1, 'float']],
    from: _util.fromHSLA
  },
  hexa: {
    from: _util.fromHexa
  }
};
exports.modes = modes;

var _default = _vue.default.extend({
  name: 'v-color-picker-edit',
  props: {
    color: Object,
    disabled: Boolean,
    hideAlpha: Boolean,
    hideModeSwitch: Boolean,
    mode: {
      type: String,
      default: 'rgba',
      validator: function validator(v) {
        return Object.keys(modes).includes(v);
      }
    }
  },
  data: function data() {
    return {
      modes: modes,
      internalMode: this.mode
    };
  },
  computed: {
    currentMode: function currentMode() {
      return this.modes[this.internalMode];
    }
  },
  watch: {
    mode: function mode(_mode) {
      this.internalMode = _mode;
    }
  },
  created: function created() {
    this.internalMode = this.mode;
  },
  methods: {
    getValue: function getValue(v, type) {
      if (type === 'float') return Math.round(v * 100) / 100;else if (type === 'int') return Math.round(v);else return 0;
    },
    parseValue: function parseValue(v, type) {
      if (type === 'float') return parseFloat(v);else if (type === 'int') return parseInt(v, 10) || 0;else return 0;
    },
    changeMode: function changeMode() {
      var modes = Object.keys(this.modes);
      var index = modes.indexOf(this.internalMode);
      var newMode = modes[(index + 1) % modes.length];
      this.internalMode = newMode;
      this.$emit('update:mode', newMode);
    },
    genInput: function genInput(target, attrs, value, on) {
      return this.$createElement('div', {
        staticClass: 'v-color-picker__input'
      }, [this.$createElement('input', {
        key: target,
        attrs: attrs,
        domProps: {
          value: value
        },
        on: on
      }), this.$createElement('span', target.toUpperCase())]);
    },
    genInputs: function genInputs() {
      var _this = this;

      if (this.internalMode === 'hexa') {
        var hex = this.color.hexa;
        var value = this.hideAlpha && hex.endsWith('FF') ? hex.substr(0, 7) : hex;
        return this.genInput('hex', {
          maxlength: this.hideAlpha ? 7 : 9,
          disabled: this.disabled
        }, value, {
          change: function change(e) {
            var el = e.target;

            _this.$emit('update:color', _this.currentMode.from((0, _colorUtils.parseHex)(el.value)));
          }
        });
      } else {
        var inputs = this.hideAlpha ? this.currentMode.inputs.slice(0, -1) : this.currentMode.inputs;
        return inputs.map(function (_ref) {
          var _ref2 = _slicedToArray(_ref, 3),
              target = _ref2[0],
              max = _ref2[1],
              type = _ref2[2];

          var value = _this.color[_this.internalMode];
          return _this.genInput(target, {
            type: 'number',
            min: 0,
            max: max,
            step: type === 'float' ? '0.01' : type === 'int' ? '1' : undefined,
            disabled: _this.disabled
          }, _this.getValue(value[target], type), {
            input: function input(e) {
              var el = e.target;

              var newVal = _this.parseValue(el.value || '0', type);

              _this.$emit('update:color', _this.currentMode.from(Object.assign({}, value, _defineProperty({}, target, newVal)), _this.color.alpha));
            }
          });
        });
      }
    },
    genSwitch: function genSwitch() {
      return this.$createElement(_VBtn.default, {
        props: {
          small: true,
          icon: true,
          disabled: this.disabled
        },
        on: {
          click: this.changeMode
        }
      }, [this.$createElement(_VIcon.default, '$unfold')]);
    }
  },
  render: function render(h) {
    return h('div', {
      staticClass: 'v-color-picker__edit'
    }, [this.genInputs(), !this.hideModeSwitch && this.genSwitch()]);
  }
});

exports.default = _default;
//# sourceMappingURL=VColorPickerEdit.js.map
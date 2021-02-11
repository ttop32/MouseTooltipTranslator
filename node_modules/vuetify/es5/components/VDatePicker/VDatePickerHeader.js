"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("../../../src/components/VDatePicker/VDatePickerHeader.sass");

var _VBtn = _interopRequireDefault(require("../VBtn"));

var _VIcon = _interopRequireDefault(require("../VIcon"));

var _colorable = _interopRequireDefault(require("../../mixins/colorable"));

var _localable = _interopRequireDefault(require("../../mixins/localable"));

var _themeable = _interopRequireDefault(require("../../mixins/themeable"));

var _util = require("./util");

var _mixins = _interopRequireDefault(require("../../util/mixins"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

var _default = (0, _mixins.default)(_colorable.default, _localable.default, _themeable.default
/* @vue/component */
).extend({
  name: 'v-date-picker-header',
  props: {
    disabled: Boolean,
    format: Function,
    min: String,
    max: String,
    nextAriaLabel: String,
    nextIcon: {
      type: String,
      default: '$next'
    },
    prevAriaLabel: String,
    prevIcon: {
      type: String,
      default: '$prev'
    },
    readonly: Boolean,
    value: {
      type: [Number, String],
      required: true
    }
  },
  data: function data() {
    return {
      isReversing: false
    };
  },
  computed: {
    formatter: function formatter() {
      if (this.format) {
        return this.format;
      } else if (String(this.value).split('-')[1]) {
        return (0, _util.createNativeLocaleFormatter)(this.currentLocale, {
          month: 'long',
          year: 'numeric',
          timeZone: 'UTC'
        }, {
          length: 7
        });
      } else {
        return (0, _util.createNativeLocaleFormatter)(this.currentLocale, {
          year: 'numeric',
          timeZone: 'UTC'
        }, {
          length: 4
        });
      }
    }
  },
  watch: {
    value: function value(newVal, oldVal) {
      this.isReversing = newVal < oldVal;
    }
  },
  methods: {
    genBtn: function genBtn(change) {
      var _this = this;

      var ariaLabelId = change > 0 ? this.nextAriaLabel : this.prevAriaLabel;
      var ariaLabel = ariaLabelId ? this.$vuetify.lang.t(ariaLabelId) : undefined;
      var disabled = this.disabled || change < 0 && this.min && this.calculateChange(change) < this.min || change > 0 && this.max && this.calculateChange(change) > this.max;
      return this.$createElement(_VBtn.default, {
        attrs: {
          'aria-label': ariaLabel
        },
        props: {
          dark: this.dark,
          disabled: disabled,
          icon: true,
          light: this.light
        },
        on: {
          click: function click(e) {
            e.stopPropagation();

            _this.$emit('input', _this.calculateChange(change));
          }
        }
      }, [this.$createElement(_VIcon.default, change < 0 === !this.$vuetify.rtl ? this.prevIcon : this.nextIcon)]);
    },
    calculateChange: function calculateChange(sign) {
      var _String$split$map = String(this.value).split('-').map(Number),
          _String$split$map2 = _slicedToArray(_String$split$map, 2),
          year = _String$split$map2[0],
          month = _String$split$map2[1];

      if (month == null) {
        return "".concat(year + sign);
      } else {
        return (0, _util.monthChange)(String(this.value), sign);
      }
    },
    genHeader: function genHeader() {
      var _this2 = this;

      var color = !this.disabled && (this.color || 'accent');
      var header = this.$createElement('div', this.setTextColor(color, {
        key: String(this.value)
      }), [this.$createElement('button', {
        attrs: {
          type: 'button'
        },
        on: {
          click: function click() {
            return _this2.$emit('toggle');
          }
        }
      }, [this.$slots.default || this.formatter(String(this.value))])]);
      var transition = this.$createElement('transition', {
        props: {
          name: this.isReversing === !this.$vuetify.rtl ? 'tab-reverse-transition' : 'tab-transition'
        }
      }, [header]);
      return this.$createElement('div', {
        staticClass: 'v-date-picker-header__value',
        class: {
          'v-date-picker-header__value--disabled': this.disabled
        }
      }, [transition]);
    }
  },
  render: function render() {
    return this.$createElement('div', {
      staticClass: 'v-date-picker-header',
      class: _objectSpread({
        'v-date-picker-header--disabled': this.disabled
      }, this.themeClasses)
    }, [this.genBtn(-1), this.genHeader(), this.genBtn(+1)]);
  }
});

exports.default = _default;
//# sourceMappingURL=VDatePickerHeader.js.map
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("../../../../src/components/VDatePicker/VDatePickerTable.sass");

var _touch = _interopRequireDefault(require("../../../directives/touch"));

var _colorable = _interopRequireDefault(require("../../../mixins/colorable"));

var _localable = _interopRequireDefault(require("../../../mixins/localable"));

var _themeable = _interopRequireDefault(require("../../../mixins/themeable"));

var _util = require("../util");

var _isDateAllowed = _interopRequireDefault(require("../util/isDateAllowed"));

var _mergeData = require("../../../util/mergeData");

var _mixins = _interopRequireDefault(require("../../../util/mixins"));

var _helpers = require("../../../util/helpers");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _default2 = (0, _mixins.default)(_colorable.default, _localable.default, _themeable.default
/* @vue/component */
).extend({
  directives: {
    Touch: _touch.default
  },
  props: {
    allowedDates: Function,
    current: String,
    disabled: Boolean,
    format: Function,
    events: {
      type: [Array, Function, Object],
      default: function _default() {
        return null;
      }
    },
    eventColor: {
      type: [Array, Function, Object, String],
      default: function _default() {
        return 'warning';
      }
    },
    min: String,
    max: String,
    range: Boolean,
    readonly: Boolean,
    scrollable: Boolean,
    tableDate: {
      type: String,
      required: true
    },
    value: [String, Array]
  },
  data: function data() {
    return {
      isReversing: false,
      wheelThrottle: null
    };
  },
  computed: {
    computedTransition: function computedTransition() {
      return this.isReversing === !this.$vuetify.rtl ? 'tab-reverse-transition' : 'tab-transition';
    },
    displayedMonth: function displayedMonth() {
      return Number(this.tableDate.split('-')[1]) - 1;
    },
    displayedYear: function displayedYear() {
      return Number(this.tableDate.split('-')[0]);
    }
  },
  watch: {
    tableDate: function tableDate(newVal, oldVal) {
      this.isReversing = newVal < oldVal;
    }
  },
  mounted: function mounted() {
    this.wheelThrottle = (0, _helpers.throttle)(this.wheel, 250);
  },
  methods: {
    genButtonClasses: function genButtonClasses(isAllowed, isFloating, isSelected, isCurrent) {
      return _objectSpread({
        'v-size--default': !isFloating,
        'v-date-picker-table__current': isCurrent,
        'v-btn--active': isSelected,
        'v-btn--flat': !isAllowed || this.disabled,
        'v-btn--text': isSelected === isCurrent,
        'v-btn--rounded': isFloating,
        'v-btn--disabled': !isAllowed || this.disabled,
        'v-btn--outlined': isCurrent && !isSelected
      }, this.themeClasses);
    },
    genButtonEvents: function genButtonEvents(value, isAllowed, mouseEventType) {
      var _this = this;

      if (this.disabled) return undefined;
      return (0, _mergeData.mergeListeners)({
        click: function click() {
          if (isAllowed && !_this.readonly) _this.$emit('input', value);
        }
      }, (0, _util.createItemTypeNativeListeners)(this, ":".concat(mouseEventType), value));
    },
    genButton: function genButton(value, isFloating, mouseEventType, formatter) {
      var isOtherMonth = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : false;
      var isAllowed = (0, _isDateAllowed.default)(value, this.min, this.max, this.allowedDates);
      var isSelected = this.isSelected(value) && isAllowed;
      var isCurrent = value === this.current;
      var setColor = isSelected ? this.setBackgroundColor : this.setTextColor;
      var color = (isSelected || isCurrent) && (this.color || 'accent');
      return this.$createElement('button', setColor(color, {
        staticClass: 'v-btn',
        class: this.genButtonClasses(isAllowed && !isOtherMonth, isFloating, isSelected, isCurrent),
        attrs: {
          type: 'button'
        },
        domProps: {
          disabled: this.disabled || !isAllowed || isOtherMonth
        },
        on: this.genButtonEvents(value, isAllowed, mouseEventType)
      }), [this.$createElement('div', {
        staticClass: 'v-btn__content'
      }, [formatter(value)]), this.genEvents(value)]);
    },
    getEventColors: function getEventColors(date) {
      var arrayize = function arrayize(v) {
        return Array.isArray(v) ? v : [v];
      };

      var eventData;
      var eventColors = [];

      if (Array.isArray(this.events)) {
        eventData = this.events.includes(date);
      } else if (this.events instanceof Function) {
        eventData = this.events(date) || false;
      } else if (this.events) {
        eventData = this.events[date] || false;
      } else {
        eventData = false;
      }

      if (!eventData) {
        return [];
      } else if (eventData !== true) {
        eventColors = arrayize(eventData);
      } else if (typeof this.eventColor === 'string') {
        eventColors = [this.eventColor];
      } else if (typeof this.eventColor === 'function') {
        eventColors = arrayize(this.eventColor(date));
      } else if (Array.isArray(this.eventColor)) {
        eventColors = this.eventColor;
      } else {
        eventColors = arrayize(this.eventColor[date]);
      }

      return eventColors.filter(function (v) {
        return v;
      });
    },
    genEvents: function genEvents(date) {
      var _this2 = this;

      var eventColors = this.getEventColors(date);
      return eventColors.length ? this.$createElement('div', {
        staticClass: 'v-date-picker-table__events'
      }, eventColors.map(function (color) {
        return _this2.$createElement('div', _this2.setBackgroundColor(color));
      })) : null;
    },
    isValidScroll: function isValidScroll(e, calculateTableDate) {
      var tableDate = calculateTableDate(e.deltaY); // tableDate is 'YYYY-MM' for DateTable and 'YYYY' for MonthTable

      var sanitizeType = tableDate.split('-').length === 1 ? 'year' : 'month';
      return e.deltaY === 0 || e.deltaY < 0 && (this.min ? tableDate >= (0, _util.sanitizeDateString)(this.min, sanitizeType) : true) || e.deltaY > 0 && (this.max ? tableDate <= (0, _util.sanitizeDateString)(this.max, sanitizeType) : true);
    },
    wheel: function wheel(e, calculateTableDate) {
      this.$emit('update:table-date', calculateTableDate(e.deltaY));
    },
    touch: function touch(value, calculateTableDate) {
      this.$emit('update:table-date', calculateTableDate(value));
    },
    genTable: function genTable(staticClass, children, calculateTableDate) {
      var _this3 = this;

      var transition = this.$createElement('transition', {
        props: {
          name: this.computedTransition
        }
      }, [this.$createElement('table', {
        key: this.tableDate
      }, children)]);
      var touchDirective = {
        name: 'touch',
        value: {
          left: function left(e) {
            return e.offsetX < -15 && _this3.touch(1, calculateTableDate);
          },
          right: function right(e) {
            return e.offsetX > 15 && _this3.touch(-1, calculateTableDate);
          }
        }
      };
      return this.$createElement('div', {
        staticClass: staticClass,
        class: _objectSpread({
          'v-date-picker-table--disabled': this.disabled
        }, this.themeClasses),
        on: !this.disabled && this.scrollable ? {
          wheel: function wheel(e) {
            e.preventDefault();

            if (_this3.isValidScroll(e, calculateTableDate)) {
              _this3.wheelThrottle(e, calculateTableDate);
            }
          }
        } : undefined,
        directives: [touchDirective]
      }, [transition]);
    },
    isSelected: function isSelected(value) {
      if (Array.isArray(this.value)) {
        if (this.range && this.value.length === 2) {
          var _sort = _toConsumableArray(this.value).sort(),
              _sort2 = _slicedToArray(_sort, 2),
              from = _sort2[0],
              to = _sort2[1];

          return from <= value && value <= to;
        } else {
          return this.value.indexOf(value) !== -1;
        }
      }

      return value === this.value;
    }
  }
});

exports.default = _default2;
//# sourceMappingURL=date-picker-table.js.map
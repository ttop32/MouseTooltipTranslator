"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _VDatePickerTitle = _interopRequireDefault(require("./VDatePickerTitle"));

var _VDatePickerHeader = _interopRequireDefault(require("./VDatePickerHeader"));

var _VDatePickerDateTable = _interopRequireDefault(require("./VDatePickerDateTable"));

var _VDatePickerMonthTable = _interopRequireDefault(require("./VDatePickerMonthTable"));

var _VDatePickerYears = _interopRequireDefault(require("./VDatePickerYears"));

var _localable = _interopRequireDefault(require("../../mixins/localable"));

var _picker = _interopRequireDefault(require("../../mixins/picker"));

var _isDateAllowed2 = _interopRequireDefault(require("./util/isDateAllowed"));

var _mixins = _interopRequireDefault(require("../../util/mixins"));

var _helpers = require("../../util/helpers");

var _timestamp = require("../VCalendar/util/timestamp");

var _console = require("../../util/console");

var _util = require("./util");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _default2 = (0, _mixins.default)(_localable.default, _picker.default).extend({
  name: 'v-date-picker',
  props: {
    allowedDates: Function,
    // Function formatting the day in date picker table
    dayFormat: Function,
    disabled: Boolean,
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
    firstDayOfWeek: {
      type: [String, Number],
      default: 0
    },
    // Function formatting the tableDate in the day/month table header
    headerDateFormat: Function,
    localeFirstDayOfYear: {
      type: [String, Number],
      default: 0
    },
    max: String,
    min: String,
    // Function formatting month in the months table
    monthFormat: Function,
    multiple: Boolean,
    nextIcon: {
      type: String,
      default: '$next'
    },
    nextMonthAriaLabel: {
      type: String,
      default: '$vuetify.datePicker.nextMonthAriaLabel'
    },
    nextYearAriaLabel: {
      type: String,
      default: '$vuetify.datePicker.nextYearAriaLabel'
    },
    pickerDate: String,
    prevIcon: {
      type: String,
      default: '$prev'
    },
    prevMonthAriaLabel: {
      type: String,
      default: '$vuetify.datePicker.prevMonthAriaLabel'
    },
    prevYearAriaLabel: {
      type: String,
      default: '$vuetify.datePicker.prevYearAriaLabel'
    },
    range: Boolean,
    reactive: Boolean,
    readonly: Boolean,
    scrollable: Boolean,
    showCurrent: {
      type: [Boolean, String],
      default: true
    },
    selectedItemsText: {
      type: String,
      default: '$vuetify.datePicker.itemsSelected'
    },
    showAdjacentMonths: Boolean,
    showWeek: Boolean,
    // Function formatting currently selected date in the picker title
    titleDateFormat: Function,
    type: {
      type: String,
      default: 'date',
      validator: function validator(type) {
        return ['date', 'month'].includes(type);
      }
    },
    value: [Array, String],
    weekdayFormat: Function,
    // Function formatting the year in table header and pickup title
    yearFormat: Function,
    yearIcon: String
  },
  data: function data() {
    var _this = this;

    var now = new Date();
    return {
      activePicker: this.type.toUpperCase(),
      inputDay: null,
      inputMonth: null,
      inputYear: null,
      isReversing: false,
      now: now,
      // tableDate is a string in 'YYYY' / 'YYYY-M' format (leading zero for month is not required)
      tableDate: function () {
        if (_this.pickerDate) {
          return _this.pickerDate;
        }

        var multipleValue = (0, _helpers.wrapInArray)(_this.value);
        var date = multipleValue[multipleValue.length - 1] || (typeof _this.showCurrent === 'string' ? _this.showCurrent : "".concat(now.getFullYear(), "-").concat(now.getMonth() + 1));
        return (0, _util.sanitizeDateString)(date, _this.type === 'date' ? 'month' : 'year');
      }()
    };
  },
  computed: {
    multipleValue: function multipleValue() {
      return (0, _helpers.wrapInArray)(this.value);
    },
    isMultiple: function isMultiple() {
      return this.multiple || this.range;
    },
    lastValue: function lastValue() {
      return this.isMultiple ? this.multipleValue[this.multipleValue.length - 1] : this.value;
    },
    selectedMonths: function selectedMonths() {
      if (!this.value || this.type === 'month') {
        return this.value;
      } else if (this.isMultiple) {
        return this.multipleValue.map(function (val) {
          return val.substr(0, 7);
        });
      } else {
        return this.value.substr(0, 7);
      }
    },
    current: function current() {
      if (this.showCurrent === true) {
        return (0, _util.sanitizeDateString)("".concat(this.now.getFullYear(), "-").concat(this.now.getMonth() + 1, "-").concat(this.now.getDate()), this.type);
      }

      return this.showCurrent || null;
    },
    inputDate: function inputDate() {
      return this.type === 'date' ? "".concat(this.inputYear, "-").concat((0, _util.pad)(this.inputMonth + 1), "-").concat((0, _util.pad)(this.inputDay)) : "".concat(this.inputYear, "-").concat((0, _util.pad)(this.inputMonth + 1));
    },
    tableMonth: function tableMonth() {
      return Number((this.pickerDate || this.tableDate).split('-')[1]) - 1;
    },
    tableYear: function tableYear() {
      return Number((this.pickerDate || this.tableDate).split('-')[0]);
    },
    minMonth: function minMonth() {
      return this.min ? (0, _util.sanitizeDateString)(this.min, 'month') : null;
    },
    maxMonth: function maxMonth() {
      return this.max ? (0, _util.sanitizeDateString)(this.max, 'month') : null;
    },
    minYear: function minYear() {
      return this.min ? (0, _util.sanitizeDateString)(this.min, 'year') : null;
    },
    maxYear: function maxYear() {
      return this.max ? (0, _util.sanitizeDateString)(this.max, 'year') : null;
    },
    formatters: function formatters() {
      return {
        year: this.yearFormat || (0, _util.createNativeLocaleFormatter)(this.currentLocale, {
          year: 'numeric',
          timeZone: 'UTC'
        }, {
          length: 4
        }),
        titleDate: this.titleDateFormat || (this.isMultiple ? this.defaultTitleMultipleDateFormatter : this.defaultTitleDateFormatter)
      };
    },
    defaultTitleMultipleDateFormatter: function defaultTitleMultipleDateFormatter() {
      var _this2 = this;

      return function (dates) {
        if (!dates.length) {
          return '-';
        }

        if (dates.length === 1) {
          return _this2.defaultTitleDateFormatter(dates[0]);
        }

        return _this2.$vuetify.lang.t(_this2.selectedItemsText, dates.length);
      };
    },
    defaultTitleDateFormatter: function defaultTitleDateFormatter() {
      var titleFormats = {
        year: {
          year: 'numeric',
          timeZone: 'UTC'
        },
        month: {
          month: 'long',
          timeZone: 'UTC'
        },
        date: {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          timeZone: 'UTC'
        }
      };
      var titleDateFormatter = (0, _util.createNativeLocaleFormatter)(this.currentLocale, titleFormats[this.type], {
        start: 0,
        length: {
          date: 10,
          month: 7,
          year: 4
        }[this.type]
      });

      var landscapeFormatter = function landscapeFormatter(date) {
        return titleDateFormatter(date).replace(/([^\d\s])([\d])/g, function (match, nonDigit, digit) {
          return "".concat(nonDigit, " ").concat(digit);
        }).replace(', ', ',<br>');
      };

      return this.landscape ? landscapeFormatter : titleDateFormatter;
    }
  },
  watch: {
    tableDate: function tableDate(val, prev) {
      // Make a ISO 8601 strings from val and prev for comparision, otherwise it will incorrectly
      // compare for example '2000-9' and '2000-10'
      var sanitizeType = this.type === 'month' ? 'year' : 'month';
      this.isReversing = (0, _util.sanitizeDateString)(val, sanitizeType) < (0, _util.sanitizeDateString)(prev, sanitizeType);
      this.$emit('update:picker-date', val);
    },
    pickerDate: function pickerDate(val) {
      if (val) {
        this.tableDate = val;
      } else if (this.lastValue && this.type === 'date') {
        this.tableDate = (0, _util.sanitizeDateString)(this.lastValue, 'month');
      } else if (this.lastValue && this.type === 'month') {
        this.tableDate = (0, _util.sanitizeDateString)(this.lastValue, 'year');
      }
    },
    value: function value(newValue, oldValue) {
      this.checkMultipleProp();
      this.setInputDate();

      if (!this.isMultiple && this.value && !this.pickerDate || this.isMultiple && this.multipleValue.length && (!oldValue || !oldValue.length) && !this.pickerDate) {
        this.tableDate = (0, _util.sanitizeDateString)(this.inputDate, this.type === 'month' ? 'year' : 'month');
      }
    },
    type: function type(_type) {
      this.activePicker = _type.toUpperCase();

      if (this.value && this.value.length) {
        var output = this.multipleValue.map(function (val) {
          return (0, _util.sanitizeDateString)(val, _type);
        }).filter(this.isDateAllowed);
        this.$emit('input', this.isMultiple ? output : output[0]);
      }
    }
  },
  created: function created() {
    this.checkMultipleProp();

    if (this.pickerDate !== this.tableDate) {
      this.$emit('update:picker-date', this.tableDate);
    }

    this.setInputDate();
  },
  methods: {
    emitInput: function emitInput(newInput) {
      if (this.range) {
        if (this.multipleValue.length !== 1) {
          this.$emit('input', [newInput]);
        } else {
          var _output = [this.multipleValue[0], newInput];
          this.$emit('input', _output);
          this.$emit('change', _output);
        }

        return;
      }

      var output = this.multiple ? this.multipleValue.indexOf(newInput) === -1 ? this.multipleValue.concat([newInput]) : this.multipleValue.filter(function (x) {
        return x !== newInput;
      }) : newInput;
      this.$emit('input', output);
      this.multiple || this.$emit('change', newInput);
    },
    checkMultipleProp: function checkMultipleProp() {
      if (this.value == null) return;
      var valueType = this.value.constructor.name;
      var expected = this.isMultiple ? 'Array' : 'String';

      if (valueType !== expected) {
        (0, _console.consoleWarn)("Value must be ".concat(this.isMultiple ? 'an' : 'a', " ").concat(expected, ", got ").concat(valueType), this);
      }
    },
    isDateAllowed: function isDateAllowed(value) {
      return (0, _isDateAllowed2.default)(value, this.min, this.max, this.allowedDates);
    },
    yearClick: function yearClick(value) {
      this.inputYear = value;

      if (this.type === 'month') {
        this.tableDate = "".concat(value);
      } else {
        this.tableDate = "".concat(value, "-").concat((0, _util.pad)((this.tableMonth || 0) + 1));
      }

      this.activePicker = 'MONTH';

      if (this.reactive && !this.readonly && !this.isMultiple && this.isDateAllowed(this.inputDate)) {
        this.$emit('input', this.inputDate);
      }
    },
    monthClick: function monthClick(value) {
      this.inputYear = parseInt(value.split('-')[0], 10);
      this.inputMonth = parseInt(value.split('-')[1], 10) - 1;

      if (this.type === 'date') {
        if (this.inputDay) {
          this.inputDay = Math.min(this.inputDay, (0, _timestamp.daysInMonth)(this.inputYear, this.inputMonth + 1));
        }

        this.tableDate = value;
        this.activePicker = 'DATE';

        if (this.reactive && !this.readonly && !this.isMultiple && this.isDateAllowed(this.inputDate)) {
          this.$emit('input', this.inputDate);
        }
      } else {
        this.emitInput(this.inputDate);
      }
    },
    dateClick: function dateClick(value) {
      this.inputYear = parseInt(value.split('-')[0], 10);
      this.inputMonth = parseInt(value.split('-')[1], 10) - 1;
      this.inputDay = parseInt(value.split('-')[2], 10);
      this.emitInput(this.inputDate);
    },
    genPickerTitle: function genPickerTitle() {
      var _this3 = this;

      return this.$createElement(_VDatePickerTitle.default, {
        props: {
          date: this.value ? this.formatters.titleDate(this.isMultiple ? this.multipleValue : this.value) : '',
          disabled: this.disabled,
          readonly: this.readonly,
          selectingYear: this.activePicker === 'YEAR',
          year: this.formatters.year(this.multipleValue.length ? "".concat(this.inputYear) : this.tableDate),
          yearIcon: this.yearIcon,
          value: this.multipleValue[0]
        },
        slot: 'title',
        on: {
          'update:selecting-year': function updateSelectingYear(value) {
            return _this3.activePicker = value ? 'YEAR' : _this3.type.toUpperCase();
          }
        }
      });
    },
    genTableHeader: function genTableHeader() {
      var _this4 = this;

      return this.$createElement(_VDatePickerHeader.default, {
        props: {
          nextIcon: this.nextIcon,
          color: this.color,
          dark: this.dark,
          disabled: this.disabled,
          format: this.headerDateFormat,
          light: this.light,
          locale: this.locale,
          min: this.activePicker === 'DATE' ? this.minMonth : this.minYear,
          max: this.activePicker === 'DATE' ? this.maxMonth : this.maxYear,
          nextAriaLabel: this.activePicker === 'DATE' ? this.nextMonthAriaLabel : this.nextYearAriaLabel,
          prevAriaLabel: this.activePicker === 'DATE' ? this.prevMonthAriaLabel : this.prevYearAriaLabel,
          prevIcon: this.prevIcon,
          readonly: this.readonly,
          value: this.activePicker === 'DATE' ? "".concat((0, _util.pad)(this.tableYear, 4), "-").concat((0, _util.pad)(this.tableMonth + 1)) : "".concat((0, _util.pad)(this.tableYear, 4))
        },
        on: {
          toggle: function toggle() {
            return _this4.activePicker = _this4.activePicker === 'DATE' ? 'MONTH' : 'YEAR';
          },
          input: function input(value) {
            return _this4.tableDate = value;
          }
        }
      });
    },
    genDateTable: function genDateTable() {
      var _this5 = this;

      return this.$createElement(_VDatePickerDateTable.default, {
        props: {
          allowedDates: this.allowedDates,
          color: this.color,
          current: this.current,
          dark: this.dark,
          disabled: this.disabled,
          events: this.events,
          eventColor: this.eventColor,
          firstDayOfWeek: this.firstDayOfWeek,
          format: this.dayFormat,
          light: this.light,
          locale: this.locale,
          localeFirstDayOfYear: this.localeFirstDayOfYear,
          min: this.min,
          max: this.max,
          range: this.range,
          readonly: this.readonly,
          scrollable: this.scrollable,
          showAdjacentMonths: this.showAdjacentMonths,
          showWeek: this.showWeek,
          tableDate: "".concat((0, _util.pad)(this.tableYear, 4), "-").concat((0, _util.pad)(this.tableMonth + 1)),
          value: this.value,
          weekdayFormat: this.weekdayFormat
        },
        ref: 'table',
        on: _objectSpread({
          input: this.dateClick,
          'update:table-date': function updateTableDate(value) {
            return _this5.tableDate = value;
          }
        }, (0, _util.createItemTypeListeners)(this, ':date'))
      });
    },
    genMonthTable: function genMonthTable() {
      var _this6 = this;

      return this.$createElement(_VDatePickerMonthTable.default, {
        props: {
          allowedDates: this.type === 'month' ? this.allowedDates : null,
          color: this.color,
          current: this.current ? (0, _util.sanitizeDateString)(this.current, 'month') : null,
          dark: this.dark,
          disabled: this.disabled,
          events: this.type === 'month' ? this.events : null,
          eventColor: this.type === 'month' ? this.eventColor : null,
          format: this.monthFormat,
          light: this.light,
          locale: this.locale,
          min: this.minMonth,
          max: this.maxMonth,
          range: this.range,
          readonly: this.readonly && this.type === 'month',
          scrollable: this.scrollable,
          value: this.selectedMonths,
          tableDate: "".concat((0, _util.pad)(this.tableYear, 4))
        },
        ref: 'table',
        on: _objectSpread({
          input: this.monthClick,
          'update:table-date': function updateTableDate(value) {
            return _this6.tableDate = value;
          }
        }, (0, _util.createItemTypeListeners)(this, ':month'))
      });
    },
    genYears: function genYears() {
      return this.$createElement(_VDatePickerYears.default, {
        props: {
          color: this.color,
          format: this.yearFormat,
          locale: this.locale,
          min: this.minYear,
          max: this.maxYear,
          value: this.tableYear
        },
        on: _objectSpread({
          input: this.yearClick
        }, (0, _util.createItemTypeListeners)(this, ':year'))
      });
    },
    genPickerBody: function genPickerBody() {
      var children = this.activePicker === 'YEAR' ? [this.genYears()] : [this.genTableHeader(), this.activePicker === 'DATE' ? this.genDateTable() : this.genMonthTable()];
      return this.$createElement('div', {
        key: this.activePicker
      }, children);
    },
    setInputDate: function setInputDate() {
      if (this.lastValue) {
        var array = this.lastValue.split('-');
        this.inputYear = parseInt(array[0], 10);
        this.inputMonth = parseInt(array[1], 10) - 1;

        if (this.type === 'date') {
          this.inputDay = parseInt(array[2], 10);
        }
      } else {
        this.inputYear = this.inputYear || this.now.getFullYear();
        this.inputMonth = this.inputMonth == null ? this.inputMonth : this.now.getMonth();
        this.inputDay = this.inputDay || this.now.getDate();
      }
    }
  },
  render: function render() {
    return this.genPicker('v-picker--date');
  }
});

exports.default = _default2;
//# sourceMappingURL=VDatePicker.js.map
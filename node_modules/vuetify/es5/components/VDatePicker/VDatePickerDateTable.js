"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _datePickerTable = _interopRequireDefault(require("./mixins/date-picker-table"));

var _dateTimeUtils = require("../../util/dateTimeUtils");

var _util = require("./util");

var _helpers = require("../../util/helpers");

var _mixins = _interopRequireDefault(require("../../util/mixins"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Mixins
// Utils
var _default = (0, _mixins.default)(_datePickerTable.default
/* @vue/component */
).extend({
  name: 'v-date-picker-date-table',
  props: {
    firstDayOfWeek: {
      type: [String, Number],
      default: 0
    },
    localeFirstDayOfYear: {
      type: [String, Number],
      default: 0
    },
    showAdjacentMonths: Boolean,
    showWeek: Boolean,
    weekdayFormat: Function
  },
  computed: {
    formatter: function formatter() {
      return this.format || (0, _util.createNativeLocaleFormatter)(this.currentLocale, {
        day: 'numeric',
        timeZone: 'UTC'
      }, {
        start: 8,
        length: 2
      });
    },
    weekdayFormatter: function weekdayFormatter() {
      return this.weekdayFormat || (0, _util.createNativeLocaleFormatter)(this.currentLocale, {
        weekday: 'narrow',
        timeZone: 'UTC'
      });
    },
    weekDays: function weekDays() {
      var _this = this;

      var first = parseInt(this.firstDayOfWeek, 10);
      return this.weekdayFormatter ? (0, _helpers.createRange)(7).map(function (i) {
        return _this.weekdayFormatter("2017-01-".concat(first + i + 15));
      }) // 2017-01-15 is Sunday
      : (0, _helpers.createRange)(7).map(function (i) {
        return ['S', 'M', 'T', 'W', 'T', 'F', 'S'][(i + first) % 7];
      });
    }
  },
  methods: {
    calculateTableDate: function calculateTableDate(delta) {
      return (0, _util.monthChange)(this.tableDate, Math.sign(delta || 1));
    },
    genTHead: function genTHead() {
      var _this2 = this;

      var days = this.weekDays.map(function (day) {
        return _this2.$createElement('th', day);
      });

      if (this.showWeek) {
        days.unshift(this.$createElement('th'));
      }

      return this.$createElement('thead', this.genTR(days));
    },
    // Returns number of the days from the firstDayOfWeek to the first day of the current month
    weekDaysBeforeFirstDayOfTheMonth: function weekDaysBeforeFirstDayOfTheMonth() {
      var firstDayOfTheMonth = new Date("".concat(this.displayedYear, "-").concat((0, _util.pad)(this.displayedMonth + 1), "-01T00:00:00+00:00"));
      var weekDay = firstDayOfTheMonth.getUTCDay();
      return (weekDay - parseInt(this.firstDayOfWeek) + 7) % 7;
    },
    getWeekNumber: function getWeekNumber(dayInMonth) {
      return (0, _dateTimeUtils.weekNumber)(this.displayedYear, this.displayedMonth, dayInMonth, parseInt(this.firstDayOfWeek), parseInt(this.localeFirstDayOfYear));
    },
    genWeekNumber: function genWeekNumber(weekNumber) {
      return this.$createElement('td', [this.$createElement('small', {
        staticClass: 'v-date-picker-table--date__week'
      }, String(weekNumber).padStart(2, '0'))]);
    },
    // eslint-disable-next-line max-statements
    genTBody: function genTBody() {
      var children = [];
      var daysInMonth = new Date(this.displayedYear, this.displayedMonth + 1, 0).getDate();
      var rows = [];
      var day = this.weekDaysBeforeFirstDayOfTheMonth();

      if (this.showWeek) {
        rows.push(this.genWeekNumber(this.getWeekNumber(1)));
      }

      var prevMonthYear = this.displayedMonth ? this.displayedYear : this.displayedYear - 1;
      var prevMonth = (this.displayedMonth + 11) % 12;
      var firstDayFromPreviousMonth = new Date(this.displayedYear, this.displayedMonth, 0).getDate();

      while (day--) {
        var date = "".concat(prevMonthYear, "-").concat((0, _util.pad)(prevMonth + 1), "-").concat((0, _util.pad)(firstDayFromPreviousMonth - day));
        rows.push(this.$createElement('td', this.showAdjacentMonths ? [this.genButton(date, true, 'date', this.formatter, true)] : []));
      }

      for (day = 1; day <= daysInMonth; day++) {
        var _date = "".concat(this.displayedYear, "-").concat((0, _util.pad)(this.displayedMonth + 1), "-").concat((0, _util.pad)(day));

        rows.push(this.$createElement('td', [this.genButton(_date, true, 'date', this.formatter)]));

        if (rows.length % (this.showWeek ? 8 : 7) === 0) {
          children.push(this.genTR(rows));
          rows = [];

          if (this.showWeek && day < daysInMonth) {
            rows.push(this.genWeekNumber(this.getWeekNumber(day + 7)));
          }
        }
      }

      var nextMonthYear = this.displayedMonth === 11 ? this.displayedYear + 1 : this.displayedYear;
      var nextMonth = (this.displayedMonth + 1) % 12;
      var nextMonthDay = 1;

      while (rows.length < 7) {
        var _date2 = "".concat(nextMonthYear, "-").concat((0, _util.pad)(nextMonth + 1), "-").concat((0, _util.pad)(nextMonthDay++));

        rows.push(this.$createElement('td', this.showAdjacentMonths ? [this.genButton(_date2, true, 'date', this.formatter, true)] : []));
      }

      if (rows.length) {
        children.push(this.genTR(rows));
      }

      return this.$createElement('tbody', children);
    },
    genTR: function genTR(children) {
      return [this.$createElement('tr', children)];
    }
  },
  render: function render() {
    return this.genTable('v-date-picker-table v-date-picker-table--date', [this.genTHead(), this.genTBody()], this.calculateTableDate);
  }
});

exports.default = _default;
//# sourceMappingURL=VDatePickerDateTable.js.map
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("../../../src/components/VCalendar/VCalendarWeekly.sass");

var _VBtn = _interopRequireDefault(require("../VBtn"));

var _calendarBase = _interopRequireDefault(require("./mixins/calendar-base"));

var _helpers = require("../../util/helpers");

var _dateTimeUtils = require("../../util/dateTimeUtils");

var _props = _interopRequireDefault(require("./util/props"));

var _timestamp = require("./util/timestamp");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

/* @vue/component */
var _default = _calendarBase.default.extend({
  name: 'v-calendar-weekly',
  props: _props.default.weeks,
  computed: {
    staticClass: function staticClass() {
      return 'v-calendar-weekly';
    },
    classes: function classes() {
      return this.themeClasses;
    },
    parsedMinWeeks: function parsedMinWeeks() {
      return parseInt(this.minWeeks);
    },
    days: function days() {
      var minDays = this.parsedMinWeeks * this.parsedWeekdays.length;
      var start = this.getStartOfWeek(this.parsedStart);
      var end = this.getEndOfWeek(this.parsedEnd);
      return (0, _timestamp.createDayList)(start, end, this.times.today, this.weekdaySkips, Number.MAX_SAFE_INTEGER, minDays);
    },
    todayWeek: function todayWeek() {
      var today = this.times.today;
      var start = this.getStartOfWeek(today);
      var end = this.getEndOfWeek(today);
      return (0, _timestamp.createDayList)(start, end, today, this.weekdaySkips, this.parsedWeekdays.length, this.parsedWeekdays.length);
    },
    monthFormatter: function monthFormatter() {
      if (this.monthFormat) {
        return this.monthFormat;
      }

      var longOptions = {
        timeZone: 'UTC',
        month: 'long'
      };
      var shortOptions = {
        timeZone: 'UTC',
        month: 'short'
      };
      return (0, _timestamp.createNativeLocaleFormatter)(this.currentLocale, function (_tms, short) {
        return short ? shortOptions : longOptions;
      });
    }
  },
  methods: {
    isOutside: function isOutside(day) {
      var dayIdentifier = (0, _timestamp.getDayIdentifier)(day);
      return dayIdentifier < (0, _timestamp.getDayIdentifier)(this.parsedStart) || dayIdentifier > (0, _timestamp.getDayIdentifier)(this.parsedEnd);
    },
    genHead: function genHead() {
      return this.$createElement('div', {
        staticClass: 'v-calendar-weekly__head'
      }, this.genHeadDays());
    },
    genHeadDays: function genHeadDays() {
      var header = this.todayWeek.map(this.genHeadDay);

      if (this.showWeek) {
        header.unshift(this.$createElement('div', {
          staticClass: 'v-calendar-weekly__head-weeknumber'
        }));
      }

      return header;
    },
    genHeadDay: function genHeadDay(day, index) {
      var outside = this.isOutside(this.days[index]);
      var color = day.present ? this.color : undefined;
      return this.$createElement('div', this.setTextColor(color, {
        key: day.date,
        staticClass: 'v-calendar-weekly__head-weekday',
        class: this.getRelativeClasses(day, outside)
      }), this.weekdayFormatter(day, this.shortWeekdays));
    },
    genWeeks: function genWeeks() {
      var days = this.days;
      var weekDays = this.parsedWeekdays.length;
      var weeks = [];

      for (var i = 0; i < days.length; i += weekDays) {
        weeks.push(this.genWeek(days.slice(i, i + weekDays), this.getWeekNumber(days[i])));
      }

      return weeks;
    },
    genWeek: function genWeek(week, weekNumber) {
      var _this = this;

      var weekNodes = week.map(function (day, index) {
        return _this.genDay(day, index, week);
      });

      if (this.showWeek) {
        weekNodes.unshift(this.genWeekNumber(weekNumber));
      }

      return this.$createElement('div', {
        key: week[0].date,
        staticClass: 'v-calendar-weekly__week'
      }, weekNodes);
    },
    getWeekNumber: function getWeekNumber(determineDay) {
      return (0, _dateTimeUtils.weekNumber)(determineDay.year, determineDay.month - 1, determineDay.day, this.parsedWeekdays[0], parseInt(this.localeFirstDayOfYear));
    },
    genWeekNumber: function genWeekNumber(weekNumber) {
      return this.$createElement('div', {
        staticClass: 'v-calendar-weekly__weeknumber'
      }, [this.$createElement('small', String(weekNumber))]);
    },
    genDay: function genDay(day, index, week) {
      var outside = this.isOutside(day);
      return this.$createElement('div', {
        key: day.date,
        staticClass: 'v-calendar-weekly__day',
        class: this.getRelativeClasses(day, outside),
        on: this.getDefaultMouseEventHandlers(':day', function (_e) {
          return day;
        })
      }, [this.genDayLabel(day)].concat(_toConsumableArray((0, _helpers.getSlot)(this, 'day', function () {
        return _objectSpread({
          outside: outside,
          index: index,
          week: week
        }, day);
      }) || [])));
    },
    genDayLabel: function genDayLabel(day) {
      return this.$createElement('div', {
        staticClass: 'v-calendar-weekly__day-label'
      }, (0, _helpers.getSlot)(this, 'day-label', day) || [this.genDayLabelButton(day)]);
    },
    genDayLabelButton: function genDayLabelButton(day) {
      var color = day.present ? this.color : 'transparent';
      var hasMonth = day.day === 1 && this.showMonthOnFirst;
      return this.$createElement(_VBtn.default, {
        props: {
          color: color,
          fab: true,
          depressed: true,
          small: true
        },
        on: this.getMouseEventHandlers({
          'click:date': {
            event: 'click',
            stop: true
          },
          'contextmenu:date': {
            event: 'contextmenu',
            stop: true,
            prevent: true,
            result: false
          }
        }, function (_e) {
          return day;
        })
      }, hasMonth ? this.monthFormatter(day, this.shortMonths) + ' ' + this.dayFormatter(day, false) : this.dayFormatter(day, false));
    },
    genDayMonth: function genDayMonth(day) {
      var color = day.present ? this.color : undefined;
      return this.$createElement('div', this.setTextColor(color, {
        staticClass: 'v-calendar-weekly__day-month'
      }), (0, _helpers.getSlot)(this, 'day-month', day) || this.monthFormatter(day, this.shortMonths));
    }
  },
  render: function render(h) {
    return h('div', {
      staticClass: this.staticClass,
      class: this.classes,
      on: {
        dragstart: function dragstart(e) {
          e.preventDefault();
        }
      }
    }, [!this.hideHeader ? this.genHead() : ''].concat(_toConsumableArray(this.genWeeks())));
  }
});

exports.default = _default;
//# sourceMappingURL=VCalendarWeekly.js.map
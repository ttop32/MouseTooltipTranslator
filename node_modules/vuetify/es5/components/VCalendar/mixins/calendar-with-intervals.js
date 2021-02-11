"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _calendarBase = _interopRequireDefault(require("./calendar-base"));

var _props = _interopRequireDefault(require("../util/props"));

var _timestamp = require("../util/timestamp");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Mixins
// Util

/* @vue/component */
var _default = _calendarBase.default.extend({
  name: 'calendar-with-intervals',
  props: _props.default.intervals,
  computed: {
    parsedFirstInterval: function parsedFirstInterval() {
      return parseInt(this.firstInterval);
    },
    parsedIntervalMinutes: function parsedIntervalMinutes() {
      return parseInt(this.intervalMinutes);
    },
    parsedIntervalCount: function parsedIntervalCount() {
      return parseInt(this.intervalCount);
    },
    parsedIntervalHeight: function parsedIntervalHeight() {
      return parseFloat(this.intervalHeight);
    },
    parsedFirstTime: function parsedFirstTime() {
      return (0, _timestamp.parseTime)(this.firstTime);
    },
    firstMinute: function firstMinute() {
      var time = this.parsedFirstTime;
      return time !== false && time >= 0 && time <= _timestamp.MINUTES_IN_DAY ? time : this.parsedFirstInterval * this.parsedIntervalMinutes;
    },
    bodyHeight: function bodyHeight() {
      return this.parsedIntervalCount * this.parsedIntervalHeight;
    },
    days: function days() {
      return (0, _timestamp.createDayList)(this.parsedStart, this.parsedEnd, this.times.today, this.weekdaySkips, this.maxDays);
    },
    intervals: function intervals() {
      var days = this.days;
      var first = this.firstMinute;
      var minutes = this.parsedIntervalMinutes;
      var count = this.parsedIntervalCount;
      var now = this.times.now;
      return days.map(function (d) {
        return (0, _timestamp.createIntervalList)(d, first, minutes, count, now);
      });
    },
    intervalFormatter: function intervalFormatter() {
      if (this.intervalFormat) {
        return this.intervalFormat;
      }

      var longOptions = {
        timeZone: 'UTC',
        hour: '2-digit',
        minute: '2-digit'
      };
      var shortOptions = {
        timeZone: 'UTC',
        hour: 'numeric',
        minute: '2-digit'
      };
      var shortHourOptions = {
        timeZone: 'UTC',
        hour: 'numeric'
      };
      return (0, _timestamp.createNativeLocaleFormatter)(this.currentLocale, function (tms, short) {
        return short ? tms.minute === 0 ? shortHourOptions : shortOptions : longOptions;
      });
    }
  },
  methods: {
    showIntervalLabelDefault: function showIntervalLabelDefault(interval) {
      var first = this.intervals[0][0];
      var isFirst = first.hour === interval.hour && first.minute === interval.minute;
      return !isFirst;
    },
    intervalStyleDefault: function intervalStyleDefault(_interval) {
      return undefined;
    },
    getTimestampAtEvent: function getTimestampAtEvent(e, day) {
      var timestamp = (0, _timestamp.copyTimestamp)(day);
      var bounds = e.currentTarget.getBoundingClientRect();
      var baseMinutes = this.firstMinute;
      var touchEvent = e;
      var mouseEvent = e;
      var touches = touchEvent.changedTouches || touchEvent.touches;
      var clientY = touches && touches[0] ? touches[0].clientY : mouseEvent.clientY;
      var addIntervals = (clientY - bounds.top) / this.parsedIntervalHeight;
      var addMinutes = Math.floor(addIntervals * this.parsedIntervalMinutes);
      var minutes = baseMinutes + addMinutes;
      return (0, _timestamp.updateMinutes)(timestamp, minutes, this.times.now);
    },
    getSlotScope: function getSlotScope(timestamp) {
      var scope = (0, _timestamp.copyTimestamp)(timestamp);
      scope.timeToY = this.timeToY;
      scope.timeDelta = this.timeDelta;
      scope.minutesToPixels = this.minutesToPixels;
      scope.week = this.days;
      return scope;
    },
    scrollToTime: function scrollToTime(time) {
      var y = this.timeToY(time);
      var pane = this.$refs.scrollArea;

      if (y === false || !pane) {
        return false;
      }

      pane.scrollTop = y;
      return true;
    },
    minutesToPixels: function minutesToPixels(minutes) {
      return minutes / this.parsedIntervalMinutes * this.parsedIntervalHeight;
    },
    timeToY: function timeToY(time) {
      var clamp = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
      var y = this.timeDelta(time);

      if (y !== false) {
        y *= this.bodyHeight;

        if (clamp) {
          if (y < 0) {
            y = 0;
          }

          if (y > this.bodyHeight) {
            y = this.bodyHeight;
          }
        }
      }

      return y;
    },
    timeDelta: function timeDelta(time) {
      var minutes = (0, _timestamp.parseTime)(time);

      if (minutes === false) {
        return false;
      }

      var min = this.firstMinute;
      var gap = this.parsedIntervalCount * this.parsedIntervalMinutes;
      return (minutes - min) / gap;
    }
  }
});

exports.default = _default;
//# sourceMappingURL=calendar-with-intervals.js.map
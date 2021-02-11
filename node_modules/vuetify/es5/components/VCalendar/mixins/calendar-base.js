"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _mixins = _interopRequireDefault(require("../../../util/mixins"));

var _colorable = _interopRequireDefault(require("../../../mixins/colorable"));

var _localable = _interopRequireDefault(require("../../../mixins/localable"));

var _mouse = _interopRequireDefault(require("./mouse"));

var _themeable = _interopRequireDefault(require("../../../mixins/themeable"));

var _times = _interopRequireDefault(require("./times"));

var _resize = _interopRequireDefault(require("../../../directives/resize"));

var _props = _interopRequireDefault(require("../util/props"));

var _timestamp = require("../util/timestamp");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Mixins
// Directives
// Util
var _default = (0, _mixins.default)(_colorable.default, _localable.default, _mouse.default, _themeable.default, _times.default
/* @vue/component */
).extend({
  name: 'calendar-base',
  directives: {
    Resize: _resize.default
  },
  props: _props.default.base,
  computed: {
    parsedWeekdays: function parsedWeekdays() {
      return Array.isArray(this.weekdays) ? this.weekdays : (this.weekdays || '').split(',').map(function (x) {
        return parseInt(x, 10);
      });
    },
    weekdaySkips: function weekdaySkips() {
      return (0, _timestamp.getWeekdaySkips)(this.parsedWeekdays);
    },
    weekdaySkipsReverse: function weekdaySkipsReverse() {
      var reversed = this.weekdaySkips.slice();
      reversed.reverse();
      return reversed;
    },
    parsedStart: function parsedStart() {
      return (0, _timestamp.parseTimestamp)(this.start, true);
    },
    parsedEnd: function parsedEnd() {
      var start = this.parsedStart;
      var end = this.end ? (0, _timestamp.parseTimestamp)(this.end) || start : start;
      return (0, _timestamp.getTimestampIdentifier)(end) < (0, _timestamp.getTimestampIdentifier)(start) ? start : end;
    },
    days: function days() {
      return (0, _timestamp.createDayList)(this.parsedStart, this.parsedEnd, this.times.today, this.weekdaySkips);
    },
    dayFormatter: function dayFormatter() {
      if (this.dayFormat) {
        return this.dayFormat;
      }

      var options = {
        timeZone: 'UTC',
        day: 'numeric'
      };
      return (0, _timestamp.createNativeLocaleFormatter)(this.currentLocale, function (_tms, _short) {
        return options;
      });
    },
    weekdayFormatter: function weekdayFormatter() {
      if (this.weekdayFormat) {
        return this.weekdayFormat;
      }

      var longOptions = {
        timeZone: 'UTC',
        weekday: 'long'
      };
      var shortOptions = {
        timeZone: 'UTC',
        weekday: 'short'
      };
      return (0, _timestamp.createNativeLocaleFormatter)(this.currentLocale, function (_tms, short) {
        return short ? shortOptions : longOptions;
      });
    }
  },
  methods: {
    getRelativeClasses: function getRelativeClasses(timestamp) {
      var outside = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      return {
        'v-present': timestamp.present,
        'v-past': timestamp.past,
        'v-future': timestamp.future,
        'v-outside': outside
      };
    },
    getStartOfWeek: function getStartOfWeek(timestamp) {
      return (0, _timestamp.getStartOfWeek)(timestamp, this.parsedWeekdays, this.times.today);
    },
    getEndOfWeek: function getEndOfWeek(timestamp) {
      return (0, _timestamp.getEndOfWeek)(timestamp, this.parsedWeekdays, this.times.today);
    },
    getFormatter: function getFormatter(options) {
      return (0, _timestamp.createNativeLocaleFormatter)(this.locale, function (_tms, _short) {
        return options;
      });
    }
  }
});

exports.default = _default;
//# sourceMappingURL=calendar-base.js.map
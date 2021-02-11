"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.validateNumber = validateNumber;
exports.validateWeekdays = validateWeekdays;
exports.default = void 0;

var _timestamp = require("./timestamp");

var _modes = require("../modes");

var _default2 = {
  base: {
    start: {
      type: [String, Number, Date],
      validate: _timestamp.validateTimestamp,
      default: function _default() {
        return (0, _timestamp.parseDate)(new Date()).date;
      }
    },
    end: {
      type: [String, Number, Date],
      validate: _timestamp.validateTimestamp
    },
    weekdays: {
      type: [Array, String],
      default: function _default() {
        return [0, 1, 2, 3, 4, 5, 6];
      },
      validate: validateWeekdays
    },
    hideHeader: {
      type: Boolean
    },
    shortWeekdays: {
      type: Boolean,
      default: true
    },
    weekdayFormat: {
      type: Function,
      default: null
    },
    dayFormat: {
      type: Function,
      default: null
    }
  },
  intervals: {
    maxDays: {
      type: Number,
      default: 7
    },
    shortIntervals: {
      type: Boolean,
      default: true
    },
    intervalHeight: {
      type: [Number, String],
      default: 48,
      validate: validateNumber
    },
    intervalWidth: {
      type: [Number, String],
      default: 60,
      validate: validateNumber
    },
    intervalMinutes: {
      type: [Number, String],
      default: 60,
      validate: validateNumber
    },
    firstInterval: {
      type: [Number, String],
      default: 0,
      validate: validateNumber
    },
    firstTime: {
      type: [Number, String, Object],
      validate: _timestamp.validateTime
    },
    intervalCount: {
      type: [Number, String],
      default: 24,
      validate: validateNumber
    },
    intervalFormat: {
      type: Function,
      default: null
    },
    intervalStyle: {
      type: Function,
      default: null
    },
    showIntervalLabel: {
      type: Function,
      default: null
    }
  },
  weeks: {
    localeFirstDayOfYear: {
      type: [String, Number],
      default: 0
    },
    minWeeks: {
      validate: validateNumber,
      default: 1
    },
    shortMonths: {
      type: Boolean,
      default: true
    },
    showMonthOnFirst: {
      type: Boolean,
      default: true
    },
    showWeek: Boolean,
    monthFormat: {
      type: Function,
      default: null
    }
  },
  calendar: {
    type: {
      type: String,
      default: 'month'
    },
    value: {
      type: [String, Number, Date],
      validate: _timestamp.validateTimestamp
    }
  },
  category: {
    categories: {
      type: [Array, String],
      default: ''
    },
    categoryText: {
      type: [String, Function]
    },
    categoryHideDynamic: {
      type: Boolean
    },
    categoryShowAll: {
      type: Boolean
    },
    categoryForInvalid: {
      type: String,
      default: ''
    },
    categoryDays: {
      type: [Number, String],
      default: 1,
      validate: function validate(x) {
        return isFinite(parseInt(x)) && parseInt(x) > 0;
      }
    }
  },
  events: {
    events: {
      type: Array,
      default: function _default() {
        return [];
      }
    },
    eventStart: {
      type: String,
      default: 'start'
    },
    eventEnd: {
      type: String,
      default: 'end'
    },
    eventTimed: {
      type: [String, Function],
      default: 'timed'
    },
    eventCategory: {
      type: [String, Function],
      default: 'category'
    },
    eventHeight: {
      type: Number,
      default: 20
    },
    eventColor: {
      type: [String, Function],
      default: 'primary'
    },
    eventTextColor: {
      type: [String, Function],
      default: 'white'
    },
    eventName: {
      type: [String, Function],
      default: 'name'
    },
    eventOverlapThreshold: {
      type: [String, Number],
      default: 60
    },
    eventOverlapMode: {
      type: [String, Function],
      default: 'stack',
      validate: function validate(mode) {
        return mode in _modes.CalendarEventOverlapModes || typeof mode === 'function';
      }
    },
    eventMore: {
      type: Boolean,
      default: true
    },
    eventMoreText: {
      type: String,
      default: '$vuetify.calendar.moreEvents'
    },
    eventRipple: {
      type: [Boolean, Object],
      default: null
    },
    eventMarginBottom: {
      type: Number,
      default: 1
    }
  }
};
exports.default = _default2;

function validateNumber(input) {
  return isFinite(parseInt(input));
}

function validateWeekdays(input) {
  if (typeof input === 'string') {
    input = input.split(',');
  }

  if (Array.isArray(input)) {
    var ints = input.map(function (x) {
      return parseInt(x);
    });

    if (ints.length > _timestamp.DAYS_IN_WEEK || ints.length === 0) {
      return false;
    }

    var visited = {};
    var wrapped = false;

    for (var i = 0; i < ints.length; i++) {
      var x = ints[i];

      if (!isFinite(x) || x < 0 || x >= _timestamp.DAYS_IN_WEEK) {
        return false;
      }

      if (i > 0) {
        var d = x - ints[i - 1];

        if (d < 0) {
          if (wrapped) {
            return false;
          }

          wrapped = true;
        } else if (d === 0) {
          return false;
        }
      }

      if (visited[x]) {
        return false;
      }

      visited[x] = true;
    }

    return true;
  }

  return false;
}
//# sourceMappingURL=props.js.map
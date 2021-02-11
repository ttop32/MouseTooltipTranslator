"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getStartOfWeek = getStartOfWeek;
exports.getEndOfWeek = getEndOfWeek;
exports.getStartOfMonth = getStartOfMonth;
exports.getEndOfMonth = getEndOfMonth;
exports.validateTime = validateTime;
exports.parseTime = parseTime;
exports.validateTimestamp = validateTimestamp;
exports.parseTimestamp = parseTimestamp;
exports.parseDate = parseDate;
exports.getDayIdentifier = getDayIdentifier;
exports.getTimeIdentifier = getTimeIdentifier;
exports.getTimestampIdentifier = getTimestampIdentifier;
exports.updateRelative = updateRelative;
exports.isTimedless = isTimedless;
exports.updateHasTime = updateHasTime;
exports.updateMinutes = updateMinutes;
exports.updateWeekday = updateWeekday;
exports.updateFormatted = updateFormatted;
exports.getWeekday = getWeekday;
exports.daysInMonth = daysInMonth;
exports.copyTimestamp = copyTimestamp;
exports.padNumber = padNumber;
exports.getDate = getDate;
exports.getTime = getTime;
exports.nextMinutes = nextMinutes;
exports.nextDay = nextDay;
exports.prevDay = prevDay;
exports.relativeDays = relativeDays;
exports.diffMinutes = diffMinutes;
exports.findWeekday = findWeekday;
exports.getWeekdaySkips = getWeekdaySkips;
exports.timestampToDate = timestampToDate;
exports.createDayList = createDayList;
exports.createIntervalList = createIntervalList;
exports.createNativeLocaleFormatter = createNativeLocaleFormatter;
exports.OFFSET_TIME = exports.OFFSET_HOUR = exports.OFFSET_MONTH = exports.OFFSET_YEAR = exports.FIRST_HOUR = exports.HOUR_MAX = exports.HOURS_IN_DAY = exports.MINUTES_IN_DAY = exports.MINUTE_MAX = exports.MINUTES_IN_HOUR = exports.DAYS_IN_WEEK = exports.DAY_MIN = exports.MONTH_MIN = exports.MONTH_MAX = exports.DAYS_IN_MONTH_MAX = exports.DAYS_IN_MONTH_MIN = exports.DAYS_IN_MONTH_LEAP = exports.DAYS_IN_MONTH = exports.PARSE_TIME = exports.PARSE_REGEX = void 0;

var _dateTimeUtils = require("../../../util/dateTimeUtils");

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

var PARSE_REGEX = /^(\d{4})-(\d{1,2})(-(\d{1,2}))?([^\d]+(\d{1,2}))?(:(\d{1,2}))?(:(\d{1,2}))?$/;
exports.PARSE_REGEX = PARSE_REGEX;
var PARSE_TIME = /(\d\d?)(:(\d\d?)|)(:(\d\d?)|)/;
exports.PARSE_TIME = PARSE_TIME;
var DAYS_IN_MONTH = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
exports.DAYS_IN_MONTH = DAYS_IN_MONTH;
var DAYS_IN_MONTH_LEAP = [0, 31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
exports.DAYS_IN_MONTH_LEAP = DAYS_IN_MONTH_LEAP;
var DAYS_IN_MONTH_MIN = 28;
exports.DAYS_IN_MONTH_MIN = DAYS_IN_MONTH_MIN;
var DAYS_IN_MONTH_MAX = 31;
exports.DAYS_IN_MONTH_MAX = DAYS_IN_MONTH_MAX;
var MONTH_MAX = 12;
exports.MONTH_MAX = MONTH_MAX;
var MONTH_MIN = 1;
exports.MONTH_MIN = MONTH_MIN;
var DAY_MIN = 1;
exports.DAY_MIN = DAY_MIN;
var DAYS_IN_WEEK = 7;
exports.DAYS_IN_WEEK = DAYS_IN_WEEK;
var MINUTES_IN_HOUR = 60;
exports.MINUTES_IN_HOUR = MINUTES_IN_HOUR;
var MINUTE_MAX = 59;
exports.MINUTE_MAX = MINUTE_MAX;
var MINUTES_IN_DAY = 24 * 60;
exports.MINUTES_IN_DAY = MINUTES_IN_DAY;
var HOURS_IN_DAY = 24;
exports.HOURS_IN_DAY = HOURS_IN_DAY;
var HOUR_MAX = 23;
exports.HOUR_MAX = HOUR_MAX;
var FIRST_HOUR = 0;
exports.FIRST_HOUR = FIRST_HOUR;
var OFFSET_YEAR = 10000;
exports.OFFSET_YEAR = OFFSET_YEAR;
var OFFSET_MONTH = 100;
exports.OFFSET_MONTH = OFFSET_MONTH;
var OFFSET_HOUR = 100;
exports.OFFSET_HOUR = OFFSET_HOUR;
var OFFSET_TIME = 10000;
exports.OFFSET_TIME = OFFSET_TIME;

function getStartOfWeek(timestamp, weekdays, today) {
  var start = copyTimestamp(timestamp);
  findWeekday(start, weekdays[0], prevDay);
  updateFormatted(start);

  if (today) {
    updateRelative(start, today, start.hasTime);
  }

  return start;
}

function getEndOfWeek(timestamp, weekdays, today) {
  var end = copyTimestamp(timestamp);
  findWeekday(end, weekdays[weekdays.length - 1]);
  updateFormatted(end);

  if (today) {
    updateRelative(end, today, end.hasTime);
  }

  return end;
}

function getStartOfMonth(timestamp) {
  var start = copyTimestamp(timestamp);
  start.day = DAY_MIN;
  updateWeekday(start);
  updateFormatted(start);
  return start;
}

function getEndOfMonth(timestamp) {
  var end = copyTimestamp(timestamp);
  end.day = daysInMonth(end.year, end.month);
  updateWeekday(end);
  updateFormatted(end);
  return end;
}

function validateTime(input) {
  return typeof input === 'number' && isFinite(input) || !!PARSE_TIME.exec(input) || _typeof(input) === 'object' && isFinite(input.hour) && isFinite(input.minute);
}

function parseTime(input) {
  if (typeof input === 'number') {
    // when a number is given, it's minutes since 12:00am
    return input;
  } else if (typeof input === 'string') {
    // when a string is given, it's a hh:mm:ss format where seconds are optional
    var parts = PARSE_TIME.exec(input);

    if (!parts) {
      return false;
    }

    return parseInt(parts[1]) * 60 + parseInt(parts[3] || 0);
  } else if (_typeof(input) === 'object') {
    // when an object is given, it must have hour and minute
    if (typeof input.hour !== 'number' || typeof input.minute !== 'number') {
      return false;
    }

    return input.hour * 60 + input.minute;
  } else {
    // unsupported type
    return false;
  }
}

function validateTimestamp(input) {
  return typeof input === 'number' && isFinite(input) || typeof input === 'string' && !!PARSE_REGEX.exec(input) || input instanceof Date;
}

function parseTimestamp(input) {
  var required = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
  var now = arguments.length > 2 ? arguments[2] : undefined;

  if (typeof input === 'number' && isFinite(input)) {
    input = new Date(input);
  }

  if (input instanceof Date) {
    var date = parseDate(input);

    if (now) {
      updateRelative(date, now, date.hasTime);
    }

    return date;
  }

  if (typeof input !== 'string') {
    if (required) {
      throw new Error("".concat(input, " is not a valid timestamp. It must be a Date, number of seconds since Epoch, or a string in the format of YYYY-MM-DD or YYYY-MM-DD hh:mm. Zero-padding is optional and seconds are ignored."));
    }

    return null;
  } // YYYY-MM-DD hh:mm:ss


  var parts = PARSE_REGEX.exec(input);

  if (!parts) {
    if (required) {
      throw new Error("".concat(input, " is not a valid timestamp. It must be a Date, number of seconds since Epoch, or a string in the format of YYYY-MM-DD or YYYY-MM-DD hh:mm. Zero-padding is optional and seconds are ignored."));
    }

    return null;
  }

  var timestamp = {
    date: input,
    time: '',
    year: parseInt(parts[1]),
    month: parseInt(parts[2]),
    day: parseInt(parts[4]) || 1,
    hour: parseInt(parts[6]) || 0,
    minute: parseInt(parts[8]) || 0,
    weekday: 0,
    hasDay: !!parts[4],
    hasTime: !!(parts[6] && parts[8]),
    past: false,
    present: false,
    future: false
  };
  updateWeekday(timestamp);
  updateFormatted(timestamp);

  if (now) {
    updateRelative(timestamp, now, timestamp.hasTime);
  }

  return timestamp;
}

function parseDate(date) {
  return updateFormatted({
    date: '',
    time: '',
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate(),
    weekday: date.getDay(),
    hour: date.getHours(),
    minute: date.getMinutes(),
    hasDay: true,
    hasTime: true,
    past: false,
    present: true,
    future: false
  });
}

function getDayIdentifier(timestamp) {
  return timestamp.year * OFFSET_YEAR + timestamp.month * OFFSET_MONTH + timestamp.day;
}

function getTimeIdentifier(timestamp) {
  return timestamp.hour * OFFSET_HOUR + timestamp.minute;
}

function getTimestampIdentifier(timestamp) {
  return getDayIdentifier(timestamp) * OFFSET_TIME + getTimeIdentifier(timestamp);
}

function updateRelative(timestamp, now) {
  var time = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
  var a = getDayIdentifier(now);
  var b = getDayIdentifier(timestamp);
  var present = a === b;

  if (timestamp.hasTime && time && present) {
    a = getTimeIdentifier(now);
    b = getTimeIdentifier(timestamp);
    present = a === b;
  }

  timestamp.past = b < a;
  timestamp.present = present;
  timestamp.future = b > a;
  return timestamp;
}

function isTimedless(input) {
  return input instanceof Date || typeof input === 'number' && isFinite(input);
}

function updateHasTime(timestamp, hasTime, now) {
  if (timestamp.hasTime !== hasTime) {
    timestamp.hasTime = hasTime;

    if (!hasTime) {
      timestamp.hour = HOUR_MAX;
      timestamp.minute = MINUTE_MAX;
      timestamp.time = getTime(timestamp);
    }

    if (now) {
      updateRelative(timestamp, now, timestamp.hasTime);
    }
  }

  return timestamp;
}

function updateMinutes(timestamp, minutes, now) {
  timestamp.hasTime = true;
  timestamp.hour = Math.floor(minutes / MINUTES_IN_HOUR);
  timestamp.minute = minutes % MINUTES_IN_HOUR;
  timestamp.time = getTime(timestamp);

  if (now) {
    updateRelative(timestamp, now, true);
  }

  return timestamp;
}

function updateWeekday(timestamp) {
  timestamp.weekday = getWeekday(timestamp);
  return timestamp;
}

function updateFormatted(timestamp) {
  timestamp.time = getTime(timestamp);
  timestamp.date = getDate(timestamp);
  return timestamp;
}

function getWeekday(timestamp) {
  if (timestamp.hasDay) {
    var _ = Math.floor;
    var k = timestamp.day;
    var m = (timestamp.month + 9) % MONTH_MAX + 1;

    var C = _(timestamp.year / 100);

    var Y = timestamp.year % 100 - (timestamp.month <= 2 ? 1 : 0);
    return ((k + _(2.6 * m - 0.2) - 2 * C + Y + _(Y / 4) + _(C / 4)) % 7 + 7) % 7;
  }

  return timestamp.weekday;
}

function daysInMonth(year, month) {
  return (0, _dateTimeUtils.isLeapYear)(year) ? DAYS_IN_MONTH_LEAP[month] : DAYS_IN_MONTH[month];
}

function copyTimestamp(timestamp) {
  var date = timestamp.date,
      time = timestamp.time,
      year = timestamp.year,
      month = timestamp.month,
      day = timestamp.day,
      weekday = timestamp.weekday,
      hour = timestamp.hour,
      minute = timestamp.minute,
      hasDay = timestamp.hasDay,
      hasTime = timestamp.hasTime,
      past = timestamp.past,
      present = timestamp.present,
      future = timestamp.future;
  return {
    date: date,
    time: time,
    year: year,
    month: month,
    day: day,
    weekday: weekday,
    hour: hour,
    minute: minute,
    hasDay: hasDay,
    hasTime: hasTime,
    past: past,
    present: present,
    future: future
  };
}

function padNumber(x, length) {
  var padded = String(x);

  while (padded.length < length) {
    padded = '0' + padded;
  }

  return padded;
}

function getDate(timestamp) {
  var str = "".concat(padNumber(timestamp.year, 4), "-").concat(padNumber(timestamp.month, 2));
  if (timestamp.hasDay) str += "-".concat(padNumber(timestamp.day, 2));
  return str;
}

function getTime(timestamp) {
  if (!timestamp.hasTime) {
    return '';
  }

  return "".concat(padNumber(timestamp.hour, 2), ":").concat(padNumber(timestamp.minute, 2));
}

function nextMinutes(timestamp, minutes) {
  timestamp.minute += minutes;

  while (timestamp.minute > MINUTES_IN_HOUR) {
    timestamp.minute -= MINUTES_IN_HOUR;
    timestamp.hour++;

    if (timestamp.hour >= HOURS_IN_DAY) {
      nextDay(timestamp);
      timestamp.hour = FIRST_HOUR;
    }
  }

  return timestamp;
}

function nextDay(timestamp) {
  timestamp.day++;
  timestamp.weekday = (timestamp.weekday + 1) % DAYS_IN_WEEK;

  if (timestamp.day > DAYS_IN_MONTH_MIN && timestamp.day > daysInMonth(timestamp.year, timestamp.month)) {
    timestamp.day = DAY_MIN;
    timestamp.month++;

    if (timestamp.month > MONTH_MAX) {
      timestamp.month = MONTH_MIN;
      timestamp.year++;
    }
  }

  return timestamp;
}

function prevDay(timestamp) {
  timestamp.day--;
  timestamp.weekday = (timestamp.weekday + 6) % DAYS_IN_WEEK;

  if (timestamp.day < DAY_MIN) {
    timestamp.month--;

    if (timestamp.month < MONTH_MIN) {
      timestamp.year--;
      timestamp.month = MONTH_MAX;
    }

    timestamp.day = daysInMonth(timestamp.year, timestamp.month);
  }

  return timestamp;
}

function relativeDays(timestamp) {
  var mover = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : nextDay;
  var days = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1;

  while (--days >= 0) {
    mover(timestamp);
  }

  return timestamp;
}

function diffMinutes(min, max) {
  var Y = (max.year - min.year) * 525600;
  var M = (max.month - min.month) * 43800;
  var D = (max.day - min.day) * 1440;
  var h = (max.hour - min.hour) * 60;
  var m = max.minute - min.minute;
  return Y + M + D + h + m;
}

function findWeekday(timestamp, weekday) {
  var mover = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : nextDay;
  var maxDays = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 6;

  while (timestamp.weekday !== weekday && --maxDays >= 0) {
    mover(timestamp);
  }

  return timestamp;
}

function getWeekdaySkips(weekdays) {
  var skips = [1, 1, 1, 1, 1, 1, 1];
  var filled = [0, 0, 0, 0, 0, 0, 0];

  for (var i = 0; i < weekdays.length; i++) {
    filled[weekdays[i]] = 1;
  }

  for (var k = 0; k < DAYS_IN_WEEK; k++) {
    var skip = 1;

    for (var j = 1; j < DAYS_IN_WEEK; j++) {
      var next = (k + j) % DAYS_IN_WEEK;

      if (filled[next]) {
        break;
      }

      skip++;
    }

    skips[k] = filled[k] * skip;
  }

  return skips;
}

function timestampToDate(timestamp) {
  var time = "".concat(padNumber(timestamp.hour, 2), ":").concat(padNumber(timestamp.minute, 2));
  var date = timestamp.date;
  return new Date("".concat(date, "T").concat(time, ":00+00:00"));
}

function createDayList(start, end, now, weekdaySkips) {
  var max = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 42;
  var min = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : 0;
  var stop = getDayIdentifier(end);
  var days = [];
  var current = copyTimestamp(start);
  var currentIdentifier = 0;
  var stopped = currentIdentifier === stop;

  if (stop < getDayIdentifier(start)) {
    throw new Error('End date is earlier than start date.');
  }

  while ((!stopped || days.length < min) && days.length < max) {
    currentIdentifier = getDayIdentifier(current);
    stopped = stopped || currentIdentifier === stop;

    if (weekdaySkips[current.weekday] === 0) {
      current = nextDay(current);
      continue;
    }

    var day = copyTimestamp(current);
    updateFormatted(day);
    updateRelative(day, now);
    days.push(day);
    current = relativeDays(current, nextDay, weekdaySkips[current.weekday]);
  }

  if (!days.length) throw new Error('No dates found using specified start date, end date, and weekdays.');
  return days;
}

function createIntervalList(timestamp, first, minutes, count, now) {
  var intervals = [];

  for (var i = 0; i < count; i++) {
    var mins = first + i * minutes;
    var int = copyTimestamp(timestamp);
    intervals.push(updateMinutes(int, mins, now));
  }

  return intervals;
}

function createNativeLocaleFormatter(locale, getOptions) {
  var emptyFormatter = function emptyFormatter(_t, _s) {
    return '';
  };

  if (typeof Intl === 'undefined' || typeof Intl.DateTimeFormat === 'undefined') {
    return emptyFormatter;
  }

  return function (timestamp, short) {
    try {
      var intlFormatter = new Intl.DateTimeFormat(locale || undefined, getOptions(timestamp, short));
      return intlFormatter.format(timestampToDate(timestamp));
    } catch (e) {
      return '';
    }
  };
}
//# sourceMappingURL=timestamp.js.map
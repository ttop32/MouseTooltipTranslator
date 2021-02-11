"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.parseEvent = parseEvent;
exports.isEventOn = isEventOn;
exports.isEventStart = isEventStart;
exports.isEventOverlapping = isEventOverlapping;

var _timestamp = require("./timestamp");

function parseEvent(input, index, startProperty, endProperty) {
  var timed = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : false;
  var category = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : false;
  var startInput = input[startProperty];
  var endInput = input[endProperty];
  var startParsed = (0, _timestamp.parseTimestamp)(startInput, true);
  var endParsed = endInput ? (0, _timestamp.parseTimestamp)(endInput, true) : startParsed;
  var start = (0, _timestamp.isTimedless)(startInput) ? (0, _timestamp.updateHasTime)(startParsed, timed) : startParsed;
  var end = (0, _timestamp.isTimedless)(endInput) ? (0, _timestamp.updateHasTime)(endParsed, timed) : endParsed;
  var startIdentifier = (0, _timestamp.getDayIdentifier)(start);
  var startTimestampIdentifier = (0, _timestamp.getTimestampIdentifier)(start);
  var endIdentifier = (0, _timestamp.getDayIdentifier)(end);
  var endOffset = start.hasTime ? 0 : 2359;
  var endTimestampIdentifier = (0, _timestamp.getTimestampIdentifier)(end) + endOffset;
  var allDay = !start.hasTime;
  return {
    input: input,
    start: start,
    startIdentifier: startIdentifier,
    startTimestampIdentifier: startTimestampIdentifier,
    end: end,
    endIdentifier: endIdentifier,
    endTimestampIdentifier: endTimestampIdentifier,
    allDay: allDay,
    index: index,
    category: category
  };
}

function isEventOn(event, dayIdentifier) {
  return dayIdentifier >= event.startIdentifier && dayIdentifier <= event.endIdentifier && dayIdentifier * _timestamp.OFFSET_TIME !== event.endTimestampIdentifier;
}

function isEventStart(event, day, dayIdentifier, firstWeekday) {
  return dayIdentifier === event.startIdentifier || firstWeekday === day.weekday && isEventOn(event, dayIdentifier);
}

function isEventOverlapping(event, startIdentifier, endIdentifier) {
  return startIdentifier <= event.endIdentifier && endIdentifier >= event.startIdentifier;
}
//# sourceMappingURL=events.js.map
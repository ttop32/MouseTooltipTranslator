"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getVisuals = _getVisuals;
exports.hasOverlap = hasOverlap;
exports.setColumnCount = setColumnCount;
exports.getRange = getRange;
exports.getDayRange = getDayRange;
exports.getNormalizedRange = getNormalizedRange;
exports.getOpenGroup = getOpenGroup;
exports.getOverlapGroupHandler = getOverlapGroupHandler;

var _timestamp = require("../util/timestamp");

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

var MILLIS_IN_DAY = 86400000;

function _getVisuals(events) {
  var minStart = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
  var visuals = events.map(function (event) {
    return {
      event: event,
      columnCount: 0,
      column: 0,
      left: 0,
      width: 100
    };
  });
  visuals.sort(function (a, b) {
    return Math.max(minStart, a.event.startTimestampIdentifier) - Math.max(minStart, b.event.startTimestampIdentifier) || b.event.endTimestampIdentifier - a.event.endTimestampIdentifier;
  });
  return visuals;
}

function hasOverlap(s0, e0, s1, e1) {
  var exclude = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : true;
  return exclude ? !(s0 >= e1 || e0 <= s1) : !(s0 > e1 || e0 < s1);
}

function setColumnCount(groups) {
  groups.forEach(function (group) {
    group.visuals.forEach(function (groupVisual) {
      groupVisual.columnCount = groups.length;
    });
  });
}

function getRange(event) {
  return [event.startTimestampIdentifier, event.endTimestampIdentifier];
}

function getDayRange(event) {
  return [event.startIdentifier, event.endIdentifier];
}

function getNormalizedRange(event, dayStart) {
  return [Math.max(dayStart, event.startTimestampIdentifier), Math.min(dayStart + MILLIS_IN_DAY, event.endTimestampIdentifier)];
}

function getOpenGroup(groups, start, end, timed) {
  for (var i = 0; i < groups.length; i++) {
    var group = groups[i];
    var intersected = false;

    if (hasOverlap(start, end, group.start, group.end, timed)) {
      for (var k = 0; k < group.visuals.length; k++) {
        var groupVisual = group.visuals[k];

        var _ref = timed ? getRange(groupVisual.event) : getDayRange(groupVisual.event),
            _ref2 = _slicedToArray(_ref, 2),
            groupStart = _ref2[0],
            groupEnd = _ref2[1];

        if (hasOverlap(start, end, groupStart, groupEnd, timed)) {
          intersected = true;
          break;
        }
      }
    }

    if (!intersected) {
      return i;
    }
  }

  return -1;
}

function getOverlapGroupHandler(firstWeekday) {
  var handler = {
    groups: [],
    min: -1,
    max: -1,
    reset: function reset() {
      handler.groups = [];
      handler.min = handler.max = -1;
    },
    getVisuals: function getVisuals(day, dayEvents, timed) {
      var reset = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;

      if (day.weekday === firstWeekday || reset) {
        handler.reset();
      }

      var dayStart = (0, _timestamp.getTimestampIdentifier)(day);

      var visuals = _getVisuals(dayEvents, dayStart);

      visuals.forEach(function (visual) {
        var _ref3 = timed ? getRange(visual.event) : getDayRange(visual.event),
            _ref4 = _slicedToArray(_ref3, 2),
            start = _ref4[0],
            end = _ref4[1];

        if (handler.groups.length > 0 && !hasOverlap(start, end, handler.min, handler.max, timed)) {
          setColumnCount(handler.groups);
          handler.reset();
        }

        var targetGroup = getOpenGroup(handler.groups, start, end, timed);

        if (targetGroup === -1) {
          targetGroup = handler.groups.length;
          handler.groups.push({
            start: start,
            end: end,
            visuals: []
          });
        }

        var target = handler.groups[targetGroup];
        target.visuals.push(visual);
        target.start = Math.min(target.start, start);
        target.end = Math.max(target.end, end);
        visual.column = targetGroup;

        if (handler.min === -1) {
          handler.min = start;
          handler.max = end;
        } else {
          handler.min = Math.min(handler.min, start);
          handler.max = Math.max(handler.max, end);
        }
      });
      setColumnCount(handler.groups);

      if (timed) {
        handler.reset();
      }

      return visuals;
    }
  };
  return handler;
}
//# sourceMappingURL=common.js.map
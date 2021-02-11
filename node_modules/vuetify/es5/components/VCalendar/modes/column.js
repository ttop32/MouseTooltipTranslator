"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.column = void 0;

var _common = require("./common");

var FULL_WIDTH = 100;

var column = function column(events, firstWeekday, overlapThreshold) {
  var handler = (0, _common.getOverlapGroupHandler)(firstWeekday);
  return function (day, dayEvents, timed, reset) {
    var visuals = handler.getVisuals(day, dayEvents, timed, reset);

    if (timed) {
      visuals.forEach(function (visual) {
        visual.left = visual.column * FULL_WIDTH / visual.columnCount;
        visual.width = FULL_WIDTH / visual.columnCount;
      });
    }

    return visuals;
  };
};

exports.column = column;
//# sourceMappingURL=column.js.map
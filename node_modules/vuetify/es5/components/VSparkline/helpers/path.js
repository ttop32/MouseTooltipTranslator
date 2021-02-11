"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.genPath = genPath;

var _math = require("./math");

/**
 * From https://github.com/unsplash/react-trend/blob/master/src/helpers/DOM.helpers.js#L18
 */
function genPath(points, radius) {
  var fill = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
  var height = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 75;
  var start = points.shift();
  var end = points[points.length - 1];
  return (fill ? "M".concat(start.x, " ").concat(height - start.x + 2, " L").concat(start.x, " ").concat(start.y) : "M".concat(start.x, " ").concat(start.y)) + points.map(function (point, index) {
    var next = points[index + 1];
    var prev = points[index - 1] || start;
    var isCollinear = next && (0, _math.checkCollinear)(next, point, prev);

    if (!next || isCollinear) {
      return "L".concat(point.x, " ").concat(point.y);
    }

    var threshold = Math.min((0, _math.getDistance)(prev, point), (0, _math.getDistance)(next, point));
    var isTooCloseForRadius = threshold / 2 < radius;
    var radiusForPoint = isTooCloseForRadius ? threshold / 2 : radius;
    var before = (0, _math.moveTo)(prev, point, radiusForPoint);
    var after = (0, _math.moveTo)(next, point, radiusForPoint);
    return "L".concat(before.x, " ").concat(before.y, "S").concat(point.x, " ").concat(point.y, " ").concat(after.x, " ").concat(after.y);
  }).join('') + (fill ? "L".concat(end.x, " ").concat(height - start.x + 2, " Z") : '');
}
//# sourceMappingURL=path.js.map
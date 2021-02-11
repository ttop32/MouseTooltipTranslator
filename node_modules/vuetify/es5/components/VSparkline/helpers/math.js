"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.checkCollinear = checkCollinear;
exports.getDistance = getDistance;
exports.moveTo = moveTo;

function int(value) {
  return parseInt(value, 10);
}
/**
 * https://en.wikipedia.org/wiki/Collinearity
 * x=(x1+x2)/2
 * y=(y1+y2)/2
 */


function checkCollinear(p0, p1, p2) {
  return int(p0.x + p2.x) === int(2 * p1.x) && int(p0.y + p2.y) === int(2 * p1.y);
}

function getDistance(p1, p2) {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
}

function moveTo(to, from, radius) {
  var vector = {
    x: to.x - from.x,
    y: to.y - from.y
  };
  var length = Math.sqrt(vector.x * vector.x + vector.y * vector.y);
  var unitVector = {
    x: vector.x / length,
    y: vector.y / length
  };
  return {
    x: from.x + unitVector.x * radius,
    y: from.y + unitVector.y * radius
  };
}
//# sourceMappingURL=math.js.map
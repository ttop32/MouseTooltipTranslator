"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.easeInOutQuint = exports.easeOutQuint = exports.easeInQuint = exports.easeInOutQuart = exports.easeOutQuart = exports.easeInQuart = exports.easeInOutCubic = exports.easeOutCubic = exports.easeInCubic = exports.easeInOutQuad = exports.easeOutQuad = exports.easeInQuad = exports.linear = void 0;

// linear
var linear = function linear(t) {
  return t;
}; // accelerating from zero velocity


exports.linear = linear;

var easeInQuad = function easeInQuad(t) {
  return Math.pow(t, 2);
}; // decelerating to zero velocity


exports.easeInQuad = easeInQuad;

var easeOutQuad = function easeOutQuad(t) {
  return t * (2 - t);
}; // acceleration until halfway, then deceleration


exports.easeOutQuad = easeOutQuad;

var easeInOutQuad = function easeInOutQuad(t) {
  return t < 0.5 ? 2 * Math.pow(t, 2) : -1 + (4 - 2 * t) * t;
}; // accelerating from zero velocity


exports.easeInOutQuad = easeInOutQuad;

var easeInCubic = function easeInCubic(t) {
  return Math.pow(t, 3);
}; // decelerating to zero velocity


exports.easeInCubic = easeInCubic;

var easeOutCubic = function easeOutCubic(t) {
  return Math.pow(--t, 3) + 1;
}; // acceleration until halfway, then deceleration


exports.easeOutCubic = easeOutCubic;

var easeInOutCubic = function easeInOutCubic(t) {
  return t < 0.5 ? 4 * Math.pow(t, 3) : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
}; // accelerating from zero velocity


exports.easeInOutCubic = easeInOutCubic;

var easeInQuart = function easeInQuart(t) {
  return Math.pow(t, 4);
}; // decelerating to zero velocity


exports.easeInQuart = easeInQuart;

var easeOutQuart = function easeOutQuart(t) {
  return 1 - Math.pow(--t, 4);
}; // acceleration until halfway, then deceleration


exports.easeOutQuart = easeOutQuart;

var easeInOutQuart = function easeInOutQuart(t) {
  return t < 0.5 ? 8 * t * t * t * t : 1 - 8 * --t * t * t * t;
}; // accelerating from zero velocity


exports.easeInOutQuart = easeInOutQuart;

var easeInQuint = function easeInQuint(t) {
  return Math.pow(t, 5);
}; // decelerating to zero velocity


exports.easeInQuint = easeInQuint;

var easeOutQuint = function easeOutQuint(t) {
  return 1 + Math.pow(--t, 5);
}; // acceleration until halfway, then deceleration


exports.easeOutQuint = easeOutQuint;

var easeInOutQuint = function easeInOutQuint(t) {
  return t < 0.5 ? 16 * Math.pow(t, 5) : 1 + 16 * Math.pow(--t, 5);
};

exports.easeInOutQuint = easeInOutQuint;
//# sourceMappingURL=easing-patterns.js.map
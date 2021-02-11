"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "VCalendar", {
  enumerable: true,
  get: function get() {
    return _VCalendar.default;
  }
});
Object.defineProperty(exports, "VCalendarDaily", {
  enumerable: true,
  get: function get() {
    return _VCalendarDaily.default;
  }
});
Object.defineProperty(exports, "VCalendarWeekly", {
  enumerable: true,
  get: function get() {
    return _VCalendarWeekly.default;
  }
});
Object.defineProperty(exports, "VCalendarMonthly", {
  enumerable: true,
  get: function get() {
    return _VCalendarMonthly.default;
  }
});
Object.defineProperty(exports, "VCalendarCategory", {
  enumerable: true,
  get: function get() {
    return _VCalendarCategory.default;
  }
});
exports.default = void 0;

var _VCalendar = _interopRequireDefault(require("./VCalendar"));

var _VCalendarDaily = _interopRequireDefault(require("./VCalendarDaily"));

var _VCalendarWeekly = _interopRequireDefault(require("./VCalendarWeekly"));

var _VCalendarMonthly = _interopRequireDefault(require("./VCalendarMonthly"));

var _VCalendarCategory = _interopRequireDefault(require("./VCalendarCategory"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default = {
  $_vuetify_subcomponents: {
    VCalendar: _VCalendar.default,
    VCalendarCategory: _VCalendarCategory.default,
    VCalendarDaily: _VCalendarDaily.default,
    VCalendarWeekly: _VCalendarWeekly.default,
    VCalendarMonthly: _VCalendarMonthly.default
  }
};
exports.default = _default;
//# sourceMappingURL=index.js.map
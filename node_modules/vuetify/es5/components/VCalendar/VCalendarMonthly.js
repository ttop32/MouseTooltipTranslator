"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("../../../src/components/VCalendar/VCalendarWeekly.sass");

var _VCalendarWeekly2 = _interopRequireDefault(require("./VCalendarWeekly"));

var _timestamp = require("./util/timestamp");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Styles
// Mixins
// Util

/* @vue/component */
var _default = _VCalendarWeekly2.default.extend({
  name: 'v-calendar-monthly',
  computed: {
    staticClass: function staticClass() {
      return 'v-calendar-monthly v-calendar-weekly';
    },
    parsedStart: function parsedStart() {
      return (0, _timestamp.getStartOfMonth)((0, _timestamp.parseTimestamp)(this.start, true));
    },
    parsedEnd: function parsedEnd() {
      return (0, _timestamp.getEndOfMonth)((0, _timestamp.parseTimestamp)(this.end, true));
    }
  }
});

exports.default = _default;
//# sourceMappingURL=VCalendarMonthly.js.map
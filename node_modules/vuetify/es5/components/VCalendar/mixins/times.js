"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _vue = _interopRequireDefault(require("vue"));

var _timestamp = require("../util/timestamp");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default = _vue.default.extend({
  name: 'times',
  props: {
    now: {
      type: String,
      validator: _timestamp.validateTimestamp
    }
  },
  data: function data() {
    return {
      times: {
        now: (0, _timestamp.parseTimestamp)('0000-00-00 00:00', true),
        today: (0, _timestamp.parseTimestamp)('0000-00-00', true)
      }
    };
  },
  computed: {
    parsedNow: function parsedNow() {
      return this.now ? (0, _timestamp.parseTimestamp)(this.now, true) : null;
    }
  },
  watch: {
    parsedNow: 'updateTimes'
  },
  created: function created() {
    this.updateTimes();
    this.setPresent();
  },
  methods: {
    setPresent: function setPresent() {
      this.times.now.present = this.times.today.present = true;
      this.times.now.past = this.times.today.past = false;
      this.times.now.future = this.times.today.future = false;
    },
    updateTimes: function updateTimes() {
      var now = this.parsedNow || this.getNow();
      this.updateDay(now, this.times.now);
      this.updateTime(now, this.times.now);
      this.updateDay(now, this.times.today);
    },
    getNow: function getNow() {
      return (0, _timestamp.parseDate)(new Date());
    },
    updateDay: function updateDay(now, target) {
      if (now.date !== target.date) {
        target.year = now.year;
        target.month = now.month;
        target.day = now.day;
        target.weekday = now.weekday;
        target.date = now.date;
      }
    },
    updateTime: function updateTime(now, target) {
      if (now.time !== target.time) {
        target.hour = now.hour;
        target.minute = now.minute;
        target.time = now.time;
      }
    }
  }
});

exports.default = _default;
//# sourceMappingURL=times.js.map
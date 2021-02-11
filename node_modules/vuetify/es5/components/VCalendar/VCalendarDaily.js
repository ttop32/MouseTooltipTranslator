"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("../../../src/components/VCalendar/VCalendarDaily.sass");

var _resize = _interopRequireDefault(require("../../directives/resize"));

var _VBtn = _interopRequireDefault(require("../VBtn"));

var _calendarWithIntervals = _interopRequireDefault(require("./mixins/calendar-with-intervals"));

var _helpers = require("../../util/helpers");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/* @vue/component */
var _default = _calendarWithIntervals.default.extend({
  name: 'v-calendar-daily',
  directives: {
    Resize: _resize.default
  },
  data: function data() {
    return {
      scrollPush: 0
    };
  },
  computed: {
    classes: function classes() {
      return _objectSpread({
        'v-calendar-daily': true
      }, this.themeClasses);
    }
  },
  mounted: function mounted() {
    this.init();
  },
  methods: {
    init: function init() {
      this.$nextTick(this.onResize);
    },
    onResize: function onResize() {
      this.scrollPush = this.getScrollPush();
    },
    getScrollPush: function getScrollPush() {
      var area = this.$refs.scrollArea;
      var pane = this.$refs.pane;
      return area && pane ? area.offsetWidth - pane.offsetWidth : 0;
    },
    genHead: function genHead() {
      return this.$createElement('div', {
        staticClass: 'v-calendar-daily__head',
        style: {
          marginRight: this.scrollPush + 'px'
        }
      }, [this.genHeadIntervals()].concat(_toConsumableArray(this.genHeadDays())));
    },
    genHeadIntervals: function genHeadIntervals() {
      var width = (0, _helpers.convertToUnit)(this.intervalWidth);
      return this.$createElement('div', {
        staticClass: 'v-calendar-daily__intervals-head',
        style: {
          width: width
        }
      }, (0, _helpers.getSlot)(this, 'interval-header'));
    },
    genHeadDays: function genHeadDays() {
      return this.days.map(this.genHeadDay);
    },
    genHeadDay: function genHeadDay(day, index) {
      var _this = this;

      return this.$createElement('div', {
        key: day.date,
        staticClass: 'v-calendar-daily_head-day',
        class: this.getRelativeClasses(day),
        on: this.getDefaultMouseEventHandlers(':day', function (_e) {
          return _this.getSlotScope(day);
        })
      }, [this.genHeadWeekday(day), this.genHeadDayLabel(day)].concat(_toConsumableArray(this.genDayHeader(day, index))));
    },
    genDayHeader: function genDayHeader(day, index) {
      var _this2 = this;

      return (0, _helpers.getSlot)(this, 'day-header', function () {
        return _objectSpread({
          week: _this2.days
        }, day, {
          index: index
        });
      }) || [];
    },
    genHeadWeekday: function genHeadWeekday(day) {
      var color = day.present ? this.color : undefined;
      return this.$createElement('div', this.setTextColor(color, {
        staticClass: 'v-calendar-daily_head-weekday'
      }), this.weekdayFormatter(day, this.shortWeekdays));
    },
    genHeadDayLabel: function genHeadDayLabel(day) {
      return this.$createElement('div', {
        staticClass: 'v-calendar-daily_head-day-label'
      }, (0, _helpers.getSlot)(this, 'day-label-header', day) || [this.genHeadDayButton(day)]);
    },
    genHeadDayButton: function genHeadDayButton(day) {
      var color = day.present ? this.color : 'transparent';
      return this.$createElement(_VBtn.default, {
        props: {
          color: color,
          fab: true,
          depressed: true
        },
        on: this.getMouseEventHandlers({
          'click:date': {
            event: 'click',
            stop: true
          },
          'contextmenu:date': {
            event: 'contextmenu',
            stop: true,
            prevent: true,
            result: false
          }
        }, function (_e) {
          return day;
        })
      }, this.dayFormatter(day, false));
    },
    genBody: function genBody() {
      return this.$createElement('div', {
        staticClass: 'v-calendar-daily__body'
      }, [this.genScrollArea()]);
    },
    genScrollArea: function genScrollArea() {
      return this.$createElement('div', {
        ref: 'scrollArea',
        staticClass: 'v-calendar-daily__scroll-area'
      }, [this.genPane()]);
    },
    genPane: function genPane() {
      return this.$createElement('div', {
        ref: 'pane',
        staticClass: 'v-calendar-daily__pane',
        style: {
          height: (0, _helpers.convertToUnit)(this.bodyHeight)
        }
      }, [this.genDayContainer()]);
    },
    genDayContainer: function genDayContainer() {
      return this.$createElement('div', {
        staticClass: 'v-calendar-daily__day-container'
      }, [this.genBodyIntervals()].concat(_toConsumableArray(this.genDays())));
    },
    genDays: function genDays() {
      return this.days.map(this.genDay);
    },
    genDay: function genDay(day, index) {
      var _this3 = this;

      return this.$createElement('div', {
        key: day.date,
        staticClass: 'v-calendar-daily__day',
        class: this.getRelativeClasses(day),
        on: this.getDefaultMouseEventHandlers(':time', function (e) {
          return _this3.getSlotScope(_this3.getTimestampAtEvent(e, day));
        })
      }, [].concat(_toConsumableArray(this.genDayIntervals(index)), _toConsumableArray(this.genDayBody(day))));
    },
    genDayBody: function genDayBody(day) {
      var _this4 = this;

      return (0, _helpers.getSlot)(this, 'day-body', function () {
        return _this4.getSlotScope(day);
      }) || [];
    },
    genDayIntervals: function genDayIntervals(index) {
      return this.intervals[index].map(this.genDayInterval);
    },
    genDayInterval: function genDayInterval(interval) {
      var _this5 = this;

      var height = (0, _helpers.convertToUnit)(this.intervalHeight);
      var styler = this.intervalStyle || this.intervalStyleDefault;
      var data = {
        key: interval.time,
        staticClass: 'v-calendar-daily__day-interval',
        style: _objectSpread({
          height: height
        }, styler(interval))
      };
      var children = (0, _helpers.getSlot)(this, 'interval', function () {
        return _this5.getSlotScope(interval);
      });
      return this.$createElement('div', data, children);
    },
    genBodyIntervals: function genBodyIntervals() {
      var _this6 = this;

      var width = (0, _helpers.convertToUnit)(this.intervalWidth);
      var data = {
        staticClass: 'v-calendar-daily__intervals-body',
        style: {
          width: width
        },
        on: this.getDefaultMouseEventHandlers(':interval', function (e) {
          return _this6.getTimestampAtEvent(e, _this6.parsedStart);
        })
      };
      return this.$createElement('div', data, this.genIntervalLabels());
    },
    genIntervalLabels: function genIntervalLabels() {
      if (!this.intervals.length) return null;
      return this.intervals[0].map(this.genIntervalLabel);
    },
    genIntervalLabel: function genIntervalLabel(interval) {
      var height = (0, _helpers.convertToUnit)(this.intervalHeight);
      var short = this.shortIntervals;
      var shower = this.showIntervalLabel || this.showIntervalLabelDefault;
      var show = shower(interval);
      var label = show ? this.intervalFormatter(interval, short) : undefined;
      return this.$createElement('div', {
        key: interval.time,
        staticClass: 'v-calendar-daily__interval',
        style: {
          height: height
        }
      }, [this.$createElement('div', {
        staticClass: 'v-calendar-daily__interval-text'
      }, label)]);
    }
  },
  render: function render(h) {
    return h('div', {
      class: this.classes,
      on: {
        dragstart: function dragstart(e) {
          e.preventDefault();
        }
      },
      directives: [{
        modifiers: {
          quiet: true
        },
        name: 'resize',
        value: this.onResize
      }]
    }, [!this.hideHeader ? this.genHead() : '', this.genBody()]);
  }
});

exports.default = _default;
//# sourceMappingURL=VCalendarDaily.js.map
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("../../../src/components/VCalendar/VCalendarCategory.sass");

var _VCalendarDaily = _interopRequireDefault(require("./VCalendarDaily"));

var _helpers = require("../../util/helpers");

var _props = _interopRequireDefault(require("./util/props"));

var _parser = require("./util/parser");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/* @vue/component */
var _default = _VCalendarDaily.default.extend({
  name: 'v-calendar-category',
  props: _props.default.category,
  computed: {
    classes: function classes() {
      return _objectSpread({
        'v-calendar-daily': true,
        'v-calendar-category': true
      }, this.themeClasses);
    },
    parsedCategories: function parsedCategories() {
      return (0, _parser.getParsedCategories)(this.categories, this.categoryText);
    }
  },
  methods: {
    genDayHeader: function genDayHeader(day, index) {
      var _this = this;

      var data = {
        staticClass: 'v-calendar-category__columns'
      };

      var scope = _objectSpread({
        week: this.days
      }, day, {
        index: index
      });

      var children = this.parsedCategories.map(function (category) {
        return _this.genDayHeaderCategory(day, _this.getCategoryScope(scope, category));
      });
      return [this.$createElement('div', data, children)];
    },
    getCategoryScope: function getCategoryScope(scope, category) {
      var cat = _typeof(category) === 'object' && category && category.categoryName === this.categoryForInvalid ? null : category;
      return _objectSpread({}, scope, {
        category: cat
      });
    },
    genDayHeaderCategory: function genDayHeaderCategory(day, scope) {
      var _this2 = this;

      return this.$createElement('div', {
        staticClass: 'v-calendar-category__column-header',
        on: this.getDefaultMouseEventHandlers(':day-category', function (e) {
          return _this2.getCategoryScope(_this2.getSlotScope(day), scope.category);
        })
      }, [(0, _helpers.getSlot)(this, 'category', scope) || this.genDayHeaderCategoryTitle(scope.category && scope.category.categoryName), (0, _helpers.getSlot)(this, 'day-header', scope)]);
    },
    genDayHeaderCategoryTitle: function genDayHeaderCategoryTitle(categoryName) {
      return this.$createElement('div', {
        staticClass: 'v-calendar-category__category'
      }, categoryName === null ? this.categoryForInvalid : categoryName);
    },
    genDays: function genDays() {
      var _this3 = this;

      var d = this.days[0];
      var days = this.days.slice();
      days = new Array(this.parsedCategories.length);
      days.fill(d);
      return days.map(function (v, i) {
        return _this3.genDay(v, 0, i);
      });
    },
    genDay: function genDay(day, index, categoryIndex) {
      var _this4 = this;

      var category = this.parsedCategories[categoryIndex];
      return this.$createElement('div', {
        key: day.date + '-' + categoryIndex,
        staticClass: 'v-calendar-daily__day',
        class: this.getRelativeClasses(day),
        on: this.getDefaultMouseEventHandlers(':time', function (e) {
          return _this4.getSlotScope(_this4.getTimestampAtEvent(e, day));
        })
      }, [].concat(_toConsumableArray(this.genDayIntervals(index, category)), _toConsumableArray(this.genDayBody(day, category))));
    },
    genDayIntervals: function genDayIntervals(index, category) {
      var _this5 = this;

      return this.intervals[index].map(function (v) {
        return _this5.genDayInterval(v, category);
      });
    },
    genDayInterval: function genDayInterval(interval, category) {
      var _this6 = this;

      var height = (0, _helpers.convertToUnit)(this.intervalHeight);
      var styler = this.intervalStyle || this.intervalStyleDefault;
      var data = {
        key: interval.time,
        staticClass: 'v-calendar-daily__day-interval',
        style: _objectSpread({
          height: height
        }, styler(_objectSpread({}, interval, {
          category: category
        })))
      };
      var children = (0, _helpers.getSlot)(this, 'interval', function () {
        return _this6.getCategoryScope(_this6.getSlotScope(interval), category);
      });
      return this.$createElement('div', data, children);
    },
    genDayBody: function genDayBody(day, category) {
      var data = {
        staticClass: 'v-calendar-category__columns'
      };
      var children = [this.genDayBodyCategory(day, category)];
      return [this.$createElement('div', data, children)];
    },
    genDayBodyCategory: function genDayBodyCategory(day, category) {
      var _this7 = this;

      var data = {
        staticClass: 'v-calendar-category__column',
        on: this.getDefaultMouseEventHandlers(':time-category', function (e) {
          return _this7.getCategoryScope(_this7.getSlotScope(_this7.getTimestampAtEvent(e, day)), category);
        })
      };
      var children = (0, _helpers.getSlot)(this, 'day-body', function () {
        return _this7.getCategoryScope(_this7.getSlotScope(day), category);
      });
      return this.$createElement('div', data, children);
    }
  }
});

exports.default = _default;
//# sourceMappingURL=VCalendarCategory.js.map
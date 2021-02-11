"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("../../../src/components/VDatePicker/VDatePickerYears.sass");

var _colorable = _interopRequireDefault(require("../../mixins/colorable"));

var _localable = _interopRequireDefault(require("../../mixins/localable"));

var _util = require("./util");

var _mergeData = require("../../util/mergeData");

var _mixins = _interopRequireDefault(require("../../util/mixins"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Mixins
// Utils
var _default = (0, _mixins.default)(_colorable.default, _localable.default
/* @vue/component */
).extend({
  name: 'v-date-picker-years',
  props: {
    format: Function,
    min: [Number, String],
    max: [Number, String],
    readonly: Boolean,
    value: [Number, String]
  },
  data: function data() {
    return {
      defaultColor: 'primary'
    };
  },
  computed: {
    formatter: function formatter() {
      return this.format || (0, _util.createNativeLocaleFormatter)(this.currentLocale, {
        year: 'numeric',
        timeZone: 'UTC'
      }, {
        length: 4
      });
    }
  },
  mounted: function mounted() {
    var _this = this;

    setTimeout(function () {
      var activeItem = _this.$el.getElementsByClassName('active')[0];

      if (activeItem) {
        _this.$el.scrollTop = activeItem.offsetTop - _this.$el.offsetHeight / 2 + activeItem.offsetHeight / 2;
      } else if (_this.min && !_this.max) {
        _this.$el.scrollTop = _this.$el.scrollHeight;
      } else if (!_this.min && _this.max) {
        _this.$el.scrollTop = 0;
      } else {
        _this.$el.scrollTop = _this.$el.scrollHeight / 2 - _this.$el.offsetHeight / 2;
      }
    });
  },
  methods: {
    genYearItem: function genYearItem(year) {
      var _this2 = this;

      var formatted = this.formatter("".concat(year));
      var active = parseInt(this.value, 10) === year;
      var color = active && (this.color || 'primary');
      return this.$createElement('li', this.setTextColor(color, {
        key: year,
        class: {
          active: active
        },
        on: (0, _mergeData.mergeListeners)({
          click: function click() {
            return _this2.$emit('input', year);
          }
        }, (0, _util.createItemTypeNativeListeners)(this, ':year', year))
      }), formatted);
    },
    genYearItems: function genYearItems() {
      var children = [];
      var selectedYear = this.value ? parseInt(this.value, 10) : new Date().getFullYear();
      var maxYear = this.max ? parseInt(this.max, 10) : selectedYear + 100;
      var minYear = Math.min(maxYear, this.min ? parseInt(this.min, 10) : selectedYear - 100);

      for (var year = maxYear; year >= minYear; year--) {
        children.push(this.genYearItem(year));
      }

      return children;
    }
  },
  render: function render() {
    return this.$createElement('ul', {
      staticClass: 'v-date-picker-years',
      ref: 'years'
    }, this.genYearItems());
  }
});

exports.default = _default;
//# sourceMappingURL=VDatePickerYears.js.map
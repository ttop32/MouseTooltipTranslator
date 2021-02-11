"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _datePickerTable = _interopRequireDefault(require("./mixins/date-picker-table"));

var _util = require("./util");

var _mixins = _interopRequireDefault(require("../../util/mixins"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Mixins
// Utils
var _default = (0, _mixins.default)(_datePickerTable.default
/* @vue/component */
).extend({
  name: 'v-date-picker-month-table',
  computed: {
    formatter: function formatter() {
      return this.format || (0, _util.createNativeLocaleFormatter)(this.currentLocale, {
        month: 'short',
        timeZone: 'UTC'
      }, {
        start: 5,
        length: 2
      });
    }
  },
  methods: {
    calculateTableDate: function calculateTableDate(delta) {
      return "".concat(parseInt(this.tableDate, 10) + Math.sign(delta || 1));
    },
    genTBody: function genTBody() {
      var _this = this;

      var children = [];
      var cols = Array(3).fill(null);
      var rows = 12 / cols.length;

      var _loop = function _loop(row) {
        var tds = cols.map(function (_, col) {
          var month = row * cols.length + col;
          var date = "".concat(_this.displayedYear, "-").concat((0, _util.pad)(month + 1));
          return _this.$createElement('td', {
            key: month
          }, [_this.genButton(date, false, 'month', _this.formatter)]);
        });
        children.push(_this.$createElement('tr', {
          key: row
        }, tds));
      };

      for (var row = 0; row < rows; row++) {
        _loop(row);
      }

      return this.$createElement('tbody', children);
    }
  },
  render: function render() {
    return this.genTable('v-date-picker-table v-date-picker-table--month', [this.genTBody()], this.calculateTableDate);
  }
});

exports.default = _default;
//# sourceMappingURL=VDatePickerMonthTable.js.map
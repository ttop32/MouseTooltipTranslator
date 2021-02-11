"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _VIcon = _interopRequireDefault(require("../../VIcon"));

var _VSimpleCheckbox = _interopRequireDefault(require("../../VCheckbox/VSimpleCheckbox"));

var _ripple = _interopRequireDefault(require("../../../directives/ripple"));

var _mixins = _interopRequireDefault(require("../../../util/mixins"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _default2 = (0, _mixins.default)().extend({
  // https://github.com/vuejs/vue/issues/6872
  directives: {
    ripple: _ripple.default
  },
  props: {
    headers: {
      type: Array,
      default: function _default() {
        return [];
      }
    },
    options: {
      type: Object,
      default: function _default() {
        return {
          page: 1,
          itemsPerPage: 10,
          sortBy: [],
          sortDesc: [],
          groupBy: [],
          groupDesc: [],
          multiSort: false,
          mustSort: false
        };
      }
    },
    sortIcon: {
      type: String,
      default: '$sort'
    },
    everyItem: Boolean,
    someItems: Boolean,
    showGroupBy: Boolean,
    singleSelect: Boolean,
    disableSort: Boolean
  },
  methods: {
    genSelectAll: function genSelectAll() {
      var _this = this;

      var data = {
        props: {
          value: this.everyItem,
          indeterminate: !this.everyItem && this.someItems
        },
        on: {
          input: function input(v) {
            return _this.$emit('toggle-select-all', v);
          }
        }
      };

      if (this.$scopedSlots['data-table-select']) {
        return this.$scopedSlots['data-table-select'](data);
      }

      return this.$createElement(_VSimpleCheckbox.default, _objectSpread({
        staticClass: 'v-data-table__checkbox'
      }, data));
    },
    genSortIcon: function genSortIcon() {
      return this.$createElement(_VIcon.default, {
        staticClass: 'v-data-table-header__icon',
        props: {
          size: 18
        }
      }, [this.sortIcon]);
    }
  }
});

exports.default = _default2;
//# sourceMappingURL=header.js.map
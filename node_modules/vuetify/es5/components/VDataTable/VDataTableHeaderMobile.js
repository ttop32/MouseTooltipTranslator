"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _mixins = _interopRequireDefault(require("../../util/mixins"));

var _VSelect = _interopRequireDefault(require("../VSelect/VSelect"));

var _VChip = _interopRequireDefault(require("../VChip"));

var _header = _interopRequireDefault(require("./mixins/header"));

var _helpers = require("../../util/helpers");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

var _default = (0, _mixins.default)(_header.default).extend({
  name: 'v-data-table-header-mobile',
  props: {
    sortByText: {
      type: String,
      default: '$vuetify.dataTable.sortBy'
    }
  },
  methods: {
    genSortChip: function genSortChip(props) {
      var _this = this;

      var children = [props.item.text];
      var sortIndex = this.options.sortBy.findIndex(function (k) {
        return k === props.item.value;
      });
      var beingSorted = sortIndex >= 0;
      var isDesc = this.options.sortDesc[sortIndex];
      children.push(this.$createElement('div', {
        staticClass: 'v-chip__close',
        class: {
          sortable: true,
          active: beingSorted,
          asc: beingSorted && !isDesc,
          desc: beingSorted && isDesc
        }
      }, [this.genSortIcon()]));
      return this.$createElement(_VChip.default, {
        staticClass: 'sortable',
        on: {
          click: function click(e) {
            e.stopPropagation();

            _this.$emit('sort', props.item.value);
          }
        }
      }, children);
    },
    genSortSelect: function genSortSelect(items) {
      var _this2 = this;

      return this.$createElement(_VSelect.default, {
        props: {
          label: this.$vuetify.lang.t(this.sortByText),
          items: items,
          hideDetails: true,
          multiple: this.options.multiSort,
          value: this.options.multiSort ? this.options.sortBy : this.options.sortBy[0],
          menuProps: {
            closeOnContentClick: true
          }
        },
        on: {
          change: function change(v) {
            return _this2.$emit('sort', v);
          }
        },
        scopedSlots: {
          selection: function selection(props) {
            return _this2.genSortChip(props);
          }
        }
      });
    }
  },
  render: function render(h) {
    var children = [];
    var header = this.headers.find(function (h) {
      return h.value === 'data-table-select';
    });

    if (header && !this.singleSelect) {
      children.push(this.$createElement('div', {
        class: ['v-data-table-header-mobile__select'].concat(_toConsumableArray((0, _helpers.wrapInArray)(header.class))),
        attrs: {
          width: header.width
        }
      }, [this.genSelectAll()]));
    }

    var sortHeaders = this.headers.filter(function (h) {
      return h.sortable !== false && h.value !== 'data-table-select';
    }).map(function (h) {
      return {
        text: h.text,
        value: h.value
      };
    });

    if (!this.disableSort && sortHeaders.length) {
      children.push(this.genSortSelect(sortHeaders));
    }

    var th = h('th', [h('div', {
      staticClass: 'v-data-table-header-mobile__wrapper'
    }, children)]);
    var tr = h('tr', [th]);
    return h('thead', {
      staticClass: 'v-data-table-header v-data-table-header-mobile'
    }, [tr]);
  }
});

exports.default = _default;
//# sourceMappingURL=VDataTableHeaderMobile.js.map
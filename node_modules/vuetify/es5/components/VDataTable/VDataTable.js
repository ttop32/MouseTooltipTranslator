"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("../../../src/components/VDataTable/VDataTable.sass");

var _VData = require("../VData");

var _VDataIterator = require("../VDataIterator");

var _VBtn = _interopRequireDefault(require("../VBtn"));

var _VDataTableHeader = _interopRequireDefault(require("./VDataTableHeader"));

var _VIcon = _interopRequireDefault(require("../VIcon"));

var _Row = _interopRequireDefault(require("./Row"));

var _RowGroup = _interopRequireDefault(require("./RowGroup"));

var _VSimpleCheckbox = _interopRequireDefault(require("../VCheckbox/VSimpleCheckbox"));

var _VSimpleTable = _interopRequireDefault(require("./VSimpleTable"));

var _MobileRow = _interopRequireDefault(require("./MobileRow"));

var _loadable = _interopRequireDefault(require("../../mixins/loadable"));

var _ripple = _interopRequireDefault(require("../../directives/ripple"));

var _mixins = _interopRequireDefault(require("../../util/mixins"));

var _helpers = require("../../util/helpers");

var _console = require("../../util/console");

var _mergeData = require("../../util/mergeData");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function filterFn(item, search, filter) {
  return function (header) {
    var value = (0, _helpers.getObjectValueByPath)(item, header.value);
    return header.filter ? header.filter(value, search, item) : filter(value, search, item);
  };
}

function searchTableItems(items, search, headersWithCustomFilters, headersWithoutCustomFilters, customFilter) {
  search = typeof search === 'string' ? search.trim() : null;
  return items.filter(function (item) {
    // Headers with custom filters are evaluated whether or not a search term has been provided.
    // We need to match every filter to be included in the results.
    var matchesColumnFilters = headersWithCustomFilters.every(filterFn(item, search, _helpers.defaultFilter)); // Headers without custom filters are only filtered by the `search` property if it is defined.
    // We only need a single column to match the search term to be included in the results.

    var matchesSearchTerm = !search || headersWithoutCustomFilters.some(filterFn(item, search, customFilter));
    return matchesColumnFilters && matchesSearchTerm;
  });
}
/* @vue/component */


var _default2 = (0, _mixins.default)(_VDataIterator.VDataIterator, _loadable.default).extend({
  name: 'v-data-table',
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
    showSelect: Boolean,
    showExpand: Boolean,
    showGroupBy: Boolean,
    // TODO: Fix
    // virtualRows: Boolean,
    height: [Number, String],
    hideDefaultHeader: Boolean,
    caption: String,
    dense: Boolean,
    headerProps: Object,
    calculateWidths: Boolean,
    fixedHeader: Boolean,
    headersLength: Number,
    expandIcon: {
      type: String,
      default: '$expand'
    },
    customFilter: {
      type: Function,
      default: _helpers.defaultFilter
    },
    itemClass: {
      type: [String, Function],
      default: function _default() {
        return '';
      }
    },
    loaderHeight: {
      type: [Number, String],
      default: 4
    }
  },
  data: function data() {
    return {
      internalGroupBy: [],
      openCache: {},
      widths: []
    };
  },
  computed: {
    computedHeaders: function computedHeaders() {
      var _this = this;

      if (!this.headers) return [];
      var headers = this.headers.filter(function (h) {
        return h.value === undefined || !_this.internalGroupBy.find(function (v) {
          return v === h.value;
        });
      });
      var defaultHeader = {
        text: '',
        sortable: false,
        width: '1px'
      };

      if (this.showSelect) {
        var index = headers.findIndex(function (h) {
          return h.value === 'data-table-select';
        });
        if (index < 0) headers.unshift(_objectSpread({}, defaultHeader, {
          value: 'data-table-select'
        }));else headers.splice(index, 1, _objectSpread({}, defaultHeader, {}, headers[index]));
      }

      if (this.showExpand) {
        var _index = headers.findIndex(function (h) {
          return h.value === 'data-table-expand';
        });

        if (_index < 0) headers.unshift(_objectSpread({}, defaultHeader, {
          value: 'data-table-expand'
        }));else headers.splice(_index, 1, _objectSpread({}, defaultHeader, {}, headers[_index]));
      }

      return headers;
    },
    colspanAttrs: function colspanAttrs() {
      return this.isMobile ? undefined : {
        colspan: this.headersLength || this.computedHeaders.length
      };
    },
    columnSorters: function columnSorters() {
      return this.computedHeaders.reduce(function (acc, header) {
        if (header.sort) acc[header.value] = header.sort;
        return acc;
      }, {});
    },
    headersWithCustomFilters: function headersWithCustomFilters() {
      return this.headers.filter(function (header) {
        return header.filter && (!header.hasOwnProperty('filterable') || header.filterable === true);
      });
    },
    headersWithoutCustomFilters: function headersWithoutCustomFilters() {
      return this.headers.filter(function (header) {
        return !header.filter && (!header.hasOwnProperty('filterable') || header.filterable === true);
      });
    },
    sanitizedHeaderProps: function sanitizedHeaderProps() {
      return (0, _helpers.camelizeObjectKeys)(this.headerProps);
    },
    computedItemsPerPage: function computedItemsPerPage() {
      var itemsPerPage = this.options && this.options.itemsPerPage ? this.options.itemsPerPage : this.itemsPerPage;
      var itemsPerPageOptions = this.sanitizedFooterProps.itemsPerPageOptions;

      if (itemsPerPageOptions && !itemsPerPageOptions.find(function (item) {
        return typeof item === 'number' ? item === itemsPerPage : item.value === itemsPerPage;
      })) {
        var firstOption = itemsPerPageOptions[0];
        return _typeof(firstOption) === 'object' ? firstOption.value : firstOption;
      }

      return itemsPerPage;
    }
  },
  created: function created() {
    var _this2 = this;

    var breakingProps = [['sort-icon', 'header-props.sort-icon'], ['hide-headers', 'hide-default-header'], ['select-all', 'show-select']];
    /* istanbul ignore next */

    breakingProps.forEach(function (_ref) {
      var _ref2 = _slicedToArray(_ref, 2),
          original = _ref2[0],
          replacement = _ref2[1];

      if (_this2.$attrs.hasOwnProperty(original)) (0, _console.breaking)(original, replacement, _this2);
    });
  },
  mounted: function mounted() {
    // if ((!this.sortBy || !this.sortBy.length) && (!this.options.sortBy || !this.options.sortBy.length)) {
    //   const firstSortable = this.headers.find(h => !('sortable' in h) || !!h.sortable)
    //   if (firstSortable) this.updateOptions({ sortBy: [firstSortable.value], sortDesc: [false] })
    // }
    if (this.calculateWidths) {
      window.addEventListener('resize', this.calcWidths);
      this.calcWidths();
    }
  },
  beforeDestroy: function beforeDestroy() {
    if (this.calculateWidths) {
      window.removeEventListener('resize', this.calcWidths);
    }
  },
  methods: {
    calcWidths: function calcWidths() {
      this.widths = Array.from(this.$el.querySelectorAll('th')).map(function (e) {
        return e.clientWidth;
      });
    },
    customFilterWithColumns: function customFilterWithColumns(items, search) {
      return searchTableItems(items, search, this.headersWithCustomFilters, this.headersWithoutCustomFilters, this.customFilter);
    },
    customSortWithHeaders: function customSortWithHeaders(items, sortBy, sortDesc, locale) {
      return this.customSort(items, sortBy, sortDesc, locale, this.columnSorters);
    },
    createItemProps: function createItemProps(item, index) {
      var props = _VDataIterator.VDataIterator.options.methods.createItemProps.call(this, item, index);

      return Object.assign(props, {
        headers: this.computedHeaders
      });
    },
    genCaption: function genCaption(props) {
      if (this.caption) return [this.$createElement('caption', [this.caption])];
      return (0, _helpers.getSlot)(this, 'caption', props, true);
    },
    genColgroup: function genColgroup(props) {
      var _this3 = this;

      return this.$createElement('colgroup', this.computedHeaders.map(function (header) {
        return _this3.$createElement('col', {
          class: {
            divider: header.divider
          }
        });
      }));
    },
    genLoading: function genLoading() {
      var th = this.$createElement('th', {
        staticClass: 'column',
        attrs: this.colspanAttrs
      }, [this.genProgress()]);
      var tr = this.$createElement('tr', {
        staticClass: 'v-data-table__progress'
      }, [th]);
      return this.$createElement('thead', [tr]);
    },
    genHeaders: function genHeaders(props) {
      var data = {
        props: _objectSpread({}, this.sanitizedHeaderProps, {
          headers: this.computedHeaders,
          options: props.options,
          mobile: this.isMobile,
          showGroupBy: this.showGroupBy,
          someItems: this.someItems,
          everyItem: this.everyItem,
          singleSelect: this.singleSelect,
          disableSort: this.disableSort
        }),
        on: {
          sort: props.sort,
          group: props.group,
          'toggle-select-all': this.toggleSelectAll
        }
      };
      var children = [(0, _helpers.getSlot)(this, 'header', _objectSpread({}, data, {
        isMobile: this.isMobile
      }))];

      if (!this.hideDefaultHeader) {
        var scopedSlots = (0, _helpers.getPrefixedScopedSlots)('header.', this.$scopedSlots);
        children.push(this.$createElement(_VDataTableHeader.default, _objectSpread({}, data, {
          scopedSlots: scopedSlots
        })));
      }

      if (this.loading) children.push(this.genLoading());
      return children;
    },
    genEmptyWrapper: function genEmptyWrapper(content) {
      return this.$createElement('tr', {
        staticClass: 'v-data-table__empty-wrapper'
      }, [this.$createElement('td', {
        attrs: this.colspanAttrs
      }, content)]);
    },
    genItems: function genItems(items, props) {
      var empty = this.genEmpty(props.originalItemsLength, props.pagination.itemsLength);
      if (empty) return [empty];
      return props.groupedItems ? this.genGroupedRows(props.groupedItems, props) : this.genRows(items, props);
    },
    genGroupedRows: function genGroupedRows(groupedItems, props) {
      var _this4 = this;

      return groupedItems.map(function (group) {
        if (!_this4.openCache.hasOwnProperty(group.name)) _this4.$set(_this4.openCache, group.name, true);

        if (_this4.$scopedSlots.group) {
          return _this4.$scopedSlots.group({
            group: group.name,
            options: props.options,
            isMobile: _this4.isMobile,
            items: group.items,
            headers: _this4.computedHeaders
          });
        } else {
          return _this4.genDefaultGroupedRow(group.name, group.items, props);
        }
      });
    },
    genDefaultGroupedRow: function genDefaultGroupedRow(group, items, props) {
      var _this5 = this;

      var isOpen = !!this.openCache[group];
      var children = [this.$createElement('template', {
        slot: 'row.content'
      }, this.genRows(items, props))];

      var toggleFn = function toggleFn() {
        return _this5.$set(_this5.openCache, group, !_this5.openCache[group]);
      };

      var removeFn = function removeFn() {
        return props.updateOptions({
          groupBy: [],
          groupDesc: []
        });
      };

      if (this.$scopedSlots['group.header']) {
        children.unshift(this.$createElement('template', {
          slot: 'column.header'
        }, [this.$scopedSlots['group.header']({
          group: group,
          groupBy: props.options.groupBy,
          isMobile: this.isMobile,
          items: items,
          headers: this.computedHeaders,
          isOpen: isOpen,
          toggle: toggleFn,
          remove: removeFn
        })]));
      } else {
        var toggle = this.$createElement(_VBtn.default, {
          staticClass: 'ma-0',
          props: {
            icon: true,
            small: true
          },
          on: {
            click: toggleFn
          }
        }, [this.$createElement(_VIcon.default, [isOpen ? '$minus' : '$plus'])]);
        var remove = this.$createElement(_VBtn.default, {
          staticClass: 'ma-0',
          props: {
            icon: true,
            small: true
          },
          on: {
            click: removeFn
          }
        }, [this.$createElement(_VIcon.default, ['$close'])]);
        var column = this.$createElement('td', {
          staticClass: 'text-start',
          attrs: this.colspanAttrs
        }, [toggle, "".concat(props.options.groupBy[0], ": ").concat(group), remove]);
        children.unshift(this.$createElement('template', {
          slot: 'column.header'
        }, [column]));
      }

      if (this.$scopedSlots['group.summary']) {
        children.push(this.$createElement('template', {
          slot: 'column.summary'
        }, [this.$scopedSlots['group.summary']({
          group: group,
          groupBy: props.options.groupBy,
          isMobile: this.isMobile,
          items: items,
          headers: this.computedHeaders,
          isOpen: isOpen,
          toggle: toggleFn
        })]));
      }

      return this.$createElement(_RowGroup.default, {
        key: group,
        props: {
          value: isOpen
        }
      }, children);
    },
    genRows: function genRows(items, props) {
      return this.$scopedSlots.item ? this.genScopedRows(items, props) : this.genDefaultRows(items, props);
    },
    genScopedRows: function genScopedRows(items, props) {
      var rows = [];

      for (var i = 0; i < items.length; i++) {
        var item = items[i];
        rows.push(this.$scopedSlots.item(_objectSpread({}, this.createItemProps(item, i), {
          isMobile: this.isMobile
        })));

        if (this.isExpanded(item)) {
          rows.push(this.$scopedSlots['expanded-item']({
            headers: this.computedHeaders,
            isMobile: this.isMobile,
            index: i,
            item: item
          }));
        }
      }

      return rows;
    },
    genDefaultRows: function genDefaultRows(items, props) {
      var _this6 = this;

      return this.$scopedSlots['expanded-item'] ? items.map(function (item, index) {
        return _this6.genDefaultExpandedRow(item, index);
      }) : items.map(function (item, index) {
        return _this6.genDefaultSimpleRow(item, index);
      });
    },
    genDefaultExpandedRow: function genDefaultExpandedRow(item, index) {
      var isExpanded = this.isExpanded(item);
      var classes = {
        'v-data-table__expanded v-data-table__expanded__row': isExpanded
      };
      var headerRow = this.genDefaultSimpleRow(item, index, classes);
      var expandedRow = this.$createElement('tr', {
        staticClass: 'v-data-table__expanded v-data-table__expanded__content'
      }, [this.$scopedSlots['expanded-item']({
        headers: this.computedHeaders,
        isMobile: this.isMobile,
        item: item
      })]);
      return this.$createElement(_RowGroup.default, {
        props: {
          value: isExpanded
        }
      }, [this.$createElement('template', {
        slot: 'row.header'
      }, [headerRow]), this.$createElement('template', {
        slot: 'row.content'
      }, [expandedRow])]);
    },
    genDefaultSimpleRow: function genDefaultSimpleRow(item, index) {
      var _this7 = this;

      var classes = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
      var scopedSlots = (0, _helpers.getPrefixedScopedSlots)('item.', this.$scopedSlots);
      var data = this.createItemProps(item, index);

      if (this.showSelect) {
        var slot = scopedSlots['data-table-select'];
        scopedSlots['data-table-select'] = slot ? function () {
          return slot(_objectSpread({}, data, {
            isMobile: _this7.isMobile
          }));
        } : function () {
          return _this7.$createElement(_VSimpleCheckbox.default, {
            staticClass: 'v-data-table__checkbox',
            props: {
              value: data.isSelected,
              disabled: !_this7.isSelectable(item)
            },
            on: {
              input: function input(val) {
                return data.select(val);
              }
            }
          });
        };
      }

      if (this.showExpand) {
        var _slot = scopedSlots['data-table-expand'];
        scopedSlots['data-table-expand'] = _slot ? function () {
          return _slot(data);
        } : function () {
          return _this7.$createElement(_VIcon.default, {
            staticClass: 'v-data-table__expand-icon',
            class: {
              'v-data-table__expand-icon--active': data.isExpanded
            },
            on: {
              click: function click(e) {
                e.stopPropagation();
                data.expand(!data.isExpanded);
              }
            }
          }, [_this7.expandIcon]);
        };
      }

      return this.$createElement(this.isMobile ? _MobileRow.default : _Row.default, {
        key: (0, _helpers.getObjectValueByPath)(item, this.itemKey),
        class: (0, _mergeData.mergeClasses)(_objectSpread({}, classes, {
          'v-data-table__selected': data.isSelected
        }), (0, _helpers.getPropertyFromItem)(item, this.itemClass)),
        props: {
          headers: this.computedHeaders,
          hideDefaultHeader: this.hideDefaultHeader,
          index: index,
          item: item,
          rtl: this.$vuetify.rtl
        },
        scopedSlots: scopedSlots,
        on: {
          // TODO: for click, the first argument should be the event, and the second argument should be data,
          // but this is a breaking change so it's for v3
          click: function click() {
            return _this7.$emit('click:row', item, data);
          },
          contextmenu: function contextmenu(event) {
            return _this7.$emit('contextmenu:row', event, data);
          },
          dblclick: function dblclick(event) {
            return _this7.$emit('dblclick:row', event, data);
          }
        }
      });
    },
    genBody: function genBody(props) {
      var data = _objectSpread({}, props, {
        expand: this.expand,
        headers: this.computedHeaders,
        isExpanded: this.isExpanded,
        isMobile: this.isMobile,
        isSelected: this.isSelected,
        select: this.select
      });

      if (this.$scopedSlots.body) {
        return this.$scopedSlots.body(data);
      }

      return this.$createElement('tbody', [(0, _helpers.getSlot)(this, 'body.prepend', data, true), this.genItems(props.items, props), (0, _helpers.getSlot)(this, 'body.append', data, true)]);
    },
    genFooters: function genFooters(props) {
      var data = {
        props: _objectSpread({
          options: props.options,
          pagination: props.pagination,
          itemsPerPageText: '$vuetify.dataTable.itemsPerPageText'
        }, this.sanitizedFooterProps),
        on: {
          'update:options': function updateOptions(value) {
            return props.updateOptions(value);
          }
        },
        widths: this.widths,
        headers: this.computedHeaders
      };
      var children = [(0, _helpers.getSlot)(this, 'footer', data, true)];

      if (!this.hideDefaultFooter) {
        children.push(this.$createElement(_VDataIterator.VDataFooter, _objectSpread({}, data, {
          scopedSlots: (0, _helpers.getPrefixedScopedSlots)('footer.', this.$scopedSlots)
        })));
      }

      return children;
    },
    genDefaultScopedSlot: function genDefaultScopedSlot(props) {
      var simpleProps = {
        height: this.height,
        fixedHeader: this.fixedHeader,
        dense: this.dense
      }; // if (this.virtualRows) {
      //   return this.$createElement(VVirtualTable, {
      //     props: Object.assign(simpleProps, {
      //       items: props.items,
      //       height: this.height,
      //       rowHeight: this.dense ? 24 : 48,
      //       headerHeight: this.dense ? 32 : 48,
      //       // TODO: expose rest of props from virtual table?
      //     }),
      //     scopedSlots: {
      //       items: ({ items }) => this.genItems(items, props) as any,
      //     },
      //   }, [
      //     this.proxySlot('body.before', [this.genCaption(props), this.genHeaders(props)]),
      //     this.proxySlot('bottom', this.genFooters(props)),
      //   ])
      // }

      return this.$createElement(_VSimpleTable.default, {
        props: simpleProps
      }, [this.proxySlot('top', (0, _helpers.getSlot)(this, 'top', _objectSpread({}, props, {
        isMobile: this.isMobile
      }), true)), this.genCaption(props), this.genColgroup(props), this.genHeaders(props), this.genBody(props), this.proxySlot('bottom', this.genFooters(props))]);
    },
    proxySlot: function proxySlot(slot, content) {
      return this.$createElement('template', {
        slot: slot
      }, content);
    }
  },
  render: function render() {
    var _this8 = this;

    return this.$createElement(_VData.VData, {
      props: _objectSpread({}, this.$props, {
        customFilter: this.customFilterWithColumns,
        customSort: this.customSortWithHeaders,
        itemsPerPage: this.computedItemsPerPage
      }),
      on: {
        'update:options': function updateOptions(v, old) {
          _this8.internalGroupBy = v.groupBy || [];
          !(0, _helpers.deepEqual)(v, old) && _this8.$emit('update:options', v);
        },
        'update:page': function updatePage(v) {
          return _this8.$emit('update:page', v);
        },
        'update:items-per-page': function updateItemsPerPage(v) {
          return _this8.$emit('update:items-per-page', v);
        },
        'update:sort-by': function updateSortBy(v) {
          return _this8.$emit('update:sort-by', v);
        },
        'update:sort-desc': function updateSortDesc(v) {
          return _this8.$emit('update:sort-desc', v);
        },
        'update:group-by': function updateGroupBy(v) {
          return _this8.$emit('update:group-by', v);
        },
        'update:group-desc': function updateGroupDesc(v) {
          return _this8.$emit('update:group-desc', v);
        },
        pagination: function pagination(v, old) {
          return !(0, _helpers.deepEqual)(v, old) && _this8.$emit('pagination', v);
        },
        'current-items': function currentItems(v) {
          _this8.internalCurrentItems = v;

          _this8.$emit('current-items', v);
        },
        'page-count': function pageCount(v) {
          return _this8.$emit('page-count', v);
        }
      },
      scopedSlots: {
        default: this.genDefaultScopedSlot
      }
    });
  }
});

exports.default = _default2;
//# sourceMappingURL=VDataTable.js.map
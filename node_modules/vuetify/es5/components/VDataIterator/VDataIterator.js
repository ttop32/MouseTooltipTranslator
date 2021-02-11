"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _VData = require("../VData");

var _VDataFooter = _interopRequireDefault(require("./VDataFooter"));

var _mobile = _interopRequireDefault(require("../../mixins/mobile"));

var _themeable = _interopRequireDefault(require("../../mixins/themeable"));

var _mixins = _interopRequireDefault(require("../../util/mixins"));

var _helpers = require("../../util/helpers");

var _console = require("../../util/console");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/* @vue/component */
var _default2 = (0, _mixins.default)(_mobile.default, _themeable.default).extend({
  name: 'v-data-iterator',
  props: _objectSpread({}, _VData.VData.options.props, {
    itemKey: {
      type: String,
      default: 'id'
    },
    value: {
      type: Array,
      default: function _default() {
        return [];
      }
    },
    singleSelect: Boolean,
    expanded: {
      type: Array,
      default: function _default() {
        return [];
      }
    },
    mobileBreakpoint: _objectSpread({}, _mobile.default.options.props.mobileBreakpoint, {
      default: 600
    }),
    singleExpand: Boolean,
    loading: [Boolean, String],
    noResultsText: {
      type: String,
      default: '$vuetify.dataIterator.noResultsText'
    },
    noDataText: {
      type: String,
      default: '$vuetify.noDataText'
    },
    loadingText: {
      type: String,
      default: '$vuetify.dataIterator.loadingText'
    },
    hideDefaultFooter: Boolean,
    footerProps: Object,
    selectableKey: {
      type: String,
      default: 'isSelectable'
    }
  }),
  data: function data() {
    return {
      selection: {},
      expansion: {},
      internalCurrentItems: []
    };
  },
  computed: {
    everyItem: function everyItem() {
      var _this = this;

      return !!this.selectableItems.length && this.selectableItems.every(function (i) {
        return _this.isSelected(i);
      });
    },
    someItems: function someItems() {
      var _this2 = this;

      return this.selectableItems.some(function (i) {
        return _this2.isSelected(i);
      });
    },
    sanitizedFooterProps: function sanitizedFooterProps() {
      return (0, _helpers.camelizeObjectKeys)(this.footerProps);
    },
    selectableItems: function selectableItems() {
      var _this3 = this;

      return this.internalCurrentItems.filter(function (item) {
        return _this3.isSelectable(item);
      });
    }
  },
  watch: {
    value: {
      handler: function handler(value) {
        var _this4 = this;

        this.selection = value.reduce(function (selection, item) {
          selection[(0, _helpers.getObjectValueByPath)(item, _this4.itemKey)] = item;
          return selection;
        }, {});
      },
      immediate: true
    },
    selection: function selection(value, old) {
      if ((0, _helpers.deepEqual)(Object.keys(value), Object.keys(old))) return;
      this.$emit('input', Object.values(value));
    },
    expanded: {
      handler: function handler(value) {
        var _this5 = this;

        this.expansion = value.reduce(function (expansion, item) {
          expansion[(0, _helpers.getObjectValueByPath)(item, _this5.itemKey)] = true;
          return expansion;
        }, {});
      },
      immediate: true
    },
    expansion: function expansion(value, old) {
      var _this6 = this;

      if ((0, _helpers.deepEqual)(value, old)) return;
      var keys = Object.keys(value).filter(function (k) {
        return value[k];
      });
      var expanded = !keys.length ? [] : this.items.filter(function (i) {
        return keys.includes(String((0, _helpers.getObjectValueByPath)(i, _this6.itemKey)));
      });
      this.$emit('update:expanded', expanded);
    }
  },
  created: function created() {
    var _this7 = this;

    var breakingProps = [['disable-initial-sort', 'sort-by'], ['filter', 'custom-filter'], ['pagination', 'options'], ['total-items', 'server-items-length'], ['hide-actions', 'hide-default-footer'], ['rows-per-page-items', 'footer-props.items-per-page-options'], ['rows-per-page-text', 'footer-props.items-per-page-text'], ['prev-icon', 'footer-props.prev-icon'], ['next-icon', 'footer-props.next-icon']];
    /* istanbul ignore next */

    breakingProps.forEach(function (_ref) {
      var _ref2 = _slicedToArray(_ref, 2),
          original = _ref2[0],
          replacement = _ref2[1];

      if (_this7.$attrs.hasOwnProperty(original)) (0, _console.breaking)(original, replacement, _this7);
    });
    var removedProps = ['expand', 'content-class', 'content-props', 'content-tag'];
    /* istanbul ignore next */

    removedProps.forEach(function (prop) {
      if (_this7.$attrs.hasOwnProperty(prop)) (0, _console.removed)(prop);
    });
  },
  methods: {
    toggleSelectAll: function toggleSelectAll(value) {
      var selection = Object.assign({}, this.selection);

      for (var i = 0; i < this.selectableItems.length; i++) {
        var item = this.selectableItems[i];
        if (!this.isSelectable(item)) continue;
        var key = (0, _helpers.getObjectValueByPath)(item, this.itemKey);
        if (value) selection[key] = item;else delete selection[key];
      }

      this.selection = selection;
      this.$emit('toggle-select-all', {
        items: this.internalCurrentItems,
        value: value
      });
    },
    isSelectable: function isSelectable(item) {
      return (0, _helpers.getObjectValueByPath)(item, this.selectableKey) !== false;
    },
    isSelected: function isSelected(item) {
      return !!this.selection[(0, _helpers.getObjectValueByPath)(item, this.itemKey)] || false;
    },
    select: function select(item) {
      var value = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
      var emit = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
      if (!this.isSelectable(item)) return;
      var selection = this.singleSelect ? {} : Object.assign({}, this.selection);
      var key = (0, _helpers.getObjectValueByPath)(item, this.itemKey);
      if (value) selection[key] = item;else delete selection[key];

      if (this.singleSelect && emit) {
        var keys = Object.keys(this.selection);
        var old = keys.length && (0, _helpers.getObjectValueByPath)(this.selection[keys[0]], this.itemKey);
        old && old !== key && this.$emit('item-selected', {
          item: this.selection[old],
          value: false
        });
      }

      this.selection = selection;
      emit && this.$emit('item-selected', {
        item: item,
        value: value
      });
    },
    isExpanded: function isExpanded(item) {
      return this.expansion[(0, _helpers.getObjectValueByPath)(item, this.itemKey)] || false;
    },
    expand: function expand(item) {
      var value = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
      var expansion = this.singleExpand ? {} : Object.assign({}, this.expansion);
      var key = (0, _helpers.getObjectValueByPath)(item, this.itemKey);
      if (value) expansion[key] = true;else delete expansion[key];
      this.expansion = expansion;
      this.$emit('item-expanded', {
        item: item,
        value: value
      });
    },
    createItemProps: function createItemProps(item, index) {
      var _this8 = this;

      return {
        item: item,
        index: index,
        select: function select(v) {
          return _this8.select(item, v);
        },
        isSelected: this.isSelected(item),
        expand: function expand(v) {
          return _this8.expand(item, v);
        },
        isExpanded: this.isExpanded(item),
        isMobile: this.isMobile
      };
    },
    genEmptyWrapper: function genEmptyWrapper(content) {
      return this.$createElement('div', content);
    },
    genEmpty: function genEmpty(originalItemsLength, filteredItemsLength) {
      if (originalItemsLength === 0 && this.loading) {
        var loading = this.$slots.loading || this.$vuetify.lang.t(this.loadingText);
        return this.genEmptyWrapper(loading);
      } else if (originalItemsLength === 0) {
        var noData = this.$slots['no-data'] || this.$vuetify.lang.t(this.noDataText);
        return this.genEmptyWrapper(noData);
      } else if (filteredItemsLength === 0) {
        var noResults = this.$slots['no-results'] || this.$vuetify.lang.t(this.noResultsText);
        return this.genEmptyWrapper(noResults);
      }

      return null;
    },
    genItems: function genItems(props) {
      var _this9 = this;

      var empty = this.genEmpty(props.originalItemsLength, props.pagination.itemsLength);
      if (empty) return [empty];

      if (this.$scopedSlots.default) {
        return this.$scopedSlots.default(_objectSpread({}, props, {
          isSelected: this.isSelected,
          select: this.select,
          isExpanded: this.isExpanded,
          isMobile: this.isMobile,
          expand: this.expand
        }));
      }

      if (this.$scopedSlots.item) {
        return props.items.map(function (item, index) {
          return _this9.$scopedSlots.item(_this9.createItemProps(item, index));
        });
      }

      return [];
    },
    genFooter: function genFooter(props) {
      if (this.hideDefaultFooter) return null;
      var data = {
        props: _objectSpread({}, this.sanitizedFooterProps, {
          options: props.options,
          pagination: props.pagination
        }),
        on: {
          'update:options': function updateOptions(value) {
            return props.updateOptions(value);
          }
        }
      };
      var scopedSlots = (0, _helpers.getPrefixedScopedSlots)('footer.', this.$scopedSlots);
      return this.$createElement(_VDataFooter.default, _objectSpread({
        scopedSlots: scopedSlots
      }, data));
    },
    genDefaultScopedSlot: function genDefaultScopedSlot(props) {
      var outerProps = _objectSpread({}, props, {
        someItems: this.someItems,
        everyItem: this.everyItem,
        toggleSelectAll: this.toggleSelectAll
      });

      return this.$createElement('div', {
        staticClass: 'v-data-iterator'
      }, [(0, _helpers.getSlot)(this, 'header', outerProps, true), this.genItems(props), this.genFooter(props), (0, _helpers.getSlot)(this, 'footer', outerProps, true)]);
    }
  },
  render: function render() {
    var _this10 = this;

    return this.$createElement(_VData.VData, {
      props: this.$props,
      on: {
        'update:options': function updateOptions(v, old) {
          return !(0, _helpers.deepEqual)(v, old) && _this10.$emit('update:options', v);
        },
        'update:page': function updatePage(v) {
          return _this10.$emit('update:page', v);
        },
        'update:items-per-page': function updateItemsPerPage(v) {
          return _this10.$emit('update:items-per-page', v);
        },
        'update:sort-by': function updateSortBy(v) {
          return _this10.$emit('update:sort-by', v);
        },
        'update:sort-desc': function updateSortDesc(v) {
          return _this10.$emit('update:sort-desc', v);
        },
        'update:group-by': function updateGroupBy(v) {
          return _this10.$emit('update:group-by', v);
        },
        'update:group-desc': function updateGroupDesc(v) {
          return _this10.$emit('update:group-desc', v);
        },
        pagination: function pagination(v, old) {
          return !(0, _helpers.deepEqual)(v, old) && _this10.$emit('pagination', v);
        },
        'current-items': function currentItems(v) {
          _this10.internalCurrentItems = v;

          _this10.$emit('current-items', v);
        },
        'page-count': function pageCount(v) {
          return _this10.$emit('page-count', v);
        }
      },
      scopedSlots: {
        default: this.genDefaultScopedSlot
      }
    });
  }
});

exports.default = _default2;
//# sourceMappingURL=VDataIterator.js.map
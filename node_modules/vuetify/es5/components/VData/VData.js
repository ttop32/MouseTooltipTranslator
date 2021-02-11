"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _helpers = require("../../util/helpers");

var _vue = _interopRequireDefault(require("vue"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

var _default2 = _vue.default.extend({
  name: 'v-data',
  inheritAttrs: false,
  props: {
    items: {
      type: Array,
      default: function _default() {
        return [];
      }
    },
    options: {
      type: Object,
      default: function _default() {
        return {};
      }
    },
    sortBy: {
      type: [String, Array],
      default: function _default() {
        return [];
      }
    },
    sortDesc: {
      type: [Boolean, Array],
      default: function _default() {
        return [];
      }
    },
    customSort: {
      type: Function,
      default: _helpers.sortItems
    },
    mustSort: Boolean,
    multiSort: Boolean,
    page: {
      type: Number,
      default: 1
    },
    itemsPerPage: {
      type: Number,
      default: 10
    },
    groupBy: {
      type: [String, Array],
      default: function _default() {
        return [];
      }
    },
    groupDesc: {
      type: [Boolean, Array],
      default: function _default() {
        return [];
      }
    },
    customGroup: {
      type: Function,
      default: _helpers.groupItems
    },
    locale: {
      type: String,
      default: 'en-US'
    },
    disableSort: Boolean,
    disablePagination: Boolean,
    disableFiltering: Boolean,
    search: String,
    customFilter: {
      type: Function,
      default: _helpers.searchItems
    },
    serverItemsLength: {
      type: Number,
      default: -1
    }
  },
  data: function data() {
    var internalOptions = {
      page: this.page,
      itemsPerPage: this.itemsPerPage,
      sortBy: (0, _helpers.wrapInArray)(this.sortBy),
      sortDesc: (0, _helpers.wrapInArray)(this.sortDesc),
      groupBy: (0, _helpers.wrapInArray)(this.groupBy),
      groupDesc: (0, _helpers.wrapInArray)(this.groupDesc),
      mustSort: this.mustSort,
      multiSort: this.multiSort
    };

    if (this.options) {
      internalOptions = Object.assign(internalOptions, this.options);
    }

    var _internalOptions = internalOptions,
        sortBy = _internalOptions.sortBy,
        sortDesc = _internalOptions.sortDesc,
        groupBy = _internalOptions.groupBy,
        groupDesc = _internalOptions.groupDesc;
    var sortDiff = sortBy.length - sortDesc.length;
    var groupDiff = groupBy.length - groupDesc.length;

    if (sortDiff > 0) {
      var _internalOptions$sort;

      (_internalOptions$sort = internalOptions.sortDesc).push.apply(_internalOptions$sort, _toConsumableArray((0, _helpers.fillArray)(sortDiff, false)));
    }

    if (groupDiff > 0) {
      var _internalOptions$grou;

      (_internalOptions$grou = internalOptions.groupDesc).push.apply(_internalOptions$grou, _toConsumableArray((0, _helpers.fillArray)(groupDiff, false)));
    }

    return {
      internalOptions: internalOptions
    };
  },
  computed: {
    itemsLength: function itemsLength() {
      return this.serverItemsLength >= 0 ? this.serverItemsLength : this.filteredItems.length;
    },
    pageCount: function pageCount() {
      return this.internalOptions.itemsPerPage <= 0 ? 1 : Math.ceil(this.itemsLength / this.internalOptions.itemsPerPage);
    },
    pageStart: function pageStart() {
      if (this.internalOptions.itemsPerPage === -1 || !this.items.length) return 0;
      return (this.internalOptions.page - 1) * this.internalOptions.itemsPerPage;
    },
    pageStop: function pageStop() {
      if (this.internalOptions.itemsPerPage === -1) return this.itemsLength;
      if (!this.items.length) return 0;
      return Math.min(this.itemsLength, this.internalOptions.page * this.internalOptions.itemsPerPage);
    },
    isGrouped: function isGrouped() {
      return !!this.internalOptions.groupBy.length;
    },
    pagination: function pagination() {
      return {
        page: this.internalOptions.page,
        itemsPerPage: this.internalOptions.itemsPerPage,
        pageStart: this.pageStart,
        pageStop: this.pageStop,
        pageCount: this.pageCount,
        itemsLength: this.itemsLength
      };
    },
    filteredItems: function filteredItems() {
      var items = this.items.slice();

      if (!this.disableFiltering && this.serverItemsLength <= 0) {
        items = this.customFilter(items, this.search);
      }

      return items;
    },
    computedItems: function computedItems() {
      var items = this.filteredItems.slice();

      if (!this.disableSort && this.serverItemsLength <= 0) {
        items = this.sortItems(items);
      }

      if (!this.disablePagination && this.serverItemsLength <= 0) {
        items = this.paginateItems(items);
      }

      return items;
    },
    groupedItems: function groupedItems() {
      return this.isGrouped ? this.groupItems(this.computedItems) : null;
    },
    scopedProps: function scopedProps() {
      return {
        sort: this.sort,
        sortArray: this.sortArray,
        group: this.group,
        items: this.computedItems,
        options: this.internalOptions,
        updateOptions: this.updateOptions,
        pagination: this.pagination,
        groupedItems: this.groupedItems,
        originalItemsLength: this.items.length
      };
    },
    computedOptions: function computedOptions() {
      return _objectSpread({}, this.options);
    }
  },
  watch: {
    computedOptions: {
      handler: function handler(options, old) {
        if ((0, _helpers.deepEqual)(options, old)) return;
        this.updateOptions(options);
      },
      deep: true,
      immediate: true
    },
    internalOptions: {
      handler: function handler(options, old) {
        if ((0, _helpers.deepEqual)(options, old)) return;
        this.$emit('update:options', options);
      },
      deep: true,
      immediate: true
    },
    page: function page(_page) {
      this.updateOptions({
        page: _page
      });
    },
    'internalOptions.page': function internalOptionsPage(page) {
      this.$emit('update:page', page);
    },
    itemsPerPage: function itemsPerPage(_itemsPerPage) {
      this.updateOptions({
        itemsPerPage: _itemsPerPage
      });
    },
    'internalOptions.itemsPerPage': function internalOptionsItemsPerPage(itemsPerPage) {
      this.$emit('update:items-per-page', itemsPerPage);
    },
    sortBy: function sortBy(_sortBy) {
      this.updateOptions({
        sortBy: (0, _helpers.wrapInArray)(_sortBy)
      });
    },
    'internalOptions.sortBy': function internalOptionsSortBy(sortBy, old) {
      !(0, _helpers.deepEqual)(sortBy, old) && this.$emit('update:sort-by', Array.isArray(this.sortBy) ? sortBy : sortBy[0]);
    },
    sortDesc: function sortDesc(_sortDesc) {
      this.updateOptions({
        sortDesc: (0, _helpers.wrapInArray)(_sortDesc)
      });
    },
    'internalOptions.sortDesc': function internalOptionsSortDesc(sortDesc, old) {
      !(0, _helpers.deepEqual)(sortDesc, old) && this.$emit('update:sort-desc', Array.isArray(this.sortDesc) ? sortDesc : sortDesc[0]);
    },
    groupBy: function groupBy(_groupBy) {
      this.updateOptions({
        groupBy: (0, _helpers.wrapInArray)(_groupBy)
      });
    },
    'internalOptions.groupBy': function internalOptionsGroupBy(groupBy, old) {
      !(0, _helpers.deepEqual)(groupBy, old) && this.$emit('update:group-by', Array.isArray(this.groupBy) ? groupBy : groupBy[0]);
    },
    groupDesc: function groupDesc(_groupDesc) {
      this.updateOptions({
        groupDesc: (0, _helpers.wrapInArray)(_groupDesc)
      });
    },
    'internalOptions.groupDesc': function internalOptionsGroupDesc(groupDesc, old) {
      !(0, _helpers.deepEqual)(groupDesc, old) && this.$emit('update:group-desc', Array.isArray(this.groupDesc) ? groupDesc : groupDesc[0]);
    },
    multiSort: function multiSort(_multiSort) {
      this.updateOptions({
        multiSort: _multiSort
      });
    },
    'internalOptions.multiSort': function internalOptionsMultiSort(multiSort) {
      this.$emit('update:multi-sort', multiSort);
    },
    mustSort: function mustSort(_mustSort) {
      this.updateOptions({
        mustSort: _mustSort
      });
    },
    'internalOptions.mustSort': function internalOptionsMustSort(mustSort) {
      this.$emit('update:must-sort', mustSort);
    },
    pageCount: {
      handler: function handler(pageCount) {
        this.$emit('page-count', pageCount);
      },
      immediate: true
    },
    computedItems: {
      handler: function handler(computedItems) {
        this.$emit('current-items', computedItems);
      },
      immediate: true
    },
    pagination: {
      handler: function handler(pagination, old) {
        if ((0, _helpers.deepEqual)(pagination, old)) return;
        this.$emit('pagination', this.pagination);
      },
      immediate: true
    }
  },
  methods: {
    toggle: function toggle(key, oldBy, oldDesc, page, mustSort, multiSort) {
      var by = oldBy.slice();
      var desc = oldDesc.slice();
      var byIndex = by.findIndex(function (k) {
        return k === key;
      });

      if (byIndex < 0) {
        if (!multiSort) {
          by = [];
          desc = [];
        }

        by.push(key);
        desc.push(false);
      } else if (byIndex >= 0 && !desc[byIndex]) {
        desc[byIndex] = true;
      } else if (!mustSort) {
        by.splice(byIndex, 1);
        desc.splice(byIndex, 1);
      } else {
        desc[byIndex] = false;
      } // Reset page to 1 if sortBy or sortDesc have changed


      if (!(0, _helpers.deepEqual)(by, oldBy) || !(0, _helpers.deepEqual)(desc, oldDesc)) {
        page = 1;
      }

      return {
        by: by,
        desc: desc,
        page: page
      };
    },
    group: function group(key) {
      var _this$toggle = this.toggle(key, this.internalOptions.groupBy, this.internalOptions.groupDesc, this.internalOptions.page, true, false),
          groupBy = _this$toggle.by,
          groupDesc = _this$toggle.desc,
          page = _this$toggle.page;

      this.updateOptions({
        groupBy: groupBy,
        groupDesc: groupDesc,
        page: page
      });
    },
    sort: function sort(key) {
      if (Array.isArray(key)) return this.sortArray(key);

      var _this$toggle2 = this.toggle(key, this.internalOptions.sortBy, this.internalOptions.sortDesc, this.internalOptions.page, this.internalOptions.mustSort, this.internalOptions.multiSort),
          sortBy = _this$toggle2.by,
          sortDesc = _this$toggle2.desc,
          page = _this$toggle2.page;

      this.updateOptions({
        sortBy: sortBy,
        sortDesc: sortDesc,
        page: page
      });
    },
    sortArray: function sortArray(sortBy) {
      var _this = this;

      var sortDesc = sortBy.map(function (s) {
        var i = _this.internalOptions.sortBy.findIndex(function (k) {
          return k === s;
        });

        return i > -1 ? _this.internalOptions.sortDesc[i] : false;
      });
      this.updateOptions({
        sortBy: sortBy,
        sortDesc: sortDesc
      });
    },
    updateOptions: function updateOptions(options) {
      this.internalOptions = _objectSpread({}, this.internalOptions, {}, options, {
        page: this.serverItemsLength < 0 ? Math.max(1, Math.min(options.page || this.internalOptions.page, this.pageCount)) : options.page || this.internalOptions.page
      });
    },
    sortItems: function sortItems(items) {
      var sortBy = this.internalOptions.sortBy;
      var sortDesc = this.internalOptions.sortDesc;

      if (this.internalOptions.groupBy.length) {
        sortBy = [].concat(_toConsumableArray(this.internalOptions.groupBy), _toConsumableArray(sortBy));
        sortDesc = [].concat(_toConsumableArray(this.internalOptions.groupDesc), _toConsumableArray(sortDesc));
      }

      return this.customSort(items, sortBy, sortDesc, this.locale);
    },
    groupItems: function groupItems(items) {
      return this.customGroup(items, this.internalOptions.groupBy, this.internalOptions.groupDesc);
    },
    paginateItems: function paginateItems(items) {
      // Make sure we don't try to display non-existant page if items suddenly change
      // TODO: Could possibly move this to pageStart/pageStop?
      if (this.serverItemsLength === -1 && items.length <= this.pageStart) {
        this.internalOptions.page = Math.max(1, this.internalOptions.page - 1);
      }

      return items.slice(this.pageStart, this.pageStop);
    }
  },
  render: function render() {
    return this.$scopedSlots.default && this.$scopedSlots.default(this.scopedProps);
  }
});

exports.default = _default2;
//# sourceMappingURL=VData.js.map
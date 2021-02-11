"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("../../../src/components/VDataIterator/VDataFooter.sass");

var _VSelect = _interopRequireDefault(require("../VSelect/VSelect"));

var _VIcon = _interopRequireDefault(require("../VIcon"));

var _VBtn = _interopRequireDefault(require("../VBtn"));

var _vue = _interopRequireDefault(require("vue"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

var _default2 = _vue.default.extend({
  name: 'v-data-footer',
  props: {
    options: {
      type: Object,
      required: true
    },
    pagination: {
      type: Object,
      required: true
    },
    itemsPerPageOptions: {
      type: Array,
      default: function _default() {
        return [5, 10, 15, -1];
      }
    },
    prevIcon: {
      type: String,
      default: '$prev'
    },
    nextIcon: {
      type: String,
      default: '$next'
    },
    firstIcon: {
      type: String,
      default: '$first'
    },
    lastIcon: {
      type: String,
      default: '$last'
    },
    itemsPerPageText: {
      type: String,
      default: '$vuetify.dataFooter.itemsPerPageText'
    },
    itemsPerPageAllText: {
      type: String,
      default: '$vuetify.dataFooter.itemsPerPageAll'
    },
    showFirstLastPage: Boolean,
    showCurrentPage: Boolean,
    disablePagination: Boolean,
    disableItemsPerPage: Boolean,
    pageText: {
      type: String,
      default: '$vuetify.dataFooter.pageText'
    }
  },
  computed: {
    disableNextPageIcon: function disableNextPageIcon() {
      return this.options.itemsPerPage <= 0 || this.options.page * this.options.itemsPerPage >= this.pagination.itemsLength || this.pagination.pageStop < 0;
    },
    computedDataItemsPerPageOptions: function computedDataItemsPerPageOptions() {
      var _this = this;

      return this.itemsPerPageOptions.map(function (option) {
        if (_typeof(option) === 'object') return option;else return _this.genDataItemsPerPageOption(option);
      });
    }
  },
  methods: {
    updateOptions: function updateOptions(obj) {
      this.$emit('update:options', Object.assign({}, this.options, obj));
    },
    onFirstPage: function onFirstPage() {
      this.updateOptions({
        page: 1
      });
    },
    onPreviousPage: function onPreviousPage() {
      this.updateOptions({
        page: this.options.page - 1
      });
    },
    onNextPage: function onNextPage() {
      this.updateOptions({
        page: this.options.page + 1
      });
    },
    onLastPage: function onLastPage() {
      this.updateOptions({
        page: this.pagination.pageCount
      });
    },
    onChangeItemsPerPage: function onChangeItemsPerPage(itemsPerPage) {
      this.updateOptions({
        itemsPerPage: itemsPerPage,
        page: 1
      });
    },
    genDataItemsPerPageOption: function genDataItemsPerPageOption(option) {
      return {
        text: option === -1 ? this.$vuetify.lang.t(this.itemsPerPageAllText) : String(option),
        value: option
      };
    },
    genItemsPerPageSelect: function genItemsPerPageSelect() {
      var value = this.options.itemsPerPage;
      var computedIPPO = this.computedDataItemsPerPageOptions;
      if (computedIPPO.length <= 1) return null;
      if (!computedIPPO.find(function (ippo) {
        return ippo.value === value;
      })) value = computedIPPO[0];
      return this.$createElement('div', {
        staticClass: 'v-data-footer__select'
      }, [this.$vuetify.lang.t(this.itemsPerPageText), this.$createElement(_VSelect.default, {
        attrs: {
          'aria-label': this.$vuetify.lang.t(this.itemsPerPageText)
        },
        props: {
          disabled: this.disableItemsPerPage,
          items: computedIPPO,
          value: value,
          hideDetails: true,
          auto: true,
          minWidth: '75px'
        },
        on: {
          input: this.onChangeItemsPerPage
        }
      })]);
    },
    genPaginationInfo: function genPaginationInfo() {
      var children = ['–'];
      var itemsLength = this.pagination.itemsLength;
      var pageStart = this.pagination.pageStart;
      var pageStop = this.pagination.pageStop;

      if (this.pagination.itemsLength && this.pagination.itemsPerPage) {
        pageStart = this.pagination.pageStart + 1;
        pageStop = itemsLength < this.pagination.pageStop || this.pagination.pageStop < 0 ? itemsLength : this.pagination.pageStop;
        children = this.$scopedSlots['page-text'] ? [this.$scopedSlots['page-text']({
          pageStart: pageStart,
          pageStop: pageStop,
          itemsLength: itemsLength
        })] : [this.$vuetify.lang.t(this.pageText, pageStart, pageStop, itemsLength)];
      } else if (this.$scopedSlots['page-text']) {
        children = [this.$scopedSlots['page-text']({
          pageStart: pageStart,
          pageStop: pageStop,
          itemsLength: itemsLength
        })];
      }

      return this.$createElement('div', {
        class: 'v-data-footer__pagination'
      }, children);
    },
    genIcon: function genIcon(click, disabled, label, icon) {
      return this.$createElement(_VBtn.default, {
        props: {
          disabled: disabled || this.disablePagination,
          icon: true,
          text: true
        },
        on: {
          click: click
        },
        attrs: {
          'aria-label': label
        }
      }, [this.$createElement(_VIcon.default, icon)]);
    },
    genIcons: function genIcons() {
      var before = [];
      var after = [];
      before.push(this.genIcon(this.onPreviousPage, this.options.page === 1, this.$vuetify.lang.t('$vuetify.dataFooter.prevPage'), this.$vuetify.rtl ? this.nextIcon : this.prevIcon));
      after.push(this.genIcon(this.onNextPage, this.disableNextPageIcon, this.$vuetify.lang.t('$vuetify.dataFooter.nextPage'), this.$vuetify.rtl ? this.prevIcon : this.nextIcon));

      if (this.showFirstLastPage) {
        before.unshift(this.genIcon(this.onFirstPage, this.options.page === 1, this.$vuetify.lang.t('$vuetify.dataFooter.firstPage'), this.$vuetify.rtl ? this.lastIcon : this.firstIcon));
        after.push(this.genIcon(this.onLastPage, this.options.page >= this.pagination.pageCount || this.options.itemsPerPage === -1, this.$vuetify.lang.t('$vuetify.dataFooter.lastPage'), this.$vuetify.rtl ? this.firstIcon : this.lastIcon));
      }

      return [this.$createElement('div', {
        staticClass: 'v-data-footer__icons-before'
      }, before), this.showCurrentPage && this.$createElement('span', [this.options.page.toString()]), this.$createElement('div', {
        staticClass: 'v-data-footer__icons-after'
      }, after)];
    }
  },
  render: function render() {
    return this.$createElement('div', {
      staticClass: 'v-data-footer'
    }, [this.genItemsPerPageSelect(), this.genPaginationInfo(), this.genIcons()]);
  }
});

exports.default = _default2;
//# sourceMappingURL=VDataFooter.js.map
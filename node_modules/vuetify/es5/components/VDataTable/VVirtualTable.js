"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("../../../src/components/VDataTable/VVirtualTable.sass");

var _VSimpleTable = _interopRequireDefault(require("./VSimpleTable"));

var _mixins = _interopRequireDefault(require("../../util/mixins"));

var _helpers = require("../../util/helpers");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Components
// Utiltiies
// Types
var baseMixins = (0, _mixins.default)(_VSimpleTable.default);

var _default2 = baseMixins.extend().extend({
  name: 'v-virtual-table',
  props: {
    chunkSize: {
      type: Number,
      default: 25
    },
    headerHeight: {
      type: Number,
      default: 48
    },
    items: {
      type: Array,
      default: function _default() {
        return [];
      }
    },
    rowHeight: {
      type: Number,
      default: 48
    }
  },
  data: function data() {
    return {
      scrollTop: 0,
      oldChunk: 0,
      scrollDebounce: null,
      invalidateCache: false
    };
  },
  computed: {
    itemsLength: function itemsLength() {
      return this.items.length;
    },
    totalHeight: function totalHeight() {
      return this.itemsLength * this.rowHeight + this.headerHeight;
    },
    topIndex: function topIndex() {
      return Math.floor(this.scrollTop / this.rowHeight);
    },
    chunkIndex: function chunkIndex() {
      return Math.floor(this.topIndex / this.chunkSize);
    },
    startIndex: function startIndex() {
      return Math.max(0, this.chunkIndex * this.chunkSize - this.chunkSize);
    },
    offsetTop: function offsetTop() {
      return Math.max(0, this.startIndex * this.rowHeight);
    },
    stopIndex: function stopIndex() {
      return Math.min(this.startIndex + this.chunkSize * 3, this.itemsLength);
    },
    offsetBottom: function offsetBottom() {
      return Math.max(0, (this.itemsLength - this.stopIndex - this.startIndex) * this.rowHeight);
    }
  },
  watch: {
    chunkIndex: function chunkIndex(newValue, oldValue) {
      this.oldChunk = oldValue;
    },
    items: function items() {
      this.cachedItems = null;
      this.$refs.table.scrollTop = 0;
    }
  },
  created: function created() {
    this.cachedItems = null;
  },
  mounted: function mounted() {
    this.scrollDebounce = (0, _helpers.debounce)(this.onScroll, 50);
    this.$refs.table.addEventListener('scroll', this.scrollDebounce, {
      passive: true
    });
  },
  beforeDestroy: function beforeDestroy() {
    this.$refs.table.removeEventListener('scroll', this.scrollDebounce);
  },
  methods: {
    createStyleHeight: function createStyleHeight(height) {
      return {
        height: "".concat(height, "px")
      };
    },
    genBody: function genBody() {
      if (this.cachedItems === null || this.chunkIndex !== this.oldChunk) {
        this.cachedItems = this.genItems();
        this.oldChunk = this.chunkIndex;
      }

      return this.$createElement('tbody', [this.$createElement('tr', {
        style: this.createStyleHeight(this.offsetTop)
      }), this.cachedItems, this.$createElement('tr', {
        style: this.createStyleHeight(this.offsetBottom)
      })]);
    },
    genItems: function genItems() {
      return this.$scopedSlots.items({
        items: this.items.slice(this.startIndex, this.stopIndex)
      });
    },
    onScroll: function onScroll(e) {
      var target = e.target;
      this.scrollTop = target.scrollTop;
    },
    genTable: function genTable() {
      return this.$createElement('div', {
        ref: 'table',
        staticClass: 'v-virtual-table__table'
      }, [this.$createElement('table', [this.$slots['body.before'], this.genBody(), this.$slots['body.after']])]);
    },
    genWrapper: function genWrapper() {
      return this.$createElement('div', {
        staticClass: 'v-virtual-table__wrapper',
        style: {
          height: (0, _helpers.convertToUnit)(this.height)
        }
      }, [this.genTable()]);
    }
  },
  render: function render(h) {
    return h('div', {
      staticClass: 'v-data-table v-virtual-table',
      class: this.classes
    }, [this.$slots.top, this.genWrapper(), this.$slots.bottom]);
  }
});

exports.default = _default2;
//# sourceMappingURL=VVirtualTable.js.map
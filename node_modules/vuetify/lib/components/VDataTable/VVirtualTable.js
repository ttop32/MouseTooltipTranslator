import "../../../src/components/VDataTable/VVirtualTable.sass"; // Components

import VSimpleTable from './VSimpleTable';
import mixins from '../../util/mixins'; // Utiltiies

import { convertToUnit, debounce } from '../../util/helpers'; // Types

const baseMixins = mixins(VSimpleTable);
export default baseMixins.extend().extend({
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
      default: () => []
    },
    rowHeight: {
      type: Number,
      default: 48
    }
  },
  data: () => ({
    scrollTop: 0,
    oldChunk: 0,
    scrollDebounce: null,
    invalidateCache: false
  }),
  computed: {
    itemsLength() {
      return this.items.length;
    },

    totalHeight() {
      return this.itemsLength * this.rowHeight + this.headerHeight;
    },

    topIndex() {
      return Math.floor(this.scrollTop / this.rowHeight);
    },

    chunkIndex() {
      return Math.floor(this.topIndex / this.chunkSize);
    },

    startIndex() {
      return Math.max(0, this.chunkIndex * this.chunkSize - this.chunkSize);
    },

    offsetTop() {
      return Math.max(0, this.startIndex * this.rowHeight);
    },

    stopIndex() {
      return Math.min(this.startIndex + this.chunkSize * 3, this.itemsLength);
    },

    offsetBottom() {
      return Math.max(0, (this.itemsLength - this.stopIndex - this.startIndex) * this.rowHeight);
    }

  },
  watch: {
    chunkIndex(newValue, oldValue) {
      this.oldChunk = oldValue;
    },

    items() {
      this.cachedItems = null;
      this.$refs.table.scrollTop = 0;
    }

  },

  created() {
    this.cachedItems = null;
  },

  mounted() {
    this.scrollDebounce = debounce(this.onScroll, 50);
    this.$refs.table.addEventListener('scroll', this.scrollDebounce, {
      passive: true
    });
  },

  beforeDestroy() {
    this.$refs.table.removeEventListener('scroll', this.scrollDebounce);
  },

  methods: {
    createStyleHeight(height) {
      return {
        height: `${height}px`
      };
    },

    genBody() {
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

    genItems() {
      return this.$scopedSlots.items({
        items: this.items.slice(this.startIndex, this.stopIndex)
      });
    },

    onScroll(e) {
      const target = e.target;
      this.scrollTop = target.scrollTop;
    },

    genTable() {
      return this.$createElement('div', {
        ref: 'table',
        staticClass: 'v-virtual-table__table'
      }, [this.$createElement('table', [this.$slots['body.before'], this.genBody(), this.$slots['body.after']])]);
    },

    genWrapper() {
      return this.$createElement('div', {
        staticClass: 'v-virtual-table__wrapper',
        style: {
          height: convertToUnit(this.height)
        }
      }, [this.genTable()]);
    }

  },

  render(h) {
    return h('div', {
      staticClass: 'v-data-table v-virtual-table',
      class: this.classes
    }, [this.$slots.top, this.genWrapper(), this.$slots.bottom]);
  }

});
//# sourceMappingURL=VVirtualTable.js.map
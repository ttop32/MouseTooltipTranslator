"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("../../../src/components/VVirtualScroll/VVirtualScroll.sass");

var _measurable = _interopRequireDefault(require("../../mixins/measurable"));

var _scroll = _interopRequireDefault(require("../../directives/scroll"));

var _helpers = require("../../util/helpers");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Styles
// Mixins
// Directives
// Utilities
var _default2 = _measurable.default.extend({
  name: 'v-virtual-scroll',
  directives: {
    Scroll: _scroll.default
  },
  props: {
    bench: {
      type: [Number, String],
      default: 0
    },
    itemHeight: {
      type: [Number, String],
      required: true
    },
    items: {
      type: Array,
      default: function _default() {
        return [];
      }
    }
  },
  data: function data() {
    return {
      first: 0,
      last: 0,
      scrollTop: 0
    };
  },
  computed: {
    __bench: function __bench() {
      return parseInt(this.bench, 10);
    },
    __itemHeight: function __itemHeight() {
      return parseInt(this.itemHeight, 10);
    },
    firstToRender: function firstToRender() {
      return Math.max(0, this.first - this.__bench);
    },
    lastToRender: function lastToRender() {
      return Math.min(this.items.length, this.last + this.__bench);
    }
  },
  watch: {
    height: 'onScroll',
    itemHeight: 'onScroll'
  },
  mounted: function mounted() {
    this.last = this.getLast(0);
  },
  methods: {
    getChildren: function getChildren() {
      return this.items.slice(this.firstToRender, this.lastToRender).map(this.genChild);
    },
    genChild: function genChild(item, index) {
      index += this.firstToRender;
      var top = (0, _helpers.convertToUnit)(index * this.__itemHeight);
      return this.$createElement('div', {
        staticClass: 'v-virtual-scroll__item',
        style: {
          top: top
        },
        key: index
      }, (0, _helpers.getSlot)(this, 'default', {
        index: index,
        item: item
      }));
    },
    getFirst: function getFirst() {
      return Math.floor(this.scrollTop / this.__itemHeight);
    },
    getLast: function getLast(first) {
      var height = parseInt(this.height || 0, 10) || this.$el.clientHeight;
      return first + Math.ceil(height / this.__itemHeight);
    },
    onScroll: function onScroll() {
      this.scrollTop = this.$el.scrollTop;
      this.first = this.getFirst();
      this.last = this.getLast(this.first);
    }
  },
  render: function render(h) {
    var content = h('div', {
      staticClass: 'v-virtual-scroll__container',
      style: {
        height: (0, _helpers.convertToUnit)(this.items.length * this.__itemHeight)
      }
    }, this.getChildren());
    return h('div', {
      staticClass: 'v-virtual-scroll',
      style: this.measurableStyles,
      directives: [{
        name: 'scroll',
        modifiers: {
          self: true
        },
        value: this.onScroll
      }],
      on: this.$listeners
    }, [content]);
  }
});

exports.default = _default2;
//# sourceMappingURL=VVirtualScroll.js.map
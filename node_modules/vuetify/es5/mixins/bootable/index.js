"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _console = require("../../util/console");

var _vue = _interopRequireDefault(require("vue"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Utilities
// Types

/**
 * Bootable
 * @mixin
 *
 * Used to add lazy content functionality to components
 * Looks for change in "isActive" to automatically boot
 * Otherwise can be set manually
 */

/* @vue/component */
var _default = _vue.default.extend().extend({
  name: 'bootable',
  props: {
    eager: Boolean
  },
  data: function data() {
    return {
      isBooted: false
    };
  },
  computed: {
    hasContent: function hasContent() {
      return this.isBooted || this.eager || this.isActive;
    }
  },
  watch: {
    isActive: function isActive() {
      this.isBooted = true;
    }
  },
  created: function created() {
    /* istanbul ignore next */
    if ('lazy' in this.$attrs) {
      (0, _console.removed)('lazy', this);
    }
  },
  methods: {
    showLazyContent: function showLazyContent(content) {
      return this.hasContent && content ? content() : [this.$createElement()];
    }
  }
});

exports.default = _default;
//# sourceMappingURL=index.js.map
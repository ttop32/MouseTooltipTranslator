"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _themeable = _interopRequireDefault(require("../../mixins/themeable"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Mixins

/* @vue/component */
var _default = _themeable.default.extend({
  name: 'v-theme-provider',
  props: {
    root: Boolean
  },
  computed: {
    isDark: function isDark() {
      return this.root ? this.rootIsDark : _themeable.default.options.computed.isDark.call(this);
    }
  },
  render: function render() {
    /* istanbul ignore next */
    return this.$slots.default && this.$slots.default.find(function (node) {
      return !node.isComment && node.text !== ' ';
    });
  }
});

exports.default = _default;
//# sourceMappingURL=VThemeProvider.js.map
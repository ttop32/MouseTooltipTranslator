"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("../../../src/components/VMain/VMain.sass");

var _ssrBootable = _interopRequireDefault(require("../../mixins/ssr-bootable"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Styles
// Mixins

/* @vue/component */
var _default = _ssrBootable.default.extend({
  name: 'v-main',
  props: {
    tag: {
      type: String,
      default: 'main'
    }
  },
  computed: {
    styles: function styles() {
      var _this$$vuetify$applic = this.$vuetify.application,
          bar = _this$$vuetify$applic.bar,
          top = _this$$vuetify$applic.top,
          right = _this$$vuetify$applic.right,
          footer = _this$$vuetify$applic.footer,
          insetFooter = _this$$vuetify$applic.insetFooter,
          bottom = _this$$vuetify$applic.bottom,
          left = _this$$vuetify$applic.left;
      return {
        paddingTop: "".concat(top + bar, "px"),
        paddingRight: "".concat(right, "px"),
        paddingBottom: "".concat(footer + insetFooter + bottom, "px"),
        paddingLeft: "".concat(left, "px")
      };
    }
  },
  render: function render(h) {
    var data = {
      staticClass: 'v-main',
      style: this.styles,
      ref: 'main'
    };
    return h(this.tag, data, [h('div', {
      staticClass: 'v-main__wrap'
    }, this.$slots.default)]);
  }
});

exports.default = _default;
//# sourceMappingURL=VMain.js.map
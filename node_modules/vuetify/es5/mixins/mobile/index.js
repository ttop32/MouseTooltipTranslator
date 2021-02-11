"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _console = require("../../util/console");

var _vue = _interopRequireDefault(require("vue"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* @vue/component */
var _default2 = _vue.default.extend({
  name: 'mobile',
  props: {
    mobileBreakpoint: {
      type: [Number, String],
      default: function _default() {
        // Avoid destroying unit
        // tests for users
        return this.$vuetify ? this.$vuetify.breakpoint.mobileBreakpoint : undefined;
      },
      validator: function validator(v) {
        return !isNaN(Number(v)) || ['xs', 'sm', 'md', 'lg', 'xl'].includes(String(v));
      }
    }
  },
  computed: {
    isMobile: function isMobile() {
      var _this$$vuetify$breakp = this.$vuetify.breakpoint,
          mobile = _this$$vuetify$breakp.mobile,
          width = _this$$vuetify$breakp.width,
          name = _this$$vuetify$breakp.name,
          mobileBreakpoint = _this$$vuetify$breakp.mobileBreakpoint; // Check if local mobileBreakpoint matches
      // the application's mobileBreakpoint

      if (mobileBreakpoint === this.mobileBreakpoint) return mobile;
      var mobileWidth = parseInt(this.mobileBreakpoint, 10);
      var isNumber = !isNaN(mobileWidth);
      return isNumber ? width < mobileWidth : name === this.mobileBreakpoint;
    }
  },
  created: function created() {
    /* istanbul ignore next */
    if (this.$attrs.hasOwnProperty('mobile-break-point')) {
      (0, _console.deprecate)('mobile-break-point', 'mobile-breakpoint', this);
    }
  }
});

exports.default = _default2;
//# sourceMappingURL=index.js.map
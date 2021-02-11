"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _vue = _interopRequireDefault(require("vue"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default = _vue.default.extend({
  name: 'localable',
  props: {
    locale: String
  },
  computed: {
    currentLocale: function currentLocale() {
      return this.locale || this.$vuetify.lang.current;
    }
  }
});

exports.default = _default;
//# sourceMappingURL=index.js.map
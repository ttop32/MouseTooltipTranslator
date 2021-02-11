"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _VWindowItem = _interopRequireDefault(require("../VWindow/VWindowItem"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Extensions

/* @vue/component */
var _default = _VWindowItem.default.extend({
  name: 'v-tab-item',
  props: {
    id: String
  },
  methods: {
    genWindowItem: function genWindowItem() {
      var item = _VWindowItem.default.options.methods.genWindowItem.call(this);

      item.data.domProps = item.data.domProps || {};
      item.data.domProps.id = this.id || this.value;
      return item;
    }
  }
});

exports.default = _default;
//# sourceMappingURL=VTabItem.js.map
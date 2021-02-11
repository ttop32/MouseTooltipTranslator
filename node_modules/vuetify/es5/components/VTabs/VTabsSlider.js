"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _colorable = _interopRequireDefault(require("../../mixins/colorable"));

var _mixins = _interopRequireDefault(require("../../util/mixins"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Mixins
// Utilities

/* @vue/component */
var _default = (0, _mixins.default)(_colorable.default).extend({
  name: 'v-tabs-slider',
  render: function render(h) {
    return h('div', this.setBackgroundColor(this.color, {
      staticClass: 'v-tabs-slider'
    }));
  }
});

exports.default = _default;
//# sourceMappingURL=VTabsSlider.js.map
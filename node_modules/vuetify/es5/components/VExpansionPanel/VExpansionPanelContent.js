"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _transitions = require("../transitions");

var _bootable = _interopRequireDefault(require("../../mixins/bootable"));

var _colorable = _interopRequireDefault(require("../../mixins/colorable"));

var _registrable = require("../../mixins/registrable");

var _helpers = require("../../util/helpers");

var _mixins = _interopRequireDefault(require("../../util/mixins"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Mixins
// Utilities
var baseMixins = (0, _mixins.default)(_bootable.default, _colorable.default, (0, _registrable.inject)('expansionPanel', 'v-expansion-panel-content', 'v-expansion-panel'));
/* @vue/component */

var _default = baseMixins.extend().extend({
  name: 'v-expansion-panel-content',
  computed: {
    isActive: function isActive() {
      return this.expansionPanel.isActive;
    }
  },
  created: function created() {
    this.expansionPanel.registerContent(this);
  },
  beforeDestroy: function beforeDestroy() {
    this.expansionPanel.unregisterContent();
  },
  render: function render(h) {
    var _this = this;

    return h(_transitions.VExpandTransition, this.showLazyContent(function () {
      return [h('div', _this.setBackgroundColor(_this.color, {
        staticClass: 'v-expansion-panel-content',
        directives: [{
          name: 'show',
          value: _this.isActive
        }]
      }), [h('div', {
        class: 'v-expansion-panel-content__wrap'
      }, (0, _helpers.getSlot)(_this))])];
    }));
  }
});

exports.default = _default;
//# sourceMappingURL=VExpansionPanelContent.js.map
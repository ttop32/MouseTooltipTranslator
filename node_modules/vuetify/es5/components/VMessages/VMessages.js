"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("../../../src/components/VMessages/VMessages.sass");

var _colorable = _interopRequireDefault(require("../../mixins/colorable"));

var _themeable = _interopRequireDefault(require("../../mixins/themeable"));

var _mixins = _interopRequireDefault(require("../../util/mixins"));

var _helpers = require("../../util/helpers");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Styles
// Mixins
// Utilities

/* @vue/component */
var _default2 = (0, _mixins.default)(_colorable.default, _themeable.default).extend({
  name: 'v-messages',
  props: {
    value: {
      type: Array,
      default: function _default() {
        return [];
      }
    }
  },
  methods: {
    genChildren: function genChildren() {
      return this.$createElement('transition-group', {
        staticClass: 'v-messages__wrapper',
        attrs: {
          name: 'message-transition',
          tag: 'div'
        }
      }, this.value.map(this.genMessage));
    },
    genMessage: function genMessage(message, key) {
      return this.$createElement('div', {
        staticClass: 'v-messages__message',
        key: key
      }, (0, _helpers.getSlot)(this, 'default', {
        message: message,
        key: key
      }) || [message]);
    }
  },
  render: function render(h) {
    return h('div', this.setTextColor(this.color, {
      staticClass: 'v-messages',
      class: this.themeClasses
    }), [this.genChildren()]);
  }
});

exports.default = _default2;
//# sourceMappingURL=VMessages.js.map
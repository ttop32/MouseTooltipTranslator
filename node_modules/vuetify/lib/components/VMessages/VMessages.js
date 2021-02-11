// Styles
import "../../../src/components/VMessages/VMessages.sass"; // Mixins

import Colorable from '../../mixins/colorable';
import Themeable from '../../mixins/themeable';
import mixins from '../../util/mixins'; // Utilities

import { getSlot } from '../../util/helpers';
/* @vue/component */

export default mixins(Colorable, Themeable).extend({
  name: 'v-messages',
  props: {
    value: {
      type: Array,
      default: () => []
    }
  },
  methods: {
    genChildren() {
      return this.$createElement('transition-group', {
        staticClass: 'v-messages__wrapper',
        attrs: {
          name: 'message-transition',
          tag: 'div'
        }
      }, this.value.map(this.genMessage));
    },

    genMessage(message, key) {
      return this.$createElement('div', {
        staticClass: 'v-messages__message',
        key
      }, getSlot(this, 'default', {
        message,
        key
      }) || [message]);
    }

  },

  render(h) {
    return h('div', this.setTextColor(this.color, {
      staticClass: 'v-messages',
      class: this.themeClasses
    }), [this.genChildren()]);
  }

});
//# sourceMappingURL=VMessages.js.map
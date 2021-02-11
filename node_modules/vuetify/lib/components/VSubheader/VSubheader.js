// Styles
import "../../../src/components/VSubheader/VSubheader.sass"; // Mixins

import Themeable from '../../mixins/themeable';
import mixins from '../../util/mixins';
export default mixins(Themeable
/* @vue/component */
).extend({
  name: 'v-subheader',
  props: {
    inset: Boolean
  },

  render(h) {
    return h('div', {
      staticClass: 'v-subheader',
      class: {
        'v-subheader--inset': this.inset,
        ...this.themeClasses
      },
      attrs: this.$attrs,
      on: this.$listeners
    }, this.$slots.default);
  }

});
//# sourceMappingURL=VSubheader.js.map
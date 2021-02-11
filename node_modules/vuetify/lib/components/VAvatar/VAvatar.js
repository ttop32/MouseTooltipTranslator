import "../../../src/components/VAvatar/VAvatar.sass"; // Mixins

import Colorable from '../../mixins/colorable';
import Measurable from '../../mixins/measurable';
import Roundable from '../../mixins/roundable'; // Utilities

import { convertToUnit } from '../../util/helpers';
import mixins from '../../util/mixins';
export default mixins(Colorable, Measurable, Roundable).extend({
  name: 'v-avatar',
  props: {
    left: Boolean,
    right: Boolean,
    size: {
      type: [Number, String],
      default: 48
    }
  },
  computed: {
    classes() {
      return {
        'v-avatar--left': this.left,
        'v-avatar--right': this.right,
        ...this.roundedClasses
      };
    },

    styles() {
      return {
        height: convertToUnit(this.size),
        minWidth: convertToUnit(this.size),
        width: convertToUnit(this.size),
        ...this.measurableStyles
      };
    }

  },

  render(h) {
    const data = {
      staticClass: 'v-avatar',
      class: this.classes,
      style: this.styles,
      on: this.$listeners
    };
    return h('div', this.setBackgroundColor(this.color, data), this.$slots.default);
  }

});
//# sourceMappingURL=VAvatar.js.map
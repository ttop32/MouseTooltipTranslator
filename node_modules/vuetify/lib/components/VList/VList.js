// Styles
import "../../../src/components/VList/VList.sass"; // Components

import VSheet from '../VSheet/VSheet';
/* @vue/component */

export default VSheet.extend().extend({
  name: 'v-list',

  provide() {
    return {
      isInList: true,
      list: this
    };
  },

  inject: {
    isInMenu: {
      default: false
    },
    isInNav: {
      default: false
    }
  },
  props: {
    dense: Boolean,
    disabled: Boolean,
    expand: Boolean,
    flat: Boolean,
    nav: Boolean,
    rounded: Boolean,
    subheader: Boolean,
    threeLine: Boolean,
    twoLine: Boolean
  },
  data: () => ({
    groups: []
  }),
  computed: {
    classes() {
      return { ...VSheet.options.computed.classes.call(this),
        'v-list--dense': this.dense,
        'v-list--disabled': this.disabled,
        'v-list--flat': this.flat,
        'v-list--nav': this.nav,
        'v-list--rounded': this.rounded,
        'v-list--subheader': this.subheader,
        'v-list--two-line': this.twoLine,
        'v-list--three-line': this.threeLine
      };
    }

  },
  methods: {
    register(content) {
      this.groups.push(content);
    },

    unregister(content) {
      const index = this.groups.findIndex(g => g._uid === content._uid);
      if (index > -1) this.groups.splice(index, 1);
    },

    listClick(uid) {
      if (this.expand) return;

      for (const group of this.groups) {
        group.toggle(uid);
      }
    }

  },

  render(h) {
    const data = {
      staticClass: 'v-list',
      class: this.classes,
      style: this.styles,
      attrs: {
        role: this.isInNav || this.isInMenu ? undefined : 'list',
        ...this.attrs$
      }
    };
    return h(this.tag, this.setBackgroundColor(this.color, data), [this.$slots.default]);
  }

});
//# sourceMappingURL=VList.js.map
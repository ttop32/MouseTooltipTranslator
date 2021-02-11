// Extensions
import VWindow from '../VWindow/VWindow'; // Types & Components

import { BaseItemGroup } from './../VItemGroup/VItemGroup';
/* @vue/component */

export default VWindow.extend({
  name: 'v-tabs-items',
  props: {
    mandatory: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    classes() {
      return { ...VWindow.options.computed.classes.call(this),
        'v-tabs-items': true
      };
    },

    isDark() {
      return this.rootIsDark;
    }

  },
  methods: {
    getValue(item, i) {
      return item.id || BaseItemGroup.options.methods.getValue.call(this, item, i);
    }

  }
});
//# sourceMappingURL=VTabsItems.js.map
import { VExpandTransition } from '../transitions'; // Mixins

import Bootable from '../../mixins/bootable';
import Colorable from '../../mixins/colorable';
import { inject as RegistrableInject } from '../../mixins/registrable'; // Utilities

import { getSlot } from '../../util/helpers';
import mixins from '../../util/mixins';
const baseMixins = mixins(Bootable, Colorable, RegistrableInject('expansionPanel', 'v-expansion-panel-content', 'v-expansion-panel'));
/* @vue/component */

export default baseMixins.extend().extend({
  name: 'v-expansion-panel-content',
  computed: {
    isActive() {
      return this.expansionPanel.isActive;
    }

  },

  created() {
    this.expansionPanel.registerContent(this);
  },

  beforeDestroy() {
    this.expansionPanel.unregisterContent();
  },

  render(h) {
    return h(VExpandTransition, this.showLazyContent(() => [h('div', this.setBackgroundColor(this.color, {
      staticClass: 'v-expansion-panel-content',
      directives: [{
        name: 'show',
        value: this.isActive
      }]
    }), [h('div', {
      class: 'v-expansion-panel-content__wrap'
    }, getSlot(this))])]));
  }

});
//# sourceMappingURL=VExpansionPanelContent.js.map
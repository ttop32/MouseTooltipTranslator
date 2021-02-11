// Components
import { VFadeTransition } from '../transitions';
import VIcon from '../VIcon'; // Mixins

import Colorable from '../../mixins/colorable';
import { inject as RegistrableInject } from '../../mixins/registrable'; // Directives

import ripple from '../../directives/ripple'; // Utilities

import { getSlot } from '../../util/helpers';
import mixins from '../../util/mixins';
const baseMixins = mixins(Colorable, RegistrableInject('expansionPanel', 'v-expansion-panel-header', 'v-expansion-panel'));
export default baseMixins.extend().extend({
  name: 'v-expansion-panel-header',
  directives: {
    ripple
  },
  props: {
    disableIconRotate: Boolean,
    expandIcon: {
      type: String,
      default: '$expand'
    },
    hideActions: Boolean,
    ripple: {
      type: [Boolean, Object],
      default: false
    }
  },
  data: () => ({
    hasMousedown: false
  }),
  computed: {
    classes() {
      return {
        'v-expansion-panel-header--active': this.isActive,
        'v-expansion-panel-header--mousedown': this.hasMousedown
      };
    },

    isActive() {
      return this.expansionPanel.isActive;
    },

    isDisabled() {
      return this.expansionPanel.isDisabled;
    },

    isReadonly() {
      return this.expansionPanel.isReadonly;
    }

  },

  created() {
    this.expansionPanel.registerHeader(this);
  },

  beforeDestroy() {
    this.expansionPanel.unregisterHeader();
  },

  methods: {
    onClick(e) {
      this.$emit('click', e);
    },

    genIcon() {
      const icon = getSlot(this, 'actions') || [this.$createElement(VIcon, this.expandIcon)];
      return this.$createElement(VFadeTransition, [this.$createElement('div', {
        staticClass: 'v-expansion-panel-header__icon',
        class: {
          'v-expansion-panel-header__icon--disable-rotate': this.disableIconRotate
        },
        directives: [{
          name: 'show',
          value: !this.isDisabled
        }]
      }, icon)]);
    }

  },

  render(h) {
    return h('button', this.setBackgroundColor(this.color, {
      staticClass: 'v-expansion-panel-header',
      class: this.classes,
      attrs: {
        tabindex: this.isDisabled ? -1 : null,
        type: 'button'
      },
      directives: [{
        name: 'ripple',
        value: this.ripple
      }],
      on: { ...this.$listeners,
        click: this.onClick,
        mousedown: () => this.hasMousedown = true,
        mouseup: () => this.hasMousedown = false
      }
    }), [getSlot(this, 'default', {
      open: this.isActive
    }, true), this.hideActions || this.genIcon()]);
  }

});
//# sourceMappingURL=VExpansionPanelHeader.js.map
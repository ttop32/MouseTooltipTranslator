// Styles
import "../../../src/components/VBanner/VBanner.sass"; // Extensions

import VSheet from '../VSheet'; // Components

import VAvatar from '../VAvatar';
import VIcon from '../VIcon';
import { VExpandTransition } from '../transitions'; // Mixins

import Mobile from '../../mixins/mobile';
import Toggleable from '../../mixins/toggleable'; // Utilities

import mixins from '../../util/mixins';
import { convertToUnit, getSlot } from '../../util/helpers';
/* @vue/component */

export default mixins(VSheet, Mobile, Toggleable).extend({
  name: 'v-banner',
  inheritAttrs: false,
  props: {
    app: Boolean,
    icon: String,
    iconColor: String,
    singleLine: Boolean,
    sticky: Boolean,
    value: {
      type: Boolean,
      default: true
    }
  },
  computed: {
    classes() {
      return { ...VSheet.options.computed.classes.call(this),
        'v-banner--has-icon': this.hasIcon,
        'v-banner--is-mobile': this.isMobile,
        'v-banner--single-line': this.singleLine,
        'v-banner--sticky': this.isSticky
      };
    },

    hasIcon() {
      return Boolean(this.icon || this.$slots.icon);
    },

    isSticky() {
      return this.sticky || this.app;
    },

    styles() {
      const styles = { ...VSheet.options.computed.styles.call(this)
      };

      if (this.isSticky) {
        const top = !this.app ? 0 : this.$vuetify.application.bar + this.$vuetify.application.top;
        styles.top = convertToUnit(top);
        styles.position = 'sticky';
        styles.zIndex = 1;
      }

      return styles;
    }

  },
  methods: {
    /** @public */
    toggle() {
      this.isActive = !this.isActive;
    },

    iconClick(e) {
      this.$emit('click:icon', e);
    },

    genIcon() {
      if (!this.hasIcon) return undefined;
      let content;

      if (this.icon) {
        content = this.$createElement(VIcon, {
          props: {
            color: this.iconColor,
            size: 28
          }
        }, [this.icon]);
      } else {
        content = this.$slots.icon;
      }

      return this.$createElement(VAvatar, {
        staticClass: 'v-banner__icon',
        props: {
          color: this.color,
          size: 40
        },
        on: {
          click: this.iconClick
        }
      }, [content]);
    },

    genText() {
      return this.$createElement('div', {
        staticClass: 'v-banner__text'
      }, this.$slots.default);
    },

    genActions() {
      const children = getSlot(this, 'actions', {
        dismiss: () => this.isActive = false
      });
      if (!children) return undefined;
      return this.$createElement('div', {
        staticClass: 'v-banner__actions'
      }, children);
    },

    genContent() {
      return this.$createElement('div', {
        staticClass: 'v-banner__content'
      }, [this.genIcon(), this.genText()]);
    },

    genWrapper() {
      return this.$createElement('div', {
        staticClass: 'v-banner__wrapper'
      }, [this.genContent(), this.genActions()]);
    }

  },

  render(h) {
    return h(VExpandTransition, [h('div', this.setBackgroundColor(this.color, {
      staticClass: 'v-banner',
      attrs: this.attrs$,
      class: this.classes,
      style: this.styles,
      directives: [{
        name: 'show',
        value: this.isActive
      }]
    }), [this.genWrapper()])]);
  }

});
//# sourceMappingURL=VBanner.js.map
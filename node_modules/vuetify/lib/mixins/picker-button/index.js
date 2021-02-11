// Mixins
import Colorable from '../colorable'; // Utilities

import mixins from '../../util/mixins';
import { kebabCase } from '../../util/helpers';
/* @vue/component */

export default mixins(Colorable).extend({
  methods: {
    genPickerButton(prop, value, content, readonly = false, staticClass = '') {
      const active = this[prop] === value;

      const click = event => {
        event.stopPropagation();
        this.$emit(`update:${kebabCase(prop)}`, value);
      };

      return this.$createElement('div', {
        staticClass: `v-picker__title__btn ${staticClass}`.trim(),
        class: {
          'v-picker__title__btn--active': active,
          'v-picker__title__btn--readonly': readonly
        },
        on: active || readonly ? undefined : {
          click
        }
      }, Array.isArray(content) ? content : [content]);
    }

  }
});
//# sourceMappingURL=index.js.map
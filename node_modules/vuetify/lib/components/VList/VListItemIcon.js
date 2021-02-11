// Types
import Vue from 'vue';
/* @vue/component */

export default Vue.extend({
  name: 'v-list-item-icon',
  functional: true,

  render(h, {
    data,
    children
  }) {
    data.staticClass = `v-list-item__icon ${data.staticClass || ''}`.trim();
    return h('div', data, children);
  }

});
//# sourceMappingURL=VListItemIcon.js.map
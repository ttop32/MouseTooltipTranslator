import Vue from 'vue';
export default Vue.extend({
  name: 'localable',
  props: {
    locale: String
  },
  computed: {
    currentLocale() {
      return this.locale || this.$vuetify.lang.current;
    }

  }
});
//# sourceMappingURL=index.js.map
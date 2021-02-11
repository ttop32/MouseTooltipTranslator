import Vue from 'vue';
/* @vue/component */

const Themeable = Vue.extend().extend({
  name: 'themeable',

  provide() {
    return {
      theme: this.themeableProvide
    };
  },

  inject: {
    theme: {
      default: {
        isDark: false
      }
    }
  },
  props: {
    dark: {
      type: Boolean,
      default: null
    },
    light: {
      type: Boolean,
      default: null
    }
  },

  data() {
    return {
      themeableProvide: {
        isDark: false
      }
    };
  },

  computed: {
    appIsDark() {
      return this.$vuetify.theme.dark || false;
    },

    isDark() {
      if (this.dark === true) {
        // explicitly dark
        return true;
      } else if (this.light === true) {
        // explicitly light
        return false;
      } else {
        // inherit from parent, or default false if there is none
        return this.theme.isDark;
      }
    },

    themeClasses() {
      return {
        'theme--dark': this.isDark,
        'theme--light': !this.isDark
      };
    },

    /** Used by menus and dialogs, inherits from v-app instead of the parent */
    rootIsDark() {
      if (this.dark === true) {
        // explicitly dark
        return true;
      } else if (this.light === true) {
        // explicitly light
        return false;
      } else {
        // inherit from v-app
        return this.appIsDark;
      }
    },

    rootThemeClasses() {
      return {
        'theme--dark': this.rootIsDark,
        'theme--light': !this.rootIsDark
      };
    }

  },
  watch: {
    isDark: {
      handler(newVal, oldVal) {
        if (newVal !== oldVal) {
          this.themeableProvide.isDark = this.isDark;
        }
      },

      immediate: true
    }
  }
});
export default Themeable;
export function functionalThemeClasses(context) {
  const vm = { ...context.props,
    ...context.injections
  };
  const isDark = Themeable.options.computed.isDark.call(vm);
  return Themeable.options.computed.themeClasses.call({
    isDark
  });
}
//# sourceMappingURL=index.js.map
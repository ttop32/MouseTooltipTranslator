"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.install = install;

var _vue = _interopRequireDefault(require("vue"));

var _console = require("./util/console");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function install(Vue) {
  var args = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  if (install.installed) return;
  install.installed = true;

  if (_vue.default !== Vue) {
    (0, _console.consoleError)("Multiple instances of Vue detected\nSee https://github.com/vuetifyjs/vuetify/issues/4068\n\nIf you're seeing \"$attrs is readonly\", it's caused by this");
  }

  var components = args.components || {};
  var directives = args.directives || {};

  for (var name in directives) {
    var directive = directives[name];
    Vue.directive(name, directive);
  }

  (function registerComponents(components) {
    if (components) {
      for (var key in components) {
        var component = components[key];

        if (component && !registerComponents(component.$_vuetify_subcomponents)) {
          Vue.component(key, component);
        }
      }

      return true;
    }

    return false;
  })(components); // Used to avoid multiple mixins being setup
  // when in dev mode and hot module reload
  // https://github.com/vuejs/vue/issues/5089#issuecomment-284260111


  if (Vue.$_vuetify_installed) return;
  Vue.$_vuetify_installed = true;
  Vue.mixin({
    beforeCreate: function beforeCreate() {
      var options = this.$options;

      if (options.vuetify) {
        options.vuetify.init(this, this.$ssrContext);
        this.$vuetify = Vue.observable(options.vuetify.framework);
      } else {
        this.$vuetify = options.parent && options.parent.$vuetify || this;
      }
    },
    beforeMount: function beforeMount() {
      // @ts-ignore
      if (this.$options.vuetify && this.$el && this.$el.hasAttribute('data-server-rendered')) {
        // @ts-ignore
        this.$vuetify.isHydrating = true; // @ts-ignore

        this.$vuetify.breakpoint.update(true);
      }
    },
    mounted: function mounted() {
      // @ts-ignore
      if (this.$options.vuetify && this.$vuetify.isHydrating) {
        // @ts-ignore
        this.$vuetify.isHydrating = false; // @ts-ignore

        this.$vuetify.breakpoint.update();
      }
    }
  });
}
//# sourceMappingURL=install.js.map
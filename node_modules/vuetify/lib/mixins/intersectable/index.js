// Directives
import Intersect from '../../directives/intersect'; // Utilities

import { consoleWarn } from '../../util/console'; // Types

import Vue from 'vue';
export default function intersectable(options) {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
    // do nothing because intersection observer is not available
    return Vue.extend({
      name: 'intersectable'
    });
  }

  return Vue.extend({
    name: 'intersectable',

    mounted() {
      Intersect.inserted(this.$el, {
        name: 'intersect',
        value: this.onObserve
      });
    },

    destroyed() {
      Intersect.unbind(this.$el);
    },

    methods: {
      onObserve(entries, observer, isIntersecting) {
        if (!isIntersecting) return;

        for (let i = 0, length = options.onVisible.length; i < length; i++) {
          const callback = this[options.onVisible[i]];

          if (typeof callback === 'function') {
            callback();
            continue;
          }

          consoleWarn(options.onVisible[i] + ' method is not available on the instance but referenced in intersectable mixin options');
        }
      }

    }
  });
}
//# sourceMappingURL=index.js.map
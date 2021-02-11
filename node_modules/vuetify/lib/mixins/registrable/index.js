import Vue from 'vue';
import { consoleWarn } from '../../util/console';

function generateWarning(child, parent) {
  return () => consoleWarn(`The ${child} component must be used inside a ${parent}`);
}

export function inject(namespace, child, parent) {
  const defaultImpl = child && parent ? {
    register: generateWarning(child, parent),
    unregister: generateWarning(child, parent)
  } : null;
  return Vue.extend({
    name: 'registrable-inject',
    inject: {
      [namespace]: {
        default: defaultImpl
      }
    }
  });
}
export function provide(namespace, self = false) {
  return Vue.extend({
    name: 'registrable-provide',

    provide() {
      return {
        [namespace]: self ? this : {
          register: this.register,
          unregister: this.unregister
        }
      };
    }

  });
}
//# sourceMappingURL=index.js.map
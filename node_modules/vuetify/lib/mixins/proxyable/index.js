import Vue from 'vue';
export function factory(prop = 'value', event = 'change') {
  return Vue.extend({
    name: 'proxyable',
    model: {
      prop,
      event
    },
    props: {
      [prop]: {
        required: false
      }
    },

    data() {
      return {
        internalLazyValue: this[prop]
      };
    },

    computed: {
      internalValue: {
        get() {
          return this.internalLazyValue;
        },

        set(val) {
          if (val === this.internalLazyValue) return;
          this.internalLazyValue = val;
          this.$emit(event, val);
        }

      }
    },
    watch: {
      [prop](val) {
        this.internalLazyValue = val;
      }

    }
  });
}
/* eslint-disable-next-line @typescript-eslint/no-redeclare */

const Proxyable = factory();
export default Proxyable;
//# sourceMappingURL=index.js.map
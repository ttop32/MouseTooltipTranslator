import Vue from 'vue';
import { filterObjectOnKeys } from '../../util/helpers';
const availableProps = {
  absolute: Boolean,
  bottom: Boolean,
  fixed: Boolean,
  left: Boolean,
  right: Boolean,
  top: Boolean
};
export function factory(selected = []) {
  return Vue.extend({
    name: 'positionable',
    props: selected.length ? filterObjectOnKeys(availableProps, selected) : availableProps
  });
}
export default factory(); // Add a `*` before the second `/`

/* Tests /
let single = factory(['top']).extend({
  created () {
    this.top
    this.bottom
    this.absolute
  }
})

let some = factory(['top', 'bottom']).extend({
  created () {
    this.top
    this.bottom
    this.absolute
  }
})

let all = factory().extend({
  created () {
    this.top
    this.bottom
    this.absolute
    this.foobar
  }
})
/**/
//# sourceMappingURL=index.js.map
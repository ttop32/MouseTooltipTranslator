"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.factory = factory;
exports.default = void 0;

var _vue = _interopRequireDefault(require("vue"));

var _helpers = require("../../util/helpers");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var availableProps = {
  absolute: Boolean,
  bottom: Boolean,
  fixed: Boolean,
  left: Boolean,
  right: Boolean,
  top: Boolean
};

function factory() {
  var selected = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
  return _vue.default.extend({
    name: 'positionable',
    props: selected.length ? (0, _helpers.filterObjectOnKeys)(availableProps, selected) : availableProps
  });
}

var _default = factory(); // Add a `*` before the second `/`

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


exports.default = _default;
//# sourceMappingURL=index.js.map
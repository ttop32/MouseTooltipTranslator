"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = VGrid;

var _vue = _interopRequireDefault(require("vue"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Types
function VGrid(name) {
  /* @vue/component */
  return _vue.default.extend({
    name: "v-".concat(name),
    functional: true,
    props: {
      id: String,
      tag: {
        type: String,
        default: 'div'
      }
    },
    render: function render(h, _ref) {
      var props = _ref.props,
          data = _ref.data,
          children = _ref.children;
      data.staticClass = "".concat(name, " ").concat(data.staticClass || '').trim();
      var attrs = data.attrs;

      if (attrs) {
        // reset attrs to extract utility clases like pa-3
        data.attrs = {};
        var classes = Object.keys(attrs).filter(function (key) {
          // TODO: Remove once resolved
          // https://github.com/vuejs/vue/issues/7841
          if (key === 'slot') return false;
          var value = attrs[key]; // add back data attributes like data-test="foo" but do not
          // add them as classes

          if (key.startsWith('data-')) {
            data.attrs[key] = value;
            return false;
          }

          return value || typeof value === 'string';
        });
        if (classes.length) data.staticClass += " ".concat(classes.join(' '));
      }

      if (props.id) {
        data.domProps = data.domProps || {};
        data.domProps.id = props.id;
      }

      return h(props.tag, data, children);
    }
  });
}
//# sourceMappingURL=grid.js.map
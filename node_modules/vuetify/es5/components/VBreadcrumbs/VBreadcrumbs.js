"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("../../../src/components/VBreadcrumbs/VBreadcrumbs.sass");

var _VBreadcrumbsItem = _interopRequireDefault(require("./VBreadcrumbsItem"));

var _VBreadcrumbsDivider = _interopRequireDefault(require("./VBreadcrumbsDivider"));

var _themeable = _interopRequireDefault(require("../../mixins/themeable"));

var _mixins = _interopRequireDefault(require("../../util/mixins"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _default2 = (0, _mixins.default)(_themeable.default
/* @vue/component */
).extend({
  name: 'v-breadcrumbs',
  props: {
    divider: {
      type: String,
      default: '/'
    },
    items: {
      type: Array,
      default: function _default() {
        return [];
      }
    },
    large: Boolean
  },
  computed: {
    classes: function classes() {
      return _objectSpread({
        'v-breadcrumbs--large': this.large
      }, this.themeClasses);
    }
  },
  methods: {
    genDivider: function genDivider() {
      return this.$createElement(_VBreadcrumbsDivider.default, this.$slots.divider ? this.$slots.divider : this.divider);
    },
    genItems: function genItems() {
      var items = [];
      var hasSlot = !!this.$scopedSlots.item;
      var keys = [];

      for (var i = 0; i < this.items.length; i++) {
        var item = this.items[i];
        keys.push(item.text);
        if (hasSlot) items.push(this.$scopedSlots.item({
          item: item
        }));else items.push(this.$createElement(_VBreadcrumbsItem.default, {
          key: keys.join('.'),
          props: item
        }, [item.text]));
        if (i < this.items.length - 1) items.push(this.genDivider());
      }

      return items;
    }
  },
  render: function render(h) {
    var children = this.$slots.default || this.genItems();
    return h('ul', {
      staticClass: 'v-breadcrumbs',
      class: this.classes
    }, children);
  }
});

exports.default = _default2;
//# sourceMappingURL=VBreadcrumbs.js.map
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("../../../src/components/VDataTable/VSimpleTable.sass");

var _helpers = require("../../util/helpers");

var _themeable = _interopRequireDefault(require("../../mixins/themeable"));

var _mixins = _interopRequireDefault(require("../../util/mixins"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _default = (0, _mixins.default)(_themeable.default).extend({
  name: 'v-simple-table',
  props: {
    dense: Boolean,
    fixedHeader: Boolean,
    height: [Number, String]
  },
  computed: {
    classes: function classes() {
      return _objectSpread({
        'v-data-table--dense': this.dense,
        'v-data-table--fixed-height': !!this.height && !this.fixedHeader,
        'v-data-table--fixed-header': this.fixedHeader,
        'v-data-table--has-top': !!this.$slots.top,
        'v-data-table--has-bottom': !!this.$slots.bottom
      }, this.themeClasses);
    }
  },
  methods: {
    genWrapper: function genWrapper() {
      return this.$slots.wrapper || this.$createElement('div', {
        staticClass: 'v-data-table__wrapper',
        style: {
          height: (0, _helpers.convertToUnit)(this.height)
        }
      }, [this.$createElement('table', this.$slots.default)]);
    }
  },
  render: function render(h) {
    return h('div', {
      staticClass: 'v-data-table',
      class: this.classes
    }, [this.$slots.top, this.genWrapper(), this.$slots.bottom]);
  }
});

exports.default = _default;
//# sourceMappingURL=VSimpleTable.js.map
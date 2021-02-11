"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("../../../src/components/VFooter/VFooter.sass");

var _VSheet = _interopRequireDefault(require("../VSheet/VSheet"));

var _applicationable = _interopRequireDefault(require("../../mixins/applicationable"));

var _ssrBootable = _interopRequireDefault(require("../../mixins/ssr-bootable"));

var _mixins = _interopRequireDefault(require("../../util/mixins"));

var _helpers = require("../../util/helpers");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/* @vue/component */
var _default = (0, _mixins.default)(_VSheet.default, (0, _applicationable.default)('footer', ['height', 'inset']), _ssrBootable.default).extend({
  name: 'v-footer',
  props: {
    height: {
      default: 'auto',
      type: [Number, String]
    },
    inset: Boolean,
    padless: Boolean,
    tag: {
      type: String,
      default: 'footer'
    }
  },
  computed: {
    applicationProperty: function applicationProperty() {
      return this.inset ? 'insetFooter' : 'footer';
    },
    classes: function classes() {
      return _objectSpread({}, _VSheet.default.options.computed.classes.call(this), {
        'v-footer--absolute': this.absolute,
        'v-footer--fixed': !this.absolute && (this.app || this.fixed),
        'v-footer--padless': this.padless,
        'v-footer--inset': this.inset
      });
    },
    computedBottom: function computedBottom() {
      if (!this.isPositioned) return undefined;
      return this.app ? this.$vuetify.application.bottom : 0;
    },
    computedLeft: function computedLeft() {
      if (!this.isPositioned) return undefined;
      return this.app && this.inset ? this.$vuetify.application.left : 0;
    },
    computedRight: function computedRight() {
      if (!this.isPositioned) return undefined;
      return this.app && this.inset ? this.$vuetify.application.right : 0;
    },
    isPositioned: function isPositioned() {
      return Boolean(this.absolute || this.fixed || this.app);
    },
    styles: function styles() {
      var height = parseInt(this.height);
      return _objectSpread({}, _VSheet.default.options.computed.styles.call(this), {
        height: isNaN(height) ? height : (0, _helpers.convertToUnit)(height),
        left: (0, _helpers.convertToUnit)(this.computedLeft),
        right: (0, _helpers.convertToUnit)(this.computedRight),
        bottom: (0, _helpers.convertToUnit)(this.computedBottom)
      });
    }
  },
  methods: {
    updateApplication: function updateApplication() {
      var height = parseInt(this.height);
      return isNaN(height) ? this.$el ? this.$el.clientHeight : 0 : height;
    }
  },
  render: function render(h) {
    var data = this.setBackgroundColor(this.color, {
      staticClass: 'v-footer',
      class: this.classes,
      style: this.styles
    });
    return h(this.tag, data, this.$slots.default);
  }
});

exports.default = _default;
//# sourceMappingURL=VFooter.js.map
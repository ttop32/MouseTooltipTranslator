"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _groupable = require("../../mixins/groupable");

var _routable = _interopRequireDefault(require("../../mixins/routable"));

var _themeable = _interopRequireDefault(require("../../mixins/themeable"));

var _helpers = require("./../../util/helpers");

var _mixins = _interopRequireDefault(require("../../util/mixins"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var baseMixins = (0, _mixins.default)(_routable.default, // Must be after routable
// to overwrite activeClass
(0, _groupable.factory)('tabsBar'), _themeable.default);

var _default = baseMixins.extend().extend().extend({
  name: 'v-tab',
  props: {
    ripple: {
      type: [Boolean, Object],
      default: true
    }
  },
  data: function data() {
    return {
      proxyClass: 'v-tab--active'
    };
  },
  computed: {
    classes: function classes() {
      return _objectSpread({
        'v-tab': true
      }, _routable.default.options.computed.classes.call(this), {
        'v-tab--disabled': this.disabled
      }, this.groupClasses);
    },
    value: function value() {
      var to = this.to || this.href || '';

      if (this.$router && this.to === Object(this.to)) {
        var resolve = this.$router.resolve(this.to, this.$route, this.append);
        to = resolve.href;
      }

      return to.replace('#', '');
    }
  },
  mounted: function mounted() {
    this.onRouteChange();
  },
  methods: {
    click: function click(e) {
      // If user provides an
      // actual link, do not
      // prevent default
      if (this.href && this.href.indexOf('#') > -1) e.preventDefault();
      if (e.detail) this.$el.blur();
      this.$emit('click', e);
      this.to || this.toggle();
    }
  },
  render: function render(h) {
    var _this = this;

    var _this$generateRouteLi = this.generateRouteLink(),
        tag = _this$generateRouteLi.tag,
        data = _this$generateRouteLi.data;

    data.attrs = _objectSpread({}, data.attrs, {
      'aria-selected': String(this.isActive),
      role: 'tab',
      tabindex: 0
    });
    data.on = _objectSpread({}, data.on, {
      keydown: function keydown(e) {
        if (e.keyCode === _helpers.keyCodes.enter) _this.click(e);

        _this.$emit('keydown', e);
      }
    });
    return h(tag, data, this.$slots.default);
  }
});

exports.default = _default;
//# sourceMappingURL=VTab.js.map
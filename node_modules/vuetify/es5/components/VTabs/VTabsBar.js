"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _VSlideGroup = require("../VSlideGroup/VSlideGroup");

var _themeable = _interopRequireDefault(require("../../mixins/themeable"));

var _ssrBootable = _interopRequireDefault(require("../../mixins/ssr-bootable"));

var _mixins = _interopRequireDefault(require("../../util/mixins"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _default = (0, _mixins.default)(_VSlideGroup.BaseSlideGroup, _ssrBootable.default, _themeable.default
/* @vue/component */
).extend({
  name: 'v-tabs-bar',
  provide: function provide() {
    return {
      tabsBar: this
    };
  },
  computed: {
    classes: function classes() {
      return _objectSpread({}, _VSlideGroup.BaseSlideGroup.options.computed.classes.call(this), {
        'v-tabs-bar': true,
        'v-tabs-bar--is-mobile': this.isMobile,
        // TODO: Remove this and move to v-slide-group
        'v-tabs-bar--show-arrows': this.showArrows
      }, this.themeClasses);
    }
  },
  watch: {
    items: 'callSlider',
    internalValue: 'callSlider',
    $route: 'onRouteChange'
  },
  methods: {
    callSlider: function callSlider() {
      if (!this.isBooted) return;
      this.$emit('call:slider');
    },
    genContent: function genContent() {
      var render = _VSlideGroup.BaseSlideGroup.options.methods.genContent.call(this);

      render.data = render.data || {};
      render.data.staticClass += ' v-tabs-bar__content';
      return render;
    },
    onRouteChange: function onRouteChange(val, oldVal) {
      /* istanbul ignore next */
      if (this.mandatory) return;
      var items = this.items;
      var newPath = val.path;
      var oldPath = oldVal.path;
      var hasNew = false;
      var hasOld = false;
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = items[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var item = _step.value;
          if (item.to === newPath) hasNew = true;else if (item.to === oldPath) hasOld = true;
          if (hasNew && hasOld) break;
        } // If we have an old item and not a new one
        // it's assumed that the user navigated to
        // a path that is not present in the items

      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return != null) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      if (!hasNew && hasOld) this.internalValue = undefined;
    }
  },
  render: function render(h) {
    var render = _VSlideGroup.BaseSlideGroup.options.render.call(this, h);

    render.data.attrs = {
      role: 'tablist'
    };
    return render;
  }
});

exports.default = _default;
//# sourceMappingURL=VTabsBar.js.map
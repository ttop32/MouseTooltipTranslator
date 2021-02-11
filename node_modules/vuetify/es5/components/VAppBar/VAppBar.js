"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("../../../src/components/VAppBar/VAppBar.sass");

var _VToolbar = _interopRequireDefault(require("../VToolbar/VToolbar"));

var _scroll = _interopRequireDefault(require("../../directives/scroll"));

var _applicationable = _interopRequireDefault(require("../../mixins/applicationable"));

var _scrollable = _interopRequireDefault(require("../../mixins/scrollable"));

var _ssrBootable = _interopRequireDefault(require("../../mixins/ssr-bootable"));

var _toggleable = _interopRequireDefault(require("../../mixins/toggleable"));

var _helpers = require("../../util/helpers");

var _mixins = _interopRequireDefault(require("../../util/mixins"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var baseMixins = (0, _mixins.default)(_VToolbar.default, _scrollable.default, _ssrBootable.default, _toggleable.default, (0, _applicationable.default)('top', ['clippedLeft', 'clippedRight', 'computedHeight', 'invertedScroll', 'isExtended', 'isProminent', 'value']));
/* @vue/component */

var _default = baseMixins.extend({
  name: 'v-app-bar',
  directives: {
    Scroll: _scroll.default
  },
  provide: function provide() {
    return {
      VAppBar: this
    };
  },
  props: {
    clippedLeft: Boolean,
    clippedRight: Boolean,
    collapseOnScroll: Boolean,
    elevateOnScroll: Boolean,
    fadeImgOnScroll: Boolean,
    hideOnScroll: Boolean,
    invertedScroll: Boolean,
    scrollOffScreen: Boolean,
    shrinkOnScroll: Boolean,
    value: {
      type: Boolean,
      default: true
    }
  },
  data: function data() {
    return {
      isActive: this.value
    };
  },
  computed: {
    applicationProperty: function applicationProperty() {
      return !this.bottom ? 'top' : 'bottom';
    },
    canScroll: function canScroll() {
      return _scrollable.default.options.computed.canScroll.call(this) && (this.invertedScroll || this.elevateOnScroll || this.hideOnScroll || this.collapseOnScroll || this.isBooted || // If falsy, user has provided an
      // explicit value which should
      // overwrite anything we do
      !this.value);
    },
    classes: function classes() {
      return _objectSpread({}, _VToolbar.default.options.computed.classes.call(this), {
        'v-toolbar--collapse': this.collapse || this.collapseOnScroll,
        'v-app-bar': true,
        'v-app-bar--clipped': this.clippedLeft || this.clippedRight,
        'v-app-bar--fade-img-on-scroll': this.fadeImgOnScroll,
        'v-app-bar--elevate-on-scroll': this.elevateOnScroll,
        'v-app-bar--fixed': !this.absolute && (this.app || this.fixed),
        'v-app-bar--hide-shadow': this.hideShadow,
        'v-app-bar--is-scrolled': this.currentScroll > 0,
        'v-app-bar--shrink-on-scroll': this.shrinkOnScroll
      });
    },
    scrollRatio: function scrollRatio() {
      var threshold = this.computedScrollThreshold;
      return Math.max((threshold - this.currentScroll) / threshold, 0);
    },
    computedContentHeight: function computedContentHeight() {
      if (!this.shrinkOnScroll) return _VToolbar.default.options.computed.computedContentHeight.call(this);
      var min = this.dense ? 48 : 56;
      var max = this.computedOriginalHeight;
      return min + (max - min) * this.scrollRatio;
    },
    computedFontSize: function computedFontSize() {
      if (!this.isProminent) return undefined;
      var min = 1.25;
      var max = 1.5;
      return min + (max - min) * this.scrollRatio;
    },
    computedLeft: function computedLeft() {
      if (!this.app || this.clippedLeft) return 0;
      return this.$vuetify.application.left;
    },
    computedMarginTop: function computedMarginTop() {
      if (!this.app) return 0;
      return this.$vuetify.application.bar;
    },
    computedOpacity: function computedOpacity() {
      if (!this.fadeImgOnScroll) return undefined;
      return this.scrollRatio;
    },
    computedOriginalHeight: function computedOriginalHeight() {
      var height = _VToolbar.default.options.computed.computedContentHeight.call(this);

      if (this.isExtended) height += parseInt(this.extensionHeight);
      return height;
    },
    computedRight: function computedRight() {
      if (!this.app || this.clippedRight) return 0;
      return this.$vuetify.application.right;
    },
    computedScrollThreshold: function computedScrollThreshold() {
      if (this.scrollThreshold) return Number(this.scrollThreshold);
      return this.computedOriginalHeight - (this.dense ? 48 : 56);
    },
    computedTransform: function computedTransform() {
      if (!this.canScroll || this.elevateOnScroll && this.currentScroll === 0 && this.isActive) return 0;
      if (this.isActive) return 0;
      var scrollOffScreen = this.scrollOffScreen ? this.computedHeight : this.computedContentHeight;
      return this.bottom ? scrollOffScreen : -scrollOffScreen;
    },
    hideShadow: function hideShadow() {
      if (this.elevateOnScroll && this.isExtended) {
        return this.currentScroll < this.computedScrollThreshold;
      }

      if (this.elevateOnScroll) {
        return this.currentScroll === 0 || this.computedTransform < 0;
      }

      return (!this.isExtended || this.scrollOffScreen) && this.computedTransform !== 0;
    },
    isCollapsed: function isCollapsed() {
      if (!this.collapseOnScroll) {
        return _VToolbar.default.options.computed.isCollapsed.call(this);
      }

      return this.currentScroll > 0;
    },
    isProminent: function isProminent() {
      return _VToolbar.default.options.computed.isProminent.call(this) || this.shrinkOnScroll;
    },
    styles: function styles() {
      return _objectSpread({}, _VToolbar.default.options.computed.styles.call(this), {
        fontSize: (0, _helpers.convertToUnit)(this.computedFontSize, 'rem'),
        marginTop: (0, _helpers.convertToUnit)(this.computedMarginTop),
        transform: "translateY(".concat((0, _helpers.convertToUnit)(this.computedTransform), ")"),
        left: (0, _helpers.convertToUnit)(this.computedLeft),
        right: (0, _helpers.convertToUnit)(this.computedRight)
      });
    }
  },
  watch: {
    canScroll: 'onScroll',
    computedTransform: function computedTransform() {
      // Normally we do not want the v-app-bar
      // to update the application top value
      // to avoid screen jump. However, in
      // this situation, we must so that
      // the clipped drawer can update
      // its top value when scrolled
      if (!this.canScroll || !this.clippedLeft && !this.clippedRight) return;
      this.callUpdate();
    },
    invertedScroll: function invertedScroll(val) {
      this.isActive = !val || this.currentScroll !== 0;
    }
  },
  created: function created() {
    if (this.invertedScroll) this.isActive = false;
  },
  methods: {
    genBackground: function genBackground() {
      var render = _VToolbar.default.options.methods.genBackground.call(this);

      render.data = this._b(render.data || {}, render.tag, {
        style: {
          opacity: this.computedOpacity
        }
      });
      return render;
    },
    updateApplication: function updateApplication() {
      return this.invertedScroll ? 0 : this.computedHeight + this.computedTransform;
    },
    thresholdMet: function thresholdMet() {
      if (this.invertedScroll) {
        this.isActive = this.currentScroll > this.computedScrollThreshold;
        return;
      }

      if (this.hideOnScroll) {
        this.isActive = this.isScrollingUp || this.currentScroll < this.computedScrollThreshold;
      }

      if (this.currentThreshold < this.computedScrollThreshold) return;
      this.savedScroll = this.currentScroll;
    }
  },
  render: function render(h) {
    var render = _VToolbar.default.options.render.call(this, h);

    render.data = render.data || {};

    if (this.canScroll) {
      render.data.directives = render.data.directives || [];
      render.data.directives.push({
        arg: this.scrollTarget,
        name: 'scroll',
        value: this.onScroll
      });
    }

    return render;
  }
});

exports.default = _default;
//# sourceMappingURL=VAppBar.js.map
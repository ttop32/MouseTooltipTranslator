"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("../../../src/components/VNavigationDrawer/VNavigationDrawer.sass");

var _VImg = _interopRequireDefault(require("../VImg/VImg"));

var _applicationable = _interopRequireDefault(require("../../mixins/applicationable"));

var _colorable = _interopRequireDefault(require("../../mixins/colorable"));

var _dependent = _interopRequireDefault(require("../../mixins/dependent"));

var _mobile = _interopRequireDefault(require("../../mixins/mobile"));

var _overlayable = _interopRequireDefault(require("../../mixins/overlayable"));

var _ssrBootable = _interopRequireDefault(require("../../mixins/ssr-bootable"));

var _themeable = _interopRequireDefault(require("../../mixins/themeable"));

var _clickOutside = _interopRequireDefault(require("../../directives/click-outside"));

var _resize = _interopRequireDefault(require("../../directives/resize"));

var _touch = _interopRequireDefault(require("../../directives/touch"));

var _helpers = require("../../util/helpers");

var _mixins = _interopRequireDefault(require("../../util/mixins"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var baseMixins = (0, _mixins.default)((0, _applicationable.default)('left', ['isActive', 'isMobile', 'miniVariant', 'expandOnHover', 'permanent', 'right', 'temporary', 'width']), _colorable.default, _dependent.default, _mobile.default, _overlayable.default, _ssrBootable.default, _themeable.default);
/* @vue/component */

var _default2 = baseMixins.extend({
  name: 'v-navigation-drawer',
  directives: {
    ClickOutside: _clickOutside.default,
    Resize: _resize.default,
    Touch: _touch.default
  },
  provide: function provide() {
    return {
      isInNav: this.tag === 'nav'
    };
  },
  props: {
    bottom: Boolean,
    clipped: Boolean,
    disableResizeWatcher: Boolean,
    disableRouteWatcher: Boolean,
    expandOnHover: Boolean,
    floating: Boolean,
    height: {
      type: [Number, String],
      default: function _default() {
        return this.app ? '100vh' : '100%';
      }
    },
    miniVariant: Boolean,
    miniVariantWidth: {
      type: [Number, String],
      default: 56
    },
    permanent: Boolean,
    right: Boolean,
    src: {
      type: [String, Object],
      default: ''
    },
    stateless: Boolean,
    tag: {
      type: String,
      default: function _default() {
        return this.app ? 'nav' : 'aside';
      }
    },
    temporary: Boolean,
    touchless: Boolean,
    width: {
      type: [Number, String],
      default: 256
    },
    value: null
  },
  data: function data() {
    return {
      isMouseover: false,
      touchArea: {
        left: 0,
        right: 0
      },
      stackMinZIndex: 6
    };
  },
  computed: {
    /**
     * Used for setting an app value from a dynamic
     * property. Called from applicationable.js
     */
    applicationProperty: function applicationProperty() {
      return this.right ? 'right' : 'left';
    },
    classes: function classes() {
      return _objectSpread({
        'v-navigation-drawer': true,
        'v-navigation-drawer--absolute': this.absolute,
        'v-navigation-drawer--bottom': this.bottom,
        'v-navigation-drawer--clipped': this.clipped,
        'v-navigation-drawer--close': !this.isActive,
        'v-navigation-drawer--fixed': !this.absolute && (this.app || this.fixed),
        'v-navigation-drawer--floating': this.floating,
        'v-navigation-drawer--is-mobile': this.isMobile,
        'v-navigation-drawer--is-mouseover': this.isMouseover,
        'v-navigation-drawer--mini-variant': this.isMiniVariant,
        'v-navigation-drawer--custom-mini-variant': Number(this.miniVariantWidth) !== 56,
        'v-navigation-drawer--open': this.isActive,
        'v-navigation-drawer--open-on-hover': this.expandOnHover,
        'v-navigation-drawer--right': this.right,
        'v-navigation-drawer--temporary': this.temporary
      }, this.themeClasses);
    },
    computedMaxHeight: function computedMaxHeight() {
      if (!this.hasApp) return null;
      var computedMaxHeight = this.$vuetify.application.bottom + this.$vuetify.application.footer + this.$vuetify.application.bar;
      if (!this.clipped) return computedMaxHeight;
      return computedMaxHeight + this.$vuetify.application.top;
    },
    computedTop: function computedTop() {
      if (!this.hasApp) return 0;
      var computedTop = this.$vuetify.application.bar;
      computedTop += this.clipped ? this.$vuetify.application.top : 0;
      return computedTop;
    },
    computedTransform: function computedTransform() {
      if (this.isActive) return 0;
      if (this.isBottom) return 100;
      return this.right ? 100 : -100;
    },
    computedWidth: function computedWidth() {
      return this.isMiniVariant ? this.miniVariantWidth : this.width;
    },
    hasApp: function hasApp() {
      return this.app && !this.isMobile && !this.temporary;
    },
    isBottom: function isBottom() {
      return this.bottom && this.isMobile;
    },
    isMiniVariant: function isMiniVariant() {
      return !this.expandOnHover && this.miniVariant || this.expandOnHover && !this.isMouseover;
    },
    isMobile: function isMobile() {
      return !this.stateless && !this.permanent && _mobile.default.options.computed.isMobile.call(this);
    },
    reactsToClick: function reactsToClick() {
      return !this.stateless && !this.permanent && (this.isMobile || this.temporary);
    },
    reactsToMobile: function reactsToMobile() {
      return this.app && !this.disableResizeWatcher && !this.permanent && !this.stateless && !this.temporary;
    },
    reactsToResize: function reactsToResize() {
      return !this.disableResizeWatcher && !this.stateless;
    },
    reactsToRoute: function reactsToRoute() {
      return !this.disableRouteWatcher && !this.stateless && (this.temporary || this.isMobile);
    },
    showOverlay: function showOverlay() {
      return !this.hideOverlay && this.isActive && (this.isMobile || this.temporary);
    },
    styles: function styles() {
      var translate = this.isBottom ? 'translateY' : 'translateX';
      return {
        height: (0, _helpers.convertToUnit)(this.height),
        top: !this.isBottom ? (0, _helpers.convertToUnit)(this.computedTop) : 'auto',
        maxHeight: this.computedMaxHeight != null ? "calc(100% - ".concat((0, _helpers.convertToUnit)(this.computedMaxHeight), ")") : undefined,
        transform: "".concat(translate, "(").concat((0, _helpers.convertToUnit)(this.computedTransform, '%'), ")"),
        width: (0, _helpers.convertToUnit)(this.computedWidth)
      };
    }
  },
  watch: {
    $route: 'onRouteChange',
    isActive: function isActive(val) {
      this.$emit('input', val);
    },

    /**
     * When mobile changes, adjust the active state
     * only when there has been a previous value
     */
    isMobile: function isMobile(val, prev) {
      !val && this.isActive && !this.temporary && this.removeOverlay();
      if (prev == null || !this.reactsToResize || !this.reactsToMobile) return;
      this.isActive = !val;
    },
    permanent: function permanent(val) {
      // If enabling prop enable the drawer
      if (val) this.isActive = true;
    },
    showOverlay: function showOverlay(val) {
      if (val) this.genOverlay();else this.removeOverlay();
    },
    value: function value(val) {
      if (this.permanent) return;

      if (val == null) {
        this.init();
        return;
      }

      if (val !== this.isActive) this.isActive = val;
    },
    expandOnHover: 'updateMiniVariant',
    isMouseover: function isMouseover(val) {
      this.updateMiniVariant(!val);
    }
  },
  beforeMount: function beforeMount() {
    this.init();
  },
  methods: {
    calculateTouchArea: function calculateTouchArea() {
      var parent = this.$el.parentNode;
      if (!parent) return;
      var parentRect = parent.getBoundingClientRect();
      this.touchArea = {
        left: parentRect.left + 50,
        right: parentRect.right - 50
      };
    },
    closeConditional: function closeConditional() {
      return this.isActive && !this._isDestroyed && this.reactsToClick;
    },
    genAppend: function genAppend() {
      return this.genPosition('append');
    },
    genBackground: function genBackground() {
      var props = {
        height: '100%',
        width: '100%',
        src: this.src
      };
      var image = this.$scopedSlots.img ? this.$scopedSlots.img(props) : this.$createElement(_VImg.default, {
        props: props
      });
      return this.$createElement('div', {
        staticClass: 'v-navigation-drawer__image'
      }, [image]);
    },
    genDirectives: function genDirectives() {
      var _this = this;

      var directives = [{
        name: 'click-outside',
        value: {
          handler: function handler() {
            _this.isActive = false;
          },
          closeConditional: this.closeConditional,
          include: this.getOpenDependentElements
        }
      }];

      if (!this.touchless && !this.stateless) {
        directives.push({
          name: 'touch',
          value: {
            parent: true,
            left: this.swipeLeft,
            right: this.swipeRight
          }
        });
      }

      return directives;
    },
    genListeners: function genListeners() {
      var _this2 = this;

      var on = {
        transitionend: function transitionend(e) {
          if (e.target !== e.currentTarget) return;

          _this2.$emit('transitionend', e); // IE11 does not support new Event('resize')


          var resizeEvent = document.createEvent('UIEvents');
          resizeEvent.initUIEvent('resize', true, false, window, 0);
          window.dispatchEvent(resizeEvent);
        }
      };

      if (this.miniVariant) {
        on.click = function () {
          return _this2.$emit('update:mini-variant', false);
        };
      }

      if (this.expandOnHover) {
        on.mouseenter = function () {
          return _this2.isMouseover = true;
        };

        on.mouseleave = function () {
          return _this2.isMouseover = false;
        };
      }

      return on;
    },
    genPosition: function genPosition(name) {
      var slot = (0, _helpers.getSlot)(this, name);
      if (!slot) return slot;
      return this.$createElement('div', {
        staticClass: "v-navigation-drawer__".concat(name)
      }, slot);
    },
    genPrepend: function genPrepend() {
      return this.genPosition('prepend');
    },
    genContent: function genContent() {
      return this.$createElement('div', {
        staticClass: 'v-navigation-drawer__content'
      }, this.$slots.default);
    },
    genBorder: function genBorder() {
      return this.$createElement('div', {
        staticClass: 'v-navigation-drawer__border'
      });
    },
    init: function init() {
      if (this.permanent) {
        this.isActive = true;
      } else if (this.stateless || this.value != null) {
        this.isActive = this.value;
      } else if (!this.temporary) {
        this.isActive = !this.isMobile;
      }
    },
    onRouteChange: function onRouteChange() {
      if (this.reactsToRoute && this.closeConditional()) {
        this.isActive = false;
      }
    },
    swipeLeft: function swipeLeft(e) {
      if (this.isActive && this.right) return;
      this.calculateTouchArea();
      if (Math.abs(e.touchendX - e.touchstartX) < 100) return;
      if (this.right && e.touchstartX >= this.touchArea.right) this.isActive = true;else if (!this.right && this.isActive) this.isActive = false;
    },
    swipeRight: function swipeRight(e) {
      if (this.isActive && !this.right) return;
      this.calculateTouchArea();
      if (Math.abs(e.touchendX - e.touchstartX) < 100) return;
      if (!this.right && e.touchstartX <= this.touchArea.left) this.isActive = true;else if (this.right && this.isActive) this.isActive = false;
    },

    /**
     * Update the application layout
     */
    updateApplication: function updateApplication() {
      if (!this.isActive || this.isMobile || this.temporary || !this.$el) return 0;
      var width = Number(this.computedWidth);
      return isNaN(width) ? this.$el.clientWidth : width;
    },
    updateMiniVariant: function updateMiniVariant(val) {
      if (this.miniVariant !== val) this.$emit('update:mini-variant', val);
    }
  },
  render: function render(h) {
    var children = [this.genPrepend(), this.genContent(), this.genAppend(), this.genBorder()];
    if (this.src || (0, _helpers.getSlot)(this, 'img')) children.unshift(this.genBackground());
    return h(this.tag, this.setBackgroundColor(this.color, {
      class: this.classes,
      style: this.styles,
      directives: this.genDirectives(),
      on: this.genListeners()
    }), children);
  }
});

exports.default = _default2;
//# sourceMappingURL=VNavigationDrawer.js.map
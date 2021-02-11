"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _VOverlay = _interopRequireDefault(require("../../components/VOverlay"));

var _helpers = require("../../util/helpers");

var _vue = _interopRequireDefault(require("vue"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Components
// Utilities
// Types

/* @vue/component */
var _default = _vue.default.extend().extend({
  name: 'overlayable',
  props: {
    hideOverlay: Boolean,
    overlayColor: String,
    overlayOpacity: [Number, String]
  },
  data: function data() {
    return {
      animationFrame: 0,
      overlay: null
    };
  },
  watch: {
    hideOverlay: function hideOverlay(value) {
      if (!this.isActive) return;
      if (value) this.removeOverlay();else this.genOverlay();
    }
  },
  beforeDestroy: function beforeDestroy() {
    this.removeOverlay();
  },
  methods: {
    createOverlay: function createOverlay() {
      var overlay = new _VOverlay.default({
        propsData: {
          absolute: this.absolute,
          value: false,
          color: this.overlayColor,
          opacity: this.overlayOpacity
        }
      });
      overlay.$mount();
      var parent = this.absolute ? this.$el.parentNode : document.querySelector('[data-app]');
      parent && parent.insertBefore(overlay.$el, parent.firstChild);
      this.overlay = overlay;
    },
    genOverlay: function genOverlay() {
      var _this = this;

      this.hideScroll();
      if (this.hideOverlay) return;
      if (!this.overlay) this.createOverlay();
      this.animationFrame = requestAnimationFrame(function () {
        if (!_this.overlay) return;

        if (_this.activeZIndex !== undefined) {
          _this.overlay.zIndex = String(_this.activeZIndex - 1);
        } else if (_this.$el) {
          _this.overlay.zIndex = (0, _helpers.getZIndex)(_this.$el);
        }

        _this.overlay.value = true;
      });
      return true;
    },

    /** removeOverlay(false) will not restore the scollbar afterwards */
    removeOverlay: function removeOverlay() {
      var _this2 = this;

      var showScroll = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;

      if (this.overlay) {
        (0, _helpers.addOnceEventListener)(this.overlay.$el, 'transitionend', function () {
          if (!_this2.overlay || !_this2.overlay.$el || !_this2.overlay.$el.parentNode || _this2.overlay.value) return;

          _this2.overlay.$el.parentNode.removeChild(_this2.overlay.$el);

          _this2.overlay.$destroy();

          _this2.overlay = null;
        }); // Cancel animation frame in case
        // overlay is removed before it
        // has finished its animation

        cancelAnimationFrame(this.animationFrame);
        this.overlay.value = false;
      }

      showScroll && this.showScroll();
    },
    scrollListener: function scrollListener(e) {
      if (e.type === 'keydown') {
        if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName) || // https://github.com/vuetifyjs/vuetify/issues/4715
        e.target.isContentEditable) return;
        var up = [_helpers.keyCodes.up, _helpers.keyCodes.pageup];
        var down = [_helpers.keyCodes.down, _helpers.keyCodes.pagedown];

        if (up.includes(e.keyCode)) {
          e.deltaY = -1;
        } else if (down.includes(e.keyCode)) {
          e.deltaY = 1;
        } else {
          return;
        }
      }

      if (e.target === this.overlay || e.type !== 'keydown' && e.target === document.body || this.checkPath(e)) e.preventDefault();
    },
    hasScrollbar: function hasScrollbar(el) {
      if (!el || el.nodeType !== Node.ELEMENT_NODE) return false;
      var style = window.getComputedStyle(el);
      return ['auto', 'scroll'].includes(style.overflowY) && el.scrollHeight > el.clientHeight;
    },
    shouldScroll: function shouldScroll(el, delta) {
      if (el.scrollTop === 0 && delta < 0) return true;
      return el.scrollTop + el.clientHeight === el.scrollHeight && delta > 0;
    },
    isInside: function isInside(el, parent) {
      if (el === parent) {
        return true;
      } else if (el === null || el === document.body) {
        return false;
      } else {
        return this.isInside(el.parentNode, parent);
      }
    },
    checkPath: function checkPath(e) {
      var path = e.path || this.composedPath(e);
      var delta = e.deltaY;

      if (e.type === 'keydown' && path[0] === document.body) {
        var dialog = this.$refs.dialog; // getSelection returns null in firefox in some edge cases, can be ignored

        var selected = window.getSelection().anchorNode;

        if (dialog && this.hasScrollbar(dialog) && this.isInside(selected, dialog)) {
          return this.shouldScroll(dialog, delta);
        }

        return true;
      }

      for (var index = 0; index < path.length; index++) {
        var el = path[index];
        if (el === document) return true;
        if (el === document.documentElement) return true;
        if (el === this.$refs.content) return true;
        if (this.hasScrollbar(el)) return this.shouldScroll(el, delta);
      }

      return true;
    },

    /**
     * Polyfill for Event.prototype.composedPath
     */
    composedPath: function composedPath(e) {
      if (e.composedPath) return e.composedPath();
      var path = [];
      var el = e.target;

      while (el) {
        path.push(el);

        if (el.tagName === 'HTML') {
          path.push(document);
          path.push(window);
          return path;
        }

        el = el.parentElement;
      }

      return path;
    },
    hideScroll: function hideScroll() {
      if (this.$vuetify.breakpoint.smAndDown) {
        document.documentElement.classList.add('overflow-y-hidden');
      } else {
        (0, _helpers.addPassiveEventListener)(window, 'wheel', this.scrollListener, {
          passive: false
        });
        window.addEventListener('keydown', this.scrollListener);
      }
    },
    showScroll: function showScroll() {
      document.documentElement.classList.remove('overflow-y-hidden');
      window.removeEventListener('wheel', this.scrollListener);
      window.removeEventListener('keydown', this.scrollListener);
    }
  }
});

exports.default = _default;
//# sourceMappingURL=index.js.map
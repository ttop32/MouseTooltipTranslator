"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("../../../src/components/VDialog/VDialog.sass");

var _VThemeProvider = require("../VThemeProvider");

var _activatable = _interopRequireDefault(require("../../mixins/activatable"));

var _dependent = _interopRequireDefault(require("../../mixins/dependent"));

var _detachable = _interopRequireDefault(require("../../mixins/detachable"));

var _overlayable = _interopRequireDefault(require("../../mixins/overlayable"));

var _returnable = _interopRequireDefault(require("../../mixins/returnable"));

var _stackable = _interopRequireDefault(require("../../mixins/stackable"));

var _toggleable = _interopRequireDefault(require("../../mixins/toggleable"));

var _clickOutside = _interopRequireDefault(require("../../directives/click-outside"));

var _mixins = _interopRequireDefault(require("../../util/mixins"));

var _console = require("../../util/console");

var _helpers = require("../../util/helpers");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var baseMixins = (0, _mixins.default)(_activatable.default, _dependent.default, _detachable.default, _overlayable.default, _returnable.default, _stackable.default, _toggleable.default);
/* @vue/component */

var _default = baseMixins.extend({
  name: 'v-dialog',
  directives: {
    ClickOutside: _clickOutside.default
  },
  props: {
    dark: Boolean,
    disabled: Boolean,
    fullscreen: Boolean,
    light: Boolean,
    maxWidth: {
      type: [String, Number],
      default: 'none'
    },
    noClickAnimation: Boolean,
    origin: {
      type: String,
      default: 'center center'
    },
    persistent: Boolean,
    retainFocus: {
      type: Boolean,
      default: true
    },
    scrollable: Boolean,
    transition: {
      type: [String, Boolean],
      default: 'dialog-transition'
    },
    width: {
      type: [String, Number],
      default: 'auto'
    }
  },
  data: function data() {
    return {
      activatedBy: null,
      animate: false,
      animateTimeout: -1,
      isActive: !!this.value,
      stackMinZIndex: 200,
      previousActiveElement: null
    };
  },
  computed: {
    classes: function classes() {
      var _ref;

      return _ref = {}, _defineProperty(_ref, "v-dialog ".concat(this.contentClass).trim(), true), _defineProperty(_ref, 'v-dialog--active', this.isActive), _defineProperty(_ref, 'v-dialog--persistent', this.persistent), _defineProperty(_ref, 'v-dialog--fullscreen', this.fullscreen), _defineProperty(_ref, 'v-dialog--scrollable', this.scrollable), _defineProperty(_ref, 'v-dialog--animated', this.animate), _ref;
    },
    contentClasses: function contentClasses() {
      return {
        'v-dialog__content': true,
        'v-dialog__content--active': this.isActive
      };
    },
    hasActivator: function hasActivator() {
      return Boolean(!!this.$slots.activator || !!this.$scopedSlots.activator);
    }
  },
  watch: {
    isActive: function isActive(val) {
      if (val) {
        this.show();
        this.hideScroll();
      } else {
        var _this$previousActiveE;

        this.removeOverlay();
        this.unbind();
        (_this$previousActiveE = this.previousActiveElement) == null ? void 0 : _this$previousActiveE.focus();
      }
    },
    fullscreen: function fullscreen(val) {
      if (!this.isActive) return;

      if (val) {
        this.hideScroll();
        this.removeOverlay(false);
      } else {
        this.showScroll();
        this.genOverlay();
      }
    }
  },
  created: function created() {
    /* istanbul ignore next */
    if (this.$attrs.hasOwnProperty('full-width')) {
      (0, _console.removed)('full-width', this);
    }
  },
  beforeMount: function beforeMount() {
    var _this = this;

    this.$nextTick(function () {
      _this.isBooted = _this.isActive;
      _this.isActive && _this.show();
    });
  },
  beforeDestroy: function beforeDestroy() {
    if (typeof window !== 'undefined') this.unbind();
  },
  methods: {
    animateClick: function animateClick() {
      var _this2 = this;

      this.animate = false; // Needed for when clicking very fast
      // outside of the dialog

      this.$nextTick(function () {
        _this2.animate = true;
        window.clearTimeout(_this2.animateTimeout);
        _this2.animateTimeout = window.setTimeout(function () {
          return _this2.animate = false;
        }, 150);
      });
    },
    closeConditional: function closeConditional(e) {
      var target = e.target; // Ignore the click if the dialog is closed or destroyed,
      // if it was on an element inside the content,
      // if it was dragged onto the overlay (#6969),
      // or if this isn't the topmost dialog (#9907)

      return !(this._isDestroyed || !this.isActive || this.$refs.content.contains(target) || this.overlay && target && !this.overlay.$el.contains(target)) && this.activeZIndex >= this.getMaxZIndex();
    },
    hideScroll: function hideScroll() {
      if (this.fullscreen) {
        document.documentElement.classList.add('overflow-y-hidden');
      } else {
        _overlayable.default.options.methods.hideScroll.call(this);
      }
    },
    show: function show() {
      var _this3 = this;

      !this.fullscreen && !this.hideOverlay && this.genOverlay(); // Double nextTick to wait for lazy content to be generated

      this.$nextTick(function () {
        _this3.$nextTick(function () {
          _this3.previousActiveElement = document.activeElement;

          _this3.$refs.content.focus();

          _this3.bind();
        });
      });
    },
    bind: function bind() {
      window.addEventListener('focusin', this.onFocusin);
    },
    unbind: function unbind() {
      window.removeEventListener('focusin', this.onFocusin);
    },
    onClickOutside: function onClickOutside(e) {
      this.$emit('click:outside', e);

      if (this.persistent) {
        this.noClickAnimation || this.animateClick();
      } else {
        this.isActive = false;
      }
    },
    onKeydown: function onKeydown(e) {
      if (e.keyCode === _helpers.keyCodes.esc && !this.getOpenDependents().length) {
        if (!this.persistent) {
          this.isActive = false;
          var activator = this.getActivator();
          this.$nextTick(function () {
            return activator && activator.focus();
          });
        } else if (!this.noClickAnimation) {
          this.animateClick();
        }
      }

      this.$emit('keydown', e);
    },
    // On focus change, wrap focus to stay inside the dialog
    // https://github.com/vuetifyjs/vuetify/issues/6892
    onFocusin: function onFocusin(e) {
      if (!e || !this.retainFocus) return;
      var target = e.target;

      if (!!target && // It isn't the document or the dialog body
      ![document, this.$refs.content].includes(target) && // It isn't inside the dialog body
      !this.$refs.content.contains(target) && // We're the topmost dialog
      this.activeZIndex >= this.getMaxZIndex() && // It isn't inside a dependent element (like a menu)
      !this.getOpenDependentElements().some(function (el) {
        return el.contains(target);
      }) // So we must have focused something outside the dialog and its children
      ) {
          // Find and focus the first available element inside the dialog
          var focusable = this.$refs.content.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');

          var el = _toConsumableArray(focusable).find(function (el) {
            return !el.hasAttribute('disabled');
          });

          el && el.focus();
        }
    },
    genContent: function genContent() {
      var _this4 = this;

      return this.showLazyContent(function () {
        return [_this4.$createElement(_VThemeProvider.VThemeProvider, {
          props: {
            root: true,
            light: _this4.light,
            dark: _this4.dark
          }
        }, [_this4.$createElement('div', {
          class: _this4.contentClasses,
          attrs: _objectSpread({
            role: 'document',
            tabindex: _this4.isActive ? 0 : undefined
          }, _this4.getScopeIdAttrs()),
          on: {
            keydown: _this4.onKeydown
          },
          style: {
            zIndex: _this4.activeZIndex
          },
          ref: 'content'
        }, [_this4.genTransition()])])];
      });
    },
    genTransition: function genTransition() {
      var content = this.genInnerContent();
      if (!this.transition) return content;
      return this.$createElement('transition', {
        props: {
          name: this.transition,
          origin: this.origin,
          appear: true
        }
      }, [content]);
    },
    genInnerContent: function genInnerContent() {
      var data = {
        class: this.classes,
        ref: 'dialog',
        directives: [{
          name: 'click-outside',
          value: {
            handler: this.onClickOutside,
            closeConditional: this.closeConditional,
            include: this.getOpenDependentElements
          }
        }, {
          name: 'show',
          value: this.isActive
        }],
        style: {
          transformOrigin: this.origin
        }
      };

      if (!this.fullscreen) {
        data.style = _objectSpread({}, data.style, {
          maxWidth: this.maxWidth === 'none' ? undefined : (0, _helpers.convertToUnit)(this.maxWidth),
          width: this.width === 'auto' ? undefined : (0, _helpers.convertToUnit)(this.width)
        });
      }

      return this.$createElement('div', data, this.getContentSlot());
    }
  },
  render: function render(h) {
    return h('div', {
      staticClass: 'v-dialog__container',
      class: {
        'v-dialog__container--attached': this.attach === '' || this.attach === true || this.attach === 'attach'
      },
      attrs: {
        role: 'dialog'
      }
    }, [this.genActivator(), this.genContent()]);
  }
});

exports.default = _default;
//# sourceMappingURL=VDialog.js.map
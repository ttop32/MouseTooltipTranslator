"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("../../../src/components/VTabs/VTabs.sass");

var _VTabsBar = _interopRequireDefault(require("./VTabsBar"));

var _VTabsItems = _interopRequireDefault(require("./VTabsItems"));

var _VTabsSlider = _interopRequireDefault(require("./VTabsSlider"));

var _colorable = _interopRequireDefault(require("../../mixins/colorable"));

var _proxyable = _interopRequireDefault(require("../../mixins/proxyable"));

var _themeable = _interopRequireDefault(require("../../mixins/themeable"));

var _resize = _interopRequireDefault(require("../../directives/resize"));

var _helpers = require("../../util/helpers");

var _mixins = _interopRequireDefault(require("../../util/mixins"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var baseMixins = (0, _mixins.default)(_colorable.default, _proxyable.default, _themeable.default);

var _default = baseMixins.extend().extend({
  name: 'v-tabs',
  directives: {
    Resize: _resize.default
  },
  props: {
    activeClass: {
      type: String,
      default: ''
    },
    alignWithTitle: Boolean,
    backgroundColor: String,
    centerActive: Boolean,
    centered: Boolean,
    fixedTabs: Boolean,
    grow: Boolean,
    height: {
      type: [Number, String],
      default: undefined
    },
    hideSlider: Boolean,
    iconsAndText: Boolean,
    mobileBreakpoint: [String, Number],
    nextIcon: {
      type: String,
      default: '$next'
    },
    optional: Boolean,
    prevIcon: {
      type: String,
      default: '$prev'
    },
    right: Boolean,
    showArrows: [Boolean, String],
    sliderColor: String,
    sliderSize: {
      type: [Number, String],
      default: 2
    },
    vertical: Boolean
  },
  data: function data() {
    return {
      resizeTimeout: 0,
      slider: {
        height: null,
        left: null,
        right: null,
        top: null,
        width: null
      },
      transitionTime: 300
    };
  },
  computed: {
    classes: function classes() {
      return _objectSpread({
        'v-tabs--align-with-title': this.alignWithTitle,
        'v-tabs--centered': this.centered,
        'v-tabs--fixed-tabs': this.fixedTabs,
        'v-tabs--grow': this.grow,
        'v-tabs--icons-and-text': this.iconsAndText,
        'v-tabs--right': this.right,
        'v-tabs--vertical': this.vertical
      }, this.themeClasses);
    },
    isReversed: function isReversed() {
      return this.$vuetify.rtl && this.vertical;
    },
    sliderStyles: function sliderStyles() {
      return {
        height: (0, _helpers.convertToUnit)(this.slider.height),
        left: this.isReversed ? undefined : (0, _helpers.convertToUnit)(this.slider.left),
        right: this.isReversed ? (0, _helpers.convertToUnit)(this.slider.right) : undefined,
        top: this.vertical ? (0, _helpers.convertToUnit)(this.slider.top) : undefined,
        transition: this.slider.left != null ? null : 'none',
        width: (0, _helpers.convertToUnit)(this.slider.width)
      };
    },
    computedColor: function computedColor() {
      if (this.color) return this.color;else if (this.isDark && !this.appIsDark) return 'white';else return 'primary';
    }
  },
  watch: {
    alignWithTitle: 'callSlider',
    centered: 'callSlider',
    centerActive: 'callSlider',
    fixedTabs: 'callSlider',
    grow: 'callSlider',
    iconsAndText: 'callSlider',
    right: 'callSlider',
    showArrows: 'callSlider',
    vertical: 'callSlider',
    '$vuetify.application.left': 'onResize',
    '$vuetify.application.right': 'onResize',
    '$vuetify.rtl': 'onResize'
  },
  mounted: function mounted() {
    var _this = this;

    this.$nextTick(function () {
      window.setTimeout(_this.callSlider, 30);
    });
  },
  methods: {
    callSlider: function callSlider() {
      var _this2 = this;

      if (this.hideSlider || !this.$refs.items || !this.$refs.items.selectedItems.length) {
        this.slider.width = 0;
        return false;
      }

      this.$nextTick(function () {
        // Give screen time to paint
        var activeTab = _this2.$refs.items.selectedItems[0];
        /* istanbul ignore if */

        if (!activeTab || !activeTab.$el) {
          _this2.slider.width = 0;
          _this2.slider.left = 0;
          return;
        }

        var el = activeTab.$el;
        _this2.slider = {
          height: !_this2.vertical ? Number(_this2.sliderSize) : el.scrollHeight,
          left: _this2.vertical ? 0 : el.offsetLeft,
          right: _this2.vertical ? 0 : el.offsetLeft + el.offsetWidth,
          top: el.offsetTop,
          width: _this2.vertical ? Number(_this2.sliderSize) : el.scrollWidth
        };
      });
      return true;
    },
    genBar: function genBar(items, slider) {
      var _this3 = this;

      var data = {
        style: {
          height: (0, _helpers.convertToUnit)(this.height)
        },
        props: {
          activeClass: this.activeClass,
          centerActive: this.centerActive,
          dark: this.dark,
          light: this.light,
          mandatory: !this.optional,
          mobileBreakpoint: this.mobileBreakpoint,
          nextIcon: this.nextIcon,
          prevIcon: this.prevIcon,
          showArrows: this.showArrows,
          value: this.internalValue
        },
        on: {
          'call:slider': this.callSlider,
          change: function change(val) {
            _this3.internalValue = val;
          }
        },
        ref: 'items'
      };
      this.setTextColor(this.computedColor, data);
      this.setBackgroundColor(this.backgroundColor, data);
      return this.$createElement(_VTabsBar.default, data, [this.genSlider(slider), items]);
    },
    genItems: function genItems(items, item) {
      var _this4 = this;

      // If user provides items
      // opt to use theirs
      if (items) return items; // If no tabs are provided
      // render nothing

      if (!item.length) return null;
      return this.$createElement(_VTabsItems.default, {
        props: {
          value: this.internalValue
        },
        on: {
          change: function change(val) {
            _this4.internalValue = val;
          }
        }
      }, item);
    },
    genSlider: function genSlider(slider) {
      if (this.hideSlider) return null;

      if (!slider) {
        slider = this.$createElement(_VTabsSlider.default, {
          props: {
            color: this.sliderColor
          }
        });
      }

      return this.$createElement('div', {
        staticClass: 'v-tabs-slider-wrapper',
        style: this.sliderStyles
      }, [slider]);
    },
    onResize: function onResize() {
      if (this._isDestroyed) return;
      clearTimeout(this.resizeTimeout);
      this.resizeTimeout = window.setTimeout(this.callSlider, 0);
    },
    parseNodes: function parseNodes() {
      var items = null;
      var slider = null;
      var item = [];
      var tab = [];
      var slot = this.$slots.default || [];
      var length = slot.length;

      for (var i = 0; i < length; i++) {
        var vnode = slot[i];

        if (vnode.componentOptions) {
          switch (vnode.componentOptions.Ctor.options.name) {
            case 'v-tabs-slider':
              slider = vnode;
              break;

            case 'v-tabs-items':
              items = vnode;
              break;

            case 'v-tab-item':
              item.push(vnode);
              break;
            // case 'v-tab' - intentionally omitted

            default:
              tab.push(vnode);
          }
        } else {
          tab.push(vnode);
        }
      }
      /**
       * tab: array of `v-tab`
       * slider: single `v-tabs-slider`
       * items: single `v-tabs-items`
       * item: array of `v-tab-item`
       */


      return {
        tab: tab,
        slider: slider,
        items: items,
        item: item
      };
    }
  },
  render: function render(h) {
    var _this$parseNodes = this.parseNodes(),
        tab = _this$parseNodes.tab,
        slider = _this$parseNodes.slider,
        items = _this$parseNodes.items,
        item = _this$parseNodes.item;

    return h('div', {
      staticClass: 'v-tabs',
      class: this.classes,
      directives: [{
        name: 'resize',
        modifiers: {
          quiet: true
        },
        value: this.onResize
      }]
    }, [this.genBar(tab, slider), this.genItems(items, item)]);
  }
});

exports.default = _default;
//# sourceMappingURL=VTabs.js.map
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("../../../src/components/VTooltip/VTooltip.sass");

var _activatable = _interopRequireDefault(require("../../mixins/activatable"));

var _colorable = _interopRequireDefault(require("../../mixins/colorable"));

var _delayable = _interopRequireDefault(require("../../mixins/delayable"));

var _dependent = _interopRequireDefault(require("../../mixins/dependent"));

var _detachable = _interopRequireDefault(require("../../mixins/detachable"));

var _menuable = _interopRequireDefault(require("../../mixins/menuable"));

var _toggleable = _interopRequireDefault(require("../../mixins/toggleable"));

var _helpers = require("../../util/helpers");

var _console = require("../../util/console");

var _mixins = _interopRequireDefault(require("../../util/mixins"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/* @vue/component */
var _default = (0, _mixins.default)(_colorable.default, _delayable.default, _dependent.default, _detachable.default, _menuable.default, _toggleable.default).extend({
  name: 'v-tooltip',
  props: {
    closeDelay: {
      type: [Number, String],
      default: 0
    },
    disabled: Boolean,
    fixed: {
      type: Boolean,
      default: true
    },
    openDelay: {
      type: [Number, String],
      default: 0
    },
    openOnHover: {
      type: Boolean,
      default: true
    },
    tag: {
      type: String,
      default: 'span'
    },
    transition: String
  },
  data: function data() {
    return {
      calculatedMinWidth: 0,
      closeDependents: false
    };
  },
  computed: {
    calculatedLeft: function calculatedLeft() {
      var _this$dimensions = this.dimensions,
          activator = _this$dimensions.activator,
          content = _this$dimensions.content;
      var unknown = !this.bottom && !this.left && !this.top && !this.right;
      var activatorLeft = this.attach !== false ? activator.offsetLeft : activator.left;
      var left = 0;

      if (this.top || this.bottom || unknown) {
        left = activatorLeft + activator.width / 2 - content.width / 2;
      } else if (this.left || this.right) {
        left = activatorLeft + (this.right ? activator.width : -content.width) + (this.right ? 10 : -10);
      }

      if (this.nudgeLeft) left -= parseInt(this.nudgeLeft);
      if (this.nudgeRight) left += parseInt(this.nudgeRight);
      return "".concat(this.calcXOverflow(left, this.dimensions.content.width), "px");
    },
    calculatedTop: function calculatedTop() {
      var _this$dimensions2 = this.dimensions,
          activator = _this$dimensions2.activator,
          content = _this$dimensions2.content;
      var activatorTop = this.attach !== false ? activator.offsetTop : activator.top;
      var top = 0;

      if (this.top || this.bottom) {
        top = activatorTop + (this.bottom ? activator.height : -content.height) + (this.bottom ? 10 : -10);
      } else if (this.left || this.right) {
        top = activatorTop + activator.height / 2 - content.height / 2;
      }

      if (this.nudgeTop) top -= parseInt(this.nudgeTop);
      if (this.nudgeBottom) top += parseInt(this.nudgeBottom);
      return "".concat(this.calcYOverflow(top + this.pageYOffset), "px");
    },
    classes: function classes() {
      return {
        'v-tooltip--top': this.top,
        'v-tooltip--right': this.right,
        'v-tooltip--bottom': this.bottom,
        'v-tooltip--left': this.left,
        'v-tooltip--attached': this.attach === '' || this.attach === true || this.attach === 'attach'
      };
    },
    computedTransition: function computedTransition() {
      if (this.transition) return this.transition;
      return this.isActive ? 'scale-transition' : 'fade-transition';
    },
    offsetY: function offsetY() {
      return this.top || this.bottom;
    },
    offsetX: function offsetX() {
      return this.left || this.right;
    },
    styles: function styles() {
      return {
        left: this.calculatedLeft,
        maxWidth: (0, _helpers.convertToUnit)(this.maxWidth),
        minWidth: (0, _helpers.convertToUnit)(this.minWidth),
        opacity: this.isActive ? 0.9 : 0,
        top: this.calculatedTop,
        zIndex: this.zIndex || this.activeZIndex
      };
    }
  },
  beforeMount: function beforeMount() {
    var _this = this;

    this.$nextTick(function () {
      _this.value && _this.callActivate();
    });
  },
  mounted: function mounted() {
    if ((0, _helpers.getSlotType)(this, 'activator', true) === 'v-slot') {
      (0, _console.consoleError)("v-tooltip's activator slot must be bound, try '<template #activator=\"data\"><v-btn v-on=\"data.on>'", this);
    }
  },
  methods: {
    activate: function activate() {
      // Update coordinates and dimensions of menu
      // and its activator
      this.updateDimensions(); // Start the transition

      requestAnimationFrame(this.startTransition);
    },
    deactivate: function deactivate() {
      this.runDelay('close');
    },
    genActivatorListeners: function genActivatorListeners() {
      var _this2 = this;

      var listeners = _activatable.default.options.methods.genActivatorListeners.call(this);

      listeners.focus = function (e) {
        _this2.getActivator(e);

        _this2.runDelay('open');
      };

      listeners.blur = function (e) {
        _this2.getActivator(e);

        _this2.runDelay('close');
      };

      listeners.keydown = function (e) {
        if (e.keyCode === _helpers.keyCodes.esc) {
          _this2.getActivator(e);

          _this2.runDelay('close');
        }
      };

      return listeners;
    },
    genActivatorAttributes: function genActivatorAttributes() {
      return {
        'aria-haspopup': true,
        'aria-expanded': String(this.isActive)
      };
    },
    genTransition: function genTransition() {
      var content = this.genContent();
      if (!this.computedTransition) return content;
      return this.$createElement('transition', {
        props: {
          name: this.computedTransition
        }
      }, [content]);
    },
    genContent: function genContent() {
      var _class;

      return this.$createElement('div', this.setBackgroundColor(this.color, {
        staticClass: 'v-tooltip__content',
        class: (_class = {}, _defineProperty(_class, this.contentClass, true), _defineProperty(_class, "menuable__content__active", this.isActive), _defineProperty(_class, 'v-tooltip__content--fixed', this.activatorFixed), _class),
        style: this.styles,
        attrs: this.getScopeIdAttrs(),
        directives: [{
          name: 'show',
          value: this.isContentActive
        }],
        ref: 'content'
      }), this.getContentSlot());
    }
  },
  render: function render(h) {
    var _this3 = this;

    return h(this.tag, {
      staticClass: 'v-tooltip',
      class: this.classes
    }, [this.showLazyContent(function () {
      return [_this3.genTransition()];
    }), this.genActivator()]);
  }
});

exports.default = _default;
//# sourceMappingURL=VTooltip.js.map
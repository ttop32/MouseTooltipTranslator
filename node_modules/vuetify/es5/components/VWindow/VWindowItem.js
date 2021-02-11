"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _bootable = _interopRequireDefault(require("../../mixins/bootable"));

var _groupable = require("../../mixins/groupable");

var _touch = _interopRequireDefault(require("../../directives/touch"));

var _helpers = require("../../util/helpers");

var _mixins = _interopRequireDefault(require("../../util/mixins"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Mixins
// Directives
// Utilities
var baseMixins = (0, _mixins.default)(_bootable.default, (0, _groupable.factory)('windowGroup', 'v-window-item', 'v-window'));

var _default = baseMixins.extend().extend().extend({
  name: 'v-window-item',
  directives: {
    Touch: _touch.default
  },
  props: {
    disabled: Boolean,
    reverseTransition: {
      type: [Boolean, String],
      default: undefined
    },
    transition: {
      type: [Boolean, String],
      default: undefined
    },
    value: {
      required: false
    }
  },
  data: function data() {
    return {
      isActive: false,
      inTransition: false
    };
  },
  computed: {
    classes: function classes() {
      return this.groupClasses;
    },
    computedTransition: function computedTransition() {
      if (!this.windowGroup.internalReverse) {
        return typeof this.transition !== 'undefined' ? this.transition || '' : this.windowGroup.computedTransition;
      }

      return typeof this.reverseTransition !== 'undefined' ? this.reverseTransition || '' : this.windowGroup.computedTransition;
    }
  },
  methods: {
    genDefaultSlot: function genDefaultSlot() {
      return this.$slots.default;
    },
    genWindowItem: function genWindowItem() {
      return this.$createElement('div', {
        staticClass: 'v-window-item',
        class: this.classes,
        directives: [{
          name: 'show',
          value: this.isActive
        }],
        on: this.$listeners
      }, this.genDefaultSlot());
    },
    onAfterTransition: function onAfterTransition() {
      if (!this.inTransition) {
        return;
      } // Finalize transition state.


      this.inTransition = false;

      if (this.windowGroup.transitionCount > 0) {
        this.windowGroup.transitionCount--; // Remove container height if we are out of transition.

        if (this.windowGroup.transitionCount === 0) {
          this.windowGroup.transitionHeight = undefined;
        }
      }
    },
    onBeforeTransition: function onBeforeTransition() {
      if (this.inTransition) {
        return;
      } // Initialize transition state here.


      this.inTransition = true;

      if (this.windowGroup.transitionCount === 0) {
        // Set initial height for height transition.
        this.windowGroup.transitionHeight = (0, _helpers.convertToUnit)(this.windowGroup.$el.clientHeight);
      }

      this.windowGroup.transitionCount++;
    },
    onTransitionCancelled: function onTransitionCancelled() {
      this.onAfterTransition(); // This should have the same path as normal transition end.
    },
    onEnter: function onEnter(el) {
      var _this = this;

      if (!this.inTransition) {
        return;
      }

      this.$nextTick(function () {
        // Do not set height if no transition or cancelled.
        if (!_this.computedTransition || !_this.inTransition) {
          return;
        } // Set transition target height.


        _this.windowGroup.transitionHeight = (0, _helpers.convertToUnit)(el.clientHeight);
      });
    }
  },
  render: function render(h) {
    var _this2 = this;

    return h('transition', {
      props: {
        name: this.computedTransition
      },
      on: {
        // Handlers for enter windows.
        beforeEnter: this.onBeforeTransition,
        afterEnter: this.onAfterTransition,
        enterCancelled: this.onTransitionCancelled,
        // Handlers for leave windows.
        beforeLeave: this.onBeforeTransition,
        afterLeave: this.onAfterTransition,
        leaveCancelled: this.onTransitionCancelled,
        // Enter handler for height transition.
        enter: this.onEnter
      }
    }, this.showLazyContent(function () {
      return [_this2.genWindowItem()];
    }));
  }
});

exports.default = _default;
//# sourceMappingURL=VWindowItem.js.map
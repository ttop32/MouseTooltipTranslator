"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _VIcon = _interopRequireDefault(require("../VIcon"));

var _colorable = _interopRequireDefault(require("../../mixins/colorable"));

var _registrable = require("../../mixins/registrable");

var _ripple = _interopRequireDefault(require("../../directives/ripple"));

var _mixins = _interopRequireDefault(require("../../util/mixins"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Components
// Mixins
// Directives
// Utilities
var baseMixins = (0, _mixins.default)(_colorable.default, (0, _registrable.inject)('stepper', 'v-stepper-step', 'v-stepper'));
/* @vue/component */

var _default2 = baseMixins.extend().extend({
  name: 'v-stepper-step',
  directives: {
    ripple: _ripple.default
  },
  inject: ['stepClick'],
  props: {
    color: {
      type: String,
      default: 'primary'
    },
    complete: Boolean,
    completeIcon: {
      type: String,
      default: '$complete'
    },
    editable: Boolean,
    editIcon: {
      type: String,
      default: '$edit'
    },
    errorIcon: {
      type: String,
      default: '$error'
    },
    rules: {
      type: Array,
      default: function _default() {
        return [];
      }
    },
    step: [Number, String]
  },
  data: function data() {
    return {
      isActive: false,
      isInactive: true
    };
  },
  computed: {
    classes: function classes() {
      return {
        'v-stepper__step--active': this.isActive,
        'v-stepper__step--editable': this.editable,
        'v-stepper__step--inactive': this.isInactive,
        'v-stepper__step--error error--text': this.hasError,
        'v-stepper__step--complete': this.complete
      };
    },
    hasError: function hasError() {
      return this.rules.some(function (validate) {
        return validate() !== true;
      });
    }
  },
  mounted: function mounted() {
    this.stepper && this.stepper.register(this);
  },
  beforeDestroy: function beforeDestroy() {
    this.stepper && this.stepper.unregister(this);
  },
  methods: {
    click: function click(e) {
      e.stopPropagation();
      this.$emit('click', e);

      if (this.editable) {
        this.stepClick(this.step);
      }
    },
    genIcon: function genIcon(icon) {
      return this.$createElement(_VIcon.default, icon);
    },
    genLabel: function genLabel() {
      return this.$createElement('div', {
        staticClass: 'v-stepper__label'
      }, this.$slots.default);
    },
    genStep: function genStep() {
      var color = !this.hasError && (this.complete || this.isActive) ? this.color : false;
      return this.$createElement('span', this.setBackgroundColor(color, {
        staticClass: 'v-stepper__step__step'
      }), this.genStepContent());
    },
    genStepContent: function genStepContent() {
      var children = [];

      if (this.hasError) {
        children.push(this.genIcon(this.errorIcon));
      } else if (this.complete) {
        if (this.editable) {
          children.push(this.genIcon(this.editIcon));
        } else {
          children.push(this.genIcon(this.completeIcon));
        }
      } else {
        children.push(String(this.step));
      }

      return children;
    },
    toggle: function toggle(step) {
      this.isActive = step.toString() === this.step.toString();
      this.isInactive = Number(step) < Number(this.step);
    }
  },
  render: function render(h) {
    return h('div', {
      staticClass: 'v-stepper__step',
      class: this.classes,
      directives: [{
        name: 'ripple',
        value: this.editable
      }],
      on: {
        click: this.click
      }
    }, [this.genStep(), this.genLabel()]);
  }
});

exports.default = _default2;
//# sourceMappingURL=VStepperStep.js.map
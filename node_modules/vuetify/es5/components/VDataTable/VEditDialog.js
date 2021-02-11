"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("../../../src/components/VDataTable/VEditDialog.sass");

var _returnable = _interopRequireDefault(require("../../mixins/returnable"));

var _themeable = _interopRequireDefault(require("../../mixins/themeable"));

var _helpers = require("../../util/helpers");

var _VBtn = _interopRequireDefault(require("../VBtn"));

var _VMenu = _interopRequireDefault(require("../VMenu"));

var _mixins = _interopRequireDefault(require("../../util/mixins"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Styles
// Mixins
// Utils
// Component

/* @vue/component */
var _default = (0, _mixins.default)(_returnable.default, _themeable.default).extend({
  name: 'v-edit-dialog',
  props: {
    cancelText: {
      default: 'Cancel'
    },
    large: Boolean,
    eager: Boolean,
    persistent: Boolean,
    saveText: {
      default: 'Save'
    },
    transition: {
      type: String,
      default: 'slide-x-reverse-transition'
    }
  },
  data: function data() {
    return {
      isActive: false
    };
  },
  watch: {
    isActive: function isActive(val) {
      if (val) {
        this.$emit('open');
        setTimeout(this.focus, 50); // Give DOM time to paint
      } else {
        this.$emit('close');
      }
    }
  },
  methods: {
    cancel: function cancel() {
      this.isActive = false;
      this.$emit('cancel');
    },
    focus: function focus() {
      var input = this.$refs.content.querySelector('input');
      input && input.focus();
    },
    genButton: function genButton(fn, text) {
      return this.$createElement(_VBtn.default, {
        props: {
          text: true,
          color: 'primary',
          light: true
        },
        on: {
          click: fn
        }
      }, text);
    },
    genActions: function genActions() {
      var _this = this;

      return this.$createElement('div', {
        class: 'v-small-dialog__actions'
      }, [this.genButton(this.cancel, this.cancelText), this.genButton(function () {
        _this.save(_this.returnValue);

        _this.$emit('save');
      }, this.saveText)]);
    },
    genContent: function genContent() {
      var _this2 = this;

      return this.$createElement('div', {
        staticClass: 'v-small-dialog__content',
        on: {
          keydown: function keydown(e) {
            e.keyCode === _helpers.keyCodes.esc && _this2.cancel();

            if (e.keyCode === _helpers.keyCodes.enter) {
              _this2.save(_this2.returnValue);

              _this2.$emit('save');
            }
          }
        },
        ref: 'content'
      }, [this.$slots.input]);
    }
  },
  render: function render(h) {
    var _this3 = this;

    return h(_VMenu.default, {
      staticClass: 'v-small-dialog',
      class: this.themeClasses,
      props: {
        contentClass: 'v-small-dialog__menu-content',
        transition: this.transition,
        origin: 'top right',
        right: true,
        value: this.isActive,
        closeOnClick: !this.persistent,
        closeOnContentClick: false,
        eager: this.eager,
        light: this.light,
        dark: this.dark
      },
      on: {
        input: function input(val) {
          return _this3.isActive = val;
        }
      },
      scopedSlots: {
        activator: function activator(_ref) {
          var on = _ref.on;
          return h('div', {
            staticClass: 'v-small-dialog__activator',
            on: on
          }, [h('span', {
            staticClass: 'v-small-dialog__activator__content'
          }, _this3.$slots.default)]);
        }
      }
    }, [this.genContent(), this.large ? this.genActions() : null]);
  }
});

exports.default = _default;
//# sourceMappingURL=VEditDialog.js.map
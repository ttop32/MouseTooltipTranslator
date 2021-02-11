"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("../../../src/components/VInput/VInput.sass");

var _VIcon = _interopRequireDefault(require("../VIcon"));

var _VLabel = _interopRequireDefault(require("../VLabel"));

var _VMessages = _interopRequireDefault(require("../VMessages"));

var _bindsAttrs = _interopRequireDefault(require("../../mixins/binds-attrs"));

var _validatable = _interopRequireDefault(require("../../mixins/validatable"));

var _helpers = require("../../util/helpers");

var _mergeData = _interopRequireDefault(require("../../util/mergeData"));

var _mixins = _interopRequireDefault(require("../../util/mixins"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var baseMixins = (0, _mixins.default)(_bindsAttrs.default, _validatable.default);
/* @vue/component */

var _default2 = baseMixins.extend().extend({
  name: 'v-input',
  inheritAttrs: false,
  props: {
    appendIcon: String,
    backgroundColor: {
      type: String,
      default: ''
    },
    dense: Boolean,
    height: [Number, String],
    hideDetails: [Boolean, String],
    hint: String,
    id: String,
    label: String,
    loading: Boolean,
    persistentHint: Boolean,
    prependIcon: String,
    value: null
  },
  data: function data() {
    return {
      lazyValue: this.value,
      hasMouseDown: false
    };
  },
  computed: {
    classes: function classes() {
      return _objectSpread({
        'v-input--has-state': this.hasState,
        'v-input--hide-details': !this.showDetails,
        'v-input--is-label-active': this.isLabelActive,
        'v-input--is-dirty': this.isDirty,
        'v-input--is-disabled': this.isDisabled,
        'v-input--is-focused': this.isFocused,
        // <v-switch loading>.loading === '' so we can't just cast to boolean
        'v-input--is-loading': this.loading !== false && this.loading != null,
        'v-input--is-readonly': this.isReadonly,
        'v-input--dense': this.dense
      }, this.themeClasses);
    },
    computedId: function computedId() {
      return this.id || "input-".concat(this._uid);
    },
    hasDetails: function hasDetails() {
      return this.messagesToDisplay.length > 0;
    },
    hasHint: function hasHint() {
      return !this.hasMessages && !!this.hint && (this.persistentHint || this.isFocused);
    },
    hasLabel: function hasLabel() {
      return !!(this.$slots.label || this.label);
    },
    // Proxy for `lazyValue`
    // This allows an input
    // to function without
    // a provided model
    internalValue: {
      get: function get() {
        return this.lazyValue;
      },
      set: function set(val) {
        this.lazyValue = val;
        this.$emit(this.$_modelEvent, val);
      }
    },
    isDirty: function isDirty() {
      return !!this.lazyValue;
    },
    isLabelActive: function isLabelActive() {
      return this.isDirty;
    },
    messagesToDisplay: function messagesToDisplay() {
      var _this = this;

      if (this.hasHint) return [this.hint];
      if (!this.hasMessages) return [];
      return this.validations.map(function (validation) {
        if (typeof validation === 'string') return validation;
        var validationResult = validation(_this.internalValue);
        return typeof validationResult === 'string' ? validationResult : '';
      }).filter(function (message) {
        return message !== '';
      });
    },
    showDetails: function showDetails() {
      return this.hideDetails === false || this.hideDetails === 'auto' && this.hasDetails;
    }
  },
  watch: {
    value: function value(val) {
      this.lazyValue = val;
    }
  },
  beforeCreate: function beforeCreate() {
    // v-radio-group needs to emit a different event
    // https://github.com/vuetifyjs/vuetify/issues/4752
    this.$_modelEvent = this.$options.model && this.$options.model.event || 'input';
  },
  methods: {
    genContent: function genContent() {
      return [this.genPrependSlot(), this.genControl(), this.genAppendSlot()];
    },
    genControl: function genControl() {
      return this.$createElement('div', {
        staticClass: 'v-input__control'
      }, [this.genInputSlot(), this.genMessages()]);
    },
    genDefaultSlot: function genDefaultSlot() {
      return [this.genLabel(), this.$slots.default];
    },
    genIcon: function genIcon(type, cb) {
      var _this2 = this;

      var extraData = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
      var icon = this["".concat(type, "Icon")];
      var eventName = "click:".concat((0, _helpers.kebabCase)(type));
      var hasListener = !!(this.listeners$[eventName] || cb);
      var data = (0, _mergeData.default)({
        attrs: {
          'aria-label': hasListener ? (0, _helpers.kebabCase)(type).split('-')[0] + ' icon' : undefined,
          color: this.validationState,
          dark: this.dark,
          disabled: this.isDisabled,
          light: this.light
        },
        on: !hasListener ? undefined : {
          click: function click(e) {
            e.preventDefault();
            e.stopPropagation();

            _this2.$emit(eventName, e);

            cb && cb(e);
          },
          // Container has g event that will
          // trigger menu open if enclosed
          mouseup: function mouseup(e) {
            e.preventDefault();
            e.stopPropagation();
          }
        }
      }, extraData);
      return this.$createElement('div', {
        staticClass: "v-input__icon",
        class: type ? "v-input__icon--".concat((0, _helpers.kebabCase)(type)) : undefined
      }, [this.$createElement(_VIcon.default, data, icon)]);
    },
    genInputSlot: function genInputSlot() {
      return this.$createElement('div', this.setBackgroundColor(this.backgroundColor, {
        staticClass: 'v-input__slot',
        style: {
          height: (0, _helpers.convertToUnit)(this.height)
        },
        on: {
          click: this.onClick,
          mousedown: this.onMouseDown,
          mouseup: this.onMouseUp
        },
        ref: 'input-slot'
      }), [this.genDefaultSlot()]);
    },
    genLabel: function genLabel() {
      if (!this.hasLabel) return null;
      return this.$createElement(_VLabel.default, {
        props: {
          color: this.validationState,
          dark: this.dark,
          disabled: this.isDisabled,
          focused: this.hasState,
          for: this.computedId,
          light: this.light
        }
      }, this.$slots.label || this.label);
    },
    genMessages: function genMessages() {
      var _this3 = this;

      if (!this.showDetails) return null;
      return this.$createElement(_VMessages.default, {
        props: {
          color: this.hasHint ? '' : this.validationState,
          dark: this.dark,
          light: this.light,
          value: this.messagesToDisplay
        },
        attrs: {
          role: this.hasMessages ? 'alert' : null
        },
        scopedSlots: {
          default: function _default(props) {
            return (0, _helpers.getSlot)(_this3, 'message', props);
          }
        }
      });
    },
    genSlot: function genSlot(type, location, slot) {
      if (!slot.length) return null;
      var ref = "".concat(type, "-").concat(location);
      return this.$createElement('div', {
        staticClass: "v-input__".concat(ref),
        ref: ref
      }, slot);
    },
    genPrependSlot: function genPrependSlot() {
      var slot = [];

      if (this.$slots.prepend) {
        slot.push(this.$slots.prepend);
      } else if (this.prependIcon) {
        slot.push(this.genIcon('prepend'));
      }

      return this.genSlot('prepend', 'outer', slot);
    },
    genAppendSlot: function genAppendSlot() {
      var slot = []; // Append icon for text field was really
      // an appended inner icon, v-text-field
      // will overwrite this method in order to obtain
      // backwards compat

      if (this.$slots.append) {
        slot.push(this.$slots.append);
      } else if (this.appendIcon) {
        slot.push(this.genIcon('append'));
      }

      return this.genSlot('append', 'outer', slot);
    },
    onClick: function onClick(e) {
      this.$emit('click', e);
    },
    onMouseDown: function onMouseDown(e) {
      this.hasMouseDown = true;
      this.$emit('mousedown', e);
    },
    onMouseUp: function onMouseUp(e) {
      this.hasMouseDown = false;
      this.$emit('mouseup', e);
    }
  },
  render: function render(h) {
    return h('div', this.setTextColor(this.validationState, {
      staticClass: 'v-input',
      class: this.classes
    }), this.genContent());
  }
});

exports.default = _default2;
//# sourceMappingURL=VInput.js.map
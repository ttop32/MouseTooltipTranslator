"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _mixins = _interopRequireDefault(require("../../util/mixins"));

var _bindsAttrs = _interopRequireDefault(require("../../mixins/binds-attrs"));

var _registrable = require("../../mixins/registrable");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/* @vue/component */
var _default = (0, _mixins.default)(_bindsAttrs.default, (0, _registrable.provide)('form')
/* @vue/component */
).extend({
  name: 'v-form',
  provide: function provide() {
    return {
      form: this
    };
  },
  inheritAttrs: false,
  props: {
    disabled: Boolean,
    lazyValidation: Boolean,
    readonly: Boolean,
    value: Boolean
  },
  data: function data() {
    return {
      inputs: [],
      watchers: [],
      errorBag: {}
    };
  },
  watch: {
    errorBag: {
      handler: function handler(val) {
        var errors = Object.values(val).includes(true);
        this.$emit('input', !errors);
      },
      deep: true,
      immediate: true
    }
  },
  methods: {
    watchInput: function watchInput(input) {
      var _this = this;

      var watcher = function watcher(input) {
        return input.$watch('hasError', function (val) {
          _this.$set(_this.errorBag, input._uid, val);
        }, {
          immediate: true
        });
      };

      var watchers = {
        _uid: input._uid,
        valid: function valid() {},
        shouldValidate: function shouldValidate() {}
      };

      if (this.lazyValidation) {
        // Only start watching inputs if we need to
        watchers.shouldValidate = input.$watch('shouldValidate', function (val) {
          if (!val) return; // Only watch if we're not already doing it

          if (_this.errorBag.hasOwnProperty(input._uid)) return;
          watchers.valid = watcher(input);
        });
      } else {
        watchers.valid = watcher(input);
      }

      return watchers;
    },

    /** @public */
    validate: function validate() {
      return this.inputs.filter(function (input) {
        return !input.validate(true);
      }).length === 0;
    },

    /** @public */
    reset: function reset() {
      this.inputs.forEach(function (input) {
        return input.reset();
      });
      this.resetErrorBag();
    },
    resetErrorBag: function resetErrorBag() {
      var _this2 = this;

      if (this.lazyValidation) {
        // Account for timeout in validatable
        setTimeout(function () {
          _this2.errorBag = {};
        }, 0);
      }
    },

    /** @public */
    resetValidation: function resetValidation() {
      this.inputs.forEach(function (input) {
        return input.resetValidation();
      });
      this.resetErrorBag();
    },
    register: function register(input) {
      this.inputs.push(input);
      this.watchers.push(this.watchInput(input));
    },
    unregister: function unregister(input) {
      var found = this.inputs.find(function (i) {
        return i._uid === input._uid;
      });
      if (!found) return;
      var unwatch = this.watchers.find(function (i) {
        return i._uid === found._uid;
      });

      if (unwatch) {
        unwatch.valid();
        unwatch.shouldValidate();
      }

      this.watchers = this.watchers.filter(function (i) {
        return i._uid !== found._uid;
      });
      this.inputs = this.inputs.filter(function (i) {
        return i._uid !== found._uid;
      });
      this.$delete(this.errorBag, found._uid);
    }
  },
  render: function render(h) {
    var _this3 = this;

    return h('form', {
      staticClass: 'v-form',
      attrs: _objectSpread({
        novalidate: true
      }, this.attrs$),
      on: {
        submit: function submit(e) {
          return _this3.$emit('submit', e);
        }
      }
    }, this.$slots.default);
  }
});

exports.default = _default;
//# sourceMappingURL=VForm.js.map
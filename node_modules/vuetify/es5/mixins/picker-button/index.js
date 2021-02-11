"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _colorable = _interopRequireDefault(require("../colorable"));

var _mixins = _interopRequireDefault(require("../../util/mixins"));

var _helpers = require("../../util/helpers");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Mixins
// Utilities

/* @vue/component */
var _default = (0, _mixins.default)(_colorable.default).extend({
  methods: {
    genPickerButton: function genPickerButton(prop, value, content) {
      var _this = this;

      var readonly = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
      var staticClass = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : '';
      var active = this[prop] === value;

      var click = function click(event) {
        event.stopPropagation();

        _this.$emit("update:".concat((0, _helpers.kebabCase)(prop)), value);
      };

      return this.$createElement('div', {
        staticClass: "v-picker__title__btn ".concat(staticClass).trim(),
        class: {
          'v-picker__title__btn--active': active,
          'v-picker__title__btn--readonly': readonly
        },
        on: active || readonly ? undefined : {
          click: click
        }
      }, Array.isArray(content) ? content : [content]);
    }
  }
});

exports.default = _default;
//# sourceMappingURL=index.js.map
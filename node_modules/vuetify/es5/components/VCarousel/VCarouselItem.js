"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _VWindowItem = _interopRequireDefault(require("../VWindow/VWindowItem"));

var _VImg = require("../VImg");

var _mixins = _interopRequireDefault(require("../../util/mixins"));

var _helpers = require("../../util/helpers");

var _routable = _interopRequireDefault(require("../../mixins/routable"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

// Types
var baseMixins = (0, _mixins.default)(_VWindowItem.default, _routable.default);
/* @vue/component */

var _default = baseMixins.extend({
  name: 'v-carousel-item',
  inheritAttrs: false,
  methods: {
    genDefaultSlot: function genDefaultSlot() {
      return [this.$createElement(_VImg.VImg, {
        staticClass: 'v-carousel__item',
        props: _objectSpread({}, this.$attrs, {
          height: this.windowGroup.internalHeight
        }),
        on: this.$listeners,
        scopedSlots: {
          placeholder: this.$scopedSlots.placeholder
        }
      }, (0, _helpers.getSlot)(this))];
    },
    genWindowItem: function genWindowItem() {
      var _this$generateRouteLi = this.generateRouteLink(),
          tag = _this$generateRouteLi.tag,
          data = _this$generateRouteLi.data;

      data.staticClass = 'v-window-item';
      data.directives.push({
        name: 'show',
        value: this.isActive
      });
      return this.$createElement(tag, data, this.genDefaultSlot());
    }
  }
});

exports.default = _default;
//# sourceMappingURL=VCarouselItem.js.map
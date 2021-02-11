"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "VCarousel", {
  enumerable: true,
  get: function get() {
    return _VCarousel.default;
  }
});
Object.defineProperty(exports, "VCarouselItem", {
  enumerable: true,
  get: function get() {
    return _VCarouselItem.default;
  }
});
exports.default = void 0;

var _VCarousel = _interopRequireDefault(require("./VCarousel"));

var _VCarouselItem = _interopRequireDefault(require("./VCarouselItem"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default = {
  $_vuetify_subcomponents: {
    VCarousel: _VCarousel.default,
    VCarouselItem: _VCarouselItem.default
  }
};
exports.default = _default;
//# sourceMappingURL=index.js.map
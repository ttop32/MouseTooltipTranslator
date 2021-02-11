"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _VItem = require("../VItemGroup/VItem");

var _groupable = require("../../mixins/groupable");

var _mixins = _interopRequireDefault(require("../../util/mixins"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Extensions
// Mixins
var _default = (0, _mixins.default)(_VItem.BaseItem, (0, _groupable.factory)('slideGroup')
/* @vue/component */
).extend({
  name: 'v-slide-item'
});

exports.default = _default;
//# sourceMappingURL=VSlideItem.js.map
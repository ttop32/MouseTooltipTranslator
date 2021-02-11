"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "VToolbar", {
  enumerable: true,
  get: function get() {
    return _VToolbar.default;
  }
});
exports.default = exports.VToolbarTitle = exports.VToolbarItems = void 0;

var _VToolbar = _interopRequireDefault(require("./VToolbar"));

var _helpers = require("../../util/helpers");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Components
// Utilities
var VToolbarTitle = (0, _helpers.createSimpleFunctional)('v-toolbar__title');
exports.VToolbarTitle = VToolbarTitle;
var VToolbarItems = (0, _helpers.createSimpleFunctional)('v-toolbar__items');
exports.VToolbarItems = VToolbarItems;
var _default = {
  $_vuetify_subcomponents: {
    VToolbar: _VToolbar.default,
    VToolbarItems: VToolbarItems,
    VToolbarTitle: VToolbarTitle
  }
};
exports.default = _default;
//# sourceMappingURL=index.js.map
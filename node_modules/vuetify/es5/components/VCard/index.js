"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "VCard", {
  enumerable: true,
  get: function get() {
    return _VCard.default;
  }
});
exports.default = exports.VCardTitle = exports.VCardText = exports.VCardSubtitle = exports.VCardActions = void 0;

var _VCard = _interopRequireDefault(require("./VCard"));

var _helpers = require("../../util/helpers");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var VCardActions = (0, _helpers.createSimpleFunctional)('v-card__actions');
exports.VCardActions = VCardActions;
var VCardSubtitle = (0, _helpers.createSimpleFunctional)('v-card__subtitle');
exports.VCardSubtitle = VCardSubtitle;
var VCardText = (0, _helpers.createSimpleFunctional)('v-card__text');
exports.VCardText = VCardText;
var VCardTitle = (0, _helpers.createSimpleFunctional)('v-card__title');
exports.VCardTitle = VCardTitle;
var _default = {
  $_vuetify_subcomponents: {
    VCard: _VCard.default,
    VCardActions: VCardActions,
    VCardSubtitle: VCardSubtitle,
    VCardText: VCardText,
    VCardTitle: VCardTitle
  }
};
exports.default = _default;
//# sourceMappingURL=index.js.map
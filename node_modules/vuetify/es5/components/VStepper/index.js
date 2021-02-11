"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "VStepper", {
  enumerable: true,
  get: function get() {
    return _VStepper.default;
  }
});
Object.defineProperty(exports, "VStepperStep", {
  enumerable: true,
  get: function get() {
    return _VStepperStep.default;
  }
});
Object.defineProperty(exports, "VStepperContent", {
  enumerable: true,
  get: function get() {
    return _VStepperContent.default;
  }
});
exports.default = exports.VStepperItems = exports.VStepperHeader = void 0;

var _helpers = require("../../util/helpers");

var _VStepper = _interopRequireDefault(require("./VStepper"));

var _VStepperStep = _interopRequireDefault(require("./VStepperStep"));

var _VStepperContent = _interopRequireDefault(require("./VStepperContent"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var VStepperHeader = (0, _helpers.createSimpleFunctional)('v-stepper__header');
exports.VStepperHeader = VStepperHeader;
var VStepperItems = (0, _helpers.createSimpleFunctional)('v-stepper__items');
exports.VStepperItems = VStepperItems;
var _default = {
  $_vuetify_subcomponents: {
    VStepper: _VStepper.default,
    VStepperContent: _VStepperContent.default,
    VStepperStep: _VStepperStep.default,
    VStepperHeader: VStepperHeader,
    VStepperItems: VStepperItems
  }
};
exports.default = _default;
//# sourceMappingURL=index.js.map
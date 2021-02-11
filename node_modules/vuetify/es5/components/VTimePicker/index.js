"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "VTimePicker", {
  enumerable: true,
  get: function get() {
    return _VTimePicker.default;
  }
});
Object.defineProperty(exports, "VTimePickerClock", {
  enumerable: true,
  get: function get() {
    return _VTimePickerClock.default;
  }
});
Object.defineProperty(exports, "VTimePickerTitle", {
  enumerable: true,
  get: function get() {
    return _VTimePickerTitle.default;
  }
});
exports.default = void 0;

var _VTimePicker = _interopRequireDefault(require("./VTimePicker"));

var _VTimePickerClock = _interopRequireDefault(require("./VTimePickerClock"));

var _VTimePickerTitle = _interopRequireDefault(require("./VTimePickerTitle"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default = {
  $_vuetify_subcomponents: {
    VTimePicker: _VTimePicker.default,
    VTimePickerClock: _VTimePickerClock.default,
    VTimePickerTitle: _VTimePickerTitle.default
  }
};
exports.default = _default;
//# sourceMappingURL=index.js.map
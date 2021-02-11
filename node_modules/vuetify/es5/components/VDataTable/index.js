"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "VDataTable", {
  enumerable: true,
  get: function get() {
    return _VDataTable.default;
  }
});
Object.defineProperty(exports, "VDataTableHeader", {
  enumerable: true,
  get: function get() {
    return _VDataTableHeader.default;
  }
});
Object.defineProperty(exports, "VEditDialog", {
  enumerable: true,
  get: function get() {
    return _VEditDialog.default;
  }
});
Object.defineProperty(exports, "VSimpleTable", {
  enumerable: true,
  get: function get() {
    return _VSimpleTable.default;
  }
});
Object.defineProperty(exports, "VVirtualTable", {
  enumerable: true,
  get: function get() {
    return _VVirtualTable.default;
  }
});
exports.default = exports.VTableOverflow = void 0;

var _helpers = require("../../util/helpers");

var _VDataTable = _interopRequireDefault(require("./VDataTable"));

var _VDataTableHeader = _interopRequireDefault(require("./VDataTableHeader"));

var _VEditDialog = _interopRequireDefault(require("./VEditDialog"));

var _VSimpleTable = _interopRequireDefault(require("./VSimpleTable"));

var _VVirtualTable = _interopRequireDefault(require("./VVirtualTable"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var VTableOverflow = (0, _helpers.createSimpleFunctional)('v-table__overflow');
exports.VTableOverflow = VTableOverflow;
var _default = {
  $_vuetify_subcomponents: {
    VDataTable: _VDataTable.default,
    VDataTableHeader: _VDataTableHeader.default,
    VEditDialog: _VEditDialog.default,
    VTableOverflow: VTableOverflow,
    VSimpleTable: _VSimpleTable.default,
    VVirtualTable: _VVirtualTable.default
  }
};
exports.default = _default;
//# sourceMappingURL=index.js.map
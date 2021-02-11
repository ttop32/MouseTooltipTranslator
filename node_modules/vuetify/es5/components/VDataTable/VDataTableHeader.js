"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("../../../src/components/VDataTable/VDataTableHeader.sass");

var _VDataTableHeaderMobile = _interopRequireDefault(require("./VDataTableHeaderMobile"));

var _VDataTableHeaderDesktop = _interopRequireDefault(require("./VDataTableHeaderDesktop"));

var _header = _interopRequireDefault(require("./mixins/header"));

var _dedupeModelListeners = _interopRequireDefault(require("../../util/dedupeModelListeners"));

var _mergeData = _interopRequireDefault(require("../../util/mergeData"));

var _rebuildFunctionalSlots = _interopRequireDefault(require("../../util/rebuildFunctionalSlots"));

var _vue = _interopRequireDefault(require("vue"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/* @vue/component */
var _default = _vue.default.extend({
  name: 'v-data-table-header',
  functional: true,
  props: _objectSpread({}, _header.default.options.props, {
    mobile: Boolean
  }),
  render: function render(h, _ref) {
    var props = _ref.props,
        data = _ref.data,
        slots = _ref.slots;
    (0, _dedupeModelListeners.default)(data);
    var children = (0, _rebuildFunctionalSlots.default)(slots(), h);
    data = (0, _mergeData.default)(data, {
      props: props
    });

    if (props.mobile) {
      return h(_VDataTableHeaderMobile.default, data, children);
    } else {
      return h(_VDataTableHeaderDesktop.default, data, children);
    }
  }
});

exports.default = _default;
//# sourceMappingURL=VDataTableHeader.js.map
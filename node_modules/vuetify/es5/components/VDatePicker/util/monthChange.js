"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _pad = _interopRequireDefault(require("./pad"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

/**
 * @param {String} value YYYY-MM format
 * @param {Number} sign -1 or +1
 */
var _default = function _default(value, sign) {
  var _value$split$map = value.split('-').map(Number),
      _value$split$map2 = _slicedToArray(_value$split$map, 2),
      year = _value$split$map2[0],
      month = _value$split$map2[1];

  if (month + sign === 0) {
    return "".concat(year - 1, "-12");
  } else if (month + sign === 13) {
    return "".concat(year + 1, "-01");
  } else {
    return "".concat(year, "-").concat((0, _pad.default)(month + sign));
  }
};

exports.default = _default;
//# sourceMappingURL=monthChange.js.map
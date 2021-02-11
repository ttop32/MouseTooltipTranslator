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

var _default = function _default(dateString, type) {
  var _dateString$split = dateString.split('-'),
      _dateString$split2 = _slicedToArray(_dateString$split, 3),
      year = _dateString$split2[0],
      _dateString$split2$ = _dateString$split2[1],
      month = _dateString$split2$ === void 0 ? 1 : _dateString$split2$,
      _dateString$split2$2 = _dateString$split2[2],
      date = _dateString$split2$2 === void 0 ? 1 : _dateString$split2$2;

  return "".concat(year, "-").concat((0, _pad.default)(month), "-").concat((0, _pad.default)(date)).substr(0, {
    date: 10,
    month: 7,
    year: 4
  }[type]);
};

exports.default = _default;
//# sourceMappingURL=sanitizeDateString.js.map
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

function createNativeLocaleFormatter(locale, options) {
  var substrOptions = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {
    start: 0,
    length: 0
  };

  var makeIsoString = function makeIsoString(dateString) {
    var _dateString$trim$spli = dateString.trim().split(' ')[0].split('-'),
        _dateString$trim$spli2 = _slicedToArray(_dateString$trim$spli, 3),
        year = _dateString$trim$spli2[0],
        month = _dateString$trim$spli2[1],
        date = _dateString$trim$spli2[2];

    return [(0, _pad.default)(year, 4), (0, _pad.default)(month || 1), (0, _pad.default)(date || 1)].join('-');
  };

  try {
    var intlFormatter = new Intl.DateTimeFormat(locale || undefined, options);
    return function (dateString) {
      return intlFormatter.format(new Date("".concat(makeIsoString(dateString), "T00:00:00+00:00")));
    };
  } catch (e) {
    return substrOptions.start || substrOptions.length ? function (dateString) {
      return makeIsoString(dateString).substr(substrOptions.start || 0, substrOptions.length);
    } : undefined;
  }
}

var _default = createNativeLocaleFormatter;
exports.default = _default;
//# sourceMappingURL=createNativeLocaleFormatter.js.map
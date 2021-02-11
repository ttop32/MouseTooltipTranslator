"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = mergeData;
exports.mergeStyles = mergeStyles;
exports.mergeClasses = mergeClasses;
exports.mergeListeners = mergeListeners;

var _helpers = require("./helpers");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

var pattern = {
  styleList: /;(?![^(]*\))/g,
  styleProp: /:(.*)/
};

function parseStyle(style) {
  var styleMap = {};
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = style.split(pattern.styleList)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var s = _step.value;

      var _s$split = s.split(pattern.styleProp),
          _s$split2 = _slicedToArray(_s$split, 2),
          key = _s$split2[0],
          val = _s$split2[1];

      key = key.trim();

      if (!key) {
        continue;
      } // May be undefined if the `key: value` pair is incomplete.


      if (typeof val === 'string') {
        val = val.trim();
      }

      styleMap[(0, _helpers.camelize)(key)] = val;
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator.return != null) {
        _iterator.return();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }

  return styleMap;
}

function mergeData() {
  var mergeTarget = {};
  var i = arguments.length;
  var prop; // Allow for variadic argument length.

  while (i--) {
    // Iterate through the data properties and execute merge strategies
    // Object.keys eliminates need for hasOwnProperty call
    for (var _i2 = 0, _Object$keys = Object.keys(arguments[i]); _i2 < _Object$keys.length; _i2++) {
      prop = _Object$keys[_i2];

      switch (prop) {
        // Array merge strategy (array concatenation)
        case 'class':
        case 'directives':
          if (arguments[i][prop]) {
            mergeTarget[prop] = mergeClasses(mergeTarget[prop], arguments[i][prop]);
          }

          break;

        case 'style':
          if (arguments[i][prop]) {
            mergeTarget[prop] = mergeStyles(mergeTarget[prop], arguments[i][prop]);
          }

          break;
        // Space delimited string concatenation strategy

        case 'staticClass':
          if (!arguments[i][prop]) {
            break;
          }

          if (mergeTarget[prop] === undefined) {
            mergeTarget[prop] = '';
          }

          if (mergeTarget[prop]) {
            // Not an empty string, so concatenate
            mergeTarget[prop] += ' ';
          }

          mergeTarget[prop] += arguments[i][prop].trim();
          break;
        // Object, the properties of which to merge via array merge strategy (array concatenation).
        // Callback merge strategy merges callbacks to the beginning of the array,
        // so that the last defined callback will be invoked first.
        // This is done since to mimic how Object.assign merging
        // uses the last given value to assign.

        case 'on':
        case 'nativeOn':
          if (arguments[i][prop]) {
            mergeTarget[prop] = mergeListeners(mergeTarget[prop], arguments[i][prop]);
          }

          break;
        // Object merge strategy

        case 'attrs':
        case 'props':
        case 'domProps':
        case 'scopedSlots':
        case 'staticStyle':
        case 'hook':
        case 'transition':
          if (!arguments[i][prop]) {
            break;
          }

          if (!mergeTarget[prop]) {
            mergeTarget[prop] = {};
          }

          mergeTarget[prop] = _objectSpread({}, arguments[i][prop], {}, mergeTarget[prop]);
          break;
        // Reassignment strategy (no merge)

        default:
          // slot, key, ref, tag, show, keepAlive
          if (!mergeTarget[prop]) {
            mergeTarget[prop] = arguments[i][prop];
          }

      }
    }
  }

  return mergeTarget;
}

function mergeStyles(target, source) {
  if (!target) return source;
  if (!source) return target;
  target = (0, _helpers.wrapInArray)(typeof target === 'string' ? parseStyle(target) : target);
  return target.concat(typeof source === 'string' ? parseStyle(source) : source);
}

function mergeClasses(target, source) {
  if (!source) return target;
  if (!target) return source;
  return target ? (0, _helpers.wrapInArray)(target).concat(source) : source;
}

function mergeListeners() {
  if (!(arguments.length <= 0 ? undefined : arguments[0])) return arguments.length <= 1 ? undefined : arguments[1];
  if (!(arguments.length <= 1 ? undefined : arguments[1])) return arguments.length <= 0 ? undefined : arguments[0];
  var dest = {};

  for (var i = 2; i--;) {
    var arg = i < 0 || arguments.length <= i ? undefined : arguments[i];

    for (var event in arg) {
      if (!arg[event]) continue;

      if (dest[event]) {
        // Merge current listeners before (because we are iterating backwards).
        // Note that neither "target" or "source" must be altered.
        dest[event] = [].concat(arg[event], dest[event]);
      } else {
        // Straight assign.
        dest[event] = arg[event];
      }
    }
  }

  return dest;
}
//# sourceMappingURL=mergeData.js.map
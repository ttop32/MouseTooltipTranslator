"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Presets = void 0;

var _default = require("../../presets/default");

var _console = require("../../util/console");

var _helpers = require("../../util/helpers");

var _service = require("../service");

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

var Presets =
/*#__PURE__*/
function (_Service) {
  _inherits(Presets, _Service);

  function Presets(parentPreset, parent) {
    var _this;

    _classCallCheck(this, Presets);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(Presets).call(this)); // The default preset

    var defaultPreset = (0, _helpers.mergeDeep)({}, _default.preset); // The user provided preset

    var userPreset = parent.userPreset; // The user provided global preset

    var _userPreset$preset = userPreset.preset,
        globalPreset = _userPreset$preset === void 0 ? {} : _userPreset$preset,
        preset = _objectWithoutProperties(userPreset, ["preset"]);

    if (globalPreset.preset != null) {
      (0, _console.consoleWarn)('Global presets do not support the **preset** option, it can be safely omitted');
    }

    parent.preset = (0, _helpers.mergeDeep)((0, _helpers.mergeDeep)(defaultPreset, globalPreset), preset);
    return _this;
  }

  return Presets;
}(_service.Service);

exports.Presets = Presets;
Presets.property = 'presets';
//# sourceMappingURL=index.js.map
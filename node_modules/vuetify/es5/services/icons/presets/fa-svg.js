"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.convertToComponentDeclarations = convertToComponentDeclarations;
exports.default = void 0;

var _fa = _interopRequireDefault(require("./fa"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function convertToComponentDeclarations(component, iconSet) {
  var result = {};

  for (var key in iconSet) {
    result[key] = {
      component: component,
      props: {
        icon: iconSet[key].split(' fa-')
      }
    };
  }

  return result;
}

var _default = convertToComponentDeclarations('font-awesome-icon', _fa.default);

exports.default = _default;
//# sourceMappingURL=fa-svg.js.map
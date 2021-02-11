"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.parsedCategoryText = parsedCategoryText;
exports.getParsedCategories = getParsedCategories;

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function parsedCategoryText(category, categoryText) {
  return typeof categoryText === 'string' && _typeof(category) === 'object' && category ? category[categoryText] : typeof categoryText === 'function' ? categoryText(category) : category;
}

function getParsedCategories(categories, categoryText) {
  if (typeof categories === 'string') return categories.split(/\s*,\s/);

  if (Array.isArray(categories)) {
    return categories.map(function (category) {
      if (typeof category === 'string') return {
        categoryName: category
      };
      var categoryName = typeof category.categoryName === 'string' ? category.categoryName : parsedCategoryText(category, categoryText);
      return _objectSpread({}, category, {
        categoryName: categoryName
      });
    });
  }

  return [];
}
//# sourceMappingURL=parser.js.map
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _helpers = require("../../util/helpers");

var _vue = _interopRequireDefault(require("vue"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Helpers
// Types
var _default = _vue.default.extend({
  name: 'measurable',
  props: {
    height: [Number, String],
    maxHeight: [Number, String],
    maxWidth: [Number, String],
    minHeight: [Number, String],
    minWidth: [Number, String],
    width: [Number, String]
  },
  computed: {
    measurableStyles: function measurableStyles() {
      var styles = {};
      var height = (0, _helpers.convertToUnit)(this.height);
      var minHeight = (0, _helpers.convertToUnit)(this.minHeight);
      var minWidth = (0, _helpers.convertToUnit)(this.minWidth);
      var maxHeight = (0, _helpers.convertToUnit)(this.maxHeight);
      var maxWidth = (0, _helpers.convertToUnit)(this.maxWidth);
      var width = (0, _helpers.convertToUnit)(this.width);
      if (height) styles.height = height;
      if (minHeight) styles.minHeight = minHeight;
      if (minWidth) styles.minWidth = minWidth;
      if (maxHeight) styles.maxHeight = maxHeight;
      if (maxWidth) styles.maxWidth = maxWidth;
      if (width) styles.width = width;
      return styles;
    }
  }
});

exports.default = _default;
//# sourceMappingURL=index.js.map
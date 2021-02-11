"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = intersectable;

var _intersect = _interopRequireDefault(require("../../directives/intersect"));

var _console = require("../../util/console");

var _vue = _interopRequireDefault(require("vue"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Directives
// Utilities
// Types
function intersectable(options) {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
    // do nothing because intersection observer is not available
    return _vue.default.extend({
      name: 'intersectable'
    });
  }

  return _vue.default.extend({
    name: 'intersectable',
    mounted: function mounted() {
      _intersect.default.inserted(this.$el, {
        name: 'intersect',
        value: this.onObserve
      });
    },
    destroyed: function destroyed() {
      _intersect.default.unbind(this.$el);
    },
    methods: {
      onObserve: function onObserve(entries, observer, isIntersecting) {
        if (!isIntersecting) return;

        for (var i = 0, length = options.onVisible.length; i < length; i++) {
          var callback = this[options.onVisible[i]];

          if (typeof callback === 'function') {
            callback();
            continue;
          }

          (0, _console.consoleWarn)(options.onVisible[i] + ' method is not available on the instance but referenced in intersectable mixin options');
        }
      }
    }
  });
}
//# sourceMappingURL=index.js.map
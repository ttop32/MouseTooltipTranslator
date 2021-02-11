"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("../../../src/components/VImg/VImg.sass");

var _intersect = _interopRequireDefault(require("../../directives/intersect"));

var _VResponsive = _interopRequireDefault(require("../VResponsive"));

var _themeable = _interopRequireDefault(require("../../mixins/themeable"));

var _mixins = _interopRequireDefault(require("../../util/mixins"));

var _mergeData = _interopRequireDefault(require("../../util/mergeData"));

var _console = require("../../util/console");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

var hasIntersect = typeof window !== 'undefined' && 'IntersectionObserver' in window;
/* @vue/component */

var _default2 = (0, _mixins.default)(_VResponsive.default, _themeable.default).extend({
  name: 'v-img',
  directives: {
    intersect: _intersect.default
  },
  props: {
    alt: String,
    contain: Boolean,
    eager: Boolean,
    gradient: String,
    lazySrc: String,
    options: {
      type: Object,
      // For more information on types, navigate to:
      // https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API
      default: function _default() {
        return {
          root: undefined,
          rootMargin: undefined,
          threshold: undefined
        };
      }
    },
    position: {
      type: String,
      default: 'center center'
    },
    sizes: String,
    src: {
      type: [String, Object],
      default: ''
    },
    srcset: String,
    transition: {
      type: [Boolean, String],
      default: 'fade-transition'
    }
  },
  data: function data() {
    return {
      currentSrc: '',
      image: null,
      isLoading: true,
      calculatedAspectRatio: undefined,
      naturalWidth: undefined,
      hasError: false
    };
  },
  computed: {
    computedAspectRatio: function computedAspectRatio() {
      return Number(this.normalisedSrc.aspect || this.calculatedAspectRatio);
    },
    normalisedSrc: function normalisedSrc() {
      return this.src && _typeof(this.src) === 'object' ? {
        src: this.src.src,
        srcset: this.srcset || this.src.srcset,
        lazySrc: this.lazySrc || this.src.lazySrc,
        aspect: Number(this.aspectRatio || this.src.aspect)
      } : {
        src: this.src,
        srcset: this.srcset,
        lazySrc: this.lazySrc,
        aspect: Number(this.aspectRatio || 0)
      };
    },
    __cachedImage: function __cachedImage() {
      if (!(this.normalisedSrc.src || this.normalisedSrc.lazySrc || this.gradient)) return [];
      var backgroundImage = [];
      var src = this.isLoading ? this.normalisedSrc.lazySrc : this.currentSrc;
      if (this.gradient) backgroundImage.push("linear-gradient(".concat(this.gradient, ")"));
      if (src) backgroundImage.push("url(\"".concat(src, "\")"));
      var image = this.$createElement('div', {
        staticClass: 'v-image__image',
        class: {
          'v-image__image--preload': this.isLoading,
          'v-image__image--contain': this.contain,
          'v-image__image--cover': !this.contain
        },
        style: {
          backgroundImage: backgroundImage.join(', '),
          backgroundPosition: this.position
        },
        key: +this.isLoading
      });
      /* istanbul ignore if */

      if (!this.transition) return image;
      return this.$createElement('transition', {
        attrs: {
          name: this.transition,
          mode: 'in-out'
        }
      }, [image]);
    }
  },
  watch: {
    src: function src() {
      // Force re-init when src changes
      if (!this.isLoading) this.init(undefined, undefined, true);else this.loadImage();
    },
    '$vuetify.breakpoint.width': 'getSrc'
  },
  mounted: function mounted() {
    this.init();
  },
  methods: {
    init: function init(entries, observer, isIntersecting) {
      // If the current browser supports the intersection
      // observer api, the image is not observable, and
      // the eager prop isn't being used, do not load
      if (hasIntersect && !isIntersecting && !this.eager) return;

      if (this.normalisedSrc.lazySrc) {
        var lazyImg = new Image();
        lazyImg.src = this.normalisedSrc.lazySrc;
        this.pollForSize(lazyImg, null);
      }
      /* istanbul ignore else */


      if (this.normalisedSrc.src) this.loadImage();
    },
    onLoad: function onLoad() {
      this.getSrc();
      this.isLoading = false;
      this.$emit('load', this.src);

      if (this.image && (this.normalisedSrc.src.endsWith('.svg') || this.normalisedSrc.src.startsWith('data:image/svg+xml'))) {
        if (this.image.naturalHeight && this.image.naturalWidth) {
          this.naturalWidth = this.image.naturalWidth;
          this.calculatedAspectRatio = this.image.naturalWidth / this.image.naturalHeight;
        } else {
          this.calculatedAspectRatio = 1;
        }
      }
    },
    onError: function onError() {
      this.hasError = true;
      this.$emit('error', this.src);
    },
    getSrc: function getSrc() {
      /* istanbul ignore else */
      if (this.image) this.currentSrc = this.image.currentSrc || this.image.src;
    },
    loadImage: function loadImage() {
      var _this = this;

      var image = new Image();
      this.image = image;

      image.onload = function () {
        /* istanbul ignore if */
        if (image.decode) {
          image.decode().catch(function (err) {
            (0, _console.consoleWarn)("Failed to decode image, trying to render anyway\n\n" + "src: ".concat(_this.normalisedSrc.src) + (err.message ? "\nOriginal error: ".concat(err.message) : ''), _this);
          }).then(_this.onLoad);
        } else {
          _this.onLoad();
        }
      };

      image.onerror = this.onError;
      this.hasError = false;
      image.src = this.normalisedSrc.src;
      this.sizes && (image.sizes = this.sizes);
      this.normalisedSrc.srcset && (image.srcset = this.normalisedSrc.srcset);
      this.aspectRatio || this.pollForSize(image);
      this.getSrc();
    },
    pollForSize: function pollForSize(img) {
      var _this2 = this;

      var timeout = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 100;

      var poll = function poll() {
        var naturalHeight = img.naturalHeight,
            naturalWidth = img.naturalWidth;

        if (naturalHeight || naturalWidth) {
          _this2.naturalWidth = naturalWidth;
          _this2.calculatedAspectRatio = naturalWidth / naturalHeight;
        } else if (!img.complete && _this2.isLoading && !_this2.hasError && timeout != null) {
          setTimeout(poll, timeout);
        }
      };

      poll();
    },
    genContent: function genContent() {
      var content = _VResponsive.default.options.methods.genContent.call(this);

      if (this.naturalWidth) {
        this._b(content.data, 'div', {
          style: {
            width: "".concat(this.naturalWidth, "px")
          }
        });
      }

      return content;
    },
    __genPlaceholder: function __genPlaceholder() {
      if (this.$slots.placeholder) {
        var placeholder = this.isLoading ? [this.$createElement('div', {
          staticClass: 'v-image__placeholder'
        }, this.$slots.placeholder)] : [];
        if (!this.transition) return placeholder[0];
        return this.$createElement('transition', {
          props: {
            appear: true,
            name: this.transition
          }
        }, placeholder);
      }
    }
  },
  render: function render(h) {
    var node = _VResponsive.default.options.render.call(this, h);

    var data = (0, _mergeData.default)(node.data, {
      staticClass: 'v-image',
      attrs: {
        'aria-label': this.alt,
        role: this.alt ? 'img' : undefined
      },
      class: this.themeClasses,
      // Only load intersect directive if it
      // will work in the current browser.
      directives: hasIntersect ? [{
        name: 'intersect',
        modifiers: {
          once: true
        },
        value: {
          handler: this.init,
          options: this.options
        }
      }] : undefined
    });
    node.children = [this.__cachedSizer, this.__cachedImage, this.__genPlaceholder(), this.genContent()];
    return h(node.tag, data, node.children);
  }
});

exports.default = _default2;
//# sourceMappingURL=VImg.js.map
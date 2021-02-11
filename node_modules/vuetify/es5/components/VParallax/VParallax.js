"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("../../../src/components/VParallax/VParallax.sass");

var _translatable = _interopRequireDefault(require("../../mixins/translatable"));

var _mixins = _interopRequireDefault(require("../../util/mixins"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Style
// Mixins
var baseMixins = (0, _mixins.default)(_translatable.default);
/* @vue/component */

var _default = baseMixins.extend().extend({
  name: 'v-parallax',
  props: {
    alt: {
      type: String,
      default: ''
    },
    height: {
      type: [String, Number],
      default: 500
    },
    src: String,
    srcset: String
  },
  data: function data() {
    return {
      isBooted: false
    };
  },
  computed: {
    styles: function styles() {
      return {
        display: 'block',
        opacity: this.isBooted ? 1 : 0,
        transform: "translate(-50%, ".concat(this.parallax, "px)")
      };
    }
  },
  mounted: function mounted() {
    this.init();
  },
  methods: {
    init: function init() {
      var _this = this;

      var img = this.$refs.img;
      if (!img) return;

      if (img.complete) {
        this.translate();
        this.listeners();
      } else {
        img.addEventListener('load', function () {
          _this.translate();

          _this.listeners();
        }, false);
      }

      this.isBooted = true;
    },
    objHeight: function objHeight() {
      return this.$refs.img.naturalHeight;
    }
  },
  render: function render(h) {
    var imgData = {
      staticClass: 'v-parallax__image',
      style: this.styles,
      attrs: {
        src: this.src,
        srcset: this.srcset,
        alt: this.alt
      },
      ref: 'img'
    };
    var container = h('div', {
      staticClass: 'v-parallax__image-container'
    }, [h('img', imgData)]);
    var content = h('div', {
      staticClass: 'v-parallax__content'
    }, this.$slots.default);
    return h('div', {
      staticClass: 'v-parallax',
      style: {
        height: "".concat(this.height, "px")
      },
      on: this.$listeners
    }, [container, content]);
  }
});

exports.default = _default;
//# sourceMappingURL=VParallax.js.map
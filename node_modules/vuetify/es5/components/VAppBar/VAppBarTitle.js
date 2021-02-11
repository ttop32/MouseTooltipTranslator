"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _registrable = require("../../mixins/registrable");

var _helpers = require("../../util/helpers");

var _easingPatterns = require("../../services/goto/easing-patterns");

// Mixins
// Utilities
var base = (0, _registrable.inject)('VAppBar', 'v-app-bar-title', 'v-app-bar');

var _default = base.extend().extend({
  name: 'v-app-bar-title',
  data: function data() {
    return {
      contentWidth: 0,
      left: 0,
      width: 0
    };
  },
  watch: {
    '$vuetify.breakpoint.width': 'updateDimensions'
  },
  computed: {
    styles: function styles() {
      if (!this.contentWidth) return {};
      var min = this.width;
      var max = this.contentWidth;
      var ratio = (0, _easingPatterns.easeInOutCubic)(Math.min(1, this.VAppBar.scrollRatio * 1.5));
      return {
        width: (0, _helpers.convertToUnit)(min + (max - min) * ratio),
        visibility: this.VAppBar.scrollRatio ? 'visible' : 'hidden'
      };
    }
  },
  mounted: function mounted() {
    this.updateDimensions();
  },
  methods: {
    updateDimensions: function updateDimensions() {
      var dimensions = this.$refs.placeholder.getBoundingClientRect();
      this.width = dimensions.width;
      this.left = dimensions.left;
      this.contentWidth = this.$refs.content.scrollWidth;
    }
  },
  render: function render(h) {
    return h('div', {
      class: 'v-toolbar__title v-app-bar-title'
    }, [h('div', {
      class: 'v-app-bar-title__content',
      style: this.styles,
      ref: 'content'
    }, [this.$slots.default]), h('div', {
      class: 'v-app-bar-title__placeholder',
      style: {
        visibility: this.VAppBar.scrollRatio ? 'hidden' : 'visible'
      },
      ref: 'placeholder'
    }, [this.$slots.default])]);
  }
});

exports.default = _default;
//# sourceMappingURL=VAppBarTitle.js.map
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("../../../src/components/VColorPicker/VColorPickerCanvas.sass");

var _helpers = require("../../util/helpers");

var _util = require("./util");

var _vue = _interopRequireDefault(require("vue"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Styles
// Helpers
// Types
var _default2 = _vue.default.extend({
  name: 'v-color-picker-canvas',
  props: {
    color: {
      type: Object,
      default: function _default() {
        return (0, _util.fromRGBA)({
          r: 255,
          g: 0,
          b: 0,
          a: 1
        });
      }
    },
    disabled: Boolean,
    dotSize: {
      type: [Number, String],
      default: 10
    },
    height: {
      type: [Number, String],
      default: 150
    },
    width: {
      type: [Number, String],
      default: 300
    }
  },
  data: function data() {
    return {
      boundingRect: {
        width: 0,
        height: 0,
        left: 0,
        top: 0
      }
    };
  },
  computed: {
    dot: function dot() {
      if (!this.color) return {
        x: 0,
        y: 0
      };
      return {
        x: this.color.hsva.s * parseInt(this.width, 10),
        y: (1 - this.color.hsva.v) * parseInt(this.height, 10)
      };
    }
  },
  watch: {
    'color.hue': 'updateCanvas'
  },
  mounted: function mounted() {
    this.updateCanvas();
  },
  methods: {
    emitColor: function emitColor(x, y) {
      var _this$boundingRect = this.boundingRect,
          left = _this$boundingRect.left,
          top = _this$boundingRect.top,
          width = _this$boundingRect.width,
          height = _this$boundingRect.height;
      this.$emit('update:color', (0, _util.fromHSVA)({
        h: this.color.hue,
        s: (0, _helpers.clamp)(x - left, 0, width) / width,
        v: 1 - (0, _helpers.clamp)(y - top, 0, height) / height,
        a: this.color.alpha
      }));
    },
    updateCanvas: function updateCanvas() {
      if (!this.color) return;
      var canvas = this.$refs.canvas;
      var ctx = canvas.getContext('2d');
      if (!ctx) return;
      var saturationGradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
      saturationGradient.addColorStop(0, 'hsla(0, 0%, 100%, 1)'); // white

      saturationGradient.addColorStop(1, "hsla(".concat(this.color.hue, ", 100%, 50%, 1)"));
      ctx.fillStyle = saturationGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      var valueGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      valueGradient.addColorStop(0, 'hsla(0, 0%, 100%, 0)'); // transparent

      valueGradient.addColorStop(1, 'hsla(0, 0%, 0%, 1)'); // black

      ctx.fillStyle = valueGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    },
    handleClick: function handleClick(e) {
      if (this.disabled) return;
      this.boundingRect = this.$el.getBoundingClientRect();
      this.emitColor(e.clientX, e.clientY);
    },
    handleMouseDown: function handleMouseDown(e) {
      // To prevent selection while moving cursor
      e.preventDefault();
      if (this.disabled) return;
      this.boundingRect = this.$el.getBoundingClientRect();
      window.addEventListener('mousemove', this.handleMouseMove);
      window.addEventListener('mouseup', this.handleMouseUp);
    },
    handleMouseMove: function handleMouseMove(e) {
      if (this.disabled) return;
      this.emitColor(e.clientX, e.clientY);
    },
    handleMouseUp: function handleMouseUp() {
      window.removeEventListener('mousemove', this.handleMouseMove);
      window.removeEventListener('mouseup', this.handleMouseUp);
    },
    genCanvas: function genCanvas() {
      return this.$createElement('canvas', {
        ref: 'canvas',
        attrs: {
          width: this.width,
          height: this.height
        }
      });
    },
    genDot: function genDot() {
      var radius = parseInt(this.dotSize, 10) / 2;
      var x = (0, _helpers.convertToUnit)(this.dot.x - radius);
      var y = (0, _helpers.convertToUnit)(this.dot.y - radius);
      return this.$createElement('div', {
        staticClass: 'v-color-picker__canvas-dot',
        class: {
          'v-color-picker__canvas-dot--disabled': this.disabled
        },
        style: {
          width: (0, _helpers.convertToUnit)(this.dotSize),
          height: (0, _helpers.convertToUnit)(this.dotSize),
          transform: "translate(".concat(x, ", ").concat(y, ")")
        }
      });
    }
  },
  render: function render(h) {
    return h('div', {
      staticClass: 'v-color-picker__canvas',
      style: {
        width: (0, _helpers.convertToUnit)(this.width),
        height: (0, _helpers.convertToUnit)(this.height)
      },
      on: {
        click: this.handleClick,
        mousedown: this.handleMouseDown
      }
    }, [this.genCanvas(), this.genDot()]);
  }
});

exports.default = _default2;
//# sourceMappingURL=VColorPickerCanvas.js.map
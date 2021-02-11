"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("../../../src/components/VRating/VRating.sass");

var _VIcon = _interopRequireDefault(require("../VIcon"));

var _colorable = _interopRequireDefault(require("../../mixins/colorable"));

var _delayable = _interopRequireDefault(require("../../mixins/delayable"));

var _sizeable = _interopRequireDefault(require("../../mixins/sizeable"));

var _rippleable = _interopRequireDefault(require("../../mixins/rippleable"));

var _themeable = _interopRequireDefault(require("../../mixins/themeable"));

var _helpers = require("../../util/helpers");

var _mixins = _interopRequireDefault(require("../../util/mixins"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Styles
// Components
// Mixins
// Utilities

/* @vue/component */
var _default = (0, _mixins.default)(_colorable.default, _delayable.default, _rippleable.default, _sizeable.default, _themeable.default).extend({
  name: 'v-rating',
  props: {
    backgroundColor: {
      type: String,
      default: 'accent'
    },
    color: {
      type: String,
      default: 'primary'
    },
    clearable: Boolean,
    dense: Boolean,
    emptyIcon: {
      type: String,
      default: '$ratingEmpty'
    },
    fullIcon: {
      type: String,
      default: '$ratingFull'
    },
    halfIcon: {
      type: String,
      default: '$ratingHalf'
    },
    halfIncrements: Boolean,
    hover: Boolean,
    length: {
      type: [Number, String],
      default: 5
    },
    readonly: Boolean,
    size: [Number, String],
    value: {
      type: Number,
      default: 0
    },
    iconLabel: {
      type: String,
      default: '$vuetify.rating.ariaLabel.icon'
    }
  },
  data: function data() {
    return {
      hoverIndex: -1,
      internalValue: this.value
    };
  },
  computed: {
    directives: function directives() {
      if (this.readonly || !this.ripple) return [];
      return [{
        name: 'ripple',
        value: {
          circle: true
        }
      }];
    },
    iconProps: function iconProps() {
      var _this$$props = this.$props,
          dark = _this$$props.dark,
          large = _this$$props.large,
          light = _this$$props.light,
          medium = _this$$props.medium,
          small = _this$$props.small,
          size = _this$$props.size,
          xLarge = _this$$props.xLarge,
          xSmall = _this$$props.xSmall;
      return {
        dark: dark,
        large: large,
        light: light,
        medium: medium,
        size: size,
        small: small,
        xLarge: xLarge,
        xSmall: xSmall
      };
    },
    isHovering: function isHovering() {
      return this.hover && this.hoverIndex >= 0;
    }
  },
  watch: {
    internalValue: function internalValue(val) {
      val !== this.value && this.$emit('input', val);
    },
    value: function value(val) {
      this.internalValue = val;
    }
  },
  methods: {
    createClickFn: function createClickFn(i) {
      var _this = this;

      return function (e) {
        if (_this.readonly) return;

        var newValue = _this.genHoverIndex(e, i);

        if (_this.clearable && _this.internalValue === newValue) {
          _this.internalValue = 0;
        } else {
          _this.internalValue = newValue;
        }
      };
    },
    createProps: function createProps(i) {
      var props = {
        index: i,
        value: this.internalValue,
        click: this.createClickFn(i),
        isFilled: Math.floor(this.internalValue) > i,
        isHovered: Math.floor(this.hoverIndex) > i
      };

      if (this.halfIncrements) {
        props.isHalfHovered = !props.isHovered && (this.hoverIndex - i) % 1 > 0;
        props.isHalfFilled = !props.isFilled && (this.internalValue - i) % 1 > 0;
      }

      return props;
    },
    genHoverIndex: function genHoverIndex(e, i) {
      var isHalf = this.isHalfEvent(e);

      if (this.halfIncrements && this.$vuetify.rtl) {
        isHalf = !isHalf;
      }

      return i + (isHalf ? 0.5 : 1);
    },
    getIconName: function getIconName(props) {
      var isFull = this.isHovering ? props.isHovered : props.isFilled;
      var isHalf = this.isHovering ? props.isHalfHovered : props.isHalfFilled;
      return isFull ? this.fullIcon : isHalf ? this.halfIcon : this.emptyIcon;
    },
    getColor: function getColor(props) {
      if (this.isHovering) {
        if (props.isHovered || props.isHalfHovered) return this.color;
      } else {
        if (props.isFilled || props.isHalfFilled) return this.color;
      }

      return this.backgroundColor;
    },
    isHalfEvent: function isHalfEvent(e) {
      if (this.halfIncrements) {
        var rect = e.target && e.target.getBoundingClientRect();
        if (rect && e.pageX - rect.left < rect.width / 2) return true;
      }

      return false;
    },
    onMouseEnter: function onMouseEnter(e, i) {
      var _this2 = this;

      this.runDelay('open', function () {
        _this2.hoverIndex = _this2.genHoverIndex(e, i);
      });
    },
    onMouseLeave: function onMouseLeave() {
      var _this3 = this;

      this.runDelay('close', function () {
        return _this3.hoverIndex = -1;
      });
    },
    genItem: function genItem(i) {
      var _this4 = this;

      var props = this.createProps(i);
      if (this.$scopedSlots.item) return this.$scopedSlots.item(props);
      var listeners = {
        click: props.click
      };

      if (this.hover) {
        listeners.mouseenter = function (e) {
          return _this4.onMouseEnter(e, i);
        };

        listeners.mouseleave = this.onMouseLeave;

        if (this.halfIncrements) {
          listeners.mousemove = function (e) {
            return _this4.onMouseEnter(e, i);
          };
        }
      }

      return this.$createElement(_VIcon.default, this.setTextColor(this.getColor(props), {
        attrs: {
          tabindex: -1,
          'aria-label': this.$vuetify.lang.t(this.iconLabel, i + 1, Number(this.length))
        },
        directives: this.directives,
        props: this.iconProps,
        on: listeners
      }), [this.getIconName(props)]);
    }
  },
  render: function render(h) {
    var _this5 = this;

    var children = (0, _helpers.createRange)(Number(this.length)).map(function (i) {
      return _this5.genItem(i);
    });
    return h('div', {
      staticClass: 'v-rating',
      class: {
        'v-rating--readonly': this.readonly,
        'v-rating--dense': this.dense
      }
    }, children);
  }
});

exports.default = _default;
//# sourceMappingURL=VRating.js.map
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("../../../src/components/VSpeedDial/VSpeedDial.sass");

var _toggleable = _interopRequireDefault(require("../../mixins/toggleable"));

var _positionable = _interopRequireDefault(require("../../mixins/positionable"));

var _transitionable = _interopRequireDefault(require("../../mixins/transitionable"));

var _clickOutside = _interopRequireDefault(require("../../directives/click-outside"));

var _mixins = _interopRequireDefault(require("../../util/mixins"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/* @vue/component */
var _default = (0, _mixins.default)(_positionable.default, _toggleable.default, _transitionable.default).extend({
  name: 'v-speed-dial',
  directives: {
    ClickOutside: _clickOutside.default
  },
  props: {
    direction: {
      type: String,
      default: 'top',
      validator: function validator(val) {
        return ['top', 'right', 'bottom', 'left'].includes(val);
      }
    },
    openOnHover: Boolean,
    transition: {
      type: String,
      default: 'scale-transition'
    }
  },
  computed: {
    classes: function classes() {
      var _ref;

      return _ref = {
        'v-speed-dial': true,
        'v-speed-dial--top': this.top,
        'v-speed-dial--right': this.right,
        'v-speed-dial--bottom': this.bottom,
        'v-speed-dial--left': this.left,
        'v-speed-dial--absolute': this.absolute,
        'v-speed-dial--fixed': this.fixed
      }, _defineProperty(_ref, "v-speed-dial--direction-".concat(this.direction), true), _defineProperty(_ref, 'v-speed-dial--is-active', this.isActive), _ref;
    }
  },
  render: function render(h) {
    var _this = this;

    var children = [];
    var data = {
      class: this.classes,
      directives: [{
        name: 'click-outside',
        value: function value() {
          return _this.isActive = false;
        }
      }],
      on: {
        click: function click() {
          return _this.isActive = !_this.isActive;
        }
      }
    };

    if (this.openOnHover) {
      data.on.mouseenter = function () {
        return _this.isActive = true;
      };

      data.on.mouseleave = function () {
        return _this.isActive = false;
      };
    }

    if (this.isActive) {
      var btnCount = 0;
      children = (this.$slots.default || []).map(function (b, i) {
        if (b.tag && typeof b.componentOptions !== 'undefined' && (b.componentOptions.Ctor.options.name === 'v-btn' || b.componentOptions.Ctor.options.name === 'v-tooltip')) {
          btnCount++;
          return h('div', {
            style: {
              transitionDelay: btnCount * 0.05 + 's'
            },
            key: i
          }, [b]);
        } else {
          b.key = i;
          return b;
        }
      });
    }

    var list = h('transition-group', {
      class: 'v-speed-dial__list',
      props: {
        name: this.transition,
        mode: this.mode,
        origin: this.origin,
        tag: 'div'
      }
    }, children);
    return h('div', data, [this.$slots.activator, list]);
  }
});

exports.default = _default;
//# sourceMappingURL=VSpeedDial.js.map
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("../../../src/components/VPagination/VPagination.sass");

var _VIcon = _interopRequireDefault(require("../VIcon"));

var _resize = _interopRequireDefault(require("../../directives/resize"));

var _colorable = _interopRequireDefault(require("../../mixins/colorable"));

var _intersectable = _interopRequireDefault(require("../../mixins/intersectable"));

var _themeable = _interopRequireDefault(require("../../mixins/themeable"));

var _mixins = _interopRequireDefault(require("../../util/mixins"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/* @vue/component */
var _default = (0, _mixins.default)(_colorable.default, (0, _intersectable.default)({
  onVisible: ['init']
}), _themeable.default).extend({
  name: 'v-pagination',
  directives: {
    Resize: _resize.default
  },
  props: {
    circle: Boolean,
    disabled: Boolean,
    length: {
      type: Number,
      default: 0,
      validator: function validator(val) {
        return val % 1 === 0;
      }
    },
    nextIcon: {
      type: String,
      default: '$next'
    },
    prevIcon: {
      type: String,
      default: '$prev'
    },
    totalVisible: [Number, String],
    value: {
      type: Number,
      default: 0
    },
    pageAriaLabel: {
      type: String,
      default: '$vuetify.pagination.ariaLabel.page'
    },
    currentPageAriaLabel: {
      type: String,
      default: '$vuetify.pagination.ariaLabel.currentPage'
    },
    previousAriaLabel: {
      type: String,
      default: '$vuetify.pagination.ariaLabel.previous'
    },
    nextAriaLabel: {
      type: String,
      default: '$vuetify.pagination.ariaLabel.next'
    },
    wrapperAriaLabel: {
      type: String,
      default: '$vuetify.pagination.ariaLabel.wrapper'
    }
  },
  data: function data() {
    return {
      maxButtons: 0,
      selected: null
    };
  },
  computed: {
    classes: function classes() {
      return _objectSpread({
        'v-pagination': true,
        'v-pagination--circle': this.circle,
        'v-pagination--disabled': this.disabled
      }, this.themeClasses);
    },
    items: function items() {
      var totalVisible = parseInt(this.totalVisible, 10);

      if (totalVisible === 0) {
        return [];
      }

      var maxLength = Math.min(Math.max(0, totalVisible) || this.length, Math.max(0, this.maxButtons) || this.length, this.length);

      if (this.length <= maxLength) {
        return this.range(1, this.length);
      }

      var even = maxLength % 2 === 0 ? 1 : 0;
      var left = Math.floor(maxLength / 2);
      var right = this.length - left + 1 + even;

      if (this.value > left && this.value < right) {
        var start = this.value - left + 2;
        var end = this.value + left - 2 - even;
        return [1, '...'].concat(_toConsumableArray(this.range(start, end)), ['...', this.length]);
      } else if (this.value === left) {
        var _end = this.value + left - 1 - even;

        return [].concat(_toConsumableArray(this.range(1, _end)), ['...', this.length]);
      } else if (this.value === right) {
        var _start = this.value - left + 1;

        return [1, '...'].concat(_toConsumableArray(this.range(_start, this.length)));
      } else {
        return [].concat(_toConsumableArray(this.range(1, left)), ['...'], _toConsumableArray(this.range(right, this.length)));
      }
    }
  },
  watch: {
    value: function value() {
      this.init();
    }
  },
  mounted: function mounted() {
    this.init();
  },
  methods: {
    init: function init() {
      var _this = this;

      this.selected = null;
      this.$nextTick(this.onResize); // TODO: Change this (f75dee3a, cbdf7caa)

      setTimeout(function () {
        return _this.selected = _this.value;
      }, 100);
    },
    onResize: function onResize() {
      var width = this.$el && this.$el.parentElement ? this.$el.parentElement.clientWidth : window.innerWidth;
      this.maxButtons = Math.floor((width - 96) / 42);
    },
    next: function next(e) {
      e.preventDefault();
      this.$emit('input', this.value + 1);
      this.$emit('next');
    },
    previous: function previous(e) {
      e.preventDefault();
      this.$emit('input', this.value - 1);
      this.$emit('previous');
    },
    range: function range(from, to) {
      var range = [];
      from = from > 0 ? from : 1;

      for (var i = from; i <= to; i++) {
        range.push(i);
      }

      return range;
    },
    genIcon: function genIcon(h, icon, disabled, fn, label) {
      return h('li', [h('button', {
        staticClass: 'v-pagination__navigation',
        class: {
          'v-pagination__navigation--disabled': disabled
        },
        attrs: {
          disabled: disabled,
          type: 'button',
          'aria-label': label
        },
        on: disabled ? {} : {
          click: fn
        }
      }, [h(_VIcon.default, [icon])])]);
    },
    genItem: function genItem(h, i) {
      var _this2 = this;

      var color = i === this.value && (this.color || 'primary');
      var isCurrentPage = i === this.value;
      var ariaLabel = isCurrentPage ? this.currentPageAriaLabel : this.pageAriaLabel;
      return h('button', this.setBackgroundColor(color, {
        staticClass: 'v-pagination__item',
        class: {
          'v-pagination__item--active': i === this.value
        },
        attrs: {
          type: 'button',
          'aria-current': isCurrentPage,
          'aria-label': this.$vuetify.lang.t(ariaLabel, i)
        },
        on: {
          click: function click() {
            return _this2.$emit('input', i);
          }
        }
      }), [i.toString()]);
    },
    genItems: function genItems(h) {
      var _this3 = this;

      return this.items.map(function (i, index) {
        return h('li', {
          key: index
        }, [isNaN(Number(i)) ? h('span', {
          class: 'v-pagination__more'
        }, [i.toString()]) : _this3.genItem(h, i)]);
      });
    },
    genList: function genList(h, children) {
      return h('ul', {
        directives: [{
          modifiers: {
            quiet: true
          },
          name: 'resize',
          value: this.onResize
        }],
        class: this.classes
      }, children);
    }
  },
  render: function render(h) {
    var children = [this.genIcon(h, this.$vuetify.rtl ? this.nextIcon : this.prevIcon, this.value <= 1, this.previous, this.$vuetify.lang.t(this.previousAriaLabel)), this.genItems(h), this.genIcon(h, this.$vuetify.rtl ? this.prevIcon : this.nextIcon, this.value >= this.length, this.next, this.$vuetify.lang.t(this.nextAriaLabel))];
    return h('nav', {
      attrs: {
        role: 'navigation',
        'aria-label': this.$vuetify.lang.t(this.wrapperAriaLabel)
      }
    }, [this.genList(h, children)]);
  }
});

exports.default = _default;
//# sourceMappingURL=VPagination.js.map
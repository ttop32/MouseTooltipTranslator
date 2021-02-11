"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.BaseItem = void 0;

var _groupable = require("../../mixins/groupable");

var _mixins = _interopRequireDefault(require("../../util/mixins"));

var _console = require("../../util/console");

var _vue = _interopRequireDefault(require("vue"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/* @vue/component */
var BaseItem = _vue.default.extend({
  props: {
    activeClass: String,
    value: {
      required: false
    }
  },
  data: function data() {
    return {
      isActive: false
    };
  },
  methods: {
    toggle: function toggle() {
      this.isActive = !this.isActive;
    }
  },
  render: function render() {
    if (!this.$scopedSlots.default) {
      (0, _console.consoleWarn)('v-item is missing a default scopedSlot', this);
      return null;
    }

    var element;
    /* istanbul ignore else */

    if (this.$scopedSlots.default) {
      element = this.$scopedSlots.default({
        active: this.isActive,
        toggle: this.toggle
      });
    }

    if (Array.isArray(element) && element.length === 1) {
      element = element[0];
    }

    if (!element || Array.isArray(element) || !element.tag) {
      (0, _console.consoleWarn)('v-item should only contain a single element', this);
      return element;
    }

    element.data = this._b(element.data || {}, element.tag, {
      class: _defineProperty({}, this.activeClass, this.isActive)
    });
    return element;
  }
});

exports.BaseItem = BaseItem;

var _default = (0, _mixins.default)(BaseItem, (0, _groupable.factory)('itemGroup', 'v-item', 'v-item-group')).extend({
  name: 'v-item'
});

exports.default = _default;
//# sourceMappingURL=VItem.js.map
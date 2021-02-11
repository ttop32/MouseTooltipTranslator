"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.BaseItemGroup = void 0;

require("../../../src/components/VItemGroup/VItemGroup.sass");

var _proxyable = _interopRequireDefault(require("../../mixins/proxyable"));

var _themeable = _interopRequireDefault(require("../../mixins/themeable"));

var _mixins = _interopRequireDefault(require("../../util/mixins"));

var _console = require("../../util/console");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var BaseItemGroup = (0, _mixins.default)(_proxyable.default, _themeable.default).extend({
  name: 'base-item-group',
  props: {
    activeClass: {
      type: String,
      default: 'v-item--active'
    },
    mandatory: Boolean,
    max: {
      type: [Number, String],
      default: null
    },
    multiple: Boolean,
    tag: {
      type: String,
      default: 'div'
    }
  },
  data: function data() {
    return {
      // As long as a value is defined, show it
      // Otherwise, check if multiple
      // to determine which default to provide
      internalLazyValue: this.value !== undefined ? this.value : this.multiple ? [] : undefined,
      items: []
    };
  },
  computed: {
    classes: function classes() {
      return _objectSpread({
        'v-item-group': true
      }, this.themeClasses);
    },
    selectedIndex: function selectedIndex() {
      return this.selectedItem && this.items.indexOf(this.selectedItem) || -1;
    },
    selectedItem: function selectedItem() {
      if (this.multiple) return undefined;
      return this.selectedItems[0];
    },
    selectedItems: function selectedItems() {
      var _this = this;

      return this.items.filter(function (item, index) {
        return _this.toggleMethod(_this.getValue(item, index));
      });
    },
    selectedValues: function selectedValues() {
      if (this.internalValue == null) return [];
      return Array.isArray(this.internalValue) ? this.internalValue : [this.internalValue];
    },
    toggleMethod: function toggleMethod() {
      var _this2 = this;

      if (!this.multiple) {
        return function (v) {
          return _this2.internalValue === v;
        };
      }

      var internalValue = this.internalValue;

      if (Array.isArray(internalValue)) {
        return function (v) {
          return internalValue.includes(v);
        };
      }

      return function () {
        return false;
      };
    }
  },
  watch: {
    internalValue: 'updateItemsState',
    items: 'updateItemsState'
  },
  created: function created() {
    if (this.multiple && !Array.isArray(this.internalValue)) {
      (0, _console.consoleWarn)('Model must be bound to an array if the multiple property is true.', this);
    }
  },
  methods: {
    genData: function genData() {
      return {
        class: this.classes
      };
    },
    getValue: function getValue(item, i) {
      return item.value == null || item.value === '' ? i : item.value;
    },
    onClick: function onClick(item) {
      this.updateInternalValue(this.getValue(item, this.items.indexOf(item)));
    },
    register: function register(item) {
      var _this3 = this;

      var index = this.items.push(item) - 1;
      item.$on('change', function () {
        return _this3.onClick(item);
      }); // If no value provided and mandatory,
      // assign first registered item

      if (this.mandatory && !this.selectedValues.length) {
        this.updateMandatory();
      }

      this.updateItem(item, index);
    },
    unregister: function unregister(item) {
      if (this._isDestroyed) return;
      var index = this.items.indexOf(item);
      var value = this.getValue(item, index);
      this.items.splice(index, 1);
      var valueIndex = this.selectedValues.indexOf(value); // Items is not selected, do nothing

      if (valueIndex < 0) return; // If not mandatory, use regular update process

      if (!this.mandatory) {
        return this.updateInternalValue(value);
      } // Remove the value


      if (this.multiple && Array.isArray(this.internalValue)) {
        this.internalValue = this.internalValue.filter(function (v) {
          return v !== value;
        });
      } else {
        this.internalValue = undefined;
      } // If mandatory and we have no selection
      // add the last item as value

      /* istanbul ignore else */


      if (!this.selectedItems.length) {
        this.updateMandatory(true);
      }
    },
    updateItem: function updateItem(item, index) {
      var value = this.getValue(item, index);
      item.isActive = this.toggleMethod(value);
    },
    // https://github.com/vuetifyjs/vuetify/issues/5352
    updateItemsState: function updateItemsState() {
      var _this4 = this;

      this.$nextTick(function () {
        if (_this4.mandatory && !_this4.selectedItems.length) {
          return _this4.updateMandatory();
        } // TODO: Make this smarter so it
        // doesn't have to iterate every
        // child in an update


        _this4.items.forEach(_this4.updateItem);
      });
    },
    updateInternalValue: function updateInternalValue(value) {
      this.multiple ? this.updateMultiple(value) : this.updateSingle(value);
    },
    updateMandatory: function updateMandatory(last) {
      if (!this.items.length) return;
      var items = this.items.slice();
      if (last) items.reverse();
      var item = items.find(function (item) {
        return !item.disabled;
      }); // If no tabs are available
      // aborts mandatory value

      if (!item) return;
      var index = this.items.indexOf(item);
      this.updateInternalValue(this.getValue(item, index));
    },
    updateMultiple: function updateMultiple(value) {
      var defaultValue = Array.isArray(this.internalValue) ? this.internalValue : [];
      var internalValue = defaultValue.slice();
      var index = internalValue.findIndex(function (val) {
        return val === value;
      });
      if (this.mandatory && // Item already exists
      index > -1 && // value would be reduced below min
      internalValue.length - 1 < 1) return;
      if ( // Max is set
      this.max != null && // Item doesn't exist
      index < 0 && // value would be increased above max
      internalValue.length + 1 > this.max) return;
      index > -1 ? internalValue.splice(index, 1) : internalValue.push(value);
      this.internalValue = internalValue;
    },
    updateSingle: function updateSingle(value) {
      var isSame = value === this.internalValue;
      if (this.mandatory && isSame) return;
      this.internalValue = isSame ? undefined : value;
    }
  },
  render: function render(h) {
    return h(this.tag, this.genData(), this.$slots.default);
  }
});
exports.BaseItemGroup = BaseItemGroup;

var _default = BaseItemGroup.extend({
  name: 'v-item-group',
  provide: function provide() {
    return {
      itemGroup: this
    };
  }
});

exports.default = _default;
//# sourceMappingURL=VItemGroup.js.map
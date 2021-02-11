"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("../../../src/components/VAutocomplete/VAutocomplete.sass");

var _VSelect = _interopRequireWildcard(require("../VSelect/VSelect"));

var _VTextField = _interopRequireDefault(require("../VTextField/VTextField"));

var _mergeData = _interopRequireDefault(require("../../util/mergeData"));

var _helpers = require("../../util/helpers");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var defaultMenuProps = _objectSpread({}, _VSelect.defaultMenuProps, {
  offsetY: true,
  offsetOverflow: true,
  transition: false
});
/* @vue/component */


var _default2 = _VSelect.default.extend({
  name: 'v-autocomplete',
  props: {
    allowOverflow: {
      type: Boolean,
      default: true
    },
    autoSelectFirst: {
      type: Boolean,
      default: false
    },
    filter: {
      type: Function,
      default: function _default(item, queryText, itemText) {
        return itemText.toLocaleLowerCase().indexOf(queryText.toLocaleLowerCase()) > -1;
      }
    },
    hideNoData: Boolean,
    menuProps: {
      type: _VSelect.default.options.props.menuProps.type,
      default: function _default() {
        return defaultMenuProps;
      }
    },
    noFilter: Boolean,
    searchInput: {
      type: String
    }
  },
  data: function data() {
    return {
      lazySearch: this.searchInput
    };
  },
  computed: {
    classes: function classes() {
      return _objectSpread({}, _VSelect.default.options.computed.classes.call(this), {
        'v-autocomplete': true,
        'v-autocomplete--is-selecting-index': this.selectedIndex > -1
      });
    },
    computedItems: function computedItems() {
      return this.filteredItems;
    },
    selectedValues: function selectedValues() {
      var _this = this;

      return this.selectedItems.map(function (item) {
        return _this.getValue(item);
      });
    },
    hasDisplayedItems: function hasDisplayedItems() {
      var _this2 = this;

      return this.hideSelected ? this.filteredItems.some(function (item) {
        return !_this2.hasItem(item);
      }) : this.filteredItems.length > 0;
    },
    currentRange: function currentRange() {
      if (this.selectedItem == null) return 0;
      return String(this.getText(this.selectedItem)).length;
    },
    filteredItems: function filteredItems() {
      var _this3 = this;

      if (!this.isSearching || this.noFilter || this.internalSearch == null) return this.allItems;
      return this.allItems.filter(function (item) {
        var value = (0, _helpers.getPropertyFromItem)(item, _this3.itemText);
        var text = value != null ? String(value) : '';
        return _this3.filter(item, String(_this3.internalSearch), text);
      });
    },
    internalSearch: {
      get: function get() {
        return this.lazySearch;
      },
      set: function set(val) {
        this.lazySearch = val;
        this.$emit('update:search-input', val);
      }
    },
    isAnyValueAllowed: function isAnyValueAllowed() {
      return false;
    },
    isDirty: function isDirty() {
      return this.searchIsDirty || this.selectedItems.length > 0;
    },
    isSearching: function isSearching() {
      return this.multiple && this.searchIsDirty || this.searchIsDirty && this.internalSearch !== this.getText(this.selectedItem);
    },
    menuCanShow: function menuCanShow() {
      if (!this.isFocused) return false;
      return this.hasDisplayedItems || !this.hideNoData;
    },
    $_menuProps: function $_menuProps() {
      var props = _VSelect.default.options.computed.$_menuProps.call(this);

      props.contentClass = "v-autocomplete__content ".concat(props.contentClass || '').trim();
      return _objectSpread({}, defaultMenuProps, {}, props);
    },
    searchIsDirty: function searchIsDirty() {
      return this.internalSearch != null;
    },
    selectedItem: function selectedItem() {
      var _this4 = this;

      if (this.multiple) return null;
      return this.selectedItems.find(function (i) {
        return _this4.valueComparator(_this4.getValue(i), _this4.getValue(_this4.internalValue));
      });
    },
    listData: function listData() {
      var data = _VSelect.default.options.computed.listData.call(this);

      data.props = _objectSpread({}, data.props, {
        items: this.virtualizedItems,
        noFilter: this.noFilter || !this.isSearching || !this.filteredItems.length,
        searchInput: this.internalSearch
      });
      return data;
    }
  },
  watch: {
    filteredItems: 'onFilteredItemsChanged',
    internalValue: 'setSearch',
    isFocused: function isFocused(val) {
      if (val) {
        document.addEventListener('copy', this.onCopy);
        this.$refs.input && this.$refs.input.select();
      } else {
        document.removeEventListener('copy', this.onCopy);
        this.updateSelf();
      }
    },
    isMenuActive: function isMenuActive(val) {
      if (val || !this.hasSlot) return;
      this.lazySearch = null;
    },
    items: function items(val, oldVal) {
      // If we are focused, the menu
      // is not active, hide no data is enabled,
      // and items change
      // User is probably async loading
      // items, try to activate the menu
      if (!(oldVal && oldVal.length) && this.hideNoData && this.isFocused && !this.isMenuActive && val.length) this.activateMenu();
    },
    searchInput: function searchInput(val) {
      this.lazySearch = val;
    },
    internalSearch: 'onInternalSearchChanged',
    itemText: 'updateSelf'
  },
  created: function created() {
    this.setSearch();
  },
  destroyed: function destroyed() {
    document.removeEventListener('copy', this.onCopy);
  },
  methods: {
    onFilteredItemsChanged: function onFilteredItemsChanged(val, oldVal) {
      var _this5 = this;

      // TODO: How is the watcher triggered
      // for duplicate items? no idea
      if (val === oldVal) return;
      this.setMenuIndex(-1);
      this.$nextTick(function () {
        if (!_this5.internalSearch || val.length !== 1 && !_this5.autoSelectFirst) return;

        _this5.$refs.menu.getTiles();

        _this5.setMenuIndex(0);
      });
    },
    onInternalSearchChanged: function onInternalSearchChanged() {
      this.updateMenuDimensions();
    },
    updateMenuDimensions: function updateMenuDimensions() {
      // Type from menuable is not making it through
      this.isMenuActive && this.$refs.menu && this.$refs.menu.updateDimensions();
    },
    changeSelectedIndex: function changeSelectedIndex(keyCode) {
      // Do not allow changing of selectedIndex
      // when search is dirty
      if (this.searchIsDirty) return;

      if (this.multiple && keyCode === _helpers.keyCodes.left) {
        if (this.selectedIndex === -1) {
          this.selectedIndex = this.selectedItems.length - 1;
        } else {
          this.selectedIndex--;
        }
      } else if (this.multiple && keyCode === _helpers.keyCodes.right) {
        if (this.selectedIndex >= this.selectedItems.length - 1) {
          this.selectedIndex = -1;
        } else {
          this.selectedIndex++;
        }
      } else if (keyCode === _helpers.keyCodes.backspace || keyCode === _helpers.keyCodes.delete) {
        this.deleteCurrentItem();
      }
    },
    deleteCurrentItem: function deleteCurrentItem() {
      var curIndex = this.selectedIndex;
      var curItem = this.selectedItems[curIndex]; // Do nothing if input or item is disabled

      if (!this.isInteractive || this.getDisabled(curItem)) return;
      var lastIndex = this.selectedItems.length - 1; // Select the last item if
      // there is no selection

      if (this.selectedIndex === -1 && lastIndex !== 0) {
        this.selectedIndex = lastIndex;
        return;
      }

      var length = this.selectedItems.length;
      var nextIndex = curIndex !== length - 1 ? curIndex : curIndex - 1;
      var nextItem = this.selectedItems[nextIndex];

      if (!nextItem) {
        this.setValue(this.multiple ? [] : null);
      } else {
        this.selectItem(curItem);
      }

      this.selectedIndex = nextIndex;
    },
    clearableCallback: function clearableCallback() {
      this.internalSearch = null;

      _VSelect.default.options.methods.clearableCallback.call(this);
    },
    genInput: function genInput() {
      var input = _VTextField.default.options.methods.genInput.call(this);

      input.data = (0, _mergeData.default)(input.data, {
        attrs: {
          'aria-activedescendant': (0, _helpers.getObjectValueByPath)(this.$refs.menu, 'activeTile.id'),
          autocomplete: (0, _helpers.getObjectValueByPath)(input.data, 'attrs.autocomplete', 'off')
        },
        domProps: {
          value: this.internalSearch
        }
      });
      return input;
    },
    genInputSlot: function genInputSlot() {
      var slot = _VSelect.default.options.methods.genInputSlot.call(this);

      slot.data.attrs.role = 'combobox';
      return slot;
    },
    genSelections: function genSelections() {
      return this.hasSlot || this.multiple ? _VSelect.default.options.methods.genSelections.call(this) : [];
    },
    onClick: function onClick(e) {
      if (!this.isInteractive) return;
      this.selectedIndex > -1 ? this.selectedIndex = -1 : this.onFocus();
      if (!this.isAppendInner(e.target)) this.activateMenu();
    },
    onInput: function onInput(e) {
      if (this.selectedIndex > -1 || !e.target) return;
      var target = e.target;
      var value = target.value; // If typing and menu is not currently active

      if (target.value) this.activateMenu();
      this.internalSearch = value;
      this.badInput = target.validity && target.validity.badInput;
    },
    onKeyDown: function onKeyDown(e) {
      var keyCode = e.keyCode;

      _VSelect.default.options.methods.onKeyDown.call(this, e); // The ordering is important here
      // allows new value to be updated
      // and then moves the index to the
      // proper location


      this.changeSelectedIndex(keyCode);
    },
    onSpaceDown: function onSpaceDown(e) {},
    onTabDown: function onTabDown(e) {
      _VSelect.default.options.methods.onTabDown.call(this, e);

      this.updateSelf();
    },
    onUpDown: function onUpDown(e) {
      // Prevent screen from scrolling
      e.preventDefault(); // For autocomplete / combobox, cycling
      // interfers with native up/down behavior
      // instead activate the menu

      this.activateMenu();
    },
    selectItem: function selectItem(item) {
      _VSelect.default.options.methods.selectItem.call(this, item);

      this.setSearch();
    },
    setSelectedItems: function setSelectedItems() {
      _VSelect.default.options.methods.setSelectedItems.call(this); // #4273 Don't replace if searching
      // #4403 Don't replace if focused


      if (!this.isFocused) this.setSearch();
    },
    setSearch: function setSearch() {
      var _this6 = this;

      // Wait for nextTick so selectedItem
      // has had time to update
      this.$nextTick(function () {
        if (!_this6.multiple || !_this6.internalSearch || !_this6.isMenuActive) {
          _this6.internalSearch = !_this6.selectedItems.length || _this6.multiple || _this6.hasSlot ? null : _this6.getText(_this6.selectedItem);
        }
      });
    },
    updateSelf: function updateSelf() {
      if (!this.searchIsDirty && !this.internalValue) return;

      if (!this.valueComparator(this.internalSearch, this.getValue(this.internalValue))) {
        this.setSearch();
      }
    },
    hasItem: function hasItem(item) {
      return this.selectedValues.indexOf(this.getValue(item)) > -1;
    },
    onCopy: function onCopy(event) {
      var _event$clipboardData, _event$clipboardData2;

      if (this.selectedIndex === -1) return;
      var currentItem = this.selectedItems[this.selectedIndex];
      var currentItemText = this.getText(currentItem);
      (_event$clipboardData = event.clipboardData) == null ? void 0 : _event$clipboardData.setData('text/plain', currentItemText);
      (_event$clipboardData2 = event.clipboardData) == null ? void 0 : _event$clipboardData2.setData('text/vnd.vuetify.autocomplete.item+plain', currentItemText);
      event.preventDefault();
    }
  }
});

exports.default = _default2;
//# sourceMappingURL=VAutocomplete.js.map
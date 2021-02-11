"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("../../../src/components/VTreeview/VTreeview.sass");

var _VTreeviewNode = _interopRequireWildcard(require("./VTreeviewNode"));

var _themeable = _interopRequireDefault(require("../../mixins/themeable"));

var _registrable = require("../../mixins/registrable");

var _helpers = require("../../util/helpers");

var _mixins = _interopRequireDefault(require("../../util/mixins"));

var _console = require("../../util/console");

var _filterTreeItems = require("./util/filterTreeItems");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _default2 = (0, _mixins.default)((0, _registrable.provide)('treeview'), _themeable.default
/* @vue/component */
).extend({
  name: 'v-treeview',
  provide: function provide() {
    return {
      treeview: this
    };
  },
  props: _objectSpread({
    active: {
      type: Array,
      default: function _default() {
        return [];
      }
    },
    dense: Boolean,
    filter: Function,
    hoverable: Boolean,
    items: {
      type: Array,
      default: function _default() {
        return [];
      }
    },
    multipleActive: Boolean,
    open: {
      type: Array,
      default: function _default() {
        return [];
      }
    },
    openAll: Boolean,
    returnObject: {
      type: Boolean,
      default: false
    },
    search: String,
    value: {
      type: Array,
      default: function _default() {
        return [];
      }
    }
  }, _VTreeviewNode.VTreeviewNodeProps),
  data: function data() {
    return {
      level: -1,
      activeCache: new Set(),
      nodes: {},
      openCache: new Set(),
      selectedCache: new Set()
    };
  },
  computed: {
    excludedItems: function excludedItems() {
      var excluded = new Set();
      if (!this.search) return excluded;

      for (var i = 0; i < this.items.length; i++) {
        (0, _filterTreeItems.filterTreeItems)(this.filter || _filterTreeItems.filterTreeItem, this.items[i], this.search, this.itemKey, this.itemText, this.itemChildren, excluded);
      }

      return excluded;
    }
  },
  watch: {
    items: {
      handler: function handler() {
        var _this = this;

        var oldKeys = Object.keys(this.nodes).map(function (k) {
          return (0, _helpers.getObjectValueByPath)(_this.nodes[k].item, _this.itemKey);
        });
        var newKeys = this.getKeys(this.items);
        var diff = (0, _helpers.arrayDiff)(newKeys, oldKeys); // We only want to do stuff if items have changed

        if (!diff.length && newKeys.length < oldKeys.length) return; // If nodes are removed we need to clear them from this.nodes

        diff.forEach(function (k) {
          return delete _this.nodes[k];
        });

        var oldSelectedCache = _toConsumableArray(this.selectedCache);

        this.selectedCache = new Set();
        this.activeCache = new Set();
        this.openCache = new Set();
        this.buildTree(this.items); // Only emit selected if selection has changed
        // as a result of items changing. This fixes a
        // potential double emit when selecting a node
        // with dynamic children

        if (!(0, _helpers.deepEqual)(oldSelectedCache, _toConsumableArray(this.selectedCache))) this.emitSelected();
      },
      deep: true
    },
    active: function active(value) {
      this.handleNodeCacheWatcher(value, this.activeCache, this.updateActive, this.emitActive);
    },
    value: function value(_value) {
      this.handleNodeCacheWatcher(_value, this.selectedCache, this.updateSelected, this.emitSelected);
    },
    open: function open(value) {
      this.handleNodeCacheWatcher(value, this.openCache, this.updateOpen, this.emitOpen);
    }
  },
  created: function created() {
    var _this2 = this;

    var getValue = function getValue(key) {
      return _this2.returnObject ? (0, _helpers.getObjectValueByPath)(key, _this2.itemKey) : key;
    };

    this.buildTree(this.items);
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = this.value.map(getValue)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var value = _step.value;
        this.updateSelected(value, true, true);
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator.return != null) {
          _iterator.return();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }

    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
      for (var _iterator2 = this.active.map(getValue)[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
        var active = _step2.value;
        this.updateActive(active, true);
      }
    } catch (err) {
      _didIteratorError2 = true;
      _iteratorError2 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion2 && _iterator2.return != null) {
          _iterator2.return();
        }
      } finally {
        if (_didIteratorError2) {
          throw _iteratorError2;
        }
      }
    }
  },
  mounted: function mounted() {
    var _this3 = this;

    // Save the developer from themselves
    if (this.$slots.prepend || this.$slots.append) {
      (0, _console.consoleWarn)('The prepend and append slots require a slot-scope attribute', this);
    }

    if (this.openAll) {
      this.updateAll(true);
    } else {
      this.open.forEach(function (key) {
        return _this3.updateOpen(_this3.returnObject ? (0, _helpers.getObjectValueByPath)(key, _this3.itemKey) : key, true);
      });
      this.emitOpen();
    }
  },
  methods: {
    /** @public */
    updateAll: function updateAll(value) {
      var _this4 = this;

      Object.keys(this.nodes).forEach(function (key) {
        return _this4.updateOpen((0, _helpers.getObjectValueByPath)(_this4.nodes[key].item, _this4.itemKey), value);
      });
      this.emitOpen();
    },
    getKeys: function getKeys(items) {
      var keys = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];

      for (var i = 0; i < items.length; i++) {
        var key = (0, _helpers.getObjectValueByPath)(items[i], this.itemKey);
        keys.push(key);
        var children = (0, _helpers.getObjectValueByPath)(items[i], this.itemChildren);

        if (children) {
          keys.push.apply(keys, _toConsumableArray(this.getKeys(children)));
        }
      }

      return keys;
    },
    buildTree: function buildTree(items) {
      var _this5 = this;

      var parent = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

      for (var i = 0; i < items.length; i++) {
        var item = items[i];
        var key = (0, _helpers.getObjectValueByPath)(item, this.itemKey);
        var children = (0, _helpers.getObjectValueByPath)(item, this.itemChildren, []);
        var oldNode = this.nodes.hasOwnProperty(key) ? this.nodes[key] : {
          isSelected: false,
          isIndeterminate: false,
          isActive: false,
          isOpen: false,
          vnode: null
        };
        var node = {
          vnode: oldNode.vnode,
          parent: parent,
          children: children.map(function (c) {
            return (0, _helpers.getObjectValueByPath)(c, _this5.itemKey);
          }),
          item: item
        };
        this.buildTree(children, key); // This fixed bug with dynamic children resetting selected parent state

        if (!this.nodes.hasOwnProperty(key) && parent !== null && this.nodes.hasOwnProperty(parent)) {
          node.isSelected = this.nodes[parent].isSelected;
        } else {
          node.isSelected = oldNode.isSelected;
          node.isIndeterminate = oldNode.isIndeterminate;
        }

        node.isActive = oldNode.isActive;
        node.isOpen = oldNode.isOpen;
        this.nodes[key] = node;

        if (children.length) {
          var _this$calculateState = this.calculateState(key, this.nodes),
              isSelected = _this$calculateState.isSelected,
              isIndeterminate = _this$calculateState.isIndeterminate;

          node.isSelected = isSelected;
          node.isIndeterminate = isIndeterminate;
        } // Don't forget to rebuild cache


        if (this.nodes[key].isSelected && (this.selectionType === 'independent' || node.children.length === 0)) this.selectedCache.add(key);
        if (this.nodes[key].isActive) this.activeCache.add(key);
        if (this.nodes[key].isOpen) this.openCache.add(key);
        this.updateVnodeState(key);
      }
    },
    calculateState: function calculateState(node, state) {
      var children = state[node].children;
      var counts = children.reduce(function (counts, child) {
        counts[0] += +Boolean(state[child].isSelected);
        counts[1] += +Boolean(state[child].isIndeterminate);
        return counts;
      }, [0, 0]);
      var isSelected = !!children.length && counts[0] === children.length;
      var isIndeterminate = !isSelected && (counts[0] > 0 || counts[1] > 0);
      return {
        isSelected: isSelected,
        isIndeterminate: isIndeterminate
      };
    },
    emitOpen: function emitOpen() {
      this.emitNodeCache('update:open', this.openCache);
    },
    emitSelected: function emitSelected() {
      this.emitNodeCache('input', this.selectedCache);
    },
    emitActive: function emitActive() {
      this.emitNodeCache('update:active', this.activeCache);
    },
    emitNodeCache: function emitNodeCache(event, cache) {
      var _this6 = this;

      this.$emit(event, this.returnObject ? _toConsumableArray(cache).map(function (key) {
        return _this6.nodes[key].item;
      }) : _toConsumableArray(cache));
    },
    handleNodeCacheWatcher: function handleNodeCacheWatcher(value, cache, updateFn, emitFn) {
      var _this7 = this;

      value = this.returnObject ? value.map(function (v) {
        return (0, _helpers.getObjectValueByPath)(v, _this7.itemKey);
      }) : value;

      var old = _toConsumableArray(cache);

      if ((0, _helpers.deepEqual)(old, value)) return;
      old.forEach(function (key) {
        return updateFn(key, false);
      });
      value.forEach(function (key) {
        return updateFn(key, true);
      });
      emitFn();
    },
    getDescendants: function getDescendants(key) {
      var _descendants;

      var descendants = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
      var children = this.nodes[key].children;

      (_descendants = descendants).push.apply(_descendants, _toConsumableArray(children));

      for (var i = 0; i < children.length; i++) {
        descendants = this.getDescendants(children[i], descendants);
      }

      return descendants;
    },
    getParents: function getParents(key) {
      var parent = this.nodes[key].parent;
      var parents = [];

      while (parent !== null) {
        parents.push(parent);
        parent = this.nodes[parent].parent;
      }

      return parents;
    },
    register: function register(node) {
      var key = (0, _helpers.getObjectValueByPath)(node.item, this.itemKey);
      this.nodes[key].vnode = node;
      this.updateVnodeState(key);
    },
    unregister: function unregister(node) {
      var key = (0, _helpers.getObjectValueByPath)(node.item, this.itemKey);
      if (this.nodes[key]) this.nodes[key].vnode = null;
    },
    isParent: function isParent(key) {
      return this.nodes[key].children && this.nodes[key].children.length;
    },
    updateActive: function updateActive(key, isActive) {
      var _this8 = this;

      if (!this.nodes.hasOwnProperty(key)) return;

      if (!this.multipleActive) {
        this.activeCache.forEach(function (active) {
          _this8.nodes[active].isActive = false;

          _this8.updateVnodeState(active);

          _this8.activeCache.delete(active);
        });
      }

      var node = this.nodes[key];
      if (!node) return;
      if (isActive) this.activeCache.add(key);else this.activeCache.delete(key);
      node.isActive = isActive;
      this.updateVnodeState(key);
    },
    updateSelected: function updateSelected(key, isSelected) {
      var isForced = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
      if (!this.nodes.hasOwnProperty(key)) return;
      var changed = new Map();

      if (this.selectionType !== 'independent') {
        var _iteratorNormalCompletion3 = true;
        var _didIteratorError3 = false;
        var _iteratorError3 = undefined;

        try {
          for (var _iterator3 = this.getDescendants(key)[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
            var descendant = _step3.value;

            if (!(0, _helpers.getObjectValueByPath)(this.nodes[descendant].item, this.itemDisabled) || isForced) {
              this.nodes[descendant].isSelected = isSelected;
              this.nodes[descendant].isIndeterminate = false;
              changed.set(descendant, isSelected);
            }
          }
        } catch (err) {
          _didIteratorError3 = true;
          _iteratorError3 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion3 && _iterator3.return != null) {
              _iterator3.return();
            }
          } finally {
            if (_didIteratorError3) {
              throw _iteratorError3;
            }
          }
        }

        var calculated = this.calculateState(key, this.nodes);
        this.nodes[key].isSelected = isSelected;
        this.nodes[key].isIndeterminate = calculated.isIndeterminate;
        changed.set(key, isSelected);
        var _iteratorNormalCompletion4 = true;
        var _didIteratorError4 = false;
        var _iteratorError4 = undefined;

        try {
          for (var _iterator4 = this.getParents(key)[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
            var parent = _step4.value;

            var _calculated = this.calculateState(parent, this.nodes);

            this.nodes[parent].isSelected = _calculated.isSelected;
            this.nodes[parent].isIndeterminate = _calculated.isIndeterminate;
            changed.set(parent, _calculated.isSelected);
          }
        } catch (err) {
          _didIteratorError4 = true;
          _iteratorError4 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion4 && _iterator4.return != null) {
              _iterator4.return();
            }
          } finally {
            if (_didIteratorError4) {
              throw _iteratorError4;
            }
          }
        }
      } else {
        this.nodes[key].isSelected = isSelected;
        this.nodes[key].isIndeterminate = false;
        changed.set(key, isSelected);
      }

      var _iteratorNormalCompletion5 = true;
      var _didIteratorError5 = false;
      var _iteratorError5 = undefined;

      try {
        for (var _iterator5 = changed.entries()[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
          var _step5$value = _slicedToArray(_step5.value, 2),
              _key = _step5$value[0],
              value = _step5$value[1];

          this.updateVnodeState(_key);
          if (this.selectionType === 'leaf' && this.isParent(_key)) continue;
          value === true ? this.selectedCache.add(_key) : this.selectedCache.delete(_key);
        }
      } catch (err) {
        _didIteratorError5 = true;
        _iteratorError5 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion5 && _iterator5.return != null) {
            _iterator5.return();
          }
        } finally {
          if (_didIteratorError5) {
            throw _iteratorError5;
          }
        }
      }
    },
    updateOpen: function updateOpen(key, isOpen) {
      var _this9 = this;

      if (!this.nodes.hasOwnProperty(key)) return;
      var node = this.nodes[key];
      var children = (0, _helpers.getObjectValueByPath)(node.item, this.itemChildren);

      if (children && !children.length && node.vnode && !node.vnode.hasLoaded) {
        node.vnode.checkChildren().then(function () {
          return _this9.updateOpen(key, isOpen);
        });
      } else if (children && children.length) {
        node.isOpen = isOpen;
        node.isOpen ? this.openCache.add(key) : this.openCache.delete(key);
        this.updateVnodeState(key);
      }
    },
    updateVnodeState: function updateVnodeState(key) {
      var node = this.nodes[key];

      if (node && node.vnode) {
        node.vnode.isSelected = node.isSelected;
        node.vnode.isIndeterminate = node.isIndeterminate;
        node.vnode.isActive = node.isActive;
        node.vnode.isOpen = node.isOpen;
      }
    },
    isExcluded: function isExcluded(key) {
      return !!this.search && this.excludedItems.has(key);
    }
  },
  render: function render(h) {
    var _this10 = this;

    var children = this.items.length ? this.items.filter(function (item) {
      return !_this10.isExcluded((0, _helpers.getObjectValueByPath)(item, _this10.itemKey));
    }).map(function (item) {
      var genChild = _VTreeviewNode.default.options.methods.genChild.bind(_this10);

      return genChild(item, (0, _helpers.getObjectValueByPath)(item, _this10.itemDisabled));
    })
    /* istanbul ignore next */
    : this.$slots.default; // TODO: remove type annotation with TS 3.2

    return h('div', {
      staticClass: 'v-treeview',
      class: _objectSpread({
        'v-treeview--hoverable': this.hoverable,
        'v-treeview--dense': this.dense
      }, this.themeClasses)
    }, children);
  }
});

exports.default = _default2;
//# sourceMappingURL=VTreeview.js.map
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("../../../src/components/VSkeletonLoader/VSkeletonLoader.sass");

var _elevatable = _interopRequireDefault(require("../../mixins/elevatable"));

var _measurable = _interopRequireDefault(require("../../mixins/measurable"));

var _themeable = _interopRequireDefault(require("../../mixins/themeable"));

var _mixins = _interopRequireDefault(require("../../util/mixins"));

var _helpers = require("../../util/helpers");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/* @vue/component */
var _default2 = (0, _mixins.default)(_elevatable.default, _measurable.default, _themeable.default).extend({
  name: 'VSkeletonLoader',
  props: {
    boilerplate: Boolean,
    loading: Boolean,
    tile: Boolean,
    transition: String,
    type: String,
    types: {
      type: Object,
      default: function _default() {
        return {};
      }
    }
  },
  computed: {
    attrs: function attrs() {
      if (!this.isLoading) return this.$attrs;
      return !this.boilerplate ? _objectSpread({
        'aria-busy': true,
        'aria-live': 'polite',
        role: 'alert'
      }, this.$attrs) : {};
    },
    classes: function classes() {
      return _objectSpread({
        'v-skeleton-loader--boilerplate': this.boilerplate,
        'v-skeleton-loader--is-loading': this.isLoading,
        'v-skeleton-loader--tile': this.tile
      }, this.themeClasses, {}, this.elevationClasses);
    },
    isLoading: function isLoading() {
      return !('default' in this.$scopedSlots) || this.loading;
    },
    rootTypes: function rootTypes() {
      return _objectSpread({
        actions: 'button@2',
        article: 'heading, paragraph',
        avatar: 'avatar',
        button: 'button',
        card: 'image, card-heading',
        'card-avatar': 'image, list-item-avatar',
        'card-heading': 'heading',
        chip: 'chip',
        'date-picker': 'list-item, card-heading, divider, date-picker-options, date-picker-days, actions',
        'date-picker-options': 'text, avatar@2',
        'date-picker-days': 'avatar@28',
        heading: 'heading',
        image: 'image',
        'list-item': 'text',
        'list-item-avatar': 'avatar, text',
        'list-item-two-line': 'sentences',
        'list-item-avatar-two-line': 'avatar, sentences',
        'list-item-three-line': 'paragraph',
        'list-item-avatar-three-line': 'avatar, paragraph',
        paragraph: 'text@3',
        sentences: 'text@2',
        table: 'table-heading, table-thead, table-tbody, table-tfoot',
        'table-heading': 'heading, text',
        'table-thead': 'heading@6',
        'table-tbody': 'table-row-divider@6',
        'table-row-divider': 'table-row, divider',
        'table-row': 'table-cell@6',
        'table-cell': 'text',
        'table-tfoot': 'text@2, avatar@2',
        text: 'text'
      }, this.types);
    }
  },
  methods: {
    genBone: function genBone(text, children) {
      return this.$createElement('div', {
        staticClass: "v-skeleton-loader__".concat(text, " v-skeleton-loader__bone")
      }, children);
    },
    genBones: function genBones(bone) {
      var _this = this;

      // e.g. 'text@3'
      var _bone$split = bone.split('@'),
          _bone$split2 = _slicedToArray(_bone$split, 2),
          type = _bone$split2[0],
          length = _bone$split2[1];

      var generator = function generator() {
        return _this.genStructure(type);
      }; // Generate a length array based upon
      // value after @ in the bone string


      return Array.from({
        length: length
      }).map(generator);
    },
    // Fix type when this is merged
    // https://github.com/microsoft/TypeScript/pull/33050
    genStructure: function genStructure(type) {
      var children = [];
      type = type || this.type || '';
      var bone = this.rootTypes[type] || ''; // End of recursion, do nothing

      /* eslint-disable-next-line no-empty, brace-style */

      if (type === bone) {} // Array of values - e.g. 'heading, paragraph, text@2'
      else if (type.indexOf(',') > -1) return this.mapBones(type); // Array of values - e.g. 'paragraph@4'
        else if (type.indexOf('@') > -1) return this.genBones(type); // Array of values - e.g. 'card@2'
          else if (bone.indexOf(',') > -1) children = this.mapBones(bone); // Array of values - e.g. 'list-item@2'
            else if (bone.indexOf('@') > -1) children = this.genBones(bone); // Single value - e.g. 'card-heading'
              else if (bone) children.push(this.genStructure(bone));

      return [this.genBone(type, children)];
    },
    genSkeleton: function genSkeleton() {
      var children = [];
      if (!this.isLoading) children.push((0, _helpers.getSlot)(this));else children.push(this.genStructure());
      /* istanbul ignore else */

      if (!this.transition) return children;
      /* istanbul ignore next */

      return this.$createElement('transition', {
        props: {
          name: this.transition
        },
        // Only show transition when
        // content has been loaded
        on: {
          afterEnter: this.resetStyles,
          beforeEnter: this.onBeforeEnter,
          beforeLeave: this.onBeforeLeave,
          leaveCancelled: this.resetStyles
        }
      }, children);
    },
    mapBones: function mapBones(bones) {
      // Remove spaces and return array of structures
      return bones.replace(/\s/g, '').split(',').map(this.genStructure);
    },
    onBeforeEnter: function onBeforeEnter(el) {
      this.resetStyles(el);
      if (!this.isLoading) return;
      el._initialStyle = {
        display: el.style.display,
        transition: el.style.transition
      };
      el.style.setProperty('transition', 'none', 'important');
    },
    onBeforeLeave: function onBeforeLeave(el) {
      el.style.setProperty('display', 'none', 'important');
    },
    resetStyles: function resetStyles(el) {
      if (!el._initialStyle) return;
      el.style.display = el._initialStyle.display || '';
      el.style.transition = el._initialStyle.transition;
      delete el._initialStyle;
    }
  },
  render: function render(h) {
    return h('div', {
      staticClass: 'v-skeleton-loader',
      attrs: this.attrs,
      on: this.$listeners,
      class: this.classes,
      style: this.isLoading ? this.measurableStyles : undefined
    }, [this.genSkeleton()]);
  }
});

exports.default = _default2;
//# sourceMappingURL=VSkeletonLoader.js.map
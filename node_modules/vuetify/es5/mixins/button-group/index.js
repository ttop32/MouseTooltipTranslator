"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _VItemGroup = require("../../components/VItemGroup/VItemGroup");

// Extensions

/* @vue/component */
var _default = _VItemGroup.BaseItemGroup.extend({
  name: 'button-group',
  provide: function provide() {
    return {
      btnToggle: this
    };
  },
  computed: {
    classes: function classes() {
      return _VItemGroup.BaseItemGroup.options.computed.classes.call(this);
    }
  },
  methods: {
    // Isn't being passed down through types
    genData: _VItemGroup.BaseItemGroup.options.methods.genData
  }
});

exports.default = _default;
//# sourceMappingURL=index.js.map
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createItemTypeNativeListeners = createItemTypeNativeListeners;
exports.createItemTypeListeners = createItemTypeListeners;

function createItemTypeNativeListeners(instance, itemTypeSuffix, value) {
  return Object.keys(instance.$listeners).reduce(function (on, eventName) {
    if (eventName.endsWith(itemTypeSuffix)) {
      on[eventName.slice(0, -itemTypeSuffix.length)] = function (event) {
        return instance.$emit(eventName, value, event);
      };
    }

    return on;
  }, {});
}

function createItemTypeListeners(instance, itemTypeSuffix) {
  return Object.keys(instance.$listeners).reduce(function (on, eventName) {
    if (eventName.endsWith(itemTypeSuffix)) {
      on[eventName] = instance.$listeners[eventName];
    }

    return on;
  }, {});
}
//# sourceMappingURL=eventHelpers.js.map
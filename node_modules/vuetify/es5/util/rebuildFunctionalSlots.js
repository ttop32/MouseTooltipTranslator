"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = rebuildFunctionalSlots;

function rebuildFunctionalSlots(slots, h) {
  var children = [];

  for (var slot in slots) {
    if (slots.hasOwnProperty(slot)) {
      children.push(h('template', {
        slot: slot
      }, slots[slot]));
    }
  }

  return children;
}
//# sourceMappingURL=rebuildFunctionalSlots.js.map
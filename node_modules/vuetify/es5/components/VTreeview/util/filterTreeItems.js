"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.filterTreeItem = filterTreeItem;
exports.filterTreeItems = filterTreeItems;

var _helpers = require("../../../util/helpers");

function filterTreeItem(item, search, textKey) {
  var text = (0, _helpers.getObjectValueByPath)(item, textKey);
  return text.toLocaleLowerCase().indexOf(search.toLocaleLowerCase()) > -1;
}

function filterTreeItems(filter, item, search, idKey, textKey, childrenKey, excluded) {
  if (filter(item, search, textKey)) {
    return true;
  }

  var children = (0, _helpers.getObjectValueByPath)(item, childrenKey);

  if (children) {
    var match = false;

    for (var i = 0; i < children.length; i++) {
      if (filterTreeItems(filter, children[i], search, idKey, textKey, childrenKey, excluded)) {
        match = true;
      }
    }

    if (match) return true;
  }

  excluded.add((0, _helpers.getObjectValueByPath)(item, idKey));
  return false;
}
//# sourceMappingURL=filterTreeItems.js.map
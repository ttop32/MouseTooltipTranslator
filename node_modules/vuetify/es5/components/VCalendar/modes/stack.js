"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.stack = void 0;

var _common = require("./common");

var _timestamp = require("../util/timestamp");

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

var FULL_WIDTH = 100;
var DEFAULT_OFFSET = 5;
var WIDTH_MULTIPLIER = 1.7;
/**
 * Variation of column mode where events can be stacked. The priority of this
 * mode is to stack events together taking up the least amount of space while
 * trying to ensure the content of the event is always visible as well as its
 * start and end. A sibling column has intersecting event content and must be
 * placed beside each other. Non-sibling columns are offset by 5% from the
 * previous column. The width is scaled by 1.7 so the events overlap and
 * whitespace is reduced. If there is a hole in columns the event width is
 * scaled up so it intersects with the next column. The columns have equal
 * width in the space they are given. If the event doesn't have any to the
 * right of it that intersect with it's content it's right side is extended
 * to the right side.
 */

var stack = function stack(events, firstWeekday, overlapThreshold) {
  var handler = (0, _common.getOverlapGroupHandler)(firstWeekday); // eslint-disable-next-line max-statements

  return function (day, dayEvents, timed, reset) {
    if (!timed) {
      return handler.getVisuals(day, dayEvents, timed, reset);
    }

    var dayStart = (0, _timestamp.getTimestampIdentifier)(day);
    var visuals = (0, _common.getVisuals)(dayEvents, dayStart);
    var groups = getGroups(visuals, dayStart);
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = groups[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var group = _step.value;
        var nodes = [];
        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
          for (var _iterator2 = group.visuals[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var visual = _step2.value;
            var child = getNode(visual, dayStart);
            var index = getNextIndex(child, nodes);

            if (index === false) {
              var parent = getParent(child, nodes);

              if (parent) {
                child.parent = parent;
                child.sibling = (0, _common.hasOverlap)(child.start, child.end, parent.start, addTime(parent.start, overlapThreshold));
                child.index = parent.index + 1;
                parent.children.push(child);
              }
            } else {
              var _getOverlappingRange = getOverlappingRange(child, nodes, index - 1, index - 1),
                  _getOverlappingRange2 = _slicedToArray(_getOverlappingRange, 1),
                  _parent = _getOverlappingRange2[0];

              var children = getOverlappingRange(child, nodes, index + 1, index + nodes.length, true);
              child.children = children;
              child.index = index;

              if (_parent) {
                child.parent = _parent;
                child.sibling = (0, _common.hasOverlap)(child.start, child.end, _parent.start, addTime(_parent.start, overlapThreshold));

                _parent.children.push(child);
              }

              var _iteratorNormalCompletion3 = true;
              var _didIteratorError3 = false;
              var _iteratorError3 = undefined;

              try {
                for (var _iterator3 = children[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                  var grand = _step3.value;

                  if (grand.parent === _parent) {
                    grand.parent = child;
                  }

                  var grandNext = grand.index - child.index <= 1;

                  if (grandNext && child.sibling && (0, _common.hasOverlap)(child.start, addTime(child.start, overlapThreshold), grand.start, grand.end)) {
                    grand.sibling = true;
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
            }

            nodes.push(child);
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

        calculateBounds(nodes, overlapThreshold);
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

    visuals.sort(function (a, b) {
      return a.left - b.left || a.event.startTimestampIdentifier - b.event.startTimestampIdentifier;
    });
    return visuals;
  };
};

exports.stack = stack;

function calculateBounds(nodes, overlapThreshold) {
  var _iteratorNormalCompletion4 = true;
  var _didIteratorError4 = false;
  var _iteratorError4 = undefined;

  try {
    for (var _iterator4 = nodes[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
      var node = _step4.value;
      var visual = node.visual,
          parent = node.parent;
      var columns = getMaxChildIndex(node) + 1;
      var spaceLeft = parent ? parent.visual.left : 0;
      var spaceWidth = FULL_WIDTH - spaceLeft;
      var offset = Math.min(DEFAULT_OFFSET, FULL_WIDTH / columns);
      var columnWidthMultiplier = getColumnWidthMultiplier(node, nodes);
      var columnOffset = spaceWidth / (columns - node.index + 1);
      var columnWidth = spaceWidth / (columns - node.index + (node.sibling ? 1 : 0)) * columnWidthMultiplier;

      if (parent) {
        visual.left = node.sibling ? spaceLeft + columnOffset : spaceLeft + offset;
      }

      visual.width = hasFullWidth(node, nodes, overlapThreshold) ? FULL_WIDTH - visual.left : Math.min(FULL_WIDTH - visual.left, columnWidth * WIDTH_MULTIPLIER);
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
}

function getColumnWidthMultiplier(node, nodes) {
  if (!node.children.length) {
    return 1;
  }

  var maxColumn = node.index + nodes.length;
  var minColumn = node.children.reduce(function (min, c) {
    return Math.min(min, c.index);
  }, maxColumn);
  return minColumn - node.index;
}

function getOverlappingIndices(node, nodes) {
  var indices = [];
  var _iteratorNormalCompletion5 = true;
  var _didIteratorError5 = false;
  var _iteratorError5 = undefined;

  try {
    for (var _iterator5 = nodes[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
      var other = _step5.value;

      if ((0, _common.hasOverlap)(node.start, node.end, other.start, other.end)) {
        indices.push(other.index);
      }
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

  return indices;
}

function getNextIndex(node, nodes) {
  var indices = getOverlappingIndices(node, nodes);
  indices.sort();

  for (var i = 0; i < indices.length; i++) {
    if (i < indices[i]) {
      return i;
    }
  }

  return false;
}

function getOverlappingRange(node, nodes, indexMin, indexMax) {
  var returnFirstColumn = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : false;
  var overlapping = [];
  var _iteratorNormalCompletion6 = true;
  var _didIteratorError6 = false;
  var _iteratorError6 = undefined;

  try {
    for (var _iterator6 = nodes[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
      var other = _step6.value;

      if (other.index >= indexMin && other.index <= indexMax && (0, _common.hasOverlap)(node.start, node.end, other.start, other.end)) {
        overlapping.push(other);
      }
    }
  } catch (err) {
    _didIteratorError6 = true;
    _iteratorError6 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion6 && _iterator6.return != null) {
        _iterator6.return();
      }
    } finally {
      if (_didIteratorError6) {
        throw _iteratorError6;
      }
    }
  }

  if (returnFirstColumn && overlapping.length > 0) {
    var first = overlapping.reduce(function (min, n) {
      return Math.min(min, n.index);
    }, overlapping[0].index);
    return overlapping.filter(function (n) {
      return n.index === first;
    });
  }

  return overlapping;
}

function getParent(node, nodes) {
  var parent = null;
  var _iteratorNormalCompletion7 = true;
  var _didIteratorError7 = false;
  var _iteratorError7 = undefined;

  try {
    for (var _iterator7 = nodes[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
      var other = _step7.value;

      if ((0, _common.hasOverlap)(node.start, node.end, other.start, other.end) && (parent === null || other.index > parent.index)) {
        parent = other;
      }
    }
  } catch (err) {
    _didIteratorError7 = true;
    _iteratorError7 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion7 && _iterator7.return != null) {
        _iterator7.return();
      }
    } finally {
      if (_didIteratorError7) {
        throw _iteratorError7;
      }
    }
  }

  return parent;
}

function hasFullWidth(node, nodes, overlapThreshold) {
  var _iteratorNormalCompletion8 = true;
  var _didIteratorError8 = false;
  var _iteratorError8 = undefined;

  try {
    for (var _iterator8 = nodes[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
      var other = _step8.value;

      if (other !== node && other.index > node.index && (0, _common.hasOverlap)(node.start, addTime(node.start, overlapThreshold), other.start, other.end)) {
        return false;
      }
    }
  } catch (err) {
    _didIteratorError8 = true;
    _iteratorError8 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion8 && _iterator8.return != null) {
        _iterator8.return();
      }
    } finally {
      if (_didIteratorError8) {
        throw _iteratorError8;
      }
    }
  }

  return true;
}

function getGroups(visuals, dayStart) {
  var groups = [];
  var _iteratorNormalCompletion9 = true;
  var _didIteratorError9 = false;
  var _iteratorError9 = undefined;

  try {
    for (var _iterator9 = visuals[Symbol.iterator](), _step9; !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
      var visual = _step9.value;

      var _getNormalizedRange = (0, _common.getNormalizedRange)(visual.event, dayStart),
          _getNormalizedRange2 = _slicedToArray(_getNormalizedRange, 2),
          start = _getNormalizedRange2[0],
          end = _getNormalizedRange2[1];

      var added = false;

      for (var _i2 = 0, _groups = groups; _i2 < _groups.length; _i2++) {
        var group = _groups[_i2];

        if ((0, _common.hasOverlap)(start, end, group.start, group.end)) {
          group.visuals.push(visual);
          group.end = Math.max(group.end, end);
          added = true;
          break;
        }
      }

      if (!added) {
        groups.push({
          start: start,
          end: end,
          visuals: [visual]
        });
      }
    }
  } catch (err) {
    _didIteratorError9 = true;
    _iteratorError9 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion9 && _iterator9.return != null) {
        _iterator9.return();
      }
    } finally {
      if (_didIteratorError9) {
        throw _iteratorError9;
      }
    }
  }

  return groups;
}

function getNode(visual, dayStart) {
  var _getNormalizedRange3 = (0, _common.getNormalizedRange)(visual.event, dayStart),
      _getNormalizedRange4 = _slicedToArray(_getNormalizedRange3, 2),
      start = _getNormalizedRange4[0],
      end = _getNormalizedRange4[1];

  return {
    parent: null,
    sibling: true,
    index: 0,
    visual: visual,
    start: start,
    end: end,
    children: []
  };
}

function getMaxChildIndex(node) {
  var max = node.index;
  var _iteratorNormalCompletion10 = true;
  var _didIteratorError10 = false;
  var _iteratorError10 = undefined;

  try {
    for (var _iterator10 = node.children[Symbol.iterator](), _step10; !(_iteratorNormalCompletion10 = (_step10 = _iterator10.next()).done); _iteratorNormalCompletion10 = true) {
      var child = _step10.value;
      var childMax = getMaxChildIndex(child);

      if (childMax > max) {
        max = childMax;
      }
    }
  } catch (err) {
    _didIteratorError10 = true;
    _iteratorError10 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion10 && _iterator10.return != null) {
        _iterator10.return();
      }
    } finally {
      if (_didIteratorError10) {
        throw _iteratorError10;
      }
    }
  }

  return max;
}

function addTime(identifier, minutes) {
  var removeMinutes = identifier % 100;
  var totalMinutes = removeMinutes + minutes;
  var addHours = Math.floor(totalMinutes / 60);
  var addMinutes = totalMinutes % 60;
  return identifier - removeMinutes + addHours * 100 + addMinutes;
}
//# sourceMappingURL=stack.js.map
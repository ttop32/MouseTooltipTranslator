/**
 * Selection related functions
 */

import { throttle } from "throttle-debounce";
import * as util from "/src/util";

var clientX = 0;
var clientY = 0;
var mouseTarget;
var _win;
var _isIframe;

export function enableMouseoverTextEvent(_window = window, isIframe) {
  _win = _window;
  _isIframe = isIframe;
  _win.document.addEventListener("scroll", (e) => {
    triggerMouseoverText();
  });
  _win.document.addEventListener("mousemove", (e) => {
    setMouseStatus(e);
    triggerMouseoverText();
  });
}

export const triggerMouseoverText = throttle(700, (event) => {
  var range = getMouseoverRange(clientX, clientY);

  var evt = new CustomEvent("mouseoverText", {
    bubbles: true,
    cancelable: false,
  });
  evt.range = range;
  evt.isIframe = _isIframe;
  document.dispatchEvent(evt);
});

function setMouseStatus(e) {
  clientX = e.clientX;
  clientY = e.clientY;
  mouseTarget = e.target;
}

function getMouseoverRange(x, y) {
  var range =
    util.caretRangeFromPoint(x, y, _win.document) ||
    util.caretRangeFromPointOnShadowDom(x, y);

  return range;
}

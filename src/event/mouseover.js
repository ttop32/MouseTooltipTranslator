// get mouse over text using range
// 1. get mouse xy
// 2. get range from overlapped xy element
// 3. expand range for char -> string
// 4. range to text

import { throttle } from "throttle-debounce";
import * as util from "/src/util";

var clientX = 0;
var clientY = 0;
var _win;
var _isIframe = false;

export function enableMouseoverTextEvent(_window = window) {
  _win = _window;

  setInterval(() => {
    triggerMouseoverText(getMouseoverText(clientX, clientY));
  }, 700);

  window.addEventListener("mousemove", (e) => {
    //if is ebook viewer event, take ebook window
    if (e.ebookWindow) {
      _win = e.ebookWindow;
      _isIframe = true;
      clientX = e.iframeX;
      clientY = e.iframeY;
    }
    if (_isIframe == true) {
      return;
    }
    //else record mouse xy
    clientX = e.clientX;
    clientY = e.clientY;
  });
}

export const triggerMouseoverText = (mouseoverText) => {
  var evt = new CustomEvent("mouseoverText", {
    bubbles: true,
    cancelable: false,
  });
  evt.mouseoverText = mouseoverText;
  document.dispatchEvent(evt);
};

function getMouseoverText(x, y) {
  //get range
  var range =
    util.caretRangeFromPoint(x, y, _win.document) ||
    util.caretRangeFromPointOnShadowDom(x, y);

  //get text from range
  var mouseoverText = getTextFromRange(range);
  return mouseoverText;
}

function getTextFromRange(range) {
  var output = {};

  ["word", "sentence", "container"].forEach((detectType) => {
    output[detectType] = "";
    if (!range) {
      return;
    }
    try {
      var rangeClone = range.cloneRange();
      //expand range
      expandRange(rangeClone, detectType);

      //check mouse xy overlap the range element
      if (util.checkXYInElement(rangeClone, clientX, clientY)) {
        output[detectType] = rangeClone.toString();
        output[detectType + "_range"] = rangeClone;
      }
    } catch (error) {
      console.log(error);
    }
  });

  return output;
}

function expandRange(range, type) {
  try {
    if (type == "container") {
      range.setStartBefore(range.startContainer);
      range.setEndAfter(range.startContainer);
      range.setStart(range.startContainer, 0);
    } else {
      range.expand(type); // "word" or "sentence"
    }
  } catch (error) {
    console.log(error);
  }
}

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
var styleElement;

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
  var textElement;
  var range =
    util.caretRangeFromPoint(x, y, _win.document) ||
    util.caretRangeFromPointOnShadowDom(x, y);

  //get google doc select
  if (util.isGoogleDoc()) {
    var rect = getRect(x, y);
    var { textElement, range } = getCaretRange(rect, x, y);
  }
  //get text from range
  var mouseoverText = getTextFromRange(range);
  textElement?.remove();
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

//google doc hover =========================================================
// https://github.com/Amaimersion/google-docs-utils/issues/10

function getRect(x, y) {
  if (!styleElement) {
    styleElement = document.createElement("style");
    styleElement.id = "enable-pointer-events-on-rect";
    styleElement.textContent = [
      `.kix-canvas-tile-content{pointer-events:none!important;}`,
      `#kix-current-user-cursor-caret{pointer-events:none!important;}`,
      `.kix-canvas-tile-content svg>g>rect{pointer-events:all!important; stroke-width:7px !important;}`,
    ].join("\n");

    const parent = document.head || document.documentElement;
    if (parent !== null) {
      parent.appendChild(styleElement);
    }
  }

  styleElement.disabled = false;
  const rect = document.elementFromPoint(x, y);
  styleElement.disabled = true;

  return rect;
}

function getCaretRange(rect, x, y) {
  const text = rect?.getAttribute("aria-label");
  const textNode = document.createTextNode(text);
  const textElement = createTextOverlay(rect, text, textNode);

  if (!text || !textElement || !textNode) return {};

  let range = document.createRange();
  let start = 0;
  let end = textNode.nodeValue.length;
  while (end - start > 1) {
    const mid = Math.floor((start + end) / 2);
    range.setStart(textNode, mid);
    range.setEnd(textNode, end);
    const rects = range.getClientRects();
    if (isPointInAnyRect(x, y, rects)) {
      start = mid;
    } else {
      if (x > range.getClientRects()[0].right) {
        start = end;
      } else {
        end = mid;
      }
    }
  }

  return { textElement, range };
}

function createTextOverlay(rect, text, textNode) {
  if (!rect || rect.tagName !== "rect") return {};

  const textElement = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "text"
  );
  const transform = rect.getAttribute("transform") || "";
  const font = rect.getAttribute("data-font-css") || "";

  textElement.setAttribute("x", rect.getAttribute("x"));
  textElement.setAttribute("y", rect.getAttribute("y"));
  textElement.appendChild(textNode);
  textElement.style.setProperty("all", "initial", "important");
  textElement.style.setProperty("transform", transform, "important");
  textElement.style.setProperty("font", font, "important");
  textElement.style.setProperty("text-anchor", "start", "important");

  rect.parentNode.appendChild(textElement);

  const elementRect = rect.getBoundingClientRect();
  const textRect = textElement.getBoundingClientRect();
  const yOffset =
    (elementRect.top - textRect.top + (elementRect.bottom - textRect.bottom)) *
    0.5;
  textElement.style.setProperty(
    "transform",
    `translate(0px,${yOffset}px) ${transform}`,
    "important"
  );

  return textElement;
}

function isPointInAnyRect(x, y, rects) {
  for (const rect of rects) {
    if (
      x >= Math.floor(rect.left) &&
      x <= Math.floor(rect.right) &&
      y >= Math.floor(rect.top) &&
      y <= Math.floor(rect.bottom)
    ) {
      return true;
    }
  }
  return false;
}

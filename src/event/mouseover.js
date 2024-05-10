// get mouse over text using range
// 1. get mouse xy
// 2. get range from overlapped xy element
// 3. expand range for char -> string
// 4. range to text

import * as util from "/src/util";
import {debounce} from "lodash";

var clientX = 0;
var clientY = 0;
var _win;
var _isIframe = false;
var styleElement;
const PARENT_TAGS_TO_EXCLUDE = ["STYLE", "SCRIPT", "TITLE"];

export function enableMouseoverTextEvent(
  _window = window,
  textDetectTime = 0.1
) {
  _win = _window;
  textDetectTime = Number(textDetectTime) * 1000;
  const triggerMouseoverTextWithDelay = debounce(async() => {
    triggerMouseoverText(await getMouseoverText(clientX, clientY));
  }, textDetectTime);

  window.addEventListener("mousemove", async (e) => {
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

    triggerMouseoverTextWithDelay();
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

async function getMouseoverText(x, y) {
  //get range
  var textElement;
  var range =
    caretRangeFromPoint(x, y, _win.document) ||
    caretRangeFromPointOnPointedElement(x, y) ||
    caretRangeFromPointOnShadowDom(x, y);

  //get google doc select
  if (util.isGoogleDoc()) {
    var rect = getRect(x, y);
    var { textElement, range } = getCaretRange(rect, x, y);
  }
  //get text from range
  var mouseoverText = await getTextFromRange(range);
  textElement?.remove();

  return mouseoverText;
}
async function getTextFromRange(range) {
  var output = {};

  for (const detectType of ["word", "sentence", "container"]) {
    output[detectType] = "";
    if (!range) {
      continue;
    }
    try {
      var rangeClone = range.cloneRange();
      //expand range
      await expandRange(rangeClone, detectType);

      //check mouse xy overlap the range element
      if (checkXYInElement(rangeClone, clientX, clientY)) {
        output[detectType] = extractTextFromRange(rangeClone);
        output[detectType + "_range"] = rangeClone;
      }
    } catch (error) {
      console.log(error);
    }
  }

  return output;
}

function extractTextFromRange(range) {
  var rangeHtml = range.cloneContents();
  return util.extractTextFromHtml(rangeHtml);
}

async function expandRange(range, type) {
  try {
    if (type == "container" || !range.expand) {
      range.setStartBefore(range.startContainer);
      range.setEndAfter(range.startContainer);
      range.setStart(range.startContainer, 0);
    } else {
      range.expand(type); // "word" or "sentence"
      // await expandRangeWithSeg(range, type);
    }
  } catch (error) {
    // console.log(error);
  }
}

//browser range===================================================

export function caretRangeFromPoint(x, y, _document = document) {
  var range;
  if (!_document?.caretRangeFromPoint) {
    //firefox support
    var caretPos = _document.caretPositionFromPoint(x, y);
    range = document.createRange();
    range.setStart(caretPos.offsetNode, caretPos.offset);
    range.setEnd(caretPos.offsetNode, caretPos.offset);
  } else {
    range = _document?.caretRangeFromPoint(x, y);
  }

  //if no range or is not text, give null
  if (range?.startContainer.nodeType !== Node.TEXT_NODE) {
    return;
  }
  return range;
}

export function caretRangeFromPointOnDocument(x, y) {
  var textNodes = textNodesUnder(document.body);
  return getRangeFromTextNodes(x, y, textNodes);
}

export function caretRangeFromPointOnPointedElement(x, y) {
  var pointedElements = document.elementsFromPoint(x, y);

  pointedElements = pointedElements.filter(
    (ele) => ele.offsetHeight < 1000 && ele.offsetWidth < 1000
  );
  if (pointedElements.length == 0) {
    return;
  }
  var textNodes = textNodesUnder(pointedElements[pointedElements.length - 1]);

  return getRangeFromTextNodes(x, y, textNodes);
}

export function caretRangeFromPointOnShadowDom(x, y) {
  // get all text from shadows
  var shadows = util.getAllShadows();

  //filter shadow dom by parent position overlap
  //get all text node
  var textNodes = shadows
    .filter((shadow) => checkXYInElement(shadow?.host, x, y))
    .map((shadow) => Array.from(textNodesUnder(shadow)))
    .flat();

  return getRangeFromTextNodes(x, y, textNodes);
}

function getRangeFromTextNodes(x, y, textNodes) {
  //filter no text
  // filter no pos overlap
  // convert text node to char range
  var ranges = textNodes
    .filter((textNode) => textNode.data.trim())
    .filter((textNode) => checkXYInElement(getTextRange(textNode), x, y))
    .map((textNode) => Array.from(getCharRanges(textNode)))
    .flat();
  // get char range in x y
  var ranges = ranges.filter((range) => checkXYInElement(range, x, y));
  if (ranges.length) {
    return ranges[0];
  }
}

export function getAllTextNodes(el) {
  // https://stackoverflow.com/questions/10730309/find-all-text-nodes-in-html-page
  var n,
    a = [],
    walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null, false);
  while ((n = walk.nextNode())) a.push(n);
  return a;
}

function textNodesUnder(el) {
  return walkNodeTree(el, NodeFilter.SHOW_TEXT, {
    inspect: (textNode) =>
      !PARENT_TAGS_TO_EXCLUDE.includes(textNode?.parentElement?.nodeName),
  });
}

function walkNodeTree(
  root,
  whatToShow = NodeFilter.SHOW_ALL,
  { inspect, collect, callback } = {}
) {
  const walker = document.createTreeWalker(root, whatToShow, {
    acceptNode(node) {
      if (inspect && !inspect(node)) {
        return NodeFilter.FILTER_REJECT;
      }
      if (collect && !collect(node)) {
        return NodeFilter.FILTER_SKIP;
      }
      return NodeFilter.FILTER_ACCEPT;
    },
  });

  const nodes = [];
  let n;
  while ((n = walker.nextNode())) {
    callback?.(n);
    nodes.push(n);
  }

  return nodes;
}

export function getTextRange(textNode) {
  var range = document.createRange();
  range.setStart(textNode, 0);
  range.setEnd(textNode, textNode.length);
  return range;
}

export function getCharRanges(textNode) {
  var ranges = [];
  for (let i = 0; i < textNode.length - 1; i++) {
    var range = document.createRange();
    range.setStart(textNode, i);
    range.setEnd(textNode, i + 1);
    ranges.push(range);
  }
  return ranges;
}

export function checkXYInElement(ele, x, y) {
  try {
    var rect = ele.getBoundingClientRect(); //mouse in word rect
    if (rect.left > x || rect.right < x || rect.top > y || rect.bottom < y) {
      return false;
    }
    return true;
  } catch (error) {
    return false;
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

//firefox word break ====================================
async function expandRangeWithSeg(range, type = "word") {
  var { x, y } = getCenterXY(range); //mouse in word rect
  var rangeContainer = range.cloneRange();
  expandRange(rangeContainer, "container");
  let textNode =
    rangeContainer.commonAncestorContainer.parentElement.childNodes[0];

  var text = rangeContainer.toString();
  var lang = await util.detectLangBrowser(text);
  var segmenter = new Intl.Segmenter(lang, { granularity: type });
  var wordsMeta = [...segmenter.segment(text)];

  // var offset = 0;
  var wordRanges = wordsMeta
    .map((wordMeta) => {
      var wordRange = document.createRange();
      var word = wordMeta.segment;
      var selectedNode1 = selectNode(textNode, wordMeta.index);
      var selectedNode2 = selectNode(textNode, wordMeta.index + word.length);
      wordRange.setStart(selectedNode1.node, selectedNode1.index);
      wordRange.setEnd(selectedNode2.node, selectedNode2.index);
      return wordRange;
    })
    .filter((range) => checkXYInElement(range, x, y));

  var currentWordNode = wordRanges[0];
  if (currentWordNode) {
    range.setStart(currentWordNode.startContainer, currentWordNode.startOffset);
    range.setEnd(currentWordNode.endContainer, currentWordNode.endOffset);
  }
}
function selectNode(node, offset) {
  if (node.nodeType == Node.TEXT_NODE) {
    return { node, index: offset };
  }

  var prevLen = 0;
  for (const child of node.childNodes) {
    var len = getNodeLength(child);

    if (prevLen <= offset && offset <= prevLen + len) {
      return selectNode(child, offset - prevLen);
    }
    prevLen += len;
  }
  return { node, index: offset };
}
function getNodeLength(ele) {
  if (ele.nodeType == Node.TEXT_NODE) {
    return ele.length;
  }
  var len = 0;
  for (const child of ele.childNodes) {
    len += getNodeLength(child);
  }
  return len;
}

function getCenterXY(ele) {
  const { left, top, width, height } = ele.getBoundingClientRect();
  const centerX = left + width / 2;
  const centerY = top + height / 2;
  return { x: centerX, y: centerY };
}

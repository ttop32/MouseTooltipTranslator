/**
 * Selection related functions
 */
import $ from "jquery";
import { debounce } from "lodash";
import * as util from "/src/util";

var _win;
var prevNoneSelect = false;
export function enableSelectionEndEvent(
  _window = window,
  textDetectTime = 0.7
) {
  _win = _window;
  textDetectTime = Number(textDetectTime) * 1000;
  const triggerSelectionEndWithDelay = debounce(() => {
    triggerSelectionEnd(getSelectionText());
  }, textDetectTime);

  function isNoneSelectElement(element) {
    try {
      var styles = getComputedStyle(element);
      var selectStyle = styles.getPropertyValue("user-select");
      return selectStyle == "none";
    } catch (error) {
      return false;
    }
  }

  // Listen selection change every 700 ms. It covers keyboard selection and selection from menu (select all option)
  _win.document.addEventListener(
    "selectionchange",
    triggerSelectionEndWithDelay,
    false
  );

  // Trigger on mouse up immediately. Helps reduce 700 ms delay during mouse selection.
  _win.document.addEventListener(
    "mouseup",
    function (e) {
      var text =
        isNoneSelectElement(e.target) && prevNoneSelect
          ? ""
          : getSelectionText();

      triggerSelectionEnd(text);
    },
    false
  );
  _win.document.addEventListener(
    "mousedown",
    function (e) {
      prevNoneSelect = isNoneSelectElement(e.target);
    },
    false
  );
}

export const triggerSelectionEnd = (text) => {
  var evt = new CustomEvent("selectionEnd", {
    bubbles: true,
    cancelable: false,
  });
  evt.selectedText = text;
  document.dispatchEvent(evt);
};

export function getSelectionText() {
  if (util.isGoogleDoc()) {
    return getGoogleDocSelection();
  }
  return getWindowSelection();
}

export function getWindowSelection() {
  var html = getWindowSelectionHtml();
  var selectText = util.extractTextFromHtml(html);

  // if no html format text , get as string
  return selectText || _win.getSelection().toString();
}

function getWindowSelectionHtml() {
  var sel = _win.getSelection();
  var container = document.createElement("div");
  if (sel.rangeCount) {
    for (var i = 0, len = sel.rangeCount; i < len; ++i) {
      container.appendChild(sel.getRangeAt(i).cloneContents());
    }
  }
  return container;
}

//google doc select ==========================
// https://github.com/Amaimersion/google-docs-utils/issues/10

function getGoogleDocSelection() {
  //get google doc text event iframe
  var iframe = $(".docs-texteventtarget-iframe").contents();
  var textBox = iframe.find("[contenteditable=true]");

  //request copy for hijack copy text element as select text from iframe
  var el = textBox.get(0);
  var evt = new CustomEvent("copy");
  el?.dispatchEvent(evt);

  //get select text
  var text = "";
  iframe.find("span").each(function () {
    text += $(this).text() + " ";
  });
  text = text.trim();
  return text;
}

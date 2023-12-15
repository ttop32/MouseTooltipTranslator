/**
 * Selection related functions
 */
import $ from "jquery";
import { debounce } from "throttle-debounce";

var _win;
var prevNoneSelect = false;
var _isGoogleDoc = false;
export function enableSelectionEndEvent(_window = window, isGoogleDoc = false) {
  _win = _window;
  _isGoogleDoc = isGoogleDoc;

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

function isNoneSelectElement(element) {
  try {
    var styles = getComputedStyle(element);
    var selectStyle = styles.getPropertyValue("user-select");
    return selectStyle == "none";
  } catch (error) {
    return false;
  }
}

export function getSelectionText() {
  if (!_isGoogleDoc) {
    return getWindowSelection();
  } else {
    return getGoogleDocSelection();
  }
}

function getWindowSelection() {
  let text = "";
  if (_win.getSelection) {
    text = _win.getSelection().toString();
  } else if (
    _win.document.selection &&
    _win.document.selection.type !== "Control"
  ) {
    text = _win.document.selection.createRange().text;
  }
  return text;
}

const triggerSelectionEndWithDelay = debounce(700, () => {
  triggerSelectionEnd(getSelectionText());
});

export const triggerSelectionEnd = (text) => {
  var evt = new CustomEvent("selectionEnd", {
    bubbles: true,
    cancelable: false,
  });
  evt.selectedText = text;
  document.dispatchEvent(evt);
};

//google doc ==========================
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

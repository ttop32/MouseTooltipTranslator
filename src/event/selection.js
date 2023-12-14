/**
 * Selection related functions
 */

import { debounce } from "throttle-debounce";

var _win;
var prevNoneSelect = false;
export function enableSelectionEndEvent(_window = window) {
  _win = _window;

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

/**
 * Selection related functions
 */

let lastSelectedText = "";

export function enableSelectionEndEvent() {
  // Listen selection change every 700 ms. It covers keyboard selection and selection from menu (select all option)
  document.addEventListener(
    "selectionchange",
    debounce((event) => {
      triggerSelectionEnd(getSelectionText());
    }, 700),
    false
  );

  // Trigger on mouse up immediately. Helps reduce 700 ms delay during mouse selection.
  document.addEventListener(
    "mouseup",
    function(e) {
      var text = !isNoneSelectElement(e.target) ? getSelectionText() : "";
      triggerSelectionEnd(text);
    },
    false
  );
}

function isNoneSelectElement(element) {
  var styles = getComputedStyle(element);
  var selectStyle = styles.getPropertyValue("user-select");
  return selectStyle == "none";
}

export function getSelectionText() {
  let text = "";
  if (window.getSelection) {
    text = window.getSelection().toString();
  } else if (document.selection && document.selection.type !== "Control") {
    text = document.selection.createRange().text;
  }
  return text;
}

function triggerSelectionEnd(text) {
  let event = document.createEvent("HTMLEvents");
  event.initEvent("selectionEnd", true, true);
  event.eventName = "selectionEnd";
  event.selectedText = text;
  // don't fire event twice
  if (event.selectedText === lastSelectedText) {
    return;
  }
  lastSelectedText = event.selectedText;
  document.dispatchEvent(event);
}

// Returns a function, that, as long as it continues to be invoked, will not be triggered.
// The function will be called after it stops being called for N milliseconds.
function debounce(callback, interval = 300) {
  let debounceTimeoutId;

  return function(...args) {
    clearTimeout(debounceTimeoutId);
    debounceTimeoutId = setTimeout(() => callback.apply(this, args), interval);
  };
}

import * as util from "/src/util/index.js";
import { enableSelectionEndEvent } from "/src/event/selection";
import { enableMouseoverTextEvent } from "/src/event/mouseover";
import { waitUntil, WAIT_FOREVER } from "async-wait-until";

var iframeSrc = "";

setInterval(function () {
  var iframe = getIframe();
  if (iframe && iframeSrc != iframe.src) {
    iframeSrc = iframe.src;
    bindIFrameEvent(iframe);
    iframe.contentWindow.focus(); //make focus to get event from iframe
  }
}, 1000);

function getIframe() {
  var shadows = util.getAllShadows();
  var iframe = shadows?.[1]?.querySelectorAll("iframe")[0];
  return iframe;
}

function bindIFrameEvent(iframe) {
  enableSelectionEndEvent(iframe.contentWindow);
  enableMouseoverTextEvent(iframe.contentWindow, true);

  // bind mouse event
  ["mousemove", "keydown", "keyup", "mouseup"].forEach((eventName) => {
    iframe.contentWindow.addEventListener(eventName, (e) => {
      var evt = new CustomEvent(eventName, {
        bubbles: true,
        cancelable: false,
      });
      var clRect = iframe.getBoundingClientRect();

      evt.key = e?.key;
      evt.code = e?.code;
      evt.ctrlKey = e?.ctrlKey;
      evt.clientX = e?.clientX ? e.clientX + clRect.left : "";
      evt.clientY = e?.clientY ? e.clientY + clRect.top : "";

      window.dispatchEvent(evt);
    });
  });
}

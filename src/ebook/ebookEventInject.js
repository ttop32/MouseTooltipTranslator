import * as util from "/src/util/index.js";
import { enableSelectionEndEvent } from "/src/event/selection";
import { enableMouseoverTextEvent } from "/src/event/mouseover";
import { waitUntil, WAIT_FOREVER } from "async-wait-until";

var iframeSrc = "";

setInterval(function () {
  var iframe = getIframe();
  if (iframe && iframeSrc != iframe.src) {
    iframeSrc = iframe.src;
    console.log(iframeSrc);
    bindIFrameEvent(iframe);
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

  iframe.contentWindow.addEventListener("mousemove", function (event) {
    var clRect = iframe.getBoundingClientRect();
    var evt = new CustomEvent("mousemove", {
      bubbles: true,
      cancelable: false,
    });

    evt.clientX = event.clientX + clRect.left;
    evt.clientY = event.clientY + clRect.top;

    window.dispatchEvent(evt);
  });

  iframe.contentWindow.addEventListener("keydown", (e) => {
    var evt = new CustomEvent("keydown", {
      bubbles: true,
      cancelable: false,
      key: e.key,
      code: e.code,
      ctrlKey: e.ctrlKey,
    });
    window.dispatchEvent(evt);
  });
  iframe.contentWindow.addEventListener("keyup", (e) => {
    var evt = new CustomEvent("keyup", {
      bubbles: true,
      cancelable: false,
      key: e.key,
      code: e.code,
      ctrlKey: e.ctrlKey,
    });
    window.dispatchEvent(evt);
  });
  iframe.contentWindow.addEventListener("mouseup", (e) => {
    var evt = new CustomEvent("mouseup", {
      bubbles: true,
      cancelable: false,
      target: e.target,
    });
    window.dispatchEvent(evt);
  });
}

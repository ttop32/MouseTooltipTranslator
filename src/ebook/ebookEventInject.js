import * as util from "/src/util/index.js";
import { enableSelectionEndEvent } from "/src/event/selection";

var iframeSrc = "";

setInterval(function () {
  var iframe = util.getEbookIframe();
  if (iframe && iframeSrc != iframe.src) {
    iframeSrc = iframe.src;
    bindIFrameEvent(iframe);
    iframe.contentWindow.focus(); //make focus to get event from iframe
  }
}, 1000);

function bindIFrameEvent(iframe) {
  //bind text selection
  enableSelectionEndEvent(iframe.contentWindow);

  // bind mouse for mouse over event
  ["mousemove", "keydown", "keyup"].forEach((eventName) => {
    iframe.contentWindow.addEventListener(eventName, (e) => {
      var evt = new CustomEvent(eventName, {
        bubbles: true,
        cancelable: false,
      });
      var clRect = iframe.getBoundingClientRect();
      evt.ebookWindow = iframe.contentWindow;
      evt.key = e?.key;
      evt.code = e?.code;
      evt.ctrlKey = e?.ctrlKey;
      evt.clientX = e?.clientX ? e.clientX + clRect.left : "";
      evt.clientY = e?.clientY ? e.clientY + clRect.top : "";

      evt.iframeX = e?.clientX;
      evt.iframeY = e?.clientY;

      window.dispatchEvent(evt);
      document.dispatchEvent(evt);
    });
  });
}
